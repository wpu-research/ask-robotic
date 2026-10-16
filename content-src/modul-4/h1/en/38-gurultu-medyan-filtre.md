# Noise, reflection angle and the median filter
duration: 25

## Wonder
The parking sensor shows 100 cm to the wall behind you. A moment later, 350 flashes up on the screen, then 100 again. The wall did not suddenly move 2.5 metres away. The sensor measured wrongly once. If every reading from the sensor matters enough to make the car brake or let it go, how do we ignore this single wrong reading?

## Activity
### Where does a wrong measurement come from?
Sound bounces back like a ball. That is why the measurement depends on the object's **surface and angle**:
- **A flat object facing the sensor straight on** sends the sound straight back to the sensor: the best measurement.
- **A slanted surface** reflects the sound off to the side. Either the echo never returns (`pulseIn` gives 0), or the sound hits another surface in the room and comes back the long way round, so the distance looks larger than it is. This angle limit changes with the sensor and the object; the datasheet gives a typical value for the measuring angle.
- **Soft and fluffy surfaces** (fabric, sponge, a jumper) absorb much of the sound; the echo gets weaker.
- **Very thin or very small objects** (a cable, a chair leg) send back only a small part of the sound.
- **Electrical noise:** if a motor or servo is powered from the same supply, voltage drops can upset the sensor's timing.
- **Other sensors:** if two ultrasonic sensors measure at the same time, one can hear the other's sound.

The result: the sensor measures correctly most of the time, but now and then it gives an **outlier**: a single reading very different from its neighbours. The first way that comes to mind to clean this up is to take an average. Let's see if it works.

### Average or median?
**Average (mean):** add up all the values and divide by how many there are. **Median:** sort the values from smallest to largest and take the one in the middle.

Five readings: 100, 100, 100, 350, 100.
- Average: (100 + 100 + 100 + 350 + 100) / 5 = **150**. A single wrong reading spoilt the result by 50 cm.
- Median: sort → 100, 100, 100, 100, 350 → the middle (3rd) value = **100**. The outlier went to the end of the sorted list and was never chosen.

This program applies the two functions to the same arrays. When we pass an array to a function, we pass the array itself and the number of elements separately (`float a[], int n`).

```cpp
// sketch: ortalama_medyan_dizi
float ortalama(float a[], int n) {
  float toplam = 0;
  for (int i = 0; i < n; i++) toplam += a[i];
  return toplam / n;
}

float medyan(float a[], int n) {
  float b[9];                          // kopya (en çok 9 eleman)
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {        // ekleme sıralaması
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];                     // ortadaki
}

void raporla(const char* ad, float a[], int n) {
  Serial.print(ad);
  Serial.print(" ortalama=");
  Serial.print(ortalama(a, n), 1);
  Serial.print(" medyan=");
  Serial.println(medyan(a, n), 1);
}

void setup() {
  Serial.begin(9600);
  float temiz[5] = {100, 101, 99, 100, 100};
  float bir[5]   = {100, 100, 100, 350, 100};
  float iki[5]   = {100, 350, 100, 350, 100};
  float uc[5]    = {100, 350, 350, 350, 100};
  raporla("temiz", temiz, 5);
  raporla("bir aykiri", bir, 5);
  raporla("iki aykiri", iki, 5);
  raporla("uc aykiri", uc, 5);
}

void loop() {
}
```

Read the output: with one outlier, the average is 150 and the median is 100. With two outliers, the average is 200 and the median is still 100. With three outliers, though, the median is fooled too (350), because three of the five values are wrong and the middle one comes out wrong. The rule: **in a window of N elements, the median throws away at most (N−1)/2 outliers.** A window of five forgives two wrong values.

### A sliding median with a live sensor
In a real system the readings do not arrive all at once; they keep flowing. We keep the last 5 readings in a **sliding window**: when a new reading comes in, the oldest one leaves. Each time, we work out the window's average and median.

Circuit (the same all week). Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| HC-SR04 VCC | Uno **5V** |
| HC-SR04 GND | Uno **GND** |
| HC-SR04 TRIG | Uno **D9** |
| HC-SR04 ECHO | Uno **D10** |

The sensor in the lab measures perfectly: it reads whatever you type into the Distance property. You make the outlier yourself: while the program is running, you set Distance to 350 cm for a short moment and then put it back. Because the program measures every 55 ms, it is hard to make such a short jump; to try it, change `delay(50)` to `delay(400)` for now. If you keep the jump shorter than half a second, only 1-2 wrong measurements get into the window.

