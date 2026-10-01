# Proje: Komutlu araba
süre: 35

## Merak
Uzaktan kumandalı bir arabayı sürerken kumandanın pili biter, ya da bağlantı kopar. Araba son komutla gitmeye devam ederse masadan düşer ya da bir şeye çarpar. Güvenli bir robot, "komutlar kesildi" durumunu fark etmeli ve kendiliğinden durmalı. Bu projede kendi komutlu arabanı yapıp bu güvenlik önlemini ekleyeceksin ve ölçeceksin: komut kesildikten sonra robot ne kadar yol alıyor?

## Etkinlik
### Ne yapacağız?
Bu proje bu haftaki dersleri birleştirir:
- **Ders 76:** v ve ω formülleri. Yerinde dönüş hızı ω = 2·v / L ile hesaplanır.
- **Ders 77:** Motor sürücüsü: yön pinleri ve PWM.
- **Ders 78:** `hizdanPwm()` ile istenen cm/s hızı PWM'e çevirme (ölü bölgeyi atlar).
- **Ders 79:** Seri komut ayrıştırıcı (W, S, A, D, X).
- **Modül 3:** `millis()` ile bloklamayan zamanlama (27. ders) ve `enum` ile durum makinesi (28. ders).

Yeni olan: **komut watchdog'u** ("bekçi köpeği"). Son geçerli komuttan beri `CMD_TIMEOUT = 700 ms` geçerse robot kendiliğinden durur. Bu yüzden komutu gönderen taraf, robot gitmeye devam etsin diye komutu her 200 ms gibi sık aralıklarla **tekrar etmelidir** (tuşa basılı tutmak gibi).

### Hyvex vakası: kontrol kopunca ne olur?
Hyvex staj programının 9. günü fail-safe ve güvenlik mühendisliğine ayrılmıştır. O günün vakası bir **komut watchdog'udur**: `CMD_TIMEOUT = 0.7 s`. Günün düşüncesi şu soruya dayanır: "Kontrol kopunca ne olur?" Programdaki ders sorusu da şudur: operatörün tarayıcısı çökerse gimbal ne yapmalı? Biz aynı soruyu kendi robotumuz için soruyoruz: sürücüden gelen komutlar kesilirse robot ne yapmalı? Projede aynı süreyi kullanıyoruz: `CMD_TIMEOUT = 700 ms`. Bu sürenin neden iyi ya da kötü bir seçim olduğunu aşağıda ölçeceğiz.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Durum LED'i + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |
| Motor gücü | Ayrı pil kutusu; sürücü GND'si Arduino GND'siyle ortak |

LED yanıyorsa robot "sürülüyor" durumundadır; söndüyse duruyor. Motor sürücüsü L298N ya da TB6612 olabilir (77. ders).

**Güvenlik:** Motorlar için ayrı pil kullan ve GND'leri birleştir. Pil kutusunu ters bağlama, kısa devre etme. Robotu ilk kez çalıştırırken tekerlekler havada olsun. Robotu masanın kenarında kontrolsüz bırakma: watchdog güvenlik katmanlarından biridir, tek önlem değildir.

### Komut dili
Ders 79'dan farklar: hız artık **cm/s** olarak yazılır (`hizdanPwm` PWM'e çevirir), hız üst sınırı 39 cm/s'dir.

| Komut | Anlamı |
|---|---|
| `W20` | 20 cm/s ileri |
| `S20` | 20 cm/s geri |
| `A12` | yerinde sola dön; her tekerlek 12 cm/s |
| `D12` | yerinde sağa dön; her tekerlek 12 cm/s |
| `X` | dur |

Sayı yazılmazsa 20 cm/s kullanılır. Yerinde dönüşte ω = 2·v / L olur (76. ders). 12 cm/s için ω = 2·0,12 / 0,12 = 2 rad/s ≈ 115°/s. 90° dönmek için süre = (π/2) / 2 ≈ 0,8 sn.

### Durum makinesi
| Durum | Motorlar | LED | Bu durumdan çıkış |
|---|---|---|---|
| DURUYOR | durur | söner | W, S, A, D (hız > 0) gelirse SURUYOR |
| SURUYOR | son komuta göre | yanar | `X` gelirse ya da 700 ms komut gelmezse DURUYOR |

Her **geçerli** komut zamanı sıfırlar (`sonKomut = millis()`). Geçersiz komut (`Q` gibi) zamanı sıfırlamaz: aksi halde rastgele gürültü robotu sonsuza kadar sürdürebilirdi.

