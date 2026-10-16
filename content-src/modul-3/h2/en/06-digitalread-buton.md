# digitalRead, buttons, INPUT_PULLUP
duration: 20

## Wonder
Until now the board has always done the talking: it switched an LED on and off. But how does the board listen to you? How does it know you pressed a button? In this lesson you will meet `digitalRead`, the board's "ear". There is a small surprise too: why does the pin go LOW when you press the button?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button | One end to **D2**, the other end to **GND** |
| Second button | One end to **D3**, the other end to **GND** |
| LED (red) + 330 Ω resistor | One end of the resistor to **D13**, the other end to the LED anode; LED cathode to GND |
| LED (yellow) + 330 Ω resistor | One end of the resistor to **D12**, the other end to the LED anode; LED cathode to GND |

The button in the lab has two ends (A and B). If you select the button and switch on the **Pressed** property in the right panel, it is pressed; you can also press it by holding it down. You can change it while the circuit runs, too.

Some real buttons and tilt switches work in the same way: they have two ends, and when they close, the two ends are joined. The board sees them all the same. In this lesson, use the second button in the lab for the second input on D3. The D3 input called "tilt switch" in the code is this second button for you.

You will do the lab activity in the section at the bottom of this page; press ▶ to run the program.

### What is a digital input?
A pin can work in two ways:
- `OUTPUT`: The board drives the pin itself. You write HIGH or LOW with `digitalWrite`.
- `INPUT`: The board only listens to the pin. You read it with `digitalRead`; the result is `HIGH` or `LOW`.

When the button is pressed, it connects the pin to GND. But what is the pin connected to when the button is not pressed? Nothing. An input pin left unconnected (a floating input) picks up electrical noise from its surroundings in a real circuit, and it reads HIGH or LOW at random. The lab models this: you get a warning for an unconnected input. To prevent it, you need to "pull" the pin to a voltage.

### INPUT_PULLUP
Inside every input pin of the Arduino there is a resistor you can switch on if you want (about 20-50 kΩ). This resistor pulls the pin towards 5 V. This is called a **pull-up**.

```cpp
pinMode(2, INPUT_PULLUP);
```

The result is:
| Button | Pin voltage | digitalRead |
|---|---|---|
| Not pressed | The internal resistor pulls it to 5 V | `HIGH` (1) |
| Pressed | The button connects the pin to GND | `LOW` (0) |

So **pressed = LOW**. It looks back to front, but all the buttons in this lesson work like this. You do not need an extra resistor outside, so the circuit stays simple.

### Program
First, let's write the value we read straight to the LED.

```cpp
// sketch: buton_led
void setup() {
  pinMode(2, INPUT_PULLUP);   // D2 giriş, iç pull-up açık
  pinMode(13, OUTPUT);
}

void loop() {
  int durum = digitalRead(2); // HIGH (1) ya da LOW (0)
  digitalWrite(13, durum);    // okuduğunu LED'e yaz
}
```

Press ▶ and watch carefully: the LED is on before you press the button and goes off when you press it. The opposite of what you expected! The reason is in the table above: when the button is not pressed, the pin is HIGH, and we write HIGH to the LED.

To fix it, let's flip the value. `HIGH` equals 1 and `LOW` equals 0. The operation `1 - durum` turns 1 into 0 and 0 into 1:

```cpp
// sketch: buton_led_duz
void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int durum = digitalRead(2);
  digitalWrite(13, 1 - durum);  // basılıyken (0) LED'e 1 yaz
}
```

Now the LED lights up when you press. In the next lesson you will write this much more readably with `if`.

Let's read two inputs at once: the button on D2 lights the red LED, and the second button on D3 lights the yellow LED.

```cpp
// sketch: iki_giris
void setup() {
  pinMode(2, INPUT_PULLUP);   // buton
  pinMode(3, INPUT_PULLUP);   // eğim anahtarı
  pinMode(13, OUTPUT);        // kırmızı LED
  pinMode(12, OUTPUT);        // sarı LED
}

void loop() {
  digitalWrite(13, 1 - digitalRead(2));
  digitalWrite(12, 1 - digitalRead(3));
}
```

### How does it work?
1. `pinMode(2, INPUT_PULLUP)` makes the pin an input and switches on the internal pull-up resistor.
2. `digitalRead(2)` looks at the voltage on the pin: if it is about 5 V it gives `HIGH`, if it is about 0 V it gives `LOW`.
3. `loop()` runs thousands of times a second, so the board checks the button all the time.
4. The second button also connects its pin to GND in the same way; the board cannot tell the two buttons apart, and it does not need to.

### Try it
- Write `durum` instead of `1 - durum`, then fix it again. In which version does the LED light while you hold the button down?
- Switch the second button's **Pressed** property on and off. When does the yellow LED light?
- Write `INPUT` instead of `INPUT_PULLUP` and look at the LED without pressing the button. What happens? (This is an experiment; it does no harm in the lab. Put it back afterwards.)

### Common mistakes
- Not writing `pinMode`, or writing `INPUT` and leaving it: the pin floats and the LED flickers at random.
- Connecting the button between the pin and 5 V: in this lesson the button is always between the pin and **GND**.
- Thinking "pressed = HIGH": with `INPUT_PULLUP`, pressed is LOW.
- Connecting both ends of the button to the same node (for example both to GND): the button changes nothing. One end must go to the pin and the other to GND.

## Discuss
Why does a pin left unconnected read random values? Can you find a similar situation from everyday life (e.g. the hiss from a microphone even when nobody is talking)?
