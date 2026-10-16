# Buzzer
slug: buzzer
category: Output
summary: A part that makes sound. The active type plays a single fixed tone; the passive type plays any pitch you want with `tone()`.

## Pins
- +: Positive lead. Connected to the Uno's sound pin (D8 on this site).
- -: Negative lead. Connected to GND.

## How it works
A buzzer is a small speaker that turns an electrical signal into sound vibrations. There are two types:

- **Active buzzer:** It has its own oscillator inside. When you give it 5 V, it makes a sound at a single fixed pitch (about 2 kHz). You can only turn the sound on and off. You cannot change the frequency.
- **Passive buzzer:** It has no oscillator inside; it is just a membrane. The pitch of the sound is set by the vibration you send. `tone(8, 440)` switches the pin HIGH-LOW 440 times per second and the buzzer plays 440 Hz (A). `noTone(8)` stops the sound.

The higher the frequency, the higher (thinner) the sound.

## Wiring in the lab
| From | To |
|---|---|
| Buzzer **+** | Uno **D8** |
| Buzzer **-** | Uno **GND** |

You choose the type in the **Tür** (Type) field of the properties panel: Aktif (Active, has its own sound) or Pasif (Passive, with tone). The default is Pasif. To hear the sound you need to turn on the sound button in the lab. On this site the buzzer is connected directly to a pin; in a real circuit, large or powerful buzzers may need a transistor (Module 3, lesson 22).

## Typical values
- Active buzzer frequency | ≈ 2000 Hz | Fixed; makes sound above 2 V
- Note A (A4) | 440 Hz | `tone(8, 440)`
- Note C (C4) | ≈ 262 Hz | `tone(8, 262)`
- Comfortable playing range | a few hundred Hz - a few kHz | At very low or very high frequencies it does not sound like a note
- Type | Passive | Lab default

## Common mistakes
- **Trying to play notes with `tone()` on an active buzzer.** It always makes the same pitch; for notes you need the passive type.
- **Wrong pin.** If you wrote `tone(8, ...)` in your code, the buzzer's + lead must be connected to D8.
- **Not connecting GND.** The circuit is not closed and there is no sound.
- **Not hearing the sound.** Check that the sound button in the lab is turned on.
- **Forgetting that `tone()` plays forever.** If you do not give a duration, the sound keeps playing; you stop it with `noTone()`.
