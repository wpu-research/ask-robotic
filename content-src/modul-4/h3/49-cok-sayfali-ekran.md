# Çok sayfalı ekran arayüzü (LCD/OLED)
süre: 25

## Merak
Küçük bir hava istasyonunun ekranı 16 karakter ve 2 satırdır. Oysa göstermek istediğin sıcaklık, nem, basınç, rakım ve toprak nemidir. Hepsini aynı anda sığdıramazsın. Telefonlardaki gibi "sayfa" mantığıyla çözeceğiz: ekran birkaç saniyede bir sayfa değiştirir, istersen butonla sen çevirirsin. Bunu yaparken programın hiçbir yerde `delay` ile durmayacak.

## Etkinlik
### Devre
Parçaları laboratuvarda **Parça ekle** menüsünden seç, pinleri kablo çekerek bağla.

| Parça | Bağlantı |
|---|---|
| I2C LCD (adres 0x27) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |
| BMP280 (adres 0x76) | SDA → **A4**, SCL → **A5** (LCD ile aynı hat), VCC → 5V, GND → GND |
| DHT (DHT22) | DATA → **D5**, VCC → 5V, GND → GND |
| Toprak nemi modülü | AO → **A2**, VCC → 5V, GND → GND |
| Buton "sonraki sayfa" | A → **D2**, B → GND (`INPUT_PULLUP`) |

LCD (0x27) ve BMP280 (0x76) farklı adreslerde oldukları için aynı iki kabloyu (SDA, SCL) paylaşırlar (33. ders). A4 ve A5 pinlerine iki ayrı kablo çekebilirsin ya da ikinci cihazın SDA/SCL ucunu birinci cihazın aynı ucuna bağlayabilirsin. Çalışırken sensörlerin kaydırıcılarını oynatabilir, Buton parçasına basılı tutarak basabilirsin.

### Fikir: sayfa numarası ve zamanlayıcı
Bir `sayfa` değişkeni hangi sayfanın gösterildiğini tutar. Süre dolunca değişken bir artar, sonuna gelince başa döner:

```cpp
sayfa = (sayfa + 1) % SAYFA_SAYISI;   // 0, 1, 2, 0, 1, 2, ...
```

`%` bölümden kalanı verir: 2'den sonra 3 % 3 = 0 olur. Süre için 27. dersteki `millis()` kalıbını kullanırız: `simdi - sonSayfa >= 3000`.

### Ekranı titretmeden güncelleme
Her güncellemede `lcd.clear()` çağırırsan ekran bir an boşalır ve titrer. Daha iyi yöntem: her satırı **her zaman 16 karaktere tamamlayarak** yaz. Yeni yazı eskisinden kısaysa kalan boşluklar eski karakterlerin üstünü örter. Bu iş için küçük bir yardımcı yazarız. Ayrıca iki yeni araç kullanacağız:

- **`snprintf(tampon, boyut, biçim, ...)`:** Biçimlenmiş bir yazıyı bir karakter dizisine (tampon) yazar. `%s` metin, `%d` tam sayı, `%-16s` "sola yaslı, 16 karakter genişliğinde metin" demektir. `%%` ise yüzde işaretini yazdırır. Arduino Uno'da `snprintf` ondalıklı sayıyı (`%f`) yazdırmaz; sayı yerine `?` çıkar.
- **`dtostrf(sayi, genislik, basamak, tampon)`:** Ondalıklı sayıyı metne çevirir. `dtostrf(23.4, 1, 1, tampon)` tampona `"23.4"` yazar. Böylece ondalıklı sayıyı `snprintf` içine metin olarak koyarız.

### Program: 3 sayfalı hava ekranı
Sayfa 1 sıcaklık ve nem, sayfa 2 basınç ve rakım, sayfa 3 toprak nemi gösterir. Sağ üst köşede `1/3` gibi sayfa numarası durur. Sensörler 2 saniyede bir okunur (DHT için gerekli süre), sayfa 3 saniyede bir değişir, buton ise sayfayı hemen değiştirir ve 3 saniyelik süreyi yeniden başlatır.

