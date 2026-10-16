### Goals for the week
By the end of this week the learner:
1. Can explain differential drive; can calculate v, ω and the turning radius from the left and right wheel speeds, and can solve the inverse problem.
2. Can name the direction and speed inputs of the motor driver (L298N, TB6612), its truth table (forward, backward, brake, coast) and the rules for a safe connection.
3. Can measure the dead zone and the maximum speed and write a calibration function that turns a requested speed into PWM.
4. Can parse letter commands coming from the serial port and drive the robot.
5. Can build a command-driven car with a command watchdog and a state machine, and can calculate the price of the watchdog (speed × time).

### Plan for the week
The week has five lessons; each lesson takes 25-35 minutes. The plan is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Differential drive: v, ω and wheel speeds | ~25 min | Read the explainer, apply the formulas by hand, try the sketch in the simulation, do the mini quiz. |
| 2 | The L298N/TB6612 motor driver: direction and PWM | ~25 min | Learn the truth table, run the four states in turn, compare braking and coasting. |
| 3 | Speed, dead zone and calibration | ~30 min | Scan the dead zone, draw a line through two points, compare hizdanPwm with the naive mapping. |
| 4 | Driving with serial commands (a remote control simulation) | ~25 min | Try the W S A D X commands, observe the error cases (Q, W999). |
| 5 | Project: Command-driven car | ~35 min | Set up the watchdog, send the command sequences, measure and calculate the stopping distance. |

### Prerequisite check
This week assumes Modules 1-3 (and most of Module 4) have been completed. Before you start, check:
- Can they explain PWM and analogWrite (Module 3, lesson 16)?
- Do they remember why a DC motor is not driven directly from an Arduino pin (lesson 22) and what the H-bridge does (lesson 23)?
- Can they use non-blocking timing with millis() (lesson 27) and a state machine with enum (lesson 28)?
- Can they send and read a line from the Serial monitor (lesson 9)?
- Are they comfortable dividing and multiplying decimals and converting between metres and centimetres?

### Concept map
- **Motion:** wheel speeds vL, vR → v and ω → turning radius R → inverse problem
- **Hardware:** motor driver → direction (IN) and speed (EN, PWM) → brake and coast → common GND, separate motor power
- **Speed control:** PWM → dead zone → maximum speed → calibration from two points → hizdanPwm
- **Commands:** serial buffer → letter + number → atoi, toupper, constrain → switch
- **Safety:** the last command keeps going → watchdog (CMD_TIMEOUT) → stopping distance = speed × time → safe state

### Common mistakes
- **Mixing up units.** L = 0.12 m, not 12 cm; ω is in rad/s, not degrees.
- **Calculating ω from the sum of the speeds.** ω needs the difference; the sum goes into v.
- **Calculating R when vR = vL.** It is a division by zero; when driving straight, R is infinite.
- **Connecting EN to a pin that is not PWM.** On the Uno the PWM pins are 3, 5, 6, 9, 10, 11.
- **Not joining the GNDs, or powering the motor from the Arduino's 5V.** A separate battery and a common GND are needed.
- **Thinking PWM is speed.** 128 is not half speed; because of the dead zone, the motor does not turn at all at low PWM.
- **Applying calibration numbers to another robot or to a flat battery.** OLU_PWM and V_MAX belong to a particular robot, floor and battery.
- **Forgetting the line ending setting or leaving out a break in a switch.** The command is never processed, or it falls through to the next case.
- **Letting an invalid command renew the watchdog too.** Noise could keep the robot driving forever.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Calculate by hand: for vL = 0.15 and vR = 0.25 m/s, what are v, ω and R? Then find the wheel speeds again for the same ω and v with the inverse formula.
4. Measure the dead zone and the maximum speed for your own robot (or the robot in the simulation); ask for 15 cm/s with hizdanPwm and compare the real speed with a stopwatch.
5. Change the 700 ms watchdog to 300 ms and send the commands at 400 ms intervals; write in one sentence what happens and why.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson where you fall short.

### Project assessment rubric (Command-driven car)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Driving | One of the commands goes in the wrong direction | W, S, A, D, X work correctly | Calculates the angle of a turn on the spot and sets it with time (ω = 2v / L) |
| Calibration | Thinks PWM is speed | cm/s commands give roughly the right speed with hizdanPwm | Has measured their own OLU_PWM and V_MAX values and shows them |
| Safety | No watchdog, or the robot moves at start-up | The 700 ms watchdog works and the robot is stopped at start-up | Has tested that an invalid command does not renew the watchdog and has justified the choice of time |
| Measurement | The stopping distance has not been measured | The distance after the watchdog has been measured and compared with speed × time | Has measured at different speeds and times and interpreted the difference |
| Explaining | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made, how they found it and how they fixed it |

### Note for parents and teachers
- **Aim.** This week is about understanding how the robot moves with maths and gaining the first safety thinking (what happens if control is lost?). Making mistakes is safe: the portal is completely virtual.
- **How to help.** Instead of giving the answer, ask: "Which wheel is faster?", "Are the units metres or centimetres?", "If the commands stop, what does the robot do?"
- **Time.** One lesson is mainly calculation, one is mainly hardware and one is mainly measurement; spacing the lessons out instead of doing them one after another on the same day helps the learning stick.
- **Safety.** Everything on this platform is virtual. If you move on to a real robot, you need to test with the wheels in the air, use a separate battery, never connect the battery the wrong way round and never short it; no circuit is ever built with mains voltage (220 V). On a real robot, the stopping distance is not considered safe until it has been measured.
- **Difference from reality.** The simulation gives clean results; on a real robot the motors do not turn at the same speed, the wheels slip and wireless links have delays.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; saved only if consent has been given).
