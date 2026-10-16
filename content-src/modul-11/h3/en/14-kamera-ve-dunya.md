# A big world, a scrolling camera
duration: 25

## Wonder
Some game worlds are much bigger than the screen. The screen is 160 pixels wide, but the world might be 480 pixels. So what do we see on the screen? The camera. The camera shows one part of the world and scrolls as the player walks.

## Activity
The `ova` (plain) map is 30 tiles wide, so 480 pixels. That is three times the screen! The cat walks with the arrow keys but the camera is still, so when the cat goes right it leaves the screen and disappears. There are also 7 apple marks on the map: these are tiles with an apple picture. You will turn them into apples that can be collected.

### Camera
- The `camera follows sprite [kedi]` block ties the camera to the cat. As the cat walks, the view scrolls. If the world is smaller than the screen, the camera does not scroll.
- The `camera stays still` block stops the following.
- The `map [width] (tiles)` block tells you how big the map is.

### Turning tiles into sprites
The apple tiles on the map are just pictures. To be collected, they need to be real sprites. The `turn all [Apple] tiles into [Food] sprites` block clears all the apple tiles on the map and puts a **Food** sprite in the place of each one.

### Build the blocks
1. Go to the **Map** tab and study the plain. The red dashed frame shows the first screen of the game: a very small part of the map. The trees are walls.
2. Go back to the **Blocks** tab. Look at the blocks inside `when game starts`: the map has been loaded, the cat has been put at column 1, row 4, and it walks with the keys. The collecting event is ready too: when the cat touches a Food, the score goes up by 1 and the food is deleted.
3. From the **Stage / Map** category, attach the `camera follows sprite [this sprite]` block at the very bottom of the inside of `when game starts`. Put the `kedi` variable in place of `this sprite`.
4. In the same place, add the `turn all [Apple] tiles into [Food] sprites` block. Choose **Apple** as the tile and **Food** as the kind.
5. Press the ▶ button. Walk the cat to the right. The view scrolls and you collect apples on the way.

Expected result: The camera follows the cat. The 7 apples on the map turn into sprites that can be collected. When you collect an apple, the score goes up.

### How does it work?
- The camera tries to keep the sprite it follows in the middle of the screen. When it gets close to the edge of the world it stops, and it does not show empty space.
- The map is the world; the screen is a window onto this world. With the camera, you choose where this window is.
- After the turn-into block, no apple tiles are left on the map. The apples have become sprites. Sprites can move and take part in collision events. Tiles cannot.
- For each sprite that is made this way, the `when a [Food] sprite is created` event runs. You can use it to give the apples movement, sound or other features.

### Try it
1. Give the apples a speed: write the `when a [Food] sprite is created` event and put `set [this sprite] speed x [0] y [20]` inside it. Do the apples slide down?
2. Leave the camera still instead of following the cat: use `camera stays still`. What changed?
3. In the Map tab, add new apple tiles or trees to the plain. Does it work?

### Common mistakes
- If you forget to add the camera, the cat leaves the screen.
- If you do not turn the apple tiles into sprites, nothing happens even when the cat touches them. That is because the event waits for a Food **sprite**.
- If you make the wrong choice of kind in the turn-into block, the apples cannot be collected. The kind must be **Food**.
- If you put the camera block after the turn-into block and leave it as `this sprite`, the camera follows the apple made last. Always give the camera the `kedi` variable.

## Discuss
Why don't games with big worlds show the whole world on the screen? What would a game without a camera be like? In which games does the camera never scroll, with a fixed screen?
