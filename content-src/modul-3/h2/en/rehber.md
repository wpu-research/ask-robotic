### Goals for the week
By the end of this week, the learner:
1. Can make a pin an input with `INPUT_PULLUP`, read it with `digitalRead` and explain the "pressed = LOW" logic.
2. Can make the program decide with `if`, `else if`, `else` and `switch`; knows the difference between `==` and `=`.
3. Can combine several conditions with `&&`, `||` and `!`.
4. Can explain button bounce and edge detection; can program "one press, one action" behaviour.
5. Can talk to the board with `Serial.print`, `Serial.println`, `Serial.available`, `Serial.read` and `Serial.parseInt`.
6. Can build the doorbell and press counter project, starting from a plan table.

### Plan for the week
The week has five lessons; each lesson takes about 20-35 minutes. The plan below is for one lesson a day. This week often goes back to the Blink and LED connections from week 1.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | digitalRead, buttons, INPUT_PULLUP | ~20 min | Read the explainer, connect the button between D2 and GND, light the LED with the button, try the `1 - durum` trick. |
| 2 | if/else, switch, logic operators | ~22 min | Try the `&&`, `\|\|` and `!` program with two buttons, add `case 0` to the `switch` program. |
| 3 | Debounce and edge detection | ~25 min | Catch the falling edge, check that the LED changes once when you hold the button, play with the waiting time. |
| 4 | Serial monitor: print, read, parse | ~25 min | Print the button state, control the LED remotely with the `A` and `K` commands, blink it with the `B3` command. |
| 5 | Project: Doorbell and press counter | ~35 min | Write the plan in a table, build the circuit, run the program, try the `S` and `R` commands, assess with the rubric. |

### Prerequisite check
This week needs what was learnt in week 1. Before you start, check these:
- Can they switch an LED on and off with `setup()`, `loop()`, `pinMode`, `digitalWrite` and `delay`? (Week 1, lesson 3)
- Can they say why an LED needs a series resistor? (Week 1, lesson 2)
- Can they drive a group of LEDs with a `for` loop and arrays? (Week 1, lesson 4)
- Do they know how to add parts and draw wires in the lab, and how to change the button's "Pressed" property?

If anything is missing, go back to the matching week 1 explainer.

### Concept map
- **Input:** pin → `INPUT_PULLUP` → the floating input problem → `digitalRead` → pressed = LOW
- **Decision:** condition → `if` / `else if` / `else` → the difference between `==` and `=` → `switch`, `case`, `break`
- **Logic:** `bool` → `&&`, `||`, `!` → truth table
- **Time and events:** bounce → level and edge → previous state variable → debounce
- **Communication:** `Serial.begin` and baud → `print` / `println` → `available` / `read` → `parseInt`
- **Project:** plan table → state variables (`sayac`, `onceki`) → `sayac++` → silent mode

### Common mistakes
- **Writing `INPUT` instead of `INPUT_PULLUP`.** The pin floats and the reading is random.
- **Thinking pressed = HIGH.** With `INPUT_PULLUP`, pressed is LOW.
- **Writing `=` instead of `==`.** The condition `if (durum = LOW)` is always false and the program quietly does the wrong thing.
- **Forgetting `break` inside `switch`.** The program falls through into the code of the next `case` too.
- **Forgetting the `onceki = simdi;` line.** The board sees the same edge again on every pass.
- **Using the level instead of the edge.** When the button is held down, the counter or the LED keeps changing.
- **Writing `"A"` or `'a'` instead of `'A'`.** Single and double quotes are different; capital and small letters are different too.
- **Reading the number with `read()`.** You get the character code, not the value of the digit; use `parseInt()`.
- **Defining the counter inside `loop()`.** It goes back to 0 on every pass and never goes up.

### End-of-week review
1. Look at the concept cards of every lesson once more and read the "common mistake" lines out loud.
2. Re-read the explanations of the mini-test questions you got wrong, then solve the question again.
3. Build a circuit with two buttons and make your own truth table for `&&`, `||` and `!`; check the result in the lab.
4. Write the debounced on-off program from scratch without looking. Then write the version that flips "on release".
5. Answer this question in your own words: "What is the difference between a level and an edge, and which one does a counter need?"

The mini tests of the five lessons are enough as the end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct from each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Doorbell and press counter)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | Button or buzzer connected wrongly, GND missing | Bell button D2-GND, LED with resistor, active buzzer D8-GND correct | The optional mute button is connected too, and neatly |
| Plan | No table | There is a table showing the jobs and which lesson each comes from | The table matches the code exactly and is explained |
| Press counting | The counter goes up wrongly when the button is held or bounces | Every press is counted exactly once | Explains edge detection and debounce in their own words |
| Serial communication | Prints nothing | Prints `Zil: N`, the `S` and `R` commands work | Adds a new command (for example `T`) |
| Explanation | Cannot explain what they did | Explains the circuit and the code step by step | Explains a mistake they made and how they found it |

### Note for parents and teachers
- **Aim.** This week the board "hears" the outside world. Learners get most confused by the questions "why LOW when pressed?" and "why can one press be counted more than once?"; this is normal and instructive.
- **How to help.** Instead of giving the answer, ask: "How many volts is the pin when you are not pressing the button?", "Where does the code store the previous state?", "What do you see in the serial monitor?" The serial monitor is the best way to see with your own eyes what is happening.
- **Bounce.** The button in the lab gives a clean signal; the learner may not see bounce on the screen. Debounce still needs to be learnt, because the problem will appear when they move to a real button.
- **Time.** Spreading the lessons out rather than doing them back to back on the same day helps learning stick. The debounce and serial communication lessons are dense; if needed, do only one of them in a day.
- **Safety.** Everything on this platform is virtual. If a real board is used, buttons are connected only to low-voltage lines; no circuit is ever built with mains voltage (220 V).
- **Progress.** The mini-test results at the end of each lesson appear skill by skill on the "My progress" page (draft/pilot feature; recorded only if consent has been given).
