# Sensör birleştirme: enkoder + IMU
süre: 30

## Merak
Robotunu masada yerinde 10 kez döndürdün. Enkoderlere göre tam 3600 derece döndü ve yönü hâlâ doğru. Jiroskop ise "3650 derece" diyor. Hangisine inanacaksın? Aslında ikisine de biraz inanacaksın: biri yavaş yavaş sapar ama akıcıdır, öbürü sapmaz ama kaba adımlarla ilerler. Bu derste ikisini tek bir yön tahmininde birleştireceksin.

## Etkinlik
### Devre
Sürüş ve enkoder bağlantıları Modül 5'in standart bağlantılarıdır; MPU6050 I2C üzerinden bağlanır.

| Parça | Bağlantı |
|---|---|
| Sol motor (sürücü) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Sağ motor (sürücü) | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Sol enkoder | **D2** (kesme pini) |
| Sağ enkoder | **D3** (kesme pini) |
| MPU6050 | SDA → **A4**, SCL → **A5**, VCC → 5 V (GY-521 gibi regülatörlü kartlarda), GND → GND; adres **0x68** |

Motorlar için ayrı bir güç kaynağı kullan ve motor sürücüsünün GND'sini Arduino GND'sine bağla (ortak GND). Pil takarken artıyı eksiyi ters bağlama, uçları birbirine değdirme.

### Neden iki sensör?
İki yön kaynağın var:

| Kaynak | İyi yanı | Kötü yanı |
|---|---|---|
| **Enkoder yönelimi** (odometri, 94. ders) | Zamanla sapmaz: yönelim sayılan tıklardan hesaplanır | Kaba adımlıdır: bir tık yaklaşık 1 cm tekerlek yolu demektir, yönelimde yaklaşık 5 derece |
| **Jiroskop** (yaw hızı `gz`) | Akıcıdır, küçük dönüşleri de görür | Hız ölçer; yönelim için toplarsın (integral). Küçük bir sapma (bias) her saniye birikir |

Enkoderden yönelim: sağ ve sol tekerleğin aldığı yolun farkını aks aralığına bölersin.

```
yönelim (rad) = (sağ yol − sol yol) / aks aralığı
```

Burada bir tık = 2π · 0,033 / 20 ≈ 1,04 cm tekerlek yoludur (yarıçap 3,3 cm, devirde 20 yuva); aks aralığı 0,12 m'dir. Tek bir tık yönelimi yaklaşık 5 derece oynatır. Bu yüzden enkoder yönelimi merdiven gibi ilerler.

### Önce jiroskop ölçeği
MPU6050 varsayılan olarak ±250 °/s ölçer. Bundan hızlı dönersen ham değer sınıra yapışır (doyar) ve gerçekte daha hızlı döndüğünü göremezsin. Ders 59'da gördüğün gibi çözüm, GYRO_CONFIG yazmacına (adres **0x1B**) bir ölçek yazmaktır:

| 0x1B değeri | Tam ölçek | Duyarlılık (LSB / (°/s)) |
|---|---|---|
| `0x00` | ±250 °/s | 131 |
| `0x08` | ±500 °/s | 65,5 |
| `0x10` | ±1000 °/s | 32,8 |
| `0x18` | ±2000 °/s | 16,4 |

Ölçek büyüdükçe doymaz ama ince ayrıntı azalır. Aşağıdaki program robotu tam güçle yerinde döndürür ve aynı dönüşü üç ölçekle okur.

```cpp
// sketch: jiroskop_olcek
#include <Wire.h>

const int MPU = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;

float duyarlilik = 131.0;   // LSB / (°/s); ±250 için 131
int16_t sonHam = 0;

void yaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

void olcekSec(byte secim) {          // 0: ±250, 1: ±500, 2: ±1000, 3: ±2000
  const float tablo[] = {131.0, 65.5, 32.8, 16.4};
  yaz(0x1B, secim << 3);             // GYRO_CONFIG: ölçek bitleri 3-4
  duyarlilik = tablo[secim];
}

float yawHizi() {                    // °/s, sola dönüş +
  Wire.beginTransmission(MPU);
  Wire.write(0x47);                  // GYRO_ZOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  sonHam = (Wire.read() << 8) | Wire.read();
  return sonHam / duyarlilik;
}

void raporla(const char* ad) {
  float gz = yawHizi();
  Serial.print("olcek ");
  Serial.print(ad);
  Serial.print(" gz=");
  Serial.print(gz, 1);
  Serial.println((sonHam >= 32767 || sonHam <= -32768) ? " DOYDU" : " tamam");
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  yaz(0x6B, 0);                      // uyku modundan çık
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);

  digitalWrite(SOL_IN1, LOW);  digitalWrite(SOL_IN2, HIGH);   // sol tekerlek geri
  digitalWrite(SAG_IN1, HIGH); digitalWrite(SAG_IN2, LOW);    // sağ tekerlek ileri
  analogWrite(SOL_EN, 255);
  analogWrite(SAG_EN, 255);          // yerinde sola dönüş, tam güç
  delay(1500);                       // motorlar hızlansın

  olcekSec(0); delay(50); raporla("+-250");
  olcekSec(1); delay(50); raporla("+-500");
  olcekSec(2); delay(50); raporla("+-1000");

  analogWrite(SOL_EN, 0);
  analogWrite(SAG_EN, 0);
}

void loop() {
}
```

