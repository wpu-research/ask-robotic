# Project: Command-driven car
duration: 35

## Wonder
While you are driving a remote-controlled car, the remote's battery runs out, or the connection drops. If the car keeps going with the last command, it falls off the table or crashes into something. A safe robot must notice that "the commands have stopped" and stop by itself. In this project you will build your own command-driven car, add this safety measure and measure it: how far does the robot travel after the commands stop?

## Activity
### What are we going to do?
This project brings together this week's lessons:
- **Lesson 76:** the v and ω formulas. The speed of a turn on the spot is calculated with ω = 2·v / L.
- **Lesson 77:** the motor driver: direction pins and PWM.
- **Lesson 78:** turning a requested speed in cm/s into PWM with `hizdanPwm()` (it skips the dead zone).
- **Lesson 79:** the serial command parser (W, S, A, D, X).
- **Module 3:** non-blocking timing with `millis()` (lesson 27) and a state machine with `enum` (lesson 28).

What is new: a **command watchdog**. If `CMD_TIMEOUT = 700 ms` has passed since the last valid command, the robot stops by itself. So the side sending the commands must **repeat** the command at short intervals, such as every 200 ms, to keep the robot going (like holding a key down).

### The Hyvex case: what happens when control is lost?
Day 9 of the Hyvex internship programme is about fail-safe design and safety engineering. That day's case is a **command watchdog**: `CMD_TIMEOUT = 0.7 s`. The idea of the day rests on one question: "What happens when control is lost?" The lesson question in the programme is: if the operator's browser crashes, what should the gimbal do? We ask the same question for our own robot: if the commands from the driver stop, what should the robot do? In the project we use the same time: `CMD_TIMEOUT = 700 ms`. Below we will measure why this time is a good or a bad choice.

### Circuit
| Part | Connection |
|---|---|
| Left motor | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| Status LED + 330 Ω resistor | **D13** → resistor → LED anode; cathode → GND |
| Motor power | Separate battery box; driver GND common with Arduino GND |

If the LED is on, the robot is in the "driving" state; if it is off, the robot is stopped. The motor driver can be an L298N or a TB6612 (lesson 77).

**Safety:** Use a separate battery for the motors and join the GNDs. Do not connect the battery box the wrong way round and do not short it. When you run the robot for the first time, keep the wheels in the air. Do not leave the robot unattended at the edge of the table: the watchdog is one of several safety layers, not the only measure.

### The command language
Differences from lesson 79: the speed is now written in **cm/s** (`hizdanPwm` converts it to PWM), and the upper speed limit is 39 cm/s.

| Command | Meaning |
|---|---|
| `W20` | forward at 20 cm/s |
| `S20` | backward at 20 cm/s |
| `A12` | turn left on the spot; each wheel at 12 cm/s |
| `D12` | turn right on the spot; each wheel at 12 cm/s |
| `X` | stop |

If no number is written, 20 cm/s is used. When turning on the spot, ω = 2·v / L (lesson 76). For 12 cm/s, ω = 2·0.12 / 0.12 = 2 rad/s ≈ 115°/s. The time to turn 90° = (π/2) / 2 ≈ 0.8 s.

### State machine
| State | Motors | LED | Leaving this state |
|---|---|---|---|
| DURUYOR (stopped) | stopped | off | if W, S, A or D (speed > 0) arrives: SURUYOR |
| SURUYOR (driving) | according to the last command | on | if `X` arrives or no command for 700 ms: DURUYOR |

Every **valid** command resets the time (`sonKomut = millis()`). An invalid command (such as `Q`) does not reset the time: otherwise random noise could keep the robot driving forever.

