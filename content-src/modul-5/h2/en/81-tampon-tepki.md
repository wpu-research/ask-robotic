# Reacting with bumper (touch) sensors
duration: 20

## Wonder
When the robot vacuum cleaner at home bumps into a chair, it stops, backs up a little and turns another way. It has no eyes and no camera. Inside the bumper at its front there is a small switch: when the bumper is pushed in, the switch closes. In this lesson you will give your robot the same reflex: bump, back off, turn. On top of that, you will look at which bumper was pressed and turn away from the obstacle.

## Activity
### Circuit
This week we use the robot's standard connections (the driver connection from lessons 76-80 still applies as it is).

| Part | Connection |
|---|---|
| Left bumper switch | Between **D2** and GND (`INPUT_PULLUP`) |
| Right bumper switch | Between **D3** and GND (`INPUT_PULLUP`) |
| Left motor | EN → **D5** (PWM), IN1 → **D7**, IN2 → **D8** |
| Right motor | EN → **D6** (PWM), IN3 → **D9**, IN4 → **D10** |

**Power warning:** Do not power the motors from the Arduino's 5 V pin. Connect a separate battery to the motor driver and also connect the battery's negative to the Arduino GND (common GND). Do not short the batteries and do not connect them the wrong way round.

D2 and D3 are the encoder pins. When the encoder arrives in lesson 91, these pins will be used for the encoder; the bumpers and the encoder are not connected at the same time.

The bumper switches are at the robot's front left and front right corners. If the left bumper is pressed, the obstacle is on the robot's left; if the right bumper is pressed, it is on its right. If both are pressed, the obstacle is straight ahead.

### Program
**First, let's read the bumper.** A bumper is no different from a button (lesson 6): it is connected with `INPUT_PULLUP` and reads **LOW while pressed**. First let's only watch the bumpers. With the edge detection from lesson 8, let's print each press once.

```cpp
// sketch: tampon_oku
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;

bool oncekiSol = false;
bool oncekiSag = false;

void setup() {
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool sol = (digitalRead(TAMPON_SOL) == LOW);   // basılı = LOW
  bool sag = (digitalRead(TAMPON_SAG) == LOW);

  if (sol != oncekiSol) {
    Serial.println(sol ? "Sol tampon: BASILDI" : "Sol tampon: BIRAKILDI");
    oncekiSol = sol;
  }
  if (sag != oncekiSag) {
    Serial.println(sag ? "Sag tampon: BASILDI" : "Sag tampon: BIRAKILDI");
    oncekiSag = sag;
  }
}
```

**Now bump, back off, turn.** Let's add the motors. Normally the robot drives straight. When a bumper is pressed, in order: stop, back off, turn away from the obstacle, drive on again.

```cpp
// sketch: tampon_kacis
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN3 = 9;
const int SAG_IN4 = 10;
const int TAMPON_SOL = 2;
const int TAMPON_SAG = 3;

const int HIZ = 160;                 // PWM; ölü bölgenin (~%20) üstünde
const int GERI_MS = 400;
const int DONUS_MS = 450;

// Tek motor: pwm > 0 ileri, < 0 geri, 0 dur (77. ders)
void motor(int en, int a, int b, int pwm) {
  digitalWrite(a, pwm > 0);
  digitalWrite(b, pwm < 0);
  analogWrite(en, abs(pwm));
}

// İki motoru birden sür: sol ve sag -255...255
void surus(int sol, int sag) {
  motor(SOL_EN, SOL_IN1, SOL_IN2, sol);
  motor(SAG_EN, SAG_IN3, SAG_IN4, sag);
}

void setup() {
  pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_IN3, OUTPUT); pinMode(SAG_IN4, OUTPUT);
  pinMode(TAMPON_SOL, INPUT_PULLUP);
  pinMode(TAMPON_SAG, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool sol = (digitalRead(TAMPON_SOL) == LOW);   // basılı = LOW
  bool sag = (digitalRead(TAMPON_SAG) == LOW);

  if (!sol && !sag) {                  // temas yok: düz ilerle
    surus(HIZ, HIZ);
    return;
  }

  surus(0, 0);                         // 1) dur
  Serial.println(sol && sag ? "CARPMA ON" : sol ? "CARPMA SOL" : "CARPMA SAG");

  surus(-HIZ, -HIZ);                   // 2) geri çekil
  delay(GERI_MS);

  if (sol) surus(HIZ, -HIZ);           // 3) engelin tersine dön:
  else surus(-HIZ, HIZ);               //    sol bastıysa sağa, değilse sola
  delay(DONUS_MS);

  surus(0, 0);
}
```

