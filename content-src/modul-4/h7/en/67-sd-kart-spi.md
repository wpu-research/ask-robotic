# SD card (SPI): writing to a file
duration: 25

## Wonder
Imagine you put a temperature meter in a garden and it stays there for three days. There is no computer and no Serial Monitor. Where will you write the measurements? EEPROM is only 1 KB (lesson 34); it fills up after a few hundred measurements. An SD card, however, gives you gigabytes of space, and you open the file on it directly on a computer. In this lesson you will learn how the Arduino writes a file to an SD card.

## Activity
### Circuit
**Lab note:** The lab has no SD card module part. In this lesson you write and compile the SD code; you cannot see a file actually being written to the card. In the lab, `SD.begin` gets stuck when it cannot find a card (on a real card it returns `false`). That is why, when you try the program, you print a progress message to the Serial monitor before `SD.begin`: if you see the message, the program has started but is waiting at `SD.begin`.

So there is no circuit to build in this lesson; you will not see an SD card in the **Add part** menu. The table below is information showing how the code would be connected to a real module (the pin names are the Uno's):

| SD card module pin | Uno pin |
|---|---|
| CS | **D10** |
| MOSI | **D11** |
| MISO | **D12** |
| SCK | **D13** |
| VCC | **5V** (check the module's documentation) |
| GND | **GND** |

**Important:** The SD card talks over SPI. On the Uno, the SPI pins are fixed: D11, D12, D13 and (in this lesson) D10 for CS. These pins are also used by Module 4's standard LEDs (D13/D12/D11) and the HC-SR04's ECHO (D10). In a circuit with an SD card, do not connect these parts to the same pins.

**For information:** SD cards work with 3.3 V logic. Most ready-made modules on the market have a voltage regulator and a level shifter, but you must check in the module's documentation that it is suitable for 5 V; a bare card slot is never connected directly to the Arduino's 5 V.

### SPI in short
SPI (you used it with the RC522 in lesson 63) has four lines:
- **SCK:** the clock. The Arduino makes one pulse for each bit.
- **MOSI:** data going from the Arduino to the card.
- **MISO:** data coming from the card to the Arduino.
- **CS:** the "select" line. There can be several devices on the line; the device whose CS is LOW listens.

You will measure their speed and how they differ from other protocols in lesson 69.

### Card format: FAT and the 8.3 file name
The Arduino's `SD.h` library needs a card formatted as FAT16 or FAT32. Large cards may have been formatted differently on a computer; when using a real card, make sure it is FAT32. According to the library's documentation, file names must be in **8.3** form: at most 8 characters, a dot, and an extension of at most 3 characters. `VERI.CSV` and `LOG0001.TXT` are valid; `sicaklik_kaydi.csv` is too long, so do not use it. Do not use Turkish characters or spaces either.

### Program: write to a file
You can paste the code into the editor in the lab and press ▶. Because there is no card, it waits at `SD.begin`; you only see the first message.

```cpp
// sketch: sd_yaz
#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;

void setup() {
  Serial.begin(9600);
  Serial.print("SD kart baslatiliyor... ");
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: kart yok ya da baglanti yanlis");
    while (true) {}
  }
  Serial.println("tamam");

  File dosya = SD.open("TEST.TXT", FILE_WRITE);   // yoksa oluşturur, varsa sonuna ekler
  if (dosya) {
    dosya.println("Merhaba SD kart");
    dosya.println(millis());
    dosya.close();                                // işin bitince mutlaka kapat
    Serial.println("Yazildi");
  } else {
    Serial.println("HATA: dosya acilamadi");
  }
}

void loop() {
}
```

`SD.begin(10)` starts the card and returns `false` if it fails. This happens if no card is inserted, if the wiring is wrong or if the CS pin is different. `SD.open("TEST.TXT", FILE_WRITE)` opens the file for writing. If the file does not exist, it is created; if it does, writing is **added to the end** and the old contents are not deleted. A `File` object comes back, and you write with `println` just as with `Serial.println`.

### Program: read the file back
```cpp
// sketch: sd_oku
#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;

void setup() {
  Serial.begin(9600);
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: SD kart baslatilamadi");
    while (true) {}
  }

  File dosya = SD.open("TEST.TXT");               // yalnız okumak için aç
  if (!dosya) {
    Serial.println("TEST.TXT bulunamadi");
    return;
  }
  while (dosya.available()) {                     // okunacak bayt kaldıkça
    Serial.write(dosya.read());
  }
  dosya.close();
}

void loop() {
}
```

### Closing and flush: where does the data go?
When you say `dosya.println(...)`, the data may not go to the card straight away. The library first collects what you write in a small buffer in the Arduino's RAM. According to the Arduino documentation, the data is physically written to the card with **`close()` or `flush()`**. So:

- When you are done, call `dosya.close()`.
- If you are going to keep the file open for a long time, call `dosya.flush()` after every write.
- **On a real device, the file must be closed (or last flushed) before you remove the card or cut the power.** If the card is removed without closing the file, the last lines can be lost or the file can be corrupted. The lab does not model removing the card or cutting the power.

The program below opens the file once, writes a line every second and calls `flush()` after every write.

```cpp
// sketch: sd_flush
#include <SPI.h>
#include <SD.h>

const int SD_CS = 10;
const unsigned long ARALIK = 1000;                // ms

File dosya;
unsigned long sonYazma = 0;
int sayac = 0;

void setup() {
  Serial.begin(9600);
  if (!SD.begin(SD_CS)) {
    Serial.println("HATA: SD kart baslatilamadi");
    while (true) {}
  }
  dosya = SD.open("SAYAC.TXT", FILE_WRITE);
  if (!dosya) {
    Serial.println("HATA: dosya acilamadi");
    while (true) {}
  }
}

void loop() {
  if (millis() - sonYazma >= ARALIK) {
    sonYazma = millis();
    sayac++;
    dosya.print("satir ");
    dosya.println(sayac);
    dosya.flush();                                // veriyi karta gönder, dosya açık kalsın
    Serial.println(sayac);
  }
}
```

The difference between the two methods: **open-write-close** opens the file again each time, so after every write the file is closed and it is in the safest state if the power is cut. **Keep open and flush** opens the file once. Both work; in lesson 68 you will use the first, because it is safe and simple.

### How does it work?
1. `SD.begin(10)` starts SPI and talks to the card. If it succeeds, it returns `true`.
2. `SD.open(ad, FILE_WRITE)` (name) gives a `File` object. The `if (dosya)` check tells you whether it opened.
3. `print` and `println` add text to the file. They write numbers as text too.
4. `close()` and `flush()` send the data in the buffer to the card.
5. When reading, `available()` checks whether there are bytes left to read, and `read()` gives one byte.

### Try it
There is no SD in the lab; these tasks are exercises in reading and writing code.
- If you ran the `sd_yaz` program twice, how many lines would there be in `TEST.TXT`? Does `FILE_WRITE` write the file from the start, or add to the end? Find the answer in the explanation above.
- In the `sd_flush` program, if you commented out the `dosya.flush()` line and suddenly cut the power, which lines would be missing from the file? Why?
- In the `sd_yaz` program, change the file name to `"sicaklik_kaydi.csv"`. According to the 8.3 rule, what does `SD.open` return with this name (does the file open)? Which line of the program catches this situation?
- Run the `sd_yaz` program in the lab. Which text do you see on the Serial monitor, and which do you not see? Where is the program waiting?

### Common mistakes
- Removing the card or cutting the power without calling `close()` or `flush()` (on a real device): the last lines go missing or the file is corrupted.
- Using a long file name, or one with Turkish characters: follow the 8.3 rule.
- Writing the CS pin wrongly: `SD.begin(10)` must match the module's CS connection. Even if you make another pin CS, leave D10 as an output on the Uno; the Arduino SD documentation asks for this.
- Leaving the card in a format other than FAT32: `SD.begin` can fail.
- Forgetting the SD library's RAM use: in lesson 34 you saw that SRAM is only 2048 bytes. SD takes a serious share for its buffer; in lesson 70 you will see how much in the compile output.
- Connecting LEDs to D13 and D11 and using SD at the same time: these pins are the SPI lines.

## Discuss
Why is it risky to remove the SD card from a real device while the power is on? Why do you think it makes sense for real recording devices to have a "safely remove card" button or light?
