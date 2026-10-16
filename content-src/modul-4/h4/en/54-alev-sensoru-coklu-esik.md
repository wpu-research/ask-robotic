# Flame sensor and managing several thresholds
duration: 30

## Wonder
A fire alarm does not just say "fire" or "no fire". First it gives a small warning ("something is getting hot, take a look"); if things get worse it switches to a danger alarm, and when things improve it goes back from danger to warning and then to normal. In this lesson you will get to know the flame sensor, write a three-level (`NORMAL`, `UYARI` = warning, `TEHLIKE` = danger) decision system and learn to reuse the same code for more than one sensor.

## Activity
### Safety note
There is no flame in this lesson: you will imitate a flame in the lab with the flame sensor's **Flame intensity** property. Experimenting with real flames is dangerous.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Flame sensor module | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A1** (**DO** stays unconnected) |
| MQ-2 gas sensor module (for the last sketch) | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A3** |
| Resistor (330 Ω) + LED (warning; set its colour to yellow in the properties panel) | **D12** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| Resistor (330 Ω) + LED (danger; red) | **D13** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |
| Buzzer (**Type: Active** in the properties panel) | **+** → **D8**, **-** → **GND** |

This week we used pin A1 for the LDR in lesson 51; here the flame sensor is connected in place of the LDR (you can delete the LDR and its resistor from the canvas). Flame sensors are sensitive to the **infrared (IR) light** that a flame gives off. On many modules the analog value **drops** when a strong IR source comes close, but this depends on the module; it can be the other way round. Sunlight and some lamps also give off IR, so false alarms can happen. The sensor's viewing angle and range are limited.

On the flame module in the lab, AO **drops** as the flame grows (AO = 5 V × (1 − 0.95 × intensity)); so `ALEVDE_DUSER = true` is correct. When **Flame intensity** is 0, `analogRead` reads 1023 (an intensity value of 0). Comparison table for this lesson:

| Flame intensity | 0 | 0.31 | 0.4 | 0.62 | 0.8 |
|---|---|---|---|---|---|
| `siddet()` | 0 | about 300 (`UYARI` threshold) | about 389 | about 600 (`TEHLIKE` threshold) | about 777 |

For the MQ-2, `analogRead(A3)` is about 102 in clean air (Gas level 0); so `gazBaz` is about 102. To reach `UYARI` it has to go above about 153, and for `TEHLIKE` above about 255: a Gas level of 0.06 gives `UYARI`, 0.3 gives `TEHLIKE`.

### Sort out the direction in one place
The module's value may drop or rise with a flame. Instead of thinking about this difference everywhere in the program, you turn the raw reading into a single number called **intensity** (`siddet`): the bigger the intensity, the stronger the flame.

```cpp
const bool ALEVDE_DUSER = true;   // modülün alevde değer düşüyorsa true

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}
```

From now on, every threshold is written in terms of "intensity". If your module works the other way round, you only change this line.

### Several thresholds: level and hysteresis
Three levels (`NORMAL`, `UYARI`, `TEHLIKE`) need four thresholds:

| Transition | Threshold |
|---|---|
| NORMAL → UYARI | `uyariAc` |
| UYARI → NORMAL | `uyariKapat` (smaller) |
| UYARI → TEHLIKE | `tehlikeAc` |
| TEHLIKE → UYARI | `tehlikeKapat` (smaller) |

Each level has different on and off thresholds; that way the hysteresis from lesson 51 works in two places at once. We keep the levels in an `enum`, as in lesson 28. The decision depends on the **current level** and the **current value**.

### Repeated code
If you copy and paste the same logic for two sensors (flame and gas), the program turns into this:

```cpp
// alev için
if (alevSeviye == NORMAL && a >= 300) alevSeviye = UYARI;
else if (alevSeviye == UYARI && a < 250) alevSeviye = NORMAL;
// ... TEHLIKE için de aynısı ...

// gaz için aynı kodun kopyası, farklı sayılarla
if (gazSeviye == NORMAL && g >= 276) gazSeviye = UYARI;
else if (gazSeviye == UYARI && g < 230) gazSeviye = NORMAL;
// ... TEHLIKE için de aynısı ...
```

If you find a bug, you have to fix it in two places (later three, four places). The fix is to put the shared logic **into a function** (lesson 19). The function takes the thresholds as parameters and returns the new level.

### Program 1: flame level
```cpp
// sketch: alev_seviye
const int ALEV = A1;
const int LED_UYARI = 12;
const int LED_TEHLIKE = 13;
const int BUZZER = 8;
const bool ALEVDE_DUSER = true;

enum Seviye { NORMAL, UYARI, TEHLIKE };

Seviye seviye = NORMAL;

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  // simdiki == TEHLIKE
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL";
}

void setup() {
  pinMode(LED_UYARI, OUTPUT);
  pinMode(LED_TEHLIKE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int s = siddet(analogRead(ALEV));
  Seviye yeni = seviyeBul(seviye, s, 300, 250, 600, 500);

  if (yeni != seviye) {
    seviye = yeni;
    Serial.print("ALEV: ");
    Serial.print(seviyeAdi(seviye));
    Serial.print(" siddet=");
    Serial.println(s);
  }

  digitalWrite(LED_UYARI, seviye == UYARI);
  digitalWrite(LED_TEHLIKE, seviye == TEHLIKE);
  digitalWrite(BUZZER, seviye == TEHLIKE);
}
```

From `NORMAL`, the function can jump straight to `TEHLIKE` (if a flame appears suddenly). From `TEHLIKE`, it can also drop straight to `NORMAL` (if the flame disappears suddenly). We did not make the middle level a step you must pass through.

