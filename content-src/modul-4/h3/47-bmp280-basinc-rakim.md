# BMP280: basınç ve rakım (I2C)
süre: 25

## Merak
Akıllı saatler ve drone'lar hangi katta olduğunu ya da ne kadar yükseldiğini nasıl bilir? Havanın ağırlığına bakarak. Yükseldikçe üstündeki hava azalır ve hava basıncı düşer. Bir basınç sensörü bu yüzden aynı zamanda bir yükseklik ölçerdir. Bu derste BMP280 ile basıncı okuyacak, basınçtan rakım hesaplayacak ve neden "deniz seviyesi basıncı" ayarının önemli olduğunu göreceksin.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| BMP280 modülü | VCC → 5 V (modülün gerilim aralığını kontrol et), GND → GND |
| | SDA → **A4**, SCL → **A5** |

BMP280, 33. derste öğrendiğin I2C ile konuşur. Adresi çoğu modülde **0x76** ya da **0x77**'dir; hangisi olduğu modüldeki SDO bacağının ya da lehim köprüsünün durumuna bağlıdır. Emin değilsen 33. dersteki adres tarama programını çalıştır.

Uyarılar: Bazı çıplak modüller yalnızca 3,3 V ile çalışır. Modülünün üzerindeki yazıya ve veri sayfasına bak, 5 V vermeden önce emin ol. Ayrıca BME280 adlı kardeş sensör görünüşte aynıdır ama nem de ölçer; modülünün etiketine bak, BMP280 kütüphanesi onu tanımayabilir.

### Yeni kavramlar
- **Basınç birimi:** Kütüphane basıncı **Pascal (Pa)** olarak verir. Hava durumunda **hPa** (hektopaskal) kullanılır: 1 hPa = 100 Pa. Deniz seviyesinde standart basınç yaklaşık 101 325 Pa, yani **1013,25 hPa**'dır.
- **Rakım:** Bulunduğun yerin deniz seviyesinden yüksekliği (metre).
- **Rakım formülü:** Basınçtan yükseklik hesaplamak için yaygın kullanılan yaklaşık bir formül:

`rakım = 44330 · (1 − (P / P0) ^ (1 / 5,255))`

Burada `P` ölçtüğün basınç, `P0` ise **deniz seviyesinde şu anki basınç**tır. İkisi aynı birimde olmalıdır (ikisi de hPa ya da ikisi de Pa). Formül standart atmosfer varsayımına dayanır; bu yüzden birkaç yüz metrelik farklarda iyi, çok yüksekte ise yaklaşık bir sonuç verir.

### Program 1: basınç, sıcaklık ve kütüphanenin rakımı
```cpp
// sketch: bmp_oku
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
bool bmpHazir = false;

void setup() {
  Serial.begin(9600);
  bmpHazir = bmp.begin(0x76);          // modülün adresi 0x77 ise burayı değiştir
  if (!bmpHazir) {
    Serial.println("BMP280 bulunamadi");
  }
}

void loop() {
  delay(1000);
  if (!bmpHazir) {
    return;                            // sensör yoksa okuma yapma
  }
  float sicaklik = bmp.readTemperature();         // santigrat
  float hpa = bmp.readPressure() / 100.0;         // Pa -> hPa
  float rakim = bmp.readAltitude(1013.25);        // P0 hPa cinsinden

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 1);
  Serial.print(" C  Basinc: ");
  Serial.print(hpa, 1);
  Serial.print(" hPa  Rakim: ");
  Serial.print(rakim, 1);
  Serial.println(" m");
}
```

### Nasıl çalışıyor?
1. `bmp.begin(0x76)` sensörü adresinden arar ve ayarlar. Kütüphanede varsayılan adres 0x77'dir. Bu yüzden 0x76'lık modülde parametresiz `bmp.begin()` çağırırsan sensör bulunamaz. Benzetimde de bunu denedik: `begin()` başarısız oldu, `begin(0x76)` başarılı oldu.
2. `readPressure()` Pa verir. hPa için 100'e bölersin.
3. `readAltitude(1013.25)` yukarıdaki formülü senin yerine hesaplar. Parametre, deniz seviyesi basıncı `P0`'dır ve **hPa** cinsinden verilir.
4. `bmpHazir` bayrağı hata yolunu kurar: sensör bulunamazsa program "BMP280 bulunamadi" yazar ve okumaya hiç kalkışmaz.

### Program 2: formülü kendin hesapla
Kütüphanenin fonksiyonuna güvenmek yerine formülü sen de yaz; iki sonucu yan yana koyup karşılaştır.

