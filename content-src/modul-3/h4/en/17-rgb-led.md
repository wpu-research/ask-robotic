# The RGB LED and mixing colours
duration: 25

## Wonder
If you look closely at a screen, you see that every dot is made of three tiny lights: red, green and blue. How do they make yellow, purple and even white from just these three colours? Today you try it with the RGB LED in the lab.

## Activity
### Circuit
A common cathode RGB LED holds three LEDs, red, green and blue, inside one case and has four legs. The cathodes (negative legs) of the three LEDs join at one common leg; in the lab this leg is called **COM**. In the part's properties panel, **Common pin: Common cathode** must be selected (this is the default).

Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| RGB LED (common cathode) | **COM** → GND |
| 330 Ω resistor (for red) | leg 1 to **D9**, leg 2 to the RGB LED's **R** leg |
| 330 Ω resistor (for green) | leg 1 to **D10**, leg 2 to the RGB LED's **G** leg |
| 330 Ω resistor (for blue) | leg 1 to **D11**, leg 2 to the RGB LED's **B** leg |

Each colour leg must have its own resistor. All three pins can do PWM (D9, D10, D11), so you can set the brightness of each colour separately from 0 to 255.

### How do colours mix?
When you mix light, the colours **add up**:

| Mix | Result |
|---|---|
| Red + green | Yellow |
| Green + blue | Cyan |
| Red + blue | Purple (magenta) |
| Red + green + blue | White |
| All off | Black (LED off) |

Because each channel's value is 0-255, you can describe 256 × 256 × 256, about 16.7 million colours. The lab models this too: the blue LED has a higher threshold voltage, so with the same resistor the blue channel glows dimmer than red and "white" looks slightly tinted; this is normal.

### Program 1: Colour palette
```cpp
// sketch: rgb_renkler
// sıra: kırmızı, yeşil, mavi, sarı, camgöbeği, mor, beyaz, turuncu
int kirmizi[] = {255,   0,   0, 255,   0, 255, 255, 255};
int yesil[]   = {  0, 255,   0, 255, 255,   0, 255,  80};
int mavi[]    = {  0,   0, 255,   0, 255, 255, 255,   0};

void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < 8; i++) {
    analogWrite(9, kirmizi[i]);
    analogWrite(10, yesil[i]);
    analogWrite(11, mavi[i]);
    Serial.print("R=");
    Serial.print(kirmizi[i]);
    Serial.print(" G=");
    Serial.print(yesil[i]);
    Serial.print(" B=");
    Serial.println(mavi[i]);
    delay(1000);
  }
}
```

### Program 2: Rainbow fade
In each stage one colour fades down while the next one rises.
```cpp
// sketch: rgb_gokkusagi
void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
}

void loop() {
  for (int i = 0; i <= 255; i++) {      // kırmızıdan yeşile
    analogWrite(9, 255 - i);
    analogWrite(10, i);
    analogWrite(11, 0);
    delay(10);
  }
  for (int i = 0; i <= 255; i++) {      // yeşilden maviye
    analogWrite(9, 0);
    analogWrite(10, 255 - i);
    analogWrite(11, i);
    delay(10);
  }
  for (int i = 0; i <= 255; i++) {      // maviden kırmızıya
    analogWrite(9, i);
    analogWrite(10, 0);
    analogWrite(11, 255 - i);
    delay(10);
  }
}
```

### Program 3: Pick the colour from the Serial monitor
Type three numbers into the send box of the **Serial monitor** at the bottom, for example `255 128 0` (orange), and press Enter.
```cpp
// sketch: rgb_serial
void setup() {
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    int r = Serial.parseInt();
    int g = Serial.parseInt();
    int b = Serial.parseInt();
    r = constrain(r, 0, 255);   // 255'ten büyükse 255, 0'dan küçükse 0
    g = constrain(g, 0, 255);
    b = constrain(b, 0, 255);
    delay(10);
    while (Serial.available() > 0) {   // satır sonu karakterlerini at
      Serial.read();
    }
    analogWrite(9, r);
    analogWrite(10, g);
    analogWrite(11, b);
    Serial.print("R=");
    Serial.print(r);
    Serial.print(" G=");
    Serial.print(g);
    Serial.print(" B=");
    Serial.println(b);
  }
}
```

### How does it work?
1. Each colour leg comes from its own PWM pin. `analogWrite(9, 255)` turns red fully on, `analogWrite(10, 0)` turns green off.
2. In Program 1 the three arrays are read with the same index: `kirmizi[3]`, `yesil[3]`, `mavi[3]` (red, green, blue) together give yellow.
3. In Program 2 each stage is 256 steps. The total brightness stays roughly the same, because while one goes down the other goes up.
4. In Program 3, `parseInt` reads one number from the serial buffer. `constrain` keeps the value at 255 even if the user types 300. We store the `parseInt` result in a variable first, because an expression written straight inside `constrain` may run more than once and read extra numbers from serial. If we did not throw away the end-of-line characters, the next `parseInt` would wait for nothing and return 0.

### Try it
- Add your own favourite colour to Program 1. Which three numbers did you write? (Update the size of the arrays and the `for` limit.)
- In Program 2, change `delay(10)` to 3. How did the colour fade change?
- In Program 3, type `128 0 128`. Which colour do you get? Compare it with `64 0 64`.

### Common mistakes
- Connecting the COM leg to 5V: this connection is for a common **anode** LED. On a common cathode LED, COM goes to GND.
- If you set **Common pin** to "Common anode" in the properties panel, the logic flips: you must connect COM to 5V and write `analogWrite(pin, 255 - değer)` (where `değer` is the value).
- Using a single resistor for all three colours: the colours affect each other's brightness. Give each leg its own resistor.
- Mixing up the R, G and B legs: if the colours come out different from what you expect, check that the wires go to the right legs (R, G, B).

## Discuss
When you see "white" on a screen, what is really lit? Colours add up in light, so why do paints get darker the more you mix them?
