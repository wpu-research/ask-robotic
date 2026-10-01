# Kaskad PID: açı ve hız
süre: 30

## Merak
Önceki derslerde robot ayakta kaldı ama bir şey fark ettin mi: robotun **nerede** durduğuna hiç bakmadık. Gerçekte ağırlık merkezi tam ortada olmaz, sensör tam dik takılmaz. Robot ayakta durur ama yavaşça bir yöne süzülür; masanın kenarına varınca düşer. Sadece açıyı düzelten bir kontrol bunu fark edemez. Çözüm: iki kontrolcüyü üst üste koymak. Biri açıyı, diğeri robotun yerini ve hızını izler.

## Etkinlik
### Devre
Önceki derslerle aynı. MPU6050 (SDA **A4**, SCL **A5**, adres 0x68); sol motor EN **D5**, IN1 **D7**, IN2 **D8**; sağ motor EN **D6**, IN3 **D9**, IN4 **D10**. Motorlar için harici güç kullan ve motor sürücünün GND'sini Arduino GND'sine bağla (ortak GND).

**Önemli (hatırlatma):** `KP = 0,15`, `KD = 0,02` ve dış döngü kazançları **benzetimdeki robota** göre ayarlandı. Gerçek robotta motor gücü, tekerlek çapı, kütle ve yükseklik farklıdır; kazançları yeniden ayarlaman gerekir. Aynı yapıyı (iç döngü açı, dış döngü konum/hız) korursun, sayıları değiştirirsin.

### Tek döngü neden yetmiyor?
Şimdiye kadarki kontrol bir **açı PD**'siydi: `komut = KP · açı + KD · açıHızı`. Hedef hep 0°. Bu iş ayakta tutar. Ama robotun gerçekten dengede durduğu açı 0° olmayabilir: sensör 4° kaymış takılmışsa (ya da ağırlık merkezi önde/arkadaysa) sensörün "0°" dediği nokta gerçek denge noktası değildir. PD sensörün 0°'sine gitmeye çalışır, robot gerçekte biraz eğik kalır ve eğik robot ayakta kalmak için sürekli aynı yöne sürmek zorunda olur. Sonuç: **süzülme**.

Benzetimde sensörü 4° kaymış yaptık (ivmeölçer montaj hatası) ve robotu 15 saniye izledik.

### Program 1: yalnız açı PD'si (ve konumu izleyen yazdırma)
Bu benzetimde robotun enkoderi yok. Konumu, motora verdiğimiz komuttan tahmin ediyoruz: model tekerlek hızını yaklaşık `0,5 · komut` (m/s) olarak veriyor. Gerçek robotta konum ve hız enkoderden (ders 92) gelir; komuttan tahmin etmek yalnız bu benzetim için bir kısayoldur ve tekerlek kayınca yanlış olur.

```cpp
// sketch: pd_aci
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor

const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const float ALFA = 0.98;

// İç döngü (açı PD) -- BENZETİM robotuna göre
const float KP = 0.15;                   // komut / derece
const float KD = 0.02;                   // komut / (derece/s)
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut (yalnız konumu YAZDIRMAK için)
const float OLU_BOLGE = 0.08;

float aci = 0;
bool ilk = true;
float sonKomut = 0;                      // en son motora verilen komut
float konumTahmin = 0;                   // m
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;
unsigned long sonYazdirMs = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void motorSur(float u) {                 // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  // Yalnız açı PD'si. Hedef açı hep 0.
  sonKomut = KP * aci + KD * hiz;
  motorSur(sonKomut);

  // Konumu yalnız İZLİYORUZ, kontrol etmiyoruz: hız tahmini = 0,5 · komut
  konumTahmin += HIZ_KATSAYI * sonKomut * dt;

  if (millis() - sonYazdirMs >= 1000) {
    sonYazdirMs = millis();
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aci, 2);
    Serial.print(',');
    Serial.println(konumTahmin, 3);
  }
}
```

Çıktının sütunları: zaman (ms), süzülmüş açı (°), tahmini konum (m).

Benzetimde ölçtüğümüz (sensör 4° kaymış, 15 saniye):
| Zaman | Gerçek konum (benzetimden) |
|---|---|
| 5 sn | −0,053 m |
| 10 sn | −0,110 m |
| 15 sn | −0,166 m |

Robot düşmedi, en büyük eğim 4,2° oldu. Gerçek eğim yaklaşık −4,15°'de kaldı (sensör "0°" diyor) ve robot yaklaşık **1,1 cm/s** hızla durmadan süzüldü: 15 saniyede 16,6 cm. Aynı kodu sensör kaymasız çalıştırınca 15 saniyede konum 0,001 m kaldı; yani süzülmenin sebebi PD'nin kendisi değil, denge noktasının 0° olmaması. Programın yazdığı tahmini konum gerçek konumdan 2 cm'den az saptı.

