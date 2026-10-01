# Proje: Akıllı kapı kilidi
süre: 40

## Merak
Bir otelde oda kapısına kartı tutarsın, yeşil ışık yanar, kilit açılır, birkaç saniye sonra kendiliğinden kapanır. Üç kez yanlış şifre girersen ise kapı seni bir süre dinlemez. Bu hafta öğrendiğin parçalar tam olarak bunun için: tuş takımı, kart, EEPROM'da yetki listesi. Şimdi hepsini servo, ekran ve buzzerle birleştirip çalışan bir kapı kilidi yapacaksın.

## Etkinlik
### Ne yapacağız?
Bu proje önceki derslerden şunları birleştirir:
- **Bu hafta:** Keypad ile PIN girişi (62), seri taklit ile kart okuma (63), EEPROM'da PIN ve kart listesi, master PIN ile yönetim (64).
- **Modül 3, hafta 5:** Servo ile kilit mandalı (21. ders).
- **Modül 3, hafta 6:** `millis()` ile bloklamayan zamanlama ve durum makinesi (27-28. dersler).
- **Modül 3, hafta 7:** I2C LCD ekran (32-33. dersler) ve EEPROM (34. ders).

Kural şöyle:
- Doğru PIN ya da yetkili kart: kapı **5 saniye** açılır, sonra kendiliğinden kilitlenir.
- Yanlış PIN ya da yetkisiz kart bir hak yer. **3 yanlış denemede** kapı **30 saniye** boyunca hiçbir girişi kabul etmez.
- Her olay ekranda gösterilir ve buzzerle sese dökülür.

### Devre
**Güvenlik:** Bu projede kilit olarak yalnızca küçük bir servo kullan. Şebeke gerilimiyle (220 V) çalışan elektrikli kapı kilidi, mıknatıs ya da röle bağlama. Servoyu Arduino'nun 5 V pininden besleme; servo motor kalkışta fazla akım çekebilir ve kart yeniden başlayabilir. Servo için **harici bir 5 V besleme** kullan ve harici besleme ile Arduino'nun **GND**'lerini birleştir (ortak GND).

Bu haftanın pinleri Modül 4'ün standart tablosundan farklıdır, çünkü keypad D2-D9'un hepsini alır:

| Parça | Bağlantı |
|---|---|
| Keypad 4x4 | Satırlar R1..R4 → **D9, D8, D7, D6**; sütunlar C1..C4 → **D5, D4, D3, D2** |
| Servo (kilit mandalı) | Sinyal → **D10**; kırmızı (+) → harici 5 V; kahverengi ya da siyah (-) → harici GND **ve** Arduino GND |
| Buzzer (pasif) | **D11** → buzzer → GND |
| Kırmızı LED ("kilitli") | **D12** → 330 Ω direnç → LED → GND |
| Yeşil LED ("açık") | **D13** → 330 Ω direnç → LED → GND |
| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → 5 V, GND → GND (adres 0x27) |
| Kart okuyucu | **Yok:** kart, seri monitörden `KART:AABBCCDD` yazılarak taklit edilir |

Kart okuyucu bu projede yoktur çünkü RC522 ile keypad ve diğer parçaların pinleri çakışır (63. dersteki çakışma tablosu). Seri taklit, **kart okuyucu yokken test için** kullanılan bir yöntemdir; gerçek RC522 değildir. Okuyucu ekleneceği gün `rc522_oku` programının yazdığı `KART:...` satırı, burada seri porttan gelen satırın yerini alır.

### Durum makinesi
| Durum | Servo | LED | Çıkış koşulu |
|---|---|---|---|
| KILITLI | 0° | Kırmızı yanık | Doğru PIN ya da yetkili kart: ACIK. 3. yanlış deneme: BLOKE |
| ACIK | 90° | Yeşil yanık | 5 sn dolunca: KILITLI |
| BLOKE | 0° | Kırmızı 2 Hz yanıp söner | 30 sn dolunca: KILITLI (yanlış sayacı sıfırlanır) |

