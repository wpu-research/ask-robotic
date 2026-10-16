# Icons and your own pattern
duration: 20

## Wonder
When you are messaging, drawing a smiling face is much quicker than typing words. The card's screen is a small canvas too: it can draw faces, arrows and hearts. Using ready-made drawings is easy. But what should you do to draw something that does not exist yet, such as a robot?

## Activity
### Ready-made icons
The **show icon [heart]** block in the **Basic** category contains small ready-made drawings. When you click the box, a list opens: heart, small heart, happy face, sad face, surprised face, sleeping face, yes, no, arrows, square, diamond, triangle, house, target, ghost, skull, butterfly, cat, note, sun.

An icon is drawn on the screen straight away and stays there until you clear it or show something else.

### Your own pattern: show LEDs
The **show LEDs** block in the **Basic** category contains 5x5 small boxes. When you click a box, that LED lights up; click it again and it goes off. Whatever you draw, the card shows it on the screen.

In this lesson you will draw a **robot head**. Mark the boxes like this (1 on, 0 off):

| Row | Pattern |
|---|---|
| Row 1 | 0 0 1 0 0 |
| Row 2 | 0 1 1 1 0 |
| Row 3 | 1 0 1 0 1 |
| Row 4 | 1 1 1 1 1 |
| Row 5 | 1 0 1 0 1 |

### Program: three faces
1. Put a **show icon** block inside the **on start** block and choose **happy face** from the list.
2. Attach a **pause [1000] ms** block under it.
3. Under that, add a second **show icon** block and choose **sad face**.
4. Add another **pause 1000 ms**.
5. At the very bottom, attach the **show LEDs** block. Draw the robot head by clicking the boxes.
6. ▶ **Run**.

### Expected result
First the happy face appears, one second later the sad face, and one second after that the robot head. The robot head stays on the screen. All four goals should have a ✓.

### How does it work?
- Both draw on the screen straight away, but they work differently: **show icon** picks a ready-made drawing, while **show LEDs** uses the one you drew.
- The 25 LEDs on the screen are really 25 tiny "on/off" switches. A pattern is the state of these 25 switches at that moment.
- When a block draws something, it completely wipes the previous drawing. Drawings do not pile up on top of each other.

### Try it
1. Draw your own face in the **show LEDs** block: eyes, mouth, nose. Compare it with a friend's drawing.
2. Add a second **show LEDs** block under the first one and draw a slightly changed version of the pattern (such as the robot closing its eyes). Put a **pause 500 ms** between them: you have made an animation!
3. Pick two of the ready-made icons and change the pause time. What does a very short pause (100 ms) look like?

### Common mistakes
- **Not adding a pause.** If you put two icons one after the other without a pause, you will only see the last one. The first one is visible for such a short time that you do not notice it.
- **Marking the boxes the wrong way round.** Rows go from top to bottom, columns go from left to right. Look at your drawing from one side and make sure it is right.
- **Trying to write text with show LEDs.** This block only shows the pattern you drew; for text, use the **show text** block.

## Discuss
Is it more fun to use the ready-made icons or to draw your own pattern? Think of a feeling or an object you could show with 25 lights: how many lights would you need to draw it?
