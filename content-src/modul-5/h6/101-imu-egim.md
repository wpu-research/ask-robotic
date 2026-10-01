# IMU ile eğim ölçümü
süre: 20

## Merak
Telefonunu yan çevirince ekran döner. Bir drone rüzgârda yatınca kendini toparlar. İki tekerlekli bir robot ise tam ayakta dururken bile sürekli devrilmek ister: üstü ağırdır ve tekerleklerin üzerinde durur. Bunların hepsinde küçük bir çip "ben şu an kaç derece yatıyorum?" sorusuna cevap verir. Bu hafta o çipi kullanıp kendini dengeleyen bir robot yapacaksın. Önce tek bir şeyi öğrenmelisin: eğimi nasıl ölçeceğini.

## Etkinlik
### Bu hafta
- **101:** MPU6050 ile eğimi ölç (bu ders).
- **102:** İvmeölçer ve jiroskobu birleştir (tamamlayıcı filtre).
- **103:** Kontrol döngüsünü sabit periyotla çalıştır.
- **104:** Kaskad PID: iç döngü açıyı, dış döngü konumu tutar.
- **105:** Proje: kendini dengeleyen robot.

**Önemli:** Bu hafta robot bir **benzetimdir** (ters sarkaç modeli). Derslerdeki kazanç sayıları (`0,15`, `0,02` gibi) benzetimdeki robota aittir. Gerçek bir robotta motor, tekerlek, ağırlık ve pil farklıdır; aynı kodu çalıştırırsan robot büyük olasılıkla ya ayakta durmaz ya da titrer. Gerçek robotta kazançları baştan, küçük değerlerden başlayarak yeniden ayarlarsın. Kodun yapısı (ölçme, filtre, sabit döngü, PID) ise aynen geçerlidir.

### Devre
Modül 5'in standart bağlantıları geçerli. Bu derste yalnız IMU kullanılıyor; motorlar 104'te devreye girecek.

| Parça | Bağlantı |
|---|---|
| MPU6050 modülü (GY-521 gibi) | SDA → **A4**, SCL → **A5**, GND → GND, VCC → modülün belgesinde yazan gerilim (çoğu modülde 5 V, üzerinde regülatör vardır), AD0 → GND (adres 0x68) |
| Motorlar (sonraki derslerde) | Sol EN **D5**, IN1 **D7**, IN2 **D8**; sağ EN **D6**, IN3 **D9**, IN4 **D10**. Motorlara harici güç ver ve GND'leri birleştir |

Sensörü robota, **X ekseni ileri**, **Z ekseni yukarı** bakacak ve **Y ekseni tekerlek eksenine paralel** olacak biçimde tespit et. Robot ileri eğilince açı pozitif olsun diye benzetimde de böyle varsayıyoruz. Gerçek sensörünü başka yöne monte edersen işaretleri çevirmen gerekir.

### Eğim iki yoldan ölçülür
1. **İvmeölçer yerçekimini ölçer.** Robot hareketsizken sensör yalnız yerçekimini görür. Robot θ kadar ileri eğilirse X ekseni yerçekiminin sin θ kadarını, Z ekseni cos θ kadarını (g cinsinden) görür. O hâlde `θ = atan2(ax, az)`.
2. **Jiroskop dönme hızını ölçer** (derece/saniye). Hız açı değildir; açıyı bulmak için hızı zamanla toplamak gerekir. Bunu 102'de yapacağız.

Ders 58-59'daki ham `Wire` okumasını hatırla: önce `0x6B` yazmacına 0 yazıp sensörü uyandırırsın, sonra `0x3B` yazmacından başlayarak 14 bayt okursun: ax, ay, az, sıcaklık, gx, gy, gz. Her değer 16 bit işaretlidir ve **yüksek bayt önce** gelir. Varsayılan ölçekte ivme 16384 sayı/g, jiroskop 131 sayı/(°/s) verir.

