### Week goals
By the end of this week, the learner:
1. Can explain why a program that uses `delay()` cannot check a button or do any other job (blocking).
2. Can do timing without waiting using `millis()` and the pattern `simdi - son >= aralik`, and knows about `unsigned long` overflow.
3. Can draw a job as states and transitions and write a state machine that uses `enum` and `switch`.
4. Can set up `attachInterrupt` on pins D2 and D3, and can say why the ISR is kept short and why `volatile` is used.
5. Can combine several tasks (LED, buzzer, two buttons) on one panel without `delay`.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The delay trap | ~20 min | Read the explainer, press the button briefly in the `delay` program, see the missed presses, do the mini test. |
| 2 | Non-blocking code with millis() | ~25 min | Write the same job with `millis`, blink two LEDs at independent speeds, work out the overflow example. |
| 3 | State machines (FSM) | ~25 min | Draw the traffic light states on paper, then code them with `switch`, try the button mode. |
| 4 | Interrupts and timers | ~30 min | Set up an interrupt on D2, see the difference between `CHANGE` and `FALLING`, work out the timer interval. |
| 5 | Project: Multitasking panel | ~35 min | Write the task table, build the circuit, run the panel, assess it with the project rubric. |

### Prerequisite check
Before you start, check the following:
- Can they read a button with `INPUT_PULLUP`? Do they know the pressed = LOW rule? (Lesson 6)
- Can they write `if`, `else` and `switch`? (Lesson 7)
- Do they know how to detect the edge of a button press (a new press)? (Lesson 8)
- Can they make a buzzer sound with `tone()` and `noTone()`? (Lesson 18)
- Can they define and call a function? (Lesson 19)

### Concept map
- **Problem:** `delay` blocks → events between look moments are missed
- **Solution 1:** `millis()` → `simdi - son >= aralik` → each job has its own `son` variable → `unsigned long` and overflow
- **Solution 2:** state machine → `enum` + `switch` + `break` → transition by time or by event
- **Solution 3:** interrupt → `attachInterrupt` (D2, D3) → short ISR → `volatile` → flag; timer interrupt
- **Project:** task table → modes → interrupt + `millis` + FSM together → timeout safety

### Common mistakes
- **Leaving a `delay` in `loop()`.** All the benefit is lost; the other tasks start waiting too.
- **Checking the time by adding.** `simdi >= son + aralik` breaks at overflow; write `simdi - son >= aralik`.
- **Using `int` for a time variable.** An `int` overflows in about 32.8 seconds; use `unsigned long`.
- **Giving all jobs one shared `son` variable.** The jobs spoil each other's timing.
- **Forgetting `break;` at the end of a `case`.** The program also runs the code of the state below.
- **Not writing `durumBasi = simdi;` when the state changes.** The new state ends at once.
- **Counting a button that is held down in every round.** Use edge detection (`basili && !oncekiBasili`).
- **Doing `delay`, `Serial.print` or a long job inside the ISR.** Keep the ISR short and let `loop()` do the work.
- **Not writing `volatile`.** The shared variable may not look up to date in `loop()`.
- **Trying an interrupt on a pin other than D2/D3.** On the Uno, external interrupts are only on these two pins.
- **Not resetting the counters when the mode changes.** The first blink of the new mode comes at the wrong time.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read the explanations for the mini test questions you got wrong, then answer them again.
3. Write Blink from scratch without looking, using `millis` instead of `delay`; then change the interval.
4. Draw the state diagram for a device of your choice (for example a microwave oven) on paper: states, events, transitions.
5. Work out the interrupt interval for the timer with prescaler 256 and `OCR1A = 12499`.
6. Answer this question in your own words: "When would I choose an interrupt and when `millis`?"

The mini tests of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Goal: at least 4 correct in every lesson. Go back to the explainer of any lesson where you fall short.

### Project rubric (Multitasking panel)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | One of the LEDs, the buzzer or the buttons is not connected or is on the wrong pin | LEDs have resistors, the buzzer is on D8, the buttons are correctly connected to D2 and D3 | The wiring is tidy; colours and types (passive buzzer) are chosen on purpose |
| Plan | No task table | There is a table of tasks, triggers and variables | The table matches the code one to one and the interrupt/polling choice is justified |
| Timing | There is a `delay` in the code or the tasks make each other wait | No `delay` at all; the LED and buzzer timings match the table | Timings are changed and the effect is explained; overflow safety (subtraction) is used on purpose |
| Interrupt and state | The mode change does not work or there is a long job in the ISR | The interrupt + flag and the mode state machine work correctly | The bounce guard, `volatile` and counter resets are explained with reasons; a new mode has been added |
| Explanation | Cannot explain what they did | Explains the tasks and modes step by step | Explains a mistake they made and how they found it (for example a missed press) |

### Note for parents and teachers
- **Aim.** This week is about understanding how a single processor runs several jobs. The hardest idea is "asking the time without waiting"; at first the learner may want to go back to `delay`. The missed-press experience in lesson 26 is the reason for making this switch.
- **How to help?** Instead of giving the answer, ask: "While this line runs, which other job is waiting?", "When was the last change written?", "Is this function called from the interrupt or from `loop()`?" Having them draw the state diagram on paper first prevents most confusion.
- **Time.** The interrupts and timers lesson (29) is dense; learners are not expected to understand the Timer1 code line by line; the idea (counter, match, interrupt) is enough.
- **Safety.** Everything on the platform is virtual. The timeout example in lesson 30 shows why moving to a safe state matters for outputs such as motors and relays. On real hardware a motor is not driven straight from an Uno pin, and no circuit is ever built with mains voltage.
- **Progress.** Mini test results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent was given).
