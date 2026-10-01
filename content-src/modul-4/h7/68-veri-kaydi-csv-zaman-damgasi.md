# Veri kaydı: CSV ve zaman damgası
süre: 30

## Merak
Bir hafta boyunca odanın sıcaklığını kaydettin. Şimdi bunun grafiğini çizmek istiyorsun: gece mi soğuyor, öğleden sonra mı ısınıyor? Bunun için verinin bir tabloya girmesi gerekir, yani her satırda "ne zaman, kaç derece, nem yüzde kaç". Bu tablo dosyasının en basit hali **CSV**'dir. Bu derste Arduino'dan her bilgisayar programının açabileceği düzgün satırlar çıkarmayı öğreneceksin.

## Etkinlik
### Devre
| Parça | Bağlantı |
|---|---|
| DHT22 | Veri → **D5** (46. dersteki gibi), VCC → 5 V, GND → GND |
| RTC modülü (DS3231) | SDA → **A4**, SCL → **A5**, VCC → 5 V, GND → GND |
| SD kart modülü | CS → **D10**, MOSI → **D11**, MISO → **D12**, SCK → **D13** (yalnız son program) |

Yalnız Serial'e yazan programlarda SD modülü bağlamana gerek yok.

### CSV ve zaman damgası
**CSV** (Comma-Separated Values, virgülle ayrılmış değerler) düz bir metin dosyasıdır. Her satır bir kayıttır, sütunlar virgülle ayrılır. İlk satır sütun adlarını taşır:

```
zaman,sicaklik_C,nem_yuzde
2026-03-14 08:30:00,23.5,55.0
2026-03-14 08:30:05,23.5,55.1
```

İlk sütun **zaman damgasıdır**: ölçümün hangi anda yapıldığı. Biçimi `yıl-ay-gün saat:dakika:saniye` seçtik. Bu, ISO 8601 adlı uluslararası tarih biçimine uygundur ve iki işe yarar. Birincisi, her yerde aynı okunur (03.04.2026 yazısını bir ülke 3 Nisan, başka bir ülke 4 Mart diye okur). İkincisi, **alfabetik sıralama zaman sıralamasıdır**: önce yıl, sonra ay, sonra gün geldiği için satırları metin olarak sıralasan bile zaman sırasına dizilir. Bunun çalışması için ay, gün, saat gibi alanların hep iki haneli (`03`, `08`) yazılması gerekir.

### Satırı üreten fonksiyon: donanımdan bağımsız
Satır biçimlemeyi SD karttan, RTC'den, DHT'den ayrı bir fonksiyona koyuyoruz:

`String satirOlustur(DateTime t, float sicak, float nem)`

