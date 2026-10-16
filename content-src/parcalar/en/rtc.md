# RTC clock module
slug: rtc
category: Sensor
summary: A clock module read over I2C that keeps the real date and time even when unplugged (DS3231 type).

## Pins
- VCC: Supply. In the lab it connects to the Uno 5V.
- GND: Ground.
- SDA: I2C data line. A4 on the Uno.
- SCL: I2C clock line. A5 on the Uno.

## How it works
An **RTC** (Real Time Clock) is a separate chip that counts seconds with its own crystal and knows the calendar. The Arduino only asks it over I2C; the counting is done by the chip itself. `millis()` starts from zero when the board powers up and is forgotten when power is lost; an RTC, on the other hand, keeps the real date and time.

Real modules have a **backup battery holder**: when main power is lost, this battery keeps the clock running. If there is no battery or it is flat, the time is lost and must be set again. The library (RTClib) gives the time as a `DateTime` with `rtc.now()`, sets the clock with `rtc.adjust()`, and tells you whether the clock has stopped with `rtc.lostPower()`.

An RTC does not know about daylight saving time or time zones; it only counts on from the numbers you set.

**Advanced:** The DS3231's clock crystal is inside the chip and it corrects itself for temperature; on the DS1307 the crystal is fitted externally and is affected more by temperature. The DS1307 has no hardware alarm. Both use address 0x68 on I2C.

## Wiring in the lab
| From | To |
|---|---|
| RTC **SDA** | Uno **A4** |
| RTC **SCL** | Uno **A5** |
| RTC **VCC** | Uno **5V** |
| RTC **GND** | Uno **GND** |

In code you write `#include <RTClib.h>` and `RTC_DS3231 rtc;`; `rtc.begin()` returns `false` if the module is not on the bus. The lab does not model the backup battery or power loss: every time you press ▶ (or after ↺ Sıfırla (Reset)) the RTC starts from 2026-01-01 00:00:00 and `lostPower()` always returns `false`. You set the time with `rtc.adjust()`.

## Typical values
- I2C address | 0x68 | The MPU6050 also uses 0x68 by default; do not connect both on the same bus
- Lab start time | 2026-01-01 00:00:00 | Starts from this value on every run
- Connection | SDA A4, SCL A5 | The standard I2C pins of Module 4
- Library class | RTC_DS3231 | RTC_DS1307 for the DS1307

## Common mistakes
- **Putting the `adjust(__DATE__, __TIME__)` line unconditionally in `setup()`.** Every time the board powers up, the clock jumps back to the moment the code was compiled; only set it if `lostPower()` is true.
- **Connecting the MPU6050 and the RTC on the same bus.** Both use 0x68 and they clash.
- **Trying to keep time with `millis()`.** When power is lost `millis()` resets; the RTC keeps going.
- **Swapping SDA and SCL or leaving VCC/GND unconnected.** `rtc.begin()` returns false and the program prints "RTC bulunamadi" (RTC not found).
- **Assuming month, day and hour values have two digits.** `month()` returns 3 for March; you add the leading zero yourself.
