# P: orantılı kontrol
süre: 30

## Merak
Bisikletle yolun kenarına yaklaşırken direksiyonu ne kadar çevirirsin? Biraz yaklaştıysan azıcık, çok yaklaştıysan fazla. Kimse "kenara 3 cm kaldı, tam 7 derece çevir" diye hesap yapmaz; çevirme miktarı hatayla birlikte büyür. 88. dersteki bang-bang çizgi izleyici ise yalnızca "sağ", "sol" ya da "düz" bilir. Bu derste robota hata ne kadarsa o kadar direksiyon vermeyi öğreteceksin. Bunun adı **P (orantılı) kontrol**.

## Etkinlik
### Kavramlar
- **Ayar noktası:** robotun olmak istediği yer. Burada: çizgi dizinin tam ortasında.
- **Hata (e):** ayar noktası ile ölçüm arasındaki fark. Hata 0 ise robot istediği yerdedir.
- **Kontrol çıkışı (u):** robotun direksiyonu. P kontrolde `u = Kp x e`.
- **Kp:** hatayı direksiyona çeviren sayı. Büyüdükçe robot aynı hataya daha sert tepki verir.

### Devre
| Parça | Bağlantı |
|---|---|
| Sol motor (L298N / TB6612) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| 5 sensörlü çizgi dizisi | **A0 ... A4** (A0 en sol, A4 en sağ); sensörler 2,4 cm arayla, tekerlek aksının 7 cm önünde |

Motorları Arduino'nun 5 V pininden besleme; harici bir pil kullan ve pilin eksi ucunu Arduino GND'sine bağla (ortak GND). Pili kısa devre yapma, ters bağlama.

### Program
Önce dizinin ham verisini çizginin **konumuna** çeviren küçük bir sketch. Her sensöre bir ağırlık veriyoruz: A0 için +2, A1 için +1, A2 için 0, A3 için -1, A4 için -2. Çizgiyi gören sensörlerin ağırlıklarının ortalaması çizginin konumudur. Pozitif konum: çizgi robotun solunda.

```cpp
// sketch: konum_oku
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;                          // bunun üstü = çizgi

void setup() {
  Serial.begin(9600);
}

void loop() {
  int sayi = 0;       // çizgiyi gören sensör sayısı
  int toplam = 0;     // görenlerin ağırlıklarının toplamı
  for (int i = 0; i < 5; i++) {
    if (analogRead(SENSOR[i]) > ESIK) {
      sayi++;
      toplam += 2 - i;    // ağırlıklar: +2, +1, 0, -1, -2
    }
  }
  if (sayi == 0) {
    Serial.println("kayip");
  } else {
    Serial.println((float)toplam / sayi, 1);
  }
  delay(200);
}
```

Çizgi yalnız A1'de görünürse `1.0`, A0 ve A1 birlikte görürse `1.5`, hiçbir sensör görmezse `kayip` yazılır. Dizinin 5 sensörü çizgiyi 0,5'lik adımlarla (-2 ... +2) ölçmemizi sağlar.

Şimdi bu konumu hata olarak kullanan P kontrollü çizgi izleyici:

```cpp
// sketch: p_cizgi
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int SENSOR[5] = {A0, A1, A2, A3, A4};   // A0 en sol ... A4 en sağ
const int ESIK = 500;

const float KP = 170.0;            // hata 1 birim olunca direksiyon: 170 PWM
const int TABAN = 200;             // düz giderken her tekerleğin PWM'i
const unsigned long DT = 10;       // kontrol periyodu (ms)

unsigned long son = 0;
float sonYon = 1;                  // çizgi en son hangi taraftaydı

// v: -255...255. Ölü bölgeyi atlar (78. ders): 1 -> %20 PWM, 255 -> %100.
void surucu(int en, int in1, int in2, int v) {
  v = constrain(v, -255, 255);
  int pwm = abs(v);
  if (pwm > 0) pwm = map(pwm, 1, 255, 51, 255);
  digitalWrite(in1, v > 0);
  digitalWrite(in2, v < 0);
  analogWrite(en, pwm);
}

// Hata: çizginin konumu, -2...+2. Pozitif = çizgi solda.
float hataOku() {
  int sayi = 0;
  float toplam = 0;
  for (int i = 0; i < 5; i++) {
    if (analogRead(SENSOR[i]) > ESIK) {
      sayi++;
      toplam += 2 - i;
    }
  }
  if (sayi == 0) return sonYon * 2.0;     // çizgi kayıp (sensörler arası boşluk da olabilir): son görülen yöne "uzakta" de
  float e = toplam / sayi;
  if (e != 0) sonYon = (e > 0) ? 1 : -1;
  return e;
}

void setup() {
  int pinler[] = {SOL_EN, SOL_IN1, SOL_IN2, SAG_EN, SAG_IN1, SAG_IN2};
  for (int i = 0; i < 6; i++) pinMode(pinler[i], OUTPUT);
}

void loop() {
  if (millis() - son < DT) return;     // 10 ms'de bir çalış
  son += DT;

  float e = hataOku();
  float u = KP * e;                    // P kontrol: çıkış = Kp x hata

  surucu(SOL_EN, SOL_IN1, SOL_IN2, TABAN - u);   // u > 0 (çizgi solda): sol yavaşla, sağ hızlan
  surucu(SAG_EN, SAG_IN1, SAG_IN2, TABAN + u);
}
```

