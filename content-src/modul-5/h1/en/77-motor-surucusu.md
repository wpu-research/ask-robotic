# The L298N/TB6612 motor driver: direction and PWM
duration: 25

## Wonder
An Arduino pin is not enough to drive a motor directly (you saw this in lesson 22). In lesson 23 you turned a motor forwards and backwards with the L293D. Real robots, however, usually use ready-made driver boards such as the L298N or the TB6612. These boards are similar to the L293D but differ in one or two details. What happens when you make `IN1` and `IN2` the same while the robot is going at full speed? Or when you switch `EN` off?

## Activity
### Two drivers, the same idea
Both contain two H-bridges (lesson 23), so they can drive two DC motors independently. Each motor has two **direction** inputs and one **speed (PWM)** input.

| | L298N board | TB6612 board |
|---|---|---|
| Left motor direction inputs | IN1, IN2 | AIN1, AIN2 |
| Right motor direction inputs | IN3, IN4 | BIN1, BIN2 |
| Speed (PWM) inputs | ENA, ENB | PWMA, PWMB |
| Extra input | none | STBY (standby) |
| Switches inside | bipolar transistor | MOSFET |
| Voltage drop | typically about 1-2 V (check the datasheet) | usually much lower |
| Heating | can get noticeably hot | usually heats up less |
| Size | large | small |

Important differences:

- **Voltage drop:** in the L298N, part of the voltage going to the motor is used up in the driver. On robots running on small batteries you notice this difference. For the exact value, check the datasheet of the board you are using.
- **STBY:** on the TB6612, if the `STBY` pin is LOW the driver goes into standby mode and the motors do not work. To make it work, you need to make `STBY` HIGH (connect it to 5 V or give it HIGH from a pin).
- **EN jumper:** most ready-made L298N boards have a small jumper on the `ENA` and `ENB` pins that always keeps the motor at full speed. To set the speed with PWM, you remove the jumper and connect the `EN` pin to a PWM pin on the Arduino.

In this module we keep the pin names independent of the driver: left motor EN D5, IN1 D7, IN2 D8; right motor EN D6, IN3 D9, IN4 D10. If you are using a TB6612, write PWMA/PWMB instead of EN and AIN/BIN instead of IN, and connect `STBY` to HIGH.

### Truth table
Four states for a single motor (EN = PWM input):

| IN1 | IN2 | EN | State | Motor |
|---|---|---|---|---|
| HIGH | LOW | PWM | **Forward** | Turns one way at a speed set by the PWM |
| LOW | HIGH | PWM | **Backward** | Turns the other way at the same speed |
| HIGH | HIGH | HIGH | **Brake** | The motor leads are shorted together and the motor is forced to stop |
| LOW | LOW | LOW (0) | **Coast** | The motor is left disconnected and slows down on its own |

The difference between braking and coasting: when braking, the motor leads are connected to each other. A spinning motor then behaves like a generator, and its own current slows it down. When coasting, the motor slows down only through inertia and friction. On real robots, braking usually stops the robot sooner.

Watch out: on the L298N, `IN1 = IN2` brakes while EN is HIGH, but while EN is LOW the motor coasts (whatever the IN values are). On the TB6612, `IN1 = IN2 = LOW` lets the motor coast and `IN1 = IN2 = HIGH` brakes. The four rows of the table give the same result on both. If you are not sure about your board, check the datasheet.

Stop the motor briefly before changing its direction: switching suddenly to the opposite direction while the motor is turning at full speed strains both the driver and the battery.

### Circuit
| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Motor power | Separate battery box → the driver's motor power input; driver GND and Arduino GND common |

**Safety:** Do not take motor power from the Arduino; use a separate battery and join the GNDs. Do not connect the battery box the wrong way round and do not short its leads. The driver board can get hot while it is working, so wait before touching it. For the first tests, keep the robot's wheels in the air.

### Program
The sketch changes state every 1.5 seconds: forward, brake, backward, coast. Both motors are in the same state. It is written with `enum` and `switch` (lesson 28).

