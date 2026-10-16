# IR obstacle sensor
slug: irobstacle
category: Sensor
summary: A module that tells you whether there is an obstacle in front of it by looking at reflected infrared light; it does not measure distance, it just says "yes/no".

## Pins
- VCC: Power supply. In the lab it works with 3 V and above; in the lessons it connects to the 5V pin.
- OUT: Digital output. LOW when there is an obstacle, HIGH when there is none (the common arrangement; some modules do the opposite).
- GND: Ground. Connects to the Uno's GND.
- AO: Analog output. Its voltage rises as the reflection gets stronger; you choose the threshold in your code.

## How it works
The module has an infrared LED and a receiver on it. The LED sends out light; if there is an object in front, part of the light bounces back to the receiver. If the reflection goes above a certain level, the module says "obstacle detected".

The threshold can be set in two places. For the **OUT** output, the threshold is on the module's small **adjustment screw** (hardware). For the **AO** output, you read the raw reflection voltage and set the threshold in your code. If the value wobbles around the threshold, using two thresholds (hysteresis) instead of one stops the output from flickering.

The reflection depends not only on distance but also on the object's colour and surface: light-coloured matte surfaces are easy to detect, dark and shiny ones are hard. Strong ambient light can spoil the measurement on real modules (the lab does not model this).

**Advanced:** In the lab model, AO is a linear function of the proximity value: it is the fraction 0.05 + 0.9 × proximity of VCC. At proximity 0 you read about 0.25 V, at 1 about 4.75 V. When counting objects, you count the "nothing to something" transition (the edge), not the level.

## Wiring in the lab
| From | To |
|---|---|
| IR obstacle **VCC** | Uno **5V** |
| IR obstacle **GND** | Uno **GND** |
| IR obstacle **OUT** | Uno **D3** |
| IR obstacle **AO** (optional) | Uno **A0** |

The properties panel has two sliders: **Yakınlık** (Proximity, 0-1, how much the object reflects) and **Eşik (ayar vidası)** (Threshold (adjustment screw), 0-1, default 0.5). If the proximity is equal to or greater than the threshold, an obstacle is detected. Use `INPUT` for OUT; the module drives the output.

## Typical values
- OUT, with an obstacle | LOW | Common arrangement; check the module's documentation
- OUT, with no obstacle | HIGH | Common arrangement
- Default threshold | 0.5 | Position of the adjustment screw in the lab
- AO, proximity 0 | ≈ 0.25 V (analogRead ≈ 51) | Lab model
- AO, proximity 1 | ≈ 4.75 V (analogRead ≈ 972) | Lab model
- Operating voltage | ≥ 3 V | In the lab, 3.3 V also counts as powered

## Common mistakes
- **Assuming the output level is the same on every module.** Some modules give HIGH for an obstacle; put the level in a constant.
- **Expecting centimetres from it.** OUT only says yes/no; for distance you need an HC-SR04 or a ToF sensor.
- **Using a single threshold.** When the AO value wobbles around the threshold, the output flickers; use two thresholds.
- **Counting the level when counting objects.** An object that stays put gets counted on every loop; count the edge.
- **Ignoring colour.** Dark or shiny surfaces reflect little and may not be detected.