### Fikir: iki döngü, iç içe
**Kaskad** kontrol, iki PID/PD'yi zincirler: dış döngünün çıkışı, iç döngünün hedefi olur.

| | Dış döngü (konum ve hız) | İç döngü (açı) |
|---|---|---|
| Girdi | Tahmini konum ve hız | Süzülmüş açı ve açı hızı |
| Çıktı | **Hedef açı** | Motor komutu |
| Hız | Yavaş: 20 ms (50 Hz) | Hızlı: 5 ms (200 Hz) |

Mantık: robot ileri süzülüyorsa dış döngü hedef açıyı **geri** (negatif) yapar; iç döngü robotu o açıya getirmek için tekerlekleri önce ileri sürer, robot geri eğilir ve sonra geri yönde hareket eder. Böylece konum 0'a doğru çekilir. Dış döngü açıyı doğrudan düzeltmez; iç döngüye "şu açıda dur" der.

**Neden dış döngü yavaş olmalı?** İç döngü bir hedef açıya oturmak için zamana ihtiyaç duyar. Dış döngü hedefi her turda değiştirirse iç döngü hedefi yakalayamadan hedef kaymış olur ve ikisi birbirini kovalar. Kural: dış döngü, iç döngüden yaklaşık 5-10 kat yavaş olmalıdır. Aşağıda bunu ölçeceğiz.

### Program 2: kaskad denge
```cpp
// sketch: kaskad_denge
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor

const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const int DIS_ORAN = 4;                  // dış döngü: her 4 turda bir = 20 ms (50 Hz)
const float ALFA = 0.98;

// İç döngü (açı PD) -- BENZETİM robotuna göre
const float KP = 0.15;                   // komut / derece
const float KD = 0.02;                   // komut / (derece/s)
// Dış döngü (konum + hız -> hedef açı) -- BENZETİM robotuna göre
const float KX = -60.0;                  // derece / metre
const float KV = -150.0;                 // derece / (metre/saniye)
const float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut
const float OLU_BOLGE = 0.08;

float aci = 0;
bool ilk = true;
float sonKomut = 0;                      // en son motora verilen komut
float hizTahmin = 0;                     // m/s
float konumTahmin = 0;                   // m
float hedefAci = 0;                      // dış döngünün çıkışı, iç döngünün girişi
int disSayac = 0;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;
unsigned long sonYazdirMs = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void imuOku(float &ivmeAci, float &hiz) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);
  int16_t axHam = oku16();
  oku16();
  int16_t azHam = oku16();
  oku16();
  oku16();
  int16_t gyHam = oku16();
  oku16();
  ivmeAci = atan2((float)axHam, (float)azHam) * 57.2958;
  hiz = gyHam / 65.5;
}

void motorSur(float u) {                 // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
  for (int p = 5; p <= 10; p++) pinMode(p, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  // DIŞ DÖNGÜ: yavaş. Hız ve konumu tahmin et, hedef açıyı belirle.
  disSayac++;
  if (disSayac >= DIS_ORAN) {
    disSayac = 0;
    hizTahmin = HIZ_KATSAYI * sonKomut;
    hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);
  }

  // İÇ DÖNGÜ: hızlı. Açıyı hedef açıda tut.
  sonKomut = KP * (aci - hedefAci) + KD * hiz;
  motorSur(sonKomut);
  konumTahmin += HIZ_KATSAYI * sonKomut * dt;   // konum: her turda topla (hız tahmini x dt)

  if (millis() - sonYazdirMs >= 1000) {
    sonYazdirMs = millis();
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aci, 2);
    Serial.print(',');
    Serial.print(hedefAci, 2);
    Serial.print(',');
    Serial.println(konumTahmin, 3);
  }
}
```

### Nasıl çalışıyor?
1. Her 5 ms'de iç döngü çalışır: süzülmüş açı hesaplanır ve `sonKomut = KP · (aci − hedefAci) + KD · hiz` motorlara gider.
2. Her 4. turda (20 ms) dış döngü çalışır: `hizTahmin = 0,5 · sonKomut` alınır ve `hedefAci = KX · konum + KV · hız` bulunur (±6° ile sınırlı).
3. `KX` ve `KV` **negatif**: konum pozitifse (ileri gitmişse) hedef açı negatif olur, yani robot geri yönde hareket eder.
4. `hedefAci` sınırlıdır; sınır olmasaydı dış döngü robotu iç döngünün toparlayamayacağı kadar eğmeye çalışabilirdi.
5. Dış döngüyü ayrı bir `if` içinde çalıştırmak, onu iç döngüden yavaş tutmanın en basit yoludur; ikinci bir zamanlayıcıya gerek yok.

