# Non-blocking code with millis()
duration: 25

## Wonder
Think of a kitchen timer: when you boil an egg, you do not stand over it; you set the timer and do other things. In Arduino, `millis()` is just like that clock: it tells you how many milliseconds have passed since the board started running. Every now and then we look at the clock and ask, "Is the time up?"

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| LED 1 + 330 Ω resistor | **D13** → resistor → LED **A**; **K** → GND |
| LED 2 + 330 Ω resistor | **D12** → resistor → LED **A**; **K** → GND |
| Button | **A** end to **D2**, **B** end to GND (`INPUT_PULLUP`) |

### Program
The idea: read the current time and look at how long it has been since the last change. If it has been long enough, change the LED and update the "last change" time. Do nothing else; let `loop()` go round again straight away.

```cpp
// sketch: millis_blink_buton
const unsigned long ARALIK = 500;   // ms
unsigned long sonDegisim = 0;
bool ledYanik = false;
bool oncekiBasili = false;
int sayac = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonDegisim >= ARALIK) {   // 500 ms geçti mi?
    sonDegisim = simdi;
    ledYanik = !ledYanik;
    digitalWrite(13, ledYanik);
  }

  bool basili = (digitalRead(2) == LOW);
  if (basili && !oncekiBasili) {        // yeni basış (kenar)
    sayac++;
    Serial.print("Basis sayisi: ");
    Serial.println(sayac);
  }
  oncekiBasili = basili;
}
```

This does the same job as the `delay` program from the previous lesson: the LED blinks and the button is checked. The difference: `loop()` runs thousands of times a second and checks the button without ever missing it. The short press you missed in the previous lesson is now counted.

With the same method you can run two separate jobs by giving each one its own clock:

```cpp
// sketch: millis_iki_led
unsigned long son1 = 0;
unsigned long son2 = 0;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - son1 >= 1000) {          // LED 1: her 1000 ms
    son1 = simdi;
    digitalWrite(13, !digitalRead(13));
  }
  if (simdi - son2 >= 300) {           // LED 2: her 300 ms
    son2 = simdi;
    digitalWrite(12, !digitalRead(12));
  }
}
```

### How does it work?
1. `millis()` starts from 0 when the program starts running and goes up by 1 every millisecond.
2. For each job you keep a "last time I did it" variable (`sonDegisim`, the last change).
3. The expression `simdi - sonDegisim >= aralik` means "has a whole interval passed?" (`simdi` is now, `aralik` is the interval).
4. Because `loop()` never waits, each round is very short. So every job can be checked in turn, all the time.

### Overflow warning
The value of `millis()` is of type `unsigned long` (from 0 to 4 294 967 295). It reaches this limit in about 49.7 days and **wraps back to 0**. This matters if a system will stay switched on for weeks. Always make time variables `unsigned long` and work out the time by **subtracting**:

```cpp
// sketch: millis_tasma
void setup() {
  Serial.begin(9600);

  unsigned long onceki = 4294967000UL;   // taşmaya 296 ms var

  unsigned long simdi = 4294967100UL;    // 100 ms geçti
  Serial.print("Dogru (cikarma): ");
  Serial.println(simdi - onceki);        // 100
  Serial.print("Yanlis (toplama): ");
  Serial.println(simdi >= onceki + 500 ? "sure doldu" : "dolmadi");

  simdi = 10;                            // sayaç sıfırlandı, toplam 306 ms geçti
  Serial.print("Tasmadan sonra fark: ");
  Serial.println(simdi - onceki);        // 306
}

void loop() {
}
```

The subtraction method gives the right result even at overflow. Writing `simdi >= onceki + 500` is wrong: `onceki + 500` overflows and wraps round to a small number, and the program says "time is up" before it really is. The rule: write **`simdi - onceki >= aralik`**.

### Try it
- In the `millis_blink_buton` program, click the button in short taps while the LED blinks. Is every press counted? Compare it with the program from the previous lesson.
- Add a third LED to the `millis_iki_led` program (D11, every 700 ms). Does it work without breaking anything else?
- Print `Serial.println(millis())` when you press the button. Work out the difference between two presses.

### Common mistakes
- Using `int` instead of `unsigned long`: an `int` overflows after about 32 seconds (32 767 ms).
- Checking the time by adding (`simdi >= onceki + aralik`): it goes wrong at overflow.
- Putting a `delay` back into `loop()`: all the benefit is lost.
- Giving every job the same "last time" variable: the jobs spoil each other's timing. Give each job its own variable.

## Discuss
What is the biggest difference between `delay` programs and `millis` programs? Why is the code a little longer when you use `millis`?
