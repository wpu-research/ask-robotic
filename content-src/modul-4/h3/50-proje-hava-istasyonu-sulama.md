# Proje: Hava istasyonu ve sulama uyarısı
süre: 35

## Merak
Balkondaki domates fidelerini bir hafta sonu tatilinde kimse sulayamadı. Dönünce yapraklar sarkmıştı. Peki kart onlara bakıp "toprak kurudu, sulama zamanı" diyebilseydi? Bu projede bir hava istasyonu yapacaksın: sıcaklığı, nemi, basıncı ve rakımı ölçüp ekranda sayfa sayfa gösterecek; toprak kuruyunca da LED yakıp buzzer ile uyaracak.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Modül 3, 18. ders:** Buzzer ile `tone` (D8).
- **Modül 3, 14. ve 35. dersler:** `map`/`constrain` ile kalibrasyon ve histerezis.
- **Modül 3, 27. ve 33. dersler:** `millis()` ile bloklamayan kod, I2C hattında birden çok cihaz.
- **46-49. dersler:** DHT22, BMP280, toprak nemi sensörü ve çok sayfalı LCD.

Sistem şöyle çalışır: Her 2 saniyede bir DHT22, BMP280 ve toprak nemi okunur. LCD üç sayfayı 3 saniyede bir değiştirerek gösterir. Toprak nemi **%30'un altına** inince sulama uyarısı başlar: LED yanar, buzzer her 2 saniyede bir kısa öter ve seri porta bir satır yazılır. Uyarı, toprak **%40'a** çıkınca biter. İki ayrı eşik kullanırız (35. dersteki histerezis); böylece nem %30 civarında dalgalanırken uyarı açılıp kapanıp durmaz.

### Devre
**Güvenlik:** Bu projede pompa ya da vana bağlamıyoruz; yalnızca LED ve buzzer var. İleride gerçek bir sulama pompası eklersen 22. ve 24. derslerdeki gibi transistör ya da röle kullan, pompaya harici güç ver ve GND'leri ortak yap. Şebeke gerilimiyle (220 V) hiçbir devre kurma. Elektronik parçaları sudan uzak tut; yalnızca sensörün toprağa girmesi gereken kısmını toprağa batır.

| Parça | Bağlantı |
|---|---|
| DHT22 | DATA → **D5**, VCC → 5 V, GND → GND |
| BMP280 | SDA → **A4**, SCL → **A5**, VCC (modülün gerilim aralığına bak), GND; adres 0x76 |
| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → 5 V, GND → GND; adres 0x27 |
| Toprak nemi sensörü | analog çıkış → **A2**, VCC, GND |
| LED + 330 Ω direnç | **D13** → direnç → LED anodu; katot → GND |
| Pasif buzzer | **D8** → buzzer (+), buzzer (−) → GND |
| Buton "sonraki sayfa" | **D2** ile GND arası (`INPUT_PULLUP`) |

LCD ve BMP280 aynı iki kabloyu (SDA, SCL) paylaşır; adresleri farklı olduğu (0x27, 0x76) için karışmazlar. Toprak nemi sensörünün kuru ve ıslak uçlarını 48. dersteki gibi kendin ölç; aşağıdaki program `KURU = 800` ve `ISLAK = 350` varsayar.

### Uyarı mantığı
| Durum | Koşul | Eylem |
|---|---|---|
| Normal | Toprak nemi `%30` ve üstü | LED sönük, buzzer sessiz |
| Normal → UYARI | Nem `%30`'un **altına** inerse | LED yanar, buzzer öter, seri porta **bir** satır yazılır |
| UYARI | Nem `%30`-`%40` arasında | Uyarı sürer (histerezis) |
| UYARI → Normal | Nem `%40` ya da üstüne çıkarsa | LED söner, buzzer susar, seri porta bir satır yazılır |

