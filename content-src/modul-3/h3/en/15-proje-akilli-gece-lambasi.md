# Project: Smart night light
duration: 35

## Wonder
What if a night light switched itself on when the room light went off, went out when the sun came up in the morning, and on top of that turned itself off if it got hot? We are going to combine this week's three sensors in one smart device.

## Activity
### Goal
- **LDR (A1):** as the room gets darker, the lamp gets brighter; when it gets light, the lamp goes off.
- **Potentiometer (A0):** sets the lamp's maximum brightness (so it is not too bright at night).
- **NTC (A2):** if the room goes above 40 °C, the warning LED (D13) turns on and the lamp turns off.
- **Serial monitor:** each round, the light, brightness and temperature are printed.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Potentiometer (10 kΩ) | **VCC** → 5V; **GND** → GND; **SIG** → **A0** |
| LDR | Leg 1 → 5V; leg 2 → **A1** |
| 10 kΩ resistor (for the LDR) | Leg 1 to **A1**, leg 2 to GND |
| NTC thermistor (10 kΩ) | Leg 1 → **A2**; leg 2 → GND |
| 10 kΩ resistor (for the NTC) | Leg 1 to 5V, leg 2 to **A2** |
| LED (yellow or white) = lamp | **D11** → 330 Ω resistor → LED **A**; LED **K** → GND |
| LED (red) = warning | **D13** → 330 Ω resistor → LED **A**; LED **K** → GND |

The resistor value can depend on the LED's colour; 330 Ω is for a red LED. For yellow and white LEDs, 330 Ω is usually a safe starting point too (the lab warns you if the current limit is exceeded). A white LED looks a little less bright than a yellow one; this is because the LED's forward voltage is different.

### Stage 1: Brightness by light
First, only the LDR and the lamp. In the dark (when `ham` is small) the brightness should be high. We get this by writing the output range of `map` the other way round (from 255 to 0). We add `constrain` so that it does not overflow the range.

You can set the `KARANLIK` (dark) and `AYDINLIK` (light) values as in lesson 14, by moving the LDR's light slider to the ends and reading the Serial monitor.

```cpp
// sketch: lamba_adim1
const int KARANLIK = 150;   // bunun altı: tam karanlık
const int AYDINLIK = 700;   // bunun üstü: oda aydınlık

void setup() {
  pinMode(11, OUTPUT);
}

void loop() {
  int isik = analogRead(A1);
  int parlaklik = map(isik, KARANLIK, AYDINLIK, 255, 0);
  parlaklik = constrain(parlaklik, 0, 255);
  analogWrite(11, parlaklik);
  delay(50);
}
```

`const int` defines a number whose value never changes. Putting the settings numbers at the top makes them easy to find and change later.

### Stage 2: The full smart night light
Now we add the potentiometer, NTC protection and smoothing:

1. The potentiometer sets the `enYuksek` (maximum) value (0-255).
2. The LDR is read as the average of 8 measurements; the lamp does not flicker.
3. The temperature is calculated from the NTC (lesson 13). If the temperature limit is exceeded, the warning turns on and the lamp turns off.
4. The `map` output now goes from `enYuksek` to 0 instead of from 255.

```cpp
// sketch: gece_lambasi
const int KARANLIK = 150;       // bunun altı: tam karanlık
const int AYDINLIK = 700;       // bunun üstü: oda aydınlık
const float SICAK_SINIR = 40.0; // bu sıcaklıkta lamba kapanır

void setup() {
  pinMode(11, OUTPUT);   // lamba (PWM)
  pinMode(13, OUTPUT);   // sıcaklık uyarısı
  Serial.begin(9600);
}

void loop() {
  // 1. Potansiyometre: en yüksek parlaklık (0-255)
  int enYuksek = analogRead(A0) / 4;

  // 2. LDR: 8 ölçümün ortalaması
  int toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam = toplam + analogRead(A1);
    delay(3);
  }
  int isik = toplam / 8;

  // 3. NTC: sıcaklık (beta formülü, B = 3950)
  float sicaklik = -99.0;                   // -99: geçerli ölçüm yok
  int hamS = analogRead(A2);
  if (hamS > 0 && hamS < 1023) {
    float r = 10000.0 * hamS / (1024.0 - hamS);
    float tK = 1.0 / (1.0 / 298.15 + log(r / 10000.0) / 3950.0);
    sicaklik = tK - 273.15;
  }

  // 4. Karar: karanlıkta enYuksek, aydınlıkta 0
  int parlaklik = map(isik, KARANLIK, AYDINLIK, enYuksek, 0);
  parlaklik = constrain(parlaklik, 0, enYuksek);

  if (sicaklik > SICAK_SINIR) {
    parlaklik = 0;                          // çok sıcak: lamba kapansın
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
  analogWrite(11, parlaklik);

  Serial.print("isik=");
  Serial.print(isik);
  Serial.print(" parlaklik=");
  Serial.print(parlaklik);
  Serial.print(" sicaklik=");
  Serial.println(sicaklik, 1);
  delay(200);
}
```

### How does it work?
1. `analogRead(A0) / 4` brings the potentiometer down to 0-255, which is the range `analogWrite` wants.
2. `map(isik, KARANLIK, AYDINLIK, enYuksek, 0)`: gives `enYuksek` in the dark, 0 in the light, and a proportional value in between. In `map` you are free to write the output range the other way round.
3. `constrain` keeps the brightness at the limit if the light is darker than `KARANLIK` or lighter than `AYDINLIK`.
4. While the temperature is `-99` (sensor disconnected), no warning is given. This choice is deliberate: the lamp never turning on because of a disconnected sensor would be a worse surprise. If you see `sicaklik=-99.0` in the Serial monitor, check the NTC connection.
5. Because the total `delay` in each round is about 224 ms, the lamp responds quickly to changes in light.

Expected behaviour (example):

| Situation | Result |
|---|---|
| Potentiometer at the end, room dark | Lamp fully bright |
| Potentiometer in the middle, room dark | Lamp at half brightness |
| Room light | Lamp off |
| NTC above 40 °C | Lamp goes off, D13 turns on |

### Try it
- Move the potentiometer's **Position** slider; does the lamp's maximum brightness in the dark change?
- Slowly pull the LDR's **Light** slider to the left. Does the lamp get brighter step by step?
- Lower `SICAK_SINIR` (the hot limit) to a little below room temperature and see the warning come on (or pull the NTC's **Temperature** slider to 45 °C).
- Adjust the `AYDINLIK` value. At what light level does the lamp go completely off?
- Challenge: instead of fixed `KARANLIK` and `AYDINLIK` values, add the calibration from lesson 14 inside `setup()`.

### Common mistakes
- Connecting the LDR and the resistor the wrong way round: the lamp goes off in the dark and turns on in the light. Fix it by reversing the output range of `map` or by correcting the wiring.
- Forgetting `constrain`: outside the range, `map` produces a negative number or one greater than 255, and `analogWrite` turns this into a brightness you do not expect.
- Connecting the NTC's fixed resistor with a value other than 10 kΩ and not changing the `10000.0` number in the code: the temperature is always wrong.
- In a real night light, putting the lamp too close to the LDR: when the lamp turns on, the LDR sees its own light and the lamp starts going off and on. In the lab the LDR's light only comes from the slider, so this effect is not modelled; but that is why the question in "Discuss" matters.
- Turning the potentiometer all the way to the left and thinking "the lamp is broken": if `enYuksek` is 0, the lamp never turns on.

## Discuss
What happens if the LDR sees the lamp's own light, and how could you reduce this with software? If you added a button to the night light too, which lesson's method would you use to read it?