```cpp
// sketch: ekran_sayfalar
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int BUTON = 2;
const int SAYFA_SAYISI = 3;
const unsigned long SAYFA_SURESI = 3000;   // ms
const unsigned long OLCUM_ARALIGI = 2000;  // ms
const int KURU = 800;
const int ISLAK = 350;
const float P0_HPA = 1013.25;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

int sayfa = 0;
unsigned long sonSayfa = 0;
unsigned long sonOlcum = 0;
unsigned long sonBasis = 0;
bool oncekiBasili = false;
bool bmpHazir = false;

float sicaklik = NAN;
float nem = NAN;
float hpa = NAN;
float rakim = NAN;
int toprakHam = 0;
int toprakYuzde = 0;

// Sayiyi metne cevirir; gecersizse "--" verir.
const char* sayi(float v, int basamak, char* tampon) {
  if (isnan(v)) {
    return "--";
  }
  dtostrf(v, 1, basamak, tampon);
  return tampon;
}

// Bir satiri her zaman 16 karaktere tamamlayarak yazar.
void satirYaz(int satir, const char* metin) {
  char tampon[17];
  snprintf(tampon, sizeof(tampon), "%-16s", metin);
  lcd.setCursor(0, satir);
  lcd.print(tampon);
}

void sayfaCiz() {
  char ust[17];
  char alt[17];
  char a[10];
  char b[10];

  if (sayfa == 0) {
    snprintf(ust, sizeof(ust), "Sic: %s C", sayi(sicaklik, 1, a));
    snprintf(alt, sizeof(alt), "Nem: %s %%", sayi(nem, 1, b));
  } else if (sayfa == 1) {
    if (bmpHazir) {
      snprintf(ust, sizeof(ust), "P:%s hPa", sayi(hpa, 1, a));
      snprintf(alt, sizeof(alt), "Rakim: %s m", sayi(rakim, 0, b));
    } else {
      snprintf(ust, sizeof(ust), "BMP280 yok");
      snprintf(alt, sizeof(alt), " ");
    }
  } else {
    snprintf(ust, sizeof(ust), "Toprak: %%%d", toprakYuzde);
    snprintf(alt, sizeof(alt), "Ham: %d", toprakHam);
  }

  char baslik[17];
  snprintf(baslik, sizeof(baslik), "%-13s%d/%d", ust, sayfa + 1, SAYFA_SAYISI);
  satirYaz(0, baslik);
  satirYaz(1, alt);
}

void olcumYap() {
  float n = dht.readHumidity();
  float s = dht.readTemperature();
  sicaklik = s;                         // okunamazsa NAN kalir, ekran "--" yazar
  nem = n;

  if (bmpHazir) {
    hpa = bmp.readPressure() / 100.0;
    rakim = bmp.readAltitude(P0_HPA);
  }

  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(A2);
  }
  toprakHam = toplam / 8;
  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  dht.begin();
  bmpHazir = bmp.begin(0x76);
  delay(1500);                          // DHT sensoru acilsin
  olcumYap();
  sayfaCiz();
  sonOlcum = millis();
  sonSayfa = millis();                  // sayfa suresi simdi baslasin
}

void loop() {
  unsigned long simdi = millis();

  // Butona basilinca hemen sonraki sayfa
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 50) {
    sonBasis = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sonSayfa = simdi;                   // 3 saniyelik sure bastan
    sayfaCiz();
  }
  oncekiBasili = basili;

  // Sensorler 2 saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    olcumYap();
    sayfaCiz();
  }

  // Sayfa 3 saniyede bir
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }
}
```

### Nasıl çalışıyor?
1. `sayfa` 0, 1 ve 2 değerlerini alır. `sayfaCiz()` sayfa numarasına bakıp ilgili iki satırı hazırlar. Ekrana dokunan tek yer `satirYaz`'dır.
2. `sayi()` yardımcı fonksiyonu ölçüm geçersizse `"--"` yazar. Böylece DHT ya da BMP280 yokken ekranda `nan` yerine `--` görünür.
3. Üç iş birbirinden bağımsız saatlerle çalışır: butona bakma, sensör okuma (2 sn) ve sayfa çevirme (3 sn). Hiçbirinde `delay` yok (27. ders).
4. `setup` sonunda `sonSayfa = millis()` yazdık. Bunu yapmasaydık `millis()` açılıştan beri saydığı için, `setup` içindeki 1,5 saniyelik `delay` ve LCD başlatma süresi sayfa süresinden yenmiş olur, ilk sayfa çok kısa görünürdü.
5. Sayfa 2'de BMP280 yoksa ekran "BMP280 yok" der; program yine çalışır.

