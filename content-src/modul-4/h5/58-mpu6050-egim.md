# MPU6050: ivmeölçer ve eğim açısı (I2C)
süre: 30

## Merak
Telefonunu yan çevirdiğinde ekran kendiliğinden döner. Cihazın içinde "yukarısı neresi" sorusuna cevap veren küçük bir çip var. Bu çip yer çekimini ölçer. Masada yatan telefon da yer çekimini ölçer; eğik tutulan da. Aradaki fark, çekimin hangi eksene ne kadar düştüğüdür. Bu farktan bir açı çıkarabilir miyiz?

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| MPU6050 modülü (GY-521 gibi) VCC | 5 V (modülün üzerindeki yazıya bak; çoğunda regülatör vardır) |
| MPU6050 GND | GND |
| MPU6050 SDA | **A4** |
| MPU6050 SCL | **A5** |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |

I2C'yi 33. derste öğrendin: iki hat (SDA, SCL) üzerinde birçok cihaz, her birinin bir adresi var. MPU6050'nin adresi **0x68**'dir; modüldeki AD0 pinini 5 V'a bağlarsan 0x69 olur. DS3231 saat modülü de 0x68 kullanır, bu yüzden bu haftanın devresinde saat modülü bulunmasın.

### Yazmaçlar: kütüphanesiz okuma
Bu derste hazır bir kütüphane kullanmayacağız; çipin kendisiyle konuşacağız. Böylece 33. derste gördüğün `Wire` komutlarının gerçekte ne işe yaradığını görürsün. MPU6050'nin içi **yazmaç** (register) denen numaralı hücrelerden oluşur. İşimize yarayanlar:

