# Access management: card + password + EEPROM
duration: 35

## Wonder
When a new tenant moves into a block of flats, the manager does not plug the door's program into a computer and upload it again. The tenant's card is added with a command, and the old tenant's card is deleted. What is more, the list is not lost even if the power goes off. In this lesson you will write a system that saves the authorised cards and the PIN to EEPROM and manages access with a **master PIN**.

## Activity
### What are we going to do?
We will keep three things in EEPROM (lesson 34):
- The user PIN (the PIN that opens the door)
- The master PIN (the management PIN; for adding and deleting cards and changing the user PIN)
- The list of authorised card UIDs (at most 8 cards)

Because the card reader, the keypad and the other parts do not fit on the Uno's pins together (lesson 63), we **imitate the cards and the PIN entry with serial commands**. In this lesson you do not build a circuit; in the lab the Uno and the Serial monitor are enough. Type the command into the box at the bottom of the Serial monitor and press **Send** (the program must be running); the lab adds the end of line by itself.

### Commands
| Command | What does it do? |
|---|---|
| `KART:AABBCCDD` | Acts as if a card had been read; if it is in the list, YETKILI (authorised) |
| `GIRIS:1234` | Acts as if a PIN had been entered on the keypad |
| `EKLE:9999:AABBCCDD` | If the master PIN is correct, adds the card to the list |
| `SIL:9999:AABBCCDD` | If the master PIN is correct, deletes the card from the list |
| `PINDEGIS:9999:4321` | If the master PIN is correct, changes the user PIN |
| `LISTE` | Shows the saved cards |

The commands are split into fields with a colon (`:`). (`KART` means card, `GIRIS` entry, `EKLE` add, `SIL` delete, `PINDEGIS` change PIN, `LISTE` list.) Factory settings: user PIN `1234`, master PIN `9999`, no cards.

### The EEPROM map
Every piece of information must have a fixed address; otherwise you write one on top of another:

| Address | Size | Contents |
|---|---|---|
| 0 | 1 byte | Setup marker (`0xA5`) |
| 1-4 | 4 bytes | User PIN (digit characters) |
| 5-8 | 4 bytes | Master PIN |
| 9 | 1 byte | Number of saved cards |
| 10-41 | 8 × 4 bytes | Card UIDs |

The **setup marker** is important. A new EEPROM has `255` in every cell (lesson 34); the program must not mistake this for a PIN. At start-up, if `0xA5` is not there, the factory settings are written. We write the marker **last**: if setup is interrupted half-way (for example by a power cut), the marker will not have been written, and the program does the setup again at the next start-up.

### EEPROM wear
Each cell is guaranteed for about 100,000 writes (lesson 34). In this system the cells rarely change, but we still follow two rules:
- For every write we use `EEPROM.update`. If the value is already the same, nothing is written.
- **Reading** a card writes nothing. The `KART` and `GIRIS` commands do not write to EEPROM; writing only happens with `EKLE`, `SIL`, `PINDEGIS` and at the first setup.

When deleting a card, instead of rewriting the list from the start, we **copy the last card into the deleted one's place** and reduce the counter by one. That way at most one card (4 bytes) and one counter are written.

