# Project: Burglar alarm (with a state machine)
duration: 35

## Wonder
You have put one sensor on the front door and one in the room, set the alarm, and now you are going to close the door and leave. Does the alarm go off straight away? When you come back into your own home, does it stay quiet until you enter the code? Does a silenced alarm still remember that "something happened"? What answers these questions is not so much the sensors as the **states** and the **transitions** between them.

## Activity
### What are we going to do?
This project brings together this week's lessons and earlier topics:
- **Lesson 41:** motion detection with a PIR (D2).
- **Lesson 43:** a door contact with a reed switch (D4) and debounce.
- **Lesson 18:** an alarm sound with a buzzer (D8).
- **Lessons 27-28:** non-blocking timing with `millis()` and a state machine with `enum`.

The alarm works with four states (in the code: `DEVRE_DISI` = disarmed, `HAZIR` = armed, `ALARM`, `SUSTURULDU` = silenced):

| State | Meaning | LED (D13) | Buzzer (D8) |
|---|---|---|---|
| `DEVRE_DISI` | The system is off, the sensors are ignored | Off | Silent |
| `HAZIR` | Armed, waiting for a breach | A short flash every 2 s | Silent |
| `ALARM` | A breach has happened | Blinks quickly | Siren sound |
| `SUSTURULDU` | The alarm has been silenced but the event is remembered | Blinks slowly | Silent |

When arming, there is a 5-second **exit delay**: you press the button and the LED blinks quickly; in a real home you would leave and close the door during this time. When the time is up, the system becomes `HAZIR`. The exit delay is not a separate state; it is tracked with a flag inside `DEVRE_DISI`.


### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| PIR | VCC → 5V, GND → GND, OUT → **D2** |
| "Arm / code" button | A → **D3**, B → GND (`INPUT_PULLUP`) |
| Reed | A → **D4**, B → GND (`INPUT_PULLUP`) |
| Buzzer (Type: Passive) | + → **D8**, − → GND (the same connection as in lesson 18) |
| Resistor (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → resistor pin 2, K → GND |

The IR obstacle sensor from lesson 42 is not used in this project; we use D3 for the code button. The reed's **Magnet nearby** box stands for the door: when it is ticked, the door is closed and D4 reads `LOW`; when it is unticked, the door is open and D4 reads `HIGH` (lesson 43). The box starts unticked, so the door is open; tick it before arming. For the **code**, press and release the button three times within 3 seconds.

### Arming and the code
- **Arming:** in the `DEVRE_DISI` state, press the button **once**. If the door is open, the system is not armed and prints the message "Kapi acik" (door open). If the door is closed, a 5-second exit delay starts.
- During the **exit delay**, the PIR is ignored. If the door is still open at the end of the 5 seconds, arming is cancelled. Otherwise the system becomes `HAZIR`.
- **Code:** pressing the button **three times** within 3 seconds is the code. We chose this so that a single accidental press does not switch the system off. If the time runs out, the counter is reset.
- If you enter the code in the **`HAZIR`** state you go to `DEVRE_DISI`; in **`ALARM`** you go to `SUSTURULDU`; in **`SUSTURULDU`** you go to `DEVRE_DISI`.
- Even if no code is entered, `ALARM` moves to `SUSTURULDU` at the end of `ALARM_SURESI` (10 seconds). This way the alarm does not sound for ever, but the LED shows a trace of the event.

### Program
```cpp
// sketch: hirsiz_alarmi
const int PIR = 2;
const int BUTON = 3;
const int REED = 4;
const int BUZZER = 8;
const int LED = 13;

const unsigned long CIKIS_GECIKMESI = 5000;   // ms
const unsigned long ALARM_SURESI = 10000;     // ms
const unsigned long SIFRE_PENCERESI = 3000;   // ms
const unsigned long BUTON_KARARLI = 30;       // ms: debounce
const int SIFRE_BASIS = 3;                    // şifre: 3 basış

enum Durum { DEVRE_DISI, HAZIR, ALARM, SUSTURULDU };
const char* DURUM_ADI[] = { "DEVRE_DISI", "HAZIR", "ALARM", "SUSTURULDU" };

Durum durum = DEVRE_DISI;
bool cikisBekliyor = false;
unsigned long cikisBasla = 0;
unsigned long alarmBasla = 0;

bool oncekiBasili = false;
unsigned long sonBasis = 0;
unsigned long ilkBasis = 0;
int basisSayisi = 0;

bool sirenFaz = false;

void durumDegistir(Durum yeni) {
  durum = yeni;
  basisSayisi = 0;                 // yeni durumda şifre sayacı sıfırlansın
  cikisBekliyor = false;
  noTone(BUZZER);
  sirenFaz = false;
  Serial.print("Durum: ");
  Serial.println(DURUM_ADI[durum]);
}

// Butonun yeni basışını bir kez bildirir (kenar + debounce).
bool yeniBasis(unsigned long simdi) {
  bool basili = (digitalRead(BUTON) == LOW);
  bool yeni = basili && !oncekiBasili && (simdi - sonBasis > BUTON_KARARLI);
  oncekiBasili = basili;
  if (yeni) sonBasis = simdi;
  return yeni;
}

// Şifre girildi mi? Her yeni basış için bir kez çağrılır.
bool sifreTamam(unsigned long simdi) {
  if (basisSayisi == 0 || simdi - ilkBasis > SIFRE_PENCERESI) {
    basisSayisi = 1;               // pencere dışında: yeni deneme başlat
    ilkBasis = simdi;
  } else {
    basisSayisi++;
  }
  if (basisSayisi >= SIFRE_BASIS) {
    basisSayisi = 0;
    return true;
  }
  return false;
}

bool ihlalVar() {
  bool hareket = (digitalRead(PIR) == HIGH);
  bool kapiAcik = (digitalRead(REED) == HIGH);
  return hareket || kapiAcik;
}

// LED desenini durumdan üretir.
void ledGuncelle(unsigned long simdi) {
  bool yanik = false;
  if (durum == DEVRE_DISI) {
    yanik = cikisBekliyor && (simdi % 500 < 250);     // çıkış gecikmesinde hızlı
  } else if (durum == HAZIR) {
    yanik = (simdi % 2000 < 100);                     // 2 sn'de bir kısa parlama
  } else if (durum == ALARM) {
    yanik = (simdi % 200 < 100);                      // çok hızlı
  } else {
    yanik = (simdi % 1000 < 500);                     // yavaş
  }
  digitalWrite(LED, yanik);
}

// Siren: 250 ms'de bir 1 kHz ile 2 kHz arasında geçiş yapar.
void sirenGuncelle(unsigned long simdi) {
  bool faz = (simdi / 250) % 2;
  if (faz != sirenFaz) {
    sirenFaz = faz;
    tone(BUZZER, faz ? 2000 : 1000);
  }
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(BUTON, INPUT_PULLUP);
  pinMode(REED, INPUT_PULLUP);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Durum: DEVRE_DISI");
}

void loop() {
  unsigned long simdi = millis();
  bool basis = yeniBasis(simdi);

  switch (durum) {
    case DEVRE_DISI:
      if (basis && !cikisBekliyor) {
        if (digitalRead(REED) == HIGH) {
          Serial.println("Kapi acik, kurulamadi");
        } else {
          cikisBekliyor = true;
          cikisBasla = simdi;
          Serial.println("Cikis gecikmesi basladi");
        }
      }
      if (cikisBekliyor && simdi - cikisBasla >= CIKIS_GECIKMESI) {
        if (digitalRead(REED) == HIGH) {
          cikisBekliyor = false;
          Serial.println("Kapi kapanmadi, kurma iptal");
        } else {
          durumDegistir(HAZIR);
        }
      }
      break;

    case HAZIR:
      if (basis && sifreTamam(simdi)) {
        durumDegistir(DEVRE_DISI);
      } else if (ihlalVar()) {
        alarmBasla = simdi;
        durumDegistir(ALARM);
      }
      break;

    case ALARM:
      sirenGuncelle(simdi);
      if (basis && sifreTamam(simdi)) {
        durumDegistir(SUSTURULDU);
      } else if (simdi - alarmBasla >= ALARM_SURESI) {
        durumDegistir(SUSTURULDU);
      }
      break;

    case SUSTURULDU:
      if (basis && sifreTamam(simdi)) {
        durumDegistir(DEVRE_DISI);
      }
      break;
  }

  ledGuncelle(simdi);
}
```

### How does it work?
1. The state machine (lesson 28) is written with `enum Durum` and a `switch`. `loop()` contains no `delay` at all, and each pass is very short; the exit delay, the alarm time, the code window and the LED patterns are measured with `millis()` (lesson 27).
2. `durumDegistir()` does the same clean-up at every transition: the code counter is reset, the buzzer goes quiet and a message is printed. This way leftovers from one state are not carried over into another.
3. `yeniBasis()` reports a button press once, using an **edge** and **debounce** (lesson 8). `sifreTamam()` counts these presses. If 3 seconds have passed since the first press, the counter starts again.
4. In the `HAZIR` state, `ihlalVar()` checks whether the PIR is HIGH or the reed is HIGH (the door has opened). Either one is enough. Once the alarm starts, it works like a **latch**: even if the PIR goes LOW again and the door closes, `ALARM` continues until the time runs out or the code is entered.
5. In the `SUSTURULDU` state the sensors are not checked at all. So a silenced alarm does not sound again with new motion; only the slow LED reminds you that the event happened. To arm the system again, you first go to `DEVRE_DISI` with the code, then arm it again with the button.
6. A PIR can stay HIGH for a while after motion (lesson 41). The PIR in the lab holds it for 3 seconds. One purpose of the exit delay is to give the PIR time to settle: if you untick the **Motion** box 3 seconds after pressing the arm button, the output stays HIGH until second 6, and the alarm goes off as soon as the system becomes `HAZIR`. The hold time of a real PIR module depends on the module; if needed, make `CIKIS_GECIKMESI` longer.

### Try it
- Try the sequence of arming, breach, silencing and switching off with the code in the lab: change the reed's and the PIR's boxes and watch the LED and buzzer pattern of each state.
- **Add an entry delay:** when the door opens, instead of an instant alarm, give 10 seconds to enter the code. Would you add a new state for this, or a flag?
- During the alarm, make the LED blink in the same rhythm as the buzzer. Which function would you change?
- If you wanted to use the IR obstacle sensor from lesson 42 (D3), which pin would you move the code button to? Is there a free pin in the standard connections table?
- Set `SIFRE_BASIS` to 4 and change `SIFRE_PENCERESI`. Think about the balance between a hard code and ease of use.

### Common mistakes
- Setting up the reed logic the wrong way round: it reads LOW (contact closed) when the door is closed and HIGH when it is open. In the `HAZIR` state, `HIGH` is a breach.
- Arming without closing the door: the code catches this and refuses to arm. If you remove this check, the system becomes `HAZIR` with an open door and goes off straight away.
- Finding the PIR HIGH just after the exit delay: you walked past the sensor on your way out. Place the sensor out of your exit path, not outside the door.
- Not resetting the code counter when the state changes: presses from the previous state spoil the new one.
- Using `delay()`: code presses and sensors are missed.

## Discuss
What are the weak points of this alarm? What happens if someone covers the PIR, sticks a magnet to the door frame or cuts the wires? What would a real alarm do about these situations?