ACIK ve BLOKE durumlarında tuşlara basmak ve kart göstermek etkisizdir. Kapı açıkken ek bir kart okutarak süreyi uzatma gibi bir kısayol yok; bilinçli bir sadelik.

### Program
```cpp
// sketch: akilli_kapi
#include <Keypad.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

// ---- Pinler ----
const int SERVO_PIN = 10;
const int BUZZER = 11;
const int KIRMIZI = 12;
const int YESIL = 13;

// ---- Ayarlar ----
const int ACIK_ACI = 90;
const int KILIT_ACI = 0;
const int PIN_UZUNLUK = 4;
const int AZAMI_YANLIS = 3;
const unsigned long ACIK_SURESI = 5000;        // ms
const unsigned long BLOK_SURESI = 30000;       // ms
const unsigned long MESAJ_SURESI = 1500;       // ms
const unsigned long GIRIS_ZAMAN_ASIMI = 10000; // ms: yarım kalan PIN silinir

// ---- EEPROM haritası (64. ders) ----
const int ADR_ISARET = 0;
const int ADR_KULLANICI_PIN = 1;
const int ADR_MASTER_PIN = 5;
const int ADR_KART_SAYISI = 9;
const int ADR_KARTLAR = 10;
const int MAX_KART = 8;
const byte ISARET = 0xA5;

// ---- Nesneler ----
const byte SATIR = 4;
const byte SUTUN = 4;
char tuslar[SATIR][SUTUN] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte satirPinleri[SATIR] = {9, 8, 7, 6};
byte sutunPinleri[SUTUN] = {5, 4, 3, 2};
Keypad tusTakimi = Keypad(makeKeymap(tuslar), satirPinleri, sutunPinleri, SATIR, SUTUN);
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo kilit;

// ---- Durum ----
enum Durum { KILITLI, ACIK, BLOKE };
Durum durum = KILITLI;

char girilen[PIN_UZUNLUK + 1];
int hane = 0;
int yanlis = 0;
unsigned long acikBitis = 0;
unsigned long blokBitis = 0;
unsigned long mesajBitis = 0;
unsigned long sonTus = 0;
bool mesajVar = false;
char mesajUst[17];
char mesajAlt[17];
char sonUst[17] = "";
char sonAlt[17] = "";

char satir[40];
int uzunluk = 0;

bool doldu(unsigned long simdi, unsigned long bitis) {
  return (long)(simdi - bitis) >= 0;           // millis() taşsa da doğru
}

// ---- Yardımcılar (63-64. dersler) ----
int hexDeger(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

bool uidCoz(const char* hex, byte uid[4]) {
  if (strlen(hex) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(hex[2 * i]);
    int alcak = hexDeger(hex[2 * i + 1]);
    if (yuksek < 0 || alcak < 0) return false;
    uid[i] = yuksek * 16 + alcak;
  }
  return true;
}

void uidYaz(const byte uid[4]) {
  for (int i = 0; i < 4; i++) {
    if (i > 0) Serial.print(' ');
    if (uid[i] < 16) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
}

bool pinGecerli(const char* s) {
  if (strlen(s) != PIN_UZUNLUK) return false;
  for (int i = 0; i < PIN_UZUNLUK; i++) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  return true;
}

// ---- EEPROM işlemleri (64. ders) ----
void pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {
  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);
  pin[PIN_UZUNLUK] = '\0';
}

void pinYaz(int adres, const char* pin) {
  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);
}

bool pinEsit(int adres, const char* girilenPin) {
  char kayitli[PIN_UZUNLUK + 1];
  pinOku(adres, kayitli);
  return strcmp(kayitli, girilenPin) == 0;
}

byte kartSayisi() {
  byte n = EEPROM.read(ADR_KART_SAYISI);
  if (n > MAX_KART) n = 0;
  return n;
}

void kartOku(int sira, byte uid[4]) {
  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);
}

void kartYaz(int sira, const byte uid[4]) {
  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);
}

int kartBul(const byte uid[4]) {
  byte n = kartSayisi();
  for (int i = 0; i < n; i++) {
    byte kayitli[4];
    kartOku(i, kayitli);
    if (memcmp(kayitli, uid, 4) == 0) return i;
  }
  return -1;
}

void fabrikaAyari() {
  pinYaz(ADR_KULLANICI_PIN, "1234");
  pinYaz(ADR_MASTER_PIN, "9999");
  EEPROM.update(ADR_KART_SAYISI, 0);
  EEPROM.update(ADR_ISARET, ISARET);
}

void kartEkle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (kartBul(uid) >= 0) { Serial.println("ZATEN VAR"); return; }
  byte n = kartSayisi();
  if (n >= MAX_KART) { Serial.println("LISTE DOLU"); return; }
  kartYaz(n, uid);
  EEPROM.update(ADR_KART_SAYISI, n + 1);
  Serial.print("EKLENDI (");
  Serial.print(n + 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void kartSil(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  int sira = kartBul(uid);
  if (sira < 0) { Serial.println("BULUNAMADI"); return; }
  byte n = kartSayisi();
  byte son[4];
  kartOku(n - 1, son);
  kartYaz(sira, son);
  EEPROM.update(ADR_KART_SAYISI, n - 1);
  Serial.print("SILINDI (");
  Serial.print(n - 1);
  Serial.print("/");
  Serial.print(MAX_KART);
  Serial.println(")");
}

void listele() {
  byte n = kartSayisi();
  Serial.print("Kart sayisi: ");
  Serial.println(n);
  for (int i = 0; i < n; i++) {
    byte uid[4];
    kartOku(i, uid);
    Serial.print(i + 1);
    Serial.print(": ");
    uidYaz(uid);
    Serial.println();
  }
}

// ---- Ekran ----
void satirYaz(int sira, const char* metin) {
  lcd.setCursor(0, sira);
  int boy = strlen(metin);
  for (int i = 0; i < 16; i++) lcd.print(i < boy ? metin[i] : ' ');
}

void ekran(const char* ust, const char* alt) {      // yalnız değişen satırı yeniden yazar
  if (strcmp(ust, sonUst) != 0) {
    satirYaz(0, ust);
    strncpy(sonUst, ust, 16);
    sonUst[16] = '\0';
  }
  if (strcmp(alt, sonAlt) != 0) {
    satirYaz(1, alt);
    strncpy(sonAlt, alt, 16);
    sonAlt[16] = '\0';
  }
}

void mesajGoster(const char* ust, const char* alt) {
  strncpy(mesajUst, ust, 16);
  mesajUst[16] = '\0';
  strncpy(mesajAlt, alt, 16);
  mesajAlt[16] = '\0';
  mesajVar = true;
  mesajBitis = millis() + MESAJ_SURESI;
}

// ---- Kilit mantığı ----
void girisiTemizle() {
  hane = 0;
  girilen[0] = '\0';
}

void erisimVer(const char* yontem) {
  durum = ACIK;
  yanlis = 0;
  mesajVar = false;
  girisiTemizle();
  kilit.write(ACIK_ACI);
  acikBitis = millis() + ACIK_SURESI;
  tone(BUZZER, 2000, 300);
  Serial.print("ACIK (");
  Serial.print(yontem);
  Serial.println(")");
}

void kilitle() {
  durum = KILITLI;
  kilit.write(KILIT_ACI);
  Serial.println("KILITLI");
}

void bloke() {
  durum = BLOKE;
  mesajVar = false;
  girisiTemizle();
  blokBitis = millis() + BLOK_SURESI;
  tone(BUZZER, 300, 1000);
  Serial.println("BLOKE 30 sn");
}

void erisimReddet(const char* yontem) {
  yanlis++;
  girisiTemizle();
  Serial.print("YANLIS ");
  Serial.print(yontem);
  Serial.print(" ");
  Serial.print(yanlis);
  Serial.print("/");
  Serial.println(AZAMI_YANLIS);
  if (yanlis >= AZAMI_YANLIS) {
    bloke();
    return;
  }
  tone(BUZZER, 400, 500);
  char alt[17];
  snprintf(alt, sizeof(alt), "Kalan hak: %d", AZAMI_YANLIS - yanlis);
  mesajGoster(strcmp(yontem, "PIN") == 0 ? "YANLIS PIN" : "YETKISIZ KART", alt);
}

void pinOnayla() {
  if (hane < PIN_UZUNLUK) {
    mesajGoster("PIN 4 haneli", "olmali");
    return;
  }
  if (pinEsit(ADR_KULLANICI_PIN, girilen)) erisimVer("PIN");
  else erisimReddet("PIN");
}

void kartIsle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (durum != KILITLI) { Serial.println("YOKSAYILDI"); return; }
  if (kartBul(uid) >= 0) erisimVer("KART");
  else erisimReddet("KART");
}

void tuslariIsle(unsigned long simdi) {
  char tus = tusTakimi.getKey();
  if (!tus) return;
  if (durum != KILITLI) return;                    // açıkken ve blokeyken tuşlar yok sayılır
  sonTus = simdi;
  mesajVar = false;
  if (tus >= '0' && tus <= '9') {
    if (hane < PIN_UZUNLUK) {
      girilen[hane] = tus;
      hane++;
      girilen[hane] = '\0';
      tone(BUZZER, 1000, 40);
    }
  } else if (tus == '*') {
    if (hane > 0) {
      hane--;
      girilen[hane] = '\0';
      tone(BUZZER, 700, 40);
    }
  } else if (tus == '#') {
    pinOnayla();
  }
}

// ---- Seri komutlar (kart taklidi + yönetim) ----
void komutIsle(char* s) {
  char* alan[3];
  int adet = 0;
  alan[adet++] = s;
  for (char* p = s; *p != '\0' && adet < 3; p++) {
    if (*p == ':') {
      *p = '\0';
      alan[adet++] = p + 1;
    }
  }

  if (strcmp(alan[0], "KART") == 0 && adet == 2) {
    kartIsle(alan[1]);
  } else if (strcmp(alan[0], "LISTE") == 0 && adet == 1) {
    listele();
  } else if (adet == 3 && (strcmp(alan[0], "EKLE") == 0 || strcmp(alan[0], "SIL") == 0 || strcmp(alan[0], "PINDEGIS") == 0)) {
    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {
      Serial.println("MASTER PIN YANLIS");
    } else if (strcmp(alan[0], "EKLE") == 0) {
      kartEkle(alan[2]);
    } else if (strcmp(alan[0], "SIL") == 0) {
      kartSil(alan[2]);
    } else if (!pinGecerli(alan[2])) {
      Serial.println("PIN 4 rakam olmali");
    } else {
      pinYaz(ADR_KULLANICI_PIN, alan[2]);
      Serial.println("PIN DEGISTI");
    }
  } else {
    Serial.println("Bilinmeyen komut");
  }
}

bool satirOku() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      satir[uzunluk] = '\0';
      uzunluk = 0;
      return true;
    }
    if (uzunluk < (int)sizeof(satir) - 1) {
      satir[uzunluk] = c;
      uzunluk++;
    }
  }
  return false;
}

// ---- Zamana bağlı işler ----
void durumGuncelle(unsigned long simdi) {
  if (durum == ACIK && doldu(simdi, acikBitis)) {
    kilitle();
  }
  if (durum == BLOKE && doldu(simdi, blokBitis)) {
    yanlis = 0;
    kilitle();
    Serial.println("BLOKE bitti");
  }
  if (durum == KILITLI && hane > 0 && doldu(simdi, sonTus + GIRIS_ZAMAN_ASIMI)) {
    girisiTemizle();
    Serial.println("Giris zaman asimi");
  }
  if (mesajVar && doldu(simdi, mesajBitis)) {
    mesajVar = false;
  }
}

void ledGuncelle(unsigned long simdi) {
  digitalWrite(YESIL, durum == ACIK ? HIGH : LOW);
  if (durum == BLOKE) {
    digitalWrite(KIRMIZI, (simdi / 250) % 2 == 0 ? HIGH : LOW);   // 2 Hz yanıp söner
  } else {
    digitalWrite(KIRMIZI, durum == KILITLI ? HIGH : LOW);
  }
}

void ekranGuncelle(unsigned long simdi) {
  char alt[17];
  if (durum == ACIK) {
    ekran("KAPI ACIK", "Hos geldiniz");
  } else if (durum == BLOKE) {
    unsigned long kalan = (blokBitis - simdi + 999) / 1000;      // yukarı yuvarla
    snprintf(alt, sizeof(alt), "Bekle: %lu sn", kalan);
    ekran("KILITLENDI", alt);
  } else if (mesajVar) {
    ekran(mesajUst, mesajAlt);
  } else if (hane > 0) {
    strcpy(alt, "PIN: ");
    for (int i = 0; i < hane; i++) alt[5 + i] = '*';
    alt[5 + hane] = '\0';
    ekran("KAPI KILITLI", alt);
  } else {
    ekran("KAPI KILITLI", "PIN veya kart");
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  kilit.attach(SERVO_PIN);
  kilit.write(KILIT_ACI);
  girisiTemizle();

  if (EEPROM.read(ADR_ISARET) != ISARET) {
    fabrikaAyari();
    Serial.println("Fabrika ayari yazildi");
  }

  lcd.init();
  lcd.backlight();
  Serial.println("Akilli kapi hazir");
}

void loop() {
  unsigned long simdi = millis();
  tuslariIsle(simdi);
  if (satirOku() && satir[0] != '\0') komutIsle(satir);
  durumGuncelle(simdi);
  ledGuncelle(simdi);
  ekranGuncelle(simdi);
}
```

