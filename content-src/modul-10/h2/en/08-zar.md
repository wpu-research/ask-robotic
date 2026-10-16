# Electronic dice
duration: 25

## Wonder
When you roll a dice, nobody knows what will come up; that is exactly why games are exciting. Computers can make "random" numbers too. So what if we put a dice inside the card, and something surprising happens when a 6 comes up?

## Activity
### Random number
The **random number from [1] to [6]** block in the **Math** category gives a random whole number between these two numbers (including both ends) every time it runs. Like the faces of a dice: 1, 2, 3, 4, 5 or 6.

### Asking a question: if
The **if ... then** block in the **Logic** category makes a decision based on a question. If the question is true, the blocks inside it run; if not, they are skipped. For the question you use the **comparison** block from the same category. It is a block with the options **=**, **≠**, **<**, **≤**, **>**, **≥** in its middle part.

Careful: **set zar to 6** is an **assignment**: it puts 6 in the box. **zar = 6**, on the other hand, is a **question**: is there a 6 in the box? Its answer is true or false. (**zar** is Turkish for "dice".)

### Program: roll the dice, show a heart on a 6
The A button's block is already in the editor.

1. Click the **Make a variable...** button in the **Variables** category. Type the name **zar**.
2. Put the **set zar to [0]** block from the **Variables** category inside A.
3. Take the **random number from [1] to [6]** block from the **Math** category and drop it in place of the "0".
4. Under it, attach the **show number** block from the **Basic** category. Replace the number inside it with the **zar** block.
5. Take the **if ... then** block from the **Logic** category and attach it at the very bottom.
6. Attach the comparison block to the "if" slot of the if block. Put the **zar** block in the left hole and 6 in the right hole. Make sure the sign in the middle is **=**.
7. Put a **show icon** block inside the if block and choose **heart**.
8. ▶ **Run**. Roll the dice by pressing A. Keep going until you get a 6.

### Expected result
Each time you press A, a digit from 1 to 6 appears on the screen for about half a second. When a 6 comes up, a heart appears on the screen after the digit disappears. All four goals should have a ✓.

### How does it work?
- We make the random number **once** and put it in the **zar** box. That way the number we show on the screen and the number we compare are the same.
- Every time a **random number** block runs, it makes a new number. If we used two separate random blocks for showing and comparing, the number we show and the number we compare could turn out different.
- The if block runs after the number has finished showing. The digit stays for half a second, then the heart appears.
- In the **JavaScript** tab you will see the lines `zar = randomInt(1, 6);` and `if (zar == 6)`.

### Try it
1. Make the dice go from 1 to 20. On which number would you like to show the heart?
2. In the **Logic** category there are two kinds of **if** block: one with only **then**, and another with **then ... else**. Take the second one: show a heart when a 6 comes up, and a sad face when it does not.
3. Press A 10 times and count how many times a 6 came up. How often do you think a 6 should come up?

### Common mistakes
- **Mixing up the single equals sign.** **set zar to 6** always makes the dice 6. In the comparison block, **=** must be selected.
- **Using two random blocks for the same dice.** Take the digit and the comparison from the same box (zar).
- **Not seeing the heart and thinking it is a bug.** When a 6 does not come up, the heart never appears. Press a few more times.

## Discuss
What could be the difference between a real dice and a random number on a computer? If you see the same number twice in a row, is that a bug, or part of being random?
