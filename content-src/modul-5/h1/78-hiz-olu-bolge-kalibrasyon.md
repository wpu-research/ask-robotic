# Hız, ölü bölge ve kalibrasyon
süre: 30

## Merak
Robota `analogWrite(EN, 40)` yazdın. Motor hafifçe vızıldıyor ama tekerlek kıpırdamıyor. 60 yazınca tekerlek yavaşça dönmeye başlıyor. "Yarım hız" istediğin için 128 yazdın ama robot yarım hızda gitmiyor, ondan çok daha yavaş. PWM ile hız neden orantılı değil? Ve robota "20 cm/s git" demek için hangi sayıyı yazmalısın?

## Etkinlik
### Ölü bölge
Motorun dönmeye başlaması için, sürtünmeyi ve dişlilerin direncini yenecek kadar güç gerekir. Düşük PWM'de motor akımı bu direnci yenemez; tekerlek durur. Bu aralığa **ölü bölge** denir. Gerçek motorlarda da görülür ve motora, dişliye, pile göre değişir.

Benzetimdeki robotun ölü bölgesi PWM'in ilk %20'sidir: `analogWrite` değeri yaklaşık 51 (0,20 · 255) altındayken tekerlek dönmez. Ölü bölgenin üstünde hız yaklaşık doğrusal artar ve PWM 255'te en yüksek değerine (azami hız) ulaşır.

### Ölü bölgeyi ölçmek
Robotun hızını ölçen bir sensörümüz yok (enkoder ileriki haftalarda gelecek). Ölçümü göz ve buton yapar: sketch PWM'i her 250 ms'de bir artırır, sen tekerleğin dönmeye başladığını görünce butona (D2) basarsın. Sketch o andaki PWM'i yazar.

| Parça | Bağlantı |
|---|---|
| Sol ve sağ motor | Standart bağlantı: EN D5/D6, IN1 D7, IN2 D8, IN3 D9, IN4 D10 |
| Buton | **D2** ile GND arası (`INPUT_PULLUP`) |

**Güvenlik:** Bu deneyde robotun tekerleklerini havada tut. Motor gücü ayrı pilden gelir; GND'ler ortak olmalıdır.

```cpp
// sketch: olu_bolge_tarama
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;
const int DUGME = 2;                    // INPUT_PULLUP: tekerlek dönmeye başlayınca bas

const unsigned long ADIM_ARALIGI = 250;  // ms
int pwm = 30;
bool bitti = false;
unsigned long sonAdim = 0;

void ileri(int deger) {
  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);
  analogWrite(SOL_EN, deger);
  analogWrite(SAG_EN, deger);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(DUGME, INPUT_PULLUP);
  Serial.begin(9600);
  Serial.println("Tarama basladi");
  ileri(pwm);
}

void loop() {
  if (bitti) return;

  if (digitalRead(DUGME) == LOW) {       // tekerlek döndü, taramayı bitir
    ileri(0);
    bitti = true;
    Serial.print("Hareket basladi: PWM=");
    Serial.println(pwm);
    return;
  }

  if (millis() - sonAdim >= ADIM_ARALIGI) {
    sonAdim = millis();
    pwm++;
    if (pwm > 255) {                     // hiç dönmediyse güvenli bitir
      ileri(0);
      bitti = true;
      Serial.println("Tarama bitti: hareket yok");
      return;
    }
    ileri(pwm);
    Serial.print("PWM=");
    Serial.println(pwm);
  }
}
```

Benzetimde robotun hızı 1 cm/s'yi geçtiği anda butona bastık ve sketch **PWM = 57** yazdı. Bu sayı "tekerleğin gözle fark edilir şekilde döndüğü" değerdir; ölü bölgenin gerçek sonu biraz daha aşağıda, yaklaşık 51'dedir. Çünkü ölü bölgeden çıkınca hız sıfırdan başlayıp yavaş yavaş artar:

| PWM | 50 | 52 | 55 | 57 | 60 | 70 | 100 | 150 | 200 | 255 |
|---|---|---|---|---|---|---|---|---|---|---|
| Ölçülen hız (cm/s) | 0,1 | 0,2 | 0,7 | 1,1 | 1,7 | 3,6 | 9,4 | 19,1 | 28,8 | 39,6 |

PWM 35-48 arasında hız 0,2 cm/s'nin altında kaldı, yani tekerlek dönmedi. PWM 52'den sonra hız doğrusal artıyor: her PWM birimi yaklaşık 0,19 cm/s ekliyor.

### İki noktayla doğru bulmak
Ölü bölgenin sonunu ve azami hızı daha güvenilir bulmanın yolu, iyi ölçülebilen iki hızdan doğru geçirmektir. Gerçek robotta hızı, 1 metrelik bir yolu kronometreyle ölçerek bulursun.

PWM 100'de 9,4 cm/s, PWM 200'de 28,8 cm/s ölçtük.

- Eğim = (28,8 − 9,4) / (200 − 100) = 0,194 cm/s her PWM birimi için.
- Hızın sıfır olduğu PWM = 100 − 9,4 / 0,194 ≈ **51**.
- Azami hız (PWM 255) = 0,194 · (255 − 51) ≈ 39,6 cm/s = **0,396 m/s**.

İki yoldan çıkan sayılar uyumlu: ölü bölge sonu 51, azami hız 0,396 m/s (76. derste tekerlek yarıçapından 12 rad/s · 0,033 m olarak da bulmuştuk).

### Kalibrasyon fonksiyonu: hizdanPwm
Amacımız: "şu kadar m/s" deyince doğru PWM'i bulmak. Eşleme ölü bölgeyi atlar:

```
PWM = OLU_PWM + (255 − OLU_PWM) · v / V_MAX
```

