# Project: Platform jumper
duration: 35

## Wonder
You are putting together all the pieces from this week to make your first real platform game: a hero that walks and jumps; spikes on the ground, gold in the air, a slime enemy and, at the end, a door. Half the game is ready; the other half is writing the rules.

## Activity
### What are we going to make?
What comes ready-made: a map 24 tiles wide, gravity, walking, jumping with A, the camera, a slime on patrol and the rule for stomping the slime. What you will write:

| Rule | From which lesson | What will happen? |
|---|---|---|
| Gold | 23 | When touched, the gold disappears and the score goes up by 1 |
| Spikes | 23 | When touched, lives go down by 1 and the hero goes back to the start |
| Door | 13 and 23 | When touched, "Level complete!" appears and the game is won |

### Build the blocks
1. Press ▶ and explore the map. The camera follows the hero; walk right and jump onto the platforms. You pass through the gold, the spikes and the door, but nothing happens.
2. **Gold:** build a `when a [Player] sprite touches tile [Gold]` event. Inside it, put `clear tile at column [event tile column] row [event tile row]`, `change score by [1]` and `play melody [point]`.
3. **Spikes:** build a `when a [Player] sprite touches tile [Spikes]` event. Inside it, put `change lives by [-1]`, `shake screen for [250] ms`, `put sprite [this sprite] on tile column [2] row [5]` and `set [this sprite] speed x [0] y [0]`.
4. **Door:** build a `when a [Player] sprite touches tile [Door]` event. Inside it, put `show [Level complete!] on screen for [2] seconds`, `play melody [victory]` and `end game: [you win]`.
5. Press ↺ and play. Take the first gold, avoid the spikes, jump on the slime and reach the door.

Expected result: all five goals ✓. The gold disappears and the score goes up; when you touch the spikes, you lose a life and the hero goes back to the start; when you touch the door, "Level complete!" appears and the game is won.

### How does it work?
- The three events run separately. The gold and spike events are made of the same kind of blocks; only the picture (tile) is different.
- The door tile is not a wall either; the hero can pass through it. The moment it touches it, the game runs the `touches tile` event.
- The ready-made slime rule (stomp/side hit) works as in lesson 24.
- The map is 24 x 8 tiles, which is 384 x 128 pixels. Because the screen is 160 x 120, the camera follows the hero.

### Try it
1. Make the gold worth 5 points and require the score to be at least 10 before touching the door: in the door event, `if [score] ≥ [10] do win, else show [Collect the gold first!]`.
2. Put a new spike somewhere on the map: in the **Map** tab, choose the spikes and paint them on the ground. Does the game recognise the new spikes too?
3. Change the hero's picture to the robot, or add another enemy.

### Common mistakes
- Putting the hero back at the start after the spikes without resetting its speed: the falling speed stays, and the hero jumps strangely when it hits the ground.
- Choosing `end game: [you lose]` in the door event: the game shows the losing screen instead of winning.
- Typing fixed numbers instead of the `event tile` blocks in the gold event: the same tile is always cleared.
- Drawing the gold tile on the map with a picture other than **Gold**: the event is never triggered.

## Discuss
Where does a friend struggle when they play this game? How does having fewer spikes, or putting the gold higher up, change the game? How does a good level move from easy to hard?
