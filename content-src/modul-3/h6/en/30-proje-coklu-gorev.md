# Project: Multitasking panel
duration: 35

## Wonder
On a car's dashboard, a warning light blinks, the driver presses a button and, if needed, a warning sound plays, all at the same time. How does a single processor do all of these at once? In this project you will build it with what you have learnt: `millis`, a state machine and an interrupt on one panel.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| LED 1 (pulse, green) + 330 Ω | **D13** → resistor → LED **A**; **K** → GND |
| LED 2 (alarm, red) + 330 Ω | **D12** → resistor → LED **A**; **K** → GND |
| Buzzer (passive; in the properties panel, Type = Passive) | **+** end to **D8**, **-** end to GND |
| Button 1 (MOD, mode) | **A** end to **D2**, **B** end to GND (`INPUT_PULLUP`) |
| Button 2 (SUSTUR, mute) | **A** end to **D3**, **B** end to GND (`INPUT_PULLUP`) |

### Tasks
The panel does three jobs, and they all run at the same time:
1. **Pulse LED (D13):** its speed changes with the mode.
2. **Mode change (D2, interrupt):** each press goes BEKLE (waiting) → CALISIR (running) → ALARM → BEKLE.
3. **Timed buzzer (D8):** silent in BEKLE; in CALISIR, a single 0.1 second beep every 2 seconds; in ALARM, a 2 kHz warning that sounds for 0.2 s and is silent for 0.2 s.

| Mode | D13 LED | D12 LED | Buzzer |
|---|---|---|---|
| BEKLE | changes every 1000 ms (0.5 Hz) | off | silent |
| CALISIR | changes every 250 ms (2 Hz) | off | a 100 ms 1 kHz beep every 2 s |
| ALARM | changes every 100 ms (5 Hz) | on | sounds for 200 ms, silent for 200 ms (2 kHz) |

There are two ways out of ALARM mode: if you press the SUSTUR button (D3), or if 5 seconds pass, it goes back to BEKLE.

### Program
```cpp
// sketch: coklu_gorev_paneli
const int LED_NABIZ = 13;
const int LED_ALARM = 12;
const int BUZZER = 8;
const int BTN_SUSTUR = 3;

enum Mod { BEKLE, CALISIR, ALARM };
Mod mod = BEKLE;

volatile bool modIstegi = false;           // ISR ile loop arasında paylaşılır
volatile unsigned long sonKesme = 0;

unsigned long ledZaman = 0;
unsigned long buzzerZaman = 0;
unsigned long modBasi = 0;
bool ledYanik = false;
bool buzzerAcik = false;

void modTusu() {                           // ISR: kısa tut
  unsigned long simdi = millis();
  if (simdi - sonKesme > 50) {             // sıçrama koruması
    modIstegi = true;
    sonKesme = simdi;
  }
}

void modGec(int yeni) {
  mod = (Mod)yeni;
  modBasi = millis();
  ledZaman = modBasi;
  buzzerZaman = modBasi;
  ledYanik = false;
  buzzerAcik = false;
  digitalWrite(LED_NABIZ, LOW);
  noTone(BUZZER);
}

void buzzerYonet(unsigned long simdi, unsigned long acikSure,
                 unsigned long kapaliSure, int frekans) {
  if (buzzerAcik) {
    if (simdi - buzzerZaman >= acikSure) {
      noTone(BUZZER);
      buzzerAcik = false;
      buzzerZaman = simdi;
    }
  } else if (simdi - buzzerZaman >= kapaliSure) {
    tone(BUZZER, frekans);
    buzzerAcik = true;
    buzzerZaman = simdi;
  }
}

void setup() {
  pinMode(LED_NABIZ, OUTPUT);
  pinMode(LED_ALARM, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(BTN_SUSTUR, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), modTusu, FALLING);
}

void loop() {
  unsigned long simdi = millis();

  // 1) Mod değişimi (kesmeden gelen istek)
  if (modIstegi) {
    modIstegi = false;
    modGec((mod + 1) % 3);
  }

  // 2) ALARM'dan çıkış: SUSTUR butonu ya da 5 sn dolması
  if (mod == ALARM) {
    if (digitalRead(BTN_SUSTUR) == LOW || simdi - modBasi >= 5000) {
      modGec(BEKLE);
    }
  }

  // 3) Nabız LED'i
  unsigned long aralik = 1000;
  if (mod == CALISIR) aralik = 250;
  if (mod == ALARM) aralik = 100;
  if (simdi - ledZaman >= aralik) {
    ledZaman = simdi;
    ledYanik = !ledYanik;
    digitalWrite(LED_NABIZ, ledYanik);
  }

  // 4) Alarm LED'i
  digitalWrite(LED_ALARM, mod == ALARM ? HIGH : LOW);

  // 5) Zamanlı buzzer
  switch (mod) {
    case BEKLE:
      break;                               // sessiz
    case CALISIR:
      buzzerYonet(simdi, 100, 1900, 1000);
      break;
    case ALARM:
      buzzerYonet(simdi, 200, 200, 2000);
      break;
  }
}
```

