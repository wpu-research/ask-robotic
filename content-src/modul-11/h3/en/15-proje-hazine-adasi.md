# Project: Treasure island
duration: 35

## Wonder
We are bringing together all of this week's pieces to make a long adventure. The hero starts on an island. First they will find the key that opens the door, avoid the lava, collect the diamonds and finally reach the treasure chest. Everything is made with the map's tiles.

## Activity
The island map is ready: 20 x 10 tiles. The hero is on the start tile, walks with the arrow keys and the camera follows them. The score is 0 and the lives are 3. But no tile does anything. You will write the rules.

### The tiles on the map
- **Stone wall:** There is a wall in the middle that splits the island in two.
- **Door:** The way through in the wall. At the start it is closed like a wall. Its place: column 10, row 5 (columns and rows are counted from 0).
- **Key:** Somewhere in the left half. It opens the door.
- **Lava:** There are three lava tiles in the left half.
- **Diamond:** There are three diamonds, two in the right half and one in the left half.
- **Water:** There is a strip of water in the right half. Water behaves like a wall; you cannot get through.
- **Chest:** The treasure chest, somewhere in the right half.

### Rules
1. When you touch the key, the key disappears and the door opens.
2. When you touch a diamond, the diamond disappears and the score goes up by 1.
3. When you touch lava, 1 life goes and the hero goes back to the start.
4. When you touch the chest, it says "You found the treasure! Score: ..." and the game is won.

### Look first
1. Press the ▶ button and explore the island. The hero cannot go through walls or water. You cannot go everywhere on the map, because the door is closed.
2. Go to the **Map** tab and study where the tiles are. Where are the key, the door and the chest?

### Key and door
1. From the **Stage / Map** category, put in the `when a [Player] sprite touches tile [Key]` event.
2. Attach the `clear tile at column [event tile column] row [event tile row]` block inside it. This way the key disappears.
3. Underneath, add a second `clear tile at column [10] row [5]` block. This opens the door. Type the numbers yourself.
4. Add the `show [The door is open!] on screen for [2] seconds` and `play melody [power up]` blocks.

### Diamonds
1. Put in the `when a [Player] sprite touches tile [Diamond]` event.
2. Inside it, put the block that clears the event tile, `change score by [1]` and `play melody [point]`.

### Lava
1. Put in the `when a [Player] sprite touches tile [Lava]` event.
2. Inside it, attach the `change lives by [-1]`, `shake screen for [250] ms`, `play melody [boom]` and `put sprite [this sprite] on tile column [1] row [1]` blocks.

### Chest and winning
1. Put in the `when a [Player] sprite touches tile [Chest]` event.
2. Inside it, add the `show [create text with ...] on screen for [3] seconds` block. In the create text block, put first the text `[You found the treasure! Score: ]`, then the `score` block.
3. Add the `play melody [victory]` and `end game: [you win]` blocks.

### Run it and try it
1. Press the ↺ button. First touch one of the lava tiles. Then get the key, go through the door, collect the diamonds and reach the chest.
2. Are all six items in the Goals panel green?

Expected result: When you get the key, the door opens. Diamonds raise the score. Lava takes a life and sends you back to the start. When you touch the chest, the game is won with a message showing the score.

### How does it work?
- Every rule in this game is a **tile event**. The map's tiles carry the rules of the game. To add a new rule, you just draw a new tile and write an event.
- The key and door system is an example of one event changing another place: touching the key removes the door somewhere else.
- At the start, the door is a tile with its **wall box ticked**. When the tile is deleted, the wall disappears too and the way opens.
- The camera does not show the outside of the island. The map is 320 x 160 pixels, so the screen only sees part of it.

### Add your own touch
1. Edit the map: in the Map tab, paint a new lava, diamond or wall. Is the path to the chest still open?
2. Make the lava take more lives, or make the starting lives 5.
3. When you collect a diamond, show the message `show [Shiny!] on screen for [1] seconds`.
4. Close the door off with a thicker wall and put the key further away. Did the game get harder?

### Common mistakes
- If you write the wrong column and row for the door, another tile is deleted. Count the column and row in the Map tab; the first tile is 0.
- If you forget to delete the event tile in the key event, the key stays where it is and the goal does not turn green.
- If you forget to fill the slots of the `create text with` block in the score message, the message comes out incomplete.
- If you write another sprite's name instead of `[this sprite]` in the lava event, the wrong sprite is moved.

## Discuss
What turns a map into a game? The jobs of the tiles, or the events you write with blocks? What other kinds of tile could you add to treasure island to make the game more interesting?
