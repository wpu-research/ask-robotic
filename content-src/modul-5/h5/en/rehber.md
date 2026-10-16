### Week goals
By the end of this week the learner can:
1. Explain the ideas of error, setpoint and control output; work out a position from the line array and steer with P control (`u = Kp x e`).
2. Explain how the D term damps overshoot, why unfiltered D is harmful with a noisy measurement, and how to filter the derivative.
3. Explain that P control leaves a steady-state error, that the integral closes it, and what windup and anti-windup are.
4. Tune PID in order (P first, then D, I last); work out k, tau and theta from a step response and find Kc and Ti with SIMC.
5. Compare PID and bang-bang by measuring them under the same conditions, and interpret the result honestly.

### The week's plan
The week has five lessons; each lesson is 30-40 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | P: proportional control | ~30 min | Work out the position, run the P-controlled line follower, change Kp and watch its effect, solve the mini quiz. |
| 2 | D: derivative and noise | ~30 min | Change Kd in the wall follower, compare filtered and unfiltered D, solve the quiz. |
| 3 | I: integral and windup | ~35 min | Measure the effect of Ki on the robot with a weak motor, switch anti-windup on and off, solve the quiz. |
| 4 | PID tuning: by hand and SIMC | ~40 min | Record the step response, work out k, tau and theta, write the SIMC values into the sketch. |
| 5 | Final project: PID line follower and wall follower | ~35 min | Run PID and bang-bang on the same track, tune the wall follower, assess with the project rubric. |

### Prerequisite check
Before you start, check these:
- Have weeks 1-4 been completed? In particular, two-wheel driving (PWM and direction pins), bang-bang line following, the HC-SR04 with a servo and measuring speed with an encoder are needed.
- Can the learner write a fixed-period loop with `millis()`? (Module 3, lesson 27)
- Do they remember the idea of interrupts and `volatile`? (Module 3, lesson 29) Speed measurement uses it.
- Are they comfortable with decimal numbers and simple ratio calculations? The formulas are nothing more than multiplication and division.

### Concept map
- **Basics:** setpoint → measurement → error (`e = ayar - ölçüm`, setpoint minus measurement) → control output (`u`) → motors
- **P:** `u = Kp x e` → Kp too small: loses the line; Kp too large: jitters and overshoots → steady-state error
- **D:** rate of change of the error → damping → fake speed with noise → derivative filter (`ALFA`)
- **I:** accumulation of the error → closes the steady-state error → output saturation → windup → anti-windup (limiting, stopping when saturated)
- **Tuning:** by hand (P, D, I order) · Ziegler-Nichols (Ku, Pu; risky) · SIMC (step response → k, tau, theta → Kc, Ti)
- **Project:** line and wall share the same skeleton → separate gains → a fair comparison of PID and bang-bang

### Common mistakes
- **Mixing up the signs in the wheel formula.** If `TABAN - u` and `TABAN + u` swap places, the robot turns away from the line.
- **Defining the sign of the error the wrong way round.** In wall following it must be `e = mesafe - HEDEF`.
- **Making Kp very large in one go.** Start small, double it each time and measure.
- **Forgetting to divide or multiply by `dt`.** The derivative is divided by `dt`, the integral is multiplied by `dt`.
- **Not updating or not initialising `sonHata`.** The first derivative jumps, or the error keeps growing.
- **Using unfiltered D with a noisy measurement.** The motor jitters.
- **Never limiting the integral.** When the output saturates, windup happens.
- **Putting `delay()` inside `loop()`.** The fixed control period breaks.
- **Pushing Z-N on real hardware all the way to the stability limit.** A step test is safer.
- **Deciding between PID and bang-bang from a single run.** Do at least two runs under the same conditions.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations of the quiz questions you got wrong again, then solve the question again.
3. Write the formula `u = Kp x e + Ki x integral + Kd x turev` without looking, and say in one sentence what each term does.
4. Work out k, tau and theta from a step test by hand and put them into the SIMC formula.
5. Answer this question in your own words: "In which situation does bang-bang make more sense than PID?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct from each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (PID line follower and wall follower)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Line following | The robot loses the line | Finishes the track with PID | Explains the choice of Kp, Kd and Ki based on measurements |
| Wall following | Hits the wall or keeps staying far from the target | Stays within the ±2 cm band after the start | Measures and chooses Kd and the filter, compares with P alone |
| Tuning method | Tries values at random | Follows the order P first, then D, then I | Works out the tuning values with a step test or SIMC |
| Comparison | Looks at a single run | Runs PID and bang-bang on the same track and with the same TABAN | Measures in at least two runs and interprets honestly (who is ahead on which track) |
| Explanation | Cannot explain what they did | Says what each term does | Explains a mistake they made and how they found it, and traps such as windup |

### Note for parents and teachers
- **Purpose.** This week is not about memorising formulas, but about building the habit of "measure, change, measure again". The results in the lessons are simulation measurements; the learner should take it as normal that the numbers come out differently on their own robot.
- **How to help.** When the learner gets stuck, instead of giving the answer, ask these questions: "What is the sign of the error?", "Is the robot overshooting the target, or never reaching it?", "Which number did you change, and did you change it on its own?"
- **Time.** The lessons are dense. Working with breaks, rather than doing several lessons on the same day, helps learning stick.
- **Safety.** On a real robot, external power and a common GND are used for the motors, and the battery is never short-circuited or connected the wrong way round. Do not run the robot on the edge of a table. Do not hold the robot in your hand and let it go while the integral is switched on; the robot may shoot off. No circuit is ever built with mains voltage (220 V).
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).
