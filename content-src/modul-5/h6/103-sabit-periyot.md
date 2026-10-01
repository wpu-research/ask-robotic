# Sabit periyotlu kontrol döngüsü
süre: 25

## Merak
Bir denge robotunun kodu saniyede yüzlerce kez eğimi okur, hesap yapar ve motorları ayarlar. Bu işin ritmi kadar önemli bir şey daha var: her turun **aynı sürede** dönmesi. Sinema filminde kareler düzensiz gelirse hareket sarsılır; kontrol döngüsünde ise robot düşer. `delay(5)` yazmak "5 ms'de bir çalışsın" demek midir? Bu derste ölçeceksin.

## Etkinlik
### Devre
Bir önceki derslerle aynı: MPU6050 (SDA **A4**, SCL **A5**, adres 0x68). Ölçüm için **D13** kullanılıyor: dahili LED. Her tur D13'ün durumunu çevirir; iki kenar arasındaki süre bir turun süresidir. Osiloskopun ya da mantık çözümleyicin varsa D13'e bağla. Benzetimde bu ölçümü bizim için `pinEdges` yapıyor.

### Neden sabit periyot?
Kontrol kodundaki üç şey `dt`'ye bağlıdır:
1. **Açı integrali:** `aci += hiz · dt` (ders 102). `dt` yanlışsa açı orantılı olarak yanlış çıkar.
2. **Tamamlayıcı filtre:** zaman sabiti `τ ≈ α · dt / (1 − α)` (ders 102); `dt` değişince filtre davranışı da değişir.
3. **PID:** türev `Δhata / dt`, integral `hata · dt` (Hafta 5); kazançlar belirli bir `dt` için ayarlanmıştır.

Bu yüzden iki yol vardır: ya `dt`'yi **her tur gerçekten ölçeriz** (en az bu), ya da döngüyü **sabit periyotla** çalıştırırız (daha iyi). İkisini birlikte yapmak en sağlamıdır.

### delay() döngüsü ne kadar sürer?
`delay(5)` "5 ms bekle" demektir; ama turun geri kalanı (I2C okuma, hesaplar, `Serial.print`) bunun **üstüne** eklenir. Tur süresi `5 ms + işin süresi` olur ve iş her turda aynı sürmez.

### Program 1: delay() döngüsünün periyodunu ölç
Jiroskop sabit 50 °/s dönüyormuş gibi besleniyor. Program açıyı iki yolla toplar: `dt = 0,005` sabit varsayarak ve `micros()` ile ölçerek. Her 100 turda sonuçlar ve ölçülen en küçük/en büyük tur süresi (µs) yazılır.

```cpp
// sketch: delay_dongusu
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int OLCUM_PINI = 13;            // her turda durumu değişir
const float JIRO_OLCEK = 65.5;        // ±500 °/s
const float VARSAYILAN_DT = 0.005;    // "5 ms'dir herhalde" diye yazdığımız dt (s)

float aciSabitDt = 0;                 // dt = 0,005 varsayarak
float aciOlculenDt = 0;               // dt'yi micros() ile ölçerek
unsigned long sonUs = 0;
unsigned long enKucukUs = 4294967295UL;
unsigned long enBuyukUs = 0;
int tur = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

// 14 baytı oku, ivme açısını hesapla, jiroskop hızını döndür
float imuOku(float &ivmeAci) {
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
  return gyHam / JIRO_OLCEK;
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
  pinMode(OLCUM_PINI, OUTPUT);
  sonUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long dtUs = simdi - sonUs;         // bu tur ile önceki tur arası gerçek süre
  sonUs = simdi;
  if (dtUs < enKucukUs) enKucukUs = dtUs;
  if (dtUs > enBuyukUs) enBuyukUs = dtUs;

  digitalWrite(OLCUM_PINI, !digitalRead(OLCUM_PINI));   // her turda durumu çevir

  float ivmeAci;
  float hiz = imuOku(ivmeAci);
  aciSabitDt += hiz * VARSAYILAN_DT;
  aciOlculenDt += hiz * (dtUs / 1000000.0);

  tur++;
  if (tur >= 100) {                           // her 100 turda bir yazdır
    tur = 0;
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aciSabitDt, 1);
    Serial.print(',');
    Serial.print(aciOlculenDt, 1);
    Serial.print(',');
    Serial.print(enKucukUs);
    Serial.print(',');
    Serial.println(enBuyukUs);
    enKucukUs = 4294967295UL;
    enBuyukUs = 0;
  }
  delay(5);                                   // "5 ms bekle"
}
```

Çıktının sütunları: zaman (ms), sabit `dt` ile açı, ölçülen `dt` ile açı, en küçük tur (µs), en büyük tur (µs).

