# NTC thermistor
slug: ntc
category: Input
summary: A two-lead part whose resistance drops as temperature rises. It is turned into a temperature by building a divider with a fixed resistor and using the beta formula.

## Pins
- 1: First lead. It is not polarized; 1 and 2 can be swapped.
- 2: Second lead.

## How it works
An **NTC** (Negative Temperature Coefficient) thermistor is a resistor whose resistance **drops** as the temperature rises. The common type is 10 kΩ at 25 °C. The change in resistance with temperature is not linear; it follows an exponential curve.

The sensor is built as a voltage divider with a 10 kΩ fixed resistor: the fixed resistor between 5V and A2, the NTC between A2 and GND. When the temperature rises, the NTC's resistance gets smaller, so the A2 voltage and the `analogRead(A2)` value **decrease**. From the raw value, the NTC resistance is found with `R = 10000.0 × raw / (1024 − raw)`.

**Advanced:** To get temperature from resistance, you use the beta formula: `1/T = 1/T0 + log(R / R0) / B`. Here T0 = 298.15 K, R0 = 10 kΩ, B = 3950 (lab model). The result is in Kelvin; for Celsius, subtract 273.15. A more accurate model is the Steinhart-Hart equation. For a real part, read the B value from its datasheet.

## Wiring in the lab
| From | To |
|---|---|
| NTC **1** | Uno **A2** and lead 2 of the 10 kΩ resistor |
| NTC **2** | Uno **GND** |
| Lead 1 of the 10 kΩ resistor | Uno **5V** |

You change the temperature while running with the **Sıcaklık** (Temperature) slider in the properties panel (-20 to 120 °C). You do not need to write `pinMode` for `analogRead`.

## Typical values
- 0 °C | ≈ 33.6 kΩ | B = 3950 model
- 25 °C | 10 kΩ | Reference point; reading ≈ 512
- 50 °C | ≈ 3.59 kΩ | Reading ≈ 270
- 100 °C | ≈ 0.70 kΩ | Reading ≈ 67
- Beta coefficient (B) | 3950 | Lab model; varies for a real part

## Common mistakes
- **Mixing up Kelvin and Celsius.** The formula gives Kelvin; if you forget to subtract 273.15, you see numbers like 298.
- **Using `log10` instead of `log`.** The beta formula needs the natural logarithm.
- **Writing the wrong fixed-resistor value in the code.** If you write 10000 in the code but use a different value in the circuit, the result is off.
- **Writing `10000 * ham`.** The `int` overflows; write `10000.0 *`.
- **Not checking for raw = 0 or 1023.** A disconnected or short-circuited sensor gives a meaningless temperature.
