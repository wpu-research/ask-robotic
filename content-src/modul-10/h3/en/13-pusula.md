# Compass: find north
duration: 25

## Wonder
If you have lost your way on a mountain, a compass needle always points north. Whichever way you turn, the needle still finds north. The card has a compass too. In this lesson you will make your own north finder.

## Activity
### Compass degrees
The card's compass tells you, in **degrees**, which way the top edge of the card is facing:

| Degrees | Direction |
|---|---|
| 0 | North (N) |
| 90 | East (E) |
| 180 | South (S) |
| 270 | West (W) |

The degrees go up clockwise. They go from 0 to 359; 360 is 0 again.

On the virtual card, in the **Compass and sensors** section, there is a dial and a **Compass** slider. By grabbing and turning the dial, or by moving the slider, it is as if you were turning the card. The **Point north** button sets the degrees to 0.

### New blocks
- **Input** category: **compass heading (degrees)** gives the compass number. **button [A] pressed?** gives true if A is being pressed at that moment.
- **LED** category: **show arrow at [0] degrees** draws an arrow pointing in the given direction. 0 means up, 90 right, 180 down, 270 left.

### How do you find the north arrow?
As the card turns, north ends up in a different place relative to the card. When the card turns to the east (90), north falls to the card's **left**. So the arrow should point left. The arrow needs to turn the opposite way by as much as the card has turned:

**arrow angle = 360 − compass**

| Compass | 360 − compass | Arrow |
|---|---|---|
| 0 | 360 (= 0) | up |
| 90 | 270 | left |
| 180 | 180 | down |
| 270 | 90 | right |

### Program: north finder
A **forever** block is already in the editor.

1. Put the **if ... then ... else** block from the **Logic** category inside **forever** (there are two kinds of if; take the one with "else").
2. Attach the **button [A] pressed?** block from the **Input** category to the condition slot.
3. In the "then" part put the **show number** block from the **Basic** category and attach **compass heading (degrees)** inside it.
4. In the "else" part put the **show arrow at [0] degrees** block from the **LED** category.
5. Remove the 0 inside the block and attach the **[ ] + [ ]** block from the **Math** category. Change the middle sign to **−**. Put 360 in the left hole and the **compass heading (degrees)** block in the right hole.
6. ▶ **Run**. Set the compass slider to 0, 90 and 180 and watch the arrow. Then set the compass to 135 and hold the A button down.

### Expected result
When the compass is at 0, the arrow points up; at 90 it points left; at 180 it points down. When you hold A down, the compass degrees, such as 135, appear on the screen; when you let go, the arrow comes back. All five goals should have a ✓.

### How does it work?
- The **forever** block looks at the compass all the time and updates the arrow. That is why the arrow reacts straight away when you turn the compass.
- **if A pressed? then ... else** chooses one of two states: if A is pressed, the number; if not, the arrow.
- The block that draws the arrow can only point in eight directions (north, north-east, east...). It rounds the angle you give it to the nearest direction. For example, 100 degrees is rounded to east.
- In the **JavaScript** tab you can find the line `screen.showArrowAngle(360 - input.compass())`.

### Try it
1. Turn the compass to 45 degrees and watch the arrow. Which way is it pointing?
2. Make it write a direction letter over the arrow: if the compass is less than 10, make the screen show "N". Which block do you need?
3. Set the compass to 270 and guess the arrow. Then run it and check.

### Common mistakes
- **Working out the arrow angle wrongly.** If the arrow's angle is the compass value itself, the arrow turns in the **same** direction as the card, not towards north. Taking it away from 360 makes the arrow turn the opposite way.
- **Forgetting to change to the minus sign.** The arithmetic block adds by default. You must click the middle sign and choose −.
- **Writing to the same screen from two places.** If you do the arrow job both in **forever** and in a button block, the two race for the screen and the picture becomes unsteady. That is why we did not write an event block for A, but asked **A pressed?** instead.

## Discuss
Why does a compass needle always point north? Where might navigation apps use the compass? Do you think the compass still works if you lift the card up off the ground?
