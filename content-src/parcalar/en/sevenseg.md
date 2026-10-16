# 7-segment display
slug: sevenseg
category: Output
summary: A display made of seven bars and a dot that shows a single digit. Each bar is a separate LED.

## Pins
- a: Segment A (top horizontal bar).
- b: Segment B (upper right vertical bar).
- c: Segment C (lower right vertical bar).
- d: Segment D (bottom horizontal bar).
- e: Segment E (lower left vertical bar).
- f: Segment F (upper left vertical bar).
- g: Segment G (middle horizontal bar).
- dp: Dot LED (decimal point).
- COM: Common lead. Connects to GND on a common cathode display, to 5V on a common anode display.

## How it works
A **7-segment display** is made of seven small LED bars (a-g) and one dot LED (dp). Which bars are lit decides which digit you see. Because each bar is a separate LED, it must have **its own series resistor**.

There are two kinds of display. On a **common cathode** display the negative leads of all LEDs are joined at COM; COM connects to GND and a bar lights when it is driven HIGH. On a **common anode** display the positive leads are joined; COM connects to 5V and a bar lights when it is driven LOW. That is why the pattern is inverted on a common anode display.

Driving eight LEDs with eight pins is costly; in the lessons this is reduced to three pins with a 74HC595. One digit is one byte: bit 0 = a, bit 1 = b, ... bit 6 = g, bit 7 = dp.

**Advanced:** On multi-digit displays the digits are lit one after another very quickly (multiplexing), and the eye thinks they are all lit at once. The part in the lab is single-digit and models each bar like an LED.

## Wiring in the lab
| From | To |
|---|---|
| 74HC595 **QA** ... **QG** | Each through a 330 Ω resistor to display lead **a** ... **g** |
| 74HC595 **QH** (optional) | Through a resistor to display lead **dp** |
| Display **COM** | **GND** (common cathode) |

When you select the part, the **Ortak uç** (Common lead) option appears in the properties panel: "Ortak katot" (common cathode, the default) or "Ortak anot" (common anode). While it runs, you can select a resistor and see the bar current with **Sanal ölçüm** (Virtual measurement).

## Typical values
- Segment forward voltage (Vf) | 1.9 V | Lab model
- Series resistor (with 74HC595) | 330 Ω | About 8 mA per bar
- 74HC595 output resistance | 50 Ω | Lab model
- Default common lead | Common cathode | COM connects to GND
- Digit 1 pattern | 0x06 | Only b and c light (bit 1 and bit 2)

## Common mistakes
- **Not giving each bar its own resistor.** The bar draws too much current; the lab shows a warning. Seven bars need seven resistors.
- **Mixing up common anode and common cathode.** The digits look inverted; on a common anode, COM connects to 5V and the pattern is inverted with `~RAKAM[i]`.
- **Mixing up the bar names.** The a-g order must match the bit order; otherwise the digits look garbled.
- **Putting a single resistor on COM.** The brightness changes with the number of lit bars (two bars light for 1, seven for 8).
