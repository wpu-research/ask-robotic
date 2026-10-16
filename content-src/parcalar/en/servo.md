# Servo motor
slug: servo
category: Output
summary: A small motor that turns its shaft to an angle between 0 and 180 degrees according to a control signal and holds it there.

## Pins
- SIG: Control signal. Goes to an Uno digital pin (for example D6); the pulse width sets the angle.
- VCC: Supply. Connects to 5V (in the lab at least about 4 V is needed).
- GND: Ground.

## How it works
A **servo** is a box containing a motor, gears and position feedback. The width of a pulse that arrives every 20 ms sets the angle. In Arduino's `Servo` library, `write(0)` produces a pulse of about 544 µs and `write(180)` about 2400 µs; angles in between are linear. `write(90)` gives about 1472 µs.

The servo reaches the commanded angle by itself and stays there, so you do not need to write a loop for the angle. Pushing against the mechanical ends (0 and 180) strains the servo; in projects the angle is limited to a safe range such as 10...170 with `constrain`.

**Advanced:** Under load a real servo draws current and the 5 V can drop; that is why in a real setup the servo is powered from a separate 5 V supply and the GNDs are connected together. The lab does not model this voltage drop.

## Wiring in the lab
| From | To |
|---|---|
| Servo **SIG** | Uno **D6** (or another digital pin) |
| Servo **VCC** | Uno **5V** |
| Servo **GND** | Uno **GND** |

The program uses `#include <Servo.h>`, `servo.attach(6)` and `servo.write(açı)` (açı = angle). The lab calculates the servo's shaft angle from the incoming pulse width and shows it.

## Typical values
- Pulse width range | 544...2400 µs | Servo library default
- 0° | ≈ 544 µs | Lower end
- 90° | ≈ 1472 µs | Middle
- 70° | ≈ 1266 µs | 544 + 70/180 x 1856
- Safe angle range | 10...170° | Recommended limit for projects
- Minimum supply | ≈ 4 V | Lab model

## Common mistakes
- **Connecting the servo to 3V3 instead of 5V.** In the lab the servo does not work (it needs at least about 4 V).
- **Driving the angle all the way to the mechanical ends.** The servo strains, heats up and makes noise.
- **Writing microseconds or radians instead of degrees in write().** The servo goes to an unexpected angle.
- **Powering a real servo from the board's 5 V pin.** Under load the board can reset.
- **Not connecting the GNDs together.** The servo cannot read the signal.
