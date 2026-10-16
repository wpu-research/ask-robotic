# Project: Environment station
duration: 35

## Wonder
If a scientist wanted to describe what a room is like, what would they measure? They would look at the temperature, the light and the sound. Now you are going to bring these three sensors together on a single card. Choose which one to watch with a button, let the screen show it as a bar, and read the number whenever you want!

## Activity
### Project: Environment station
**How will it work?**
- The **A button** changes the mode: 0 = temperature, 1 = light, 2 = sound. After the third press, it goes back to 0.
- The screen shows the selected sensor as a **bar graph**.
- **If you hold down the B button**, the screen shows the number instead of the bar.

### New block: remainder
The **remainder of [ ] ÷ [ ]** block in the **Math** category gives the number left over from a division. For example, the remainder of 3 ÷ 3 is 0, and the remainder of 4 ÷ 3 is 1. We want the mode to go back to 0 after 0, 1, 2: **the remainder of (mod + 1) ÷ 3** does exactly this.

| mod | mod + 1 | remainder of ÷ 3 |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 2 | 2 |
| 2 | 3 | 0 |

### Step by step
The **on start**, **on button A** and **forever** blocks are already in the editor. The variables called **mod** (mode), **okuma** (reading) and **enCok** (largest) are ready too.

1. **A button:** put the **set mod to [0]** block inside it. In place of the 0, attach the **remainder of [ ] ÷ [ ]** block from the **Math** category. In the first hole attach a **[ ] + [ ]** block: **mod** and 1. Type 3 in the second hole.
2. Inside the **forever** block, first get the reading ready according to the selected mode. Put an **if mod = 0 then ... else** block:
   1. **"then":** **set okuma to [temperature (°C)]**, **set enCok to [40]**.
   2. **"else":** put a second **if mod = 1 then ... else** block inside it.
      - **"then":** **set okuma to [light level]**, **set enCok to [255]**.
      - **"else":** **set okuma to [sound level]**, **set enCok to [255]**.
3. In the same **forever**, under this if block, put a second **if ... then ... else**. Condition: **button [B] pressed?**
   - **"then":** **show number okuma**.
   - **"else":** **bar graph okuma up to enCok**.
4. ▶ **Run**. Set the temperature to 30: the bar fills up more than two thirds. Press A to switch to light, then to sound. Hold B down and read the number. On the third press of A it should go back to the start.

### Expected result
At the start you are in temperature mode. When you set the temperature to 30, the bar lights up about 19 LEDs (the ratio 30 ÷ 40). When you press A, the light bar comes up; press again and the sound bar comes up; on the third press, temperature comes back. When you hold B down, the matching number scrolls across the screen. All five tasks in the Goals box should have a ✓.

### How does it work?
- **mod** holds which sensor is being watched. **okuma** is the value of the selected sensor, and **enCok** is the largest number that value can have (40 for temperature, 255 for light and sound).
- In each round, **forever** first gets the reading ready, then draws the screen. This is the only place that writes to the screen; that is why the picture on the screen does not get mixed up.
- The **A button block** only changes the mode; it does not touch the screen.
- **bar graph okuma up to enCok** draws the ratio: if okuma is 30 and enCok is 40, then 30 ÷ 40 = 0.75; that is about 19 of the 25 LEDs.
- All the parts in the same program (events, variables, if, bar graph, remainder) add up everything you learnt this week.

### Try it
1. Set the largest value of the temperature bar to 50. How many LEDs light up at the same temperature? Why?
2. Add a fourth mode: **Compass**. Make its largest value 360. With four modes, which number should you change in the A block? (Hint: the number you divide by in the remainder block.)
3. Instead of the bar graph, add a warning such as **if okuma is high then show a heart**.

### Common mistakes
- **Writing the number instead of the remainder.** If you write **mod + 1** directly in the A block, the mode never goes back to the start and grows as 3, 4, 5. The remainder block, dividing by 3, keeps the 0, 1, 2 cycle.
- **Forgetting the enCok value.** If you leave 255 for temperature, the bar hardly fills up at all.
- **Writing to the screen from two places.** If you write a separate event block for B and try to show the number from there, **forever** wipes the screen straight away. Keep it all in one place, inside **forever**.
- **Forgetting to change the sensor slider.** If the bar never changes, move the sliders of the virtual sensors.

## Discuss
What other things would a real weather station measure? Where would you use this card's three sensors: a greenhouse, a classroom or your own room? Think about which measurement is most important to you, and explain why.
