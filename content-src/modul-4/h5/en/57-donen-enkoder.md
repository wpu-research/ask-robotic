# Rotary encoder (quadrature) and interrupts
duration: 25

## Wonder
The volume knob on an old radio turns forever; it has no end. A potentiometer, on the other hand, has a start and an end. So how does the radio know which way the knob turned and by how many steps? The answer is hidden in two signals that are shifted "90 degrees" from each other.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Rotary encoder CLK (A) | **D2** (`INPUT_PULLUP`, interrupt pin) |
| Rotary encoder DT (B) | **D3** (`INPUT_PULLUP`) |
| Rotary encoder SW (button) | **D4** (`INPUT_PULLUP`) |
| Rotary encoder VCC | 5V (optional) |
| Rotary encoder GND | GND |

Modules such as the KY-040 already have pull-up resistors; if you connect VCC, these resistors pull the lines up to 5 V. Even if you do not connect VCC, `INPUT_PULLUP` is enough, but GND must be connected in every case. When you select the encoder, the **Position (ticks)** and **Button pressed** properties appear in the right panel. Changing Position means turning the encoder by that many ticks (clockwise is positive). In this lesson we use pin D2 for CLK (the joystick button in lesson 56 was also on D2; the lab starts with a clean circuit for every activity).

### What is quadrature?
There are two contacts inside the encoder. As the knob turns, these contacts close and open one by one, but **not at the same time**: one changes slightly before the other. That is why there is a quarter-period (90°) difference between the outputs of CLK and DT.

During one "tick" the two pins change in this order (1 = HIGH, 0 = LOW, written as CLK, DT):

| Direction | Order of states |
|---|---|
| One direction (here we will call it "clockwise") | 11 → 01 → 00 → 10 → 11 |
| Opposite direction | 11 → 10 → 00 → 01 → 11 |

Look at these two orders. At the moment CLK **falls** (from 1 to 0): clockwise, DT is still 1 at that moment (11 → 01); in the opposite direction, DT has already become 0 (10 → 00). So a single rule is enough to find the direction:

> When CLK falls, look at DT. If DT = 1 we are going one way; if DT = 0 we are going the other way.

On modules, which direction counts as "clockwise" may come out reversed depending on the maker. If it does, swap `sayac++` and `sayac--`.

### Program 1: The simplest version
On every fall of CLK we run an interrupt (lesson 29) and read DT.

```cpp
// sketch: enkoder_basit
const int CLK = 2;
const int DT = 3;

volatile int sayac = 0;

void adim() {                          // kesme servis rutini (ISR)
  if (digitalRead(DT) == HIGH) {
    sayac++;
  } else {
    sayac--;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK, INPUT_PULLUP);
  pinMode(DT, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);
}

void loop() {
  static int onceki = 0;

  noInterrupts();                      // 29. ders: okurken kesme araya girmesin
  int kopya = sayac;
  interrupts();

  if (kopya != onceki) {
    onceki = kopya;
    Serial.print("Sayac: ");
    Serial.println(kopya);
  }
}
```
Press ▶ and set the encoder's **Position (ticks)** property to 5: the counter becomes 5. Then set it to 2: the counter goes down to 2. If you set a negative value (for example -3), the counter goes negative. On a real encoder you may see one step skip several counts at once; the lab's encoder, however, works ideally and does not bounce. The reason for this problem on the real part is in the next section.

### Bounce: the contacts chatter
The contacts are mechanical. When they close, they do not touch all at once; for a very short time (from less than a millisecond to a few milliseconds, depending on the module) they open and close. You saw a button bounce in lesson 8; the same thing happens here. An interrupt, however, is very fast: it counts every bounce as a separate edge. If CLK chatters `1 → 0 → 1 → 0 → 1 → 0` for a single tick, `adim()` runs three times and the counter goes up by 3.

The fix: if at least a certain time has not passed between two edges, ignore the edge. The time is on the scale of **microseconds**, not milliseconds, so we use `micros()`. Because the lab's encoder does not bounce, you cannot see the filter's real job there; but in the "Try it" section you can see what breaks when the filter's threshold is "too large".