Benzetimde ölçtüğümüz (4 saniyede):
- Tur süresi (D13 kenarları): ortalama **5,35 ms**, en kısa 5,33 ms, en uzun **6,64 ms**. `delay(5)` 5 ms'ye ek olarak yaklaşık 0,33 ms'lik iş süresini ve `Serial.print` turlarında yaklaşık 1,3 ms daha ekliyor.
- Jiroskop 3,7 saniye boyunca 50 °/s döndü, yani gerçek açı **186,7°**. `dt = 0,005` varsayan açı **175,0°** buldu (%6,3 eksik); ölçülen `dt` ile bulunan açı **186,7°** çıktı.

### Program 2: micros() ile sabit periyot
Çözüm: "5 ms geçti mi?" diye sormak. Bunu `millis()` ile (ders 27) yapmıştık; denge için daha ince bir zamana ihtiyacımız var, o yüzden `micros()` (mikrosaniye, bu kartta 4 µs adımlarla sayar). Bir sonraki turun **planlanan** zamanını tutarız ve her turda ona `PERIYOT_US` ekleriz; böylece küçük gecikmeler birikip döngüyü kaydırmaz.

İş bir turdan uzun sürerse (**taşma**), planlanan zamanı yeniden ayarlayıp kaçırılan turu sayarız. Seri porttan `a` gönderirsen program bilerek 12 ms'lik ağır bir iş yapar ve bir turu kaçırır.

```cpp
// sketch: sabit_dongu
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int OLCUM_PINI = 13;
const float JIRO_OLCEK = 65.5;
const unsigned long PERIYOT_US = 5000;   // hedef periyot: 5 ms = 200 Hz

float aciSabitDt = 0;                 // dt = PERIYOT_US varsayarak
float aciOlculenDt = 0;               // dt'yi micros() ile ölçerek
unsigned long sonPlanUs = 0;          // bir sonraki turun planlanan zamanı
unsigned long sonGercekUs = 0;        // önceki turun gerçek başlangıcı
unsigned long enKucukUs = 4294967295UL;
unsigned long enBuyukUs = 0;
int tasma = 0;                        // kaçırılan tur sayısı
int tur = 0;

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

float imuOku(float &ivmeAci) {
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
  return gyHam / JIRO_OLCEK;
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
  pinMode(OLCUM_PINI, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;             // zamanı gelmedi: hiçbir şey yapma
  if (gecen >= 2 * PERIYOT_US) {              // bir tur kaçtı (iş çok uzun sürdü)
    tasma++;
    sonPlanUs = simdi;                        // yeniden senkronla
  } else {
    sonPlanUs += PERIYOT_US;                  // bir sonraki planlı an: kayma birikmez
  }
  unsigned long dtUs = simdi - sonGercekUs;   // iki tur arası gerçek süre
  sonGercekUs = simdi;
  if (dtUs < enKucukUs) enKucukUs = dtUs;
  if (dtUs > enBuyukUs) enBuyukUs = dtUs;

  digitalWrite(OLCUM_PINI, !digitalRead(OLCUM_PINI));

  float ivmeAci;
  float hiz = imuOku(ivmeAci);
  aciSabitDt += hiz * (PERIYOT_US / 1000000.0);
  aciOlculenDt += hiz * (dtUs / 1000000.0);

  if (Serial.available() && Serial.read() == 'a') {
    delay(12);                                // ağır iş benzetimi: bir turu kaçırır
  }

  tur++;
  if (tur >= 100) {                           // her 100 turda bir yazdır
    tur = 0;
    Serial.print(millis());
    Serial.print(',');
    Serial.print(aciSabitDt, 1);
    Serial.print(',');
    Serial.print(aciOlculenDt, 1);
    Serial.print(',');
    Serial.print(enKucukUs);
    Serial.print(',');
    Serial.print(enBuyukUs);
    Serial.print(',');
    Serial.println(tasma);
    enKucukUs = 4294967295UL;
    enBuyukUs = 0;
  }
}
```

Çıktının son sütunu kaçırılan tur sayısıdır.

Benzetimde ölçtüğümüz:
- Tur süresi (D13 kenarları): ortalama **5,000 ms**, en kısa 4,991 ms, en uzun 5,009 ms. Sketch'in kendi ölçümü de 4996 ile 5004 µs arasında.
- Her iki açı da gerçeği buluyor (186,7° civarı); `dt` sabit varsayımı artık doğru, çünkü periyot gerçekten sabit.
- `a` komutu gönderince 12 ms'lik iş bir turu kaçırdı: `tasma` 1 oldu, bir tur arası 12 ms'nin üzerine çıktı, sonraki turlar yine 5,000 ms'de devam etti.

