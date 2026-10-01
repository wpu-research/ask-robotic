# BMP280: basınç ve rakım (I2C)
süre: 25

## Merak
Akıllı saatler ve drone'lar hangi katta olduğunu ya da ne kadar yükseldiğini nasıl bilir? Havanın ağırlığına bakarak. Yükseldikçe üstündeki hava azalır ve hava basıncı düşer. Bir basınç sensörü bu yüzden aynı zamanda bir yükseklik ölçerdir. Bu derste BMP280 ile basıncı okuyacak, basınçtan rakım hesaplayacak ve neden "deniz seviyesi basıncı" ayarının önemli olduğunu göreceksin.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| BMP280 | VCC → 5V, GND → GND |
| | SDA → **A4**, SCL → **A5** |

BMP280, 33. derste öğrendiğin I2C ile konuşur. Adresi **0x76** ya da **0x77**'dir. Laboratuvarda parçayı seçince sağ panelde **I2C adresi** özelliğini görürsün (varsayılan 0x76); sensör çalışmıyorsa bu adres ile kodundaki adres aynı olmalı. Emin değilsen 33. dersteki adres tarama programını çalıştır. Sağ panelde ayrıca **Sıcaklık** ve **Basınç** (hPa) kaydırıcıları vardır; program çalışırken de değiştirilebilir.

Bilgi notu: Gerçek dünyada bazı çıplak BMP280 modülleri yalnızca 3,3 V ister (laboratuvar 5V ya da 3V3 ile besler); gerçek bir modülü bağlarken veri sayfasına bak. Adres gerçek modüllerde SDO bacağıyla seçilir. BME280 adlı kardeş sensör görünüşte aynıdır ama nem de ölçer; BMP280 kütüphanesi onu tanımayabilir.

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
1. `bmp.begin(0x76)` sensörü adresinden arar ve ayarlar. Kütüphanede varsayılan adres 0x77'dir. Bu yüzden 0x76'lık modülde parametresiz `bmp.begin()` çağırırsan sensör bulunamaz. Laboratuvarda da bunu denedik: BMP280'in adresini 0x77 yaptığımızda `begin(0x76)` "BMP280 bulunamadi" yazdırdı, parametresiz `begin()` ise sensörü buldu.
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

BMP280'in **Basınç** kaydırıcısını sırayla bu değerlere getirip laboratuvarda şunu ölçtük (P0 = 1013,25 hPa):

| Kaydırıcıdaki basınç | Ekranda | Formül | Kütüphane |
|---|---|---|---|
| 1013,25 hPa | 1013.2 hPa | 0,0 m | 0,0 m |
| 954,5 hPa | 954.5 hPa | 501,0 m | 501,0 m |
| 898,75 hPa | 898.8 hPa | 1000,1 m | 1000,1 m |

Bu basınçları formülü elle hesaplayarak seçtik: yaklaşık 954,5 hPa için 500 m, yaklaşık 898,75 hPa için 1000 m çıkıyor. Hem senin formülün hem kütüphane aynı sonucu verdi (ekrandaki 1013.2, sensörün basıncı 0,1 hPa'ya yuvarlayarak yazmasındandır). İki yöntem aynı sonucu verir; kütüphane de aynı formülü kullanıyor.

### P0 ayarı: neden önemli?
Deniz seviyesindeki basınç sabit değildir; hava durumuyla değişir. Bugün 1013 hPa olan P0 yarın 1003 hPa olabilir. Formülde `P0`'ı yanlış verirsen **bulunduğun yerin rakımı kayar**. Bu kaymanın büyüklüğünü laboratuvarda ölçtük: Basınç kaydırıcısı 1000 hPa iken `P0`'ı 1013,25'ten 1003,25'e indirmek rakımı 110,9 m'den 27,4 m'ye düşürdü; fark yaklaşık 84 m. Yani deniz seviyesine yakın yerlerde **1 hPa yaklaşık 8 m**'ye denk gelir.

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

Bu program açılışta bir kez ayar yapar: o anki basıncı "şu an rakım 100 m" kabul eder. Sonrasında basınç değişirse rakım değişir. Bu bir hata değil; sensör yükseklik ile hava değişimini ayıramaz. Laboratuvarda 1000 hPa iken ayar yaptık (P0 = 1011,9 hPa, rakım 100,0 m); basınç kaydırıcısını 999 hPa'ya çekince rakım 108,4 m oldu, yani yaklaşık 8 m arttı. Gerçek bir odada rakımı ölçerken sonuç sabit kalmıyorsa nedeni çoğunlukla havanın kendisidir.

### Dene
- `bmp_oku` çalışırken BMP280'i seç ve **Sıcaklık** ile **Basınç** kaydırıcılarını oynat. Seri çıktıdaki sıcaklık, basınç ve rakım nasıl değişiyor?
- `bmp_rakim_formul` programında `P0_HPA` değerini 1003,25 yap. Rakım ne kadar kayıyor? Yukarıdaki "1 hPa yaklaşık 8 m" kuralıyla uyuşuyor mu?
- Sensörün I2C adresini 0x77 yap (önce ■) ve `bmp.begin(0x76)` ile çalıştır. Ne yazıyor? Sonra kodu `bmp.begin(0x77)` yap.
- `bmp_p0_ayar` programındaki `BILINEN_RAKIM` değerini 300 yap. Sonra çalışırken basınç kaydırıcısını 2 hPa düşür: rakım kaç metre değişti? Gerçek bir yerde bir saat sonra rakım okuması neden değişebilir?

### Sık yapılan hatalar
- Adresi unutmak: sensör 0x76 iken `begin()` (varsayılan 0x77) ile "bulunamadi" almak.
- Pa ile hPa'yı karıştırmak: `readAltitude` hPa bekler. `readAltitude(101325)` yazarsan sonuç çok yanlış çıkar.
- SDA ve SCL'yi ters bağlamak: sensör hiç bulunamaz. 33. dersteki tarama programı yardımcı olur.
- Sensör bulunamadığında okumaya devam etmek: anlamsız sayılar yazdırır.
- Rakımı "kesin" saymak: hava değişince `P0` da değişir. Gerçek ölçüm doğruluğu için veri sayfasına bak.

## Konuşalım
Bir drone sensörün verdiği rakımı yükseklik tutmak için kullanıyor. Hava durumu değişince rakım okuması kayarsa drone'un davranışını nasıl etkiler? "Şu andan itibaren ne kadar yükseldim?" sorusunu cevaplamak için `P0` yerine hangi değeri kullanırdın?
