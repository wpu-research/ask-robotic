# Sound level: clap counter
duration: 25

## Wonder
Some lamps switch on when you clap. Some phones give a warning when they detect a loud sound. All of them have a small "ear" that measures how loud the sound around them is. The card has sound level information too. In this lesson you will count claps.

## Activity
### Virtual sound level
On the virtual card, the sound level is set by the **Sound** slider in the **Compass and sensors** section. The value is between 0 (silent) and 255 (very loud). At the start it is around 20.

The **sound level** block in the **Input** category gives this value.

### Threshold: when do we count it as "loud"?
A clap is short and very loud. If we ask **if sound level > 150 then**, we only catch loud sounds. The number 150 is called the **threshold**.

To count a clap once and then let it go, we show the number on the screen after counting. Showing the number takes a short time, so the same clap is not counted twice.

### Program: sound meter and clap counter
The **on start** and **forever** blocks are already in the editor. The **alkis** (Turkish for "clap") variable is ready too.

1. The **set alkis to [0]** block should already be inside **on start**.
2. Put the **if ... then ... else** block from the **Logic** category inside **forever** (there are two kinds of if; take the one with "else").
3. Condition: **sound level > 150**. Put **sound level** from the **Input** category in the left hole and 150 in the right hole.
4. Attach these in the "then" part:
   1. **change alkis by [1]**
   2. **show number** (with **alkis** inside)
5. In the "else" part put the **bar graph** block from the **LED** category. Put **sound level** in the first hole and 255 in the second hole.
6. ▶ **Run**.
7. Pull the **Sound** slider to 130: more than half the screen lights up. Then pull it to 200 and drop it straight back to 20: the number becomes 1. Do this three times.

### Expected result
When it is quiet, the sound bar is visible on the screen. When the sound level goes past 150, the bar goes and, in its place, 1 appears for half a second, then 2, then 3. All four goals should have a ✓.

### How does it work?
- The **forever** block listens all the time: if the sound is loud, it counts; if not, it draws the bar.
- The **show number** block takes about half a second. During this time the program has, in effect, waited before the next round. That way one short clap is not counted twice.
- The bar graph spreads the sound level over 25 LEDs: a value such as 130 lights up about 13 LEDs.
- **alkis** goes up by 1 with every count. The counter is not reset; when you press ▶ again, it starts from zero.

### Try it
1. Set the threshold to 100 to make a more sensitive clap detector.
2. Add an event block for the **B button**: **set alkis to 0**. That way the counter is reset.
3. Add another **if** that shows a heart on the screen when the counter reaches 5.

### Common mistakes
- **Leaving the slider up high.** If the sound stays above 150, the counter keeps going up every half second. Bring the sound back down straight away.
- **Choosing a threshold that is too low.** Because the sound starts at 20, if the threshold is 10, it always counts as "loud" and the counter goes up without stopping.
- **Putting the bar in the wrong branch.** The bar must be in the **else** branch. If it is in the **then** branch, the number is wiped straight away.

## Discuss
How do we stop a device that works by sound from switching on by accident? Would the clap counter work properly in a noisy crowd? What privacy rules do you think are needed when people are being listened to through a microphone?
