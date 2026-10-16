# Potentiometer
slug: potansiyometre
category: Input
summary: A three-lead resistor whose position you can change. A voltage between 0 and 5 V is read from its middle lead.

## Pins
- VCC: One end. Connects to 5V.
- SIG: Middle lead (wiper). Gives a voltage between 0 and 5 V depending on the position. Goes to one of the Uno's analog inputs.
- GND: The other end. Connects to GND.

## How it works
A potentiometer (pot) contains a fixed resistive track between two ends and a **wiper** that slides along this track. If you connect the two ends of the track to 5 V and GND, the wiper gives a voltage between 0 V and 5 V depending on where it sits on the track. This is a **voltage divider**.

When the wiper is turned towards the GND end, the SIG voltage approaches 0 V; when it is turned towards the VCC end, it approaches 5 V. In the lab the `Konum` (Position) property is between 0 and 1, and the SIG voltage is ≈ `Konum × 5 V`.

On the Arduino, `analogRead(A0)` turns this voltage into a number from 0 to 1023 (10-bit ADC). If the position is 0.5, the reading is about 512.

The pot's total resistance (for example 10 kΩ) between its ends stays the same whatever the wiper's position; the position only changes how this resistance is shared.

## Wiring in the lab
| From | To |
|---|---|
| Pot **VCC** | Uno **5V** |
| Pot **GND** | Uno **GND** |
| Pot **SIG** | Uno **A0** |

You change the position while running with the **Konum** (Position) slider in the properties panel. The total resistance can be set between 100 Ω and 1 MΩ; the default is 10 kΩ. You do not need to write `pinMode` for `analogRead`.

## Typical values
- Total resistance | 10 kΩ | Default; the standard in this site's lessons
- Position 0 | ≈ 0 V, reading ≈ 0 | SIG close to GND
- Position 0.5 | ≈ 2.5 V, reading ≈ 512 | Midpoint
- Position 1 | ≈ 5 V, reading ≈ 1023 | SIG close to VCC
- ADC step | ≈ 4.9 mV | 5 V / 1024

## Common mistakes
- **Connecting SIG to a digital pin and expecting an analog value.** Use A0-A5 for analog reading.
- **Mixing up VCC and GND.** The pot works the other way round: the direction is reversed. It does no harm, but the result is reversed.
- **Connecting the middle lead (SIG) to 5V or GND.** The reading stays fixed.
- **Forgetting to connect SIG.** A floating analog input reads random numbers.
- **Thinking the reading is directly a voltage.** `analogRead` gives a number from 0 to 1023; for the voltage, calculate `ham × 5.0 / 1024`.
