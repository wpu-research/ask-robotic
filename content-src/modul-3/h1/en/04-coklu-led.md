# Several LEDs, the for loop and arrays
duration: 25

## Wonder
To light four LEDs one after another, you have to write the same lines four times. But what if there were 40 LEDs? Instead of writing the same job again and again, programmers make the board repeat it by itself.

## Activity
### Circuit
| Part | Connection |
|---|---|
| LED 1 (red) | Anode → 330 Ω → **D13**; cathode → GND |
| LED 2 (yellow) | Anode → 330 Ω → **D12**; cathode → GND |
| LED 3 (green) | Anode → 330 Ω → **D11**; cathode → GND |
| LED 4 (blue) | Anode → 330 Ω → **D10**; cathode → GND |

Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. Each LED has its own resistor. You can connect the four K legs to any of the Uno's GND pins. You choose the LED's colour in the properties panel.

### The for loop
A `for` loop repeats a job a set number of times. It has three parts:

```
for (int i = 10; i <= 13; i++) {
  // i takes the values 10, 11, 12, 13 in turn
}
```

- `int i = 10`: the counter starts at 10.
- `i <= 13`: carry on as long as the counter is less than or equal to 13.
- `i++`: after each round, add 1 to the counter.

Instead of writing four `pinMode` lines, you can use a loop:

```
for (int pin = 10; pin <= 13; pin++) {
  pinMode(pin, OUTPUT);
}
```

### Program 1: LEDs that light up in turn
```cpp
// sketch: coklu_led
void setup() {
  for (int pin = 10; pin <= 13; pin++) {
    pinMode(pin, OUTPUT);
  }
}

void loop() {
  for (int pin = 10; pin <= 13; pin++) {
    digitalWrite(pin, HIGH);   // bu LED yansın
    delay(300);
    digitalWrite(pin, LOW);    // sonra sönsün
  }
}
```

### Array
An array stores many values of the same type under a single name. The elements are numbered starting **from 0**.

```
int ledler[] = {13, 12, 11, 10};
// ledler[0] = 13, ledler[1] = 12, ledler[2] = 11, ledler[3] = 10
```

Thanks to the array, the pin numbers do not have to be in order. You connect the LEDs to whichever pins you like and write the order in the array. (`ledler` means "LEDs".)

### Program 2: A light that goes back and forth
```cpp
// sketch: dizi_led
int ledler[] = {13, 12, 11, 10};

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(ledler[i], OUTPUT);
  }
}

void loop() {
  // ileri: 13, 12, 11, 10
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledler[i], HIGH);
    delay(200);
    digitalWrite(ledler[i], LOW);
  }
  // geri: 11, 12
  for (int i = 2; i >= 1; i--) {
    digitalWrite(ledler[i], HIGH);
    delay(200);
    digitalWrite(ledler[i], LOW);
  }
}
```

### How does it work?
1. Inside `setup()`, the loop makes all four pins outputs.
2. In the forward loop, `i` goes from 0 to 3. `ledler[i]` becomes 13, 12, 11 and 10 in turn.
3. In the backward loop, `i--` takes 1 off the counter; `i` goes down from 2 to 1. This way, the LEDs at the ends do not light up twice, and the light goes back and forth.
4. Each LED is on for 200 ms, then goes out. One full round takes 6 × 200 = 1200 ms.

### Try it
- Change the `delay` values to 50 ms and press ▶ again. Can you still see the lights separately?
- Add a new pin to the `ledler` array (e.g. D9) and change the loop limits to match.
- Write a program that first switches them all on together and then switches them all off together.

### Common mistakes
- Writing `ledler[4]` for the array: the last element of a 4-element array is `ledler[3]`. Going past the end of the array leads to unexpected behaviour.
- Mixing up `<` and `<=` in the loop condition: one element too many or too few is processed.
- Putting a `;` at the end of the `for` line: the loop body does not run.
- Thinking the array's elements start from 1: the first element is `ledler[0]`.

## Discuss
If there were thirty LEDs instead of four, what would using a loop and an array gain you? How long would the same program be without an array?
