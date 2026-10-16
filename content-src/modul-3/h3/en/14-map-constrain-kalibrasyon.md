# map, constrain, calibration and smoothing
duration: 25

## Wonder
The numbers a sensor gives are never "clean": your LDR may wobble between 120 and 880 in one room, and between 60 and 950 in another. On top of that, the number jitters all the time. How can your program behave steadily in this mess?

## Activity
### map and constrain
`map(x, girişMin, girişMax, çıkışMin, çıkışMax)` moves a number from one range to another range in proportion. For example, it turns a value between 0-1023 into a percentage from 0-100 (the Turkish names mean inMin, inMax, outMin, outMax):

```cpp
int yuzde = map(ham, 0, 1023, 0, 100);
```

You need to know two things:
1. `map` does **integer** maths. Everything after the decimal point in the result is thrown away.
2. `map` does not limit the result. If the input goes outside the range you gave, the result goes outside too: it can be negative or above 100.

To limit it you use `constrain(x, alt, üst)` (low, high): if `x` is below `alt`, you get `alt`; if it is above `üst`, you get `üst`; if it is in between, you get `x`.

```cpp
int yuzde = map(ham, 200, 800, 0, 100);   // 200'ün altı negatif olur
yuzde = constrain(yuzde, 0, 100);         // 0-100 arasında tut
```

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Potentiometer (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |
| LDR + 10 kΩ resistor | 5V → LDR → **A1** → 10 kΩ → GND (as in lesson 12) |
| LED (red) + 330 Ω | **D13** → 330 Ω → LED **A** (anode); LED **K** (cathode) → GND |

### Program 1: map and constrain
Let's turn the potentiometer's 200-800 range into a percentage; at the ends the result can overflow the range.

```cpp
// sketch: map_constrain
void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(A0);
  int p = map(ham, 200, 800, 0, 100);   // sınırsız
  int k = constrain(p, 0, 100);         // sınırlı
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" p=");
  Serial.print(p);
  Serial.print(" k=");
  Serial.println(k);
  delay(300);
}
```

When you pull the slider fully to the left, `p` will be negative, and when you pull it to the right, it will go above 100; `k`, however, will stay at 0 and 100.

### Calibration
The sensor's real smallest and largest values are different in every room. **Calibration** means measuring this range when the program starts. The sketch below watches the LDR for the first 3 seconds (while D13 is on). During this time, pull the LDR's **Light** slider first all the way to the left (dark), then all the way to the right (light). Then it uses the smallest and largest values it measured as the range and reports the light as a percentage from 0 to 100.

```cpp
// sketch: kalibrasyon
int enAz = 1023;
int enCok = 0;

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);              // kalibrasyon sürüyor
  for (int i = 0; i < 300; i++) {      // 300 x 10 ms = 3 saniye
    int ham = analogRead(A1);
    if (ham < enAz) {
      enAz = ham;
    }
    if (ham > enCok) {
      enCok = ham;
    }
    delay(10);
  }
  if (enCok - enAz < 50) {             // aralık çok dar: bölme hatası olmasın
    enCok = enAz + 50;
  }
  digitalWrite(13, LOW);
}

void loop() {
  int ham = analogRead(A1);
  int yuzde = map(ham, enAz, enCok, 0, 100);
  yuzde = constrain(yuzde, 0, 100);
  Serial.print("ham=");
  Serial.print(ham);
  Serial.print(" yuzde=");
  Serial.println(yuzde);
  delay(300);
}
```

### Smoothing
Even in the same light, `analogRead` gives a slightly different number each time (noise). A simple solution: take a few measurements and use their **average**. Below we take the average of 16 measurements. In the average the noise is largely smoothed out. In return, one reading takes a little longer (16 × 3 ms ≈ 50 ms).

```cpp
// sketch: yumusatma
void setup() {
  Serial.begin(9600);
}

void loop() {
  int toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam = toplam + analogRead(A0);
    delay(3);
  }
  int ort = toplam / 16;
  Serial.print("ham=");
  Serial.print(analogRead(A0));    // karşılaştırmak için tek ölçüm
  Serial.print(" ort=");
  Serial.println(ort);
  delay(100);
}
```

Another method is **exponential smoothing**. Each round it keeps 90% of the old value and takes 10% from the new measurement; it is one line and needs no array:

```cpp
duzgun = duzgun * 0.9 + ham * 0.1;   // duzgun bir float değişkendir
```

### How does it work?
1. `map(ham, 200, 800, 0, 100)`: 200 → 0, 800 → 100, 500 → 50. For out-of-range values you need `constrain`.
2. In calibration, `enAz` (smallest) starts with a large number (1023) and `enCok` (largest) with a small number (0); this way even the first measurement updates both.
3. The sum of 16 measurements is at most 16 × 1023 = 16368; it fits in an `int`.
4. As you take averages, `ort` wobbles less than `ham`.

### Try it
- In the `map_constrain` sketch, delete the `constrain` line and see what happens at the ends.
- While `kalibrasyon` is running, do not move the light slider at all. What happens? What is the 50 safety line at the bottom for?
- In `yumusatma`, change 16 to 4. How jumpy does `ort` become? If you make it 64, what happens to the reading time?

### Common mistakes
- Using `map` while expecting a decimal result: `map(5, 0, 10, 0, 3)` gives 1, not 1.5.
- Passing the `map` result to `analogWrite` without clipping it: a negative value or one greater than 255 gives unexpected brightness.
- Starting `enAz` at 0 and `enCok` at 1023: the measurements never reach these ends, so the range never narrows.
- Forgetting to move the light slider to the ends during calibration: the range stays narrow.
- Forgetting to reset `toplam` (the sum): the average keeps growing.

## Discuss
Is it better to calibrate once when the program starts, or to keep it up to date all the time? When the light changes during the day, what are the advantage and the risk of each?
