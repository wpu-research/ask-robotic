# Joystick: two axes and a button
duration: 25

## Wonder
When you hold a game controller, your thumb can move left-right and up-down, and how far you push it matters too. A button only says "pressed / not pressed". A joystick gives you two numbers and a button at the same time. So why do these two numbers, when you let go of the stick, come out as "roughly the middle" rather than exactly zero?

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Joystick VCC | 5V |
| Joystick GND | GND |
| Joystick VRX (X axis) | **A0** |
| Joystick VRY (Y axis) | **A1** |
| Joystick SW (button) | **D2** (`INPUT_PULLUP`) |
| Resistor (330 Ω) 1 | **D13** |
| Resistor 2 | LED **A** (anode) |
| LED **K** (cathode) | GND |

When you select the joystick, the **X axis**, **Y axis** (between 0 and 1) and **Button pressed** properties appear in the right panel; you can change them while the program runs, too. Set the resistor's value to 330 Ω in the properties panel.

A joystick is really two **potentiometers** at right angles to each other (lesson 11) plus a button you can press. With the stick in the middle, each potentiometer's wiper sits at about halfway, so `analogRead` gives about 512. Push the stick all the way and the value gets close to 0 or 1023. The SW button connects to GND when pressed; because we use `INPUT_PULLUP` (lesson 6), a pressed button reads `LOW`.

On real modules the direction labels vary from maker to maker; you find out which direction is positive by trying the first program. In the lab, as the X (or Y) property grows, the `analogRead` value grows too.

### Program 1: Read the raw values
```cpp
// sketch: joystick_ham
void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  int x = analogRead(A0);
  int y = analogRead(A1);
  int basili = (digitalRead(2) == LOW) ? 1 : 0;   // 1 = düğmeye basılı

  Serial.print("X=");
  Serial.print(x);
  Serial.print(" Y=");
  Serial.print(y);
  Serial.print(" BUTON=");
  Serial.println(basili);
  delay(200);
}
```
Press ▶ and watch the Serial monitor. With the joystick's **X axis** property at 0.5, `X` comes out at about 512 (0.5 × 5 V = 2.5 V). Pull X down to 0: the value drops to 0; pull it up to 1: it rises to 1023. Try the same for Y. If you tick the **Button pressed** box, you get `BUTON=1`.

On a real module, with the stick released, X and Y are not exactly 512; you might get 497 or 530, for example, because neither potentiometer stops perfectly at halfway. You can imitate this in the lab: set the X axis property to 0.52 and the value becomes about 532.

### Centre calibration and dead zone
You learnt about calibration in lesson 14. For a joystick you do two jobs:

1. **Measure the centre.** When the program starts, it assumes the stick is released. The average of 16 readings is stored as the "centre".
2. **Add a dead zone.** Within a small range around the centre (here ±40) the value counts as zero. That way a shaky hand or a small drift of the potentiometer does not move the robot or the servo.

We convert the distance from the centre into the range `-100 ... +100` with `map` (lesson 14). The part outside the dead zone is rescaled, so the value starts from 0 just outside the dead zone instead of suddenly jumping to 40.

