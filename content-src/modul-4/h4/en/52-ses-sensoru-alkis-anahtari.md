# Sound sensor: clap switch
duration: 30

## Wonder
The "clap-on lamp" is a classic: clap twice and it comes on; clap twice more and it goes off. But what if the lamp also comes on when a door slams, when someone laughs loudly or during a long piece of music? A reliable clap switch does not only check whether a sound is "there" or "not there"; it also checks how **loud** and how **long** it is.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Sound sensor module | **VCC** → Uno **5V**, **GND** → Uno **GND**, **AO** → Uno **A0** (**DO** stays unconnected) |
| Resistor (330 Ω) + LED | **D13** → resistor lead **1**; resistor lead **2** → LED **A**; LED **K** → **GND** |

A real module has a microphone and an amplifier. When the room is quiet, the analog output sits at a certain **baseline level**; when a sound arrives, it swings above and below that level. The baseline level and the sensitivity differ from module to module (most have an adjustment screw). That is why we do not write the baseline as a fixed number; we **measure** it.

The module in the lab has no microphone; you provide the sound with the **Sound level** property (0-1) in the right panel. In this module, when it is quiet (level 0) AO gives about 1.25 V, so `analogRead` reads about **256** (not 512). As the level rises, AO rises: about 327 for 0.1, about 614 for 0.5, about 829 for 0.8. The value in the lab only goes up; a real microphone swings both above and below the baseline, and `abs()` covers both.

A clap is a very short event: it suddenly moves away from the baseline, stays there for a moment and comes back. In the lab you imitate it like this: while the program runs, set the **Sound level** to 0.8 and immediately set it back to 0. Even at its fastest, this hand movement takes much longer than a real clap; that is why in the programs below we chose an upper time limit (`SURE_MAX`) of 500 ms and a gap between two claps (`ARALIK`) of 3000 ms. In a real circuit these values would be much smaller.

### Program 1: baseline and peak
First measure the room. At start-up the sketch takes an average for about a third of a second (64 readings, 5 ms apart) to find the baseline. Then, every half second, it prints the **largest deviation** (peak) from the baseline.

```cpp
// sketch: ses_baz_tepe
const int SES = A0;

int baz;
int tepe = 0;
unsigned long sonYazma = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

void setup() {
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  int fark = abs(analogRead(SES) - baz);
  if (fark > tepe) tepe = fark;

  if (millis() - sonYazma >= 500) {
    sonYazma = millis();
    Serial.print("tepe=");
    Serial.println(tepe);
    tepe = 0;
  }
}
```

The `delay` in the setup is acceptable: the measurement is done only once, when the program starts. Keep the **Sound level** at 0 during the measurement.

### Program 2: recognising a clap
A sound event is recognised in three steps:
1. **Peak height:** if the deviation goes above `TEPE_ESIK`, an event starts. Weaker sounds (talking, whispering) do not count.
2. **Duration:** the event ends when the deviation stays below the threshold for `SESSIZ_PAY`. The duration is the time between the start of the event and the last loud sample. Because the microphone signal swings, the deviation is sometimes close to zero; so we do not end the event at once but wait for a short "quiet margin".
3. **Classification:** if the duration is very short it is interference; if it is very long (music, shouting, a motor) it is not a clap. A clap is in between.

```cpp
// sketch: alkis_tani
const int SES = A0;
const int TEPE_ESIK = 150;          // baz seviyeden en az bu kadar sapma
const unsigned long SURE_MIN = 10;  // ms: bundan kısa = parazit
const unsigned long SURE_MAX = 500; // ms: bundan uzun = alkış değil
const unsigned long SESSIZ_PAY = 20; // ms

int baz;
bool sesVar = false;
unsigned long baslangic = 0;
unsigned long sonYuksek = 0;
int tepe = 0;
unsigned long sure = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

// Olay bittiğinde türünü döndürür: 'A' alkış, 'U' uzun ses, 'K' kısa parazit.
// Olay yoksa ya da sürüyorsa 0 döner.
char olayOku() {
  unsigned long simdi = millis();
  int fark = abs(analogRead(SES) - baz);

  if (fark >= TEPE_ESIK) {
    if (!sesVar) {
      sesVar = true;
      baslangic = simdi;
      tepe = 0;
    }
    sonYuksek = simdi;
    if (fark > tepe) tepe = fark;
  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {
    sesVar = false;
    sure = sonYuksek - baslangic;
    if (sure < SURE_MIN) return 'K';
    if (sure > SURE_MAX) return 'U';
    return 'A';
  }
  return 0;
}

void setup() {
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  char olay = olayOku();
  if (olay == 0) return;

  if (olay == 'A') Serial.print("ALKIS");
  if (olay == 'U') Serial.print("UZUN");
  if (olay == 'K') Serial.print("KISA");
  Serial.print(" sure=");
  Serial.print(sure);
  Serial.print(" tepe=");
  Serial.println(tepe);
}
```

