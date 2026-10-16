# Joystick
slug: joystick
category: Input
summary: A two-axis stick with a push button. Each axis gives a voltage between 0-5 V, like a potentiometer.

## Pins
- VCC: Power supply. Connects to 5V (needs at least about 3 V, but with 3V3 the end value is about 675 instead of 1023).
- GND: Ground.
- VRX: Horizontal (X) axis output. Goes to one of the Uno's analog inputs (A0).
- VRY: Vertical (Y) axis output. Goes to another analog input (A1).
- SW: Button output. Connects to GND when pressed; goes to a digital pin (INPUT_PULLUP).

## How it works
A **joystick** is made of two potentiometers set at right angles to each other, plus a button at the end of the stick. Each axis is a voltage divider: the wiper sliding along the track between VCC and GND gives a voltage to VRX or VRY. With the stick in the middle, the voltage is about 2.5 V and the `analogRead` value is about 512. Pushed all the way in one direction, it gets close to 0 V or 5 V, that is, 0 or 1023.

On real modules the centre is not exactly 512 (it may be 497 or 530, for example). That is why the centre is measured at startup and a small dead zone is placed around it.

**Advanced:** In the lab model, each axis is a divider with a total resistance of 10 kΩ. While the SW pin is connected to VCC, it is pulled HIGH by the module's 10 kΩ pull-up resistor; when the button is pressed, it is connected to GND through about 100 Ω. You can also read the button with `INPUT_PULLUP`.

## Wiring in the lab
| From | To |
|---|---|
| Joystick **VCC** | Uno **5V** |
| Joystick **GND** | Uno **GND** |
| Joystick **VRX** | Uno **A0** |
| Joystick **VRY** | Uno **A1** |
| Joystick **SW** | Uno **D2** (`INPUT_PULLUP`) |

The properties panel has **X ekseni** (X axis) and **Y ekseni** (Y axis) (between 0 and 1) and **Düğme basılı** (Button pressed); they can also be changed while the program is running. You do not need to write `pinMode` for `analogRead`.

## Typical values
- Stick in the middle (X or Y = 0.5) | ≈ 2.5 V, reading ≈ 512 | Centre
- Axis 0 | ≈ 0 V, reading ≈ 0 | One end
- Axis 1 | ≈ 5 V, reading ≈ 1023 | The other end
- Axis 0.25 | ≈ 1.25 V, reading ≈ 256 | Quarter position
- Button pressed | SW ≈ 0 V (LOW) | Reads LOW with INPUT_PULLUP
- Axis divider resistance | 10 kΩ | Total, lab model

## Common mistakes
- **Hard-coding the centre as 512.** On a real module the value drifts when the stick is released; measure it at startup.
- **Not adding a dead zone.** When the stick is released, the value wobbles: 510, 514, 509.
- **Not setting SW to INPUT_PULLUP.** If the pin is left floating, random presses are read.
- **Connecting VCC to 3V3.** The ADC measures relative to 5 V; the end value becomes about 675.
- **Starting the program with the stick pushed.** The centre is measured wrong.
