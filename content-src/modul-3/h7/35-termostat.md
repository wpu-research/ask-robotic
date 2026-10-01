# Bitirme projesi: Termostat
süre: 35

## Merak
Evdeki kombi, akvaryum ısıtıcısı, kuluçka makinesi: hepsinin içinde aynı küçük beyin var. Sıcaklığı ölçer, istenen değerle karşılaştırır, ısıtıcıyı açar ya da kapatır. Üstelik fişi çekilse de istenen sıcaklığı unutmaz. Bu modülün bitirme projesinde bu beyni sen yapacaksın.

## Etkinlik
### Ne yapacağız?
Bu proje öğrendiklerini birleştirir:
- **Hafta 3:** NTC termistörle sıcaklık hesabı (A2).
- **Hafta 5:** Röle ile açma-kapama ve histerezis (D7).
- **Hafta 6:** `millis()` ile bloklamayan kod ve durum makinesi.
- **Hafta 7:** I2C LCD ekran ve EEPROM'da kalıcı ayar.

Kullanıcı iki butonla hedef sıcaklığı ayarlar. Ölçülen sıcaklık hedefin altına düşünce röle ısıtıcıyı açar, hedefe ulaşınca kapatır. Hedef sıcaklık EEPROM'da saklanır.

### Devre
**Güvenlik:** Bu projede röleyi yalnızca düşük gerilimle (5 V) kullan. Şebeke gerilimiyle (220 V) devre kurma. Gerçek bir ısıtıcıyı bağlamak yetişkin ve uzman gözetimi gerektirir.

| Parça | Bağlantı |
|---|---|
| 10 kΩ NTC termistör | Bir ucu **A2**, öbür ucu GND |
| 10 kΩ sabit direnç | Bir ucu 5 V, öbür ucu **A2** |
| Buton "artır" | Bir ucu **D2**, öbür ucu GND |
| Buton "azalt" | Bir ucu **D3**, öbür ucu GND |
| Röle modülü IN | **D7** (VCC → 5 V, GND → GND) |
| "Isıtıcı" yerine LED | Röle COM → 5 V; röle NO → 330 Ω direnç → LED → GND |
| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → 5 V, GND → GND (adres 0x27) |

