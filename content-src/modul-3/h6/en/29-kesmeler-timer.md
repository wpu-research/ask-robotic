# Interrupts and timers
duration: 30

## Wonder
What do you do when the phone rings? Whatever you are doing, you stop and answer it, you talk, and then you carry on from where you left off. An Arduino can do this too: when an event happens on a pin, it **immediately** pauses the code that is running, runs a small "interrupt" function, and then goes back to the main program. Even inside a `delay`!

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button | **A** end to **D2**, **B** end to GND (`INPUT_PULLUP`) |
| LED + 330 Ω resistor | **D13** → resistor → LED **A**; **K** → GND |

On the Arduino Uno, only two pins can take external interrupts: **D2 (INT0)** and **D3 (INT1)**. That is why our buttons are on these pins.

### Program 1: An interrupt that counts presses even during a delay
```cpp
// sketch: kesme_sayac
volatile unsigned int basisSayisi = 0;
volatile unsigned long sonKesme = 0;

void basildi() {                              // ISR: kesme servis rutini
  unsigned long simdi = millis();
  if (simdi - sonKesme > 50) {                // 50 ms'den sık gelen sıçramaları yok say
    basisSayisi++;
    sonKesme = simdi;
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);
}

void loop() {
  delay(1000);                                // ana program "uyuyor"

  noInterrupts();                             // okurken kesme araya girmesin
  unsigned int kopya = basisSayisi;
  interrupts();

  Serial.print("Basis: ");
  Serial.println(kopya);
}
```
In this program, `loop()` is almost always inside `delay(1000)`; but when the button is pressed, `basildi()` (pressed) still runs and the counter goes up. The missed-press problem from lesson 26 is gone.

### Program 2: A short ISR, let loop do the work
The best method is to only raise a flag inside the ISR and leave the real work to `loop()`:

```cpp
// sketch: kesme_bayrak
volatile bool basisVar = false;

void basildi() {
  basisVar = true;                            // yalnızca bayrağı kaldır
}

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING);
}

void loop() {
  if (basisVar) {
    basisVar = false;
    Serial.println("Kesme geldi");            // yazdırma işi burada, ISR'de değil
  }
}
```

### Program 3: Exactly 1 Hz with a timer interrupt
Timer1 inside the board can produce interrupts at regular intervals without using `delay` or `millis`. The code below is advanced; for now it is enough to understand the idea.

```cpp
// sketch: timer1_led
ISR(TIMER1_COMPA_vect) {                      // Timer1 eşleşme kesmesi
  digitalWrite(13, !digitalRead(13));
}

void setup() {
  pinMode(13, OUTPUT);
  noInterrupts();
  TCCR1A = 0;
  TCCR1B = 0;
  TCNT1 = 0;
  OCR1A = 31249;                              // 16 MHz / 256 = 62 500 tik/sn; 31 250 tik = 0,5 sn
  TCCR1B |= (1 << WGM12);                     // CTC modu: eşleşince sayaç sıfırlanır
  TCCR1B |= (1 << CS12);                      // bölücü 256
  TIMSK1 |= (1 << OCIE1A);                    // eşleşme kesmesini aç
  interrupts();
}

void loop() {
  // ana program burada başka işler yapabilir
}
```
The LED changes every 0.5 seconds, so it blinks at 1 Hz. Timer1 is a unit that `analogWrite` on pins 9 and 10 and the `Servo` library also use; if you use it together with them, they clash.

### How does it work?
1. `attachInterrupt(digitalPinToInterrupt(2), basildi, FALLING)` means: run the `basildi` function when an event happens on pin D2. The modes are: `FALLING` (HIGH→LOW, a button press), `RISING` (LOW→HIGH), `CHANGE` (both) and `LOW`.
2. `digitalPinToInterrupt(2)` turns the pin number into the interrupt number; do not write the number yourself.
3. Variables shared between the ISR and the main program must be `volatile`. This tells the compiler: "this value can change outside the normal flow of the program, check memory every time". If you leave it out, the compiler may keep the value aside and use an out-of-date copy.
4. An `unsigned int` is 2 bytes, and because the processor is 8-bit, it is read in two steps. If an interrupt arrives during the read, you get a half-finished value. That is why you take a copy between `noInterrupts()` and `interrupts()`.

### ISR rules
- **Keep it short.** A few lines; increase a counter, raise a flag.
- **Do not use `delay()`.** `delay` does not work inside an ISR, and the program may get stuck.
- **Do not use `Serial.print`.** It is slow, and the program may get stuck if the output buffer fills up. Do the printing in `loop()`.
- **`millis()` does not move on inside an ISR.** You can read it, but its value stays the same for the whole ISR.
- Make the shared variable `volatile`; if it is more than one byte, turn interrupts off while reading it.
- Button bounce can trigger the interrupt several times; add a 50 ms guard like the one in program 1.

### Try it
- In the `kesme_sayac` program, change `FALLING` to `CHANGE`. How much does one press add to the counter? Why?
- Why is it not a good idea to put `Serial.println` inside the ISR in the `kesme_bayrak` program? Explain in your own words.
- In the timer program, change the `OCR1A` value to 15624. How does the LED's speed change? Work it out and check.

### Common mistakes
- Not writing `volatile`: the counter may seem not to go up in the main program.
- Putting `delay` or `Serial.print` inside the ISR.
- Using a pin other than D2 or D3 for the interrupt (on the Uno, `attachInterrupt` only works on these two pins).
- Trying to give the ISR a parameter: an ISR takes no parameters and returns no value.

## Discuss
Is using an interrupt always better than `millis`? In which situation is an interrupt the right choice (when a fast event must not be missed), and in which is `millis` enough?
