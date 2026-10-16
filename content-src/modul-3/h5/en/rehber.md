### Goals for the week
By the end of this week, the learner:
1. Can move a servo to any angle with the `Servo` library; can explain that the angle is given by the pulse width.
2. Can say why an Arduino pin cannot drive a motor directly; can switch a motor with an NPN transistor or a logic-level MOSFET and work out the base current.
3. Knows what a flyback diode does and connects it the right way round.
4. Can control a motor's direction (IN1, IN2) and speed (EN, PWM) with the L293D.
5. Can explain a relay module's COM, NO and NC terminals and its active-LOW logic; can write a threshold decision with hysteresis; knows never to try a relay with mains voltage.
6. Can plan and build a system that manages a fan and a servo according to the temperature.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Servo: angle control | ~20 min | Read the explainer, try the three sketches, change the sweep speed, do the mini quiz. |
| 2 | Switching with a transistor and a MOSFET, DC motor | ~25 min | Build the circuit, work out the base current, delete the diode and see the warning, do the mini quiz. |
| 3 | H-bridge L293D: direction and speed | ~25 min | Build the circuit, test the direction table, try driving with two buttons. |
| 4 | Relay: high-current switching and safety | ~20 min | Read the safety section, set Trigger to LOW, try the button and threshold sketches. |
| 5 | Project: temperature-controlled automatic fan and servo scanner | ~35 min | Write the plan, build the circuit, test it by changing the temperature, assess it with the rubric. |

### Prerequisite check
Before you start, check the following:
- Can they use `analogRead`, `map` and `analogWrite` (PWM)? (Lessons 11, 14, 16)
- Can they write `if/else`, `for` and a function? (Lessons 4, 7, 19)
- Can they read a button with `INPUT_PULLUP`? (Lesson 6)
- Have they seen the temperature calculation with an NTC? (Lesson 13; needed in the project lesson)
- Can they work out current with Ohm's law? (Lesson 2)

### Concept map
- **Movement:** servo (angle, pulse width) → DC motor (speed) → direction (H-bridge)
- **Passing on power:** pin → base resistor → NPN / MOSFET → motor → flyback diode
- **Direction and speed:** L293D → IN1, IN2 (direction) → EN (PWM speed) → VCC1 logic, VCC2 motor
- **Separate circuit:** relay → COM, NO, NC → active-LOW → hysteresis → safety
- **Project:** NTC measurement → decision with hysteresis → fan speed with map → servo sweep

### Common mistakes
- **Forgetting `attach`.** The servo does not move at all.
- **Expecting PWM from D9 and D10 with a servo.** The Servo library switches off `analogWrite` on these two pins.
- **Connecting a motor directly to a pin.** The pin's current limit is exceeded; use a transistor or a driver.
- **Skipping the base resistor or the flyback diode.** The lab gives a warning; in real life the part fails.
- **Connecting the diode the wrong way round.** The striped end (the cathode) must face the motor's plus side.
- **Forgetting VCC1, VCC2, GND or EN on the L293D.** The outputs float and the motor does not turn.
- **Making IN1 and IN2 the same.** The motor stops.
- **Getting the relay logic backwards.** An active-LOW module is energised by LOW.
- **Using a single threshold.** The relay and the fan chatter around the threshold; add hysteresis.
- **Trying a relay with mains voltage.** It can kill; only a trained specialist may do it.

### End-of-week review
1. Look at each lesson's concept cards and read the "common mistake" lines out loud.
2. Re-read the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. For the servo, move the angle to 45 degrees and work out the pulse width (≈ 1008 µs).
4. For the NPN circuit, work out the base current with 1 kΩ and with 2.2 kΩ and compare them.
5. Answer this question in your own words: "Why do we not connect a motor directly to a pin, and what does a flyback diode do?"
6. Write the project program again without looking; change the thresholds and write down the effect.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. The target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Automatic fan and servo scanner)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The fan is directly on a pin, or the diode/base resistor is missing; the lab gives a warning | The transistor, base resistor, flyback diode and servo are connected correctly, no warnings | The wiring is tidy; explains why each part is there |
| Decision | A single threshold; the fan chatters at the threshold | The hysteresis of on at 30 °C, off at 28 °C works | Chooses their own thresholds, tests them with the temperature property and explains why |
| Speed | The fan is only on/off | The speed rises with temperature using `map` | Explains why the lower limit (90) is there and tries out the range themselves |
| Servo | The servo does not move or moves to the wrong angle | Sweeps 30-150 while the fan is on, parks at 90 when it is cool | Adjusts the sweep range and speed |
| Explanation | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made and how they found it; adds an improvement (such as UYARI) |

### Note for parents and teachers
- **Aim.** This week the learner sees code creating movement in the physical world. An important distinction: information (the pin) and power (the motor supply) travel along separate paths.
- **How to help.** When the learner gets stuck, instead of giving the answer, ask: "Where does the current go in and where does it come out?", "Which warning is the lab giving?", "Which pin are you driving, and where does the power come from?"
- **Safety.** Everything on the platform is virtual. If you move on to real parts, powering a motor from the Arduino's 5V pin can reset the board; you use a separate supply and join the GNDs. In the relay lesson, no experiment is ever done with mains voltage (220 V); this job belongs only to a trained specialist.
- **Time.** Spreading the lessons over several days helps the learning stick.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).
