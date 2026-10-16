### Goals for the week
By the end of this week, the learner:
1. Can tell apart which real-world effects the lab models (ADC step, timing, sensor supply thresholds) and which it does not (noise, button bounce, 5V collapse).
2. Can say that one ADC step is about 4.89 mV; can get a steady decision out of a noisy reading with averaging and hysteresis.
3. Can fix button bounce with a steady time (debouncing), and a press missed because of `delay()` with `millis()`.
4. Knows that analogue sensor numbers drift when the supply changes, can do a two-point calibration with `map` and `constrain`, and can leave the output on the safe side when a sensor stays silent.
5. Can look for a fault from the bottom up (physical, address, identity, data); can catch a corrupted frame with an XOR checksum.
6. Can build the Smart room project by combining the PIR, LDR, DHT22, relay, LCD and button in a single state machine.

### Plan for the week
The week has five lessons; each lesson takes about 30-35 minutes. The plan below is for one lesson a day. This week the places where the lab "tells lies" are taught on purpose; ask the learner the question "did you see it in the lab, or did we imitate it in code?".

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The lab is perfect: ADC steps and noise | ~30 min | Read the table of modelled and unmodelled effects, try the ADC step and the fake noise, compare a single threshold with hysteresis. |
| 2 | Button bounce and response delay | ~30 min | Run the bouncing counter and the debouncing, compare the response of the `delay` and `millis` versions. |
| 3 | Supply drop and calibration | ~30 min | Calibrate soil moisture with two points, move VCC to 3V3, read the pin load with the virtual meter, produce the `YOK` case. |
| 4 | A debugging case: "ping works but there is no data" | ~30 min | Run the four-layer test, produce the failure modes one by one, check the XOR frame by hand. |
| 5 | Final project: Smart room | ~35 min | Build the circuit, upload the program, carry out the "Testing from end to end" steps in order, assess it with the project rubric. |

### Prerequisite check
This week needs knowledge from Module 3 and the first seven weeks of Module 4. Check before you start:
- Are `analogRead`, `map`, `constrain` and smoothing (lessons 11 and 14) known?
- Are the button, `INPUT_PULLUP` and debouncing (lessons 6 and 8) known?
- Can they write non-blocking code with `millis()` and a state machine (lessons 27 and 28)?
- Have the PIR, DHT22, LDR and relay each been used on their own (Weeks 2-4 and lesson 24)? The project combines all of them.
- Do they remember how to use I2C and the LCD (lessons 32 and 33)?

### Concept map
- **Limits:** what the lab models → ADC step, timing, sensor supply threshold → what it does not model → noise, bounce, 5V collapse, reference drift
- **Against noise:** averaging (square root of N) → hysteresis (two thresholds) → a band wider than the noise
- **Against time:** bounce → steady time (debouncing) → the `delay` trap → `millis()`
- **Against power:** AO = VCC x ratio → calibration tied to conditions → `map` + `constrain` → pin internal resistance → brown-out → fail-safe
- **Against faults:** physical → address → identity → data sensibility → XOR checksum
- **Project:** input → state → output → ISINMA / BOS / DOLU / KAPALI → two hystereses → safe default

### Common mistakes
- **Saying "there was no problem in the lab, so there will be none in reality".** Noise, bounce and power collapse do not exist in the lab.
- **Choosing a hysteresis band narrower than the noise.** The flicker comes back.
- **Making the average needlessly large.** 64 readings are 64 times the work; the gain grows with the square root.
- **Forgetting the release bounce when debouncing.** The wait must work in both directions.
- **Choosing a steady time that is too long.** Fast presses are missed.
- **Expecting the button to be listened to during `delay()`.** A short press falls between two readings.
- **Forgetting `constrain`.** The calibrated percentage goes below 0 or above 100.
- **Using a calibration with a different supply.** The AO voltage is in proportion to VCC.
- **Taking it as "distance 0" when `pulseIn` returns 0.** There is no answer; leave the output on the safe side.
- **Counting an answer at the address as "the device is right".** The identity and data layers are tested separately.
- **Powering the fan from the board's 5V pin.** In a real circuit the board can reset; the lab does not show this.
- **Not taking the PIR warm-up into account in the smart room.** At start-up the room is thought to be occupied.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Write the effects the lab models and does not model in a table, in your own words; add to each row the measure you will use in a real circuit.
4. Do the calculation by hand: how many mV is an ADC step? On a soil moisture module powered with 3V3, what is the raw value when the moisture is 0.5?
5. Draw three states of the smart room program on paper and write the condition on each arrow.

The mini quizzes of the five lessons are enough as an end-of-week test; 5 questions per lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Smart room)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | Some parts are not connected, or the pins are mixed up | All parts connected correctly according to the table | Tidy connections, and the job of each part is explained |
| State machine | No states, scattered flags | The ISINMA, BOS, DOLU and KAPALI states change correctly | The states match the table and the code exactly; a new state has been added |
| Thresholds | A single threshold; the lamp or fan flickers | The light and the fan decide with hysteresis | The thresholds were chosen by trying, and the reasons are explained |
| Safe behaviour | The fan stays on when the DHT fails | When the DHT fails, the fan is off and the LCD shows the error | Other sensor failures are handled too |
| Timing | Uses `delay`; the button and the PIR react late | Every job at its own time with `millis()` | The times and the DHT interval were chosen with reasons |
| Real-world difference | Does not mention the lab difference | Mentions the noise, bounce and power differences | Writes a calibration and precautions list for a real circuit |

### Note for parents and teachers
- **Aim.** No new sensor is learnt this week; the aim is for the learner to question how much evidence is behind the word "it works". Knowing the limits of the lab is the most important preparation for moving to a real circuit.
- **How to help.** Instead of giving the learner the answer, ask: "Did the lab really produce this, or did we imitate it?", "Which layer are you looking for this fault in?", "If the sensor does not answer, what should the output be?"
- **Time.** The lessons are full (30-35 min). Spacing them out, instead of doing two lessons on the same day, helps the learning stick.
- **Safety.** Everything on this platform is virtual. If the lesson is repeated with a real board, no circuit is ever built with mains voltage (220 V); a separate power supply and a common GND are used for motors, relays and servos. If batteries are used, watch out for short circuits and connecting them the wrong way round.
- **The Hyvex case.** Lesson 74 is based on a case from the Hyvex team's internship programme; only the information written in the programme has been passed on.
- **Progress.** The results of the mini quiz at the end of each lesson appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).
