# MQ-2 gas sensor
slug: mq2
category: Sensor
summary: A module sensitive to flammable gases and smoke that reports, as an analog voltage, "how much it has risen compared with clean air". It cannot tell gas types apart.

## Pins
- VCC: Power lead. Connects to 5V; needs at least 4 V.
- GND: Ground lead. Connects to GND.
- AO: Analog output. Goes to one of the Uno's analog inputs (A3 in the lessons); the voltage rises as gas increases.
- DO: Digital output. Goes LOW when the gas level passes the threshold; not used in the lessons.

## How it works
Inside the MQ-2 there is a heated sensing element. Flammable gases and smoke change the resistance of this element; the module reports this as a voltage on its analog output. As gas increases, AO rises. `analogRead` turns this voltage into a number from 0 to 1023.

The sensor **cannot tell** which gas it is. Also, the readings are unstable until the heater reaches its working temperature; on a real module the warm-up time is long. After it warms up, you measure a **baseline value** in clean air and write the alarm threshold as a multiple of the baseline (for example 1.5 times). To get a unit such as ppm you need the curve from the datasheet, the gas type and calibration; without these, you do not write ppm.

**Advanced:** In the lab model, AO = VCC × (0.1 + 0.9 × gas level). In a real MQ-2, AO comes from a divider made of the sensor resistance and the module's load resistor, and warm-up and room temperature shift the value; the lab does not model this. The heater of a real MQ-2 also runs hot.

## Wiring in the lab
| From | To |
|---|---|
| MQ-2 **VCC** | Uno **5V** |
| MQ-2 **GND** | Uno **GND** |
| MQ-2 **AO** | Uno **A3** |

**Gaz düzeyi** (Gas level, 0 to 1) in the properties panel simulates gas and can be changed while the program is running. **Eşik (DO)** (Threshold) only affects the digital output. The module does not work on a supply below 4 V; if you connect it to 3.3 V, it counts as unpowered.

## Typical values
- Gas level 0 (clean air) | raw ≈ 102 | About 0.5 V; this is your baseline value
- Gas level 0.03 | raw ≈ 130 | About 1.27 times the baseline
- Gas level 0.1 | raw ≈ 194 | About 1.9 times the baseline
- Gas level 0.3 | raw ≈ 379 | About 3.7 times the baseline
- Gas level 1 | raw = 1023 | Full scale (5 V)
- Alarm thresholds in the lessons | baseline × 1.5 and × 2.5 | Turn-off thresholds are baseline × 1.25 and × 2

## Common mistakes
- **Not waiting for warm-up.** On a real module the baseline comes out wrong, and the alarm goes off falsely or never goes off.
- **Measuring the baseline in air that contains gas.** The thresholds shift up and a real increase is missed.
- **Comparing with a fixed number.** `okuma > 400` is meaningless on another module or in different air; use a multiple of the baseline.
- **Converting the reading into a unit like ppm.** Without calibration the number is not reliable.
- **Integer division.** If `ort / baz` are both `int`, you get 1 instead of 1.6; use `float` for the division.
- **Using it alone for real safety.** This sensor and the lesson circuits are for education; they do not replace a certified detector.
