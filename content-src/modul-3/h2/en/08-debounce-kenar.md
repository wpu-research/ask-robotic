# Debounce and edge detection
duration: 25

## Wonder
You pressed a button once, but the board thought you pressed it two or three times. Or it thought you never pressed it at all. The program has no bugs and the circuit is correct. So why? The answer is inside the button: the metal contacts hit each other and bounce. In this lesson you will learn how to catch this "bounce".

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button | One end to **D2**, the other end to **GND** |
| LED (red) + 330 Ω resistor | **D13** → resistor → LED anode; cathode to GND |

**Important:** The button in the lab gives a perfectly clean signal; bounce is not modelled. So in this lesson you will not see the bounce problem on the screen. The explanation of bounce below is an information note about real buttons. Even so, you will see that the debounced program works correctly in the lab too: the goal is "one press, one action" behaviour.

You do the activity in the section at the bottom of this page.

### What is bounce?
When a button closes, two metal parts hit each other. The parts spring back; the contact opens and closes for a few milliseconds. Our eyes cannot see this, but the board can, because it reads thousands of times a second. On a real button a press looks like this (time runs from left to right):

| | Values on the pin |
|---|---|
| Expected | HIGH, HIGH, HIGH, **LOW**, LOW, LOW, LOW |
| Real | HIGH, HIGH, **LOW, HIGH, LOW, HIGH**, LOW, LOW, LOW |


So a single press produces a short sequence on the pin such as `HIGH, LOW, HIGH, LOW, ...`. The same thing happens when the button is released. This bounce usually lasts a few milliseconds; it depends on the quality of the button. When the ball in a tilt switch rolls about, its contact opens and closes in the same way.

### What is an edge?
An **edge** happens when the button changes from one state to the other:
- A change from HIGH to LOW: a **falling edge** (pressed).
- A change from LOW to HIGH: a **rising edge** (released).

The question "Is the button pressed?" is about a **level**. The question "Was the button pressed just now?" is about an **edge**. If you are making a counter or an on-off switch, you need the edge: as long as you hold the button down, it must count only once.

To catch the edge, we store the previous state in a variable and compare it with the current one.

### A program with a problem: no debounce
Let the LED flip every time you press the button (if it is on, it goes off; if it is off, it comes on):

```cpp
// sketch: sicrama_var
int onceki = HIGH;
int ledDurum = LOW;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int simdi = digitalRead(2);

  if (onceki == HIGH && simdi == LOW) {   // düşen kenar: basıldı
    ledDurum = 1 - ledDurum;              // LED'in durumunu ters çevir
    digitalWrite(13, ledDurum);
  }
  onceki = simdi;
}
```

The logic looks right. In the lab this program works properly with the clean signal. But on a real button, bounce sometimes makes one press produce two falling edges. The LED flips twice and stays in its old state as if you had never pressed. Sometimes there are three edges and everything looks fine. The result cannot be predicted.

### The solution: debounce
Debounce means "I saw a change, but let me wait a moment and look again: has it really changed?" The simplest way is to wait with `delay`.

```cpp
// sketch: debounce_ms
int onceki = HIGH;
int ledDurum = LOW;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int simdi = digitalRead(2);

  if (simdi != onceki) {            // bir değişiklik var gibi
    delay(20);                      // sıçrama bitsin diye 20 ms bekle
    simdi = digitalRead(2);         // sakinleşmiş değeri tekrar oku
    if (simdi != onceki) {          // değişiklik gerçekmiş
      if (simdi == LOW) {           // düşen kenar: basıldı
        ledDurum = 1 - ledDurum;
        digitalWrite(13, ledDurum);
      }
      onceki = simdi;
    }
  }
}
```

### How does it work?
1. `onceki` (previous) holds the button's value from the previous pass. `simdi` (now) is the value in this pass.
2. If the two are different, there is an edge. But it might be bounce.
3. After waiting 20 ms the bounce is over. If you read the pin again and it is still different from `onceki`, the change is real.
4. We flip the LED's state only on the change to `LOW` (the press). On the release edge we do nothing.
5. Even if you hold the button down, it is not counted again and again, because `simdi == onceki`: one press, one action.
6. The bounce when you release goes through the same check.

20 ms is enough for most buttons. For a worse button you may need to raise it to 30-50 ms. If you make it too long, you will miss quick presses.

### Try it
- Delete the `delay(20)` line and press twenty times in the lab. You will see no difference, because the lab's button is clean; explain in your own words why there would be a difference on real buttons.
- Hold the button down for a long time. Check that the LED changes only once (edge detection).
- Make the debounce time 1 ms, then 200 ms. What goes wrong in each case?
- Change the program so that it flips "on release" (rising edge).

### Common mistakes
- Forgetting the `onceki = simdi;` line: the board keeps seeing the same edge.
- Using a level instead of an edge (flipping the LED inside `if (digitalRead(2) == LOW)`): as long as you hold the button, the LED flashes on and off like mad.
- Forgetting debounce on release: pressing works fine, but you get a fake press when you let go.
- A very long `delay`: during this time the board cannot look at anything else. So keep the time as short as it needs to be.

## Discuss
When you press a lift button, the button lights once; it does not behave as if you had pressed it two or three times in a row. How do you think the program inside it might be using debounce and edge detection?