### Nasıl çalışıyor?
1. `olcekSec()` 0x1B yazmacına `secim << 3` yazar; ölçek bitleri yazmacın 3. ve 4. bitlerindedir. Duyarlılığı da tablodan alır.
2. `yawHizi()` GYRO_ZOUT_H (0x47) adresinden iki bayt okur ve duyarlılığa böler.
3. Ham değer 32767'ye (ya da −32768'e) dayanmışsa ölçek yetmiyor demektir; program bunu `DOYDU` diye işaretler.
4. Robot ±250 ölçeğinde gerçekte yaklaşık 380 °/s döner ama okuma yaklaşık 250 °/s'de takılır. ±500 ölçeğinde gerçek değer görünür.

Doymuş bir jiroskopla yönelim toplarsan sürekli eksik toplarsın. Bu hata sapmadan farklıdır: robot hızlı döndükçe artar. Robotun en hızlı dönüşünü bil ve ölçeği ona göre seç.

### Şimdi birleştirme: tamamlayıcı filtre
102. derste ivmeölçer ve jiroskobu tamamlayıcı filtreyle birleştirmiştin. Aynı fikir burada da çalışır: jiroskop kısa vadede, enkoder uzun vadede güvenilir olsun.

```
yönelim = α · (yönelim + gz · dt) + (1 − α) · enkoderYönelimi
```

`α = 0,98` ve `dt = 0,02` s ise filtre yaklaşık 1 saniyelik bir zaman sabitine sahiptir: jiroskop ani dönüşleri akıcı verir, enkoder da yönelimi yavaşça kendi değerine çeker. Jiroskop sapması saniyede `b` derece ise birleşik yönelimde kalan hata yaklaşık `b · 1 s` olur (bu ayarda).

Program robotu 24 saniye boyunca sırayla sola döndürüp, ileri sürüp, daha yavaş sağa döndürüp, ileri sürer; sonunda robot gerçekte yaklaşık 330 derece sola bakar. Jiroskop 2 °/s sapmalıdır. Program üç yönelimi birlikte yazdırır: yalnız jiroskop, yalnız enkoder ve birleşik.

```cpp
// sketch: sensor_birlestirme
#include <Wire.h>

const int MPU = 0x68;
const int SOL_EN = 5, SOL_IN1 = 7, SOL_IN2 = 8;
const int SAG_EN = 6, SAG_IN1 = 9, SAG_IN2 = 10;
const int ENK_SOL = 2, ENK_SAG = 3;

const float TIK_YOLU = 2 * PI * 0.033 / 20;   // bir tıkta tekerlek yolu (m)
const float AKS = 0.12;                        // aks aralığı (m)
const float ALFA = 0.98;
const float DUYARLILIK = 65.5;                 // ±500 °/s ölçeği
const unsigned long DONGU_MS = 20;

volatile long tikSol = 0, tikSag = 0;
volatile int yonSol = 1, yonSag = 1;           // sürüş yönü: tık +1 ya da −1 sayılır

float yonJiro = 0;        // yalnız jiroskop (derece)
float yonBirlesik = 0;    // tamamlayıcı filtre (derece)
unsigned long sonDongu = 0, sonYazdir = 0;
bool bitti = false;

void sayacSol() { tikSol += yonSol; }
void sayacSag() { tikSag += yonSag; }

void mpuYaz(byte yazmac, byte deger) {
  Wire.beginTransmission(MPU);
  Wire.write(yazmac);
  Wire.write(deger);
  Wire.endTransmission(true);
}

float yawHizi() {         // °/s, sola dönüş +
  Wire.beginTransmission(MPU);
  Wire.write(0x47);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int16_t ham = (Wire.read() << 8) | Wire.read();
  return ham / DUYARLILIK;
}

float enkoderYonelimi() { // derece
  noInterrupts();
  long s = tikSol, g = tikSag;
  interrupts();
  float rad = (g - s) * TIK_YOLU / AKS;
  return rad * 180.0 / PI;
}

void surus(int sol, int sag) {          // -255 … 255
  yonSol = sol >= 0 ? 1 : -1;
  yonSag = sag >= 0 ? 1 : -1;
  digitalWrite(SOL_IN1, sol >= 0); digitalWrite(SOL_IN2, sol < 0);
  digitalWrite(SAG_IN1, sag >= 0); digitalWrite(SAG_IN2, sag < 0);
  analogWrite(SOL_EN, abs(sol));
  analogWrite(SAG_EN, abs(sag));
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpuYaz(0x6B, 0);
  mpuYaz(0x1B, 0x08);                   // ±500 °/s
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(ENK_SOL, INPUT_PULLUP); pinMode(ENK_SAG, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENK_SOL), sayacSol, RISING);
  attachInterrupt(digitalPinToInterrupt(ENK_SAG), sayacSag, RISING);
  sonDongu = millis();
}

void loop() {
  unsigned long simdi = millis();

  if (!bitti) {                          // 3 sn'lik aşamalar: sol dön, ileri, sağ dön, ileri
    int asama = (simdi / 3000) % 4;
    if (simdi >= 24000) { surus(0, 0); bitti = true; }
    else if (asama == 0) surus(-150, 150);
    else if (asama == 2) surus(120, -120);
    else surus(150, 150);
  }

  if (simdi - sonDongu >= DONGU_MS) {
    float dt = (simdi - sonDongu) / 1000.0;
    sonDongu = simdi;
    float gz = yawHizi();
    yonJiro += gz * dt;
    yonBirlesik = ALFA * (yonBirlesik + gz * dt) + (1 - ALFA) * enkoderYonelimi();
  }

  if (simdi - sonYazdir >= 1000 && (simdi < 24000 || simdi >= 25000)) {
    sonYazdir = simdi - (simdi % 1000);
    Serial.print("t=");        Serial.print(simdi / 1000);
    Serial.print(" jiro=");     Serial.print(yonJiro, 1);
    Serial.print(" enk=");      Serial.print(enkoderYonelimi(), 1);
    Serial.print(" birlesik="); Serial.println(yonBirlesik, 1);
  }
}
```

