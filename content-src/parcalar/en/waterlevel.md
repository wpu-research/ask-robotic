# Water level sensor
slug: waterlevel
category: Sensor
summary: A sensor that reports, as an analog voltage, how much of a stick with bare traces is under water. The output value rises as the water rises.

## Pins
- VCC: Supply lead. Connects to 5V.
- GND: Ground lead. Connects to GND.
- AO: Analog output. Goes to an Uno analog input (A1 in the lessons); the voltage rises as the water rises.
- DO: Digital output. Goes LOW when the level crosses the threshold; not used in the lessons.

## How it works
The water level sensor's stick has bare conductive traces. As the water rises, more of the traces are under water and the output voltage **rises**. This is the opposite of the soil moisture and rain sensors. `analogRead` turns the voltage into a number; in the program, thresholds separate states such as "empty", "half" or "full".

Even at 5 V the stick does not reach full scale (1023); its highest value is about 819. So thresholds should be chosen according to the sensor's real range, not according to 1023. The bare traces in contact with water can wear away over time; for a real sensor, check the datasheet.

**Advanced:** In the lab model, AO = VCC × (0.05 + 0.75 × level). At level 0 you get about 0.25 V (raw ≈ 51), and at level 1 about 4 V (raw ≈ 819).

## Wiring in the lab
| From | To |
|---|---|
| Water level **VCC** | Uno **5V** |
| Water level **GND** | Uno **GND** |
| Water level **AO** | Uno **A1** |

The **Su seviyesi** (Water level) slider (0 to 1) in the properties panel sets how much of the stick is under water and can be changed while running. The module needs a supply of at least 3 V to work.

## Typical values
- Level 0 (empty) | raw ≈ 51 | About 0.25 V
- Level 0.4 | raw ≈ 358 | "Half" according to the lesson's thresholds
- Level 1 (completely full) | raw ≈ 819 | About 4 V; does not reach 1023
- Thresholds in the lesson | 300 and 600 | Below is empty, between is half, above is full

## Common mistakes
- **Assuming the direction is reversed.** On this sensor the value rises as the water rises.
- **Choosing thresholds based on 1023.** The stick's top value is about 819.
- **Using a single threshold.** When the water surface ripples, the state flips quickly.
- **Leaving the sensor in water all the time.** The bare traces wear away over time.