### Program
```cpp
// sketch: yetki_yonetimi
#include <EEPROM.h>

const int ADR_ISARET = 0;
const int ADR_KULLANICI_PIN = 1;
const int ADR_MASTER_PIN = 5;
const int ADR_KART_SAYISI = 9;
const int ADR_KARTLAR = 10;
const int MAX_KART = 8;
const int PIN_UZUNLUK = 4;
const byte ISARET = 0xA5;

char satir[40];
int uzunluk = 0;

// ---- Yardımcılar ----
int hexDeger(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

bool uidCoz(const char* hex, byte uid[4]) {      // "AABBCCDD" -> 4 bayt
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

bool pinGecerli(const char* s) {                 // tam 4 rakam mı?
  if (strlen(s) != PIN_UZUNLUK) return false;
  for (int i = 0; i < PIN_UZUNLUK; i++) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  return true;
}

// ---- EEPROM işlemleri ----
void pinOku(int adres, char pin[PIN_UZUNLUK + 1]) {
  for (int i = 0; i < PIN_UZUNLUK; i++) pin[i] = EEPROM.read(adres + i);
  pin[PIN_UZUNLUK] = '\0';
}

void pinYaz(int adres, const char* pin) {
  for (int i = 0; i < PIN_UZUNLUK; i++) EEPROM.update(adres + i, pin[i]);
}

bool pinEsit(int adres, const char* girilen) {
  char kayitli[PIN_UZUNLUK + 1];
  pinOku(adres, kayitli);
  return strcmp(kayitli, girilen) == 0;
}

byte kartSayisi() {
  byte n = EEPROM.read(ADR_KART_SAYISI);
  if (n > MAX_KART) n = 0;                       // bozuk ya da boş (255)
  return n;
}

void kartOku(int sira, byte uid[4]) {
  for (int j = 0; j < 4; j++) uid[j] = EEPROM.read(ADR_KARTLAR + sira * 4 + j);
}

void kartYaz(int sira, const byte uid[4]) {
  for (int j = 0; j < 4; j++) EEPROM.update(ADR_KARTLAR + sira * 4 + j, uid[j]);
}

int kartBul(const byte uid[4]) {                 // sırası ya da -1
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
  EEPROM.update(ADR_ISARET, ISARET);             // en son: kurulum tamamlandı
}

// ---- Komutlar ----
void kartEkle(const char* hex) {
  byte uid[4];
  if (!uidCoz(hex, uid)) { Serial.println("Gecersiz UID"); return; }
  if (kartBul(uid) >= 0) { Serial.println("ZATEN VAR"); return; }
  byte n = kartSayisi();
  if (n >= MAX_KART) { Serial.println("LISTE DOLU"); return; }
  kartYaz(n, uid);
  EEPROM.update(ADR_KART_SAYISI, n + 1);         // sayaç en son: yarım kayıt görünmez
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
  kartYaz(sira, son);                            // son kartı boşalan yere taşı
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

void komutIsle(char* s) {
  char* alan[3];
  int adet = 0;
  alan[adet++] = s;
  for (char* p = s; *p != '\0' && adet < 3; p++) {
    if (*p == ':') {                             // ':' yerine bitiş işareti koy, yeni alan başlat
      *p = '\0';
      alan[adet++] = p + 1;
    }
  }

  if (strcmp(alan[0], "KART") == 0 && adet == 2) {
    byte uid[4];
    if (!uidCoz(alan[1], uid)) Serial.println("Gecersiz UID");
    else Serial.println(kartBul(uid) >= 0 ? "YETKILI" : "YETKISIZ");
  } else if (strcmp(alan[0], "GIRIS") == 0 && adet == 2) {
    Serial.println(pinEsit(ADR_KULLANICI_PIN, alan[1]) ? "PIN DOGRU" : "PIN YANLIS");
  } else if (strcmp(alan[0], "LISTE") == 0 && adet == 1) {
    listele();
  } else if (adet == 3 && (strcmp(alan[0], "EKLE") == 0 || strcmp(alan[0], "SIL") == 0 || strcmp(alan[0], "PINDEGIS") == 0)) {
    if (!pinEsit(ADR_MASTER_PIN, alan[1])) {     // üç yönetim komutu da master PIN ister
      Serial.println("MASTER PIN YANLIS");
    } else if (strcmp(alan[0], "EKLE") == 0) {
      kartEkle(alan[2]);
    } else if (strcmp(alan[0], "SIL") == 0) {
      kartSil(alan[2]);
    } else {
      if (!pinGecerli(alan[2])) {
        Serial.println("PIN 4 rakam olmali");
      } else {
        pinYaz(ADR_KULLANICI_PIN, alan[2]);
        Serial.println("PIN DEGISTI");
      }
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

void setup() {
  Serial.begin(9600);
  if (EEPROM.read(ADR_ISARET) != ISARET) {
    fabrikaAyari();
    Serial.println("Fabrika ayari yazildi");
  }
  Serial.print("Yetki sistemi hazir. Kart sayisi: ");
  Serial.println(kartSayisi());
}

void loop() {
  if (satirOku() && satir[0] != '\0') {
    komutIsle(satir);
  }
}
```

### How does it work?
1. `setup` looks at the setup marker. At the first start-up it writes the factory settings; at later start-ups it **writes nothing** to EEPROM, it only reads.
2. `komutIsle` (process command) cuts the line at the `:` signs. `alan[0]` (field) is the command, and `alan[1]` and `alan[2]` are the parameters. Because we put a `'\0'` in place of each `:` inside the line, each field becomes a C text of its own (it can be compared with `strcmp` from lesson 62).
3. The three management commands (`EKLE`, `SIL`, `PINDEGIS`) go through the same place, and all of them check the master PIN first. If the master PIN is wrong, the EEPROM is not touched.
4. `kartEkle` (add card) first searches for the card; if it is already there, it does not write (`ZATEN VAR`, already there). It writes the new card at the end of the list and raises the **counter last**. If the power goes during writing, the counter has not gone up, so the half-written card does not appear in the list.
5. `kartSil` (delete card) moves the last card into the deleted one's place. The counter goes down by one, so the last card's old bytes are no longer used. As a result, the list never has gaps.
6. The `PIN` is stored in EEPROM as digit characters; the saved PIN and the incoming text are compared with `strcmp`.
7. An empty (`255`) or corrupt card counter is counted as 0 inside `kartSayisi()` (number of cards); the list does not overflow.

### Try it
- `EKLE:9999:AABBCCDD`, then `LISTE`, then `EKLE` the card again. What does it print the second time? Was it written to EEPROM? (Answer: it was not written, because `kartBul` (find card) found the card.)
- Add three cards, delete the middle one with `SIL`, and see the order with `LISTE`. Where did the last card go?
- Add a card and change the PIN with `PINDEGIS`. Then stop with ■ and start again with ▶, and type `LISTE`. What do you see? The EEPROM in the lab is kept when the power goes off, just as on a real board: the card list stays in place, and `Fabrika ayari yazildi` (factory settings written) does not appear again at start-up (the marker byte is now written). To wipe the data, press ↺ Reset; the EEPROM is emptied and the factory settings are written again.

### Common mistakes
- Not adding a setup marker: you mistake the `255` values in an empty EEPROM for a PIN.
- Using `EEPROM.write`: it writes the same value again every time and wears the cell out for nothing.
- Raising the counter before writing the card: if the power goes during writing, a half card can look authorised.
- Making the master PIN and the user PIN the same: management rights are opened to everyone.
- Leaving the master PIN open to unlimited attempts. In this lesson there is no attempt limit for the master PIN; someone with a computer connected to the serial port can try more than anyone. In a real product this is limited, or the management commands are kept switched off.

## Discuss
Is it enough to delete the card of someone who lost it from the list? Does the PIN need to be changed too? In which situation is which one needed?
