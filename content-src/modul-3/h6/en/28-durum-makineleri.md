# State machines (FSM)
duration: 25

## Wonder
A lift is only ever in one of a few set states, such as "door open", "going up" or "waiting". It moves from one state to another only when certain events happen. If you organise your programs in the same way, you get a readable structure instead of a tangled pile of `if`s. This is called a **state machine** (FSM, finite state machine).

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| LED 1 (red) + 330 Ω | **D13** |
| LED 2 (yellow) + 330 Ω | **D12** |
| LED 3 (green) + 330 Ω | **D11** |
| Button | **A** end to **D2**, **B** end to GND (`INPUT_PULLUP`) |

Each LED's **A** end goes to its resistor and its **K** end goes to GND.

### Program 1: An LED that changes mode with a button
There are three modes: **KAPALI** (off), **YAVAS** (slow, changes every 1000 ms) and **HIZLI** (fast, changes every 250 ms). Each press of the button moves on to the next mode. An `enum` gives names to numbers: KAPALI = 0, YAVAS = 1, HIZLI = 2.

```cpp
// sketch: fsm_mod
enum Mod { KAPALI, YAVAS, HIZLI };
Mod mod = KAPALI;

unsigned long sonDegisim = 0;
bool ledYanik = false;
bool oncekiBasili = false;

void yanipSon(unsigned long aralik) {
  unsigned long simdi = millis();
  if (simdi - sonDegisim >= aralik) {
    sonDegisim = simdi;
    ledYanik = !ledYanik;
    digitalWrite(13, ledYanik);
  }
}

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  bool basili = (digitalRead(2) == LOW);
  if (basili && !oncekiBasili) {              // yeni basış: sonraki moda geç
    mod = (Mod)((mod + 1) % 3);
    sonDegisim = millis();
    ledYanik = false;
    digitalWrite(13, LOW);
  }
  oncekiBasili = basili;

  switch (mod) {
    case KAPALI:
      digitalWrite(13, LOW);
      break;
    case YAVAS:
      yanipSon(1000);
      break;
    case HIZLI:
      yanipSon(250);
      break;
  }
}
```

### Program 2: A timed traffic light
Here the states change with **time**, not with a button. Each state has a duration: KIRMIZI (red) 3 s, YESIL (green) 3 s, SARI (yellow) 1 s, then KIRMIZI again.

```cpp
// sketch: fsm_trafik
enum Durum { KIRMIZI, YESIL, SARI };
Durum durum = KIRMIZI;
unsigned long durumBasi = 0;

void setup() {
  pinMode(13, OUTPUT);   // kırmızı
  pinMode(12, OUTPUT);   // sarı
  pinMode(11, OUTPUT);   // yeşil
}

void loop() {
  unsigned long simdi = millis();

  switch (durum) {
    case KIRMIZI:
      digitalWrite(13, HIGH); digitalWrite(12, LOW); digitalWrite(11, LOW);
      if (simdi - durumBasi >= 3000) { durum = YESIL; durumBasi = simdi; }
      break;
    case YESIL:
      digitalWrite(13, LOW); digitalWrite(12, LOW); digitalWrite(11, HIGH);
      if (simdi - durumBasi >= 3000) { durum = SARI; durumBasi = simdi; }
      break;
    case SARI:
      digitalWrite(13, LOW); digitalWrite(12, HIGH); digitalWrite(11, LOW);
      if (simdi - durumBasi >= 1000) { durum = KIRMIZI; durumBasi = simdi; }
      break;
  }
}
```

### How does it work?
1. A variable (`mod`, `durum`) holds **which state** the program is in right now.
2. Every time `loop()` runs, `switch` runs only the code for that state.
3. The change of state is written inside that state: an event (the button) or a time running out.
4. When the state changes, do not forget to restart the time counter (`durumBasi`, the start of the state).
5. There is no `delay` anywhere; so the program can watch the button and the time at the same time.

When you draw an FSM, first sketch the states as circles and the transitions as arrows (in a notebook or on the board). Then write the code by looking at the drawing.

### Try it
- Add a fourth mode to the `fsm_mod` program: KAPALI → YAVAS → HIZLI → SABIT (steady: the LED stays on). Do not forget to update the `% 3` expression too.
- Add a "pedestrian button" to the `fsm_trafik` program: when D2 is pressed, the YESIL state should switch to SARI straight away.
- Make red and yellow light up together before red (like a real traffic light). Do you need a new state for this?

### Common mistakes
- Not putting `break;` at the end of a `case`: the program also runs the code of the next state.
- Not writing `durumBasi = simdi;` when the state changes: the new state ends straight away.
- Changing state in every round in which the button is "pressed": use edge detection (`basili && !oncekiBasili`) so a press is counted once.
- Mixing `enum` names with plain numbers: always refer to the states by name.

## Discuss
Pick a household appliance (a washing machine, a microwave oven). What states can it be in, and which events cause the changes between states? Can you draw this as a diagram?
