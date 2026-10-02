# Proje: Kendini dengeleyen robot
süre: 35

## Merak
Bir şeyi tek parmakla dik tutmaya çalıştın mı? Cetvel, süpürge sapı... Düşmeye başladığını gözün görür, elin hemen altına gider. Senin robotun da aynısını yapacak: gözü MPU6050, eli iki motor. Bu haftanın projesinde dengeleyen robotu bütünüyle kuracaksın ve ona bir itme vereceksin. Robot düşmeden toparlanabilecek mi?

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Hafta 6, ders 101-102:** MPU6050'yi ham `Wire` ile oku, tamamlayıcı filtreyle açıyı bul.
- **Hafta 6, ders 103:** 5 ms'lik sabit periyotlu kontrol döngüsü.
- **Hafta 6, ders 104:** Kaskad kontrol: iç döngü açıyı, yavaş dış döngü konumu tutar.
- **Modül 3, ders 28:** Durum makinesi (`enum`): DENGE, KONTROLSUZ, DUSTU.
- **Hafta 1, ders 77-78:** Motor yönü, PWM ve ölü bölge.

Hedefler (benzetimde ölçeceğiz):
1. Robot 10 saniye boyunca ayakta kalacak.
2. 3. saniyede ona bir itme vereceğiz. Robot düşmeden toparlanacak.
3. Robot **en büyük eğimi** ve **oturma süresini** (itmeden sonra eğimin 1°'nin altına inip orada kalması) kendisi raporlayacak.
4. Karşılaştırma: kontrol kapalıyken robotun ne kadar sürede düştüğünü ölçeceğiz.

### Devre
| Parça | Bağlantı |
|---|---|
| MPU6050 | SDA → **A4**, SCL → **A5**, GND → GND, VCC → modülün belgesindeki gerilim, AD0 → GND (adres 0x68). X ekseni ileri, Z ekseni yukarı |
| Sol motor (sürücü üzerinden) | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Sağ motor (sürücü üzerinden) | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |
| Durum LED'i | **D13** (dahili LED): robot düşünce yanar |

**Güvenlik:** Motorları Arduino'nun 5 V pininden besleme; harici güç kullan ve motor sürücünün GND'sini Arduino GND'sine bağla. Pil kullanırsan kısa devre yapma, ters bağlama; yetişkin gözetiminde çalış. Gerçek robotu ilk denemede havada tut: tekerlekler yere değmeden motorların doğru yöne döndüğünü kontrol et.

### Benzetim ile gerçek robot
**Önemli:** `KP`, `KD`, `KX`, `KV` ve `HIZ_KATSAYI` sayıları benzetimdeki robota (ters sarkaç modeli: A = 25, B = 80, C = 0,6) göre bulundu. Gerçek robotta bu sayılar işe yaramaz: motor gücü, tekerlek çapı, robotun yüksekliği ve ağırlığı farklıdır. Gerçek robotta kazançları baştan, küçük değerlerle ayarla: önce yalnız `KP`, robot titremeye başlayınca `KD`, en son dış döngü. Programın **yapısı** aynen geçerlidir.

Bu benzetimde robotun enkoderi yok; konumu komuttan tahmin ediyoruz. Gerçek robotta enkoder (ders 92) kullan.

### Program
```cpp
// sketch: denge_robotu
#include <Wire.h>

const int MPU_ADRES = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;     // sol motor
const int SAG_EN = 6, SAG_IN3 = 9, SAG_IN4 = 10;    // sağ motor
const int DURUM_LED = 13;                           // yanıyorsa robot düştü

const unsigned long PERIYOT_US = 5000;   // iç döngü: 5 ms (200 Hz)
const int DIS_ORAN = 4;                  // dış döngü: 20 ms (50 Hz)
const float ALFA = 0.98;                 // tamamlayıcı filtre

// BENZETİM robotuna göre ayarlı kazançlar; gerçek robotta yeniden ayarlanır
const float KP = 0.15;                   // komut / derece
const float KD = 0.02;                   // komut / (derece/s)
const float KX = -10.0;                  // derece / metre
const float KV = -25.0;                  // derece / (metre/saniye)
const float HEDEF_SINIR = 6.0;           // hedef açı en çok ±6°
const float HIZ_KATSAYI = 0.5;           // benzetimde: tekerlek hızı (m/s) ≈ 0,5 · komut
const float OLU_BOLGE = 0.08;

const float DUSME_ACISI = 40.0;          // bu açıyı aşarsak motorları kes
const float ITME_ESIGI = 2.0;            // bu kadar sapma = "itildik"
const float OTURMA_ESIGI = 1.0;          // bundan küçük sapma = "oturdu"
const unsigned long OTURMA_BEKLEME_MS = 1000;   // bu kadar süre eşik altında kalırsa oturmuş say
const unsigned long HAZIR_MS = 2000;     // açılıştaki ilk toparlanmayı itme sanma

enum Durum { DENGE, KONTROLSUZ, DUSTU };
Durum durum = DENGE;

float aci = 0;
bool ilk = true;
float sonKomut = 0;
float hizTahmin = 0;
float konumTahmin = 0;
float hedefAci = 0;
int disSayac = 0;
unsigned long sonPlanUs = 0;
unsigned long sonGercekUs = 0;
unsigned long sonYazdirMs = 0;

// Rapor için ölçümler
bool itildi = false;
bool raporVerildi = false;
unsigned long itmeMs = 0;
unsigned long sonDisariMs = 0;           // eşiğin dışında olduğumuz son an
float maksEgim = 0;

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

void motorSur(float u) {                 // u: -1 ... +1; 0 = motorlar boşta
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
  pinMode(DURUM_LED, OUTPUT);
  sonPlanUs = sonGercekUs = micros();
}

void loop() {
  // 1) Sabit periyot (ders 103)
  unsigned long simdi = micros();
  unsigned long gecen = simdi - sonPlanUs;
  if (gecen < PERIYOT_US) return;
  if (gecen >= 2 * PERIYOT_US) sonPlanUs = simdi;
  else sonPlanUs += PERIYOT_US;
  float dt = (simdi - sonGercekUs) / 1000000.0;
  sonGercekUs = simdi;

  // 2) Komut: 'k' kontrolü kapatır (kontrolsüz deney)
  if (Serial.available() && Serial.read() == 'k') durum = KONTROLSUZ;

  // 3) Ölç ve süz (ders 101-102)
  float ivmeAci, hiz;
  imuOku(ivmeAci, hiz);
  if (ilk) { aci = ivmeAci; ilk = false; }
  aci = ALFA * (aci + hiz * dt) + (1 - ALFA) * ivmeAci;

  // 4) Durum makinesi (ders 28)
  if (durum != DUSTU && fabs(aci) > DUSME_ACISI) {
    durum = DUSTU;
    Serial.print("DUSTU,");
    Serial.println(millis());
  }

  if (durum == DENGE) {
    // Dış döngü: yavaş (ders 104)
    disSayac++;
    if (disSayac >= DIS_ORAN) {
      disSayac = 0;
      hizTahmin = HIZ_KATSAYI * sonKomut;
      hedefAci = constrain(KX * konumTahmin + KV * hizTahmin, -HEDEF_SINIR, HEDEF_SINIR);
    }
    // İç döngü: hızlı
    sonKomut = KP * (aci - hedefAci) + KD * hiz;
    konumTahmin += HIZ_KATSAYI * sonKomut * dt;
    motorSur(sonKomut);
  } else {
    sonKomut = 0;
    motorSur(0);                         // motorlar kapalı
    digitalWrite(DURUM_LED, durum == DUSTU);
  }

  // 5) Ölçüm ve rapor: itme, en büyük eğim, oturma süresi
  unsigned long ms = millis();
  if (durum == DENGE && ms > HAZIR_MS) {
    if (!itildi && fabs(aci) > ITME_ESIGI) {
      itildi = true;
      itmeMs = ms;
    }
    if (itildi && !raporVerildi) {
      if (fabs(aci) > maksEgim) maksEgim = fabs(aci);
      if (fabs(aci) > OTURMA_ESIGI) sonDisariMs = ms;
      if (ms - sonDisariMs > OTURMA_BEKLEME_MS) {
        raporVerildi = true;
        Serial.print("RAPOR,");
        Serial.print(itmeMs);
        Serial.print(',');
        Serial.print(maksEgim, 1);
        Serial.print(',');
        Serial.println(sonDisariMs - itmeMs);
      }
    }
  }

  if (ms - sonYazdirMs >= 1000) {        // saniyede bir durum satırı
    sonYazdirMs = ms;
    Serial.print("T,");
    Serial.print(ms);
    Serial.print(',');
    Serial.print(aci, 2);
    Serial.print(',');
    Serial.println(konumTahmin, 3);
  }
}
```

### Nasıl çalışıyor?
1. **Sabit periyot (103):** `loop()` yalnız 5 ms dolunca işe girer, `dt` her tur ölçülür.
2. **Ölçüm ve filtre (101-102):** 14 bayt okunur, ivme açısı ve jiroskop hızı tamamlayıcı filtreye girer.
3. **Durum makinesi:** DENGE'de kontrol çalışır. Açı 40°'yi geçerse DUSTU durumuna geçilir: motorlar kapanır, LED yanar, `DUSTU` yazdırılır. Seri porttan `k` gelirse KONTROLSUZ durumuna geçilir; bu, kontrolün işe yaradığını görmek için bir deneydir.
4. **Kaskad (104):** dış döngü 20 ms'de bir hedef açıyı belirler, iç döngü her 5 ms'de bu hedefe yaklaşır. Dış döngü kazançlarını (`KX = −10`, `KV = −25`) 104'tekinden küçük tuttuk. Neden? Aşağıda "Bu projeden öğrendiklerimiz" bölümünde.
5. **Rapor:** 2. saniyeden sonra açı 2°'yi aşınca "itildik" sayılır. En büyük eğim izlenir. Açı 1°'nin altında 1 saniye kalırsa oturmuş sayılır ve `RAPOR,itmeAnı,enBüyükEğim,oturmaSüresi` satırı yazdırılır. Oturma süresi, itmeden sonra eğimin 1°'yi son aştığı ana kadar geçen süredir.

Seri çıktıdaki `T,` satırları (saniyede bir): zaman, süzülmüş açı, tahmini konum.

### Ölçümler
Robotu 3° eğik başlattık. 3. saniyede robotun açısal hızına benzetimden **+200 °/s** ekledik: hafif ama net bir itme. Arena etkinliğinde bu itme 3. saniyede kendiliğinden gelir; ayrıca "İt" düğmeleriyle istediğin zaman ileri ya da geri itebilirsin. Arena, itmenin gerçek anını, en büyük eğimini ve oturma süresini ölçer ve robotun `RAPOR` satırını bununla karşılaştırır (itme anı ±100 ms, eğim ±0,6°, oturma ±100 ms).

| Ölçüm | Gerçek (`bal`) | Robotun raporu |
|---|---|---|
| İtme anı | 3000 ms | 3010 ms |
| En büyük eğim | 4,96° | 5,3° |
| Oturma süresi (eğim 1°'nin altına inip orada kalma) | 177 ms | 175 ms |

- Robot 10 saniye boyunca ayakta kaldı, hiç düşmedi; 10. saniyede konum yalnız 1 cm kaymıştı.
- Rapordaki eğim gerçekten 0,3° büyük: robot gerçek açıyı değil, süzülmüş açıyı görür ve hızlı hareket sırasında ikisi arasında küçük farklar olabilir. Oturma süresi iki ölçümde de neredeyse aynı.
- **Kontrolsüz karşılaştırma:** aynı program `k` komutuyla kontrol kapalı çalıştırıldığında robot komuttan **756 ms sonra** devrildi (45° sınırı). Program, 40° eşiğini geçince `DUSTU` yazdı ve LED'i yaktı. Kontrol, robotu 0,76 saniyelik bir düşmeden kurtarıyor; 101'deki 0,71 saniyelik ölçümle uyumlu (orada robot kontrol başlamadan bırakılmıştı).
- **Ters yönde itme** (−200 °/s) de toparlandı: 4 saniye sonra eğim 0,70°.
- **Zayıf pil taklidi:** `KP`'yi %30 azaltınca robot yine toparladı (en büyük eğim yine 5,0°).
- **Jiroskop sapması düzeltilmezse** (1 °/s): robot düşmez ama kalıcı olarak yaklaşık −1,05° eğik kalır, yani oturma eşiğini (1°) aşar. 101'deki açılış kalibrasyonunun neden gerektiğini gösteriyor.

### Bu projeden öğrendiklerimiz
- **Dış döngü kazancı bir dengedir.** 104'te kullandığımız büyük kazançlar (`KX = −60`, `KV = −150`) sensör kaymasına karşı konumu iyi tutuyordu. Ama aynı kazançlarla yapılan +200 °/s itmeden sonra robot düşmedi, fakat 7 saniye sonra bile eğim RMS 1,5°'nin üzerinde dolandı (yani oturmadı): konum tahminimiz komuttan yapıldığı için hatalıdır ve büyük kazanç bu hatayı büyütür. Burada sensör kaymasız olduğundan küçük kazançlar seçtik. Gerçek robotta konumu enkoderden ölç; tahmin hatası küçülür ve dış döngü kazancını büyütebilirsin.
- **Çok güçlü itmelerde** robot düşmez ama sakinleşmesi uzar: benzetimde +250 °/s itmeden sonra 7. saniyede bile eğim hâlâ 1°'yi aşıyordu (en büyük eğim 7,6°), +700 °/s'de ise robot düştü.
- Ayakta kalma payı kazançlara bağlıdır; her sayı benzetimdeki robota özeldir.

### Dene
- Pil gerilimi düşünce motorlar zayıflar. Benzetimde bunu `KP`'yi %30 azaltarak taklit et. Robot hâlâ toparlıyor mu? En büyük eğim değişti mi?
- İtmeyi ters yönde ver (`−200 °/s`). Rapor değerleri değişir mi?
- `KX`'i −60, `KV`'yi −150 yap ve aynı itmeyi ver. Oturma süresi ne oldu?
- `DUSME_ACISI`'ni 20° yap ve daha büyük bir itme ver. Motorları erken kesmek iyi bir fikir mi?
- (Gerçek robot) `KP`'yi yarıya indir ve robotu havada tutarak motor tepkisini gözle.

### Sık yapılan hatalar
- Robotu denge noktasına koymadan başlatmak: filtrenin ilk açısı yanlış olur. Önce elinle dik tut ve gerçek açı 0°'a yakınken gücü ver.
- Kazançları gerçek robota kopyalamak: benzetimdeki sayılar orada çalışmaz.
- Motor yön pinlerini ters bağlamak: robot düzeltmek yerine devrilmeyi hızlandırır. İşareti havada dene.
- Ölü bölgeyi hesaba katmamak (ders 78): küçük komutlarda tekerlek dönmez, robot sallanır.
- Seri porta döngü içinde çok yazmak: periyot bozulur (103).

### Gerçek robotta farklı olabilecekler
Gerçek robotta motorların tepki süresi, dişli boşluğu, tekerleğin kayması ve pilin gerilimi farklıdır. Bu proje benzetimde çalışır; aynı kodla gerçek bir robotu dengelemek için kazançları baştan ayarlamak, enkoderi eklemek ve güvenlik için (düşünce motorları kesme gibi) ek önlemler almak gerekir.

## Konuşalım
Robot 10 saniye ayakta kaldı ve itmeyi toparladı. Gerçek bir robotla aynı sonucu almak için sence hangi üç şeyi değiştirmek zorunda kalırsın? Kontrolsüz robotun yaklaşık 0,7 saniyede devrilmesi, döngüye ve motorlara ne gibi şartlar koyuyor?