### Nasıl çalışıyor?
1. `hataOku()` çizginin konumunu verir. Ayar noktası 0 olduğu için konumun kendisi hatadır: `e > 0` çizgi solda demektir.
2. `u = KP * e`: hata 2 katına çıkarsa direksiyon da 2 katına çıkar.
3. Sol tekerleğe `TABAN - u`, sağ tekerleğe `TABAN + u` verilir. Çizgi soldaysa (`u > 0`) sol tekerlek yavaşlar, sağ tekerlek hızlanır ve robot sola döner (76. dersteki ω = (vR - vL) / L formülü).
4. Çizgi kaybolursa (`sayi == 0`) hata, son görülen tarafa doğru "çok uzak" anlamında ±2 yapılır (en uç sensörün konumu). Sensörler 2,4 cm arayla, çizgi 2 cm genişliğinde olduğu için çizgi iki sensörün arasından geçerken kısa süre hiçbirine görünmeyebilir; ±2 bu anlarda robotu fazla savurmaz. Robot çizgiyi bulana kadar o yöne döner.
5. `surucu()` 78. dersteki ölü bölgeyi atlar: komut 1 olsa bile PWM en az %20 olur. Böylece `u` ile tekerlek hızı yaklaşık doğrusal kalır.
6. `millis()` ile 10 ms'de bir çalışan sabit bir kontrol döngüsü kurduk (27. ders). Sabit periyot, 97. dersteki türev için de gerekli.

### Ölçüm: Kp'yi değiştir
Aynı sketch'i 4 farklı `KP` ile (8, 85, 210, 830) `sim.rover` üzerinde koşturduk. Pist: saat yönünün tersine dönen, alt düzlüğünde iki dalgalı (slalom) bölüm olan, viraj yarıçapı 17 cm'lik bir pist. `TABAN = 200`. (Derste `KP = 170` var; tabloda ayarın etkisini görmek için dört uç değer seçtik.)

| Kp | Sonuç | Tur süresi | Hata RMS | En büyük sapma | Direksiyon titreşimi |
|---|---|---|---|---|---|
| 8 | çizgiyi kaybetti | - | 52,6 mm | 175 mm | 0,06 |
| 85 | turu bitirdi | 10,40 sn | 15,7 mm | 46 mm | 0,43 |
| 210 | turu bitirdi | 10,90 sn | 8,4 mm | 19 mm | 0,95 |
| 830 | turu bitirdi | 12,10 sn | 7,9 mm | 19 mm | 1,49 |

- **Hata RMS:** robotun dizi merkezinin çizgiye uzaklığının karekök-ortalaması. Küçük olması iyi.
- **Direksiyon titreşimi:** her 20 ms'de sol-sağ tekerlek hız farkındaki ortalama değişim (rad/s). Büyük olması robotun direksiyonu sürekli oynattığı anlamına gelir.

Okuma:
- **Kp çok küçükse** direksiyon yetmez. Robot virajda çizgiden çıkar ve onu kaybeder.
- **Kp uygunsa** robot çizgide kalır ve turu bitirir.
- **Kp büyüdükçe** hata küçülür ama direksiyon titreşimi artar. Kp = 830'da titreşim Kp = 85'in yaklaşık 3,5 katı; tur da 1,7 sn uzadı. Daha fazla Kp her zaman daha iyi değildir.

### Neden büyük Kp burada salınmadı?
Gerçek robotlarda çok büyük Kp çoğu zaman robotu çizginin iki yanına savurur (salınım). Bu pistte bunu çok az gördük, çünkü dizi tekerlek aksının **7 cm önünde**. Robot, burnunun nereye gittiğini görüyor ve düzeltmeyi erkenden yapıyor. İleriye bakmak bir tür sönümlemedir. Dizinin aks yakınına (2 cm) alındığı aynı pistte, aynı Kp = 210 ile ilk 8 saniyede şunu ölçtük:

| Dizi aksın | Çizgiyi kesme sayısı | Hata RMS |
|---|---|---|
| 7 cm önünde | 7 | 8,4 mm |
| 2 cm önünde | 14 | 17,6 mm |

Dizi aksa yaklaşınca robot çizgiyi çok daha sık kesiyor; salınım artıyor. 97. derste salınımı sönümleyen terimi öğreneceksin.

### Gerçek robotta farklı olabilecekler
- Bu benzetimde çizgi sensörlerine gürültü eklenmedi. Gerçek dizide ortam ışığı ve yüzey rengi okumayı değiştirir; eşiği 87. dersteki gibi kalibre etmen gerekir.
- Motorların tepki hızı ve ölü bölgesi her robotta farklıdır. Buradaki Kp değerlerini kendi robotuna kopyalama; kendi robotunda ölç.

### Dene
- `KP = 100` ile `TABAN` değerini 150, 200 ve 255 yap. Hangi hızda robot çizgiyi kaybediyor?
- `ESIK` değerini 900 yap. Çizgi üstünde sensör yaklaşık 860 okur. Robot ne yapar, neden?
- `konum_oku` sketch'inde iki sensörü birden çizgi üstüne getir. Konum neden 0,5'lik adımlarla değişiyor?

### Sık yapılan hatalar
- `TABAN - u` ve `TABAN + u` yerlerini karıştırmak: robot çizgiye değil, çizgiden uzağa döner.
- Hatanın işaretini yanlış tanımlamak. Burada pozitif hata = çizgi solda = sola dön. Sağ ve sol tekerlekleri buna göre bağla.
- Kp'yi bir seferde çok büyütmek. Küçükten başla, her seferinde 2 katına çıkar ve ölç.
- `loop()` içine `delay()` koymak. Kontrol döngüsünün periyodu sabit olmazsa sonraki derslerdeki D ve I terimleri bozulur.
- Çizgi kayıp durumunu atlamak: `sayi == 0` iken sıfıra bölme olur ya da robot düz gider.

## Konuşalım
Robot çizginin tam üzerindeyken (hata 0) P kontrol direksiyona ne verir? Virajda çizgi robotun hep aynı tarafında kalıyorsa ne olur? Hata hiç sıfır olmazsa P kontrol yeterli mi?
