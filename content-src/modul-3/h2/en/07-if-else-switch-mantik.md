# if/else, switch, logic operators
duration: 22

## Wonder
What happens when someone rings the doorbell? If someone presses the button, a light comes on. But what if nobody is there? What if two people press at the same time? How does the board learn to make decisions? In this lesson you will learn how to tell your program "if ... then ... otherwise ...".

## Activity
### Circuit
The same circuit as last lesson; we only add one more LED. Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button | One end to **D2**, the other end to **GND** |
| Second button | One end to **D3**, the other end to **GND** |
| LED (red) + 330 Ω resistor | **D13** → resistor → LED anode; cathode to GND |
| LED (yellow) + 330 Ω resistor | **D12** → resistor → LED anode; cathode to GND |
| LED (green) + 330 Ω resistor | **D11** → resistor → LED anode; cathode to GND |

The second button on D3 stands for the input called "tilt switch" in the code; there is no tilt switch in the lab, so we use a button. It makes no difference to the board.

### if and else
`if` looks at a condition. If the condition is true, it runs the code inside the curly brackets. `else` runs if the condition is not true.

```cpp
// sketch: if_else
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW) {   // buton basılı mı?
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}
```

Much more readable than last lesson's `1 - durum` trick: "If D2 is LOW, switch the LED on; otherwise switch it off".

Careful: comparison uses **two** equals signs (`==`). A single `=` assigns a value; it does not compare.

If there are more than two possibilities, you can add `else if`:

```cpp
if (digitalRead(2) == LOW) {
  // buton basılı
} else if (digitalRead(3) == LOW) {
  // buton basılı değil ama ikinci buton basılı
} else {
  // ikisi de açık
}
```

The chain checks in order from top to bottom, runs the first one that is true and does not look at the rest.

### Comparison operators
| Operator | Meaning |
|---|---|
| `==` | equal? |
| `!=` | not equal? |
| `<` `>` | less than, greater than? |
| `<=` `>=` | less than or equal, greater than or equal? |

### Logic operators
To combine more than one condition:
| Operator | Read as | True if... |
|---|---|---|
| `&&` | and | both conditions are true |
| `\|\|` | or | at least one is true |
| `!` | not | the condition is NOT true |

In the program below, three LEDs show three different kinds of logic:

```cpp
// sketch: mantik
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  bool buton = (digitalRead(2) == LOW);   // true: buton basılı
  bool egim  = (digitalRead(3) == LOW);   // true: eğim anahtarı kapalı

  digitalWrite(13, buton && egim);        // kırmızı: ikisi birden
  digitalWrite(12, buton || egim);        // sarı: en az biri
  digitalWrite(11, !egim);                // yeşil: eğim anahtarı kapalı değil
}
```

`bool` is a variable with two values: `true` or `false`. `digitalWrite` understands `true` as HIGH and `false` as LOW.

### switch
If you are going to split into many paths depending on a number, `switch` is tidier. Below we turn the state of the two buttons into a single number: the first button gives 1 point and the second button gives 2 points.

```cpp
// sketch: switch_durum
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  int kod = 0;
  if (digitalRead(2) == LOW) {
    kod = kod + 1;
  }
  if (digitalRead(3) == LOW) {
    kod = kod + 2;
  }

  switch (kod) {
    case 1:                      // yalnız buton
      digitalWrite(13, HIGH);
      digitalWrite(12, LOW);
      digitalWrite(11, LOW);
      break;
    case 2:                      // yalnız eğim anahtarı
      digitalWrite(13, LOW);
      digitalWrite(12, HIGH);
      digitalWrite(11, LOW);
      break;
    case 3:                      // ikisi birden
      digitalWrite(13, LOW);
      digitalWrite(12, LOW);
      digitalWrite(11, HIGH);
      break;
    default:                     // hiçbiri (kod = 0)
      digitalWrite(13, LOW);
      digitalWrite(12, LOW);
      digitalWrite(11, LOW);
      break;
  }
}
```

### How does it work?
1. The `if` condition inside the brackets is evaluated; if it is true, the code inside `{ }` runs.
2. `buton && egim` is true only if both sides are true; `buton || egim` is true if at least one is true.
3. `switch (kod)` looks at the value of `kod` and jumps to the matching `case` line.
4. `break` leaves the switch. If you forget it, the program falls through into the next `case` too.
5. `default` runs if no `case` matches.

### Try it
- In the `mantik` program, change the yellow LED's condition from `||` to `&&`. Is there still any difference between the yellow LED and the red LED?
- Add `case 0:` to the `switch_durum` program and make the green LED light when nothing is pressed.
- In the `switch_durum` program, light all three LEDs for `case 3:`.
- Delete the `break;` statements on the `case 1:` and `case 2:` lines and watch what happens.

### Common mistakes
- Writing `if (x = 5)`: this is an assignment. Use `==` to compare.
- Writing a single `&` instead of `&&`: a single `&` is a different operation (a bit operation); do not use it for now.
- Putting `;` straight after the brackets, as in `if (...);`: the `if` does nothing and ends, and the code inside the curly brackets always runs.
- Forgetting `break` inside `switch`: the program runs the code of the next `case` as well.

## Discuss
Think of a door or an alarm in your home. In which situations might it work with "and" logic, and in which with "or" logic? Example: does a lift door move only if it is closed and a button has also been pressed?