| Yazmaç | Anlamı |
|---|---|
| 0x6B | Güç yönetimi. Çip açılışta uyku modundadır. Buraya 0 yazınca uyanır. |
| 0x3B'den başlayan 14 bayt | Ivme X, Y, Z (2'şer bayt) · sıcaklık (2 bayt) · jiroskop X, Y, Z (2'şer bayt) |

Her ölçüm **16 bitlik işaretli** bir sayıdır ve önce yüksek bayt gelir. Yani iki baytı `(yuksek << 8) | dusuk` ile birleştirip `int16_t` olarak tutmak gerekir.

Varsayılan ayarda çipin ölçüm aralıkları şunlardır:

- İvmeölçer: ±2 g. Ham değeri g'ye çevirmek için **16384'e** bölersin (16384 LSB/g).
- Jiroskop: ±250 °/s. Ham değeri °/s'ye çevirmek için **131'e** bölersin (131 LSB/(°/s)).
- Sıcaklık: `ham / 340 + 36,53` derece (veri sayfasındaki formül).

g, dünyanın yer çekimi ivmesidir: masada duran çip, yukarı bakan ekseninde yaklaşık 1 g ölçer.

### Program 1: Ham veriyi oku ve çevir
```cpp
// sketch: mpu_ham
#include <Wire.h>

const int MPU = 0x68;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);                 // güç yönetimi yazmacı
  Wire.write(0);                    // 0 yaz: uyan
  Wire.endTransmission(true);
}

void loop() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);                 // okumaya başlanacak yazmaç
  Wire.endTransmission(false);      // bağlantıyı bırakma (tekrar başlat)
  Wire.requestFrom(MPU, 14, true);  // 14 bayt iste

  int16_t ax = oku16();
  int16_t ay = oku16();
  int16_t az = oku16();
  int16_t sicak = oku16();
  int16_t gx = oku16();
  int16_t gy = oku16();
  int16_t gz = oku16();

  Serial.print("HAM ax=");
  Serial.print(ax);
  Serial.print(" ay=");
  Serial.print(ay);
  Serial.print(" az=");
  Serial.println(az);

  Serial.print("g ax=");
  Serial.print(ax / 16384.0, 2);
  Serial.print(" ay=");
  Serial.print(ay / 16384.0, 2);
  Serial.print(" az=");
  Serial.print(az / 16384.0, 2);
  Serial.print(" | dps gx=");
  Serial.print(gx / 131.0, 1);
  Serial.print(" gy=");
  Serial.print(gy / 131.0, 1);
  Serial.print(" gz=");
  Serial.print(gz / 131.0, 1);
  Serial.print(" | C=");
  Serial.println(sicak / 340.0 + 36.53, 1);

  delay(500);
}
```
Çipi masaya düz koy: `az` yaklaşık 1,00 g çıkmalı, `ax` ve `ay` sıfıra yakın olmalı. Çipi bir kenarı üstüne dikince 1 g başka bir eksene geçer. Elinle döndürürken `gx`, `gy`, `gz` değişir; durunca sıfıra yakın döner (tam sıfır değil, bir sonraki ders bunu anlatıyor).

### Eğim açısı
Çip durağanken ölçtüğü tek şey yer çekimidir: yaklaşık 1 g'lik bir **vektör**. Çipi eğdikçe bu vektör eksenlere farklı oranlarda dağılır. X ekseni yukarı kalkınca `ax` artar, `az` küçülür. Üçgeni düşün: yatay kenar `az`, dikey kenar `ax`. Açı, bu iki kenarın arctanjantıdır:

```cpp
pitch = atan2(ax, az) * 180.0 / PI;   // öne-arkaya eğim
roll  = atan2(ay, az) * 180.0 / PI;   // yana eğim
```
`atan2(y, x)` iki kenardan açıyı **radyan** olarak verir. 180/π ile çarpınca derece olur. Örnek: `ax = 0,5`, `az = 0,866` ise `atan2(0,5; 0,866) = 30°` (0,5 = sin 30°, 0,866 = cos 30°).

Pitch ve roll'un hangi yöne artı olduğu, çipi kartına nasıl yerleştirdiğine bağlıdır. Modülün üzerinde basılı X ve Y oklarına bak. Bu derste tek eksende eğim varsayıyoruz; iki eksen aynı anda çok eğilirse bu basit formüller birbirini biraz etkiler.

### Program 2: Pitch, roll ve su terazisi
```cpp
// sketch: mpu_egim
#include <Wire.h>

const int MPU = 0x68;
const int LED = 13;

float ax, ay, az;

int16_t oku16() {
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void ivmeOku() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6, true);   // yalnız ivme: 6 bayt
  ax = oku16() / 16384.0;
  ay = oku16() / 16384.0;
  az = oku16() / 16384.0;
}

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
}

void loop() {
  ivmeOku();
  float pitch = atan2(ax, az) * 180.0 / PI;
  float roll = atan2(ay, az) * 180.0 / PI;

  digitalWrite(LED, (abs(pitch) < 2.0 && abs(roll) < 2.0) ? HIGH : LOW);   // terazi

  Serial.print("pitch=");
  Serial.print(pitch, 1);
  Serial.print(" roll=");
  Serial.println(roll, 1);
  delay(200);
}
```

### Nasıl çalışıyor?
1. Çip açılışta uykudadır. `0x6B` yazmacına 0 yazmadan okursan anlamlı veri gelmez.
2. `beginTransmission` + `write(0x3B)` + `endTransmission(false)` "şu yazmaçtan okuyacağım" demektir. `requestFrom` ise art arda gelen baytları ister. Çip her bayttan sonra yazmaç numarasını kendiliğinden bir artırır; bu yüzden tek istekle 14 bayt gelir.
3. Baytlar iki iki birleştirilir: yüksek bayt 8 bit sola kaydırılır, düşük bayt eklenir. `int16_t` türü işareti doğru yorumlar (negatif eğim negatif sayı olur).
4. 16384'e bölmek ham sayıyı g'ye çevirir. Örnek: ham 8192 → 0,5 g.
5. `atan2` açıyı verir. Düz durumda `ax = 0`, `az = 1` olduğu için `pitch = 0`.
6. LED, iki açı da ±2° içindeyse yanar: dijital bir su terazisi.

### Dene
- Çipi masaya koy. `pitch`, `roll` ne çıkıyor? Tam 0,0 çıkmıyorsa bu hata mı? (Yanıt: çipin lehimlenme açısı ve ölçüm hatası yüzünden küçük bir kayma normaldir.)
- Çipi hızla salla. Açı nasıl davranıyor? Çip hareket ediyorken ölçtüğü şey yalnız yer çekimi mi?
- LED'in yanma aralığını ±5° yap, sonra ±0,5° yap. Hangisi daha kullanışlı?

### Sık yapılan hatalar
- `0x6B` yazmacına 0 yazmayı unutmak: çip uykuda kalır.
- Baytları `int` olarak birleştirip işaretsiz bırakmak: negatif eğim 65000 gibi bir sayıya döner. `int16_t` kullan.
- `ax / 16384` yazmak: iki tam sayının bölümü tam sayıdır. `16384.0` yaz.
- `atan2` sonucunu dereceye çevirmeyi unutmak: sonuç radyandır.
- Çipin hareketli olduğu an ölçülen açıya güvenmek: ivmeölçer yer çekimini ve çipin kendi hızlanmasını ayıramaz. Çipi yatay yönde hızlandırırsan (örneğin `ax = 0,3 g`, `az = 1 g` olacak şekilde) `atan2` yaklaşık 16,7° verir, oysa çip eğilmemiştir.
- MPU6050 ile DS3231'i aynı hatta bağlamak: ikisi de 0x68 adresini kullanır.

## Konuşalım
Telefonun yatay ve dikey durumunu ivmeölçerle anlıyor. Peki bir bisikletin viraj açısını ya da bir drone'un eğimini yalnız ivmeölçerle ölçmek neden sorun çıkarır? Sallanan bir tren vagonunda yer çekimi vektörüne ne olur?
