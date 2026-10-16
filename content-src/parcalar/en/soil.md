# Soil moisture sensor
slug: soil
category: Sensor
summary: A module that reports how wet the soil is as an analog voltage. The output value drops as the soil gets wetter.

## Pins
- VCC: Supply lead. Connects to 5V.
- GND: Ground lead. Connects to GND.
- AO: Analog output. Goes to an Uno analog input (A2 in the lessons); the voltage drops as the soil gets wetter.
- DO: Digital output. Goes LOW when the moisture threshold is crossed; not used in the lessons.

## How it works
The soil moisture module turns the moisture of the soil into a voltage. On the module in the lab, **the output is high when dry and drops as it gets wetter**. `analogRead` turns this voltage into a number from 0 to 1023. To turn the number into a percentage, you measure the dry and wet end values and use `map` and `constrain`.

In real life there are two kinds. A **resistive** sensor has bare metal probes buried in the soil that corrode over time. A **capacitive** sensor has probes covered with insulation and usually lasts longer. The output direction and the numbers vary from maker to maker; you need to calibrate every sensor with its own dry and wet measurements.

**Advanced:** In the lab model, AO = VCC × (0.9 − 0.6 × moisture). So with 5 V you get about 4.5 V (raw ≈ 921) at moisture 0 and about 1.5 V (raw ≈ 307) at moisture 1.

## Wiring in the lab
| From | To |
|---|---|
| Soil moisture **VCC** | Uno **5V** |
| Soil moisture **GND** | Uno **GND** |
| Soil moisture **AO** | Uno **A2** |

The **Toprak nemi** (Soil moisture) slider (0 to 1) in the properties panel sets how wet the soil is and can be changed while the program is running. **Eşik (DO)** (Threshold) is only used for the digital output. The module needs a supply of at least 3 V to work.

## Typical values
- Moisture 0 (dry) | raw ≈ 921 | About 4.5 V
- Moisture 0.5 | raw ≈ 614 | Midpoint
- Moisture 1 (wet) | raw ≈ 307 | About 1.5 V
- Calibration example | KURU = 800, ISLAK = 350 | A raw value of 575 is about 50%
- Reading noise | average of 8 readings | A single reading can be misleading

## Common mistakes
- **Not knowing the direction.** Assuming "a bigger number means wetter"; on this module the value drops as it gets wetter.
- **Forgetting `constrain`.** Readings outside the calibration give values like -26% or 130%.
- **Using another sensor's end values.** The percentage comes out wrong.
- **Leaving a resistive sensor in the soil and powered all the time.** The probes corrode and the reading drifts over time.
- **Looking at a single reading.** Because of noise you need to take an average.