### Program 2: A bounce-filtered counter and reset with the button
```cpp
// sketch: enkoder_filtreli
const int CLK = 2;
const int DT = 3;
const int SW = 4;
const unsigned long ARALIK_US = 2000;   // iki kenar arası en az 2 ms

volatile int sayac = 0;
volatile unsigned long sonKenar = 0;

void adim() {
  unsigned long simdi = micros();
  if (simdi - sonKenar < ARALIK_US) return;   // sıçrama: yok say
  sonKenar = simdi;
  if (digitalRead(DT) == HIGH) {
    sayac++;
  } else {
    sayac--;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(CLK, INPUT_PULLUP);
  pinMode(DT, INPUT_PULLUP);
  pinMode(SW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(CLK), adim, FALLING);
}

void loop() {
  static int onceki = 0;
  static bool oncekiBasili = false;

  // Düğme: basıldığı an sayacı sıfırla
  bool basili = (digitalRead(SW) == LOW);
  if (basili && !oncekiBasili) {
    noInterrupts();
    sayac = 0;
    interrupts();
  }
  oncekiBasili = basili;

  noInterrupts();
  int kopya = sayac;
  interrupts();

  if (kopya != onceki) {
    onceki = kopya;
    Serial.print("Sayac: ");
    Serial.println(kopya);
  }
}
```

### How does it work?
1. `attachInterrupt(..., FALLING)` runs the `adim()` (step) function every time CLK falls from 1 to 0. D2 is an interrupt pin (lesson 29), which is why we connected CLK to D2.
2. Inside `adim()`, DT is read: if it is HIGH, `sayac++`; if it is LOW, `sayac--`. That is how simply the direction is found.
3. `sayac` (counter) and `sonKenar` (last edge) are declared `volatile` because they are shared between the interrupt and `loop()`. While `loop()` reads these values, it switches the interrupt off for a short moment.
4. In Program 2, the time of the last accepted edge is stored with `micros()`. New edges that arrive in less than 2 ms count as bounce and are skipped. The threshold must be smaller than the time between ticks even when you turn the knob as fast as you can (the lab's encoder does at most 250 ticks per second, so at least 4 ms between ticks); 2 ms is a sensible starting point. On a real module you tune the threshold by trying.
5. The SW button is a slow event and does not need an interrupt. Checking it inside `loop()` with edge detection (lesson 8) is enough.

### Try it
- Set `ARALIK_US` to 0 (switch the filter off). Increase Position by 1. In the lab the counter goes up by 1, because the virtual contact does not bounce; on a real encoder the same tick can skip 2-3 counts.
- Set `ARALIK_US` to 50 000 (50 ms) and increase Position by 10 in one go (fast turning). What does the counter rise to? Why is making the threshold too large bad?
- Keep the counter between 0 and 20 (`constrain`) and change an LED's brightness with `analogWrite` according to the value. Connect the LED (with a 330 Ω resistor) to D11: D13 is not a PWM pin, D11 can do PWM. That way you turn an endless knob into a volume knob.

### Common mistakes
- Connecting CLK to a pin that is not an interrupt pin (anything other than D2 or D3): `attachInterrupt` does not work.
- Not making the `sayac` variable `volatile`: the compiler keeps a copy of the value and `loop()` does not see the change.
- Using `Serial.print` or `delay` inside the ISR: an ISR must be very short. Printing is done by `loop()`.
- Not adding a bounce filter: even when you turn slowly, the counter skips more than expected.
- Choosing a threshold bigger than needed: when you turn fast, real steps are thrown away too.
- Mixing up CLK and DT: the direction comes out reversed. You swap `++` and `--` in the code or swap the wire ends; both give the same result.

## Discuss
A mouse wheel, a printer head, a robot wheel... They all have an encoder. Why is a single contact (CLK only) not enough to find the direction? What is the advantage of reading the encoder of a very fast motor with an interrupt instead of inside `loop()`?