```cpp
// sketch: medyan_kayan
const int TRIG = 9;
const int ECHO = 10;
const int N = 5;                      // pencere boyu (tek sayı)
const float MENZIL = 400.0;           // yankı yoksa "uzak" say

float pencere[N];
int sira = 0;

float tekOlcum() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  unsigned long sure = pulseIn(ECHO, HIGH, 30000);
  if (sure == 0) return MENZIL;       // yankı yok: yansıma kaçtı ya da çok uzak
  float cm = sure * 0.0343 / 2.0;
  return cm > MENZIL ? MENZIL : cm;
}

float ortalama(float a[], int n) {
  float toplam = 0;
  for (int i = 0; i < n; i++) toplam += a[i];
  return toplam / n;
}

float medyan(float a[], int n) {
  float b[N];
  for (int i = 0; i < n; i++) b[i] = a[i];
  for (int i = 1; i < n; i++) {
    float x = b[i];
    int j = i - 1;
    while (j >= 0 && b[j] > x) {
      b[j + 1] = b[j];
      j--;
    }
    b[j + 1] = x;
  }
  return b[n / 2];
}

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
  float ilk = tekOlcum();
  for (int i = 0; i < N; i++) pencere[i] = ilk;   // pencereyi ilk okumayla doldur
}

void loop() {
  float ham = tekOlcum();
  pencere[sira] = ham;                // en eski değerin yerine yaz
  sira = (sira + 1) % N;              // 0,1,2,3,4,0,1,... döner

  Serial.print("ham=");
  Serial.print(ham, 1);
  Serial.print(" ort=");
  Serial.print(ortalama(pencere, N), 1);
  Serial.print(" med=");
  Serial.println(medyan(pencere, N), 1);
  delay(50);
}
```

### How does it work?
1. `pencere[N]` (window) holds the last N readings. `sira` (position) is the next place to write; `(sira + 1) % N` sends it back to 0 after 4.
2. `setup` fills the window with the first reading; otherwise the window would be full of zeros in the first seconds and the median would come out close to 0.
3. `tekOlcum` returns 400 if there is no echo. This is on purpose: when sound escapes off a slanted surface, it looks like "very far away". The median throws this value away as an outlier too.
4. `medyan` first copies the window, sorts the copy and returns the middle value. The real window keeps its order; if we did not copy it, we would lose the information about which value is the oldest.

### The cost: delay
The median filter is not free. If the distance really drops from 100 cm to 50 cm, the filter output does not give 50 straight away: the median stays at 100 until three 50s have built up in the window. In a five-element window that is 3 measurements, which here means a delay of about 3 × 55 ms ≈ 165 ms. If you make the window bigger, you are more resistant to noise but the delay grows. If you make the window smaller, you are faster but you throw away fewer wrong values.

The NewPing library offers the same idea: `sonar.ping_median(5)` takes five measurements and returns the middle time in microseconds. We wrote our own filter so that we know the logic.

### Try it
- In the `medyan_kayan` program, try `N = 3` and `N = 7`. How do the power to throw out outliers and the delay change? Write down a guess first, then work it out.
- Put values you make up into the `ortalama_medyan_dizi` arrays. In which array do the average and the median differ the most?
- In `medyan_kayan`, write `delay(400)` instead of `delay(50)`. While it is running, set Distance to 350 cm for half a second and put it back, then lower it permanently from 100 cm to 50 cm. How do the `ort` and `med` columns in the serial monitor behave in the two cases?
- Think of a case where the average is useful too: if the readings wobble only a little, like 100 ± 1 cm, which one comes out smoother? Try it out with the arrays.

### Common mistakes
- Not filling the window with the first reading: the zeros at the start spoil the median.
- Choosing an even window size: the middle value is unclear. Use an odd number (3, 5, 7).
- Not copying the array before sorting it: the window's order gets mixed up and you cannot tell which element is the oldest.
- Treating 0 as a distance when `pulseIn` returns 0: a "0 cm" reading can land right in the middle of the median and spoil the result.
- Thinking the median solves every problem: if the wrong readings are more than half the window, the median is fooled too. Remove the real cause (angle, surface, power noise).

## Discuss
If you raise the window size of the parking sensor from 5 to 15, the screen becomes very steady, but what happens when the car is coming closer fast? How do you decide the right balance between noise and delay?
