# Project: Dice game scoreboard
duration: 35

## Wonder
In board games you roll dice, add up points and find out who wins. Someone always has to keep the score. In this project your card will roll the dice and add up the points, and it will even play victory music when a 6 comes up. That way it will be the game table's only helper!

## Activity
### Project: Dice game scoreboard
You will bring together everything you learnt this week: button events, variables, random numbers and if.

**Rules:**
- **A:** rolls the dice, shows the result on the screen and adds it to the **toplam** (total) score. If a 6 comes up, a victory melody plays.
- **B:** shows the total score.
- **A+B:** resets the total and shows 0 on the screen.

### New block: play melody
The **play melody [Ode to joy]** block in the **Music** category plays a ready-made piece of music. Choose **Fanfare** from the list. The next block waits until the melody is over. The sound comes from the virtual speaker. Your browser waits for one click on the page before it will make sound. If you cannot hear anything, check that the **Speaker** section in the card's right panel says **Sound on**.

### Step by step
The **on start**, A, B and A+B blocks are already in the editor. The **zar** (dice) and **toplam** (total) variables are ready too.

1. **A button:**
   1. Put a **set zar to [0]** block and attach **random number from [1] to [6]** inside it.
   2. Under it, put the **change toplam by [1]** block. Attach the **zar** variable in place of the number.
   3. Add a **show number** block and put **zar** inside it.
   4. Add an **if ... then** block: the condition is **zar = 6**.
   5. Put the **play melody** block from the **Music** category inside the if, and choose **Fanfare**.
2. **B button:** put **show number** inside it and attach the **toplam** variable.
3. **A+B button:** **set toplam to [0]**, then show 0 (or **toplam**) with **show number**.
4. ▶ **Run**. Press A at least five times and keep going until a 6 comes up. Then press B, and finally A+B.

### Expected result
Each time you press A, a digit from 1 to 6 appears on the screen for about half a second. When a 6 comes up, the victory melody plays. When you press B, the total so far scrolls across the screen (for example 17). When you press A+B, 0 appears on the screen. All five tasks in the Goals box should have a ✓.

### How does it work?
- **zar** holds the current roll, and **toplam** holds the total of all the rolls. On every roll, the total grows with **change toplam by zar**.
- The **if zar = 6 then** block plays the victory music only when a 6 comes up. For any other number it is skipped.
- The **on start** block resets the total. That way every run starts from zero.
- While the melody is playing, the A block waits until it has finished. If you press A again before the melody ends, the new press waits in the queue.
- Read the whole program in the **JavaScript** tab: can you find the line `toplam += zar;`? This is the code version of the word "change" in the block.

### Try it
1. Make a happy face come up when the total goes over 30. Hint: add another **if toplam > 30 then** block to A.
2. Add a "reset the score" as a long press on B. Then there are two separate ways to reset.
3. Choose another melody for the victory. Which one sounds most like victory music to you?

### Common mistakes
- **Forgetting to reset the total.** If you do not reset the total with A+B when you start a new game, it adds on top of the old game's score.
- **Rolling the dice twice.** Use the **zar** box both for showing and for adding up; do not put two separate random blocks. Otherwise the number on the screen and the number added up will be different.
- **Giving up before a 6 comes up.** A 6 does not come up on every roll. Press a few times to hear the victory melody.
- **Looking for a bug when you cannot hear any sound.** The speaker may be off. Look at the **Speaker** section in the right panel.

## Discuss
Which rule would you like to add to your game? For example, should the score go back to zero when a 1 comes up? As you change the rules, how does the game become more fun or harder?
