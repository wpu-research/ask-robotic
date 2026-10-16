# NPN transistor
slug: npn
category: Power
summary: An electronic switch that uses a small base current to control a much larger collector current.

## Pins
- B: Base. The control lead; connects to an Uno pin through a small resistor.
- C: Collector. The load current enters here (the load is usually between 5V and C).
- E: Emitter. Connects to GND.

## How it works
An Arduino pin is comfortable at about 20 mA; loads such as motors draw more current. An NPN transistor solves this problem: when the base-emitter voltage goes above about 0.7 V, a small **base current** flows and the transistor lets a much larger current pass from the collector to the emitter. The current gain in the lab is about 100.

A **series resistor** limits the base current. With D6 = 5 V and 1 kΩ, the base current is (5 − 0.7) / 1000 = 4.3 mA. This is enough for a load current of up to 100 × 4.3 = 430 mA.

If the load is a coil, such as a motor, a **flyback diode** is placed across the motor to protect the transistor.

**Advanced:** When it conducts, a saturation voltage (about 0.2 V) remains between collector and emitter; so the motor sees a little less than 5 V (about 4.2 V at full throttle).

## Wiring in the lab
| From | To |
|---|---|
| Transistor **E** | Uno **GND** |
| Transistor **C** | Motor **M2** (and diode **A**) |
| 1 kΩ resistor **2** | Transistor **B** |
| 1 kΩ resistor **1** | Uno **D6** |

The motor's **M1** lead connects to 5V. If the base current goes above about 30 mA, the lab shows a warning.

## Typical values
- Base-emitter threshold | ≈ 0.7 V | Lab model
- Current gain | ≈ 100 | Lab model
- Base resistor | 1 kΩ | The standard in this site's lessons; base current ≈ 4.3 mA
- Saturation voltage | ≈ 0.2 V | Between C and E while conducting
- Base current warning limit | 30 mA | Above this, a warning appears

## Common mistakes
- **Leaving out the base resistor.** The base current is not limited; the lab shows a warning.
- **Not connecting the emitter to GND.** The current path is not complete and the motor does not turn.
- **Forgetting the flyback diode.** The voltage spike from the coil damages the transistor; the lab shows a warning.
- **Mixing up the legs.** If B, C and E are swapped, the transistor does not conduct.