### Nasıl çalışıyor?
1. `if (gecen < PERIYOT_US) return;` döngü hızlıca boş döner; işe yalnız süre dolunca girilir. `delay()` gibi işlemciyi bekletmiyoruz, `loop()` her an başka bir işe (örneğin seri porttan okumaya) bakabilir.
2. `sonPlanUs += PERIYOT_US` planlı zamanı ilerletir. `sonPlanUs = simdi` yapsaydık, her turdaki küçük gecikme bir sonrakine eklenir ve periyot hedeften uzaklaşırdı.
3. Süreler `unsigned long` farkıyla hesaplanır. `micros()` yaklaşık 71,6 dakikada başa sarar; çıkarma işlemi (ders 27'deki gibi) bu sarmada da doğru sonuç verir.
4. `dtUs` yine de **ölçülür**: bir tur kaçarsa filtre ve integral yine doğru `dt`'yi kullanır.

### Sabit periyot denge için ne kadar önemli?
Aynı PD denge kodunu (104'te ayrıntılarına gireceğiz) farklı periyotlarla çalıştırdık. Robot 3° eğik başlıyor, 8 saniye boyunca izlendi:

```cpp
// sketch: denge_sabit
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor

const unsigned long PERIYOT_US = 5000;
const float ALFA = 0.98;              // tamamlayıcı filtre
const float KP = 0.15;                // komut / derece      (BENZETİM robotuna göre)
const float KD = 0.02;                // komut / (derece/s)  (BENZETİM robotuna göre)
const float OLU_BOLGE = 0.08;         // motor ölü bölgesi: PWM'in bu oranının altında tekerlek dönmüyor

float aci = 0;
bool ilk = true;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;

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

void motorSur(float u) {              // u: -1 ... +1
  u = constrain(u, -1.0, 1.0);
  bool ileri = (u >= 0);
  digitalWrite(SOL_IN1, ileri);
  digitalWrite(SOL_IN2, !ileri);
  digitalWrite(SAG_IN3, ileri);
  digitalWrite(SAG_IN4, !ileri);
  float buyukluk = fabs(u);
  int pwm = 0;
  if (buyukluk > 0.002) pwm = (OLU_BOLGE + buyukluk * (1.0 - OLU_BOLGE)) * 255 + 0.5;   // ölü bölgeyi atla, yuvarla
  analogWrite(SOL_EN, pwm);
  analogWrite(SAG_EN, pwm);
}

void setup() {
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

  motorSur(KP * aci + KD * hiz);      // açı ve hız PD'si; ayrıntısı 104'te
}
```

| Periyot | Sonuç (8 saniye) |
|---|---|
| 5 ms (200 Hz) | Ayakta; en büyük eğim 3,0° (başlangıçtaki), sonda 0° |
| 20 ms (50 Hz) | Ayakta; en büyük eğim 3,0°, sonda 0° |
| 60 ms | Ayakta kalıyor ama büyük salınım yapıyor: en büyük eğim 16,5° |
| 100 ms | Neredeyse düşüyor: en büyük eğim 43,9°, 45° sınırının hemen altı |
| 150 ms | Düşüyor (0,3 saniyede) |

Kural: kontrol periyodu, robotun devrilme zaman ölçeğinden (101'de gördüğümüz gibi 0,7 saniye) çok daha kısa olmalıdır. Gerçek robotlarda genelde 5-10 ms seçilir; bu kursta 5 ms kullanıyoruz.

### Dene
- `delay_dongusu`'ndaki `delay(5)` yerine `delay(1)` yaz. Tur süresi ne oldu? İşin süresi hâlâ ekleniyor mu?
- `sabit_dongu`'da `PERIYOT_US`'yi 2000 yap (500 Hz). Tur kaçmaya başlıyor mu? İşin süresini ölçerek en hızlı güvenli periyodu bul.
- `denge_sabit`'te `PERIYOT_US`'yi 20000, 60000 ve 100000 yap. Robot ne zaman titremeye, ne zaman düşmeye başlıyor?

### Sık yapılan hatalar
- `delay(5)` ile "200 Hz döngü" yaptığını sanmak: tur süresi 5 ms + işin süresidir ve her turda değişir.
- `sonPlanUs = simdi` yazmak: küçük gecikmeler birikir, periyot hedeften uzaklaşır.
- `micros()` farkını `int` ile almak: `int` AVR'de 16 bittir ve 32,7 ms'de taşar. `unsigned long` kullan.
- Kontrol döngüsünün içine çok fazla `Serial.print` koymak: 115200 baudda bile uzun satırlar tamponu doldurup turu geciktirir. Ölçüm için seyrek yazdır (yukarıdaki gibi her 100 turda bir).
- Döngüyü yalnızca hızlı yapıp ölçmemek: tasma sayacı yoksa kaçan turlar fark edilmez.

### Gerçek robotta farklı olabilecekler
Benzetimdeki zamanlama neredeyse kusursuzdur: sabit periyot ±4 µs içinde tutuyor. Gerçek kartta kesmeler (örneğin enkoder, ders 92), `Serial` ve I2C kilitlenmeleri tur süresini daha çok oynatır ve I2C hızı (`Wire.setClock(400000)`) tur süresini kısaltabilir; bunu kendi kartında ölç.

## Konuşalım
Kontrol döngün 200 Hz'de çalışırken her turda 12 ms süren bir iş (örneğin uzun bir `Serial.print`) eklenirse robot ne yapar? Bu işi nereye taşırdın?