### Program 2: Calibrated axes and an LED on the button
```cpp
// sketch: joystick_kalibre
const int SW = 2;
const int LED = 13;
const int OLU_BOLGE = 40;          // merkezin ± bu kadarı sıfır sayılır

int merkezX;
int merkezY;
bool ledAcik = false;
bool oncekiBasili = false;
unsigned long sonBasis = 0;
unsigned long sonYazma = 0;

int merkezOlc(int pin) {
  long toplam = 0;
  for (int i = 0; i < 16; i++) {
    toplam += analogRead(pin);
    delay(2);
  }
  return toplam / 16;
}

// ham değeri -100 ... +100 aralığına çevirir
int eksen(int ham, int merkez) {
  int fark = ham - merkez;
  if (abs(fark) < OLU_BOLGE) return 0;
  if (fark > 0) {
    return constrain(map(fark, OLU_BOLGE, 1023 - merkez, 0, 100), 0, 100);
  }
  return constrain(map(fark, -OLU_BOLGE, -merkez, 0, -100), -100, 0);
}

const char* yonAdi(int x, int y) {
  if (abs(x) < 30 && abs(y) < 30) return "ORTA";
  if (abs(x) >= abs(y)) return x > 0 ? "SAG" : "SOL";
  return y > 0 ? "YUKARI" : "ASAGI";
}

void setup() {
  Serial.begin(9600);
  pinMode(SW, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
  merkezX = merkezOlc(A0);          // kol bırakılmışken ölç
  merkezY = merkezOlc(A1);
}

void loop() {
  unsigned long simdi = millis();

  // Düğme: basıldığı an LED'in durumunu tersle (kenar algılama + sıçrama önleme)
  bool basili = (digitalRead(SW) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 30) {
    sonBasis = simdi;
    ledAcik = !ledAcik;
    digitalWrite(LED, ledAcik);
  }
  oncekiBasili = basili;

  // Saniyede beş kez yaz
  if (simdi - sonYazma >= 200) {
    sonYazma = simdi;
    int x = eksen(analogRead(A0), merkezX);
    int y = eksen(analogRead(A1), merkezY);
    Serial.print("X=");
    Serial.print(x);
    Serial.print(" Y=");
    Serial.print(y);
    Serial.print(" YON=");
    Serial.println(yonAdi(x, y));
  }
}
```

### How does it work?
1. `merkezOlc` (measure centre) reads 16 times while the stick is released and takes the average. Using an average instead of a single reading reduces noise (lesson 14).
2. `eksen` (axis) first finds the difference from the centre. If the difference is inside the dead zone, it returns 0.
3. If the difference is positive, `map` converts the range `OLU_BOLGE ... (1023 − merkez)` into `0 ... 100`. If it is negative, the range `-OLU_BOLGE ... -merkez` becomes `0 ... -100`. If the centre is not 512, the two halves have different lengths; doing it this way means you reach exactly ±100 at both ends.
4. `constrain` cuts off small overshoots in the calculation.
5. `yonAdi` (direction name) picks whichever axis is bigger. On real modules the positive direction of the Y axis changes from module to module; in the lab, "YUKARI" (up) is printed as Y grows. If it comes out the other way round on another module, you swap the labels.
6. For the button, the edge detection from lesson 8 is used: it runs only once, at the moment of the press, so holding the button down does not make the LED blink.

### Try it
- Set `OLU_BOLGE` to 10, then to 120. Start the X axis property at 0.5 and raise it slowly: at what point does the value leave zero?
- Set the X axis property to 0.8 and **then** press ▶ (the centre is measured wrongly). Then bring X back to 0.5. What happens? Why?
- Change an LED's brightness according to the X axis (lesson 16): the LED should get brighter as the stick goes right and stay dim when it goes left. D13 is not a PWM pin; move the LED to D11 (the PWM pins are 3, 5, 6, 9, 10, 11).

### Common mistakes
- Writing the centre as a fixed 512: it works on one module, but on another the robot drifts while the stick is released.
- Not adding a dead zone: with the stick released the value wobbles, 510, 514, 509; the servo or motor jitters.
- Pressing ▶ while the stick is pushed (while X or Y is far from 0.5): the centre is measured wrongly.
- Not setting the SW pin to `INPUT_PULLUP`: when the button is released the pin floats and random presses are read (lesson 6).
- Connecting the module's VCC to 3V3 instead of 5V: the end value becomes about 675 instead of 1023 (3.3 / 5 × 1023), because the ADC measures against 5 V. Try it in the lab.

## Discuss
A drone controller has two joysticks, and neither gives exactly "zero" in the middle. How might the maker solve this flaw? If we make the dead zone very large, how does the feel of the controller change?