### Program
```cpp
// sketch: komutlu_araba
const int SOL_EN = 5;
const int SOL_IN1 = 7;
const int SOL_IN2 = 8;
const int SAG_EN = 6;
const int SAG_IN1 = 9;
const int SAG_IN2 = 10;
const int DURUM_LED = 13;               // yanık = robot sürülüyor

const unsigned long CMD_TIMEOUT = 700;  // ms: bu süre komut gelmezse dur
const float L = 0.12;                   // aks aralığı (m)
const float V_MAX = 0.396;              // PWM 255'te hız (m/s)
const int OLU_PWM = 51;                 // ölü bölge sonu
const int VARSAYILAN_CM = 20;           // hız yazılmazsa (cm/s)
const int MAKS_CM = 39;                 // V_MAX'ın altında

enum Durum { DURUYOR, SURUYOR };
Durum durum = DURUYOR;
unsigned long sonKomut = 0;
char tampon[12];
int uzunluk = 0;

int hizdanPwm(float v) {
  if (v < 0.005) return 0;
  if (v > V_MAX) v = V_MAX;
  return OLU_PWM + (int)((255 - OLU_PWM) * v / V_MAX + 0.5);
}

int isaretliPwm(float v) {
  return v >= 0 ? hizdanPwm(v) : -hizdanPwm(-v);
}

void motor(int en, int in1, int in2, int pwm) {
  digitalWrite(in1, pwm > 0);
  digitalWrite(in2, pwm < 0);
  analogWrite(en, abs(pwm));
}

void tekerlekler(float vSol, float vSag) {   // m/s, eksi = geri
  motor(SOL_EN, SOL_IN1, SOL_IN2, isaretliPwm(vSol));
  motor(SAG_EN, SAG_IN1, SAG_IN2, isaretliPwm(vSag));
}

void dur() {
  tekerlekler(0, 0);
  durum = DURUYOR;
  digitalWrite(DURUM_LED, LOW);
}

void komutIsle(char komut, int cm) {
  float v = cm / 100.0;
  switch (komut) {
    case 'W': tekerlekler(v, v); break;
    case 'S': tekerlekler(-v, -v); break;
    case 'A': tekerlekler(-v, v); break;    // yerinde sola: w = 2v / L
    case 'D': tekerlekler(v, -v); break;    // yerinde sağa
    case 'X': dur(); break;
    default:
      Serial.println("?");
      return;                               // geçersiz komut watchdog'u yenilemez
  }
  sonKomut = millis();                      // geçerli komut: watchdog sıfırlanır
  if (komut != 'X' && cm > 0) {
    durum = SURUYOR;
    digitalWrite(DURUM_LED, HIGH);
  } else {
    dur();
  }
}

void satirIsle() {
  tampon[uzunluk] = '\0';
  char komut = toupper(tampon[0]);
  int cm = VARSAYILAN_CM;
  if (uzunluk > 1) cm = constrain(atoi(tampon + 1), 0, MAKS_CM);
  komutIsle(komut, cm);
}

void setup() {
  pinMode(SOL_EN, OUTPUT); pinMode(SOL_IN1, OUTPUT); pinMode(SOL_IN2, OUTPUT);
  pinMode(SAG_EN, OUTPUT); pinMode(SAG_IN1, OUTPUT); pinMode(SAG_IN2, OUTPUT);
  pinMode(DURUM_LED, OUTPUT);
  Serial.begin(9600);
  dur();                                    // açılışta güvenli durum
  Serial.println("Hazir: W S A D X + hiz (cm/s)");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (uzunluk > 0) satirIsle();
      uzunluk = 0;
    } else if (uzunluk < (int)sizeof(tampon) - 1) {
      tampon[uzunluk++] = c;
    }
  }

  if (durum == SURUYOR && millis() - sonKomut >= CMD_TIMEOUT) {
    dur();
    Serial.println("Komut yok: dur");
  }
}
```

