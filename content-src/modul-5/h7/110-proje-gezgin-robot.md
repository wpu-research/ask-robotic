# Proje: Gezgin robot (ara, kaç, dolaş)
süre: 35

## Merak
Bir keşif robotu bilinmeyen bir odaya bırakılıyor. Haritası yok, kimse kumanda etmiyor. Odayı dolaşacak, duvarlara ve mobilyalara çarpmayacak, bir de gitmesi gereken bölgeye uğrayıp "geldim" diyecek. Bu hafta öğrendiğin parçaları birleştirince tam bunu yapan bir robot yazabilirsin.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Hafta 2:** Ultrasonik sensörle engeli algılama ve kaçma.
- **Hafta 4:** Enkoderle yol ve konum tahmini (odometri).
- **Modül 3:** `millis()` ile bloklamayan döngü ve sabit aralıklı işler.
- **Bu hafta:** Jiroskop ve enkoderi birleştirme (106) ve davranışlar arasında öncelik (107).

Robotun üç davranışı var, yüksekten alçağa:

| Öncelik | Davranış | Ne zaman devrede? | Ne yapar? |
|---|---|---|---|
| 1 | **KAÇ** | Ön mesafe 25 cm altına düşünce (60 cm üstüne çıkana kadar) | Yerinde sola dönerek engelden uzaklaşır |
| 2 | **ZİYARET** | İlk 12 saniyeden sonra, bölge henüz ziyaret edilmediyse | Konum tahminine bakarak bölgenin merkezine yönelir; 15 cm yaklaşınca "ziyaret edildi" yazar |
| 3 | **DOLAŞ** | Her zaman | İleri gider, ara sıra rastgele döner |

İlk 12 saniye robot yalnızca arar ("ara" = dolaş). Sonra bölgeye gitme isteği devreye girer. Engel çıkarsa KAÇ her zaman öncelikli kalır.

Bölgenin nerede olduğunu robot biliyor: arenanın sağ üst köşesine yakın, merkezi (1,5 m ; 1,5 m), yarıçapı 0,25 m. Robotun kendi konumunu ise tahmin etmesi gerekiyor: başlangıç konumu ve yönü biliniyor (0,3 m ; 0,3 m ve sağa bakıyor). Sonrası enkoder yolu ve birleşik yönelimden (106. ders) hesaplanıyor:

```
x = x + yol · cos(yönelim)
y = y + yol · sin(yönelim)
```

### Devre
Standart Modül 5 bağlantıları. Burada çizgi sensörü ve servo yok.