### Program
```cpp
// sketch: komutlu_araba
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;
const int DURUM_LED = 13;               // yanık = robot sürülüyor

const unsigned long CMD_TIMEOUT = 700;  // ms: bu süre komut gelmezse dur
const float L = 0.12;                   // aks aralığı (m)
const float V_MAX = 0.396;              // PWM 255'te hız (m/s)
const int OLU_PWM = 51;                 // ölü bölge sonu
const int VARSAYILAN_CM = 20;           // hız yazılmazsa (cm/s)
const int MAKS_CM = 39;                 // V_MAX'ın altında

enum Durum { DURUYOR, SURUYOR };
Durum durum = DURUYOR;
unsigned long sonKomut = 0;
char tampon[12];
int uzunluk = 0;

int hizdanPwm(float v) {
  if (v < 0.005) return 0;
  if (v > V_MAX) v = V_MAX;
  return OLU_PWM + (int)((255 - OLU_PWM) * v / V_MAX + 0.5);
}

int isaretliPwm(float v) {
  return v >= 0 ? hizdanPwm(v) : -hizdanPwm(-v);
}

void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}

void tekerlekler(float vSol, float vSag) {   // m/s, eksi = geri
  motor(SOL_EN, SOL_IN1, SOL_IN2, isaretliPwm(vSol));
  motor(SAG_EN, SAG_IN1, SAG_IN2, isaretliPwm(vSag));
}

void dur() {
  tekerlekler(0, 0);
  durum = DURUYOR;
  digitalWrite(DURUM_LED, LOW);
}

void komutIsle(char komut, int cm) {
  float v = cm / 100.0;
  switch (komut) {
    case 'W': tekerlekler(v, v); break;
    case 'S': tekerlekler(-v, -v); break;
    case 'A': tekerlekler(-v, v); break;    // yerinde sola: w = 2v / L
    case 'D': tekerlekler(v, -v); break;    // yerinde sağa
    case 'X': dur(); break;
    default:
      Serial.println("?");
      return;                               // geçersiz komut watchdog'u yenilemez
  }
  sonKomut = millis();                      // geçerli komut: watchdog sıfırlanır
  if (komut != 'X' && cm > 0) {
    durum = SURUYOR;
    digitalWrite(DURUM_LED, HIGH);
  } else {
    dur();
  }
}

void satirIsle() {
  tampon[uzunluk] = '\0';
  char komut = toupper(tampon[0]);
  int cm = VARSAYILAN_CM;
  if (uzunluk > 1) cm = constrain(atoi(tampon + 1), 0, MAKS_CM);
  komutIsle(komut, cm);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(DURUM_LED, OUTPUT);
  Serial.begin(9600);
  dur();                                    // açılışta güvenli durum
  Serial.println("Hazir: W S A D X + hiz (cm/s)");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (uzunluk > 0) satirIsle();
      uzunluk = 0;
    } else if (uzunluk < (int)sizeof(tampon) - 1) {
      tampon[uzunluk++] = c;
    }
  }

  if (durum == SURUYOR && millis() - sonKomut >= CMD_TIMEOUT) {
    dur();
    Serial.println("Komut yok: dur");
  }
}
```

### Nasıl çalışıyor?
1. `setup()` içinde `dur()` çağrılır: robot açılışta hiçbir zaman hareket etmez. Güvenli durum **varsayılandır**, hareket ise komutla istenir.
2. Komut ayrıştırma 79. dersteki gibidir. Fark: `hizdanPwm()` cm/s'yi PWM'e çevirir; böylece `W20` her zaman yaklaşık 20 cm/s demektir.
3. Her geçerli komut `sonKomut`'u günceller. `loop()` içinde `millis() - sonKomut >= CMD_TIMEOUT` kontrolü, çıkarma yöntemiyle yapıldığı için `millis()` taşsa bile doğrudur (27. ders).
4. Watchdog yalnızca SURUYOR durumunda çalışır. Zaten duruyorsa her 700 ms'de bir "Komut yok" yazmaz; mesaj durma anında **bir kez** yazılır.
5. `loop()` hiç `delay` kullanmaz; komutlar ve watchdog aynı anda işler.

### Ölçüm
Benzetimde robotu (0,5 m; 2,0 m) noktasında +x yönüne bakarken bırakıp komutları 200 ms aralıkla tekrarladık.