Bunu iki çizgi arasındaki fark olarak düşün: v = 0'da PWM 51'den başlar (ölü bölgenin hemen sonu), v = V_MAX'ta 255 olur. Karşılaştırmak için "naif" eşlemeyi de ekledik: PWM = 255 · v / V_MAX, yani 0'dan başlayan doğru.

Sketch seri porttan `K 20` (kalibre, 20 cm/s) ya da `N 20` (naif, 20 cm/s) komutunu alır ve iki tekerleği o PWM'e ayarlar.

```cpp
// sketch: kalibre_hiz
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

const float V_MAX = 0.396;   // PWM 255'te ölçülen hız (m/s)
const int OLU_PWM = 51;      // ölçülen ölü bölge sonu

// Naif eşleme: 0 ile 255 arasında doğrusal (ölü bölgeyi unutur)
int naifPwm(float v) {
  return constrain((int)(255.0 * v / V_MAX), 0, 255);
}

// Kalibre eşleme: ölü bölgeyi atlar, V_MAX'ta 255'e varır
int hizdanPwm(float v) {
  if (v < 0.005) return 0;               // neredeyse durma isteği
  if (v > V_MAX) v = V_MAX;
  return OLU_PWM + (int)((255 - OLU_PWM) * v / V_MAX + 0.5);
}

void ileri(int deger) {
  digitalWrite(SOL_IN1, HIGH); digitalWrite(SOL_IN2, LOW);
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);
  analogWrite(SOL_EN, deger);
  analogWrite(SAG_EN, deger);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
  Serial.setTimeout(100);
  Serial.println("Komut: K 20 (kalibre) veya N 20 (naif), hiz cm/s");
}

void loop() {
  if (Serial.available() == 0) return;
  String satir = Serial.readStringUntil('\n');
  satir.trim();
  if (satir.length() < 3) return;
  char mod = satir.charAt(0);
  float v = satir.substring(2).toInt() / 100.0;     // cm/s -> m/s
  int pwm = (mod == 'N') ? naifPwm(v) : hizdanPwm(v);
  ileri(pwm);
  Serial.print("mod="); Serial.print(mod);
  Serial.print(" istenen="); Serial.print(v, 3);
  Serial.print(" pwm="); Serial.println(pwm);
}
```

### Nasıl çalışıyor?
1. `hizdanPwm()` önce çok küçük istekleri (5 mm/s altı) 0'a çevirir; aksi halde robot ölü bölgenin hemen üstünde, ölçülemeyecek kadar yavaş bir hızda dolaşır.
2. İsteği azami hızla sınırlar (`v > V_MAX`). Sonra `OLU_PWM`'den başlayan doğrusal eşlemeyi uygular. `+ 0.5` yuvarlama içindir.
3. `naifPwm()` ölü bölgeyi hiç bilmez. 5 cm/s isteyince PWM 32 çıkar, bu ölü bölgenin içinde: robot dönmez.
4. `N` ve `K` modları yan yana çalışır; böylece aynı hız isteğini iki yöntemle deneyip robotun gerçek hızını karşılaştırırsın.

### Ölçüm: istenen ve gerçek hız
Her komuttan sonra robotun hareketi oturmasını bekleyip 1 saniyelik yolunu ölçtük:

| İstenen (cm/s) | Naif PWM | Naif gerçek hız (cm/s) | Kalibre PWM | Kalibre gerçek hız (cm/s) |
|---|---|---|---|---|
| 5 | 32 | 0 (dönmedi) | 77 | 5,0 |
| 10 | 64 | 2,5 | 103 | 10,0 |
| 20 | 128 | 14,9 | 154 | 19,9 |
| 39 | 251 | 38,6 | 252 | 38,8 |

Naif eşleme yalnızca tam hıza yakın isteklerde işe yarıyor; yavaş hızlarda hata çok büyük (10 cm/s isteyince 2,5 cm/s). Kalibre eşlemede hata hiçbir satırda 0,2 cm/s'yi geçmedi. Bu başarı, ölü bölgenin ve azami hızın ölçüldüğü robot için geçerlidir; başka bir robot için sayıları yeniden ölçmelisin.

Gerçek robotta farklı olabilecekler: pil boşaldıkça azami hız düşer, bu yüzden kalibrasyon pil doluyken yapılır ve zamanla yenilenir. Yerdeki sürtünme (halı, parke) ölü bölgeyi değiştirir. Hız PWM'e tam doğrusal bağlı olmayabilir; o zaman iki nokta yerine daha çok nokta ölçüp aralara doğru çizersin.

### Dene
- Tarama sketch'inde `ADIM_ARALIGI`'nı 100 ms yap. Bulduğun PWM değişiyor mu? Neden?
- `kalibre_hiz` içinde `OLU_PWM`'i 70 yap ve `K 10` dene. Ne olur? Bu hata gerçek robotta nasıl ortaya çıkar?
- Kendi robotunda ölü bölgeyi sol ve sağ motor için ayrı ayrı bul. Fark çıkarsa ne yapman gerekir? (Düz gitme konusu H4'te işlenecek.)

### Sık yapılan hatalar
- PWM'i doğrudan hız sanmak: "128 yarım hızdır" doğru değildir.
- Kalibrasyonu boş pille yapmak.
- Ölü bölge sonunu butona bastığın değer sanmak: o, gözle fark ettiğin eşiktir. Ölü bölgenin sonu, hız doğrusunun sıfırı kestiği PWM'dir (burada 51).
- `OLU_PWM` ve `V_MAX` sayılarını başka robota kopyalamak.

## Konuşalım
Neden kalibrasyon sayıları (`OLU_PWM`, `V_MAX`) kodun başında `const` olarak durmalı? Robotun pilini ya da tekerleğini değiştirdiğinde kodun hangi satırlarına dokunmak gerekir?
