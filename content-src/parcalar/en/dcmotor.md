# DC motor
slug: dcmotor
category: Output
summary: A small brushed motor. The voltage across its leads sets the speed, and the direction of the voltage sets the direction of rotation.

## Pins
- M1: First motor lead.
- M2: Second motor lead.

## How it works
A DC motor spins when you apply a voltage across its leads. The bigger the voltage, the higher the speed; when you swap the positive and negative leads, the direction reverses. A motor is a **coil**: when the current is cut off it produces a voltage spike in the opposite direction, which is why a flyback diode is needed when it is driven by a transistor.

An Arduino pin cannot drive a motor directly; the motor draws hundreds of mA. A transistor, a MOSFET or a driver such as the L293D is used. With `analogWrite` (PWM) you change the average voltage and therefore the speed.

**Advanced:** In the lab model the motor resistance is 10 Ω and the rated voltage is 6 V; the speed is taken as roughly lead voltage / 6 (at most 1). Real small motors do not start spinning at very low PWM values.

## Wiring in the lab
| From | To |
|---|---|
| Motor **M1** | Uno **5V** (transistor circuit) or L293D **OUT1** |
| Motor **M2** | Transistor **C** or L293D **OUT2** |

If you select the motor during virtual measurement, you see the voltage across its leads and the current. With an NPN at full throttle you get about 4.2 V and 0.4 A, and a speed of about 0.70.

## Typical values
- Motor resistance | 10 Ω | Lab model
- Rated voltage | 6 V | Full speed at this voltage
- Full throttle with NPN | ≈ 4.2 V, ≈ 0.4 A | Speed ≈ 0.70
- With L293D (5 V) | ≈ 3.3 V | Slower because of the output loss

## Common mistakes
- **Connecting the motor directly to a pin.** The pin cannot supply enough current and can be damaged.
- **Skipping the flyback diode.** When driving with a transistor, the spike destroys the transistor.
- **Reversing the direction all at once.** Stop first, then set the new direction.
- **Expecting it to spin at a very low PWM value.** A small motor stays still below its threshold value.
