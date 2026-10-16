# Flame sensor
slug: flame
category: Sensor
summary: A module that detects the infrared (IR) light given off by a flame. On the lab module, the analog output drops as the flame gets stronger.

## Pins
- VCC: Power supply pin. Connects to 5V; needs at least 3 V.
- GND: Ground pin. Connects to GND.
- AO: Analog output. Goes to one of the Uno's analog inputs (A1 in the lessons); the voltage drops when there is a flame.
- DO: Digital output. Goes LOW when the flame intensity passes the threshold; not used in the lessons.

## How it works
A flame sensor is a receiver that is sensitive to the **infrared (IR) light** a flame gives off. When a flame comes closer, the analog output changes. On the lab module **the value drops when there is a flame**, but on some modules it may be the other way round. That is why you convert the raw reading in a single function (`siddet()`, "intensity") so that "bigger number = stronger flame"; the rest of your code then does not depend on the direction.

Sunlight and some lamps also give off IR; in a real circuit they can cause false alarms. The sensor's viewing angle and range are limited. On its own, this sensor is not a reliable fire detector.

**Advanced:** In the lab model, AO = VCC × (1 − 0.95 × Flame intensity). With no flame, AO = VCC and `analogRead` gives 1023; at intensity 1 you read about 0.25 V (raw ≈ 51).

## Wiring in the lab
| From | To |
|---|---|
| Flame sensor **VCC** | Uno **5V** |
| Flame sensor **GND** | Uno **GND** |
| Flame sensor **AO** | Uno **A1** |

**Alev şiddeti** (Flame intensity, 0 to 1) in the properties panel simulates the flame and can be changed while the program is running. **Eşik (DO)** (Threshold (DO)) only affects the digital output. No experiments are done with a real flame.

## Typical values
- Flame intensity 0 | raw = 1023, intensity 0 | No flame
- Flame intensity 0.31 | raw ≈ 722, intensity ≈ 301 | Just past the WARNING threshold (300) used in the lessons
- Flame intensity 0.4 | raw ≈ 634, intensity ≈ 389 | WARNING
- Flame intensity 0.62 | raw ≈ 420, intensity ≈ 603 | Just past the DANGER threshold (600) used in the lessons
- Flame intensity 0.8 | raw ≈ 246, intensity ≈ 777 | DANGER
- Intensity conversion | intensity = 1023 − raw | For a module whose value drops with a flame

## Common mistakes
- **Not knowing the direction.** If you do not check the `ALEVDE_DUSER` ("drops with flame") value, the alarm either always goes off or never does.
- **Thinking about the direction separately everywhere.** Do the conversion in a single function.
- **Setting the turn-off threshold higher than the turn-on threshold.** The level flickers or never drops.
- **Forgetting about IR sources.** Sunlight and some lamps can cause false alarms (the lab does not model this).
- **Experimenting with a real flame.** It is dangerous; in the lessons the flame is only simulated from the properties panel.