Bir dikkat noktası: robot düşerken hızlı döner. Varsayılan jiroskop aralığı ±250 °/s'dir; daha hızlı dönüşte değer sınırda takılır (doyar) ve ölçüm yanlış olur. Benzetimdeki robot düşerken en çok yaklaşık 200 °/s'ye çıkıyor, yani sınıra çok yakın; bir itme ya da gerçek bir robotun daha hızlı devrilmesi sınırı aşar. Bu yüzden `0x1B` yazmacına `0x08` yazıp aralığı ±500 °/s yapıyoruz. Bu aralıkta ölçek 65,5 sayı/(°/s) olur; çözünürlükten az bir şey kaybederiz ama taşma payı kazanırız.

### Program: eğimi ve dönme hızını yazdır
```cpp
// sketch: imu_olcum
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float RAD_DERECE = 57.2958;     // 180 / pi
const float JIRO_OLCEK = 65.5;        // ±500 °/s aralığında sayı / (°/s)
const float IVME_OLCEK = 16384.0;     // ±2 g aralığında sayı / g

int16_t oku16() {                     // iki bayttan işaretli sayı, yüksek bayt önce
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  Wire.beginTransmission(MPU_ADRES);  // sensörü uyandır
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Wire.beginTransmission(MPU_ADRES);  // jiroskop aralığı ±500 °/s
  Wire.write(0x1B);
  Wire.write(0x08);
  Wire.endTransmission(true);
}

void loop() {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);                   // ilk veri yazmacı: ax
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14, true);

  int16_t axHam = oku16();
  oku16();                            // ay: kullanmıyoruz
  int16_t azHam = oku16();
  oku16();                            // sıcaklık
  oku16();                            // gx
  int16_t gyHam = oku16();
  oku16();                            // gz

  float ax = axHam / IVME_OLCEK;
  float az = azHam / IVME_OLCEK;
  float aci = atan2(ax, az) * RAD_DERECE;   // ivmeölçerden eğim (derece)
  float hiz = gyHam / JIRO_OLCEK;           // jiroskoptan dönme hızı (°/s)

  Serial.print(millis());
  Serial.print(',');
  Serial.print(aci, 1);
  Serial.print(',');
  Serial.println(hiz, 1);
  delay(50);
}
```

### Nasıl çalışıyor?
1. `oku16()` iki baytı tek bir işaretli sayıya çevirir. Bayt sırasını ayrı satırlarda okuyoruz; iki `Wire.read()` çağrısını aynı ifadede yazarsan hangisinin önce çalışacağı C++'ta garanti değildir.
2. `atan2(ax, az)` radyan verir. `57,2958` ile çarparak dereceye çeviriyoruz.
3. `ax` ve `az` g cinsindendir: ham sayıyı `16384.0` ile bölüyoruz. Noktalı yazmak önemli, aksi hâlde tam sayı bölmesi olur.
4. `hiz` pozitifse robot ileri doğru dönüyordur, yani açı artıyordur.

### Ölçümde gördüklerimiz
Sensörü benzetimde 20° yatık sabit tuttuk: program `aci` olarak 20,0 civarı, `hiz` olarak 0 civarı yazdı. Sonra robotu motorsuz, 3° eğik bıraktık: robot kendiliğinden devrilir ve açı yaklaşık 0,7 saniyede 45°'yi geçer. Bu sırada ivmeölçerden okunan açı, gerçek açıyı 4°'den az farkla izledi ve dönme hızı pozitif tarafta yaklaşık 200 °/s'ye kadar çıktı. Yani devrilmek saniyenin altında bir iştir; kontrolün bundan çok daha hızlı çalışması gerekir (103).

### Program: robot dururken jiroskop sıfırı göstermeli
Hareketsiz bir jiroskop teorik olarak 0 °/s okur. Gerçekte küçük bir sabit değer okur: buna **sapma** (bias) denir. Sapma küçük görünse de hızı toplayınca (açıya çevirince) sürekli büyür; bunu 102'de göreceksin. Çözüm: açılışta robot hareketsizken çok sayıda ölçüm alıp ortalamasını sapma olarak kaydetmek ve sonraki okumalardan çıkarmak.

