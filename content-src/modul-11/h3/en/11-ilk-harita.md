# Your first room: a map with walls
duration: 22

## Wonder
So far our games have taken place on an empty screen. Real games, though, have rooms, mazes and corridors. Why can't a sprite go through a wall? And instead of placing a room with blocks one by one, how can we make it by drawing?

## Activity
In this lesson you will draw your first map. A map is small square pictures (tiles) laid out in a grid. Tiles can be walls, or just decoration.

### Map and tile
- **Tile:** A 16 x 16 pixel square picture.
- **Map:** A grid made of tiles. In this lesson the map called `oda` (room) has 10 columns and 7 rows. That makes 160 x 112 pixels.
- **Wall:** A sprite cannot go into a tile marked as a wall. There is a "wall" box for this in the tile set.
- Columns and rows are counted **from 0**. The top left tile is column 0, row 0.

### Look first
1. Open the activity and press the ▶ button. The cat is standing in the middle of the room.
2. Go to the **Map** tab. You will see an empty map called `oda` and, under it, a **Tile set**. There are three tiles in the set: stone wall, grass and water.
3. The **wall** box under the stone wall and water tiles is ticked. Grass is not ticked. So you can walk over grass, but you cannot get through stone wall or water.
4. The red dashed frame on the map shows the first screen of the game.

### Draw the map
1. Click the **stone wall** tile in the tile set. The chosen tile is highlighted.
2. Choose **Paint** from the tools.
3. Paint the top row of the map by clicking and dragging from left to right. Then paint the bottom row, the left column and the right column. It should be a room completely surrounded by walls.
4. If you like, choose the **Grass** tile and paint the inside of the room green with the **Fill** tool. Grass is only decoration.
5. If you painted something by mistake, use the **Erase** tool.

### Walk the cat
1. Go to the **Blocks** tab. In the work area, inside the `when game starts` block, there are `load map: [oda]`, the making of a cat and the placing of the cat.
2. From the **Controller** category, add the `[kedi] moves [in 4 directions] with player keys, speed [60]` block at the very bottom (`kedi` instead of `this sprite`).
3. Press the ▶ button and walk the cat in four directions. It should stop when it hits a wall.

Expected result: The cat walks inside the room but cannot go through the walls. All four goals are green.

### How does it work?
- The `load map: [oda]` block puts the map you drew in the Map tab into the game. Without this block, the map does not appear.
- The `put sprite [kedi] on tile column [5] row [3]` block places the cat in the exact middle of the tile. Giving a position on the map is easier than counting pixels.
- Wall tiles stop the sprite. You do not need to write a separate block for this. It is enough to make the tile a wall.
- If a single gap is left in a wall, the cat gets out through it. The edge must be fully closed.

### Try it
1. Draw a few stone wall tiles in the middle of the room and watch the cat go around them.
2. Paint the **Water** tile in one corner of the map. Can the cat go into the water?
3. Tick the **wall** box of the grass tile. Can the cat go onto the grass?
4. Make the map bigger by changing the **Columns** and **Rows** boxes. Paint the new tiles.

### Common mistakes
- If you painted the tile but its **wall** box is not ticked, the cat goes straight through it.
- The `load map: [oda]` block must be inside the `when game starts` block. If it is left outside, the map does not come in.
- To remove a tile you added to the map, use the **Erase** tool. If you remove a tile from the tile set, all its copies on the map are deleted too.
- If the map's name changes somewhere, the same name must be chosen in the block as well. In this lesson, do not change the name `oda`.

## Discuss
Why do we make most walls in a game by drawing a map rather than with blocks one by one? If you turned a real room (your own room or your classroom) into a grid, how big would it be?
