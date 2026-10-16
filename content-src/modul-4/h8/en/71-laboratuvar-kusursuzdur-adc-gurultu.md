# The lab is perfect: ADC steps and noise
duration: 30

## Wonder
In the lab you set the potentiometer to the middle, your threshold program lit the LED at exactly the right moment, and it never flickered. Someone who puts the same code into a real circuit sees the LED keep flashing on and off while the light is steady. Same code, same circuit. Where is the difference? The answer: the lab deliberately draws a **clean** world. This week you will separate what that clean world hides from the real-world effects the lab really does show.

## Activity
### What does the lab model, and what does it not?
This week we set a rule: we will say "you saw it in the lab" only if the lab **really** produces an effect. If it does not, we will write that clearly and imitate the effect in code.

| Real-world effect | In the lab |
|---|---|
| ADC step (10 bits, 1024 levels) | **Modelled.** Every voltage is rounded to the nearest step. |
| Analogue noise (wires, power line, ADC jitter) | **Not modelled.** The lab's voltages are perfectly steady. |
| ADC offset, gain error, drift of the reference voltage | **Not modelled.** The reference is exactly 5.00 V. |
| Button bounce | **Not modelled** (lesson 72). |
| Timing (`delay`, `millis`, the `pulseIn` time) | **Modelled.** The code runs with real Uno instructions at 16 MHz. |
| PIR warm-up | **Modelled** (shortened; lesson 75). |
| Sensors' minimum supply voltage | **Modelled** (lesson 73). |
| The 5 V line collapsing, brown-out | **Not modelled** (lesson 73). |

