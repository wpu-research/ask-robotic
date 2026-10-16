# RFID RC522 (SPI): reading a card
duration: 30

## Wonder
You hold your bus card up to the reader; the card has no battery, yet the reader recognises it. Where does the card get its energy from? And how does the reader find out "who" the card is? In this lesson you will get to know the card reader, but you will also run into an honest problem: this week the Arduino Uno does not have enough pins.

## Activity
### What is RFID?
RFID means reading an identity with radio waves. The RC522 module produces a 13.56 MHz field. The card (or key fob) has no battery inside; it only has an antenna and a small chip. When the card enters the reader's field, it takes energy from the field and sends back the data in its memory. The data we will read in this lesson is the card's **UID** (unique identification number). On common MIFARE cards the UID is 4 bytes; on some cards it is 7 or 10 bytes. We will handle a 4-byte UID.

**Important:** A UID is not a password. Anyone who can read the card can learn the UID, and some special cards can copy a UID. That is why serious locks do not trust the UID alone. This week we will use the card together with a PIN.

### What is SPI?
The RC522 talks to the Arduino over **SPI**. SPI is a fast, four-wire way of communicating (it uses four wires, compared with the two wires of I2C in lesson 33):

| Wire | Job | Uno pin |
|---|---|---|
| SCK | Clock pulse (made by the Arduino) | **D13** |
| MOSI | Data from the Arduino to the module | **D11** |
| MISO | Data from the module to the Arduino | **D12** |
| SS (SDA) | The "I have chosen you" line; the module listens while it is LOW | **D10** (can be changed) |

On top of these, the RC522 has an **RST** (reset) pin. On the Uno, the SCK, MOSI and MISO pins are fixed by the hardware and cannot be changed. SS and RST, however, can be connected to any pin you like.

### Circuit
The lab has no RC522 part and no card. The real module is connected like this (for information):

| Part | Connection |
|---|---|
| RC522 module | SDA(SS) → **D10**, SCK → **D13**, MOSI → **D11**, MISO → **D12**, RST → **D9**, GND → GND, 3.3V → **3.3 V** |

**Power warning (for the real module):** The RC522 is a **3.3 V** module. Do not connect its 3.3V pin to the Uno's 5 V output; the module can be damaged. The module's data pins are also designed for 3.3 V. The Uno gives 5 V signals; although many people connect the module directly, the safe way is to use a level shifter or a resistor divider. Check the module's datasheet.

In the lab we will imitate the card from the Serial monitor. Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires:

| Part | Connection |
|---|---|
| LED (green) | **D13** → resistor (330 Ω) 1; resistor 2 → LED **A**; LED **K** → **GND** |
| LED (red) | **D12** → resistor (330 Ω) 1; resistor 2 → LED **A**; LED **K** → **GND** |

### Program 1: Read the card
A program that writes the card's UID to the serial port with the `MFRC522` library:

```cpp
// sketch: rc522_oku
#include <SPI.h>
#include <MFRC522.h>

const int SS_PIN = 10;
const int RST_PIN = 9;

MFRC522 okuyucu(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();               // SPI hattını başlat
  okuyucu.PCD_Init();        // RC522'yi başlat
}

void loop() {
  if (!okuyucu.PICC_IsNewCardPresent()) return;   // yeni kart yok
  if (!okuyucu.PICC_ReadCardSerial()) return;     // UID okunamadı

  Serial.print("KART:");
  for (byte i = 0; i < okuyucu.uid.size; i++) {
    if (okuyucu.uid.uidByte[i] < 16) Serial.print('0');
    Serial.print(okuyucu.uid.uidByte[i], HEX);
  }
  Serial.println();

  okuyucu.PICC_HaltA();        // aynı kartı tekrar tekrar okumayı bırak
}
```

This sketch uses a library; it compiles in the lab, but because there is no RC522 part, it never finds a card while it runs and gives no output. `PICC_IsNewCardPresent()` returns `true` if there is a new card in the field, and `PICC_ReadCardSerial()` fills the UID into `okuyucu.uid` (reader). We deliberately print the output in the form `KART:AABBCCDD` (card); in a moment we will send this line to the program "as if a card had arrived".

### An honest problem: the pins clash
In this week's project the keypad, servo, buzzer, LEDs and LCD will all be together. Put the pins side by side:

| Pin | Keypad (62) | RC522 (this lesson) | Door lock project (65) |
|---|---|---|---|
| D9 | row 1 | RST | keypad row 1 |
| D10 | none | SS | servo |
| D11 | none | MOSI (fixed) | buzzer |
| D12 | none | MISO (fixed) | red LED |
| D13 | none | SCK (fixed) | green LED |

The D9 clash in the table only appears because we chose to connect RST to D9; SS and RST can go on any pin. The real problem is the total number of pins. The project needs: keypad 8, the RC522's three fixed SPI pins 3, SS and RST 2, servo 1, buzzer 1, two LEDs 2; a total of **17 pins**. On the Uno, D2-D13 (12 pins) and A0-A3 (4 pins) can be used (the I2C LCD takes A4 and A5): a total of **16 pins**. What is more, SPI's D11, D12 and D13 pins are fixed and are set aside for the buzzer and LEDs in the project. The keypad and the RC522 on their own fit on the Uno (8 + 5 = 13 pins), but all of them together do not. If you were making a real product, you would pick one of these ways:
- A board with more pins (for example the Arduino Mega).
- A way of reading the keypad with fewer pins (for example an I2C expander module).
- Moving the LEDs and the buzzer to pins A0-A3 (the analogue pins can also be used as digital outputs). Even this is not enough, because 17 pins do not fit into 16; also, we have not tried it in this lesson.