### How does it work?
1. **There is no `delay` at all.** Each task has its own time variable (`ledZaman`, `buzzerZaman`, `modBasi`).
2. **The mode is a state machine.** The `mod` variable holds which state we are in; transitions are made inside `modGec()` (change mode), which resets the time counters.
3. **The MOD button is read with an interrupt.** The ISR only raises a flag; the real work is done in `loop()`. Even while the buzzer sounds or the LED waits, no press is missed.
4. **The buzzer is a small state machine too:** it has two states, "on" and "off", and their durations are given separately.
5. The SUSTUR button is read inside `loop()` with `digitalRead`. Because each round runs very fast, this is good enough as well; compare the two methods.

### Extra: What happens when control is lost?
In remote-controlled systems like Hyvex, losing the remote or the wireless link is a real risk. If the last command was "run the motor" and the link is cut, the motor may keep turning for ever. The fix: commands must arrive regularly; if no command arrives for a certain time, the output must **switch itself off**. In software this is called "timeout" or "watchdog" logic. The sketch below keeps output D7 (the motor/relay pin) on as long as `1` commands keep coming from the serial port; if no command arrives for 700 ms, it switches it off. Because it is written with `millis`, it does not use `delay`. (The Arduino's processor also has a hardware watchdog timer; in this lesson we only cover the software method.)

```cpp
// sketch: komut_zaman_asimi
const unsigned long ZAMAN_ASIMI = 700;   // ms
unsigned long sonKomut = 0;
bool cikisAcik = false;

void setup() {
  pinMode(7, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '1') {                      // "çalış" komutu: çıkışı aç, sayacı yenile
      cikisAcik = true;
      sonKomut = millis();
      digitalWrite(7, HIGH);
    } else if (c == '0') {               // "dur" komutu
      cikisAcik = false;
      digitalWrite(7, LOW);
    }
  }

  if (cikisAcik && millis() - sonKomut >= ZAMAN_ASIMI) {
    cikisAcik = false;                   // komut kesildi: güvenli duruma geç
    digitalWrite(7, LOW);
    Serial.println("Komut yok: cikis kapandi");
  }
}
```
A real motor cannot be powered straight from an Uno pin; it needs a transistor or a driver (lessons 22 and 23). In the lab you can watch the D7 output with an LED.

### Try it
- In CALISIR mode, make the beep 50 ms long. Can you still hear the beep?
- End ALARM only with the SUSTUR button instead of the timeout. What happens then for a user who forgets to come back?
- Add a fourth mode to the panel (for example SESSIZ, silent: the LED is on, the buzzer is quiet).

### Common mistakes
- Using `Serial.print` or `delay` inside the ISR.
- Removing `volatile` from the `modIstegi` and `sonKesme` variables.
- Not resetting the time counters when the mode changes: the first beep or blink of the new mode comes at the wrong time.
- Forgetting to switch off with `noTone()` while `tone()` is playing: the buzzer does not stop.
- Checking the `millis` difference by adding (the overflow trap).

## Discuss
Which task on this panel is most sensitive to timing: the LED, the buzzer or the button? How does adding a new task (for example reading a sensor) affect the existing tasks? What do you need to watch out for so the job you add does not slow `loop()` down?
