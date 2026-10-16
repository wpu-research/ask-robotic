# I2C LCD 16x2
slug: lcdI2c
category: Output
summary: An LCD with an I2C expander on the back that writes two lines of 16 characters using only two data wires (SDA and SCL).

## Pins
- GND: Ground. Connects to Uno GND.
- VCC: Power supply. Connects to Uno 5V.
- SDA: I2C data line. Connects to A4 on the Uno.
- SCL: I2C clock line. Connects to A5 on the Uno.

## How it works
A parallel LCD needs a lot of pins. The small board on the back of an I2C LCD (a PCF8574 expander) takes care of those pins; the Arduino talks to the display over just two wires, SDA and SCL. Every I2C device on the bus has a 7-bit address, and the board only answers messages written to that address. The display has 16 columns and 2 rows, so it shows at most 32 characters.

**Advanced:** On common boards the address is 0x27 (PCF8574); on some it is 0x3F (PCF8574A). If the address you write in your code does not match the display's, the display does not respond. To find the address, you run an I2C scanner program. The built-in character table does not include Turkish letters (ç, ş, ğ, ı).

## Wiring in the lab
| From | To |
|---|---|
| LCD **SDA** | Uno **A4** |
| LCD **SCL** | Uno **A5** |
| LCD **VCC** | Uno **5V** |
| LCD **GND** | Uno **GND** |

You choose 0x27 or 0x3F in the **I2C adresi** (I2C address) field of the properties panel (default 0x27). If VCC or GND is missing, a "not powered" warning appears. The program must call `lcd.init()` and `lcd.backlight()`; because `init()` includes a wait of about 1 second, the text appears with a short delay after ▶.

## Typical values
- Screen size | 16 × 2 | 16 columns, 2 rows
- Default address | 0x27 | 0x3F on some boards
- SDA pin | A4 | Uno hardware I2C
- SCL pin | A5 | Uno hardware I2C
- Power supply | 5 V | In the lab, VCC and GND must be connected

## Common mistakes
- **Address mismatch.** If the properties panel says 0x3F but your code says 0x27, the screen stays blank. Check the address with the scanner program.
- **Crossing SDA and SCL.** Neither the display nor the scanner finds any device.
- **Connecting to pins other than A4 and A5.** The Uno's hardware I2C is only on these two pins.
- **Not calling `init()` and `backlight()`.** The display does not start or the backlight does not turn on.
- **Rewriting the whole screen on every loop.** The bus gets needlessly busy; only write the line that changed.
