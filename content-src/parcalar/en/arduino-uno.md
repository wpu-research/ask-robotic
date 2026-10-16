# Arduino Uno
slug: arduino-uno
category: Board
summary: A development board with an ATmega328P microcontroller. It runs your program and uses its pins to drive and read the circuit.

## Pins
- D0: Digital pin 0 (shared with serial RX; not used for LEDs/buttons in the lessons)
- D1: Digital pin 1 (shared with serial TX)
- D2: Digital pin 2. The first button input on this site
- D3: Digital pin 3 (PWM). The second button input on this site
- D4: Digital pin 4
- D5: Digital pin 5 (PWM)
- D6: Digital pin 6 (PWM)
- D7: Digital pin 7
- D8: Digital pin 8. The buzzer on this site
- D9: Digital pin 9 (PWM). Servo/RGB
- D10: Digital pin 10 (PWM)
- D11: Digital pin 11 (PWM)
- D12: Digital pin 12
- D13: Digital pin 13. Also connected to the board's built-in L LED
- A0: Analog input 0 (reads 0-5 V). The potentiometer on this site
- A1: Analog input 1. The LDR on this site
- A2: Analog input 2. The NTC on this site
- A3: Analog input 3
- A4: Analog input 4 (I2C SDA)
- A5: Analog input 5 (I2C SCL)
- 5V: 5 volt supply output
- 3V3: 3.3 volt supply output
- GND: Ground (0 V)
- GND2: Ground (0 V); same node as GND
- GND3: Ground (0 V); same node as GND
- VIN: External supply input

## How it works
The Arduino Uno is a board built around the **ATmega328P** microcontroller. The program (sketch) is stored in the chip's **flash** memory; when power comes on, `setup()` runs once, then `loop()` runs over and over.

Main specs: 16 MHz clock, 32 KB flash (program), 2 KB SRAM (working memory), 1 KB EEPROM (persistent data).

**Digital pins (D0-D13)** are always in one of two states: HIGH (≈ 5 V) or LOW (0 V). You make them outputs or inputs with `pinMode`. **Analog inputs (A0-A5)** turn a voltage between 0 and 5 V into a number from 0 to 1023 using a 10-bit ADC. Pins marked **PWM** (D3, D5, D6, D9, D10, D11) give an "adjustable" output from 0 to 255 with `analogWrite`.

Pin current is limited: the recommended maximum current per pin is about 20 mA, and the absolute limit is 40 mA. The lab shows a warning above 40 mA. In the model, an output pin drives through an internal resistance of about 25 Ω.

## Wiring in the lab
When you open the lab, the Uno is already on the canvas. The lab automatically powers the Uno's **5V**, **3V3** and **GND** pins and uploads the program for you: ▶ **Derle ve çalıştır** (Compile and run), ■ stops, ↺ starts over (like the Reset button on a real board).

You connect the leads of the parts by drawing wires to the pin names on the Uno (for example resistor **1** → **D13**). **GND, GND2 and GND3** are the same node; it makes no difference which one you use.

## Typical values
- Logic voltage | 5 V | HIGH ≈ 5 V, LOW ≈ 0 V
- Digital input threshold | ≈ 2.5 V | Above it reads HIGH, below it LOW (lab model)
- Pin current (recommended) | ≤ 20 mA | Absolute limit 40 mA
- ADC resolution | 10 bit | 0-1023, step ≈ 4.9 mV
- INPUT_PULLUP resistance | ≈ 35 kΩ | Lab model
- Clock | 16 MHz | -
- Memories | 32 KB flash, 2 KB SRAM, 1 KB EEPROM | -

## Common mistakes
- **Mixing up `A0` and `0`.** `A0` is an analog input, `0` is a digital pin.
- **Using D0 and D1 for parts.** These pins are shared with serial communication; in the lessons, start from D2 for LEDs/buttons.
- **Forgetting GND.** The circuit is not complete.
- **Drawing too much current from a pin.** Do not connect motors, relays or other large loads directly to a pin.
- **Connecting two outputs to one pin at the same time.** If one drives HIGH and the other LOW, you get a short circuit.
- **Forgetting to write `pinMode`.** The pin does not become an output; the LED glows very dimly or not at all.
