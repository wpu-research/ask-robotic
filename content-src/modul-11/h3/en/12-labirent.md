# Get out of the maze
duration: 22

## Wonder
Mazes are a very old game idea. You find a path between the walls and reach the exit. What does the computer look at to say "you reached the exit!"? How does it know that a sprite has touched a tile?

## Activity
The maze map is ready. The cat (a mini cat) is on the start tile and walks with the arrow keys. The walls are brick. The exit door is in the bottom right corner of the maze. But when you go into the door, nothing happens.

### The touching a tile event
Just as sprites can hit each other, they can also touch tiles. The `when a [Player] sprite touches tile [Door]` block runs the blocks inside it **once**, the moment a Player touches a door tile.

### Look first
1. Press the ▶ button and try walking through the maze once. You cannot go through the brick walls.
2. Go to the **Map** tab and study the path through the maze. Where is the exit?
3. There are two tiles in the tile set: brick wall (wall box ticked) and door (not ticked). It matters that the door is not ticked: the sprite must be able to go into the door, because the event runs "when it touches".

### Build the blocks
1. Go back to the **Blocks** tab. From the **Stage / Map** category, drop the `when a [Player] sprite touches tile [Door]` event block into the work area. Choose the door from the picture list.
2. Inside it, attach the `show [You found the exit!] on screen for [2] seconds` block from the **Game** category.
3. From the **Sound** category, add the `play melody [victory]` block.
4. At the very bottom, add the `end game: [you win]` block from the **Game** category.
5. Press the ▶ button. Find the path through the maze and reach the door. The message appears and the game is won.

Expected result: When the cat touches the door tile, the message is written, the victory melody plays and the game is won.

### How does it work?
- The event runs the moment the cat **first touches** the door. Staying on top of the door does not run it again and again.
- The **wall** box in the tile set decides the walls. You can also use the same brick picture as a tile that is not a wall.
- The maze uses a small cat (8 x 8 pixels). The corridors are 16 pixels wide, so it fits easily. A 16 x 16 sprite would be very squashed.
- The background has been covered with a floor picture using `tile background with picture [Floor]`. This floor shows in the places left empty on the map.

### Try it
1. Add a score: put `set score to [0]` inside `when game starts`, and `change score by [100]` in the door event.
2. Add a time counter: make the message with the `create text with` block: `[Exit: ]` and `time passed (s)`. Write how many seconds it took to get out.
3. In the Map tab, draw a new wall inside the maze and make the path longer. Can the exit still be reached?

### Common mistakes
- If you forget to choose the **door** tile in the event, it waits for the wrong tile.
- If the door tile's **wall** box is ticked, the cat cannot go into the door. Untick it.
- If the maze's path is completely blocked, the exit can never be reached. Play the maze you edited yourself.
- If you forget to end the game, the message appears but the game carries on.

## Discuss
What makes a maze hard or easy? The number of paths, the dead ends, the time? If you designed your own maze, where would the exit be?
