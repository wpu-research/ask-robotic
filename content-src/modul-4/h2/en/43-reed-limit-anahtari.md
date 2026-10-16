# The reed switch and the limit switch
duration: 20

## Wonder
A window alarm at home has two small parts: one is stuck to the frame, the other to the window. While the window is closed nothing happens between them, but when it opens the alarm sounds. There is not even a wire between them. And a printer head, or the axis of a 3D printer, stops when it reaches the end point; how does it know?

## Activity
### Two switches, the same logic
**Reed switch:** two thin metal reeds inside a glass tube. When a magnet comes near, the reeds' contact **closes**; when the magnet moves away, it opens. Electrically it is a button; what presses it is a magnet instead of a finger.

**Limit switch (micro switch):** a switch whose contact changes when a small lever or button is pressed mechanically. When a moving part reaches the end point, it hits the lever. Electrically this is a button too. There is no separate limit switch part in the lab; use the **button** part instead of a limit switch. The **Pressed** box means "the lever has been pressed".

Both are read in the same way as the button in lesson 6: one pin to the board pin, the other to GND, and the pin set to `INPUT_PULLUP`. When the contact closes, the pin is connected to GND and reads `LOW`; when the contact is open, it reads `HIGH`.

| Switch | When the contact is closed (LOW) | In the lab |
|---|---|---|
| Reed | Magnet nearby (door closed, magnet and reed facing each other) | **Magnet nearby** box ticked |
| Limit | Lever pressed | The button's **Pressed** box ticked |

Real limit switches usually have three pins: common (COM), normally open (NO) and normally closed (NC). If you use the NO pin, the contact closes when pressed, as above. If you use the **NC pin**, it is the other way round: the contact is closed when not pressed and opens when pressed. The button in the lab only works like NO. In safety applications an NC connection may be preferred, because even if the wire breaks, the pin goes HIGH and the system sees this as "contact opened". So a fault does not stay silent. But you then need to reverse this logic in the code.

**Debounce reminder:** as you learnt in lesson 8, real mechanical contacts bounce for a short moment as they close. The reeds of a reed switch and the lever of a limit switch bounce too. If we take the bouncing for a change and create an event, we get a false alarm. That is why we only accept a change if it stays stable for a short time. The reed and button in the lab change cleanly and do not bounce; the debounce part of the code is still the right habit for a real circuit.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Reed | A → **D4**, B → GND (`INPUT_PULLUP`) |
| Button (instead of a limit switch) | A → **D3**, B → GND (`INPUT_PULLUP`) |
| Resistor (330 Ω) | 1 → **D13**, 2 → LED A |
| LED | A → resistor pin 2, K → GND |

Real ready-made reed modules may have their own resistor and output on them; the reed in the lab is like a bare reed, so `INPUT_PULLUP` is a must.

### Program
```cpp
// sketch: reed_kapi
const int REED = 4;
const int LED = 13;
const unsigned long KARARLI_MS = 20;

bool kararliKapali = false;    // kapı kapalı mı (mıknatıs yakın)?
bool sonOkunan = false;
unsigned long sonDegisim = 0;

void setup() {
  pinMode(REED, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long simdi = millis();
  bool kapali = (digitalRead(REED) == LOW);      // LOW = kontak kapalı = mıknatıs yakın

  if (kapali != sonOkunan) {
    sonOkunan = kapali;
    sonDegisim = simdi;
  }
  if (sonOkunan != kararliKapali && simdi - sonDegisim >= KARARLI_MS) {
    kararliKapali = sonOkunan;
    Serial.println(kararliKapali ? "Kapi kapali" : "Kapi acik");
  }

  digitalWrite(LED, !kararliKapali);             // kapı açıkken LED yansın
}
```

To read both switches together with the same logic, we can use arrays (you saw arrays and the `for` loop in lesson 4). Here each switch keeps its own "last change" time:

```cpp
// sketch: kontak_debounce
const int PIN_SAYISI = 2;
const int PINLER[PIN_SAYISI] = {4, 3};     // 0: reed (D4), 1: limit (D3)
const unsigned long KARARLI_MS = 20;

bool kararli[PIN_SAYISI];
bool sonOkunan[PIN_SAYISI];
unsigned long sonDegisim[PIN_SAYISI];

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < PIN_SAYISI; i++) {
    pinMode(PINLER[i], INPUT_PULLUP);
    kararli[i] = false;                   // false = kontak açık
    sonOkunan[i] = false;
    sonDegisim[i] = 0;
  }
}

void loop() {
  unsigned long simdi = millis();
  for (int i = 0; i < PIN_SAYISI; i++) {
    bool kapali = (digitalRead(PINLER[i]) == LOW);
    if (kapali != sonOkunan[i]) {
      sonOkunan[i] = kapali;
      sonDegisim[i] = simdi;
    }
    if (sonOkunan[i] != kararli[i] && simdi - sonDegisim[i] >= KARARLI_MS) {
      kararli[i] = sonOkunan[i];
      Serial.print(i == 0 ? "Reed: " : "Limit: ");
      Serial.println(kararli[i] ? "kapali" : "acik");
    }
  }
}
```

### How does it work?
1. Because the pin is `INPUT_PULLUP`, it reads `HIGH` when the contact is open and `LOW` when it is closed. By writing "kapali = (digitalRead(...) == LOW)" (kapali means closed) in the code, we flip this reversed logic once.
2. When the raw reading changes, `sonDegisim` is refreshed. If the change lasts for `KARARLI_MS`, the new state is accepted and a message is printed. Shorter bounces do not produce a message.
3. `reed_kapi` keeps track of the door state; the LED lights while the door is open. This is the basic idea of the alarm in the project.
4. `kontak_debounce` repeats the same logic with arrays. To add a new switch, you just write its pin into the `PINLER` array and increase `PIN_SAYISI`.

### Try it
- While `reed_kapi` runs, select the reed part and tick the **Magnet nearby** box, then untick it. How do the LED and the serial monitor change? Note: a plain reed switch does not care which pole of the magnet comes near; it closes for both.
- While it runs, select the reed and read the voltage across its pins with the **Virtual meter** in the right panel. How many volts do you see when the contact is open, and when it is closed? Explain these values with `INPUT_PULLUP`.
- With `kontak_debounce`, operate the button (limit) and the reed one after the other. Do the messages get mixed up?
- If you had connected the limit switch to its NC pin, which line in the code would you need to change? There is no NC in the lab; write your answer by studying the code.

### Common mistakes
- Connecting the reed switch without `INPUT_PULLUP`: when the contact is open, the pin floats and gives random readings.
- Thinking "magnet nearby = HIGH": with `INPUT_PULLUP` the pin goes LOW when the contact closes.
- Not adding debounce: in a real circuit, when the door rattles or the lever bounces, false events appear.
- Forgetting to connect the reed's second pin to GND: even when the contact closes, the pin never goes LOW and "Kapi kapali" (door closed) is never printed.
- Mixing up NO and NC: the circuit works the wrong way round.

## Discuss
Why might connecting the door contact as NC in an alarm system be safer than connecting it as NO? If a burglar cuts the wire, what happens with each connection?