Fonksiyon bir zaman ve iki sayı alır, bir yazı döndürür. Hiçbir donanıma dokunmaz. Bu yüzden sabit değerlerle kolayca denenir: önce fonksiyonun doğru satır ürettiğinden emin ol, sonra gerçek sensörlere bağla. (SD'ye yazarken de aynı fonksiyonu kullanacağız.)

```cpp
// sketch: csv_fonksiyon
#include <RTClib.h>

String ikiHane(int n) {                  // 5 -> "05"
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {                   // 23.5 -> "23.5" (bir ondalık, nokta ile)
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);                         // yeri baştan ayır
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);   // okuma başarısızsa alan boş kalır
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

void setup() {
  Serial.begin(9600);
  Serial.println("zaman,sicaklik_C,nem_yuzde");
  Serial.println(satirOlustur(DateTime(2026, 3, 14, 8, 30, 5), 23.5, 55.0));
  Serial.println(satirOlustur(DateTime(2026, 12, 1, 0, 0, 0), -2.5, 100.0));
  Serial.println(satirOlustur(DateTime(2026, 7, 9, 23, 59, 59), NAN, NAN));
}

void loop() {
}
```

Çıktı şöyle olur:

```
zaman,sicaklik_C,nem_yuzde
2026-03-14 08:30:05,23.5,55.0
2026-12-01 00:00:00,-2.5,100.0
2026-07-09 23:59:59,,
```

Üçüncü satırda sensör okunamamış gibi davranıldı (`NAN`, sayı değil). Zaman damgası yazılır, sensör sütunları boş bırakılır. Boş alan CSV'de "değer yok" demektir ve sütunlar kaymaz.

### Canlı veri: RTC + DHT22
Şimdi fonksiyonu gerçek donanıma bağlayalım. Her 5 saniyede bir RTC'den zamanı, DHT22'den sıcaklık ve nemi okuyup satırı Serial'e yazıyoruz. DHT22'yi iki okuma arasında en az yaklaşık 2 saniye beklemelisin; 5 saniye rahat bir aralıktır.

```cpp
// sketch: csv_satir
#include <Wire.h>
#include <RTClib.h>
#include <DHT.h>

const int DHT_PIN = 5;
const unsigned long OLCUM_ARALIGI = 5000;   // ms

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
unsigned long sonOlcum = 0;
bool ilkOlcum = true;

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

void setup() {
  Serial.begin(9600);
  rtc.begin();
  dht.begin();
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();
  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {
    ilkOlcum = false;
    sonOlcum = simdi;
    float sicak = dht.readTemperature();
    float nem = dht.readHumidity();
    Serial.println(satirOlustur(rtc.now(), sicak, nem));
  }
}
```

`satirOlustur` aynen aynı kaldı; yalnızca `loop()` ona gerçek değerleri veriyor. Serial Monitor'daki satırları kopyalayıp `VERI.CSV` adıyla kaydedersen tablo programlarında açabilirsin.

### Ondalık ayırıcı ve Excel
CSV'de virgül sütunları ayırır. Peki ondalık sayıyı da virgülle (`23,5`) yazarsan? Satır `...,23,5,55,0` olur ve bir program onu 5 sütun sanır. Ondalık ayırıcı ülkeden ülkeye değişir: bizde virgül, birçok ülkede nokta. Bilgisayarının dil ayarına göre tablo programı da farklı bekler. Genel kural:

- **Nokta ondalık + virgül ayraç** (`23.5,55.0`): programlama dünyasında ve İngilizce ayarlı programlarda standarttır.
- **Virgül ondalık + noktalı virgül ayraç** (`23,5;55,0`): Türkçe ayarlı bir bilgisayarda Excel'in çoğu zaman beklediği biçimdir.

Hangisinin sende çalıştığını kendi bilgisayarında denemen gerekir; çünkü bu ayar Excel sürümüne ve bölgesel ayarlara bağlıdır. Dosyayı çift tıklayarak açmak yerine tablo programının "metinden/CSV'den içe aktar" özelliğini kullanıp ayracı kendin seçmek de bir yoldur.

İkinci biçimi üretmek için fonksiyon değişir, ama mantık aynıdır:

```cpp
// sketch: csv_tr
#include <RTClib.h>

const char AYRAC = ';';                    // Türkçe Excel'in sütun ayracı

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayiTR(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  String s(tampon);
  s.replace('.', ',');                     // ondalık ayırıcı virgül
  return s;
}

String satirOlusturTR(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += AYRAC;
  if (!isnan(sicak)) s += sayiTR(sicak);
  s += AYRAC;
  if (!isnan(nem)) s += sayiTR(nem);
  return s;
}

void setup() {
  Serial.begin(9600);
  Serial.println("zaman;sicaklik_C;nem_yuzde");
  Serial.println(satirOlusturTR(DateTime(2026, 3, 14, 8, 30, 5), 23.5, 55.0));
  Serial.println(satirOlusturTR(DateTime(2026, 12, 1, 0, 0, 0), -2.5, 100.0));
}

void loop() {
}
```

### Aynı satırı SD karta yaz
Son adımda satırı hem Serial'e hem SD karta yazıyoruz. 67. derste öğrendiğin gibi her satırda dosyayı açıp yazıp kapatıyoruz. Dosya yeniyse (`SD.exists` ile kontrol) önce başlık satırını yazıyoruz. SD kart takılı değilse program durmuyor, yalnız Serial'e yazmaya devam ediyor.

```cpp
// sketch: csv_sd
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <RTClib.h>
#include <DHT.h>

const int SD_CS = 10;
const int DHT_PIN = 5;
const unsigned long OLCUM_ARALIGI = 5000;   // ms
const char DOSYA_ADI[] = "VERI.CSV";        // 8.3 kuralı: en çok 8 harf + 3 harf uzantı

RTC_DS3231 rtc;
DHT dht(DHT_PIN, DHT22);
unsigned long sonOlcum = 0;
bool ilkOlcum = true;
bool sdHazir = false;

String ikiHane(int n) {
  if (n < 10) return "0" + String(n);
  return String(n);
}

String sayi(float x) {
  char tampon[12];
  dtostrf(x, 1, 1, tampon);
  return String(tampon);
}

String satirOlustur(DateTime t, float sicak, float nem) {
  String s;
  s.reserve(40);
  s += t.year();
  s += '-';
  s += ikiHane(t.month());
  s += '-';
  s += ikiHane(t.day());
  s += ' ';
  s += ikiHane(t.hour());
  s += ':';
  s += ikiHane(t.minute());
  s += ':';
  s += ikiHane(t.second());
  s += ',';
  if (!isnan(sicak)) s += sayi(sicak);
  s += ',';
  if (!isnan(nem)) s += sayi(nem);
  return s;
}

bool sdyeYaz(const String& satir) {
  File dosya = SD.open(DOSYA_ADI, FILE_WRITE);
  if (!dosya) return false;
  dosya.println(satir);
  dosya.close();                            // kapatınca veri karta yazılır
  return true;
}

void setup() {
  Serial.begin(9600);
  rtc.begin();
  dht.begin();

  sdHazir = SD.begin(SD_CS);
  if (!sdHazir) {
    Serial.println("UYARI: SD kart yok, yalniz Serial'e yaziliyor");
  } else if (!SD.exists(DOSYA_ADI)) {
    sdyeYaz("zaman,sicaklik_C,nem_yuzde");    // dosya yeniyse başlığı yaz
  }
  Serial.println("zaman,sicaklik_C,nem_yuzde");
}

void loop() {
  unsigned long simdi = millis();
  if (ilkOlcum || simdi - sonOlcum >= OLCUM_ARALIGI) {
    ilkOlcum = false;
    sonOlcum = simdi;
    String satir = satirOlustur(rtc.now(), dht.readTemperature(), dht.readHumidity());
    Serial.println(satir);
    if (sdHazir && !sdyeYaz(satir)) {
      Serial.println("UYARI: SD'ye yazilamadi");
    }
  }
}
```

### Nasıl çalışıyor?
1. `ikiHane` tek haneli sayıların başına 0 koyar. Böylece `08:05:03` düzgün sıralanır.
2. `dtostrf(x, 1, 1, tampon)` bir `float`'ı yazıya çevirir: en az 1 karakter genişlik, 1 ondalık basamak. AVR derleyicisinin `sprintf` işlevi varsayılan olarak `%f` desteklemez; `dtostrf` bu yüzden kullanılır.
3. `String s; s.reserve(40);` yazı için yeri baştan ayırır. 34. derste `String`'in SRAM'i parçalayabileceğini gördün; kısa ömürlü ve yeri baştan ayrılmış bir `String` bu riski azaltır.
4. DHT okuması başarısız olunca `readTemperature()` `NaN` döndürür. `isnan` ile bunu yakalıyor, alanı boş bırakıyoruz. Satırın zaman damgası yine yazılır.
5. `satirOlustur` donanıma dokunmadığı için aynı fonksiyonu Serial için de SD için de kullanıyoruz. Yazılacak yer değişince satır biçimi değişmez.

### Dene
- `csv_fonksiyon` programına dördüncü bir test satırı ekle: sıcaklığı 0.0, saniyesi 5 olan bir zaman. Çıktıda `0.0` ve `05` doğru yazılıyor mu?
- `csv_satir` programında `OLCUM_ARALIGI`'ni 2000 yap. Satırlar arası zamana bak. Neden 2 saniyenin altına inmemelisin?
- Serial Monitor çıktısını kopyalayıp `VERI.CSV` olarak kaydet ve tablo programında aç. Sütunlar doğru ayrıldı mı? Değilse `csv_tr` biçimini dene.
- `satirOlustur` fonksiyonuna üçüncü bir sensör sütunu ekle: Fahrenheit cinsinden sıcaklık (`sicak * 9 / 5 + 32`). Başlık satırını da güncellemeyi unutma.

### Sık yapılan hatalar
- Başlık satırındaki sütun sayısı ile veri satırlarındaki sütun sayısının farklı olması.
- Ondalık virgül kullanıp ayracı da virgül bırakmak: sayı iki sütuna bölünür.
- Ay, gün, saat gibi alanları iki haneli yazmamak: sıralama bozulur, tablo programı biçimi tanımayabilir.
- Aynı fonksiyonu hem Serial hem SD için kullanmak yerine her yere ayrı biçimleme kodu yazmak: iki yerde biçim farklı çıkar.
- SD'ye yazarken dosyayı kapatmamak (67. ders).
- Dosya adını 8.3 biçiminden uzun seçmek.

## Konuşalım
Zaman damgasını RTC yerine `millis()` ile üretmek (örneğin "123456 ms") neden iş görmez gibi duruyor? Bir yıl sonra bu dosyayı açan biri satırların ne zaman yazıldığını nasıl anlar?
