# Platforms, gold and spikes
duration: 25

## Wonder
The fun of platform games is jumping and reaching the next place. Along the way you collect gold, while spikes try to trap you. In this lesson you will make the special tiles on the map talk to the hero: "I touched gold", "I touched spikes".

## Activity
A ready-made map is loaded: it is 20 tiles wide, with spikes on the ground, two platforms in the air and a piece of gold on top of each platform. The hero walks, jumps, and the camera follows it. The score is 0 and lives are 3. Gold is not collected yet, and the spikes do no harm.

### Get to know the map
You can look at the map in the **Map** tab. Column and row numbers start from 0 at the top left. Gold (object) and spike (trap) tiles are **not walls**: the hero passes through them. But the game notices that the hero has touched that tile and triggers an event.

### Build the blocks: gold
1. Press ▶. The hero passes through the gold, but nothing happens.
2. From the **Stage / Map** category, take the `when a [Player] sprite touches tile [Gold]` event. Choose **Player** as the kind and **Gold** as the picture.
3. Inside it, put the `clear tile at column [0] row [0]` block from the **Stage / Map** category. In the column slot, snap the `event tile [column]` block, and in the row slot, the `event tile [row]` block. These blocks know where the gold you touched is.
4. Underneath, add `change score by [1]` from the **Game** category and `play melody [point]` from the **Sound** category.
5. Press ↺. Touch the gold: the gold disappears and the score goes up by 1.

### Build the blocks: spikes
6. Take a new `when a [Player] sprite touches tile [Spikes]` event. Choose **Spikes** as the picture.
7. Inside it, in this order: `change lives by [-1]`; `shake screen for [250] ms`; `put sprite [this sprite] on tile column [2] row [5]` from the **Stage / Map** category (`this sprite` will be the hero); `set [this sprite] speed x [0] y [0]` from the **Motion** category.
8. Press ↺. When you touch the spikes, you lose a life, the screen shakes and the hero goes back to the starting tile.

Expected result: gold disappears when collected and the score goes up; when you touch the spikes, you lose a life and the hero goes back to the start. All five goals ✓.

### How does it work?
- The `touches tile` event is edge-triggered: it runs once, at the moment the hero enters the tile. It does not keep running for as long as you stand on the same tile.
- `event tile column / row` only makes sense inside this event.
- Clearing (deleting) the gold is important: otherwise the gold stays on the map and, as far as you can see, it has not been collected.
- When we put the hero back at the start, we also set its speed to zero: otherwise, even after going back, it could hit the ground at its falling speed and bounce.

### Try it
1. Reach the gold on top of the platform by jumping. If you cannot get high enough, set the jump speed to -300.
2. Instead of taking a life when you touch the spikes, lose the game at once: try the `end game: [you lose]` block.
3. Give 5 points for each piece of gold. Set the score target to 10 and add a win when you collect 2 pieces of gold.

### Common mistakes
- Not clearing the tile when you touch the gold: the gold does not disappear.
- Typing 0 instead of the `event tile` blocks: the tile in the top-left corner is always the one cleared.
- Typing pixel coordinates instead of column/row when putting the hero back at the start: that block wants tile numbers, not pixels.
- Choosing the wrong kind in the spikes event: if you choose **Enemy** instead of **Player**, the event does not run when the hero touches the spikes.

## Discuss
Why did we not make the spike and gold tiles walls? If they were walls, what would happen before the hero touched them? Which tiles need to be walls, and which need to be passable?
