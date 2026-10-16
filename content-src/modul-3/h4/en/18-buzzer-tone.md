# The buzzer: tone and note frequencies
duration: 22

## Wonder
Every musical instrument does the same thing: it makes the air vibrate at a certain speed. How many times the vibration happens per second decides which note we hear. If you switch an Arduino pin on and off 440 times a second, which note have you played?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Passive buzzer | **+** leg → **D8**; **-** leg → GND |

There are two kinds of buzzer. An **active** buzzer has its own oscillator inside: give it 5 V and it makes one fixed sound. A **passive** buzzer is just like a loudspeaker; the pitch of the sound is set by the vibration you produce. In this lesson we use a passive buzzer. When you add the part, make sure **Type: Passive (with tone)** is selected in the properties panel (this is the default). To hear the sound, switch on the sound button at the top.

### Frequency and notes
Frequency is the number of vibrations per second; its unit is the hertz (Hz). The higher the frequency, the higher the pitch.

| Note | Frequency (approx.) |
|---|---|
| Do (C4) | 262 Hz |
| Re (D4) | 294 Hz |
| Mi (E4) | 330 Hz |
| Fa (F4) | 349 Hz |
| Sol (G4) | 392 Hz |
| La (A4) | 440 Hz |
| Si (B4) | 494 Hz |
| Do (C5) | 523 Hz |

The last "Do" in the table (C5) is one **octave** above the first "Do" (C4), and its frequency is about twice as high (262 → 523). The same holds for La: 440 → 880. The values in this table are rounded; `tone` asks for a whole-number frequency anyway.

### The tone() command
- `tone(pin, frekans)`: produces a square wave at that frequency (`frekans`) on the pin. It lasts until you call `noTone(pin)`.
- `tone(pin, frekans, süre)`: plays for `süre` (duration) milliseconds and then stops by itself.

A square wave means the pin is HIGH and LOW for equal times (50% duty cycle). Because `tone` uses a timer in the background, it does **not block** the program while it plays: the line straight after the command runs at once. If you want to wait for the note to finish, you must write a `delay`.

### Program 1: The note La
```cpp
// sketch: buzzer_a4
void setup() {
  tone(8, 440);      // D8'de sürekli 440 Hz (La)
}

void loop() {
}
```

### Program 2: The C major scale
```cpp
// sketch: buzzer_gam
int notalar[] = {262, 294, 330, 349, 392, 440, 494, 523};

void setup() {
}

void loop() {
  for (int i = 0; i < 8; i++) {
    tone(8, notalar[i], 400);   // 400 ms çal
    delay(500);                 // 100 ms sessizlik dahil 500 ms bekle
  }
  delay(1000);
}
```

### Program 3: Octave
```cpp
// sketch: buzzer_oktav
void setup() {
}

void loop() {
  tone(8, 440, 400);    // La
  delay(500);
  tone(8, 880, 400);    // bir oktav yukarısı
  delay(500);
  delay(1000);
}
```

### Program 4: tone and PWM together
The `tone` command uses the Uno's timer number 2 (Timer2). According to the official Arduino documentation, this **interferes with the `analogWrite` output on D3 and D11.** The interference only happens while `tone` is playing. Brightness control does not work on these pins, but you can use fully on (255) or fully off (0). D9 and D10 are not affected.
```cpp
// sketch: buzzer_ve_pwm
void setup() {
  tone(8, 440);            // buzzer çalıyor
  analogWrite(9, 64);      // D9 PWM çalışmaya devam eder (yaklaşık %25)
  analogWrite(11, 255);    // D11 yalnızca tam açık/kapalı olur
}

void loop() {
}
```
Our RGB LED has red on D9, green on D10 and blue on D11. We will use this in the project lesson: while a note plays, we will only switch the blue channel on and off.

### How does it work?
1. `tone(8, 440)` makes the pin go HIGH-LOW 440 times a second. The buzzer's membrane vibrates at this speed and produces the 440 Hz La sound.
2. In Program 2 the `notalar` (notes) array holds the frequencies from the table; the `for` loop plays them in order.
3. `tone(8, notalar[i], 400)` plays for 400 ms. With `delay(500)` we leave a 100 ms gap; without the gap, repeated notes would run into each other.
4. `tone` makes the pin an output by itself; you do not have to write `pinMode` (writing it does no harm either).

### Try it
- In Program 2, play the scale backwards (let `i` go down from 7 to 0).
- Write `for (int f = 200; f <= 1000; f += 10) { tone(8, f); delay(10); }`. Did you hear something like a siren?
- Try a very low frequency such as 20 Hz, or a very high one such as 10000 Hz. Why does the buzzer no longer sound like a "note"? (Hint: buzzers have a range in which they play comfortably.)

### Common mistakes
- Trying `tone` with an active buzzer: an active buzzer makes the same sound at every frequency. If you cannot hear the notes, check the buzzer's type in the properties panel.
- Not putting a `delay` after a note: `tone` does not wait, and the next `tone` cuts the previous one off at once. Only the last note is heard.
- Expecting brightness control with `analogWrite` on D3 or D11 while `tone` is playing: PWM on these pins is disturbed (see above).
- Connecting the buzzer to the wrong pin: if your code says `tone(8, ...)`, the buzzer's **+** leg must be wired to D8.

## Discuss
Why do we hear the same La note differently when a guitar and a flute play it? Why does the buzzer always sound like "beep beep" and not like an instrument?
