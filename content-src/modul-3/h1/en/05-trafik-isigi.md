# Project: Traffic light
duration: 30

## Wonder
At every junction the lights come on in a set pattern: stop on red, go on green, get ready on amber. Can you build the same pattern with three LEDs and a few lines of code?

## Activity
### Circuit
| Part | Connection |
|---|---|
| Red LED | Anode → 330 Ω → **D13**; cathode → GND |
| Yellow LED | Anode → 330 Ω → **D12**; cathode → GND |
| Green LED | Anode → 330 Ω → **D11**; cathode → GND |

Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. Set the LEDs' colours to red, yellow and green in the properties panel. Each LED must have its own resistor. For the red LED, 330 Ω at 5 V gives a current of about 9 mA (like the calculation in lesson 2). The yellow and green LEDs may have a slightly different voltage drop; even so, this resistor is a safe choice.

### Plan
First write the order of the lights in a table. Making a plan before you write the program means fewer mistakes.

| Stage | LED that is on | Time |
|---|---|---|
| 1 | Red (D13) | 5 seconds |
| 2 | Green (D11) | 5 seconds |
| 3 | Yellow (D12) | 2 seconds |

Then it goes back to the start. Only one LED is on at a time.

### Program
```cpp
// sketch: trafik_isigi
void setup() {
  pinMode(13, OUTPUT);   // kırmızı
  pinMode(12, OUTPUT);   // sarı
  pinMode(11, OUTPUT);   // yeşil
}

void loop() {
  // 1. aşama: kırmızı
  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);
  delay(5000);

  // 2. aşama: yeşil
  digitalWrite(13, LOW);
  digitalWrite(11, HIGH);
  delay(5000);

  // 3. aşama: sarı
  digitalWrite(11, LOW);
  digitalWrite(12, HIGH);
  delay(2000);

  digitalWrite(12, LOW);
}
```

### How does it work?
1. `setup()` makes all three pins outputs.
2. In each stage, `loop()` first decides which LEDs will be on, then waits with `delay`.
3. When the stages are over, the yellow LED is switched off and `loop()` starts again. So the red one lights up again.
4. One full round takes 5 + 5 + 2 = 12 seconds.

### Rewrite it with an array
You can also build the same project with a `for` loop and an array. You can put the pin numbers in an array and make them outputs with a loop inside `setup()`. This is the method you learnt in lesson 4.

```
int ledler[] = {13, 12, 11};

void setup() {
  for (int i = 0; i < 3; i++) {
    pinMode(ledler[i], OUTPUT);
  }
}
```

### Try it
- At real junctions there can be a short warning stage before red changes to green. Add a 1-second stage that lights red and yellow together.
- Make the green LED blink 3 times before it finishes.
- Change the times: red 3 seconds, green 8 seconds. Which direction would have the heavier traffic?

### Common mistakes
- Forgetting to switch off the previous stage's LED: two LEDs are on together.
- Connecting the LEDs to 5 V instead of GND: the LED does not light up, or lights up the wrong way.
- Writing the wrong pin number: if you used D13 for red, you must also write 13 in `digitalWrite`.
- Thinking the `delay` time is in seconds: `delay(5)` is not 5 seconds, it is 5 milliseconds.

## Discuss
At a real junction, the lights for the two directions work together. If you added a second set of lights, how would you arrange the red and green stages? Why would it be dangerous for both directions to be green at the same time?