### Nasıl çalışıyor?
1. Kesme işlevleri tıkları `yonSol` / `yonSag` ile toplar. Bu tek kanallı enkoder dönüş yönünü ayırt edemez; yönü biz sürüş komutundan biliriz.
2. `surus()` hem motorları sürer hem tıkların işaretini ayarlar. Geri giden tekerlek tıkları eksiye sayar.
3. Her 20 ms'de bir `dt` gerçek geçen süreden hesaplanır (103. derste gördüğün sabit periyot fikri), jiroskop okunur ve iki yönelim güncellenir.
4. `yonJiro` yalnız jiroskop integralidir. `yonBirlesik` ise her adımda enkoder yönelimine doğru hafifçe çekilir.
5. Yönelimler açı birikimi olarak yazılır: 360 derece geçince sıfıra sarmaz (örn. iki tam tur sola = +720). Bu, karşılaştırmayı kolaylaştırır.

Ölçümde (2 °/s sapma, 0,4 °/s gürültü) 24 saniye sonunda gerçek yönelimle fark şöyle çıkar: yalnız jiroskop yaklaşık 50 derece kayar; birleşik yönelim birkaç dereceyle gerçeğe yakın kalır. Enkoder yönelimi de gerçeğe yakındır ama adımlıdır; hatası, tek bir tıkın oynattığı yaklaşık 5 derece mertebesindedir.

### Dene
- `ALFA` değerini 0,9 ve 0,995 yap. Hangisi jiroskop sapmasını daha çok bastırıyor? Hangisinde yönelim daha akıcı?
- Başlangıçta robot dururken 1 saniye boyunca `gz` ortalamasını al ve sonraki okumalardan çıkar. Sapma ne kadar azalıyor?
- `mpuYaz(0x1B, 0x08)` satırını sil (varsayılan ±250). Robot 150 PWM ile döndüğünde yaklaşık 180 °/s'dedir; yine doyar mı? `jiroskop_olcek` programındaki tam güç ile karşılaştır.

### Sık yapılan hatalar
- Ölçeği değiştirip bölen sayıyı değiştirmemek: 65,5 yerine 131 kullanırsan açılar yarı değerde çıkar.
- `dt` sabit sanıp gerçek süreyi ölçmemek: `loop()` bir tur yavaşlarsa integral eksik toplar.
- Enkoder tıklarını sürüş yönüne bakmadan hep artırmak: geri giden tekerlek de ileri sayılır, yönelim bozulur.
- Yönelimi 0-360'a sarıp sonra filtrelemek: 359 ile 1 derece arasındaki fark 358 görünür. Sarma işlemini filtreden sonra yap.
- Jiroskop sapmasını hiç ölçmemek: dururken `gz` sıfır olmalıdır. Değilse sapma vardır.

### Gerçek robotta farklı olabilecekler
Bu benzetimde tekerlekler kaymaz; bu yüzden enkoder yönelimi çok iyidir. Gerçek robotta tekerlek kayması ve tekerlek çapı hatası enkoder yönelimini de zamanla saptırır; yani ikisi de tam güvenilir değildir. Tek kanallı enkoder yön bilmez; yön değiştirdiğin anda motor hemen durmadığı için birkaç tık yanlış işaretle sayılabilir. Gerçek MPU6050'nin sapması sıcaklıkla değişir. Gerçek değerler için veri sayfasına bak ve dururken kendi ölçümünü yap.

## Konuşalım
Robot hiç dönmeden düz bir yolda gidiyorsa, hangi yönelim kaynağına daha çok güvenirsin? Tekerlekleri kayan ıslak bir zeminde bu seçim nasıl değişir?
