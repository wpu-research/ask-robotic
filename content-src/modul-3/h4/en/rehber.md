### Goals for the week
By the end of this week, the learner:
1. Can explain PWM and work out the duty cycle and average voltage from an `analogWrite` value; can set an LED's brightness from 0 to 255.
2. Can connect a common cathode RGB LED and show any colour they like with three values (R, G, B).
3. Can play notes and melodies with a passive buzzer using `tone`; can state how frequency and octaves are related.
4. Can write their own functions with parameters and return values; can explain the difference between local and global variables.
5. Starting from a plan table, can build the light-up music box that combines light, sound and input.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | PWM and analogWrite: the breathing LED | ~22 min | Read the explainer, run the brightness steps and the breathing program, set the brightness with a potentiometer, do the mini quiz. |
| 2 | The RGB LED and mixing colours | ~25 min | Wire up the three channels, try the colour palette and the rainbow fade, send a colour from the Serial Monitor. |
| 3 | The buzzer: tone and note frequencies | ~22 min | Connect the passive buzzer, play the note La, the scale and the octave, observe the D11 clash. |
| 4 | Functions, scope and parameters | ~25 min | Write your own functions, play the melody with functions, watch scope on the Serial Monitor. |
| 5 | Project: The light-up music box | ~35 min | Write the plan as a state table, build the circuit, run the program, assess it with the project rubric. |

### Prerequisite check
This week needs the following from earlier weeks. Check them before you start:
- `delay`, the `for` loop and arrays (Week 1).
- Reading a button with `INPUT_PULLUP`, `if`/`else` and `switch` (Week 2).
- Reading a number from the Serial Monitor, `parseInt` (Week 2).
- `analogRead`, `map` and `constrain` (Week 3).
- The series resistor for an LED and Ohm's law (Week 1).

### Concept map
- **Output control:** `digitalWrite` (only 0/5 V) → PWM → `analogWrite` (0-255) → duty cycle → average voltage
- **Light:** LED brightness → RGB LED (R, G, B) → additive mixing → common cathode and common anode
- **Sound:** vibration → frequency (Hz) → octave → active and passive buzzer → `tone`/`noTone` → Timer2 clash (D3, D11)
- **Program structure:** function → parameter → `return` → local and global scope
- **Project:** state table → splitting into functions → tempo and beat length → the limit of `delay`

### Common mistakes
- **Giving `analogWrite` 0-1023.** The expected range is 0-255; use `map`.
- **Using `analogWrite` on a pin without PWM.** Only D3, D5, D6, D9, D10 and D11 (`~`) do PWM.
- **Connecting the RGB LED's COM leg wrongly.** With a common cathode, COM goes to GND; with a common anode it goes to 5V and the values are written the other way round.
- **Using a single resistor for all three colours.** Each channel must have its own resistor.
- **Playing notes with an active buzzer.** An active buzzer always gives the same pitch; for notes you need the passive type.
- **Not putting a `delay` between notes.** `tone` does not wait; only the last note is heard.
- **Setting brightness on D3 or D11 while `tone` is playing.** PWM on these pins breaks; connect dimmable LEDs to D9 and D10.
- **Defining a function and never calling it**, or **using a local variable in another function.**
- **Forgetting `break;` in a `switch`.** The colours get mixed up.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Re-read the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Work out the duty cycle and average voltage by hand for `analogWrite(9, 64)`, `analogWrite(9, 128)` and `analogWrite(9, 192)`; compare the brightness in the lab.
4. Without looking, write a Do-Re-Mi melody with the `notaCal(frekans, süre)` function (play note, with frequency and duration).
5. Answer this in your own words: "Why can we not set the brightness of an LED on D11 while `tone` is playing?"

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. The target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (The light-up music box)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | The buzzer, RGB LED, button or pot is missing; the channels have no resistors | All parts are on the right pins and each channel has its own resistor | The wiring is tidy; explains why the blue channel is on D11 |
| Plan | No state table | The waiting, playing and end states are in the table | The table matches the code exactly and a function tree has been drawn |
| Program | The melody does not play or the colours are wrong | The button starts the melody, the notes light up in the right colours, the waiting breath works | A new note/colour (Si, high Do) or an ending effect has been added |
| Functions | Everything is inside `loop()` | The work is split into meaningful functions | Parameters and `return` are used where they fit, with few global variables |
| Tempo | The tempo is fixed or the pot has no effect | The pot changes the tempo between 80 and 200 bpm | Works out the tempo through the beat length and explains it |
| Explanation | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made and how they found it; states the limit of `delay` |

### Note for parents and teachers
- **Aim.** This week is not about "memorising" a part, but about trying to manage light, sound and input together. For the first time, the learner writes their own commands (functions); this is the foundation for the big projects in the weeks ahead.
- **How to help.** When the learner gets stuck, instead of giving the answer, ask these questions: "What is connected to which pin?", "What range should this value be in?", "Which function might not be getting called?", "Where does the sound stop, and where does the light change?"
- **Sound.** To hear the sound in the lab, the sound button must be switched on. When working with a real buzzer, playing a loud, continuous sound for a long time can be annoying; short tests are enough.
- **Light.** Looking straight at a bright LED for a long time tires the eyes; in a real circuit you can soften it with a piece of paper if needed.
- **Time.** The project lesson may take close to 35 minutes; if needed, split it into two sessions. Circuit first, then the program.
- **Safety.** Everything on this platform is virtual. If the lessons move on to a real board, no circuit is ever built with mains voltage (220 V).
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).