### Program
```cpp
// sketch: hava_istasyonu
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int LED = 13;
const int BUZZER = 8;
const int BUTON = 2;

const int KURU = 800;                       // ham deger: kuru toprak
const int ISLAK = 350;                      // ham deger: islak toprak
const int ESIK_ALT = 30;                    // % - altina inince uyari
const int ESIK_UST = 40;                    // % - ustune cikinca uyari biter
const float P0_HPA = 1013.25;               // deniz seviyesi basinci

const int SAYFA_SAYISI = 3;
const unsigned long OLCUM_ARALIGI = 2000;   // ms (DHT icin en az 2 sn)
const unsigned long SAYFA_SURESI = 3000;    // ms
const unsigned long BIP_ARALIGI = 2000;     // ms
const unsigned long BIP_SURESI = 200;       // ms
const int BIP_HZ = 1000;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

float sicaklik = NAN;
float nem = NAN;
float hpa = NAN;
float rakim = NAN;
int toprakHam = 0;
int toprakYuzde = 0;

bool bmpHazir = false;
bool uyari = false;
int sayfa = 0;
bool oncekiBasili = false;
unsigned long sonOlcum = 0;
unsigned long sonSayfa = 0;
unsigned long sonBip = 0;
unsigned long sonBasis = 0;

// Sayiyi metne cevirir; gecersizse "--" verir.
const char* sayi(float v, int basamak, char* tampon) {
  if (isnan(v)) {
    return "--";
  }
  dtostrf(v, 1, basamak, tampon);
  return tampon;
}

// Seri porta sayi yazar; gecersizse "--".
void seriSayi(const char* ad, float v, int basamak) {
  Serial.print(ad);
  if (isnan(v)) {
    Serial.print("--");
  } else {
    Serial.print(v, basamak);
  }
}

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
    snprintf(alt, sizeof(alt), "%s", uyari ? "SULAMA GEREKLI" : "Durum: NORMAL");
  }

  char baslik[17];
  char sonSatir[17];
  snprintf(baslik, sizeof(baslik), "%-13s%d/%d", ust, sayfa + 1, SAYFA_SAYISI);
  snprintf(sonSatir, sizeof(sonSatir), "%-15s%c", alt, uyari ? '!' : ' ');
  satirYaz(0, baslik);
  satirYaz(1, sonSatir);
}

void olcumYap() {
  nem = dht.readHumidity();
  sicaklik = dht.readTemperature();
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

// Toprak nemine gore uyariyi acar/kapatir (histerezisli).
void uyariKontrol(unsigned long simdi) {
  if (!uyari && toprakYuzde < ESIK_ALT) {
    uyari = true;
    sonBip = simdi - BIP_ARALIGI;           // ilk bip hemen calsin
    digitalWrite(LED, HIGH);
    Serial.print("UYARI: toprak nemi %");
    Serial.print(toprakYuzde);
    Serial.println(" - sulama gerekli");
  } else if (uyari && toprakYuzde >= ESIK_UST) {
    uyari = false;
    digitalWrite(LED, LOW);
    noTone(BUZZER);
    Serial.print("Toprak nemi normale dondu: %");
    Serial.println(toprakYuzde);
  }
}

void seriDurum() {
  seriSayi("T=", sicaklik, 1);
  seriSayi(" N=", nem, 1);
  seriSayi(" P=", hpa, 1);
  seriSayi(" R=", rakim, 0);
  Serial.print(" Toprak=%");
  Serial.print(toprakYuzde);
  Serial.print(" Uyari=");
  Serial.println(uyari ? 1 : 0);
}

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  digitalWrite(LED, LOW);
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  dht.begin();
  bmpHazir = bmp.begin(0x76);
  if (!bmpHazir) {
    Serial.println("BMP280 bulunamadi");
  }
  delay(1500);                              // DHT sensoru acilsin

  olcumYap();
  uyariKontrol(millis());
  seriDurum();
  sayfaCiz();
  sonOlcum = millis();
  sonSayfa = millis();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Buton: hemen sonraki sayfa
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 50) {
    sonBasis = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sonSayfa = simdi;
    sayfaCiz();
  }
  oncekiBasili = basili;

  // 2) Olcum, uyari ve seri cikti: 2 saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    olcumYap();
    uyariKontrol(simdi);
    seriDurum();
    sayfaCiz();
  }

  // 3) Sayfa degisimi: 3 saniyede bir
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }

  // 4) Uyari sirasinda buzzer: 2 saniyede bir kisa bip
  if (uyari && simdi - sonBip >= BIP_ARALIGI) {
    sonBip = simdi;
    tone(BUZZER, BIP_HZ, BIP_SURESI);
  }
}
```

