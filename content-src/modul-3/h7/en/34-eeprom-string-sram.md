# EEPROM, String and SRAM
duration: 25

## Wonder
When a device's power is cut and switched back on, the values of all its variables are reset. How will the thermostat remember its "target temperature 24 degrees" setting? And the Uno's memory is very small: not even one phone photo fits in it. How do we use this small memory wisely?

## Activity
### Three memories
The Arduino Uno (ATmega328P) has three separate memories:

| Memory | Size | What does it hold? | When the power is cut? |
|---|---|---|---|
| Flash | 32 KB | The program itself | Stays |
| SRAM | 2 KB | Variables while running | Erased |
| EEPROM | 1 KB | Permanent settings | Stays |

Variables such as `int`, `float` and `String` are all in SRAM. You write data you want to keep permanently to the **EEPROM**.

### Circuit
You will not build a circuit in this lesson: the Uno in the lab is enough, with no extra parts. You will read the results in the **Serial monitor** (9600 baud).

**Lab note:** on the first ▶ the Uno's EEPROM is empty (255 in every cell). Stopping with ■ and pressing ▶ again is like **cutting the power and switching it back on** on a real board: the lab keeps the EEPROM contents and the new run starts with them. What you write to the EEPROM during a run is still there on the next run. To empty the cells again (255), press ↺ Reset. (Just stopping and starting with ■/▶ does not touch the EEPROM; even if you change the code the contents stay, just as uploading a new program to a real board does not erase the EEPROM.)

### Program: power-on counter
A program that adds one to the number in the EEPROM every time it starts. A cell of the EEPROM that has never been written holds `255`; we treat this as "empty".

```cpp
// sketch: eeprom_sayac
#include <EEPROM.h>

void setup() {
  Serial.begin(9600);
  byte sayi = EEPROM.read(0);        // 0. adresteki baytı oku
  if (sayi == 255) sayi = 0;         // hiç yazılmamış: sıfırdan başla
  sayi = sayi + 1;
  EEPROM.update(0, sayi);            // yeni değeri 0. adrese yaz
  Serial.print("Acilis sayisi: ");
  Serial.println(sayi);
}

void loop() {
}
```

Each time the power is cut and switched back on, the number goes up 1, 2, 3. It is the same in the lab: on the first ▶ you see "Acilis sayisi: 1" (power-on count: 1); when you stop with ■ and press ▶ again (cutting and restoring the power) it becomes 2, then 3. If you press ↺ Reset, the EEPROM is emptied and the counter starts from 1 again.

### Wear: write or update?
EEPROM cells cannot be written forever. The manufacturer guarantees about **100,000 writes** for each cell. After that the cell may fail. Reading, on the other hand, does not wear the cell.

The sums: if you write the target temperature to the same cell every second, the cell reaches its guaranteed limit after 100,000 seconds = about 27.8 hours. Even writing every minute lasts only about 69 days. That is why you should write to the EEPROM **only when the value changes**, and as rarely as possible.

- `EEPROM.write(adres, değer)` writes every time it is called, even if the value is the same.
- `EEPROM.update(adres, değer)` reads the cell first; if the value is already the same, it **does not write at all**.

```cpp
// sketch: eeprom_yipranma
#include <EEPROM.h>

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) {
    EEPROM.write(10, 7);     // her seferinde yazar
  }
  for (int i = 0; i < 5; i++) {
    EEPROM.update(11, 7);    // yalnızca ilkinde yazar
  }
  Serial.print("10. adres: ");
  Serial.println(EEPROM.read(10));
  Serial.print("11. adres: ");
  Serial.println(EEPROM.read(11));
}

void loop() {
}
```

The result is 7 at both addresses, but the first loop uses up 5 writes and the second only 1 (because the starting value was 255). Also, one write takes about 3-4 ms; so `update` both protects the cell and saves time.

### Several values: put and get
`EEPROM.read` and `EEPROM.write` are for a single byte. An `int` takes two bytes and a `float` four bytes. To write these with a single command there are `EEPROM.put` and `EEPROM.get`. These commands also do not write a byte again if its value is the same.

