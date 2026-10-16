# Diamond hunt in the cave
duration: 25

## Wonder
On a map, some tiles are not just walls or floor. They can be gold, a key, a diamond or lava. Touching them makes something happen. So when you touch a diamond, how do you make that diamond **disappear** from the map? How does the computer know which diamond you touched?

## Activity
A cave map is ready: there are four diamonds and three red lava tiles. The cat walks with the arrow keys, but nothing happens when it touches the diamonds or the lava. At the start the score is 0 and the lives are 3.

### The event tile
Inside an event that runs when a tile is touched, you can find out where the touched tile is:
- `event tile [column]`
- `event tile [row]`

If you give these two numbers to the `clear tile at column [0] row [0]` block, exactly that tile disappears. The other diamonds stay where they are.

### Collect the diamonds
1. From the **Stage / Map** category, drop the `when a [Player] sprite touches tile [Diamond]` event into the work area. Choose **Diamond** as the tile.
2. Attach the `clear tile at column [0] row [0]` block inside it. Put the `event tile [column]` block in the column slot, and the `event tile [row]` block in the row slot.
3. Add the `change score by [1]` block from the **Game** category and the `play melody [point]` block from the **Sound** category.
4. Press the ▶ button. Touch the diamonds: they disappear and the score goes up.

### Win when they are all collected
1. At the very bottom of the event, attach the `if ... do` block from the **Logic** category.
2. For the condition, take the **=** comparison block. Put the `number of [Diamond] tiles on map` block in the left slot, and the number 0 in the right slot.
3. Inside the `if`, attach the `show [You have all the diamonds!] on screen for [2] seconds`, `play melody [victory]` and `end game: [you win]` blocks.

### Lava danger
1. Bring a second event: `when a [Player] sprite touches tile [Lava]`.
2. Inside it, attach the `change lives by [-1]`, `shake screen for [250] ms` and `play melody [boom]` blocks.
3. Finally, add the `put sprite [this sprite] on tile column [1] row [1]` block. This way, when the cat touches lava, it is sent back to the start tile.
4. Press the ↺ button. Touch the lava and see the cat go back. Then collect all the diamonds.

Expected result: When you touch a diamond, the diamond disappears and the score goes up. At the fourth diamond the game is won. When you touch lava, a life goes and the cat goes back to the start.

### How does it work?
- The same event runs each time a diamond is touched, but the event tile's column and row tell you where that diamond is each time.
- The `number of [Diamond] tiles on map` block gives how many diamonds are left on the map. When it is zero, they have all been collected. Because you do the check **after** the tile has been deleted, the number comes out right.
- In the lava event, `this sprite` is the sprite that triggered the event, so the cat. That is why you do not need to write the cat's name.
- Columns and rows are counted from 0. Column 1, row 1 is the first tile just inside the outer wall.

### Try it
1. Write the score in the winning message too: with the `create text with` block, `[Diamonds: ]` and `score`.
2. Make the lava say `change lives by [-2]`. Did the game get harder?
3. In the Map tab, paint a new diamond (choose **Diamond** from the tile set). Does winning still work correctly? Why?

### Common mistakes
- If you write fixed numbers in the block that clears the tile, the same tile is always deleted. Use the event tile's column and row.
- Do not tick the **wall** box of the diamond and lava tiles. The cat cannot go into a tile that is a wall, and collecting looks odd.
- If you do the winning check before the tile is deleted, the number comes out one too many and the game is never won.
- If you forget the block that teleports the cat from the lava to the start tile, the cat stays on the lava and loses a life once.

## Discuss
What does it add to the game for the tiles on the map to have different jobs (wall, danger, reward)? If you designed a cave, which jobs would you give to which tiles?
