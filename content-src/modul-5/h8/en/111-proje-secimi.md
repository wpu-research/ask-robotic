# Final robot: choosing the project and designing it
duration: 35

## Wonder
A friend says their robot "works really well". What does working well mean? That it went without bumping into anything, that it was fast, that it did it every time? A claim that cannot be measured can neither be proved nor disproved. Before they start, engineers write down what the word "done" stands for. Today you, too, will write your final robot's test before building the robot.

## Activity
### Three paths
This week you will do a single project, and you will choose one of three paths. All three have their finish line written in numbers.

| Path | Robot | What will it do? | Acceptance criterion | Weeks it builds on |
|---|---|---|---|---|
| A | Autonomous vehicle | It will follow the line, and after the line ends it will avoid an obstacle and drive to the finish line | Finishes the course with the obstacle and the line **without bumping into anything** and stops at the finish line | Week 1 (driving), Week 2 (obstacle), Week 3 (line) |
| B | Robot arm | The tip of the two-axis arm will go to three points in turn: it picks up the part at P1, passes it through P2 and drops it at P3 | Tip position error **less than 5 mm** at all three points | Week 7 (lessons 108-109: servos, inverse kinematics, pick-and-place) |
| C | Follower robot | It will keep a distance of 20 cm to the target in front of it, and stop when the target disappears | Follows the target at a distance of **20 cm ± 3 cm** | Week 2 (distance sensor), Week 5 (PID) |

Know how to choose: path A combines the most parts; the code is long and there are many test scenarios. Path B needs no car, puts the maths first and is measured most precisely. Path C is the smallest, but it asks you to really tune the PID. All three have criteria of the same seriousness; there is no "easy" path, only a different kind of difficulty.

### Circuit
The pins are Module 5's standard connections. Build the table for the path you chose.

**Path A: autonomous vehicle**

| Part | Connection |
|---|---|
| Left motor (L298N or TB6612 driver) | EN **D5** (PWM), IN1 **D7**, IN2 **D8** |
| Right motor | EN **D6** (PWM), IN3 **D9**, IN4 **D10** |
| HC-SR04 | TRIG **D11**, ECHO **D12**, VCC 5 V, GND |
| 5 line sensors (TCRT5000) | **A0** (far left) ... **A4** (far right), 2 cm apart |
| Bumpers (optional) | **D2**, **D3** (`INPUT_PULLUP`, pressed = LOW) |

**Path B: robot arm**

| Part | Connection |
|---|---|
| Shoulder servo | Signal **D9** |
| Elbow servo | Signal **D10** |
| Gripper servo | Signal **D11** |
| Servo power | External 5 V supply; its negative terminal connected to the Arduino GND (common GND) |

**Path C: follower robot**

| Part | Connection |
|---|---|
| Left and right motors | The same as path A: D5, D7, D8 and D6, D9, D10 |
| HC-SR04 | TRIG **D11**, ECHO **D12** |

**Power warning:** Do not power the motors and servos from the Arduino's 5 V pin; use an external supply and connect the supply's GND to the Arduino GND (common GND). Do not short-circuit batteries or connect them the wrong way round; when in doubt, ask an adult for help. Never build any circuit with mains voltage (220 V). Path B's servo pins (D9-D11) clash with the pins of the drive motors; that is why the arm is a separate set-up and is not built on the same Arduino together with the car.

### Example course and scene
The measurements in the lessons were made in the simulator with these scenes. You can build something similar for your own robot with paper and tape.

| Path | Scene |
|---|---|
| A | A 2.4 m × 1.6 m area. A black line up to 1.3 m (with a small bend), then a gap with no line. A 65 cm obstacle wall standing in the middle at 1.75 m. A finish line at 2.05 m (a crossing line that cuts across the whole path) |
| B | The arm's base is the origin; three points (cm): P1 (12; 4), P2 (8; 10), P3 (4; 12). Both parts of the arm are 10 cm |
| C | The target in front is a wide sheet of cardboard. At first it is 44 cm from the robot; then it moves away at 3 cm/s |

### Design document template
The template below is one page. Fill it in before you write the first line of code. Every box you leave empty becomes the cause of an argument later.

```text
PROJECT: ____________________        PATH: A / B / C        DATE: ________

1. GOAL (one sentence)
   ______________________________________________

2. REQUIREMENTS (each one must be measurable)
   No  | Requirement                    | Acceptance criterion    | How is it measured?
   R1  | ...                            | ... (number + unit)     | ...
   R2  | ...                            | ...                     | ...
   R3  | ...                            | ...                     | ...

3. SUBSYSTEMS
   Name        | Job                 | Interface (function)     | Stand-alone test
   Driving     | ...                 | surus(sol, sag)          | ...
   ...

4. STATE MACHINE (state, what it does, how it exits)
   ...

5. TEST PLAN
   No  | Scenario                       | Expected result         | Measured | Passed?
   T1  | ...                            | ...                     |          |
   T2  | ...                            | ...                     |          |

6. RISKS AND PLAN B
   ...
```

To see how the template gets filled in, here is a short example for path C:

