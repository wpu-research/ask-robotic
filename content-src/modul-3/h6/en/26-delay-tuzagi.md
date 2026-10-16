# The delay trap
duration: 20

## Wonder
Blinking an LED with `delay()` was very easy. But what happens if you press a button briefly while the LED is blinking? Does the board notice the press, or is it "asleep" at that moment? In this lesson you will find out with an experiment.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| LED (red) + 330 Ω resistor | Resistor end 1 to **D13**, resistor end 2 to LED **A**; LED **K** → GND |
| Button | **A** end to **D2**, **B** end to GND (`INPUT_PULLUP`, pressed = LOW) |

Then write the code into `sketch.ino` and press ▶. Select the resistor and set it to 330 Ω in the properties panel.

### Program
The program below turns the LED on for 1 second and off for 1 second. At the end of each round it checks the button; if it is pressed, it increases the counter and prints it.

```cpp
// sketch: delay_kacirir
int sayac = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);

  if (digitalRead(2) == LOW) {   // butona yalnızca burada bakılıyor
    sayac++;
    Serial.print("Basis sayisi: ");
    Serial.println(sayac);
  }
}
```

Now, while the LED is on, click the button on the circuit canvas for a short moment (0.1 seconds); to hold the button down, keep the mouse button pressed. Most likely nothing appears in the Serial monitor. But if you hold the button down for longer than 2 seconds, it is counted. In the lab you can see this even without doing it yourself: the activity goals check this behaviour.

### How does it work?
1. While `delay(1000)` runs, the processor does not move on to any other line; it only counts. This is called **blocking** code.
2. The button is checked with `digitalRead` only at the end of the round, once every 2 seconds.
3. Every short press made between these two "looks" is missed. The board never saw the button.
4. A press is only caught if it happens exactly at a look moment (or if the button is held down).

You can also see for yourself how many times the loop runs:

```cpp
// sketch: delay_tur_sayaci
int tur = 0;

void setup() {
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  tur++;
  Serial.println(tur);
  digitalWrite(13, !digitalRead(13));   // LED'in durumunu tersine çevir
  delay(1000);
}
```

`loop()` runs only **once** per second. So the board's "eye" opens once per second. The processor can do millions of operations per second, but `delay` makes it waste almost all of its time.

### Try it
- In the first program, press the button briefly while the LED is on. Does the counter go up? Then hold the button down for 2 seconds and try again.
- Change the `delay(1000)` values to `delay(100)`. Are short presses now caught more often? Does the LED still blink once a second?
- Try to blink one LED every 1000 ms and a second LED every 300 ms using only `delay`. Explain why it is hard.

### Common mistakes
- Thinking "the button is broken": the button part is fine; the program does not see the press.
- Looking for the fix in a shorter `delay`: presses are caught a little more often, but the problem does not go away, and the LED's timing breaks too.
- Printing lots of text to the serial port and slowing it down with `delay`: this blocks the board as well.

## Discuss
A robot has to drive its motor and also check an obstacle button. What happens if it uses `delay`? How do you think we can do the waiting without `delay`?
