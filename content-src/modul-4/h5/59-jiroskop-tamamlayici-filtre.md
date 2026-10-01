# Jiroskop sapması ve tamamlayıcı filtre
süre: 30

## Merak
58. derste ivmeölçerle eğim açısını bulduk. Ama çip sarsılınca (58. dersteki `ax = 0,3 g` deneyi) açı çıldırdı. Jiroskop ise "ne kadar hızlı dönüyorum" der ve hareket anında harika çalışır. İki sensör var, ikisi de kusurlu. Birini diğerinin eksiğini kapatacak şekilde birleştirebilir miyiz?

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla. Devre 58. dersin MPU6050 bölümüyle aynı; LED gerekmez.

| Parça | Bağlantı |
|---|---|
| MPU6050 VCC | 5V |
| MPU6050 GND | GND |
| MPU6050 SDA | **A4** |
| MPU6050 SCL | **A5** |

### Jiroskop ne ölçer?
İvmeölçer açıyı doğrudan verir. Jiroskop ise **dönüş hızını** (°/s) verir. Açıyı bulmak için hızı zamanla toplarız: bir saniye boyunca 10 °/s dönüyorsan 10° dönmüşsün demektir. Bunu küçük adımlarla yaparız:

```cpp
aci = aci + hiz * dt;     // hiz: °/s, dt: son ölçümden bu yana geçen saniye
```
Buna **integral** almak denir. Bu hafta pitch (öne-arkaya eğim) çipin Y ekseni etrafındaki dönüşüdür. Bu yüzden jiroskoptan `gy` değerini kullanacağız.

Not: Gerçek MPU6050'de +Y etrafındaki bir dönüş, 58. dersteki `atan2(ax, az)` açısını genelde azaltır; yani iki işaret ters çıkabilir. O durumda `gy`'nin işaretini çevirirsin (aşağıdaki "Sık yapılan hatalar"a bak). Laboratuvarda ivme ve jiroskop özellikleri birbirinden bağımsızdır; tutarlı değerleri sen seçersin.