### Nasıl çalışıyor?
1. **Üç durum, tek `durum` değişkeni.** `loop` her turda beş iş yapar: tuşlar, seri satır, zaman denetimi, LED'ler, ekran. Hiçbirinde `delay` yok; bu yüzden 30 saniyelik bekleme sırasında bile kart okutma ve tuşlara basma **dinlenir** (ve etkisiz sayıldığı için yok sayılır).
2. **Zaman denetimi** `doldu(simdi, bitis)` ile yapılır. `(long)(simdi - bitis) >= 0` ifadesi `millis()` 49 günde sıfırlanıp taşsa bile doğru çalışır (27. dersteki çıkarma kuralı).
3. **İki giriş yolu aynı sonuca varır.** PIN `pinOnayla()`, kart `kartIsle()` üzerinden geçer; ikisi de `erisimVer()` ya da `erisimReddet()` çağırır. Böylece yanlış sayacı **ortak** tutulur: iki yanlış PIN ve bir yetkisiz kart toplamda üç deneme sayılır.
4. **`erisimVer`** durumu ACIK yapar, servoyu 90° çevirir, sayacı sıfırlar ve 5 saniyelik süreyi başlatır. Süre dolunca `durumGuncelle` kapıyı yeniden kilitler.
5. **`erisimReddet`** sayacı artırır. Hak bittiyse `bloke()` çağrılır; bitmediyse kullanıcıya LCD'de "Kalan hak" gösterilir.
6. **LCD** `ekran()` fonksiyonuyla güncellenir; bu fonksiyon yalnızca **değişen** satırı yeniden yazar. Her turda 16 karakter yazsaydın I2C hattı gereksiz yere meşgul olurdu. Mesajlar Türkçe karakter içermez; 16x2 LCD'nin yerleşik karakter tablosunda ç, ş, ğ gibi harfler yoktur.
7. **Buzzer** `tone(pin, frekans, süre)` ile çalar; bu çağrı süre dolmasını beklemez (18. ders). Tuş sesi kısa ve yüksek, hata sesi uzun ve pestir.
8. **Yarım PIN silinir.** Biri 2 rakam girip gitmişse 10 saniye sonra girişi temizleriz; sonraki kişi başkasının yarım PIN'ini devralmaz.
9. **EEPROM** 64. dersteki harita ve işlemlerle aynıdır. Açılışta kayıtlı kart ve PIN korunur, yalnızca ilk kurulumda fabrika ayarı yazılır.

