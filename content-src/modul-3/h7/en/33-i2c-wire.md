# I2C: Wire and the address scan
duration: 25

## Wonder
In the previous lesson you used 6 pins for the LCD. Yet many sensors and displays can talk with only **two wires**, and dozens of devices can be connected to the same two wires. So when there are this many devices on a single line, how does the board know which one it is talking to?

## Activity
### Circuit
The I2C ("eye-squared-see") bus is made of two wires: **SDA** (data) and **SCL** (clock). On the Arduino Uno these are the **A4 (SDA)** and **A5 (SCL)** pins. Every device has a **7-bit address** on the bus. The board writes the address at the start of the message; only the device at that address answers.

In this lesson we use the **I2C LCD** part (`lcdI2c`) in the lab: there is an adapter ("backpack") with a PCF8574 chip on the back of the 16x2 display, and the display connects with only 4 pins.

Pick the part from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| I2C LCD GND | GND |
| I2C LCD VCC | 5V |
| I2C LCD SDA | **A4** |
| I2C LCD SCL | **A5** |

The lab models the I2C LCD like this: SDA must be connected directly to A4 and SCL directly to A5; VCC and GND must be in place too (if they are missing, a "not powered" warning appears). When you select the part, an **I2C address** property appears in the right panel (0x27 or 0x3F). If the address you write in the code is not the same as this one, the display does not answer.

In a real circuit, the SDA pins of several I2C devices are connected to each other, and so are the SCL pins; the pull-up resistors are already on most modules. In the lab you do not build this detail.

### Program
First let's find the device's address. This program asks every address from 1 to 126, "is anyone there?":

```cpp
// sketch: i2c_tarama
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();                       // kart I2C hattında "yönetici" olur
  Serial.println("I2C taraniyor...");

  int bulunan = 0;
  for (byte adres = 1; adres < 127; adres++) {
    Wire.beginTransmission(adres);    // bu adrese konuşmayı başlat
    byte hata = Wire.endTransmission();   // 0 = cihaz cevap verdi
    if (hata == 0) {
      Serial.print("Cihaz bulundu: 0x");
      if (adres < 16) Serial.print("0");
      Serial.println(adres, HEX);
      bulunan++;
    }
  }
  Serial.print("Toplam: ");
  Serial.println(bulunan);
}

void loop() {
}
```

In the serial monitor you will see `0x27` or `0x3F` for most LCD modules. These two addresses are the default addresses of the PCF8574 and PCF8574A chips. In the lab, change the LCD part's **I2C address** property and run the scan again to see the difference.

After finding the address, you use the I2C LCD with the `LiquidCrystal_I2C` library. This time the display is connected with only 2 wires:

```cpp
// sketch: i2c_lcd
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);   // adres, sütun, satır

void setup() {
  lcd.init();             // ekranı başlat
  lcd.backlight();        // arka ışığı aç
  lcd.setCursor(0, 0);
  lcd.print("I2C ile merhaba");
  lcd.setCursor(0, 1);
  lcd.print("Adres: 0x27");
}

void loop() {
}
```

### How does it work?
1. `Wire.begin()` gets the board ready for the I2C bus. You call it once inside `setup`.
2. With `Wire.beginTransmission(adres)` you prepare a message to a device. `Wire.endTransmission()` sends the message and returns an **error code**. `0` means the device said "got it"; any other number shows that the device did not answer.
3. The scan program uses this error code: it asks 126 addresses one after another and prints those that return `0`.
4. `Serial.println(adres, HEX)` prints the number in hexadecimal. `0x27` is hexadecimal notation: 2×16 + 7 = 39.
5. The `LiquidCrystal_I2C lcd(0x27, 16, 2)` object talks to the LCD at address 0x27. Commands such as `print` and `setCursor` are the same as for the LCD in the previous lesson; the only difference is how the display is started (`lcd.init()` and `lcd.backlight()`). There is a wait of about 1 second inside `lcd.init()`; that is why it takes about 1.5 seconds for the text to appear after you press ▶. Wait a little.
6. If two devices on the same bus have the same address, they get mixed up. On real modules the address can be changed with small jumpers on the board; in the lab you do this from the properties panel.

### Try it
- While the scan program runs, delete the LCD's SDA wire or remove the LCD from the canvas. What happens to the number of devices found?
- Set the LCD's **I2C address** property to 0x3F. What does the scan program show? In the display program, change the address to `LiquidCrystal_I2C lcd(0x3F, 16, 2);` and try the display again.
- With the address property at 0x3F, leave 0x27 in the code. What happens on the display?
- Swap the SDA and SCL wires (A4 and A5). What do the display and the scan do?

### Common mistakes
- Connecting SDA and SCL the wrong way round: the display or the scan finds nothing.
- Writing the wrong address: no text appears on the display. Do an address scan first.
- If the text appears late, the program has not frozen: `lcd.init()` waits about 1 second, so wait a few seconds after ▶.
- Connecting SDA or SCL to a pin other than A4 and A5: the Uno's hardware I2C is only on these two pins.
- Forgetting to connect VCC or GND: the lab gives a "not powered" warning and the display does not answer.
- Forgetting to call `lcd.init()` and `lcd.backlight()`.
- In the real world, connecting an I2C device that works at 3.3 V to a 5 V bus can damage the device; the working voltage is written on the device.

## Discuss
The scan program said "there is a device at address 0x27", but it did not say whether this device is an LCD or a sensor. What do you need to work out what a device is from its address?
