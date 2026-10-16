# Pulse meter
duration: 28

## Wonder
A doctor holds your wrist, looks at a watch and counts your heartbeats. Why do they not count for a whole minute? Because counting for a short time and doing a multiplication gives the same result much faster. In this lesson you will make your own virtual pulse meter. You will press A on every beat of your heart, and the card will count and tell you the result.

## Activity
### The idea
The card has no real pulse sensor. The portal is completely virtual, and you enter the measurement yourself: you count your own pulse or a rhythm and press **A** on every beat. The card counts these presses for 10 seconds and multiplies at the end.

**Beats per minute = beats counted in 10 seconds × 6**

| Beats in 10 seconds | Beats per minute |
|---|---|
| 10 | 60 |
| 12 | 72 |
| 15 | 90 |

This is a learning tool, not a medical measurement.

### A new idea: other work while waiting
The **pause [10000] ms** block waits for 10 seconds inside a hat block. But the card's other hat blocks keep running during this time. So while **B** is waiting for 10 seconds, the **A** button still works. The card runs different hat blocks together.

### Step by step
**on start**, **on button [A] [pressed]** and **on button [B] [pressed]** are ready in the editor.

1. In the **Variables** category, make two variables: **sayac** ("counter": how many beats) and **olcum** ("measuring": is a measurement running? 1 = yes, 0 = no).
2. Put **set sayac to [0]** and **set olcum to [0]** inside **on start**.
3. Put **if ... then** inside **on button [A] [pressed]**. Condition: **olcum** **=** **1**. Inside it, in this order:
   - **change sayac by [1]**
   - **show icon [heart]**
   - **pause [100] ms**
   - **clear screen**
4. Inside **on button [B] [pressed]**, in this order:
   - **set sayac to [0]**
   - **set olcum to [1]**
   - **show icon [small heart]**
   - **pause [10000] ms**
   - **set olcum to [0]**
   - **sayac** **×** **6** (the multiplication block) inside **show number**.
5. Press ▶ **Run**. Press **B** and the measurement starts. Within 10 seconds, press **A** twelve times (about once a second). Look at the result.

### Expected result
After **B**, a small heart stays on the screen. On every press of **A**, a big heart flashes for a moment. After 10 seconds, **72** scrolls across the screen. All four goals should have a ✓. If you do not hit exactly 12 beats, your result is a multiple of 6 (60, 66, 72, 78...).

### How does it work?
- **olcum** is a flag. While it is 1, **A** counts; while it is 0, **A** does nothing. This way, presses outside a measurement are not counted by mistake.
- **sayac** is reset at the start of every measurement.
- **pause [10000] ms** waits for 10 seconds. During this time **A** works, because **A** is a separate hat block.
- When the 10 seconds are over, the flag is turned off and the result is shown.

### Try it
1. Make the measurement time 15 seconds (**pause [15000] ms**) and make the multiplier 4. The result should come out about the same.
2. Show an icon on the screen depending on the result: below 60 a **sleeping face**, above 100 a **surprised face**, in between a **happy face**. (Put **if ... then ... else** blocks inside each other.)
3. Play a short beep when the measurement starts and a different beep when it ends.

### Common mistakes
- **Forgetting to set olcum to 1.** **A** never counts.
- **Writing 10 instead of 10000.** **pause** works in milliseconds. 10 ms is not noticeable at all.
- **Not resetting sayac.** In the second measurement, the number is added on top of the previous measurement.
- **Forgetting the multiplier.** Only the number of beats stays on the screen, not "beats per minute".

## Discuss
When you run fast, your pulse goes up. If you measured before running and after running, what difference would you see? If you measured for 5 seconds instead of 10, how reliable would the result be?