### How does it work?
1. `surus(sol, sag)` drives both motors together (lesson 77). Positive means forward, negative means backward. The PWM value `HIZ = 160` is above the motors' dead zone (the first 20%) (lesson 78).
2. If there is no contact, `loop()` says `surus(HIZ, HIZ)` on every pass and returns.
3. When a bumper is pressed, the motors stop, a message is printed, the robot goes backward for `GERI_MS`, then turns on the spot for `DONUS_MS`.
4. The turning direction depends on the bumper. If the left bumper was pressed, the obstacle is on the left and the robot turns **right**: with `surus(HIZ, -HIZ)` the left wheel goes forward and the right wheel backward. The code asks `if (sol)`. In a head-on bump the left bumper is pressed too, so when both are pressed the robot also turns right. If only the right bumper is pressed, it turns left.
5. When the sequence ends, `loop()` starts again and the robot drives on.

**What we measured (simulation, an empty 2 × 2 m arena):**
- When the robot approached the wall tilted slightly to the left, the left bumper was pressed first (`CARPMA SOL`); when tilted to the right, the right bumper (`CARPMA SAG`); when approaching straight on, both at once (`CARPMA ON`).
- When a bumper was pressed, the robot's centre was about 10 cm from the wall. Because the robot's radius is 7.5 cm, it stopped without running into the wall. Because of motor lag, it slides 1-2 cm even after the stop command; in the measurement this margin was enough.
- Going backward for 400 ms took the robot about 5.5 cm back. The robot goes at about 0.2 m/s; but the motors do not change speed instantly (motor lag), so it is less than 0.2 m/s × 0.4 s = 8 cm.
- The 450 ms turn turned the robot about 90°. To the right (−90°) for the left bumper, to the left (+90°) for the right bumper.
- Left for 15 seconds in the empty arena, the robot travelled about 3 metres, escaped with the bumpers twice and never ran into the wall.

### Try it
- Raise `GERI_MS` from 400 to 800. How far does the robot go back? Does it get close to the wall while turning?
- Set `DONUS_MS` to 225. What does the turning angle drop to? What is the relationship between turning time and angle?
- Swap the bumper pins (`TAMPON_SOL` ↔ `TAMPON_SAG`). Does the robot turn towards the obstacle or away from it?

### Common mistakes
- Not writing `INPUT_PULLUP`: the pin floats and reads randomly even when the bumper is not pressed.
- Thinking a pressed bumper is HIGH: with `INPUT_PULLUP`, pressed = LOW.
- Choosing the wrong turning direction: the robot turns towards the obstacle and bumps into it again.
- Skipping the back-off and turning straight away: the robot rubs against the obstacle while turning, still stuck to it.
- A robot waiting in `delay` cannot look at anything else meanwhile. In this lesson that is not a problem, but in lesson 84 we will replace it with `millis()`.

### What may be different on a real robot
- Real bumper switches bounce when they are pressed and released (debounce, lesson 8). So wait a few milliseconds when counting presses or choosing a direction.
- The bumpers only protect a narrow area at the front of the robot. A robot that scrapes past something with its side or a corner may not press a bumper.
- On a real robot the speed, the wheel grip and the floor are different; measure the back-off and turning times again on your own robot.
- Low or soft obstacles (the edge of a rug, a cable) may never press the bumper.

## Discuss
A bumper senses "by touching", so you only find out after hitting the obstacle. When does this become a problem? Why do we need a sensor that tells us before we hit something?