### Deneme senaryosu
Seri monitörde 9600 baud ve "Yeni satır" ayarıyla sırayla dene:

| Adım | Ne yap? | Ne olmalı? |
|---|---|---|
| 1 | `EKLE:9999:AABBCCDD` | `EKLENDI (1/8)`. Kart yetkili listesine girdi |
| 2 | Keypad'de `1 2 3 4 #` | Servo 90° olur, yeşil LED yanar, LCD "KAPI ACIK" yazar, seri monitörde `ACIK (PIN)` |
| 3 | 5 saniye bekle | Servo 0°'ye döner, kırmızı LED yanar, `KILITLI` yazılır |
| 4 | `KART:AABBCCDD` | Aynı biçimde açılır; seri monitörde `ACIK (KART)` |
| 5 | Keypad'de `0 0 0 0 #`, sonra `KART:11223344`, sonra `1 1 1 1 #` | Üç yanlış deneme; üçüncüde LCD "KILITLENDI", kırmızı LED yanıp söner |
| 6 | Bloke sırasında doğru PIN gir | Hiçbir şey olmaz; kapı açılmaz |
| 7 | 30 saniye bekle | `BLOKE bitti`, kapı yeniden normal çalışır |

### Dene
- `ACIK_SURESI` değerini 10 saniye yap. Başka bir yeri değiştirmen gerekti mi?
- Bloke süresini her bloke olduğunda iki katına çıkaran bir kural ekle (30 sn, 60 sn, 120 sn). Hangi değişkeni saklaman gerekir?
- Kapı açıkken yeşil LED'i saniyede bir yanıp söndür. Hangi fonksiyona yazacaksın?