### Nasıl çalışıyor?
1. `olcumYap()` üç sensörü okur ve değerleri genel değişkenlere koyar. DHT okunamazsa değer `NaN` kalır; ekran ve seri port bunu `--` olarak gösterir, program durmaz. BMP280 bulunamazsa `bmpHazir` yanlış olur ve basınç sayfası "BMP280 yok" der (47. ders).
2. Toprak nemi 48. dersteki gibi 8 ölçümün ortalamasından `map` ve `constrain` ile yüzdeye çevrilir.
3. `uyariKontrol()` bir **durum** tutar: `uyari`. Normalken yüzde 30'un altına inerse açılır; açıkken 40'a çıkarsa kapanır. Seri porta uyarı satırı yalnız **durum değişince** bir kez yazılır; böylece Serial Monitor aynı mesajla dolmaz. Her 2 saniyede bir yazılan `T=... Uyari=1` durum satırı ise sürekli akar.
4. Buzzer `tone(BUZZER, 1000, 200)` ile 200 ms öter ve program beklemez. `sonBip` ile 2 saniyede bir tekrar edilir (27. ders). Uyarı açıldığında `sonBip = simdi - BIP_ARALIGI` yazarak ilk bipin hemen çalmasını sağladık.
5. Uyarı varken LCD'nin her sayfasının sağ alt köşesinde `!` görünür; sayfa 3'te ise "SULAMA GEREKLI" yazar. Böylece kullanıcı hangi sayfada olursa olsun uyarıyı görür.
6. Dört iş (buton, ölçüm, sayfa, buzzer) kendi saatiyle çalışır; `loop()` içinde `delay` yoktur.

### Benzetimde doğruladıklarımız
- Toprak %60 iken LED söner, buzzer susar, seri portta yalnız durum satırları akar (`T=24.6 N=48.3 P=990.0 R=195 Toprak=%60 Uyari=0`). LCD sayfaları 3 saniyede bir `1/3`, `2/3`, `3/3` olarak döner. LCD ve BMP280 aynı I2C hattında çalışır.
- Toprak %24'e düşünce 2 saniye içinde LED yanar, seri porta tek bir `UYARI: toprak nemi %24 - sulama gerekli` satırı yazılır, buzzer 1 kHz'de yaklaşık 200 ms'lik bipleri 2 saniye arayla çalar. Sayfa 3 "SULAMA GEREKLI" gösterir.
- Nem %35'e çıkınca (30-40 arası) uyarı sürer. %45'e çıkınca LED söner, buzzer susar ve seri porta "normale dondu" satırı yazılır.
- Eşik tam sınırda: %30'da uyarı çıkmaz, %29'da çıkar.
- DHT ve BMP280 bağlı değilken program çökmez: ekranda `--` ve "BMP280 yok", seri portta `--` görünür ve toprak uyarısı yine çalışır.

### Dene
- `ESIK_ALT` ve `ESIK_UST` değerlerini %30 ve %32 yap. Toprak nemi %31 civarında dalgalanınca uyarı kaç kez açılıp kapanıyor? Neden iki eşik daha iyi?
- D3'e ikinci bir buton ekle: basınca buzzer'ı 10 dakikalığına sustursun, LED yanık kalsın. Bunun için hangi değişkenlere ihtiyacın var?
- Yağmur sensörünü (48. ders, A0) ekle: yağmur varken toprak kuru olsa bile sulama uyarısı verme. Koşulu nereye yazarsın?

### Sık yapılan hatalar
- Tek eşik kullanmak: nem eşik civarında dalgalanınca LED ve buzzer hızlıca açılıp kapanır, seri port satırlarla dolar.
- Seri uyarıyı her turda yazmak: durum değişimini yakalamak yerine sürekli aynı mesajı basarsın.
- `delay` ile buzzer çaldırmak: sayfa değişimi, buton ve ölçüm durur.
- DHT'yi 2 saniyeden sık okumak.
- Toprak sensörünün kuru/ıslak uçlarını kendi sensörüne göre ölçmemek: yüzde hesabı yanlış olur.
- DHT22'ye `NaN` dönmesine hazırlıksız olmak: ekranda `nan` görünür, eşik karşılaştırmaları şaşar.

## Konuşalım
Toprak nemi sensörü bozulup hep "kuru" okursa sistem sonsuza kadar uyarı verir, hep "ıslak" okursa hiç uyarı vermez. Sensörün bozulduğunu anlamak için hangi kontrolü eklerdin? Sulamayı sensör yerine zamana göre (haftada iki kez) yapmanın artı ve eksileri neler?