### Sapma (bias): durağanken sıfır değil
Çip hareketsiz dururken `gy` tam sıfır olmalı, değil mi? Değil. Gerçek çipler küçük bir sabit değer gösterir (tipik olarak birkaç °/s; veri sayfası başlangıç sapması için ±20 °/s'ye kadar tolerans verir, kesin değer için çipinin veri sayfasına bak). Buna **sapma** (bias) denir. Değeri çipten çipe değişir, sıcaklıkla da kayabilir.

Sapmayı bulmak kolaydır: çip **kıpırdamıyorken** yüzlerce ölçüm al ve ortalamasını hesapla. O ortalama sapmadır. Sonra her ölçümden sapmayı çıkar.

Laboratuvardaki sanal çipin jiroskop özellikleri varsayılan olarak 0'dır, yani sapması yoktur. Gerçek bir çipin sapmasını taklit etmek için ▶'e basmadan önce MPU6050'nin **Jiroskop Y** özelliğini 2 yap.

### Program 1: Sapmayı ölç ve çıkar
```cpp
// sketch: mpu_sapma_olc
#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;
float sapmaGy = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);                 // Y ekseni jiroskop (yüksek bayt)
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;               // °/s
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;         // durağan ortalama = sapma
  Serial.print("Sapma gy = ");
  Serial.print(sapmaGy, 2);
  Serial.println(" derece/sn");
}

void loop() {
  float gy = gyOku();
  Serial.print("gy ham=");
  Serial.print(gy, 1);
  Serial.print(" duzeltilmis=");
  Serial.println(gy - sapmaGy, 1);
  delay(500);
}
```
▶'e bastıktan sonra ilk bir saniye (sapma ölçülürken) özellikleri değiştirme. Önce `Sapma gy = 2.00` satırını görürsün. Sonra **Jiroskop Y**'yi 32 yap (30 °/s'lik gerçek dönüş + 2 °/s sapma): `duzeltilmis` yaklaşık 30 gösterir. 2'ye geri döndüğünde `duzeltilmis` sıfıra yakın olur.

### Açıyı jiroskopla toplarsak: sapma birikir
Şimdi bir deney yapalım. Çip sabit duruyor; ama jiroskop 2 °/s gibi küçük bir sapma gösteriyor olsun. Açıyı integral ile bulursak:

- 1 saniyede: 2 × 1 = 2° kayma
- 10 saniyede: 2 × 10 = **20° kayma**
- 1 dakikada: 120° kayma

Çip hiç hareket etmedi ama hesaplanan açı gerçekten uzaklaştı. Her ölçüm çok küçük bir hata ekler, hataları toplayınca büyür. Sapmayı ölçüp çıkarsan bile geriye kalan küçük bir hata (sapma zamanla ya da ısıyla değişebilir) yine birikir.

### Program 2: İntegralin kayması
```cpp
// sketch: mpu_integral
#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;

float sapmaGy = 0;
float gyroHam = 0;                  // sapma çıkarılmadan integral
float gyroDuz = 0;                  // sapma çıkarılarak integral
unsigned long sonUs = 0;
unsigned long baslaMs = 0;
unsigned long sonYazMs = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;
}

float ivmeAci() {                   // 58. ders: pitch = atan2(ax, az)
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);
  int axH = Wire.read(); int axL = Wire.read();
  int ayH = Wire.read(); int ayL = Wire.read();
  int azH = Wire.read(); int azL = Wire.read();
  float ax = (int16_t)((axH << 8) | axL) / 16384.0;
  float az = (int16_t)((azH << 8) | azL) / 16384.0;
  return atan2(ax, az) * 180.0 / PI;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;

  gyroHam = ivmeAci();              // başlangıç açısı: ivmeölçerden
  gyroDuz = gyroHam;
  sonUs = micros();
  baslaMs = millis();
  sonYazMs = baslaMs;
}

void loop() {
  float gy = gyOku();

  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;     // saniye
  sonUs = simdi;

  gyroHam += gy * dt;
  gyroDuz += (gy - sapmaGy) * dt;

  if (millis() - sonYazMs >= 1000) {
    sonYazMs += 1000;
    Serial.print("t=");
    Serial.print((millis() - baslaMs) / 1000.0, 1);
    Serial.print(" ham=");
    Serial.print(gyroHam, 1);
    Serial.print(" duz=");
    Serial.print(gyroDuz, 1);
    Serial.print(" acc=");
    Serial.println(ivmeAci(), 1);
  }
  delay(10);
}
```
Çipi eğik ve sabit tutmak için ▶'e basmadan önce **Jiroskop Y = 2**, **İvme X = 0,17**, **İvme Z = 0,98** yap (yaklaşık 10°). Seri monitöre bak: `acc` hep aynı kalır (laboratuvar sensörü gürültüsüzdür). `ham` zamanla yürür gider. `duz` ise sapma çıkarıldığı için sabit kalır; sapma sonradan değişirse (aşağıdaki Dene'de göreceksin) yalnızca kalan küçük hata kadar kayar.

### İvmeölçerin sorunu: gürültü ve titreşim
İvmeölçer kaymaz. Çip aynı eğimde duruyorsa sonsuza kadar aynı açıyı söyler. Ama yer çekimi dışındaki her ivmeyi de ölçer: motor titreşimi, elin sarsıntısı, yürüyen bir robotun sekmesi. (Laboratuvar çipi bu gürültüyü kendiliğinden üretmez; titreşimi, İvme X'i hızlıca değiştirerek sen yaparsın.) 58. dersteki gibi `ax`'e fazladan 0,3 g eklenirse açı 16,7° sapar. Yani ivmeölçer:

- **Uzun vadede doğru** (kaymaz), **kısa vadede gürültülü**.

Jiroskop ise tam tersi:

- **Kısa vadede doğru** (hızlı değişimi iyi yakalar), **uzun vadede kayar** (sapma birikir).

### Tamamlayıcı filtre
İki sensör birbirinin eksiğini tamamlar. Fikir: açıyı jiroskopla güncelle (hızlı, sakin), ama her adımda ivmeölçerin açısına doğru küçük bir çekme uygula (kaymayı durdurur):

```
aci = α · (aci + gy · dt) + (1 − α) · accAci
```
- `aci + gy · dt`: önceki açıya jiroskopun gördüğü dönüşü ekler.
- `accAci`: ivmeölçerden atan2 ile bulunan açı.
- `α` (alfa): jiroskopa ne kadar güveneceğin. Genelde **0,98**. Yani her adımda %98 jiroskop, %2 ivmeölçer.

Bu çok küçük %2'lik çekme, saniyede yüz adım atılan bir döngüde biriktiği için kaymayı durdurur. Sürekli hatayı düzelten küçük bir "geri çekme" gibi düşün. Titreşimli ivmeölçer ise hep %2 ağırlıkta girdiği için gürültüsü süzülür.

`dt = 10 ms` ve `α = 0,98` iken filtrenin düzeltme hızı (zaman sabiti) yaklaşık `α · dt / (1 − α) = 0,98 · 0,01 / 0,02 ≈ 0,5 s` kadardır. Yani yanlış başlasa bile filtre birkaç yarım saniyede doğru açıya oturur.

### Program 3: Tamamlayıcı filtre
```cpp
// sketch: mpu_tamamlayici
#include <Wire.h>

const int MPU = 0x68;
const int ORNEK = 200;
const float ALFA = 0.98;

float sapmaGy = 0;
float aci = 0;                      // filtreli açı
float saf = 0;                      // karşılaştırma: yalnız jiroskop integrali
unsigned long sonUs = 0;
unsigned long baslaMs = 0;
unsigned long sonYazMs = 0;

float gyOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x45);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 2, true);
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  int16_t ham = (int16_t)((yuksek << 8) | dusuk);
  return ham / 131.0;
}

float ivmeAci() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);
  int axH = Wire.read(); int axL = Wire.read();
  int ayH = Wire.read(); int ayL = Wire.read();
  int azH = Wire.read(); int azL = Wire.read();
  float ax = (int16_t)((axH << 8) | axL) / 16384.0;
  float az = (int16_t)((azH << 8) | azL) / 16384.0;
  return atan2(ax, az) * 180.0 / PI;
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);

  float toplam = 0;
  for (int i = 0; i < ORNEK; i++) {
    toplam += gyOku();
    delay(5);
  }
  sapmaGy = toplam / ORNEK;

  aci = ivmeAci();
  saf = aci;
  sonUs = micros();
  baslaMs = millis();
  sonYazMs = baslaMs;
}

void loop() {
  float gy = gyOku() - sapmaGy;
  float acc = ivmeAci();

  unsigned long simdi = micros();
  float dt = (simdi - sonUs) / 1000000.0;
  sonUs = simdi;

  saf += gy * dt;
  aci = ALFA * (aci + gy * dt) + (1.0 - ALFA) * acc;

  if (millis() - sonYazMs >= 200) {
    sonYazMs += 200;
    Serial.print("t=");
    Serial.print((millis() - baslaMs) / 1000.0, 1);
    Serial.print(" acc=");
    Serial.print(acc, 1);
    Serial.print(" saf=");
    Serial.print(saf, 1);
    Serial.print(" filtre=");
    Serial.println(aci, 1);
  }
  delay(10);
}
```

### Nasıl çalışıyor?
1. `setup` içinde 200 ölçümün ortalaması sapma olarak saklanır; çip bu sırada kıpırdamamalıdır.
2. Başlangıç açısı ivmeölçerden alınır, çünkü integral yalnız **değişimi** bilir, başlangıç açısını bilmez.
3. `loop` her turda `dt`'yi `micros()` farkından hesaplar. Sabit 0,01 yazmak yerine gerçek geçen süreyi kullanmak, `delay` ve I2C süreleri değişse bile doğru integral verir.
4. `saf` yalnız jiroskopu toplar. `aci` ise formülü uygular. Seri Ekran'da ikisini yan yana görürsün.
5. Sabit eğimde ve sapma sonradan değiştiğinde (örneğin çalışırken Jiroskop Y'yi 2'den 4'e çıkardın): `acc` sabit kalır, `saf` yavaşça kayar (sapmayı çıkardıktan sonra kalan küçük hata yüzünden), `filtre` ise sakin ve doğru kalır.
6. İvme özelliklerini hızlıca oynatıp titreşim yaparsan `acc` zıplar, `filtre` ise jiroskop ağırlıklı olduğu için çok az oynar. Gerçek bir dönüşte (ivme ve jiroskop birlikte değişince) `filtre` jiroskop sayesinde hemen tepki verir.

Filtrenin tam doğru olmadığına da dikkat et. Jiroskopta ölçtüğünle gerçek arasında hâlâ küçük bir hata kalırsa (sapma değiştiyse), `filtre` doğru değerin birazcık yanında durur. Hata `α · hata · dt / (1 − α)` kadardır. Örneğin kalan hata 2 °/s, `dt = 0,01 s`, `α = 0,98` ise yaklaşık 1° olur. Yalnız jiroskop kullansan aynı hata 10 saniyede 20° olurdu.

### Dene
- `ALFA` değerini 0,90 yap. İvme X'i hızlıca 0,17 ile 0,35 arasında oynat: `filtre` daha çok mu, daha az mı oynuyor? Hızlı hareketi daha iyi mi yakalıyor?
- `ALFA` değerini 0,999 yap. Filtrenin doğru açıya oturması neden çok yavaşlıyor? (Zaman sabiti yaklaşık 0,999 · 0,01 / 0,001 ≈ 10 saniyedir.)
- Çip eğikken başlat: ▶'e basmadan önce İvme X = 0,5, İvme Z = 0,87 (yaklaşık 30°). Çalışırken İvme X'i 0, İvme Z'yi 1 yap. `filtre` ve `saf` birbirinden nasıl ayrılıyor? (`saf` yalnız jiroskopa bakar, ivmeölçerin yeni durumunu görmez.)
- Sapma sonradan değişsin: çalışırken Jiroskop Y'yi 2'den 4'e çıkar. `saf` ile `filtre` 10 saniyede ne kadar kayıyor?

### Sık yapılan hatalar
- Sapmayı ölçerken (programın ilk saniyesinde) çip hareket ediyormuş gibi özellikleri değiştirmek, ya da gerçek bir çipi tutmak/masaya vurmak: sapma yanlış ölçülür, her şey kayar.
- Sapmayı hiç çıkarmamak: `saf` ve hatta `filtre` küçük bir sabit hata taşır.
- `dt` değerini sabit yazıp gerçek süreyi kullanmamak: `delay` ya da yazdırma süresi değişince integral yanlış çıkar.
- Birimleri karıştırmak: `gy` °/s, `dt` saniye olmalı. Milisaniye yazarsan 1000 kat büyük kayma görürsün.
- `α` değerini 1'e çok yakın seçmek: ivmeölçer neredeyse hiç etkili olmaz, kayma geri gelir.
- `atan2` ile bulunan açı ve jiroskop dönüşünün işaretlerini ters almak: filtre açıyı bir yöne iterken öbür yöne çeker. İşaret ters çıkarsa `gy` değerinin işaretini değiştir.

## Konuşalım
Telefonlarda ve dronelarda bu fikir (iki sensörü birleştirmek) her yerde kullanılır. Daha gelişmiş filtreler (Kalman filtresi gibi) aynı problemi daha akıllı çözer. Sence "iki kusurlu sensörü birleştirmek" neden tek mükemmel sensör aramaktan daha mantıklı?