### Sık yapılan hatalar
- Servoyu Arduino'nun 5 V pininden beslemek: kart sürekli yeniden başlar ya da LCD bozulur. Harici besleme ve ortak GND kullan.
- Servoyu D6'da bırakmak: D6 bu hafta keypad'in satır pinidir. Tuşlar yanlış okunur, servo titrer.
- `delay(5000)` ile kapıyı açık tutmak: bu sırada tuşlar ve seri komutlar kaçırılır, bloke mantığı da çalışmaz.
- Yanlış sayacını PIN ve kart için ayrı tutmak: saldırgan her yoldan ayrı ayrı 3 deneme yapabilir.
- Fabrika PIN'lerini (1234 ve 9999) değiştirmeden kullanmak. `PINDEGIS` ile kullanıcı PIN'ini değiştir. Master PIN'i değiştiren bir komut bu programda yok; ürün yapacak olsan eklemen gerekir.
- Bloke süresini `delay(30000)` ile beklemek: kapı 30 saniye boyunca hiçbir şeye tepki vermez, ekran da donar.

## Konuşalım
Bu kapı kilidi gerçek bir ev kapısına takılsaydı hangi açıklarla karşılaşırdın? Kablo ile kilidin kendisine ulaşan biri ne yapabilir? "Bilgisayara bağlı seri port" yönetimi nasıl korunmalı?
