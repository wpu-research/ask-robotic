# Full game 1: Space defence
duration: 30

## Wonder
In space games, waves of enemies get faster over time, the player's time is limited, and in the end you either win or lose. None of this needs a new block: they are all pieces you have learnt before. In this lesson you will put them together to make a timed game that keeps getting harder.

## Activity
### What is ready
In the night sky there is a ship at the bottom. It goes left and right with the arrow keys and fires a laser with A. Every 800 ms an alien comes down from a random place at the top. The score is 0 and lives are 3. There is also a variable called `hiz` (speed), which starts at 0. The collision rules for the laser and the aliens, lives, time and difficulty are not there yet.

### Four jobs
| Job | Which lesson you learnt it in |
|---|---|
| Score when the laser hits an alien | 19 |
| Lives when an alien touches the ship | 9 |
| A 30-second time limit | New: `countdown` |
| Aliens that get faster over time | New: changing a variable |

### Build the blocks: hitting and lives
1. Build the `when a [Bullet] sprite hits a [Enemy] sprite` event. Inside it, put `change score by [10]`, `play melody [boom]`, `make [other sprite] explode`, `delete sprite [this sprite]`.
2. Build the `when a [Player] sprite hits a [Enemy] sprite` event. Inside it, put `change lives by [-1]`, `shake screen for [250] ms`, `delete sprite [other sprite]`.
3. Press ↺. Shoot the aliens with the laser; when an alien touches the ship, you lose a life.

### Build the blocks: time
4. From the **Game** category, add the `start countdown from [30] seconds` block at the very bottom inside `when game starts`. The time left appears in the middle at the top of the stage; in the last 5 seconds it turns yellow.
5. From the **Game** category, build the `when time runs out` event. Inside it, put `show [Earth is saved!] on screen for [2] seconds` and `end game: [you win]`.

### Build the blocks: difficulty
6. From the **Game** category, take the `every [4000] ms` event. Inside it, snap the `change [hiz] by [5]` block from the **Variables** category.
7. Find the ready-made `every [800] ms` event. In the y slot of the `set [ufo] speed x [0] y [random]` block inside it, put an addition block (`[ ] + [ ]`): put the old random number block on its left and the `hiz` variable on its right. Every 4 seconds, the aliens come down a little faster.
8. Press ↺ and play the full game. If you survive for 30 seconds you win; if your lives run out you lose.

Expected result: all five goals ✓. The laser hits, lives go down when an alien touches the ship, the counter counts down from 30, the game is won when the time runs out, and the aliens get faster over time.

### How does it work?
- The `when time runs out` event runs when the countdown reaches 0. If you do not write this event, the game ends by itself when the time is up (you lose). We chose the rule "win when the time is up".
- `hiz` is a **variable**: it remembers a number. Every 4 seconds it goes up by 5. At 28 seconds it is 35. Because the alien's speed is worked out by adding `hiz` to a random number between 20 and 45, it is 20-45 at the start and about 55-80 at the end.
- Three events use the same `hiz` variable: one sets it to zero at the start, one raises it over time, and one works out the alien's speed. Shared numbers like this are like the game's "adjustment knobs".
- The three rules (hitting, lives, time) are independent; if you switch one off, the others keep working.

### Try it
1. Change the increase from 5 to 2, then to 10. Which one is more balanced?
2. Set the time to 60 seconds; does the game get boring when the difficulty increase is not enough?
3. Add a new `every [4000] ms` event that makes a second alien every 4 seconds. Does the game get more crowded?
4. Add a winning rule for when the score reaches 100 as well.

### Common mistakes
- Deleting the ready-made block that sets `hiz` to 0 at the start: the variable's first value is unknown, and the alien speed calculation can come out wrong. Leave that block where it is.
- Writing only `hiz` in the alien's speed block instead of an addition: the aliens do not move at all at the start.
- Putting the `when time runs out` block inside another event: events only stand on their own.
- Increasing the difficulty too fast: the game becomes impossible to play by the 10th second. Game design is partly trial and error.

## Discuss
What was the most fun moment in this game: the first minute, or the last 5 seconds? Why does difficulty that grows over time make a game more gripping?
