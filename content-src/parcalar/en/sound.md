# Sound sensor
slug: sound
category: Sensor
summary: A sound module with a microphone. When it is quiet the analog output sits at a baseline level; as sound arrives it moves away from that level.

## Pins
- VCC: Supply lead. Connects to 5V; needs at least 3 V.
- GND: Ground lead. Connects to GND.
- AO: Analog output. Goes to an Uno analog input (A0 in the lessons); the voltage rises as the sound gets louder.
- DO: Digital output. Goes LOW when the loudness crosses the threshold; not used in the lessons.

## How it works
The sound module has a microphone and an amplifier. When the surroundings are quiet, the analog output sits at a steady **baseline level**. With a real microphone, when sound arrives the output swings both above and below this level; that is why the deviation is calculated with `abs(analogRead - baz)` (baz = baseline). The baseline differs from module to module, so it is not assumed but measured at startup.

Height alone is not enough to recognise a clap: you also look at the **duration** of the event. A very short sound is noise, and a very long sound (music, shouting) is not a clap.

**Advanced:** In the lab model, AO = VCC × (0.25 + 0.7 × loudness) and it only goes up; it does not model the two-way swing of a real microphone. When quiet (loudness 0), AO = 1.25 V, so `analogRead` ≈ 256 (not 512).

## Wiring in the lab
| From | To |
|---|---|
| Sound sensor **VCC** | Uno **5V** |
| Sound sensor **GND** | Uno **GND** |
| Sound sensor **AO** | Uno **A0** |

The **Ses şiddeti** (Loudness) slider (0 to 1) in the properties panel simulates sound and can be changed while the program is running. To simulate a clap, set the loudness to 0.8 and immediately set it back to 0. **Eşik (DO)** (Threshold) only affects the digital output.

## Typical values
- Loudness 0 (quiet) | raw ≈ 256 | About 1.25 V; the baseline
- Loudness 0.1 | raw ≈ 327 | Deviation from baseline ≈ 71
- Loudness 0.5 | raw ≈ 614 | Deviation from baseline ≈ 358
- Loudness 0.8 | raw ≈ 829 | Deviation from baseline ≈ 573
- Peak threshold in the lessons | 150 | Smaller deviations do not count as an event
- Duration limits in the lessons | 10 ms and 500 ms | Short noise / clap / long sound

## Common mistakes
- **Assuming the baseline is 512.** The module's baseline is different; always measure it.
- **Measuring the baseline while there is sound.** All the deviations are calculated wrong.
- **Ending the event after a single sample.** When the swinging signal crosses the baseline, a single clap looks like two events; use a quiet margin.
- **Looking only at height.** A slamming door also looks like a clap; check the duration too.
- **Forgetting `abs()`.** A real microphone also swings below the baseline.
