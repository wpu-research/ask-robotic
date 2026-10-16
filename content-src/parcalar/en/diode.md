# Diode
slug: diode
category: Power
summary: A part that lets current through in only one direction. In the lessons it is used as a flyback diode that absorbs the motor's kickback voltage.

## Pins
- A: Anode. Current enters here.
- K: Cathode (the striped end). Current leaves here.

## How it works
A diode lets current through only from the anode to the cathode. While conducting, about 0.7 V drops across its leads (the **forward voltage**). It does not let current through in the reverse direction.

When the current is cut off, a motor or relay coil produces a high voltage in the opposite direction. A diode connected in parallel with the coil, facing the reverse direction, gives this current a path and protects the transistor: a **flyback diode**. In normal operation the diode does not conduct; it conducts only at the moment of the spike.

**Advanced:** In a real circuit a rectifier diode such as the 1N4007 is used. An LED is also a diode, but it gives off light and its forward voltage is 1.9-3.0 V depending on the colour.

## Wiring in the lab
| From | To |
|---|---|
| Diode **A** | The transistor's **C** lead (or MOSFET **D**) |
| Diode **K** (striped end) | The positive side of the motor, **5V** |

If the motor is driven by a transistor or MOSFET but the flyback diode is missing or connected backwards, the lab shows a "flyback" warning. When wired correctly, the diode normally carries no current.

## Typical values
- Forward voltage | 0.7 V | Lab model
- Series resistance | 1 Ω | Lab model
- Direction | A to K | The striped end is the cathode
- Flyback position | Parallel to the motor, reversed | K to the positive side

## Common mistakes
- **Connecting the diode backwards.** It does not give the spike a path; a warning appears.
- **Leaving out the diode completely.** The transistor fails over time.
- **Mixing up the striped end.** The striped end is the cathode and goes to the 5V side.
- **Connecting the diode in series with the motor.** The motor does not run; the diode must be in parallel with the motor.
