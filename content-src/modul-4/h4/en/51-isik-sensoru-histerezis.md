# Light sensor sensitivity and hysteresis
duration: 25

## Wonder
At dusk, street lamps sometimes switch on, go off and come on again before they finally stay on. As the light slowly fades, the sensor sits right on the threshold and says "dark" one moment and "bright" the next. The same thing happens with your night light: when the value wobbles near the threshold, the LED flickers. In this lesson you will first see the flicker, then get rid of it with two thresholds (hysteresis).

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| LDR (photoresistor) | Lead **1** → Uno **5V**, lead **2** → Uno **A1** |
| Resistor (set it to **10000 Ω** in the properties panel) | Lead **1** → **A1**, lead **2** → **GND** |
| Resistor (330 Ω) + LED | **D13** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |

This is the same LDR divider as in lesson 12: the LDR has a low resistance in bright light, so the voltage on A1 rises in bright light. So the `analogRead` value **grows in bright light and shrinks in the dark**. If you connect the LDR on the GND side, the direction flips; then you have to flip the direction of your comparisons too.

In the lab you set the LDR's light by selecting the LDR and using the **Light** value in the right panel (0 = dark, 1 = very bright). You can also change it while the circuit runs. In this circuit the approximate values are:

| Light | 0.1 | 0.2 | 0.5 | 0.9 |
|---|---|---|---|---|
| `analogRead(A1)` | 23 | 53 | 424 | 977 |

The thresholds we use in this lesson match these Light values: 423 is about 0.50; 473 is about 0.52; 523 is about 0.55. So the threshold sits in a very narrow part of the slider.

### Program 1: one threshold
In this lesson the LED will light up in the dark. The simplest version compares with a single threshold. Every second, the sketch also counts and prints how many times it has crossed the threshold.

```cpp
// sketch: ldr_tek_esik
const int LDR = A1;
const int LED = 13;
const int ESIK = 473;

bool onceki = false;
int gecis = 0;
unsigned long sonYazma = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LDR);
  bool karanlik = (deger < ESIK);   // karanlıkta değer küçüktür
  digitalWrite(LED, karanlik);

  if (karanlik != onceki) {
    gecis++;
    onceki = karanlik;
  }

  if (millis() - sonYazma >= 1000) {
    sonYazma = millis();
    Serial.print("gecis=");
    Serial.println(gecis);
  }
}
```

If the room light is right next to the threshold (a value of about 473) and the reading wobbles a little, the LED switches on and off dozens of times a second. The wobble comes from the light itself, a shadow, a wire or small drifts in the ADC. In a real circuit this wobble happens on its own.

The LDR in the lab does not wobble on its own; you make the flicker yourself. While the program runs, move the **Light** value back and forth between 0.51 and 0.53 a few times: the value, swinging between 445 and 488, crosses the threshold (473) on every swing, the LED changes each time and the `gecis` (crossings) count rises quickly.

### Program 2: two thresholds (hysteresis)
The fix is to use **two separate thresholds** for switching on and switching off. The LED lights up in the dark and only goes off when the room gets **clearly** brighter. The region between the two thresholds is called the **dead band** or **hysteresis band**. It is the same idea as the thermostat (lesson 35) with 0.5 degrees below and above the target.

```cpp
// sketch: ldr_histerezis
const int LDR = A1;
const int LED = 13;
const int ACMA = 423;     // bunun altında: karanlık, LED yansın
const int KAPAMA = 523;   // bunun üstünde: aydınlık, LED sönsün

bool yanik = false;
bool onceki = false;
int gecis = 0;
unsigned long sonYazma = 0;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int deger = analogRead(LDR);

  if (!yanik && deger < ACMA) {
    yanik = true;
  } else if (yanik && deger > KAPAMA) {
    yanik = false;
  }
  digitalWrite(LED, yanik);

  if (yanik != onceki) {
    gecis++;
    onceki = yanik;
  }

  if (millis() - sonYazma >= 1000) {
    sonYazma = millis();
    Serial.print("gecis=");
    Serial.println(gecis);
  }
}
```

For values between 423 and 523 the program does nothing: the LED stays as it is. The decision depends on the sensor's current value **and** the LED's current state.

How wide should you make the band? It must be wider than the peak-to-peak width of the noise. If the noise swings by 80 units, the band can be 100 units. With a band that is too wide, though, the lamp comes on late and goes off late; in other words the system becomes **less sensitive**. You strike a balance between sensitivity and stability.

### Program 3: find the threshold yourself
Instead of writing the thresholds as fixed numbers, you can learn them from the surroundings. In the first 3 seconds (right after you press ▶, set the **Light** value once to 0.1 and once to 0.9) the program measures the smallest and largest value. Then it puts the thresholds at 40% (on) and 60% (off) of that range.

```cpp
// sketch: ldr_otomatik_esik
const int LDR = A1;
const int LED = 13;
const unsigned long OGRENME_MS = 3000;

int enAz = 1023;
int enCok = 0;
int acma;
int kapama;
bool yanik = false;

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);

  unsigned long bas = millis();
  while (millis() - bas < OGRENME_MS) {
    int d = analogRead(LDR);
    if (d < enAz) enAz = d;
    if (d > enCok) enCok = d;
  }

  int aralik = enCok - enAz;
  acma = enAz + aralik * 4 / 10;     // bunun altı: karanlık
  kapama = enAz + aralik * 6 / 10;   // bunun üstü: aydınlık

  Serial.print("enAz=");
  Serial.print(enAz);
  Serial.print(" enCok=");
  Serial.print(enCok);
  Serial.print(" acma=");
  Serial.print(acma);
  Serial.print(" kapama=");
  Serial.println(kapama);
  if (aralik < 100) {
    Serial.println("UYARI: isik degisimi cok az, sensoru kontrol et");
  }
}

void loop() {
  int deger = analogRead(LDR);
  if (!yanik && deger < acma) {
    yanik = true;
  } else if (yanik && deger > kapama) {
    yanik = false;
  }
  digitalWrite(LED, yanik);
}
```

### How does it work?
1. With one threshold, the LED's state is only the result of `deger > ESIK`. If the value swings back and forth across the threshold, the LED swings too.
2. In the hysteresis version, the `yanik` (lit) variable is the system's "memory". Crossing the threshold is not enough; it has to cross the **opposite** threshold.
3. The `gecis` counter turns the flicker into a number. A sign of a good solution is that this number does not grow, even in a noisy room.
4. The third version sets the band to fit the range of the surroundings. That way the same code works with different LDRs and in different rooms.

### Try it
- In the `ldr_histerezis` program, set `ACMA = 453`, `KAPAMA = 493` (a narrow band). First set the light to 0.9, then move it between 0.50 and 0.55 a few times (about 424 to 532). Does the flicker come back? With the band at 423-523, does the same movement change the LED?
- Make the band very wide (`ACMA = 200`, `KAPAMA = 800`). When does the night light come on and when does it go off?
- In the `ldr_otomatik_esik` program, try 30/70 instead of 40/60 percent. Does the lamp come on later?

### Common mistakes
- Making the on and off thresholds the same: that is a single threshold.
- Writing the thresholds the wrong way round (`ACMA > KAPAMA`): the LED never comes on or never goes off.
- Choosing a band narrower than the noise: the flicker does not go away completely.
- Connecting the LDR on the GND side and not flipping the direction: the lamp comes on in daytime.
- Not changing the light at all during the learning time (not touching the Light value): the range stays very small, the thresholds become meaningless and the program prints a warning.

## Discuss
Would you like a light sensor to react quickly and also not flicker? Explain why these two wishes pull against each other, using the width of the hysteresis band.