Laboratuvarda gördüğümüz davranış: ekran 3 saniyede bir `1/3`, `2/3`, `3/3`, `1/3` sırasıyla değişti (aralık 3000 ms'ye çok yakın). DHT'nin sıcaklığı 25 °C ve nemi 50 % iken ilk sayfada `Sic: 25.0 C` ve `Nem: 50.0 %` göründü. Buton sayfayı hemen çevirdi ve sonraki otomatik değişim butondan 3 saniye sonra oldu. LCD ve BMP280 aynı I2C hattında birlikte çalıştı. Sıcaklık kaydırıcısını çalışırken değiştirince ilk sayfa en geç 2 saniye içinde yeni değeri gösterdi. Toprak nemi modülünün **Toprak nemi** kaydırıcısı 0,5 iken üçüncü sayfa `Toprak: %41` ve `Ham: 614` gösterir (48. dersteki ölçüm).

### OLED ekran (kısa tanıtım)
**Laboratuvarda OLED parçası yok**; bu bölüm okuyarak öğrenmen içindir, etkinlikte yalnız LCD kullanılır.

OLED, her piksel kendi ışığını üreten küçük ekrandır. Yaygın modüller 128x64 pikseldir ve I2C ile bağlanır (adres genellikle 0x3C; etiketine bak). LCD'den farkı: karakter değil **piksel** çizersin, yazı boyutu seçebilirsin, çizgi ve şekil de çizebilirsin. Kütüphane olarak Adafruit SSD1306 ve Adafruit GFX kullanılır.

Dikkat: 128x64 bir ekranın görüntü tamponu 1024 bayttır. Bu, Uno'nun 2048 baytlık SRAM'ının yarısıdır (34. ders). Büyük metin dizileri ve diğer kütüphanelerle birlikte belleğin dolmamasına dikkat et.

Aşağıdaki örnek aynı sayfa mantığını OLED'e uygular. Bu sketch yalnızca derlenerek denendi; laboratuvarda OLED olmadığı için ekran davranışı doğrulanmadı. Kütüphanenin kullanımı için Adafruit SSD1306 ve GFX belgelerine ve örneklerine bak.

```cpp
// sketch: oled_sayfalar
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 oled(128, 64, &Wire, -1);   // genislik, yukseklik, I2C, reset yok

const int SAYFA_SAYISI = 3;
const unsigned long SAYFA_SURESI = 3000;
int sayfa = 0;
unsigned long sonSayfa = 0;
bool oledHazir = false;

void sayfaCiz() {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  if (sayfa == 0) {
    oled.println("Sicaklik");
    oled.print(23.4, 1);
    oled.println(" C");
  } else if (sayfa == 1) {
    oled.println("Basinc");
    oled.print(1013.2, 1);
    oled.println(" hPa");
  } else {
    oled.println("Toprak");
    oled.println("%45");
  }
  oled.display();                       // cizdiklerini ekrana gonder
}

void setup() {
  Serial.begin(9600);
  oledHazir = oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!oledHazir) {
    Serial.println("OLED bulunamadi");
    return;
  }
  sayfaCiz();
}

void loop() {
  if (!oledHazir) {
    return;
  }
  unsigned long simdi = millis();
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }
}
```

OLED'de çizdiklerin `oled.display()` çağrılana kadar ekrana gitmez; önce tampona çizersin, sonra tek seferde gönderirsin. Gerçek modüllerde adres 0x3C değilse `begin` içindeki adresi değiştirmek gerekir.

### Dene
- `SAYFA_SURESI` değerini 1500 yap. Yazıları okuyabiliyor musun? Hangi süre sence okumak için yeterli?
- Dördüncü bir sayfa ekle (örneğin `millis() / 1000` ile programın kaç saniyedir çalıştığı). `SAYFA_SAYISI` ve `sayfaCiz` içinde nelerin değişmesi gerekiyor?
- `satirYaz` içindeki dolguyu kaldır, yerine doğrudan `lcd.print(metin)` yaz. Sayfa değiştirince ekranda eski yazının artıkları kalıyor mu?

### Sık yapılan hatalar
- Sayfayı `delay(3000)` ile bekletmek: butona basışı kaçırırsın ve sensörler durur.
- Satırı 16 karaktere tamamlamamak: kısa bir yazı uzun olanın üstüne yazılınca eski karakterler ekranda kalır.
- `snprintf` ile `%f` kullanmak: Uno'da ondalık sayı yazmaz; `dtostrf` kullan.
- `sayfa` değişkenini sınırlamamak: `sayfa++` yazıp başa dönmeyi unutursan sayfa numarası sınırı aşar.
- Tampon boyutunu küçük almak: uzun metin taşıp başka değişkenleri bozabilir; `snprintf` boyutu sınırlar, `sprintf` sınırlamaz.

## Konuşalım
Bir kullanıcı ekrandaki bir değeri okumaya çalışırken ekran 3 saniye dolunca sayfa değiştiriyor. Sence sayfa süresi sabit mi olmalı, yoksa kullanıcı butona basınca daha uzun mu beklemeli? Gösterilmesi gereken kritik bir uyarı (örneğin "sulama gerekli") varsa sayfa döngüsünde nasıl bir yer vermelisin?