All the "Not modelled" rows in this table are waiting for you in a real circuit. In this lesson we deal with the first one: **noise**, and together with it the **ADC step**.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Potentiometer | VCC → **5V**, SIG → **A0**, GND → **GND** |
| Resistor (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → the resistor's pin 2, K → **GND** |

### 1) The ADC step: this is modelled
`analogRead` divides the 0-5 V range into 1024 steps (lesson 11). One step is about 5 V / 1023 = 4.9 mV. Voltages in between are rounded to the nearest step. This sketch converts the raw value into millivolts:

```cpp
// sketch: adc_basamak
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);
  float mv = ham * 5000.0 / 1023.0;
  Serial.print("ADC=");
  Serial.print(ham);
  Serial.print(" mV=");
  Serial.println(mv, 1);
  delay(500);
}
```

When you set the potentiometer's position to 0.51, the voltage at A0 becomes 2.550 V. The ADC gives 522 and the program prints 2551.3 mV. The 1.3 mV difference is not a measurement error; it is **step rounding**: step 522 corresponds to 2551.3 mV, and 2550 mV is rounded to this step. If you want a measurement that tells 1 mV apart, a 10-bit ADC is not enough. Also, when you move the position by 0.01, the ADC jumps about 10 steps; the steps in between only show up if the voltage is adjusted more finely.

### 2) Noise: this is not modelled
In the lab, when you leave the potentiometer still, the ADC value does **not** move at all. In reality it does: wires work like aerials, the power line ripples, and the ADC itself jitters by a step or two. The ATmega328P datasheet gives the ADC's absolute accuracy as a few steps (about ±2); check your own datasheet for the exact number.

Because the lab produces no noise, we will **make** it: we will add a random number to the reading in code. This is an imitation; real noise has a different shape, but it is enough to see what your code must withstand. `random(-8, 9)` gives a whole number between -8 and +8 (9 not included). Because we fix the starting point with `randomSeed`, the same sequence comes out on every run.

The sketch below prints a single noisy reading and the average of 16 readings side by side (the smoothing idea from lesson 14):

```cpp
// sketch: gurultu_ortalama
const int SENSOR = A0;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);   // sahte gürültü: ±8 basamak
}

int ortalama(int adet) {
  long toplam = 0;
  for (int i = 0; i < adet; i++) {
    toplam += gurultuluOku();
  }
  return toplam / adet;
}

void setup() {
  Serial.begin(9600);
  randomSeed(42);
}

void loop() {
  Serial.print("Tek=");
  Serial.print(gurultuluOku());
  Serial.print(" Ort16=");
  Serial.println(ortalama(16));
  delay(300);
}
```

With the potentiometer steady at 0.50, `Tek` (single) wanders between about 503 and 519 on each row, while `Ort16` (average of 16) stays in a much narrower range. Averaging does not remove noise; it shrinks it: with 16 readings the noise drops about 4 times (the square-root rule). The cost is time: 16 readings mean 16 times the work.

### 3) Noise makes a threshold flicker
A program that decides with a single threshold changes its decision on every wave of noise while the value is near the threshold. Let's add the same fake noise and link the LED on D13 to a threshold:

```cpp
// sketch: esik_ham
const int SENSOR = A0;
const int LED = 13;
const int ESIK = 512;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);
}

void setup() {
  pinMode(LED, OUTPUT);
  randomSeed(42);
}

void loop() {
  digitalWrite(LED, gurultuluOku() > ESIK ? HIGH : LOW);
  delay(5);
}
```

Leave the potentiometer at about the 0.50 position: the LED tries to flash on and off dozens of times a second. The fix is two thresholds (**hysteresis**, lesson 35): to switch on, go a little above the threshold; to switch off, go a little below it. The gap between the two thresholds must be bigger than the size of the noise; here the noise is ±8 and the gap ±12.

```cpp
// sketch: esik_histerezis
const int SENSOR = A0;
const int LED = 13;
const int ACMA = 524;
const int KAPAMA = 500;
bool yanik = false;

int gurultuluOku() {
  return analogRead(SENSOR) + random(-8, 9);
}

void setup() {
  pinMode(LED, OUTPUT);
  randomSeed(42);
}

void loop() {
  int deger = gurultuluOku();
  if (!yanik && deger > ACMA) yanik = true;
  if (yanik && deger < KAPAMA) yanik = false;
  digitalWrite(LED, yanik ? HIGH : LOW);
  delay(5);
}
```

When you hold the potentiometer around 0.50, the LED no longer flickers; when you slowly take it to 0.6 it lights **once**, and when you bring it back down it goes off **once**.

### Extra real-world knowledge: reference drift
The `analogRead` value is the **ratio of the measured voltage to the supply voltage** (on the Uno the default reference is the supply line). If the supply is 4.70 V instead of 5.00 V, the same sensor voltage gives a bigger ADC value, and the calculation `ham * 5.0 / 1023.0` prints the wrong voltage. Because the lab's reference is always exactly 5.00 V, this drift does not show; the measurement needs to be checked in a real circuit.

### How does it work?
1. `adc_basamak` (ADC step) converts the raw value into millivolts; the small difference in the output comes from the ADC step.
2. `gurultu_ortalama` (noise average) adds the noise that the lab does not have with `random`, and shows that the average is steadier than a single reading.
3. `esik_ham` (raw threshold) decides with a single threshold and flickers because of the noise.
4. `esik_histerezis` (hysteresis threshold) separates the switch-on and switch-off thresholds; the LED only changes when the value really crosses to the other side.

### Try it
- In `gurultu_ortalama`, change the range `random(-8, 9)` to `random(-30, 31)`. How much does `Ort16` move? What happens if you make the number of readings 64, and what does it cost in time?
- In `esik_histerezis`, bring `ACMA` (switch on) and `KAPAMA` (switch off) very close together (510 and 514). Does the flicker come back? Why is a gap smaller than half the noise size not enough?
- Move the potentiometer's position in steps of 0.01 and look at the `adc_basamak` output. How many steps does the value jump each time? How many mV is one step?

### Common mistakes
- Saying "it did not flicker in the lab, so it will not flicker in reality either". The lab's noise is zero.
- Choosing a hysteresis gap narrower than the size of the noise.
- Making the number of readings very large when averaging to reduce noise, and slowing the program down.
- Converting the ADC value into a voltage assuming a 5.00 V reference, and thinking the result is exactly right.

## Discuss
In this lesson you saw that there is no noise at all in the lab, but that your code has to withstand noise. Which part of your work that runs without problems in the lab would you not count as "done" without being sure it will work in a real circuit?