### Ölçümler
Aynı sensör kaymasıyla (4°) kaskad, 15 saniyede:

| Zaman | Gerçek konum (benzetimden) |
|---|---|
| 5 sn | −0,028 m |
| 10 sn | −0,038 m |
| 15 sn | −0,038 m |

- Süzülme **durdu**: son 5 saniyede konum 1 mm'den az değişti (yalnız PD'de 5,6 cm değişiyordu).
- Gerçek açı 15. saniyede −0,32°; yani robot neredeyse dik durdu (yalnız PD'de −4,15° idi). Sensör hâlâ 4° kaymış ama dış döngü hedef açıyı (15. saniyede +1,7°) ayarlayarak bunu telafi ediyor.
- En büyük eğim 4,0° oldu, düşme yok.
- Bedeli: robot başlangıç yerinden yaklaşık 4 cm uzakta duruyor. Dış döngü konumu tam 0'a değil, sensör kaymasını dengeleyecek bir noktaya getirir. Dış döngüye bir integral terimi (Hafta 5, ders 98) eklemek bu kalıcı farkı azaltmak için denenebilecek bir yoldur; bunu burada ölçmedik.
- Konum tahminimiz komuttan yapıldığı için kusurlu: son kayıtta (14. sn) tahmin −0,072 m, gerçek konum −0,041 m. Tahmin gerçek değerden belirgin biçimde sapabiliyor. Bu bir benzetim özelliği, ama gerçek robotta da komuttan hız tahmin etmek aynı nedenle güvenilmez; enkoder kullan.

### Dış döngü ne kadar yavaş olmalı?
`DIS_ORAN` değerini değiştirip (dış döngü her kaç iç turda bir çalışsın) son 5 saniyedeki açı salınımını (RMS) ölçtük:

| `DIS_ORAN` | Dış döngü periyodu | Açı salınımı (RMS, 10-15 sn) |
|---|---|---|
| 1 | 5 ms (iç döngüyle aynı) | 2,14° |
| 2 | 10 ms | 2,11° |
| 4 | 20 ms | 0,30° |
| 8 | 40 ms | 0,71° |

İç döngüyle aynı hızda (1) ya da 2 kat yavaş (2) olan dış döngüde robot ayakta kalıyor ama sürekli ±3° sallanıyor. 4 kat yavaşta sakinleşiyor. 8 kat yavaşta dış döngü o kadar geç tepki veriyor ki salınım yine biraz artıyor. Yani dış döngü ne iç döngü kadar hızlı ne de çok yavaş olmalı; bu kursta 4 kat yavaş (20 ms) seçtik. Bu sayı benzetimdeki robot için bulundu.

### Dene
- `KX` ve `KV`'yi 0 yap: kaskad kapanır, program 1'e döner. Süzülme geri gelir mi?
- `KX`'i −60'tan −120'ye çıkar. Robotun yerine oturması hızlandı mı, daha çok mu sallandı?
- `DIS_ORAN`'ı 1 yap. Robot ayakta kalıyor ama ne oluyor?
- `HEDEF_SINIR`'ı 15° yap. Sensör kayması çok büyükse dış döngü neden zararlı olabilir?

### Sık yapılan hatalar
- Dış döngüyü iç döngüyle aynı hızda çalıştırmak: iki döngü birbirini kovalar, robot sallanır.
- `KX` ve `KV`'nin işaretini ters koymak: robot süzülmeyi düzeltmek yerine hızlandırır ve düşer. İşareti bulmak için küçük bir değerle dene.
- Hedef açıyı sınırlamamak.
- Konumu komuttan tahmin etmeyi gerçek robotta sürdürmek: tekerlek kayar, zemin eğimlidir, tahmin zamanla yanlışlaşır; enkoder kullan.
- Kazançları gerçek robotta büyükten başlatmak: küçükten başla, dış döngüyü iç döngü oturduktan sonra ekle.

### Gerçek robotta farklı olabilecekler
Benzetimde komuttan hız tahmin ettik, gerçek robotta enkoderden ölçeriz. Gerçek motorlarda gecikme, geri tepme (dişli boşluğu) ve pil gerilimi düşünce kazanç değişimi vardır. Kazançların hepsi robotuna göre yeniden bulunur.

## Konuşalım
Dış döngü iç döngüden yavaş olmak zorunda. Peki iç döngü ne kadar hızlı olmalı? Bunu belirleyen şey ne olabilir?
