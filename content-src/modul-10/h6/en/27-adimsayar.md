# Step counter
duration: 25

## Wonder
How does the step counter in a wristband count? A tiny accelerometer inside it feels a small jolt on every step and adds one to the count. The Virtual Micro Card has an accelerometer too. We will make a step counter by counting each shake of the card as "one step", and we will add a little celebration on the 10th step.

## Activity
### The idea
Shaking the card virtually is a jolt, like walking. The card's **when shaken** hat block runs once on every shake. If we put a block inside it that adds one to the **adim** ("step") variable, we have a step counter.

### A new idea: something special when you reach the goal
We can say that something should happen when a variable is **exactly** equal to a number: **if [adim] = [10] then**. The equality is only true at that moment. On the 11th step the condition is false, and the sound does not play again.

### Step by step
**on start**, **when card is [shaken]**, **on button [A] [pressed]** and **on button [B] [pressed]** are ready in the editor.

1. In the **Variables** category, make the **adim** variable.
2. Put **set adim to [0]** inside **on start**.
3. Inside **when card is [shaken]**, in this order:
   - **change adim by [1]**
   - an **if ... then** block. Condition: **adim** **=** **10**. Inside it, **show icon [happy face]** and **play melody [Fanfare]**.
4. Put **show number** inside **on button [A] [pressed]**; plug the **adim** variable in as the number.
5. Put **set adim to [0]** and **clear screen** inside **on button [B] [pressed]**.
6. Press ▶ **Run**. In the **Motion (accelerometer)** section in the right panel, press the **Shake** button three times. Then press the card's **A** button: you should see 3 on the screen. Shake seven more times. On the 10th shake the celebration starts. Reset with the card's **B** button.

### Expected result
**A** shows the number of steps: 3 after three shakes, 10 after ten shakes. On the 10th shake, a happy face appears on the card's screen and the **Fanfare** melody plays (about 2.75 seconds). When you press **B**, the counter is reset. All six goals should have a ✓.

### How does it work?
- With every **Shake**, the **when card is shaken** hat block runs once.
- On the 10th step, the **if** condition becomes true and the celebration starts. That hat block is busy until the melody ends; new shakes that arrive during this time join a queue (at most 3).
- **A** and **B** are separate hat blocks; they can run while the melody is playing too.
- You can also see the values coming from the acceleration sensor: the **strength** value in the **Motion** section goes up while shaking.

### Try it
1. Make the goal 5 instead of 10. Does the celebration come sooner?
2. To celebrate every 10 steps, use the **remainder of [adim] ÷ [10]** block in the **Math** category. If the remainder is **0**, celebrate.
3. If you count your step as 70 cm, the distance you walked is **adim** × 7 ÷ 10 metres. Make the **A** button show this.

### Common mistakes
- **Forgetting to reset with B.** If you do not press B first for a new walk, the count carries on from where it stopped.
- **Using the greater-than sign instead of equals.** If it is **adim ≥ 10**, the melody plays again on the 11th and 12th steps too.
- **Putting the change adim by 1 block inside the if.** Then the variable does not go up.

## Discuss
How does a real step counter tell shaking apart from walking? Does jumping or swinging your arm count as a step? What information could you use to make the counter smarter?
