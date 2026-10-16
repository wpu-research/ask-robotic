# RGB LED
slug: rgbled
category: Output
summary: A part that combines three LEDs (red, green and blue) in one package. You make any colour by mixing the brightness of the three channels.

## Pins
- R: Red channel lead. Connects through a resistor to a PWM pin (D9 on this site).
- G: Green channel lead. Connects through a resistor to a PWM pin (D10 on this site).
- B: Blue channel lead. Connects through a resistor to a PWM pin (D11 on this site).
- COM: Common lead of the three channels. Goes to GND on a common cathode, to 5V on a common anode.

## How it works
An **RGB LED** holds three separate LEDs (red, green and blue) in the same package. One lead of each of the three LEDs is joined into a single **COM** lead. If the cathodes are joined it is called **common cathode**; if the anodes are joined it is called **common anode**. In the lab the default is common cathode.

With light, colours **add up**: red + green gives yellow, green + blue gives cyan, red + blue gives purple, and all three together give white. If you set each channel separately with `analogWrite(pin, 0-255)`, you get about 16.7 million colours (256 × 256 × 256).

On a common cathode, a channel lights when its pin is HIGH. On a common anode the logic is reversed: COM goes to 5V and a channel lights when its pin is LOW. That is why you write `analogWrite(pin, 255 - değer)` (değer = value).

**Advanced:** The three LEDs are made from different semiconductors, so their forward voltages differ: red is the lowest, blue the highest. With the same resistor, the blue channel's current is smaller and blue looks dimmer. That is why (255, 255, 255) may look like a slightly tinted white in the lab. In a real circuit you can choose different resistor values for the channels to balance the colour.

## Wiring in the lab
| From | To |
|---|---|
| Uno **D9** | Resistor lead 1; resistor lead 2 to RGB **R** |
| Uno **D10** | Resistor lead 1; resistor lead 2 to RGB **G** |
| Uno **D11** | Resistor lead 1; resistor lead 2 to RGB **B** |
| RGB **COM** | Uno **GND** (common cathode) |

Each channel must have its own resistor. In the properties panel you choose common cathode or common anode in the **Ortak uç** (Common lead) field; on a common anode, COM connects to the Uno 5V. All three pins can do PWM, so you set the brightness of each channel separately.

## Typical values
- Red channel Vf | 1.9 V | Lab model
- Green channel Vf | 2.2 V | Lab model
- Blue channel Vf | 3.0 V | Lab model
- Series resistor (5 V) | 330 Ω | A separate one for each channel; the standard in this site's lessons
- Channel current (330 Ω, pin HIGH) | red ≈ 8.6 mA, green ≈ 7.8 mA, blue ≈ 5.6 mA | Lab model; includes the pin and LED internal resistance
- Burn-out limit | 30 mA | A channel burns out if it goes above this; start over with ↺
- Number of colours | ≈ 16.7 million | 256 × 256 × 256

## Common mistakes
- **Connecting COM to the wrong place.** On a common cathode LED, COM goes to GND. If you connect it to 5V the channels do not light.
- **Not inverting the values on a common anode.** You ask for red and see cyan; write `255 - değer`.
- **Using one resistor for all three channels.** The channels affect each other's brightness; give each channel its own resistor.
- **Mixing up the R, G and B leads.** The colours come out different from what you expect; check your wires.
- **Connecting to a pin without PWM.** Brightness control does not work; the channel only turns fully on or off. Use D9, D10 and D11.