**Komut dizisi**, her adımın sonunda `X` gönderildi:

| Adım | Komut | Sonuç |
|---|---|---|
| İleri 1 sn | `W20` | Robot 19,7 cm ilerledi, yanal sapma yok |
| Sağa dön | `D12`, 0,8 sn | Yön −90,2° (tam sağ), konum kaymadı |
| Geri 1 sn | `S20` | Robot bu kez −y'ye baktığı için +y yönünde 19,7 cm geri gitti |
| Son durum | | Robot (0,70; 2,20) m noktasında, toplam yol 0,39 m |

Komutlar sürerken LED yandı, `X`'ten sonra söndü. Yollar hesapla (0,20 m/s · 1 sn = 0,20 m) ve dönüş açısı hesapla (2 rad/s · 0,8 sn ≈ 92°) uyuştu.

**Watchdog ölçümü:** tek bir `W20` gönderilip sessiz kalındı.
- Sol EN pini `W20` satırının bitişinden yaklaşık 700 ms sonra (ölçülen: 698 ms) LOW'a düştü; LED aynı anda söndü.
- Seriye `Komut yok: dur` tam bir kez yazıldı.
- Robot bu sürede yaklaşık 14 cm yol aldı (0,2 m/s · 0,7 sn ≈ 0,14 m). Durduktan sonra hareket etmedi.

Yani watchdog'un bedeli: komut kesildikten sonra robot **hız · CMD_TIMEOUT** kadar yol alır. 20 cm/s ve 0,7 sn için 14 cm; 39 cm/s'de 27 cm olurdu. Daha kısa süre daha güvenli, ama ağ ya da bağlantı gecikmesi dalgalanıyorsa robot gereksiz yere durur.

Ek ölçümler:
- Komutlar 200 ms aralıkla sürdürüldüğünde 2 saniye boyunca robot gitmeye devam etti ve watchdog devreye girmedi.
- 2 saniye boyunca yalnızca geçersiz `Q` gönderildiğinde robot ilk `W20`'nin 700 ms'i dolunca durdu: geçersiz komut zamanı yenilemedi.
- `W999` 39 cm/s'ye sınırlandı.

Gerçek robotta farklı olabilecekler: benzetimde seri hat gecikmesizdir. Kablosuz bağlantıda komutlar geç gelebilir, `CMD_TIMEOUT`'u bu gecikmeden büyük, ama durma mesafesinin makul kalacağı kadar küçük seçmelisin. Robotun gerçek durma mesafesi yüzeye ve yüke göre değişir; ölçmeden güvenli saymamalısın.

### Dene
- `CMD_TIMEOUT`'u 300 ms yap ve komutu 400 ms aralıkla tekrarla. Robot ne yapıyor? Neden?
- 39 cm/s ile ileri gönderip sessiz kal. Durma mesafesini ölç ve formülle karşılaştır.
- Yeni bir komut ekle: `B` komutu "yavaş kavis": sol 8 cm/s, sağ 16 cm/s. Hesapla: v, ω ve dönme yarıçapı kaç olur? (76. dersteki formüller.)
- Watchdog durdurduktan sonra robotun yeniden hareket edebilmesi için ne gerekir? Şu an yeni bir W komutu yeter. Daha güvenli bir tasarım (örneğin önce `X` istemek) olur mu?

### Sık yapılan hatalar
- Kumandanın komutu tekrar etmediğini unutmak: tek `W` gönderip robotun neden 0,7 sn sonra durduğunu merak etmek.
- Watchdog süresini komut tekrar aralığından kısa seçmek: robot sürekli durup kalkar.
- Geçersiz komutun da watchdog süresini yenilemesine izin vermek.
- `CMD_TIMEOUT` kontrolünü `delay` ile yapmak: bu, komutları okumayı engeller.
- Motorları durdururken yalnızca `EN`'i sıfırlamak ama LED ve durum bilgisini güncellememek. `dur()` bütün bunları tek yerden yapar.
- Güvenli durumu açılışta unutmak: robot açılır açılmaz kontrolsüz döner.

## Konuşalım
`CMD_TIMEOUT` 0,7 sn yerine 5 sn olsaydı ne olurdu? 0,05 sn olsaydı? Hyvex'teki gibi kontrol kopunca durmak her sistem için doğru mudur, yoksa "olduğu yerde kalmak" daha tehlikeli olabilecek bir sistem düşünebilir misin?
