### Week goals
By the end of this week, the learner:
1. Can explain what a radio group is, and can send and receive messages by putting two cards in the same group.
2. Can tell number, text and name = value messages apart and choose the right receiving block.
3. Can build a simple cipher using addition and subtraction with variables, and can explain the role of the key.
4. Can prepare a command table and turn the number that arrives into an icon or an action with a chain of **if** blocks inside each other.
5. Can plan and build a two-card project that works in the roles of remote and vehicle.

### Plan for the week
The week has five lessons; each lesson takes about 20-32 minutes. The plan is for one lesson a day.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | Send a message, receive a message | ~20 min | Read the explainer, put two cards in the same group, send numbers with A and B, show an icon on the receiving card. |
| 2 | Text, name and value | ~20 min | Send text and name = value messages, tell the type apart on the receiving card with a name check. |
| 3 | Secret message | ~22 min | Add with the key variable and send, decrypt by subtracting on the receiving card. |
| 4 | Chatting with two cards | ~22 min | Set up the number table, tell three icons apart with a chain of if blocks, add a melody. |
| 5 | Project: Remote control | ~32 min | Write the command table, build the remote and vehicle sides, test the arrow and the servo. |

### Prerequisite check
- Can they use the button hat blocks (A, B, A+B)? (Week 2)
- Can they make a variable and change its value? (Lesson 7)
- Can they build the **if ... then ... else** block? (Lesson 8)
- Do they know the card's tilt event and how to play a melody? (Lesson 11 and Lesson 18)
- Can they open two cards side by side in the editor? (This is shown in the first lesson.)

### Concept map
- **Radio basics:** group (0-255) → sending block → **on radio received** → **received [number]**
- **Message types:** number → text (at most 32 characters) → name = value (name at most 12 characters)
- **Organising data:** encryption (key, addition and subtraction) → command table (protocol) → putting the message into a variable
- **Making decisions:** if → chain of if blocks inside each other → the last else branch
- **Project:** card tilt → command → radio → arrow and servo

### Common mistakes
- **Putting the two cards in different groups.** The message does not arrive, and no error message appears.
- **Leaving the receive hat block empty.** Even if the sender works, the receiving card does nothing.
- **Thinking the sender will receive its own message.** The message only goes to the other card in the group.
- **Writing the name differently on the two sides.** "sicak" and `sıcak` are not the same; a name longer than 12 characters is cut off.
- **Using the same operation on both sides of the cipher.** If the sender adds, the receiver must subtract.
- **Not filling in the key or the message variable.** The variable stays 0, and the result is quietly wrong.
- **Putting the second if outside the else branch.** The order of the chain breaks.
- **Setting up the table differently on the two sides.** The meaning of the numbers is lost.

### End-of-week review
1. Read each lesson's concept cards and say the "common mistake" lines out loud.
2. Read again the explanations of the questions you got wrong in the mini quizzes, then answer the question again.
3. Without looking, build the smallest two-card program: send a heart with A, and the receiving card shows the heart.
4. In the secret message program, change the key from 7 to 20; for the plain digit 5, which number goes by radio? (Answer: 25.)
5. Answer this question in your own words: "Why must the sending and receiving sides use the same table?"

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Remote control)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Plan | There is no command table | The table has the command, the screen and the servo angle | The table matches the code exactly, and a decision for unknown commands is written down |
| Remote side | Some directions do not send a message | The four directions and button A send the right number | An extra event (for example face up) or tilt information is sent too |
| Vehicle side | The number that arrives is not read, or the chain is broken | For every command the right arrow is shown and the servo turns | There is a beep or another reaction, and the last branch stops the vehicle |
| Debugging | Cannot find the mistake | Finds and fixes the mistake as a group, table or empty hat block problem | Explains how they found the mistake and how to prevent it |
| Explanation | Cannot explain what they did | Explains the system as remote, message and vehicle | Discusses what would happen if a message were lost and what would be needed |

### Note for parents and teachers
- **Aim.** This week is about seeing that two separate things can be connected by just a message, building a program that interprets the message that arrives, and understanding the idea of a shared "agreement" (table).
- **How to help.** Instead of giving the answer, ask these: "Are the two cards in the same group?", "What is inside the receive hat block?", "Which number did you send, and what does that number mean in the table?"
- **Silent mistakes.** Most radio mistakes do not produce a warning. Have the learner look for the mistake systematically: first the group, then the sending block, then the receive hat block.
- **Encryption.** The cipher built here is a teaching example and does not give real security. In real life, passwords and codes are not shared.
- **Safety and privacy.** The portal is completely virtual; no real radio, motor or personal data is used.
- **Progress.** The mini quiz results appear by skill on the "My progress" page (a draft/pilot feature; saved only if consent has been given).
