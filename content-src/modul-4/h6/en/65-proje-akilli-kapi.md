# Project: Smart door lock
duration: 40

## Wonder
In a hotel you hold your card to the room door, a green light comes on, the lock opens, and a few seconds later it closes by itself. If you enter the wrong code three times, though, the door ignores you for a while. The parts you learnt about this week are exactly for this: the keypad, the card, the access list in EEPROM. Now you will combine all of them with a servo, a screen and a buzzer to make a working door lock.

## Activity
### What are we going to do?
This project brings together these things from earlier lessons:
- **This week:** PIN entry with the keypad (62), card reading with the serial imitation (63), the PIN and card list in EEPROM, management with the master PIN (64).
- **Module 3, week 5:** A lock latch with a servo (lesson 21).
- **Module 3, week 6:** Non-blocking timing and a state machine with `millis()` (lessons 27-28).
- **Module 3, week 7:** The I2C LCD screen (lessons 32-33) and EEPROM (lesson 34).

The rule is:
- The right PIN or an authorised card: the door opens for **5 seconds**, then locks by itself.
- A wrong PIN or an unauthorised card uses up one attempt. After **3 wrong attempts**, the door accepts no input for **30 seconds**.
- Every event is shown on the screen and turned into sound with the buzzer.

### Circuit
In this project the lock is just a servo. In the lab it is enough to connect the servo's VCC pin to the Uno's 5V pin. In a real circuit even a small servo can draw too much current when it starts; that is why in real door projects the servo is powered from a separate 5 V supply, and the supply's GND is joined to the Arduino's GND (common GND). This is real-world knowledge, not something you need to do in the lab.

This week's pins are different from Module 4's standard table, because the keypad takes all of D2-D9. Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires:

| Part | Connection |
|---|---|
| 4x4 keypad | Rows R1..R4 → **D9, D8, D7, D6**; columns C1..C4 → **D5, D4, D3, D2** |
| Servo (lock latch) | SIG → **D10**; VCC → **5V**; GND → **GND** |
| Buzzer (passive) | **+** → **D11**; **-** → **GND** |
| Red LED ("locked") | **D12** → resistor (330 Ω) 1; resistor 2 → LED **A**; LED **K** → **GND** |
| Green LED ("open") | **D13** → resistor (330 Ω) 1; resistor 2 → LED **A**; LED **K** → **GND** |
| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → **5V**, GND → **GND** (address 0x27) |
| Card reader | **None:** the card is imitated by typing `KART:AABBCCDD` in the Serial monitor |

The buzzer's **Type** property must be "Passive" (`tone()` works with a passive buzzer). There is no card reader in this project because everything together does not fit on the Uno's pins: the RC522 plus the keypad, servo, buzzer and two LEDs need 17 pins in total, and 16 pins can be used on the Uno (the calculation in lesson 63). The serial imitation is a method used **for testing while there is no card reader**; it is not a real RC522. On the day the reader is added, the `KART:...` line printed by the `rc522_oku` program takes the place of the line coming from the serial port here.

### State machine
| State | Servo | LED | Exit condition |
|---|---|---|---|
| KILITLI (locked) | 0° | Red on | Right PIN or authorised card: ACIK. 3rd wrong attempt: BLOKE |
| ACIK (open) | 90° | Green on | When 5 s are up: KILITLI |
| BLOKE (blocked) | 0° | Red flashes at 2 Hz | When 30 s are up: KILITLI (the wrong-attempt counter is reset) |

In the ACIK and BLOKE states, pressing keys and showing a card have no effect. There is no shortcut such as showing another card while the door is open to make the time longer; this simplicity is deliberate.

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