`olayOku()` (read event) keeps a **state** (`sesVar`, sound present). The function is called on every pass of `loop()`, returns `0` on most passes and finishes very quickly. It is the non-blocking code idea from lesson 27.

### Program 3: toggle the LED with two claps
The clap switch looks at the time between two claps. If there is at most `ARALIK` (here 3 seconds) between the **starts** of two claps, the LED's state is flipped. A single clap does nothing, but it is remembered as the "first clap". If a long sound comes in between, the memory is wiped.

```cpp
// sketch: alkis_anahtar
const int SES = A0;
const int LED = 13;
const int TEPE_ESIK = 150;
const unsigned long SURE_MIN = 10;
const unsigned long SURE_MAX = 500;
const unsigned long SESSIZ_PAY = 20;
const unsigned long ARALIK = 3000;   // iki alkış arası en çok

int baz;
bool sesVar = false;
unsigned long baslangic = 0;
unsigned long sonYuksek = 0;
int tepe = 0;
unsigned long sure = 0;

bool ledAcik = false;
int alkisSay = 0;
unsigned long ilkAlkis = 0;

int bazOlc() {
  long toplam = 0;
  for (int i = 0; i < 64; i++) {
    toplam += analogRead(SES);
    delay(5);
  }
  return toplam / 64;
}

char olayOku() {
  unsigned long simdi = millis();
  int fark = abs(analogRead(SES) - baz);

  if (fark >= TEPE_ESIK) {
    if (!sesVar) {
      sesVar = true;
      baslangic = simdi;
      tepe = 0;
    }
    sonYuksek = simdi;
    if (fark > tepe) tepe = fark;
  } else if (sesVar && simdi - sonYuksek >= SESSIZ_PAY) {
    sesVar = false;
    sure = sonYuksek - baslangic;
    if (sure < SURE_MIN) return 'K';
    if (sure > SURE_MAX) return 'U';
    return 'A';
  }
  return 0;
}

void setup() {
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  baz = bazOlc();
  Serial.print("baz=");
  Serial.println(baz);
}

void loop() {
  char olay = olayOku();

  if (olay == 'A') {
    if (alkisSay == 1 && baslangic - ilkAlkis <= ARALIK) {
      ledAcik = !ledAcik;
      digitalWrite(LED, ledAcik);
      alkisSay = 0;
      Serial.println(ledAcik ? "LED acik" : "LED kapali");
    } else {
      alkisSay = 1;
      ilkAlkis = baslangic;
    }
  } else if (olay == 'U') {
    alkisSay = 0;              // uzun ses: alkış dizisini sıfırla
  }
}
```

### How does it work?
1. `bazOlc()` finds the average of the quiet room. All deviations are worked out from this value.
2. `abs(analogRead(SES) - baz)` counts swings above and below the baseline in the same way.
3. When an event starts, `baslangic` (start) is saved, and `sonYuksek` (last loud) is updated on every loud sample. The duration is `sonYuksek - baslangic`.
4. A single loud sound is one clap, but on its own it does not change the LED: `alkisSay` (clap count) becomes 1 and the program waits for a second clap.
5. If the second clap comes later than `ARALIK` (3 seconds), that clap becomes a new "first clap".
6. If the sounds are too weak (below `TEPE_ESIK`), too short or too long, they are not counted as claps at all.

### Try it
- Imitate talking with **Sound level = 0.1** (a deviation of about 71). With `TEPE_ESIK` at 150, is it counted as an event? What about at 50? Then set it to 400 and try levels of 0.5 (deviation about 358) and 0.8 (about 573): which claps are missed?
- Set `ARALIK = 1000` and wait about 2 seconds between two claps. What happens?
- Add a third clap: on three claps, sound an active buzzer (D8) briefly. Pick the buzzer from the **Add part** menu and set its **Type** to **Active** in the properties panel. How should the `alkisSay` variable change?

### Common mistakes
- Assuming the baseline is 512: the module's baseline is different (about 256 on the lab module). Always measure it.
- Measuring the baseline while the **Sound level** is not 0: the baseline comes out wrong and claps are either always recognised or never recognised.
- Ending the event on a single sample: the swinging signal sometimes passes through the baseline, and one clap looks like two events. The quiet margin solves this.
- Looking only at peak height: a very loud door slam also looks like a clap. Check the duration too.
- In a real circuit, loose or wobbly wires also move the signal and create false events (the lab does not model this, but keep it in mind).

## Discuss
Why does a clap switch struggle in a crowded room? Which other check would you add to the duration and height checks (for example, limiting the time between two claps) to reduce false triggers?