```text
PROJECT: Follower robot          PATH: C

1. GOAL: A robot that keeps 20 cm from the target in front and stops when the target disappears.

2. REQUIREMENTS
   R1 | Distance while the target slowly moves away | between 17 cm and 23 cm | Real target-sensor distance, ruler
   R2 | Stopping when the target disappears         | moves less than 3 cm    | Start and end position, ruler
   R3 | Following again when the target returns     | 17-23 cm within 10 s    | Ruler

3. SUBSYSTEMS
   Driving  | Drive the motors        | surus(sol, sag)  | 1 s forward: travel 15-30 cm
   Distance | Measure ahead (median)  | mesafe()         | Wall at 50 cm: reading 49-51 cm
   PID      | Speed from the error    | (inside loop)    | Still target: 17-23 cm after 10 s

4. STATE MACHINE
   BEKLE (wait) -> TAKIP (follow, target seen) -> KAYIP (lost, no target for 0.5 s) -> TAKIP (target returned)

5. TEST PLAN
   T1 | Target moves away at 3 cm/s | 17-23 cm     | ...
   T2 | Right motor 5% weaker       | 17-23 cm     | ...
   T3 | Target disappears           | < 3 cm       | ...
```

This template is a real document; in lesson 113 you will fill in the test plan in the simulator with these columns.

### Program
Once the criteria are turned into numbers, even a program can make the "pass or fail" decision. The sketch below codes the acceptance criteria of the three paths. You type the values you measured on the serial port, and it decides. In lesson 115 you will test the final results with it.

```cpp
// sketch: kabul_olcut
// Ölçüm sonuçlarını seri porttan gir, kabul ölçütüne göre GEÇTİ / KALDI yazsın.
//   A <carpma> <bitti>      örnek: A 0 1      (bitti: 1 = parkuru bitirdi)
//   B <en_buyuk_hata_mm>    örnek: B 3.2
//   C <en_kucuk_cm> <en_buyuk_cm>   örnek: C 18.4 21.9
const float KOL_ESIK_MM = 5.0;       // hata bunun ALTINDA olmalı
const float TAKIP_HEDEF_CM = 20.0;
const float TAKIP_PAY_CM = 3.0;

void sonucYaz(char yol, bool gecti) {
  Serial.print("yol ");
  Serial.print(yol);
  Serial.println(gecti ? ": GECTI" : ": KALDI");
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  Serial.println("hazir");
}

void loop() {
  if (Serial.available() == 0) return;
  char yol = Serial.read();
  if (yol == 'A') {
    int carpma = Serial.parseInt();
    int bitti = Serial.parseInt();
    sonucYaz('A', carpma == 0 && bitti == 1);
  } else if (yol == 'B') {
    float hata = Serial.parseFloat();
    sonucYaz('B', hata < KOL_ESIK_MM);
  } else if (yol == 'C') {
    float enKucuk = Serial.parseFloat();
    float enBuyuk = Serial.parseFloat();
    sonucYaz('C', enKucuk >= TAKIP_HEDEF_CM - TAKIP_PAY_CM && enBuyuk <= TAKIP_HEDEF_CM + TAKIP_PAY_CM);
  }
}
```

### How does it work?
1. Each line starts with a path letter. The sketch takes the letter with `Serial.read()` and reads the numbers with `parseInt` and `parseFloat` (as in lesson 9).
2. **Path A:** the number of collisions must be 0 **and** it must have finished the course. A robot that stands still without ever colliding has not collided either, but it has not finished; that is why the two conditions are joined with `&&`.
3. **Path B:** "less than 5 mm" is strict. If you measure exactly 5.0 mm, you fail; that is why the sketch uses `<`, not `<=`.
4. **Path C:** 20 cm ± 3 cm, that is, between 17 and 23 with the limits included. The **smallest** and the **largest** distance measured during the follow must stay inside this range; a robot with a good average that came as close as 12 cm for a moment fails.
5. The criteria sit at the top as `const`. If you want to change a criterion, you change it in one place and write this down in the design document.

### Try it
- Fill in the design document template for the path you chose. Next to each requirement, write a number and a measurement method. If there is a sentence like "it should be fast", turn it into a number.
- In the serial monitor, type `C 17 23`, `C 16.9 20`, `B 4.9`, `B 5`. Which ones pass? Explain why in your own words.
- Add a fourth criterion to the sketch (for example "at most 20 s" for path A). What number will you enter, and why did you choose that threshold?

### Common mistakes
- Writing a requirement that cannot be measured: "it should go smoothly", "it should be precise". If it has no number and unit next to it, it is not a requirement, it is a wish.
- Loosening the criterion after the result is announced. If a criterion is going to change, the reason is written in the document and the change is applied to all tests.
- Trying to use the bumpers and the encoder at the same time for path A: both want D2 and D3.
- Powering a servo or motor from the Arduino's 5 V pin: the Arduino resets or the board gets damaged. Use external power and a common GND.
- Trying to do all three paths at once. Finishing one path with its criteria is better than leaving all three half done.

## Discuss
When is it an honest decision to loosen a criterion later because the robot could not meet it, and when is it fooling yourself? What information, written in the document, would let you tell the two apart?