### How does it work?
1. **Three states, one `durum` (state) variable.** On every pass, `loop` does five jobs: keys, serial line, time check, LEDs, screen. None of them has a `delay`; that is why, even during the 30-second wait, card reads and key presses are **listened to** (and ignored, because they count as having no effect).
2. **The time check** is done with `doldu(simdi, bitis)` (is it up: now, end). The expression `(long)(simdi - bitis) >= 0` works correctly even when `millis()` goes back to zero and overflows after 49 days (the subtraction rule from lesson 27).
3. **Both ways in lead to the same result.** The PIN goes through `pinOnayla()` (confirm PIN), and the card through `kartIsle()` (process card); both call `erisimVer()` (grant access) or `erisimReddet()` (deny access). That way the wrong-attempt counter is kept **shared**: two wrong PINs and one unauthorised card count as three attempts in total.
4. **`erisimVer`** sets the state to ACIK, turns the servo to 90°, resets the counter and starts the 5-second timer. When the time is up, `durumGuncelle` (update state) locks the door again.
5. **`erisimReddet`** raises the counter. If the attempts have run out, `bloke()` is called; if not, the user is shown "Kalan hak" (attempts left) on the LCD.
6. **The LCD** is updated with the `ekran()` (screen) function; this function rewrites only the line that has **changed**. If you wrote 16 characters on every pass, the I2C line would be kept busy for nothing. The messages contain no Turkish characters; the 16x2 LCD's built-in character table does not have letters such as the Turkish c-cedilla, s-cedilla or soft g.
7. **The buzzer** plays with `tone(pin, frekans, süre)` (pin, frequency, duration); this call does not wait for the time to run out (lesson 18). The key sound is short and high; the error sound is long and low.
8. **A half-entered PIN is deleted.** If someone has entered 2 digits and walked away, we clear the entry after 10 seconds; the next person does not inherit someone else's half PIN.
9. **The EEPROM** works with the same map and functions as in lesson 64. At start-up, the saved cards and PIN are kept; the factory settings are written only at the very first setup.

### Test scenario
Run the program with ▶ and try these in order. Type the commands into the Serial monitor's box and press **Send**. For the keypad keys, select the keypad and pick each key in turn from the **Pressed key** list in the right panel; after each key, set the list back to **None** (leaving a key selected means holding it down). Watch the text on the LCD and the servo's angle on the canvas.

| Step | What do you do? | What should happen? |
|---|---|---|
| 1 | `EKLE:9999:AABBCCDD` | `EKLENDI (1/8)` (added). The card has entered the authorised list |
| 2 | On the keypad, `1 2 3 4 #` | The servo goes to 90°, the green LED lights, the LCD says "KAPI ACIK" (door open), the Serial monitor shows `ACIK (PIN)` |
| 3 | Wait 5 seconds | The servo returns to 0°, the red LED lights, `KILITLI` is printed |
| 4 | `KART:AABBCCDD` | It opens in the same way; the Serial monitor shows `ACIK (KART)` |
| 5 | On the keypad, `0 0 0 0 #`, then `KART:11223344`, then `1 1 1 1 #` | Three wrong attempts; on the third, the LCD says "KILITLENDI" (locked out) and the red LED flashes |
| 6 | Enter the right PIN during the block | Nothing happens; the door does not open |
| 7 | Wait 30 seconds | `BLOKE bitti` (block over), the door works normally again |

### Try it
- Set `ACIK_SURESI` (open time) to 10 seconds. Did you need to change anything else?
- Add a rule that doubles the block time every time it blocks (30 s, 60 s, 120 s). Which variable do you need to keep?
- While the door is open, make the green LED flash once a second. Which function will you write it in?

### Common mistakes
- In a real circuit, powering the servo from the Arduino's 5 V pin: the board can keep restarting, or the LCD can go wrong. In a real project a separate supply and a common GND are used. In the lab, though, do not forget to connect the servo's VCC and GND pins: if you do not, the servo does not move.
- Leaving the servo on D6: this week D6 is one of the keypad's row pins. The keys are read wrongly and the servo jitters.
- Keeping the door open with `delay(5000)`: during that time keys and serial commands are missed, and the blocking logic does not work either.
- Keeping separate wrong-attempt counters for the PIN and the card: an attacker can make 3 attempts separately through each way.
- Using the factory PINs (1234 and 9999) without changing them. Change the user PIN with `PINDEGIS`. There is no command in this program that changes the master PIN; if you were making a product, you would need to add one.
- Waiting out the block time with `delay(30000)`: the door does not react to anything for 30 seconds, and the screen freezes too.

## Discuss
If this door lock were fitted to a real front door, what weaknesses would you run into? What could someone who reaches the wires and the lock itself do? How should management through "a serial port connected to a computer" be protected?
