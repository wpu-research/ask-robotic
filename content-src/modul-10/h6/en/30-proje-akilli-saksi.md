# Project: Smart plant pot (final)
duration: 40

## Wonder
Time to put it all together. In this module you learnt how to light LEDs, listen to buttons, read sensors, play music and talk by radio. Now you will use all of them in the same project: two smart plant pots watching each other's state by radio. When one pot's soil dries out, the other pot sees it and sounds an alarm.

## Activity
### Project: Smart plant pot
The two cards are two virtual plant pots. We pretend each card has a soil moisture sensor connected to its **P1** pin (the **Input** slider in the Pins section: 0 dry, 1023 wet). Both cards run the same program.

**Goals:**
- Every two seconds, the card measures its own moisture as a percentage and sends it by radio with the name **nem** ("moisture").
- If the moisture is below 30, the card that receives the message shows a sad face and plays the sad melody.
- If the moisture is 30 or above, the receiving card shows the moisture with a bar graph.
- The **A** button shows the card's own moisture.

### Which lesson gives which part?
| Part | Where you learnt it |
|---|---|
| **every [2000] ms**, variables, **if** | earlier weeks |
| Turning 0-1023 into a percentage with **map** | lesson 29 |
| **bar graph** | lesson 29 |
| **radio group**, **radio send [name] = [value]**, **received [name]**, **received [value]** | lesson 22 |
| **play melody [Sad]**, **show icon [sad face]** | lesson 18 and the first week |

### Draw your plan
First draw a flow on paper or in your head:

1. **Start:** radio group 7, the **nem** variable 0.
2. **Every 2 seconds:** measure the moisture, send **nem = value** by radio.
3. **A:** measure the moisture and show it on the screen.
4. **When a message is received:** if its name is **nem**, put the value into the **uzak** ("remote") variable. If it is less than 30, a sad face and the melody; if not, a bar graph.

### Step by step
**on start**, **every [2000] ms**, **on button [A] [pressed]** and **on radio received** are ready in the editor.

1. In the **Variables** category, make the **nem** and **uzak** variables.
2. Put **set radio group to [7]** and **set nem to [0]** inside **on start**.
3. Put **set nem to [...]** inside **every [2000] ms**; as the value, the **map** block: **map [analog read P1 (0-1023)] from [0]-[1023] to [0]-[100]**. Underneath, put **radio send [nem] = [...]**; the name is **nem**, and the value is the **nem** variable.
4. Put **set nem to [...]** (the same map block) and **show number [nem]** inside **on button [A] [pressed]**.
5. Put **if ... then** inside **on radio received**. Condition: **received [name]** **=** **nem**. Inside it, in this order:
   - **set uzak to [...]**; as the value, **received [value]**
   - **if ... then ... else**. Condition: **uzak** **<** **30**. **then**: **show icon [sad face]** and **play melody [Sad]**. **else**: **bar graph [uzak] up to [100]**.
6. Getting ready: choose the **Card 1** tab in the right panel and set **P1 Input** to about 512 in the **Pins** section. Choose the **Card 2** tab and set **P1 Input** to 100.
7. Press ▶ **Run**. Wait a few seconds. Press Card 1's **A** button.

### Expected result
Card 1's moisture is 50%, and Card 2's moisture is 10%. When Card 2 receives the **nem = 50** message from Card 1, it shows a half-full bar graph (13 LEDs). When Card 1 receives the **nem = 10** message from Card 2, it shows a sad face and plays the **Sad** melody (3 seconds). The **A** button shows the number **50** on Card 1. All six goals should have a ✓.

### How does it work?
- Every two seconds, each card sends its own moisture. When the receiving side sees the name **nem**, it puts the value into the **uzak** variable.
- A card does not receive its own message. So each card only sees the state of the **other** pot.
- The Sad melody lasts 3 seconds, longer than the two-second messages. The hat block is busy until the melody ends; for the same hat block, at most 3 messages wait in the queue.
- Because the cards run the same program, you only need to change the program once. When you press ▶, both cards run the new program.

### Try it
1. Make the **B** button show the temperature; if the temperature is above 35 °C, a **surprised face** appears on the screen.
2. You cannot make the radio group different on one card (the program is the same), but you can make it 5 with the **Card 2 group** selector in the Radio section. Do Card 1's messages reach Card 2?
3. Measure the light too: in the dark (light below 50), do not send the message.
4. Choose your own threshold and put it into a variable (**esik**, "threshold"); you should only need to change it in one place in the program.

### Common mistakes
- **Writing the message name differently.** If the sender writes **nem** and the receiver **Nem**, they do not come out equal. Write it exactly the same, letter for letter.
- **Measuring the moisture again on the receiving card.** When a message arrives, use **received [value]**. If you read from its own P1, you see its own state, not the state of the other pot.
- **Leaving the bar graph's largest value at 1023.** Because the moisture is now a percentage, it must be **100**.
- **Not setting the variables in on start.** Do not leave **uzak** empty before the first message.

### Assess yourself
- Which group of blocks did you use most in this project?
- Which part did you get stuck on? How did you solve it?
- If you explained the program to a friend, which three sentences would you say?

## Discuss
What was the best thing you made in this project? What would your next Micro Card project be: a game, a home alarm or a musical instrument? Who would you share it with?
