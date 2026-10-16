# First program: Blink
duration: 20

## Wonder
Every program has its own "hello world". In hardware, it is making an LED blink. So how does a board know when an LED should switch on and when it should switch off?

## Activity
### Circuit
| Part | Connection |
|---|---|
| LED (red) | **A** (anode, long leg) → one end of the resistor; **K** (cathode, short leg) → GND |
| 330 Ω resistor | One end to **D13**, the other end to the LED's **A** leg |

Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. Set the resistor's value to 330 Ω in the properties panel.

The Uno's built-in L LED is also connected to D13; even without an external LED, the program makes it blink.

### Program
```cpp
// sketch: blink
void setup() {
  pinMode(13, OUTPUT);      // 13. pini çıkış yap
}

void loop() {
  digitalWrite(13, HIGH);   // LED yansın
  delay(1000);              // 1000 ms bekle
  digitalWrite(13, LOW);    // LED sönsün
  delay(1000);
}
```

### How does it work?
1. `setup()` runs **once** when the board starts. This is where you set the direction of the pins.
2. `loop()` **starts again** the moment it finishes, for ever.
3. `HIGH` gives the pin 5 V, `LOW` gives 0 V. The LED lights up with this voltage through the resistor.
4. `delay(1000)` makes the processor wait for 1000 milliseconds (1 second).

### Try it
- Change the waiting time to 200 ms and press ▶ again. Is the LED still blinking, or does it look as if it is on all the time?
- Make the on time 100 ms and the off time 900 ms. Which one looks like a "pulse"?
- S.O.S: write a program that blinks three short, three long, three short.

### Common mistakes
- Forgetting to write `pinMode`: the pin does not become an output, and the LED glows very dimly or not at all.
- Forgetting the `;` at the end of each line: the compiler says "expected ';'".
- Connecting the LED the wrong way round: an LED has a direction, and it does not light up if the A and K legs are swapped.
- Not adding a resistor: in a real circuit, the LED and the pin can be damaged; the lab models this and gives a warning. The resistor limits the current.

## Discuss
While `delay(1000)` is running, can the board do anything else? Would it make a difference if someone pressed a button during this program?