### Program 2: two sensors, one function
Now let's use the same `seviyeBul` (find level) function for both the flame (A1) and the gas (A3). The gas thresholds are not fixed numbers; as in lesson 53, they are worked out **relative to the baseline**: 1.5 times the baseline for warning, 2.5 times for danger (the off thresholds are 1.25 and 2 times). We kept the warm-up wait short here; in a real circuit you must warm it up for a long time, as in lesson 53.

```cpp
// sketch: iki_kanal_seviye
const int ALEV = A1;
const int GAZ = A3;
const int LED_UYARI = 12;
const int LED_TEHLIKE = 13;
const int BUZZER = 8;
const bool ALEVDE_DUSER = true;

enum Seviye { NORMAL, UYARI, TEHLIKE };

Seviye alevSeviye = NORMAL;
Seviye gazSeviye = NORMAL;
int gazBaz;

int siddet(int ham) {
  return ALEVDE_DUSER ? 1023 - ham : ham;
}

Seviye seviyeBul(Seviye simdiki, int deger,
                 int uyariAc, int uyariKapat,
                 int tehlikeAc, int tehlikeKapat) {
  if (simdiki == NORMAL) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger >= uyariAc) return UYARI;
    return NORMAL;
  }
  if (simdiki == UYARI) {
    if (deger >= tehlikeAc) return TEHLIKE;
    if (deger < uyariKapat) return NORMAL;
    return UYARI;
  }
  if (deger < tehlikeKapat) {
    return (deger >= uyariKapat) ? UYARI : NORMAL;
  }
  return TEHLIKE;
}

const char* seviyeAdi(Seviye s) {
  if (s == UYARI) return "UYARI";
  if (s == TEHLIKE) return "TEHLIKE";
  return "NORMAL";
}

Seviye enKotu(Seviye a, Seviye b) {
  return (a > b) ? a : b;
}

void gecisYaz(const char* ad, Seviye eski, Seviye yeni, int deger) {
  if (eski == yeni) return;
  Serial.print(ad);
  Serial.print(": ");
  Serial.print(seviyeAdi(yeni));
  Serial.print(" deger=");
  Serial.println(deger);
}

int bazOlc(int pin) {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(pin);
    delay(10);
  }
  return toplam / 16;
}

void setup() {
  pinMode(LED_UYARI, OUTPUT);
  pinMode(LED_TEHLIKE, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  gazBaz = bazOlc(GAZ);
  Serial.print("gazBaz=");
  Serial.println(gazBaz);
}

void loop() {
  int a = siddet(analogRead(ALEV));
  int g = analogRead(GAZ);

  Seviye yeniAlev = seviyeBul(alevSeviye, a, 300, 250, 600, 500);
  Seviye yeniGaz = seviyeBul(gazSeviye, g,
                             gazBaz * 3 / 2, gazBaz * 5 / 4,
                             gazBaz * 5 / 2, gazBaz * 2);

  gecisYaz("ALEV", alevSeviye, yeniAlev, a);
  gecisYaz("GAZ", gazSeviye, yeniGaz, g);
  alevSeviye = yeniAlev;
  gazSeviye = yeniGaz;

  Seviye genel = enKotu(alevSeviye, gazSeviye);
  digitalWrite(LED_UYARI, genel == UYARI);
  digitalWrite(LED_TEHLIKE, genel == TEHLIKE);
  digitalWrite(BUZZER, genel == TEHLIKE);
}
```

Because the `enum` values are 0, 1, 2 in order, the comparison `NORMAL < UYARI < TEHLIKE` works. `enKotu` (worst) gives the bigger of two levels: if one of the sensors is in danger, the system is in danger.

### How does it work?
1. `siddet()` turns the raw reading into the "bigger = stronger flame" form. Whatever the module's direction, the rest of the code does not change.
2. `seviyeBul()` gathers the three levels into one function. The two sensors call the same function **with different thresholds**.
3. Because `uyariKapat < uyariAc` and `tehlikeKapat < tehlikeAc`, each transition has a hysteresis band. Even if the value wobbles near the threshold, the level does not flicker.
4. `gecisYaz()` (write transition) only prints when the level changes. The serial monitor does not scroll non-stop, so you can read the events.
5. The outputs (LEDs, buzzer) are worked out from the level on every pass. That way the outputs and the level never get out of step.

### Try it
- Make `uyariKapat` the same as `uyariAc`. Change the **Flame intensity** back and forth across the threshold a few times (for example between 0.29 and 0.33): does the level flicker? With the old values (300 and 250), does the same movement change the level?
- Add a third sensor (for example, for the NTC on A2, give the temperature as a whole number; connect the NTC and a 10 kΩ resistor as in lesson 13). Does it work without changing the `seviyeBul` function?
- If your flame sensor's value rises with a flame, which line would you change? Do you need to touch anywhere else in the program?

### Common mistakes
- Writing the off threshold bigger than the on threshold: the level never drops or keeps swinging.
- Not checking the `ALEVDE_DUSER` value: the alarm always goes off or never does.
- Copying the same logic twice: a bug fixed in one place stays in the other.
- Using numbers (`0`, `1`, `2`) instead of `NORMAL`, `UYARI`, `TEHLIKE`: the code becomes hard to read.
- In a real circuit, a sensor that looks straight at sunlight: the IR can cause a false alarm (the lab does not model this).

## Discuss
Why is there a `UYARI` (warning) level? What would we lose if there were only `NORMAL` and `TEHLIKE`? When would you find three levels too many?
