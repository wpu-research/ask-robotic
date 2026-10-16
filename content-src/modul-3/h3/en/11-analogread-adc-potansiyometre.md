# analogRead, the ADC and the potentiometer
duration: 20

## Wonder
A button has two states: pressed or not. But how many states does a volume knob, a light sensor or a thermometer have? Infinitely many! How does a digital board understand these "in-between values"?

## Activity
### Analog and digital
`digitalRead` sorts the voltage on a pin into only two classes: HIGH or LOW. In the real world (and in the lab) the voltage can take any value between 0 V and 5 V. This is called an **analog** signal.

Inside the Arduino Uno there is an **ADC** (Analog-to-Digital Converter). The ADC measures the voltage on the pin and turns it into a number:

- The measurement is **10-bit**: 2 to the power of 10 = **1024** different values (0 to 1023).
- 0 V → 0, 5 V → about 1023. The reference voltage (the upper limit) is 5 V by default.
- The width of one step: 5 V / 1024 ≈ **4.9 mV**.

To turn the number into a voltage:

`gerilim = ham × 5,0 / 1024`

| Voltage | `analogRead` value |
|---|---|
| 0 V | 0 |
| 1.25 V | 256 |
| 2.5 V | 512 |
| 3.75 V | 768 |
| 5 V | 1023 |

The analog inputs are pins **A0-A5**. You do not need to write `pinMode`; `analogRead(A0)` is enough.

### Potentiometer
A potentiometer is a three-terminal resistor whose position changes. The pot part in the lab has the terminals **VCC**, **SIG** and **GND**: you connect VCC to 5V and GND to GND. The middle terminal **SIG** moves between 0 V and 5 V as you drag the slider. If you connect SIG to A0, you read the slider's position as a number.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Potentiometer (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |
| LED (red) | **A** (anode) → leg 2 of the 330 Ω resistor; **K** (cathode) → GND |
| 330 Ω resistor | Leg 1 to **D11**, leg 2 to the LED's **A** leg |

We chose D11 because this pin supports brightness control (PWM). D13 does not.

### Program
First, let's see the number we read and the voltage in the Serial monitor. `float` is the variable type that holds a decimal number. `Serial.print(volt, 2)` prints the number with 2 digits after the decimal point.

```cpp
// sketch: pot_oku
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);          // 0-1023
  float volt = ham * 5.0 / 1024.0;   // gerilime çevir
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" volt=");
  Serial.println(volt, 2);
  delay(500);
}
```

Now let's set the LED's brightness with the knob. `analogWrite(pin, değer)` writes a "brightness" value from 0 to 255 to the pin: 0 is off, 255 is fully bright. You will learn how it works in lesson 16. For now, just take it as a tool to use.

The ADC gives 0-1023, but `analogWrite` wants 0-255. Since 1024 / 4 = 256, dividing the raw value by 4 is enough.

```cpp
// sketch: pot_parlaklik
void setup() {
  pinMode(11, OUTPUT);
}

void loop() {
  int ham = analogRead(A0);
  analogWrite(11, ham / 4);   // 0-1023 -> 0-255
}
```

### How does it work?
1. `analogRead(A0)` measures the voltage on A0 and gives a whole number from 0 to 1023.
2. In `ham * 5.0 / 1024.0` we wrote `5.0`, because integer division throws away everything after the decimal point. When you multiply by a decimal number, the result is a decimal.
3. `ham / 4` is integer division. 1023 / 4 = 255, so it never goes above 255.
4. When the slider is pulled to the end, the LED is at its brightest; when it is pulled to the start, the LED goes off.

### Try it
- Change `delay(500)` to 50. Do the numbers in the Serial monitor change smoothly as you drag the slider?
- Bring the slider exactly to the middle (0.5). Is the number about 512? In real circuits the number can jitter by 1-2 units even when the pot does not move at all (noise); we will deal with this using smoothing in lesson 14. Why do you think it happens?
- Write `255 - ham / 4` instead of `ham / 4`. How does the LED's behaviour change?

### Common mistakes
- Connecting the VCC or GND terminal of the potentiometer to A0 instead of SIG: the number never changes.
- Leaving the VCC or GND terminal unconnected: the measurement becomes meaningless (in the lab the pin is left "floating").
- Trying to read an analog pin with `digitalRead`: you only see 0 or 1.
- Writing `ham * 5 / 1024`: because both sides are whole numbers, the result is rounded to 0, 1, 2... Write `5.0` to do a decimal calculation.

## Discuss
If the ADC were 8-bit instead of 10-bit, how many different values could we read? Would the voltage width of one step get bigger or smaller?
