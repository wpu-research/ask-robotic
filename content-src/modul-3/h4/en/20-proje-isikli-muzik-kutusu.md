# Project: The light-up music box
duration: 35

## Wonder
With a music box, you turn a handle and a melody plays. Your music box will go one step further: when you press a button it will play "Twinkle, Twinkle, Little Star", every note will light up in its own colour, and you will set its speed with a potentiometer. While it waits, a blue light will slowly breathe.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Passive buzzer | **+** leg → **D8**; **-** leg → GND |
| RGB LED (common cathode) | **COM** → GND |
| 330 Ω resistor (red) | **D9** → resistor leg 1; leg 2 → RGB LED **R** leg |
| 330 Ω resistor (green) | **D10** → resistor leg 1; leg 2 → RGB LED **G** leg |
| 330 Ω resistor (blue) | **D11** → resistor leg 1; leg 2 → RGB LED **B** leg |
| Button | **A** leg → **D2**, **B** leg → GND (`INPUT_PULLUP`) |
| Potentiometer | **SIG** → **A0**; **VCC** → 5V, **GND** → GND |

To press the button while the circuit runs, hold down on the button part; change the tempo with the potentiometer's **Position** property.

### Design
- **Waiting:** The blue LED slowly brightens and fades (the breathing from lesson 16).
- **Playing:** When you press the button, the tempo (80-200 beats per minute) is read from the potentiometer and the melody plays. Every note lights up in its own colour.
- **End:** The melody ends, the LED goes off and the waiting breath starts again.

Note colours:

| Note | Frequency | Colour (R, G, B) |
|---|---|---|
| Do | 262 | red (255, 0, 0) |
| Re | 294 | orange (255, 80, 0) |
| Mi | 330 | yellow (255, 200, 0) |
| Fa | 349 | green (0, 255, 0) |
| Sol | 392 | cyan (0, 255, 255) |
| La | 440 | blue (0, 0, 255) |

Remember the rule you learnt in lesson 18: while `tone` is playing, brightness cannot be controlled on D11 (blue). That is why the blue values in the table are only 0 or 255. Red (D9) and green (D10) can be fine-tuned; that is where the shades of orange and yellow come from.

### Program
```cpp
// sketch: muzik_kutusu
const int BUZZER = 8;
const int KIRMIZI = 9;
const int YESIL = 10;
const int MAVI = 11;
const int BUTON = 2;
const int NOTA_SAYISI = 14;

int melodi[]  = {262, 262, 392, 392, 440, 440, 392,
                 349, 349, 330, 330, 294, 294, 262};
int uzunluk[] = {1, 1, 1, 1, 1, 1, 2,
                 1, 1, 1, 1, 1, 1, 2};

int parlak = 0;     // bekleme nefesinin şu anki parlaklığı
int yon = 5;        // +5: parlıyor, -5: sönüyor

void renkAyarla(int r, int g, int b) {
  analogWrite(KIRMIZI, r);
  analogWrite(YESIL, g);
  analogWrite(MAVI, b);       // tone çalarken yalnız 0 ya da 255 olmalı
}

void notaRengi(int frekans) {
  switch (frekans) {
    case 262: renkAyarla(255, 0, 0); break;     // do: kırmızı
    case 294: renkAyarla(255, 80, 0); break;    // re: turuncu
    case 330: renkAyarla(255, 200, 0); break;   // mi: sarı
    case 349: renkAyarla(0, 255, 0); break;     // fa: yeşil
    case 392: renkAyarla(0, 255, 255); break;   // sol: camgöbeği
    case 440: renkAyarla(0, 0, 255); break;     // la: mavi
    default:  renkAyarla(255, 255, 255);        // bilinmeyen nota: beyaz
  }
}

void notaCal(int frekans, int sure) {
  notaRengi(frekans);
  tone(BUZZER, frekans, sure * 9 / 10);
  delay(sure);
  renkAyarla(0, 0, 0);
}

int tempoOku() {
  return map(analogRead(A0), 0, 1023, 80, 200);   // dakikadaki vuruş
}

void melodiCal(int bpm) {
  int vurus = 60000 / bpm;                         // bir vuruşun süresi (ms)
  for (int i = 0; i < NOTA_SAYISI; i++) {
    notaCal(melodi[i], uzunluk[i] * vurus);
  }
}

void bekleNefesi() {
  parlak = parlak + yon;
  if (parlak >= 255) {
    parlak = 255;
    yon = -5;
  }
  if (parlak <= 0) {
    parlak = 0;
    yon = 5;
  }
  analogWrite(MAVI, parlak);
  delay(10);
}

void setup() {
  pinMode(BUZZER, OUTPUT);
  pinMode(KIRMIZI, OUTPUT);
  pinMode(YESIL, OUTPUT);
  pinMode(MAVI, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {     // basılı = LOW
    int bpm = tempoOku();
    Serial.print("tempo: ");
    Serial.println(bpm);
    melodiCal(bpm);
  } else {
    bekleNefesi();
  }
}
```

### How does it work?
1. `loop()` only makes decisions: if the button is pressed it plays the melody, otherwise it moves the waiting breath on by one step. Because the work is split into functions, `loop()` is short and easy to read.
2. `tempoOku()` (read tempo) converts the potentiometer into the range 80-200 with `map`. With the pot in the middle you get about 140 beats per minute; with `60000 / 140`, one beat is about 428 ms.
3. `notaCal` first colours the LED with `notaRengi` (note colour), then plays the note with `tone`. `delay(sure)` waits for the note to finish, then the LED is switched off.
4. The `switch` inside `notaRengi` chooses the colour from the frequency. If you add new notes to the arrays, you must also add a new `case` here.
5. `bekleNefesi` (waiting breath) changes the brightness by 5 units on every call; it goes back and forth between 0 and 255. Because each step takes 10 ms, `loop()` goes round quickly and button presses are noticed without delay. During the melody the button is not read, because `delay` makes the program wait.
6. When the melody ends, if the button is still pressed the melody starts again; if you let go of the button, it goes back to the waiting breath.

### Try it
- To use the blue channel in the melody too, add the notes Si (494) and high Do (523). You could use purple (255, 0, 255) for Si and white (255, 255, 255) for high Do; do not forget to add `case 494:` and `case 523:` to the `switch`.
- Add a second button (D3) that plays a different melody when pressed. You will need to write a `melodiCal` that takes the melody as a parameter. Hint: two separate arrays and an array selector.
- Write a `bitisEfekti()` (ending effect) function for a rainbow finish that passes through all the colours after the melody ends.

### Common mistakes
- Writing `analogWrite(MAVI, 128)` for blue and expecting half brightness while `tone` is playing: PWM does not work on D11 at that time. Use 0 or 255.
- Not putting `break;` at the end of a `case`: the `switch` falls through into the next colour as well and the colours get mixed up.
- Connecting the potentiometer's middle leg somewhere other than A0: the tempo always stays the same.
- Connecting the buzzer to D3 or D11: in this project it must be on D8. D11 is for the blue LED.
- Not leaving a gap between notes: when the same notes come one after another, they sound like one long note. In the code, `sure * 9 / 10` leaves this gap.

## Discuss
Why does the program not react if you press the buttons while the melody is playing? Could there be a way to play the melody and watch the button at the same time? (We will solve this in later lessons.)