```cpp
// sketch: bmp_rakim_formul
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
const float P0_HPA = 1013.25;          // deniz seviyesi basinci, hPa

float rakimHesapla(float pHpa, float p0Hpa) {
  return 44330.0 * (1.0 - pow(pHpa / p0Hpa, 1.0 / 5.255));
}

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 bulunamadi");
  }
}

void loop() {
  delay(1000);
  float hpa = bmp.readPressure() / 100.0;
  Serial.print("Basinc: ");
  Serial.print(hpa, 1);
  Serial.print(" hPa  Formul: ");
  Serial.print(rakimHesapla(hpa, P0_HPA), 1);
  Serial.print(" m  Kutuphane: ");
  Serial.print(bmp.readAltitude(P0_HPA), 1);
  Serial.println(" m");
}
```

Sabit basınçlarda benzetimde şunu ölçtük (P0 = 1013,25 hPa):

| Sensörün basıncı | Ekranda | Formül | Kütüphane |
|---|---|---|---|
| 101 325 Pa | 1013.2 hPa | 0,0 m | 0,0 m |
| 95 461 Pa | 954.6 hPa | 500,1 m | 500,1 m |
| 89 875 Pa | 898.8 hPa | 1000,1 m | 1000,1 m |

Bu basınçları formülü elle hesaplayarak seçtik: 95 461 Pa için 500 m, 89 875 Pa için 1000 m çıkıyor. Hem senin formülün hem kütüphane bu değerleri 0,1 m içinde tutturdu. İki yöntem aynı sonucu verir; kütüphane de aynı formülü kullanıyor.

### P0 ayarı: neden önemli?
Deniz seviyesindeki basınç sabit değildir; hava durumuyla değişir. Bugün 1013 hPa olan P0 yarın 1003 hPa olabilir. Formülde `P0`'ı yanlış verirsen **bulunduğun yerin rakımı kayar**. Bu kaymanın büyüklüğünü hesapladık: 1000 hPa basınçta `P0`'ı 1013,25'ten 1003,25'e indirmek rakımı yaklaşık 84 m değiştirir. Yani deniz seviyesine yakın yerlerde **1 hPa yaklaşık 8 m**'ye denk gelir.

Bu yüzden iki kullanım var:
- Rakımı mutlak değer olarak istiyorsan, o günkü deniz seviyesi basıncını (hava durumu verisi) `P0` olarak ver.
- Rakımın gerçek değerini zaten biliyorsan, formülü tersine çevir ve `P0`'ı kendin bul:

`P0 = P / (1 − rakım / 44330) ^ 5,255`

```cpp
// sketch: bmp_p0_ayar
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
const float BILINEN_RAKIM = 100.0;     // metre: bulundugun yerin gercek rakimi
float p0 = 1013.25;

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 bulunamadi");
    return;
  }
  float hpa = bmp.readPressure() / 100.0;
  p0 = hpa / pow(1.0 - BILINEN_RAKIM / 44330.0, 5.255);
  Serial.print("P0: ");
  Serial.print(p0, 1);
  Serial.println(" hPa");
}

void loop() {
  delay(1000);
  Serial.print("Rakim: ");
  Serial.print(bmp.readAltitude(p0), 1);
  Serial.println(" m");
}
```

Bu program açılışta bir kez ayar yapar: o anki basıncı "şu an rakım 100 m" kabul eder. Sonrasında basınç değişirse rakım değişir. Bu bir hata değil; sensör yükseklik ile hava değişimini ayıramaz. Benzetimde basınç ayardan sonra 1 hPa düşünce rakım yaklaşık 8 m arttı. Bir odada rakımı ölçerken sonuç sabit kalmıyorsa nedeni çoğunlukla havanın kendisidir.

### Dene
- `bmp_oku` programında sensörü ele al ya da üstüne nazikçe üfle. Sıcaklık ve basınç değişiyor mu?
- `bmp_rakim_formul` programında `P0_HPA` değerini 1003,25 yap. Rakım ne kadar kayıyor? Yukarıdaki "1 hPa yaklaşık 8 m" kuralıyla uyuşuyor mu?
- Bulunduğun yerin gerçek rakımını bir harita uygulamasından öğren, `bmp_p0_ayar` programındaki `BILINEN_RAKIM` değerini düzelt. Bir saat sonra rakım okuması aynı mı?

### Sık yapılan hatalar
- Adresi unutmak: 0x76 modülde `begin()` ile "bulunamadi" almak.
- Pa ile hPa'yı karıştırmak: `readAltitude` hPa bekler. `readAltitude(101325)` yazarsan sonuç çok yanlış çıkar.
- SDA ve SCL'yi ters bağlamak: sensör hiç bulunamaz. 33. dersteki tarama programı yardımcı olur.
- Sensör bulunamadığında okumaya devam etmek: anlamsız sayılar yazdırır.
- Rakımı "kesin" saymak: hava değişince `P0` da değişir. Gerçek ölçüm doğruluğu için veri sayfasına bak.

## Konuşalım
Bir drone sensörün verdiği rakımı yükseklik tutmak için kullanıyor. Hava durumu değişince rakım okuması kayarsa drone'un davranışını nasıl etkiler? "Şu andan itibaren ne kadar yükseldim?" sorusunu cevaplamak için `P0` yerine hangi değeri kullanırdın?
