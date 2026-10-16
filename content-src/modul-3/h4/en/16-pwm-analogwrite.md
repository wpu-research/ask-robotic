# PWM and analogWrite: the breathing LED
duration: 22

## Wonder
The Uno's pins only know two states: 0 V and 5 V. So how can you light an LED at "half brightness", or make it breathe like a phone's charging light? The answer lies in switching the pin on and off faster than the blink of an eye.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| LED (red) | **A** (anode) leg → resistor leg 2; **K** (cathode) leg → GND |
| 330 Ω resistor | leg 1 to **D9**, leg 2 to the LED's A leg |
| Potentiometer (last program only) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

D9 is one of the pins that "can do PWM". On the Uno these pins have a `~` mark next to them: D3, D5, D6, D9, D10, D11. Type the program into the code editor and run it with ▶; watch the LED's brightness on the canvas.

### What is PWM?
PWM (pulse width modulation) means switching a pin on and off very quickly. The share of the whole period that the pin stays on is called the **duty cycle**.

- Duty cycle 0%: the pin is always LOW, the LED is off.
- Duty cycle 50%: the pin is HIGH half of the time, the LED looks half bright.
- Duty cycle 100%: the pin is always HIGH, the LED is fully bright.

On the Uno, the `analogWrite(pin, değer)` command produces PWM. The value (`değer`) is between 0 and 255, and the duty cycle is `değer / 255`. The average voltage is about `5 V × değer / 255`. PWM on D9, D10 and D11 runs at about 490 Hz: the pin switches on and off about 490 times a second. Your eye cannot follow this speed; it only sees the average brightness.

| `analogWrite` value | Duty cycle | Average voltage |
|---|---|---|
| 0 | 0% | 0 V |
| 64 | about 25% | about 1.25 V |
| 128 | about 50% | about 2.5 V |
| 192 | about 75% | about 3.8 V |
| 255 | 100% | 5 V |

### Program 1: Brightness steps
```cpp
// sketch: pwm_basamak
int seviye[] = {0, 64, 128, 192, 255};

void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {
    analogWrite(9, seviye[i]);   // 0-255 arası PWM değeri
    delay(1000);
  }
}
```

### Program 2: The breathing LED
```cpp
// sketch: pwm_nefes
void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  for (int p = 0; p <= 255; p++) {    // yavaşça parlat
    analogWrite(9, p);
    delay(5);
  }
  for (int p = 255; p >= 0; p--) {    // yavaşça söndür
    analogWrite(9, p);
    delay(5);
  }
}
```

### Program 3: Brightness with a potentiometer
The `analogRead` (0-1023) and `map` you learnt in earlier weeks come in handy here: we convert the reading range into the `analogWrite` range (0-255).
```cpp
// sketch: pwm_pot
void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  int okunan = analogRead(A0);                 // 0-1023
  int parlaklik = map(okunan, 0, 1023, 0, 255);  // 0-255
  analogWrite(9, parlaklik);
  delay(10);
}
```

### How does it work?
1. `analogWrite(9, 64)` switches the pin on and off with about 25% duty cycle. The pin does not really produce an "analogue" voltage; it switches on and off quickly and regularly.
2. In Program 2 the value of `p` rises from 0 to 255, then falls back. Each step takes 5 ms; one full "breath" takes about 2.6 seconds.
3. In Program 3, as you turn the potentiometer the `analogRead` value changes, `map` scales it to 0-255, and the LED brightness follows the pot.
4. `analogWrite(pin, 0)` makes the pin LOW all the time, `analogWrite(pin, 255)` makes it HIGH all the time. At these two ends no PWM wave is produced.

### Try it
- In Program 2, change `delay(5)` to 2 and then to 15. How does the breathing speed change?
- In Program 2, try `analogWrite(9, p * p / 255)`. Does the rise in brightness look more natural? The eye does not sense brightness linearly; in the dark it notices small changes better.
- Move the wire on the resistor's D9 leg to D13 and write `analogWrite(13, 128)`. What happens? (Hint: D13 has no `~` next to it.)

### Common mistakes
- Using `analogWrite` on a pin that cannot do PWM: that pin only goes LOW or HIGH, you get no half brightness. Make sure the pin has a `~` next to it.
- Writing a value bigger than 255 (e.g. 1023): `analogWrite` only expects 0-255. Convert the potentiometer value with `map` first.
- Leaving out the LED's resistor: PWM does not limit the current, you still need the resistor. The lab models this: you get a warning for an LED without a resistor.
- Explaining the LED's half brightness as "the voltage dropped": really the pin is switching on and off quickly, and the average goes down.

## Discuss
If you switch an LED on and off 5 times a second, your eye sees it as "blinking". Why does it see "half bright" when you switch it on and off 490 times a second? How might televisions and screens use this?
