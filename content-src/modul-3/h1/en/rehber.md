### Goals for the week
By the end of this week, the learner can:
1. Say what a microcontroller is and name the pins on the Arduino Uno (digital, analogue, 5V, GND).
2. Calculate voltage, current and resistance with Ohm's law (V = I × R), and explain why an LED needs a series resistor.
3. Write a program that makes an LED blink using `setup()`, `loop()`, `pinMode`, `digitalWrite` and `delay`.
4. Drive several LEDs with a `for` loop and an array.
5. Build a traffic light with three LEDs, starting from a plan table.

### Plan for the week
The week has five lessons; each lesson takes about 20-30 minutes. The plan below is for one lesson a day. Those who want a busier schedule can combine two lessons.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | What is a microcontroller? | ~20 min | Read the explainer, get to know the Uno in the lab, light the built-in L LED, do the mini test. |
| 2 | Electricity: V, I, R and Ohm's law | ~20 min | Do the calculations by hand, read the current with virtual measurement, compare it with the calculation. |
| 3 | First program: Blink | ~20 min | Build the first circuit, run the program, change the waiting times. |
| 4 | Several LEDs, the for loop and arrays | ~25 min | Build four LEDs, try the loop and array versions. |
| 5 | Project: Traffic light | ~30 min | Write the plan in a table, build the circuit, write the program, assess it with the project rubric. |

### Prerequisite check
No special prior knowledge is needed this week. Before you start, check these:
- Does the circuit lab open in the browser? (From the menu, "Circuit lab")
- Is the learner comfortable with the four operations and decimal numbers? (Ohm's law involves division and multiplication.)
- Are there any difficulties with drawing wires and selecting parts with the mouse?

### Concept map
- **Hardware:** microcontroller → Arduino Uno → pins (digital, analogue) → 5V and GND
- **Electricity:** voltage, current, resistance → Ohm's law → series resistor for an LED → closed circuit
- **Program:** sketch → `setup()` and `loop()` → `pinMode`, `digitalWrite`, `delay` → `for` and arrays
- **Project:** plan table → stages → switch off-switch on-wait pattern → round time

### Common mistakes
- **Mixing up mA and A.** 20 mA = 0.02 A. Convert to amperes before calculating.
- **Connecting an LED without a resistor.** The current is not limited; the lab gives a warning.
- **Connecting the LED the wrong way round or forgetting GND.** The circuit is not closed and the LED does not light up.
- **Forgetting `pinMode`.** The LED glows very dimly or not at all.
- **Forgetting the semicolon.** The compiler says "expected ';'". Reading the error message is half of the solution.
- **Thinking the `delay` time is in seconds.** `delay(5)` is 5 milliseconds.
- **Counting from 1 in an array.** The first element is `ledler[0]`; in a 4-element array, `ledler[4]` goes past the end of the array.
- **Not switching off the previous stage's LED.** In the traffic light, two LEDs are on together.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Reread the explanations for the questions you got wrong in the mini tests, then answer the question again.
3. Write the Blink program from scratch without looking; then change the waiting times.
4. Calculate how the current changes when 1 kΩ and 150 Ω are used instead of 330 Ω for the red LED, and measure it in the lab.
5. Answer this question in your own words: "What does the resistor in front of the LED do?"

The mini tests of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that is still weak.

### Project rubric (Traffic light)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | One of the LEDs does not light up or has no resistor | Three LEDs connected with their own resistors and the right way round | Colours chosen correctly, tidy connections |
| Plan | No table | There is a table of stages, LEDs and times | The table matches the code exactly and is explained |
| Program | More than one LED is on at the same time, or the program does not work | Three stages in the right order with a single LED on | An improvement has been added, such as a red-yellow warning stage |
| Timing | Wrong times (for example delay(5)) | The times match the table | Changes the times and explains the effect |
| Explanation | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made and how they found it |

### Note for parents and teachers
- **Aim.** This week is not about making the learner "memorise" something; it is about getting used to building circuits and seeing a first working program. Making mistakes is safe in the lab; a burnt-out LED or a short circuit is virtual and is reset with ↺.
- **How can you help?** When the learner gets stuck, instead of giving the answer, ask these questions: "Where does the current go in and where does it come out?", "What does the error message say?", "Which pins did you connect, and which one did you write in the code?"
- **Time.** Spreading the lessons out, rather than doing them back to back on the same day, helps learning stick. A short review between lessons is enough.
- **Safety.** Everything on this platform is virtual. If the lessons move on to using a real board, no circuit is ever built with mains voltage (220 V).
- **Progress.** The results of the mini test at the end of each lesson appear by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).