This week we choose a different way: **in the project we will imitate the card from the serial port**. Instead of the reader, you will type `KART:AABBCCDD` into the lab's Serial monitor; the program will count this as a card being read. This is a **serial imitation for testing while there is no card reader**; it is not a real RC522. And because the `rc522_oku` program prints the same line, if you add the reader later, only the place the card data comes from changes; the permission logic stays exactly the same.

### Program 2: Card test with a serial imitation
This program reads a line from the serial port. If the line starts with `KART:` followed by 8 hexadecimal digits (4 bytes), it decodes the UID and compares it with the list of authorised cards. We do not use `delay` or `readStringUntil`: we collect the line character by character, so the program can do other jobs while it waits.

```cpp
// sketch: kart_taklit
const int YESIL = 13;
const int KIRMIZI = 12;
const byte YETKILI_UID[4] = {0xAA, 0xBB, 0xCC, 0xDD};   // tek örnek yetkili kart
const unsigned long LED_SURESI = 1000;

char satir[24];
int uzunluk = 0;
unsigned long ledBitis = 0;

int hexDeger(char c) {                      // '0'-'9','A'-'F','a'-'f' -> 0-15; olmazsa -1
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  return -1;
}

// Seri porttan karakterleri biriktirir. Satır bitince true döner.
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

// "KART:AABBCCDD" satırını 4 baytlık UID'ye çevirir. Biçim bozuksa false döner.
bool uidCoz(const char* s, byte uid[4]) {
  if (strncmp(s, "KART:", 5) != 0) return false;
  s += 5;                                    // "KART:" kısmını atla
  if (strlen(s) != 8) return false;
  for (int i = 0; i < 4; i++) {
    int yuksek = hexDeger(s[2 * i]);
    int alcak = hexDeger(s[2 * i + 1]);
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

void setup() {
  Serial.begin(9600);
  pinMode(YESIL, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
}

void loop() {
  if (satirOku() && satir[0] != '\0') {
    byte uid[4];
    if (!uidCoz(satir, uid)) {
      Serial.println("Gecersiz satir");
    } else {
      Serial.print("UID: ");
      uidYaz(uid);
      Serial.println();
      if (memcmp(uid, YETKILI_UID, 4) == 0) {
        Serial.println("YETKILI");
        digitalWrite(YESIL, HIGH);
      } else {
        Serial.println("YETKISIZ");
        digitalWrite(KIRMIZI, HIGH);
      }
      ledBitis = millis() + LED_SURESI;
    }
  }

  if (ledBitis != 0 && (long)(millis() - ledBitis) >= 0) {
    digitalWrite(YESIL, LOW);
    digitalWrite(KIRMIZI, LOW);
    ledBitis = 0;
  }
}
```

First run the program with ▶. Then type `KART:AABBCCDD` into the box at the bottom of the Serial monitor and press **Send**. The lab adds the end of line (`\n`) by itself; you do not need to change any setting.

### How does it work?
1. On every pass, `satirOku()` (read line) adds the incoming characters to the `satir` (line) array. When `\n` arrives, it ends the line. A line that arrives half-way carries on in the next pass; the program never waits anywhere.
2. `uidCoz` (decode UID) first checks the `KART:` prefix (`strncmp` compares the first 5 characters), then makes sure that all 8 characters are hexadecimal digits. Two hexadecimal digits make one byte: `yuksek * 16 + alcak` (high, low).
3. `hexDeger` (hex value) produces the values 10-15 by subtracting the code of `'A'` from the character and adding 10. A UID typed in small letters, `aabbccdd`, is accepted too.
4. `memcmp(a, b, 4)` compares 4 bytes of two memory areas; if they are all the same, it returns `0`. This is the shortest way to compare a 4-byte UID (`==` does not work on arrays).
5. Badly formed lines (`KART:AABB`, `KART:ZZZZZZZZ`, `MERHABA` (hello)) are rejected as "Gecersiz satir" (invalid line); the part that opens the door never runs.

### Try it
- Write a different value in place of `YETKILI_UID` (for example `{0x01, 0x02, 0x03, 0x04}`), run the program again and send the new UID. Is the old UID now unauthorised?
- Send a wrong UID: does the red LED light up?
- Send the UID in capital and small letters (`AABBCCDD` and `aabbccdd`). Do both give the same result?

### Common mistakes
- Powering a real RC522 with 5 V.
- In a real circuit, setting the SS and RST pins to one place in the sketch and wiring them to another.
- Trying to send a line while the program is not running (before pressing ▶): the box is closed and shows "Start first".
- Leaving out the `KART:` prefix or some of the 8 hexadecimal digits: the program says `Gecersiz satir`.
- Thinking the UID is safe on its own: a UID can be read and copied with some cards.
- Giving the same pins to two devices at once (this lesson's clash table).

## Discuss
Why do you think it is a good idea to split the permission check into two parts, "the part that reads the card" and "the part that opens the door"? If you wanted to change the card reader later, which part would you change?
