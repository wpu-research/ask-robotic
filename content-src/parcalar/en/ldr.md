# LDR
slug: ldr
category: Input
summary: A two-lead part whose resistance goes down as light increases. It is read by building a voltage divider with a fixed resistor.

## Pins
- 1: First lead. It has no polarity; 1 and 2 can be swapped.
- 2: Second lead.

## How it works
An **LDR** (light-dependent resistor) is a part whose resistance changes with the light falling on it. As the light increases, its resistance **goes down**: in the dark it is very large (hundreds of kΩ), in bright light it is very small (a few hundred Ω). The Uno cannot measure resistance, only voltage; that is why the LDR is connected in series with a fixed resistor to make a **voltage divider**.

The standard circuit on this site: the LDR between 5V and A1, and a 10 kΩ resistor between A1 and GND. As the light increases, the LDR's resistance drops, and the voltage at A1 and the `analogRead(A1)` value **go up**. If you swap the two parts, the direction is reversed.

**Advanced:** From the raw value `ham` read at A1, you find the LDR's resistance with `R_ldr = 10000 × (1024 − ham) / ham`. To stop flickering around the threshold, a two-threshold decision (hysteresis) is used.

## Wiring in the lab
| From | To |
|---|---|
| LDR **1** | Uno **5V** |
| LDR **2** | Uno **A1** and lead 1 of the 10 kΩ resistor |
| Lead 2 of the 10 kΩ resistor | Uno **GND** |

You change the light level while the program is running with the **Işık** (Light) slider in the properties panel (between 0 and 1). You do not need to write `pinMode` for `analogRead`.

## Typical values
- Dark (Light 0) | ≈ 1 MΩ | Upper limit of the lab model; with 10 kΩ the reading is ≈ 10
- Medium light (Light 0.5) | ≈ 14 kΩ | With 10 kΩ the reading is ≈ 424
- Bright light (Light 1) | ≈ 200 Ω | With 10 kΩ the reading is ≈ 1004
- Fixed divider resistor | 10 kΩ | The standard in this site's lessons

## Common mistakes
- **Forgetting the fixed resistor.** The LDR sits directly between 5V and A1; the pin is left floating and the measurement becomes meaningless.
- **Swapping the LDR and the fixed resistor.** The circuit works, but `ham` goes down as the light increases; your program's logic is reversed.
- **Choosing a fixed resistor that is too small.** With a value like 100 Ω, Vout stays at almost 0 V all the time and the range gets narrow.
- **Using a single threshold.** When the light is near the threshold, the LED keeps blinking on and off; use two thresholds (hysteresis).
