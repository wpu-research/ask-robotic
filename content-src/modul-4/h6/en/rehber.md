### Goals for the week
By the end of this week, the learner:
1. Can explain that an IR remote carries its message in the durations of the light, the structure of an NEC message (leading pulse, 32 bits, inverse copies) and how to read the bits from the gap length.
2. Can explain how a 4x4 keypad is read with 8 pins using the matrix idea; can write a program that collects digits with `getKey()` and checks the PIN with `strcmp`.
3. Can say what RFID and a UID are, name the four wires of SPI and explain why a UID does not count as a password on its own; can work out a project's pin needs in advance.
4. Can keep the PIN and the card list in EEPROM at fixed addresses; can explain the reasons for the setup marker, `EEPROM.update` and the "write the counter last" rule.
5. Can build and test a door lock made of the KILITLI, ACIK and BLOKE states that uses no `delay` at all.

### Plan for the week
The week has five lessons; the first four take 30-35 minutes, and the project about 40 minutes. The plan is for one lesson a day. A day's break after the fourth lesson is good for the project.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | IR receiver and remote control codes | ~30 min | Read the explainer, study the NEC table, measure the pulse length with a button, run the decoder sketch, do the mini quiz. |
| 2 | 4x4 keypad: entering a password | ~30 min | Set up the keypad, see each key's letter on the Serial monitor, try the PIN program. |
| 3 | RFID RC522 (SPI): reading a card | ~30 min | Study the SPI pins and the pin budget table, try the serial imitation with `KART:AABBCCDD`. |
| 4 | Access management: card + password + EEPROM | ~35 min | Draw the EEPROM map, try the `EKLE`, `SIL`, `LISTE` commands, restart and see that the list is still there. |
| 5 | Project: Smart door lock | ~40 min | Build the circuit, check the state table, carry out the seven steps of the test scenario, assess it with the rubric. |

### Prerequisite check
Before you start, check these:
- Does the learner know how to read a button with `INPUT_PULLUP`? (Module 3, lessons 6-7)
- Have they seen non-blocking timing with `millis()` and the state machine? (Lessons 27-28)
- Do they know how to turn a servo with `write`? (Lesson 21)
- Have they used the I2C LCD and EEPROM before? (Lessons 32-34)
- Do they remember measuring time with `pulseIn`? (Lesson 37)
- Can they use the box for sending a line from the Serial monitor and the ▶ and ■ buttons?

### Concept map
- **IR communication:** 38 kHz carrier → inverted output (pulse LOW) → NEC → bit from the gap → `uint32_t` and bit shifting → error check with the inverse copy
- **Input:** key matrix → scanning → `getKey()` → `char` array and `'\0'` → `strcmp`
- **Identity:** RFID → UID → SPI (SCK, MOSI, MISO, SS) → 3.3 V → serial imitation
- **Persistence:** EEPROM map → setup marker → `EEPROM.update` → write the counter last → master PIN
- **Project:** rule → state table → `durum` variable → timing with `millis()` → shared error counter → separate servo power

### Common mistakes
- **Mixing up `pulseIn(LOW)` and `pulseIn(HIGH)`.** The IR receiver works inverted: HIGH when idle, LOW during a pulse.
- **Using `int` for 32 bits.** On the Uno, `int` is 16 bits; write `(uint32_t)1 << i`.
- **Writing the keypad's rows and columns the wrong way round.** Pick each key in turn and see what the Serial monitor prints.
- **Comparing texts with `==`.** For the contents, `strcmp` is used (`memcmp` for bytes such as a UID).
- **Not making the array one bigger for the `'\0'`.** For a 4-digit PIN, `char girilen[5]`.
- **Powering a real RC522 with 5 V.** The module needs 3.3 V.
- **Thinking the UID is a password.** A UID can be read and copied; the card is used together with a PIN.
- **Raising the counter before the record.** A half-written card can look authorised.
- **Leaving the servo on keypad pins such as D6.** D2-D9 belong to the keypad this week; the servo is moved to D10.
- **Keeping the door open or waiting out the block with `delay`.** Keys and serial commands are missed, and the screen freezes.

### End-of-week review
1. Read each lesson's concept cards once more and say the "common mistake" lines out loud.
2. Read the explanations of the mini quiz questions you got wrong, then solve the question again.
3. Explain in your own words why an NEC message always lasts about 68 ms.
4. Draw an EEPROM map: which addresses do you need to change so that 12 cards fit? (Hint: each card is 4 bytes.)
5. Write a door lock rule for your own home: after how many wrong attempts, and for how many seconds, should it block? Put it into a state table.
6. Design a change to the door lock project that doubles the block time every time.

The mini quizzes of the five lessons are enough as an end-of-week test: 5 questions per lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project rubric (Smart door lock)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Circuit | Parts are missing or pins clash with the keypad | Keypad, servo, buzzer, two LEDs and LCD on the right pins; servo on D10 | Explains the pin budget and why the card reader is imitated over serial |
| State machine | The states are mixed up; the door stays open | KILITLI, ACIK and BLOKE work with the right moves between them | Has drawn the state table, and it matches the code exactly |
| Timing | Uses `delay`; the keys freeze during the block | Open for 5 s, block 30 s, with `millis()` | Changes the times and explains the effect; knows the overflow-proof comparison |
| Access | The PIN and the card work with separate counters | The PIN and the card share a counter; management commands need the master PIN | Has added a rule that increases the block time, or has changed the factory PINs |
| Feedback | The screen and buzzer do not match the events | The LCD, LEDs and buzzer show every event | Has designed the messages without Turkish characters and to fit in 16 characters |
| Security awareness | Has not thought about weaknesses | Has noticed that the serial port is a management weakness | Explains what would change in a real product (separate power, attempt limit, switching off serial management) |

### Note for parents and teachers
- **Aim.** This week is about bringing a lot of knowledge together: the keypad, the card, EEPROM, the servo and the screen. The learner does not have to memorise all of it; what matters is learning to put the plan into a written table and to test the parts one by one before combining them.
- **A note on honesty.** The lab has no card reader or IR remote part. The card is imitated from the Serial monitor; a button is used for IR. This is a deliberately chosen test method and does not replace real hardware. Tell the learner this clearly.
- **How to help.** When they get stuck, ask instead of giving the answer: "Which state is the door in right now?", "What does the Serial monitor say?", "Which pin did you give to two parts at once?"
- **Safety.** Everything is virtual. If a system that affects a real door is built, no one works directly with mains voltage (220 V); management PINs and an attempt limit are essential in a real product. Stress that the factory PINs (1234 and 9999) must never be used on a real lock.
- **Time.** Spacing the lessons out helps the learning stick; the fourth lesson is dense, so split it into two sessions if needed.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).
