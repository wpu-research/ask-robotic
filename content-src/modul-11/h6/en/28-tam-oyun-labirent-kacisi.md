# Full game 2: Maze escape
duration: 30

## Wonder
In an old treasure room, the door is locked. The key is at the other end of the maze, and a ghost that can pass through walls is chasing you. If you take the key and reach the door, you win. But how will the game know whether you took the key? In this lesson you will add a "memory" to the game.

## Activity
### What is ready
A maze of 20 x 9 tiles is loaded. The cat starts at the top left, walks with the arrow keys, and the camera follows it. There is a key at the top right and a door at the bottom right. From the middle of the maze, a ghost follows the cat; the ghost passes through walls. The score is 0 and lives are 3. A variable called `anahtarVar` (has key) is ready, set to 0.

### Memory: a state variable
The `anahtarVar` variable holds the answer to the game's question "has the key been taken?": 0 is no, 1 is yes. Variables like this are called **flags**.

### Build the blocks: the key
1. Build a `when a [Player] sprite touches tile [Key]` event.
2. Inside it, add `clear tile at column [event tile column] row [event tile row]`, `set [anahtarVar] to [1]`, `change score by [10]` and `play melody [point]`.
3. Press ↺. Go to the key tile: the key disappears.

### Build the blocks: the door
4. Build a `when a [Player] sprite touches tile [Door]` event.
5. Inside it, put a two-branch `if ... do ... else ...` block. The condition: `[anahtarVar] = [1]`.
6. The `do` branch: `show [You escaped!] on screen for [2] seconds`, `play melody [victory]`, `end game: [you win]`.
7. The `else` branch: `show [Locked!] on screen for [1] seconds`.
8. Press ↺. First go to the door without the key: "Locked!" appears. Then take the key and go back to the door: the game is won.

### Build the blocks: the ghost
9. Build a `when a [Player] sprite hits a [Enemy] sprite` event. Inside it, write `change lives by [-1]`, `shake screen for [250] ms`, `put sprite [this sprite] on tile column [1] row [1]` and `put sprite [other sprite] on tile column [10] row [5]`. If the ghost catches the cat, they both go back to the start.
10. Press ↺ and play the full game.

Expected result: all five goals ✓. The key is collected, the door does not open without the key and opens with it, the ghost chases the cat, and if it catches it a life is lost.

### How does it work?
- The flag variable (anahtarVar) is the bridge between two events: the key event writes it and the door event reads it.
- The `if` at the door separates two paths: if you have the key, you win; if not, you get a warning. Without the `else` branch, going to the door without the key would tell you nothing.
- Because the ghost is made with the "go through walls" setting, the maze does not stop it; its speed is 14 and the cat's is 60, so the cat can escape the chase.
- The walls around the edges of the map are an obstacle for the cat, but not for the ghost.
- When the ghost catches the cat, we put both of them back in their starting places. This way the player is not caught again straight away and gets a breather.

### Try it
1. Slow the ghost down (10) and speed it up (30). Which one is balanced?
2. Add a second key and a second door: paint the tiles in the **Map** tab. Use two flag variables.
3. When the key is taken, show the message "You got the key!".
4. The game is lost if the ghost catches the cat 3 times; decide this yourself by writing `end game: [you lose]` in the `when lives run out` event.

### Common mistakes
- Not setting the `anahtarVar` variable to 1 when the key is taken: the door always says "Locked!".
- Writing the `if anahtarVar = 1` check at the door with the wrong variable: if variable names look alike, the flag is not read.
- Deleting the ready-made `set [anahtarVar] to [0]` block: the flag's first value is unknown. Always set the flag clearly to 0 at the start.
- Typing pixels instead of column/row when putting the cat back at the start: the block wants a tile number.

## Discuss
In which other game rules are flag variables useful? For example, which flags would you need for questions such as "is there a double jump left?", "has the boss been beaten?", "has the secret room been found?"
