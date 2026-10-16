# Rain sensor
slug: rain
category: Sensor
summary: A sensor that reports drops falling on its board as an analog voltage. The wetter it gets, the lower the output value.

## Pins
- VCC: Power lead. Connects to 5V.
- GND: Ground lead. Connects to GND.
- AO: Analog output. Goes to one of the Uno's analog inputs (A0 in the lessons); the voltage drops as it gets wet.
- DO: Digital output. Goes LOW when the wetness passes the threshold; not used in the lessons.

## How it works
The rain sensor's board has two copper traces. Falling drops bridge these traces and the output voltage **drops**. On a dry board the output is high. `analogRead` turns the voltage into a number from 0 to 1023; the program uses a threshold to decide "raining" or "not raining".

Near the threshold the reading can fluctuate and the state can change quickly; the cure is to use two thresholds (hysteresis). The direction and the numbers of the sensor vary from module to module; set the thresholds by measuring with the sensor you are actually using.

**Advanced:** In the lab model, AO = VCC × (0.95 − 0.85 × wetness). So you get about 4.75 V when dry (raw ≈ 972) and about 0.5 V when fully wet (raw ≈ 102).

## Wiring in the lab
| From | To |
|---|---|
| Rain **VCC** | Uno **5V** |
| Rain **GND** | Uno **GND** |
| Rain **AO** | Uno **A0** |

The **Islaklık (yağmur)** (Wetness (rain), 0 to 1) slider in the properties panel sets how much rain falls on the board and can be changed while running. The module needs a supply of at least 3 V to work.

## Typical values
- Wetness 0 (dry) | raw ≈ 972 | About 4.75 V
- Wetness 0.5 | raw ≈ 537 | "Raining" if the threshold is 600
- Wetness 1 (downpour) | raw ≈ 102 | About 0.5 V
- Threshold in the lesson | 600 | Below it means "raining"; this threshold was measured for the lab model

## Common mistakes
- **Assuming the direction is the other way round.** On this module the value does not rise in rain; it drops.
- **Using a single threshold.** Near the threshold, "VAR" (yes) and "YOK" (no) flip back and forth quickly.
- **Taking the threshold from another sensor.** Set the thresholds by measuring with the sensor you are using.
- **Trusting a single measurement.** A single passing drop can cause a false alarm.
