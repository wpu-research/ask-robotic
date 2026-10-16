# The address of the LEDs: x and y
duration: 20

## Wonder
On a treasure map, when it says "three steps right, two steps down", you find the treasure. Every place has an address. The 25 lights on the card's screen have addresses too. With these addresses you can switch any light on and off. How would you draw a line or a shape of your own?

## Activity
### Address: x and y
Every LED has an address made of two numbers:

- **x:** the column number from left to right, from 0 to 4.
- **y:** the row number from top to bottom, from 0 to 4.

Counting starts at **0**. So the leftmost column is 0 and the rightmost is 4.

| Place | x | y |
|---|---|---|
| Top left corner | 0 | 0 |
| Top right corner | 4 | 0 |
| Right in the middle | 2 | 2 |
| Bottom left corner | 0 | 4 |
| Bottom right corner | 4 | 4 |

When you write an address, x comes first, then y: (x, y).

### Program: a diagonal line, then four corners
In this lesson you will use the **Basic** and **LED** categories.

1. Drag the **plot x [2] y [2]** block from the **LED** category into **on start**.
2. Set the x and y boxes to 0 and 0. This lights up the top left corner.
3. Add four more of the same block. Set their addresses to (1, 1), (2, 2), (3, 3), (4, 4) in order.
4. Take the **pause [500] ms** block from the **Basic** category, type 1000 instead of the time and attach it under the LED blocks.
5. Under it, add the **clear screen** block from the **Basic** category.
6. Then add four more **plot** blocks: (0, 0), (4, 0), (0, 4), (4, 4).
7. ▶ **Run**.

### Expected result
First a diagonal line from the top left to the bottom right lights up. One second later the screen goes dark and the four corners light up. All three tasks in the Goals box should have a ✓.

### How does it work?
- The **plot** block switches on the light at the given address. The **unplot** block switches off the light at the same address.
- LED blocks **do not wait**. If you put five LED blocks one after the other, all five seem to light up at the same time. You decide how long something stays on the screen with the **pause** block.
- The **pause** time is in milliseconds (ms). 1000 ms is one second.
- **clear screen** switches them all off at once. It is much quicker than switching them off one by one.
- If you type an address outside the screen (for example x = 7), the card does not show an error; it ignores that block.

### Try it
1. Light up the light right in the middle of the screen: (2, 2). Then switch it off with **unplot**.
2. Try lighting up the outer frame (the 16 lights on the edges). Which addresses do you need to type?
3. Draw the diagonal line the other way: from the top right to the bottom left. Use the addresses (4, 0), (3, 1), (2, 2), (1, 3), (0, 4).

### Common mistakes
- **Mixing up x and y.** x is horizontal, y is vertical. (4, 0) is the top right corner, not the bottom left.
- **Counting from 1.** Counting starts at 0. The rightmost column is 4, not 5.
- **Lighting everything up and thinking you cannot see anything.** If you do not add a pause block, the first drawing is wiped straight away. Put **pause** blocks in between.

## Discuss
Why do we need two numbers to light up one light? Do you think it would be easier if we gave each of the 25 lights a single number from 1 to 25?