```cpp
// sketch: surucu_durumlari
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;

enum Durum { ILERI, FREN, GERI, SERBEST };
const char* ISIMLER[] = { "ILERI", "FREN", "GERI", "SERBEST" };

const int PWM_ILERI = 200;
const int PWM_GERI = 120;
const unsigned long ADIM_SURESI = 1500;   // ms

void surucu(int en, int in1, int in2, Durum d, int pwm) {
  switch (d) {
    case ILERI:
      digitalWrite(in1, HIGH);
      digitalWrite(in2, LOW);
      analogWrite(en, pwm);
      break;
    case GERI:
      digitalWrite(in1, LOW);
      digitalWrite(in2, HIGH);
      analogWrite(en, pwm);
      break;
    case FREN:                       // IN1 = IN2, EN açık: motor uçları kısa devre
      digitalWrite(in1, HIGH);
      digitalWrite(in2, HIGH);
      analogWrite(en, 255);
      break;
    case SERBEST:                    // EN kapalı: motor boşta döner
      digitalWrite(in1, LOW);
      digitalWrite(in2, LOW);
      analogWrite(en, 0);
      break;
  }
}

int sonAdim = -1;

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int adim = (millis() / ADIM_SURESI) % 4;
  if (adim != sonAdim) {
    sonAdim = adim;
    Durum d = (Durum)adim;
    int pwm = (d == GERI) ? PWM_GERI : PWM_ILERI;
    surucu(SOL_EN, SOL_IN1, SOL_IN2, d, pwm);
    surucu(SAG_EN, SAG_IN1, SAG_IN2, d, pwm);
    Serial.println(ISIMLER[adim]);
  }
}
```

### How does it work?
1. `surucu()` (driver) sets a motor's three pins together. The states are the rows of the truth table.
2. `loop()` splits time into 1500 ms steps with `millis()` (lesson 27). When the step changes, it puts both motors into the new state and prints its name.
3. The backward motion deliberately uses a lower PWM (120); this way you can measure that the speed depends on the PWM.

### Measurement
We ran the robot in the simulation with this sketch:

| Step | Measured |
|---|---|
| ILERI (forward), PWM 200 | The robot went straight in the +x direction at 0.29 m/s. This matches the model from lesson 76 (0.289 m/s) |
| FREN (brake) | Pins IN1..IN4 = 1 1 1 1, EN high. The robot stopped after about 2 cm |
| GERI (backward), PWM 120 | The robot went the other way at 0.13 m/s: when the PWM drops to about half, the speed drops to less than half |
| SERBEST (coast) | All pins 0. The robot stopped after about 1 cm |

The speed ratio between PWM 200 and 120 is not the same as the PWM ratio. This is because the speed is proportional not to the PWM itself but to **the part above the dead zone**. We will look at this in lesson 78.

A limit of the simulation: this robot model does not tell braking and coasting apart. In both, the wheel speed falls exponentially to zero with a time constant of about 80 ms, called the motor lag. On a real robot, braking usually stops it in a shorter time. The direction and PWM behaviour, however, have been checked in the simulation.

### Try it
- Set `PWM_ILERI` to 255. How fast does the robot go before it brakes, and does the stopping distance change?
- Set `PWM_ILERI` to 60. How does the robot move? What happens when you go below 51?
- Replace the FREN step with SERBEST. How much does the robot's stopping distance change? Would it be the same in the simulation and on a real robot?

### Common mistakes
- Using `analogWrite` on a pin that is not PWM. On the Uno the PWM pins are 3, 5, 6, 9, 10, 11; we use D5 and D6 for EN.
- Trying to set the speed with PWM while the EN jumper on the L298N board is still fitted: the speed does not change.
- Forgetting to connect `STBY` on the TB6612: the motor does not turn at all.
- Not joining the GNDs: the driver cannot understand the direction and PWM signals, and the motor behaves randomly.
- Changing direction suddenly from full speed.

## Discuss
When a robot is going down a slope, what does it do if the motors are left to coast, and what does it do if they brake? At which moments is braking useful for a robot, and at which moments is coasting useful?