### How does it work?
1. `dur()` (stop) is called in `setup()`: the robot never moves at start-up. The safe state is **the default**, and motion has to be requested with a command.
2. Command parsing is as in lesson 79. The difference: `hizdanPwm()` turns cm/s into PWM; this way `W20` always means about 20 cm/s.
3. Every valid command updates `sonKomut` (last command). The check `millis() - sonKomut >= CMD_TIMEOUT` in `loop()` is correct even when `millis()` overflows, because it uses subtraction (lesson 27).
4. The watchdog only works in the SURUYOR state. If the robot is already stopped, it does not print "Komut yok" (no command) every 700 ms; the message is printed **once**, at the moment of stopping.
5. `loop()` never uses `delay`; the commands and the watchdog are handled at the same time.

### Measurement
In the simulation we placed the robot at the point (0.5 m; 2.0 m) facing the +x direction and repeated the commands at 200 ms intervals.

**Command sequence**, with `X` sent at the end of each step:

| Step | Command | Result |
|---|---|---|
| Forward for 1 s | `W20` | The robot moved forward 19.7 cm, no sideways drift |
| Turn right | `D12`, 0.8 s | Heading −90.2° (exactly right), position did not shift |
| Backward for 1 s | `S20` | Because the robot was now facing −y, it went 19.7 cm backward in the +y direction |
| Final state | | The robot at the point (0.70; 2.20) m, total distance 0.39 m |

While the commands kept coming, the LED was on; after `X` it went off. The distances matched the calculation (0.20 m/s · 1 s = 0.20 m) and so did the turning angle (2 rad/s · 0.8 s ≈ 92°).

**Watchdog measurement:** a single `W20` was sent, followed by silence.
- The left EN pin dropped to LOW about 700 ms after the end of the `W20` line (measured: 698 ms); the LED went off at the same moment.
- `Komut yok: dur` was printed on the serial port exactly once.
- During this time the robot travelled about 14 cm (0.2 m/s · 0.7 s ≈ 0.14 m). After stopping it did not move.

So the price of the watchdog: after the commands stop, the robot travels **speed · CMD_TIMEOUT**. For 20 cm/s and 0.7 s that is 14 cm; at 39 cm/s it would be 27 cm. A shorter time is safer, but if the network or connection delay varies, the robot stops for no good reason.

Extra measurements:
- When the commands were kept up at 200 ms intervals, the robot kept going for 2 seconds and the watchdog did not step in.
- When only the invalid `Q` was sent for 2 seconds, the robot stopped once the 700 ms of the first `W20` had run out: the invalid command did not renew the time.
- `W999` was limited to 39 cm/s.

What may be different on a real robot: in the simulation the serial line has no delay. Over a wireless link, commands can arrive late, so you must choose `CMD_TIMEOUT` larger than this delay, but small enough that the stopping distance stays reasonable. The robot's real stopping distance changes with the surface and the load; do not consider it safe without measuring it.

### Try it
- Set `CMD_TIMEOUT` to 300 ms and repeat the command at 400 ms intervals. What does the robot do? Why?
- Send forward at 39 cm/s and stay silent. Measure the stopping distance and compare it with the formula.
- Add a new command: the `B` command is a "slow curve": left 8 cm/s, right 16 cm/s. Calculate: what are v, ω and the turning radius? (The formulas from lesson 76.)
- After the watchdog has stopped the robot, what does it take for the robot to move again? At the moment a new W command is enough. Would a safer design (for example asking for `X` first) be possible?

### Common mistakes
- Forgetting that the remote does not repeat the command: sending a single `W` and wondering why the robot stops after 0.7 s.
- Choosing a watchdog time shorter than the command repeat interval: the robot keeps stopping and starting.
- Letting an invalid command renew the watchdog time too.
- Doing the `CMD_TIMEOUT` check with `delay`: this blocks reading the commands.
- Only setting `EN` to zero when stopping the motors, but not updating the LED and the state. `dur()` does all of this in one place.
- Forgetting the safe state at start-up: the robot spins out of control as soon as it is switched on.

## Discuss
What would happen if `CMD_TIMEOUT` were 5 s instead of 0.7 s? What if it were 0.05 s? Is stopping when control is lost, as at Hyvex, right for every system, or can you think of a system where "staying where it is" could be more dangerous?