```cpp
// sketch: eeprom_put_get
#include <EEPROM.h>

struct Ayar {            // birden çok değeri bir arada tutan kutu
  int hedef;
  float fark;
};

void setup() {
  Serial.begin(9600);
  Ayar a = {24, 0.5};
  EEPROM.put(20, a);     // 20. adresten itibaren yaz

  Ayar b;
  EEPROM.get(20, b);     // aynı yerden geri oku
  Serial.print("hedef=");
  Serial.print(b.hedef);
  Serial.print(" fark=");
  Serial.println(b.fark, 1);
}

void loop() {
}
```

`Ayar` (setting) takes 2 + 4 = 6 bytes; so addresses 20-25 are filled. If you are going to write new data, you must start from 26, or you will write over it.

### String and SRAM
SRAM is only 2048 bytes. Every piece of text, every array and every variable takes space from here. `String` objects are handy (you join them with `+`), but as they grow they move around in SRAM and can break the memory into pieces. In programs that must run for a long time, use fixed-size `char` arrays where you can and keep your use of `String` low.

Here is a tip as well: the text in `Serial.println("Merhaba")` takes up space in SRAM. `Serial.println(F("Merhaba"))`, however, leaves the text in Flash and saves SRAM.

The program below measures the free SRAM and shows how much space a `String` takes.

```cpp
// sketch: sram_string
extern int __heap_start, *__brkval;

int bosRam() {
  int v;
  return (int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval);
}

void setup() {
  Serial.begin(9600);
  Serial.println(F("SRAM olcumu"));
  Serial.print(F("Once: "));
  Serial.println(bosRam());

  String s = "";
  for (int i = 0; i < 10; i++) {
    s += "0123456789";          // her turda 10 karakter ekle (toplam 100)
  }
  Serial.print(F("Sonra: "));
  Serial.println(bosRam());
  Serial.print(F("String uzunlugu: "));
  Serial.println(s.length());
}

void loop() {
}
```

`bosRam()` (free RAM) works out the gap between the stack and the heap. The `Sonra` (after) value is about 100 smaller than the `Once` (before) value, because the `String` stores 100 characters in SRAM. The exact number can vary by a few bytes depending on the board and the compiler.

### Using libraries
This week you have seen three libraries: `LiquidCrystal`, `Wire`, `EEPROM`. They all follow the same pattern:
1. Add the library with `#include <Ad.h>` (the library's name).
2. Create an **object** if needed: `LiquidCrystal lcd(...)`. (For `EEPROM` and `Wire` the object is ready.)
3. Call its commands in the form `nesne.komut()` (object.command): `lcd.print()`, `Wire.begin()`, `EEPROM.read()`.

In the lab these libraries (`LiquidCrystal`, `LiquidCrystal_I2C`, `Wire`, `EEPROM`, `Servo`) are ready; you only need to write `#include` at the start of the program, with no extra installation. In the real Arduino IDE you install a new library from the **Sketch > Include Library > Manage Libraries** menu; the library's ready-made examples under **File > Examples** are the best source for showing how to use it.

### Try it
- Run the `eeprom_sayac` program, stop it with ■ and press ▶ again; do this three times. Why did the number go up 1, 2, 3? Then press ↺ Reset and run it again: why is the number 1 again? How many times does the program write to the EEPROM each time it starts?
- In `eeprom_yipranma`, make the `update` loop run 1000 times. Why is the result still 7?
- In the `sram_string` program, make the `String` 200 characters long. How much does the `Sonra` value go down?
- Add a potentiometer and a button in the lab. Save the value set with the pot to the EEPROM when the button is pressed. What would happen if you saved it on every loop?

### Common mistakes
- Writing to the EEPROM on every `loop` pass: the cell wears out quickly. Write only when the value changes; use `update`.
- Letting addresses clash: if you write two different pieces of data to the same address, one spoils the other. Write down which data is at which address.
- Trying to read an `int` with `EEPROM.read`: `read` returns only 1 byte. Use `get` for 2-byte values.
- Thinking a cell that has never been written is 0: an empty cell holds 255. Check whether the value you read is valid.
- Joining many long `String`s: the SRAM can fill up and the board can start behaving unexpectedly over time.

## Discuss
When exactly should you write the thermostat's target temperature to the EEPROM? Every time the button is pressed, or a while after the user has finished adjusting it? Why?
