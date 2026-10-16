# Project: Doorbell and press counter
duration: 35

## Wonder
Would you like to know how many people came when your doorbell rang? In this project you will make a simple but clever doorbell: on every press the bell rings, the number of rings is counted and written to the Serial Monitor. On top of that, you will have a second button that mutes the bell: if you hold it down, the bell is silent, but the counter keeps counting. Everything from this week comes together in this project.

## Activity
### Goal
- On every press of the bell button on D2: the LED lights, the bell (buzzer) rings, the counter goes up by one and `Zil: N` (Bell: N) is printed.
- Holding the button down does not make the counter go up again and again (edge detection).
- The button's bounce does not spoil the count (debounce).
- While the mute button on D3 is pressed, "silent mode": the LED lights but the buzzer does not sound. (Optional: this is not an activity goal but an extra feature.)
- If you send `S` from the serial port, it prints the counter; if you send `R`, it resets the counter.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Bell button | One end to **D2**, the other end to **GND** |
| Mute button (optional) | One end to **D3**, the other end to **GND** |
| LED (red) + 330 Ω resistor | **D13** → resistor → LED anode; cathode to GND |
| Active buzzer | Plus (+) leg to **D8**, minus (-) leg to **GND** |

An active buzzer has its own sound generator inside: it beeps when you give the pin HIGH and goes quiet when you give it LOW. The buzzer's legs have a direction: the **+** leg goes to D8 and the **-** leg to GND. When you select the part, set **Type** to **Active** in the right panel (the default is passive). A passive buzzer does not make a sound with `digitalWrite`. Switch on the sound button at the top to hear it.

### Program
```cpp
// sketch: kapi_zili
int sayac = 0;          // kaç kez çalındı
int onceki = HIGH;      // butonun bir önceki durumu

void setup() {
  pinMode(2, INPUT_PULLUP);   // zil butonu
  pinMode(3, INPUT_PULLUP);   // eğim anahtarı
  pinMode(13, OUTPUT);        // LED
  pinMode(8, OUTPUT);         // buzzer
  Serial.begin(9600);
  Serial.println("Kapi zili hazir");
}

void loop() {
  // 1) Zil butonu: kenar algılama + debounce
  int simdi = digitalRead(2);
  if (simdi != onceki) {
    delay(20);                       // sıçrama bitsin
    simdi = digitalRead(2);
    if (simdi != onceki) {
      onceki = simdi;
      if (simdi == LOW) {            // basıldı
        sayac++;
        bool sessiz = (digitalRead(3) == LOW);   // eğim anahtarı kapalı mı?

        digitalWrite(13, HIGH);
        if (!sessiz) {
          digitalWrite(8, HIGH);
        }
        delay(300);                  // zil 300 ms çalsın
        digitalWrite(13, LOW);
        digitalWrite(8, LOW);

        Serial.print("Zil: ");
        Serial.println(sayac);
      }
    }
  }

  // 2) Seri komutlar
  if (Serial.available() > 0) {
    char komut = Serial.read();
    if (komut == 'S') {
      Serial.print("Toplam: ");
      Serial.println(sayac);
    } else if (komut == 'R') {
      sayac = 0;
      Serial.println("Sayac sifirlandi");
    }
  }
}
```

### How does it work?
1. `sayac` (counter) and `onceki` are defined outside `loop()`. That way they are not reset on every pass; they keep their values.
2. The button part is the same as the debounced edge detection from lesson 8. The bell rings only on the falling edge, where `simdi == LOW`.
3. `sayac++` does the same job as `sayac = sayac + 1`.
4. `sessiz` (silent) is a `bool` (true if the mute button on D3 is pressed; the comment in the code says "tilt switch", but in the lab this is a button). `!sessiz` means "if not silent"; the buzzer beeps only then. The LED lights in every case.
5. The serial part is the same as the command-reading pattern from lesson 9.
6. During `delay(300)` the board does not look at anything else. This is not a problem for this project, because the bell is short anyway. A serial command that arrives while the bell is ringing waits in the buffer and is read afterwards.

### Try it
- Make the ring time 100 ms and 1000 ms. Which one feels more natural?
- When the counter reaches 10, make the LED flash three times quickly (e.g. "10th visitor!") and print a message to the Serial Monitor.
- Add the mute button and press the bell button while holding it down: does the counter go up in silent mode? Check by sending `S` from the serial monitor.
- Split the bell into two "tunes": one long beep on a single press, two short beeps if the counter is even. (Hint: `sayac % 2 == 0`; `%` gives the remainder of a division.)

### Common mistakes
- Defining `sayac` inside `loop()`: it goes back to 0 on every pass and never goes up.
- Connecting the buzzer's + and - legs the wrong way round: no sound comes out.
- Leaving the buzzer type as Passive: no sound comes out with `digitalWrite`; producing a tone needs a different method (in the coming weeks).
- Skipping debounce: the counter sometimes goes up by two and sometimes by zero.
- Forgetting to write `Serial.begin(9600)`: nothing appears in the serial monitor.

## Discuss
This bell only counts. What clever features could be added based on the number of visitors? For example, if silent mode switched on by itself at certain times of day, what else would the board need for that?