Isıtıcı yerine LED kullanıyoruz: LED yanıyorsa "ısıtıcı açık" demektir. Butonlar `INPUT_PULLUP` olduğu için basılı buton `LOW` okunur. LCD adresin 0x27 değilse önceki derste öğrendiğin tarama programıyla bul. Röle modülün ters çalışıyorsa (IN'e LOW verince çekiyorsa) `HIGH` ile `LOW` yerlerini değiştir.

NTC ve sabit direnç bir **gerilim bölücü** oluşturur: sıcaklık arttıkça NTC'nin direnci düşer ve A2'deki gerilim azalır. NTC direncini `R = 10000 × ADC / (1023 − ADC)` formülüyle buluruz. Sıcaklığı ise β = 3950 değerli Steinhart-Hart (beta) formülüyle hesaplarız. Kendi termistörünün β değeri farklıysa sabiti değiştir.

### Durum makinesi
Termostatın üç durumu var:

| Durum | Röle | Bu durumdan çıkış |
|---|---|---|
| KAPALI | Kapalı | Sıcaklık `hedef − 0,5` değerine eşit ya da daha düşükse ISITIYOR; bir butona basılırsa AYAR |
| ISITIYOR | Açık | Sıcaklık `hedef + 0,5` değerine eşit ya da daha yüksekse KAPALI; bir butona basılırsa AYAR |
| AYAR | Kapalı | Son buton basışından 2 saniye sonra hedef EEPROM'a yazılır, KAPALI |

Hedefin 0,5 derece altında ve üstünde iki ayrı eşik vardır (**histerezis**). Böylece sıcaklık hedef civarında dalgalanırken röle bir açılıp bir kapanmaz.

AYAR durumunda her basış hedefi 1 derece değiştirir ve 2 saniyelik süreyi yeniden başlatır. EEPROM'a yazma, ayar bittikten sonra **bir kez** yapılır; böylece art arda 5 basış 5 yazma harcamaz.

### Program
```cpp
// sketch: termostat
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

const int ARTIR = 2;
const int AZALT = 3;
const int ROLE = 7;
const int NTC_PIN = A2;

const int ADRES = 0;                // hedef sıcaklığın EEPROM adresi
const int HEDEF_MIN = 10;
const int HEDEF_MAX = 35;
const int HEDEF_VARSAYILAN = 22;
const float HISTEREZIS = 0.5;       // hedefin altı ve üstü için pay
const unsigned long AYAR_SURESI = 2000;   // ms
const unsigned long OLCUM_ARALIGI = 500;  // ms

enum Durum { KAPALI, ISITIYOR, AYAR };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Durum durum = KAPALI;
int hedef;
float sicaklik;
unsigned long sonOlcum = 0;
unsigned long ayarBasla = 0;
unsigned long sonBasis = 0;
bool oncekiArtir = false;
bool oncekiAzalt = false;

float sicaklikOku() {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NTC_PIN);
  }
  float adc = toplam / 8.0;
  if (adc < 1.0) adc = 1.0;           // sıfıra bölmeyi önle
  if (adc > 1022.0) adc = 1022.0;
  float direnc = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);
  return kelvin - 273.15;
}

const char* durumAdi() {
  if (durum == ISITIYOR) return "ISIT  ";
  if (durum == AYAR) return "AYAR  ";
  return "KAPALI";
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  lcd.print("Su an: ");
  lcd.print(sicaklik, 1);
  lcd.print(" C    ");
  lcd.setCursor(0, 1);
  lcd.print("Hedef:");
  lcd.print(hedef);
  lcd.print("C ");
  lcd.print(durumAdi());
}

void setup() {
  pinMode(ARTIR, INPUT_PULLUP);
  pinMode(AZALT, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  digitalWrite(ROLE, LOW);
  Serial.begin(9600);

  hedef = EEPROM.read(ADRES);
  if (hedef < HEDEF_MIN || hedef > HEDEF_MAX) {
    hedef = HEDEF_VARSAYILAN;         // boş (255) ya da bozuk değer
  }

  lcd.init();
  lcd.backlight();
  sicaklik = sicaklikOku();
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Butonlar: basıldığı an (yüksekten alçağa geçiş) bir kez işle
  bool artirBasili = (digitalRead(ARTIR) == LOW);
  bool azaltBasili = (digitalRead(AZALT) == LOW);
  bool artirYeni = artirBasili && !oncekiArtir;
  bool azaltYeni = azaltBasili && !oncekiAzalt;
  oncekiArtir = artirBasili;
  oncekiAzalt = azaltBasili;

  if ((artirYeni || azaltYeni) && simdi - sonBasis > 50) {   // 50 ms: sıçrama önleme
    sonBasis = simdi;
    if (artirYeni && hedef < HEDEF_MAX) hedef++;
    if (azaltYeni && hedef > HEDEF_MIN) hedef--;
    durum = AYAR;                      // ayar moduna gir, 2 saniyelik süreyi başlat
    ayarBasla = simdi;
    ekranYaz();
  }

  // 2) Sıcaklık: yarım saniyede bir ölç
  bool olcumZamani = false;
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    sicaklik = sicaklikOku();
    olcumZamani = true;
  }

  // 3) Durum makinesi
  switch (durum) {
    case KAPALI:
      if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;
      break;
    case ISITIYOR:
      if (sicaklik >= hedef + HISTEREZIS) durum = KAPALI;
      break;
    case AYAR:
      if (simdi - ayarBasla >= AYAR_SURESI) {
        EEPROM.update(ADRES, hedef);   // ayar bitti: yalnızca değiştiyse yazar
        durum = KAPALI;
      }
      break;
  }
  digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW);

  // 4) Ekran ve seri çıktı: her ölçümden sonra
  if (olcumZamani) {
    ekranYaz();
    Serial.print("sicaklik=");
    Serial.print(sicaklik, 1);
    Serial.print(" hedef=");
    Serial.print(hedef);
    Serial.print(" role=");
    Serial.println(durum == ISITIYOR ? 1 : 0);
  }
}
```

### Nasıl çalışıyor?
1. `setup` içinde önce EEPROM'dan hedef okunur. Hiç yazılmamış hücrede 255 vardır; bu değer 10-35 aralığının dışında olduğu için varsayılan 22 derece kullanılır.
2. `loop` dört iş yapar ve hiçbirinde `delay` yoktur: butonlar, ölçüm, durum makinesi, ekran. Ölçüm ve ekran `millis()` ile yarım saniyede bir yapılır. Sıçrama önleme de `millis()` ile yapılır: son basıştan 50 ms geçmediyse yeni basış sayılmaz.
3. Butonlar yalnızca **basıldığı anda** işlenir: önceki turda basılı değil, şimdi basılı ise hedef değişir. Böylece düğmeyi basılı tutmak hedefi sürekli artırmaz.
4. Butona basılınca `AYAR` durumuna geçilir. Bu durumda röle kapalıdır; ısıtıcı, kullanıcı hedefi değiştirirken çalışmaz. 2 saniye hiçbir tuşa basılmazsa hedef EEPROM'a yazılır.
5. `switch` ile üç durum tek bir yerde yazılmıştır. Röle çıkışı durumun doğrudan sonucudur: `digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW)`.
6. `EEPROM.update` kullanıldığı için hedef aynı kalmışsa (örneğin artırıp geri azalttıysan) EEPROM'a hiç yazılmaz.

### Dene
- `HISTEREZIS` değerini 0,2 ve 2 yap. Röle ne kadar sık açılıp kapanıyor?
- Hedefi sıcaklığın üstüne çıkarıp elinle NTC'yi ısıt. Röle hangi sıcaklıkta kapanıyor?
- Kartın fişini çekip tak. Hedef sıcaklık korunuyor mu?
- Yeni bir özellik ekle: sıcaklık hedefin 5 dereceden fazla altındaysa buzzer'ı (D8) çaldır. Hangi duruma ekleyeceksin?

### Sık yapılan hatalar
- NTC ile sabit direnci ters yerleştirmek: sıcaklık arttıkça ölçüm düşer ya da tersine çalışır. Direnç bölücüsünü gerilim formülüyle yeniden hesapla.
- Histerezis olmadan tek eşik kullanmak: sıcaklık eşik civarında dalgalanınca röle çok hızlı açılıp kapanır, röle bozulur.
- EEPROM'a her buton basışında yazmak: art arda basışlar gereksiz yazma harcar. Yazmayı ayar bittikten sonra yap.
- Hedef değerini sınırlamamak: negatif ya da çok yüksek hedefler ısıtıcıyı sürekli açık bırakabilir.
- 255 olarak okunan boş EEPROM'u geçerli hedef sanmak.
- Röleyle şebeke gerilimi kullanmak: bu projede kesinlikle yapma.

## Konuşalım
Sıcaklık sensörü koptuysa ya da yanlış bağlandıysa termostatın ne yaptığını düşün: ısıtıcı sonsuza kadar açık kalır mı? Bu projeye bir güvenlik önlemi eklemek istesen ne eklerdin?