| Parça | Bağlantı |
|---|---|
| Sol motor (sürücü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor (sürücü) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Sol / sağ enkoder | **D2** / **D3** (kesme pinleri) |
| Ultrasonik HC-SR04 | TRIG **D11**, ECHO **D12** (ileriye bakar) |
| MPU6050 | SDA → **A4**, SCL → **A5**, adres **0x68** |

Motorlar için ayrı güç kaynağı kullan ve sürücünün GND'sini Arduino GND'sine bağla. Pil takarken artıyı eksiyi ters bağlama.

### Program
```cpp
// sketch: gezgin_robot
#include <Wire.h>

const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;
const int TRIG = 11, ECHO = 12;
const int MPU = 0x68;

const float TIK_YOLU = 2 * PI * 0.033 / 20;     // m / tık
const float AKS = 0.12;                          // m
const float ALFA = 0.98;
const float DUYARLILIK = 65.5;                   // ±500 °/s

const float KAC_BASLA_CM = 25, KAC_BITIR_CM = 60;
const float BOLGE_X = 1.5, BOLGE_Y = 1.5;        // ziyaret edilecek bölgenin merkezi (m)
const float BOLGE_YAKIN = 0.15;                  // "geldim" mesafesi (m)
const unsigned long ARAMA_MS = 12000;            // önce ara, sonra bölgeye git

struct Oneri { bool aktif; int sol; int sag; };
enum Davranis { KAC, ZIYARET, DOLAS, DAVRANIS_SAYISI };
const char* DAVRANIS_ADI[] = {"KAC", "ZIYARET", "DOLAS"};

volatile long tikSol = 0, tikSag = 0;           // robot hiç geri gitmediği için tıklar hep ileri sayılır
long oncekiSol = 0, oncekiSag = 0;

float x = 0.3, y = 0.3;          // konum tahmini (m)
float yon = 0;                   // birleşik yönelim (derece, sola +)
float encYon = 0;                // yalnız enkoderden yönelim (derece)
float onCm = 400;
bool kaciyor = false, ziyaretEdildi = false;
unsigned long ziyaretSusma = 0;  // bu zamana kadar ZIYARET susar
unsigned long sonDongu = 0, sonOlcum = 0, sonYazdir = 0;
unsigned long donusBitis = 0, sonrakiDonus = 2000;
int donusYonu = 1;

void sayacSol() { tikSol++; }
void sayacSag() { tikSag++; }

void mpuYaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

float yawHizi() {
  Wire.beginTransmission(MPU);
  Wire.write(0x47);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int16_t ham = (Wire.read() << 8) | Wire.read();
  return ham / DUYARLILIK;
}

float mesafeOku() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 25000);
  if (sure == 0) return 400;
  return sure / 58.0;
}

void surus(int sol, int sag) {                 // 0 … 255: robot yalnız ileri gider
  sol = constrain(sol, 0, 255);
  sag = constrain(sag, 0, 255);
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

// Konum tahmini: 20 ms'de bir
void konumGuncelle() {
  unsigned long simdi = millis();
  float dt = (simdi - sonDongu) / 1000.0;
  sonDongu = simdi;

  noInterrupts();
  long s = tikSol, g = tikSag;
  interrupts();
  float dSol = (s - oncekiSol) * TIK_YOLU;
  float dSag = (g - oncekiSag) * TIK_YOLU;
  oncekiSol = s; oncekiSag = g;

  encYon += ((dSag - dSol) / AKS) * 180.0 / PI;              // enkoder yönelimi (mutlak)
  float gz = yawHizi();
  yon = ALFA * (yon + gz * dt) + (1 - ALFA) * encYon;

  float yol = (dSol + dSag) / 2;
  x += yol * cos(yon * PI / 180.0);
  y += yol * sin(yon * PI / 180.0);
}

float aciFarki(float hedefAci, float simdikiAci) {      // -180 … 180
  float f = hedefAci - simdikiAci;
  while (f > 180) f -= 360;
  while (f < -180) f += 360;
  return f;
}

Oneri kac() {
  Oneri o = {false, 0, 0};
  if (!kaciyor && onCm < KAC_BASLA_CM) {
    kaciyor = true;
    ziyaretSusma = millis() + 3000;            // engele takıldıysak 3 sn başka yöne bak
  }
  if (kaciyor && onCm > KAC_BITIR_CM) kaciyor = false;
  if (kaciyor) { o.aktif = true; o.sol = 0; o.sag = 190; }   // sol tekerlek üstünde sola dön
  return o;
}

Oneri ziyaret() {
  Oneri o = {false, 0, 0};
  if (ziyaretEdildi || millis() < ARAMA_MS || millis() < ziyaretSusma) return o;
  float mesafe = sqrt((BOLGE_X - x) * (BOLGE_X - x) + (BOLGE_Y - y) * (BOLGE_Y - y));
  if (mesafe < BOLGE_YAKIN) {
    ziyaretEdildi = true;
    Serial.print("t=");   Serial.print(millis());
    Serial.println(" BOLGE ZIYARET EDILDI");
    return o;
  }
  float hata = aciFarki(atan2(BOLGE_Y - y, BOLGE_X - x) * 180.0 / PI, yon);
  o.aktif = true;
  if (fabs(hata) > 30) {                       // yön çok yanlış: önce dön
    o.sol = hata > 0 ? 0 : 170;
    o.sag = hata > 0 ? 170 : 0;
  } else {                                     // yaklaşık doğru yön: giderken düzelt
    o.sol = 170 - 2 * hata;
    o.sag = 170 + 2 * hata;
  }
  return o;
}

Oneri dolas() {
  Oneri o = {true, 190, 190};
  unsigned long t = millis();
  if (t >= sonrakiDonus) {
    donusBitis = t + random(300, 800);
    donusYonu = random(2) ? 1 : -1;
    sonrakiDonus = donusBitis + random(1500, 3500);
  }
  if (t < donusBitis) {                        // bir tekerlek üstünde dön
    o.sol = donusYonu > 0 ? 0 : 190;
    o.sag = donusYonu > 0 ? 190 : 0;
  }
  return o;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpuYaz(0x6B, 0);
  mpuYaz(0x1B, 0x08);                      // ±500 °/s
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);
  randomSeed(11);
  sonDongu = millis();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonDongu >= 20) konumGuncelle();
  if (simdi - sonOlcum >= 60) { sonOlcum = simdi; onCm = mesafeOku(); }

  Oneri oneri[DAVRANIS_SAYISI];
  oneri[KAC]     = kac();
  oneri[ZIYARET] = ziyaret();
  oneri[DOLAS]   = dolas();

  int secilen = DOLAS;
  for (int i = 0; i < DAVRANIS_SAYISI; i++) {
    if (oneri[i].aktif) { secilen = i; break; }
  }
  surus(oneri[secilen].sol, oneri[secilen].sag);

  if (simdi - sonYazdir >= 5000) {
    sonYazdir = simdi;
    Serial.print("t=");   Serial.print(simdi / 1000);
    Serial.print(" x=");  Serial.print(x, 2);
    Serial.print(" y=");  Serial.print(y, 2);
    Serial.print(" yon="); Serial.print(yon, 0);
    Serial.print(" ");    Serial.println(DAVRANIS_ADI[secilen]);
  }
}
```

### Nasıl çalışıyor?
1. **Konum tahmini.** `konumGuncelle()` 20 ms'de bir çalışır. Tıklardan her tekerleğin yolunu, ikisinin ortalamasından robotun aldığı yolu bulur. Yönü 106. dersteki tamamlayıcı filtre verir: jiroskop akıcı, enkoder uzun vadede doğru. Yol ve yönelimle `x` ve `y` güncellenir.
2. **Davranışlar.** `kac()`, `ziyaret()` ve `dolas()` 107. dersteki gibi yalnız öneri döndürür. Hakem döngüsü ilk aktif öneriyi seçer.
3. **KAÇ'ın sabrı.** KAÇ başladığında `ziyaretSusma` 3 saniye ileri alınır. Aksi hâlde bölgeye giden robot, bölgenin önünde bir duvar varsa her seferinde aynı duvara dönüp KAÇ ile ZİYARET arasında gidip gelir. Bu 3 saniye DOLAŞ'a başka bir yöne gitme şansı verir.
4. **Yalnız ileri.** Robot hiç geri gitmez; dönerken bir tekerleği durdurur (`0`) diğerini sürer. Tek kanallı enkoder dönüş yönünü bilmediği için tıkları hep ileri sayabiliriz. Bir tekerleği geri döndürseydik motor hemen durmadığından tıkların işareti belirsizleşirdi.
5. **Ziyaret.** ZİYARET hedefe açıyı hesaplar (`atan2`). Açı farkı 30 dereceden büyükse bir tekerlek üstünde döner; küçükse düz giderken iki tekerlek arasındaki hız farkıyla düzeltir. Konum tahmini bölge merkezine 15 cm yaklaşınca bir kez "ziyaret edildi" yazar.

### Ölçüm
Robot 2 m x 2 m'lik bir arenada (0,3 m ; 0,3 m)'den başlar; jiroskopta 1 °/s sapma, sağ tekerlekte %3 yavaşlık, ultrasonikte 1 cm gürültü vardır. Arena 0,25 m'lik hücrelere bölünür (8 x 8 = 64 hücre); robotun izi hangi hücrelerden geçtiyse o hücre "ziyaret edildi" sayılır. 40 saniyelik koşuda ölçülenler:

| Ölçüt | Sonuç | Eşik |
|---|---|---|
| Kapsama (gezilen hücre oranı) | %58 (64 hücrenin 37'si) | en az %45 |
| Çarpma sayısı | 2 (aynı duvar temasında sayaç iki kez arttı) | en çok 3 |
| Duvara dayalı kalma süresi | yaklaşık 1,3 sn | 3 sn'den az |
| Bölge ziyareti | 16. saniyede, bölgenin 13 cm yakınında | 12-40 sn arası, 25 cm içinde |
| Konum tahmini hatası (ilk çarpmadan önce) | 4 cm'in altında | 10 cm |

Karşılaştırma için KAÇ'ı kapattık (eşiği 0 cm yaptık): robot ilk duvara dayanıp kalıyor; kapsama %28'e düşüyor ve 20 saniyeden fazla duvara dayalı kalıyor.

Çarpmanın bir yan etkisi de var: robot duvara dayalıyken benzetimde tekerlekler dönmeye devam eder, enkoder saymayı sürdürür ve konum tahmini kayar. Bu koşuda ilk çarpmadan sonra tahmin gerçekten yaklaşık 30 cm uzaklaştı. Konum tahmini, robotun nerede olduğunu çarpmayı sayabildiğin sürece bilir.

Eşikler bu koşuyu geçecek ama sınırda olmayacak biçimde seçildi. Rastgelelik (`random`) ve sensör gürültüsü nedeniyle her koşu biraz farklı çıkar; sensör gürültüsünün tohumunu değiştirdiğimiz diğer koşularda da kapsama %58-%64, çarpma 0-3 aralığındaydı.

### Dene
- `ARAMA_MS` değerini 25000 yap. Bölge ziyareti kaçıncı saniyede oluyor? Kapsama değişiyor mu?
- `BOLGE_X` ve `BOLGE_Y` değerlerini değiştir; bölgeyi arenanın köşesine yaklaştır (örn. 1,8 ; 0,2). Ziyaret hâlâ başarılı mı? Duvara yakın olduğu için KAÇ ile ZİYARET çatışır mı?
- `DOLAS`'taki `random(300, 800)` ve `random(1500, 3500)` aralıklarını değiştir. Kapsamayı artırmak için daha uzun düz yollar mı, daha sık dönüşler mi daha iyi?
- Dördüncü bir davranış tasarla: `SARJ` (süre dolunca başlangıç noktasına dön). Öncelik sırasında nereye koyarsın?

### Sık yapılan hatalar
- Konum tahminine mutlak güvenmek: çarpma ve tekerlek kayması sonrası tahmin bozulur. Ne kadar süre güvenebileceğini ölç.
- Başlangıç konumunu ve yönünü yanlış vermek: `x`, `y` ve `yon` başlangıç değerleri robotun gerçek konumuyla aynı olmalı.
- Yönelimi 0-360'a sarıp filtrelemek (106. ders); sadece hata hesabında sar.
- KAÇ için tek eşik kullanmak: robot eşiğin etrafında titrer; biri başlama, biri bitiş için iki eşik kullan.
- Bölgeye giderken KAÇ'ı atlamak: hedefe gitme isteği ne kadar güçlü olursa olsun çarpmamak önce gelir.

### Gerçek robotta farklı olabilecekler
Bu benzetimde zemin düzdür, tekerlekler kaymaz ve ultrasonik ışın tek bir doğrudur. Gerçek robotta tekerlek kayması konum tahminini çok daha çabuk bozar; ultrasonik ışın koni şeklindedir ve yumuşak ya da eğik yüzeylerden yansımayabilir. Ayrıca tek ışınlı sensör, duvara çok sığ bir açıyla yaklaşırken engeli geç görür. Bu koşudaki çarpma tam böyle oldu: robot 23. saniyede üst duvara yaklaşık 12 derecelik sığ bir açıyla yaklaşırken duvara değdi; o an sensör hâlâ 30 cm gösteriyordu (KAÇ eşiği 25 cm). Gerçek bir robotta yanlara da sensör ya da tampon eklersin. Konum tahminini zaman zaman bilinen bir noktaya göre düzeltmek (örn. çizgi ya da duvar yardımıyla) bu işte standart bir iyileştirmedir.

## Konuşalım
Robotun ne kadar iyi gezdiğini hangi sayıyla ölçersin: kapsama mı, çarpma mı, ikisinin birleşimi mi? Aynı robota bir de "pili az, şarj istasyonuna dön" davranışı eklenseydi, onu öncelik sırasında nereye koyar ve neden o sıraya koyardın?
