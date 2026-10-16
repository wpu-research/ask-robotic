# Button bounce and response delay
duration: 30

## Wonder
You wrote a counter program: every time you press the button, the number goes up by one. It works perfectly in the lab. With a real button, the same program sometimes counts 1, sometimes 3, sometimes 7 for a single press. And there is another problem: when you add other jobs to the program, short presses are sometimes not noticed at all. Both are different faces of the same kind of bug: "the code is right, but time and the input are dirty".

## Activity
### The lab button is clean
A real button is a mechanical part. As the contacts touch each other, they chatter for a short time; the pin can go back and forth between HIGH and LOW several times on a single press (debouncing in lesson 8). **The button part in the lab does not do this:** when it is pressed, the pin goes LOW in one move; when it is released, it goes HIGH in one move. So bounce is **not modelled** in the lab.

We will add bounce in code. The `hamOku()` (raw read) function below imitates a real contact: every time the button's state changes, for 5 ms it gives the reading right, then reversed, in turn. You do not have to understand this function; its only job is to "dirty" the lab's clean button. Real bounce has a different length and number of chatters on every press; the imitation here is always the same.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Button | A → **D2**, B → **GND** (`INPUT_PULLUP`) |
| Resistor (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → the resistor's pin 2, K → **GND** |

### 1) Count a bouncing button
The counter counts the falling edge (the change to LOW) but takes no account of bounce:

```cpp
// sketch: sayac_ham
const int BUTON = 2;
const int LED = 13;
int sayac = 0;
bool onceki = false;
bool ledDurum = false;

// Gerçek kontağın sıçramasını taklit eder: her değişimden sonraki 5 ms içinde tek ms'lerde ters okur.
bool hamOku() {
  static bool son = false;
  static bool var = false;
  static unsigned long degisim = 0;
  bool temiz = (digitalRead(BUTON) == LOW);
  if (temiz != son) {
    son = temiz;
    degisim = millis();
    var = true;
  }
  unsigned long gecen = millis() - degisim;
  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;
  return temiz;
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool basili = hamOku();
  if (basili && !onceki) {          // basılmaya yeni geçti
    sayac++;
    ledDurum = !ledDurum;
    digitalWrite(LED, ledDurum);
    Serial.print("Sayac: ");
    Serial.println(sayac);
  }
  onceki = basili;
}
```

Press the button **once** and release it. Because of the imitated bounce, you see 3 extra fake "presses" while pressing and 2 while releasing: the Serial monitor prints `Sayac: 5` (counter) and the LED changes state five times; the fact that it ends up "on" is just chance. The code had no bug; the input was dirty.

The fix: after the pin changes, wait for it to **stay calm** for a certain time. If the value has stayed the same for 20 ms, accept it:

```cpp
// sketch: sayac_temiz
const int BUTON = 2;
const int LED = 13;
const unsigned long SAKIN_SURE = 20;   // ms
int sayac = 0;
bool ledDurum = false;
bool sonHam = false;
bool kararli = false;
unsigned long sonDegisim = 0;

// Gerçek kontağın sıçramasını taklit eder (sayac_ham ile aynı).
bool hamOku() {
  static bool son = false;
  static bool var = false;
  static unsigned long degisim = 0;
  bool temiz = (digitalRead(BUTON) == LOW);
  if (temiz != son) {
    son = temiz;
    degisim = millis();
    var = true;
  }
  unsigned long gecen = millis() - degisim;
  if (var && gecen < 5 && gecen % 2 == 1) return !temiz;
  return temiz;
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool ham = hamOku();
  if (ham != sonHam) {              // pin oynadı: sayacı sıfırla
    sonHam = ham;
    sonDegisim = millis();
  }
  if (millis() - sonDegisim >= SAKIN_SURE && ham != kararli) {
    kararli = ham;                  // yeterince sakin kaldı: kabul et
    if (kararli) {
      sayac++;
      ledDurum = !ledDurum;
      digitalWrite(LED, ledDurum);
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
}
```

Because the imitated bounce lasts 5 ms, the 20 ms calm wait swallows it completely: one press, one count. On real buttons the right time depends on the part; if you choose it too short, bounce leaks through; if you choose it too long, you miss fast presses.

### 2) Response delay: the pin is not read during `delay`
Timing effects are **real** in the lab, because the code runs at its real speed. During `delay(500)`, the program does not look at the pin. The program below waits half a second for "another job" and looks at the button only once in that interval:

```cpp
// sketch: tepki_delay
const int BUTON = 2;
const int LED = 13;

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {
    Serial.println("BASILDI");
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(500);                       // "başka iş" yerine geçen bekleme
}
```

Hold the button down for less than half a second: most of the time `BASILDI` (pressed) is never printed. If you press for longer, the response is up to 500 ms late. The fix is the `millis()` method from lesson 27: the "other job" keeps its own time, and the button is checked on every pass.

```cpp
// sketch: tepki_millis
const int BUTON = 2;
const int LED = 13;
const unsigned long ARALIK = 500;   // "başka iş" 500 ms'de bir
unsigned long sonIs = 0;

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {
    Serial.println("BASILDI");
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  if (millis() - sonIs >= ARALIK) {
    sonIs = millis();
    Serial.println("tik");          // "başka iş"
  }
}
```

In this version the LED responds to the button straight away. But watch out: because `BASILDI` is printed on every pass, the Serial monitor fills up if you hold the button down. You can fix this yourself with edge detection (lesson 8).

### Delays and warm-up: sensors do not answer instantly
Real sensors have their own timings. The lab **models** some of them and not others:

| Time | In the lab |
|---|---|
| HC-SR04 measurement (in proportion to the distance, about 6 ms for 100 cm) | Modelled (the `pulseIn` time can be measured) |
| DHT reading interval (at least 2 s) | Modelled (the library waits) |
| I2C LCD start-up (about 1 s) | Modelled |
| PIR warm-up | Modelled, but shortened: 2 s in the lab, typically between half a minute and a minute in reality (it depends on the module) |
| Warm-up of the MQ-2 gas sensor | **Not modelled** (the waiting time in lesson 53 is only for a real circuit) |
| Sensor lifetime, drift with temperature | **Not modelled** |

The "modelled" rows in the table mean that if you forget a waiting time in your code, the lab will catch you too. In the "not modelled" rows, however, the lab's silence is no guarantee.

### How does it work?
1. `sayac_ham` (raw counter) counts every time it sees a falling edge. Because bounce multiplies the edges, a single press and release produce 5 counts.
2. `sayac_temiz` (clean counter) measures how long the pin stays steady; the 5 ms bounce sequence disappears within the 20 ms wait.
3. `tepki_delay` looks at the pin every half second; a short press in between is not seen.
4. `tepki_millis` looks at the pin on every pass; the slow job keeps its own clock.

### Try it
- Set `SAKIN_SURE` (calm time) in `sayac_temiz` to 0. Which sketch does it turn into like this?
- Set `SAKIN_SURE` to 3: does the 5 ms imitated bounce leak through? Why?
- In the `tepki_delay` program, change `delay(500)` to 50. Are short presses caught now? What if you make it 5?
- Change `gecen < 5` inside `hamOku()` to 15. How does making the imitated bounce longer affect the 20 ms wait?

### Common mistakes
- Saying "there was no bounce in the lab, so debouncing is unnecessary". The lab's button is clean; the real one is not.
- Trying to get rid of bounce with `delay(50)`: it works, but it makes the program wait, and the problem from `tepki_delay` appears.
- Forgetting the bounce that happens on release: waiting when pressing but not when releasing brings fake counts.
- Guessing the `SAKIN_SURE` value without measuring.

## Discuss
Debouncing means accepting that the input is dirty and saying "stay calm for a bit". What does this cost? On a game button that is pressed very fast, would a 20 ms wait cause a problem, and if so, how would you solve it?