```cpp
// sketch: gyro_sifir
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float JIRO_OLCEK = 65.5;        // ±500 °/s
const int ORNEK_SAYISI = 500;

float jiroSapma = 0;                  // °/s

int16_t oku16() {
  uint8_t yuksek = Wire.read();
  uint8_t alcak = Wire.read();
  return (int16_t)(((uint16_t)yuksek << 8) | alcak);
}

float jiroOku() {                     // gy, °/s
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x43);                   // gx yazmacı
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 6, true);
  oku16();                            // gx
  int16_t gyHam = oku16();
  oku16();                            // gz
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

  float toplam = 0;
  for (int i = 0; i < ORNEK_SAYISI; i++) {   // robot HAREKETSIZ olmalı
    toplam += jiroOku();
    delay(2);
  }
  jiroSapma = toplam / ORNEK_SAYISI;
  Serial.print("Sapma: ");
  Serial.println(jiroSapma, 2);
}

void loop() {
  float hiz = jiroOku() - jiroSapma;  // sapması çıkarılmış hız
  Serial.print("Hiz: ");
  Serial.println(hiz, 2);
  delay(100);
}
```

Benzetimde jiroskobu 1,8 °/s sapmalı yaptık. Program `Sapma: 1.80` yazdı ve sonraki `Hiz:` satırları 0'a çok yakın (±0,05 °/s) çıktı. Aynı bilgi gerçek sensörlerde de geçerlidir: sapma sensörden sensöre ve sıcaklıkla değişir, o yüzden her açılışta yeniden ölçülür. Robotu açarken elinde tutma; masaya koy ve kıpırdatma.

### Dene
- `0x1B` yazmacına `0x00` yaz (±250 °/s) ve `JIRO_OLCEK`'i 131 yap. Gerçek bir sensörü elinle hızlıca çevir. Hız değerleri bir noktada takılıyor mu? (Yalnız benzetimle bunu göremezsin: orada hız ≈ 200 °/s'yi geçmiyor.)
- İvmeölçer açısını yalnız `ax` ile hesapla: `asin(ax)`. Küçük açılarda `atan2` ile farkı var mı? 60°'de fark ne kadar?
- Robotu elinle sallayarak hareket ettir. İvmeölçer açısı sabit tutarken mi, hareket ederken mi daha çok bozuluyor?

### Sık yapılan hatalar
- Açıyı radyan bırakmak: `atan2` radyan verir; dereceye çevirmeden `0,15` gibi derece cinsinden kazançlar yanlış çalışır.
- `axHam / 16384` yazmak: iki tam sayının bölmesi küsuratı atar. `16384.0` yaz.
- Jiroskop aralığını değiştirip ölçeği değiştirmemek: ±500 °/s için 65,5 kullan, 131 değil. Hız yarıya iner ya da iki katına çıkar.
- Sapmayı ölçerken robotu tutmak ya da sallamak: sapma yanlış çıkar ve sonraki ölçümlerin hepsine bulaşır.
- `atan2(az, ax)` yazmak: argümanların sırası önemli. Burada ilk argüman sin θ ile orantılı olan `ax`'tir.

### Gerçek robotta farklı olabilecekler
Gerçek ivmeölçer motor titreşimini de ölçer ve çıktısı gürültülü olur; benzetimdeki ilk iki ölçüm ise temiz veriyle yapıldı. Bunu bir sonraki derste ele alıyoruz. Gerçek sensörün yönü, ölçek hatası ve sıcaklık etkisi de farklı olabilir.

## Konuşalım
İvmeölçer yerçekimine bakarak açı buluyor. Robot hızla ileri doğru hızlanırken (motor itince) ivmeölçerin göreceği şey sence yalnız yerçekimi olur mu? Açı ölçümü bundan nasıl etkilenir?
