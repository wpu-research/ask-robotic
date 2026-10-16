### Week goals
By the end of this week the learner:
1. Can describe a map as a grid of 16 x 16 pixel tiles; can point to a tile by counting the column and row from 0.
2. Knows that a tile's "wall" box stops a sprite, and can build a room or a maze with walls.
3. Sets up the `when a [Player] sprite touches tile [...]` event; knows that the event runs once, at the first touch.
4. Clears the touched tile with the event tile's column and row; sets up a winning condition with a counter in the right order.
5. Explores a big world with the camera; turns tiles into sprites; builds the Treasure island game with a key, diamonds, lava and a chest.

### Plan for the week
The week has five lessons; each lesson is about 22-35 minutes. The plan below is for one lesson a day.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Your first room: a map with walls | ~22 min | Read the explainer, surround the room with stone wall, walk the cat, do the mini quiz. |
| 2 | Get out of the maze | ~22 min | Set up the winning event for touching the door tile, change the maze and try it yourself. |
| 3 | Diamond hunt in the cave | ~25 min | Clear the diamond with the event tile, win with a counter, set up the lava. |
| 4 | A big world, a scrolling camera | ~25 min | Connect the camera, turn the apple tiles into sprites, experiment with the camera's limits. |
| 5 | Project: Treasure island | ~35 min | Write the rule table, set up the four events, change the map with your own idea. |

### Prerequisite check
Week 1 and week 2 (module 11) should be finished. Before you start, check the following:
- Can they use the `when game starts` block, making a sprite and the `moves with player keys` block?
- Do they remember the collision event between sprites, and the score and lives blocks?
- Can they do small calculations with multiplication, division and subtraction (7 x 16, 480 - 160)?

### Concept map
- **Map:** tile (16 x 16) → grid (column, row; from 0) → tile set → wall box
- **Event:** when touching a tile → once, at the first touch → event tile column and row → clear tile
- **Rule:** counter (number of tiles) → winning condition → lava (lives and back to the start) → end game
- **World:** map (big) and screen (160 x 120) → camera following → turning tiles into sprites
- **Project:** rule table → key and door → message with the score → your own map design

### Common mistakes
- **Counting columns and rows from 1.** The first column and the first row are 0.
- **Mixing up the column and the row.** `column 10 row 5` and `column 5 row 10` are different; the second is outside a map with 10 rows.
- **Not ticking the wall box.** The tile looks like a wall but the sprite goes straight through it.
- **Leaving the `load map` block outside `when game starts`.** The map never comes in.
- **Writing fixed numbers in the block that clears the tile.** The same tile is always deleted; use the event tile.
- **Doing the winning check before the tile is deleted.** The counter shows one too many.
- **Forgetting the `end game` block.** The message appears but the game goes on.
- **Forgetting to turn tiles into sprites, or forgetting the camera.** The apple is not collected; the cat leaves the screen.
- **Thinking the event will run again if you wait.** A tile event runs only once, at the first touch.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Draw a 12 x 8 room on an empty map; turn it into a maze with an exit; make the game won when the door tile is touched.
4. Work out the width and height of your own map in pixels; say whether it fits on the screen.
5. Answer this question in your own words: "Without a camera, what would happen to a big map?"

The five lessons' mini quizzes are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Treasure island)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Plan | There is no rule table | What will happen for the four tiles is written in the table | The table matches the blocks exactly and is explained |
| Key and door | The key disappears but the door does not open | When the key is taken, the door (column 10, row 5) opens | Another obstacle instead of the door, or a second key and door, has been added |
| Diamond, lava, chest | One or more rules do not work | The diamond gives points, the lava takes a life and sends you back to the start, the chest wins the game | The message shows the score; the lava and diamond values have been set with thought |
| Map | Has not changed the map, or the path is closed | Has changed the map and the path to the chest is open | Has extended it with a new kind of tile and a new rule |
| Explanation | Cannot explain what they did | Explains the four events step by step | Explains a mistake they made and how they found it |

### Note for parents and teachers
- **Aim.** This week the child learns to link a game's rules to the tiles of the map. "What should happen when you touch which tile?" is a game designer's basic question.
- **How to help.** When they get stuck, instead of giving the answer, ask these: "Which tile should the event run on when it is touched?", "Is this tile a wall or not?", "Does the column come first, or the row?", "Is the winning check before or after the tile is deleted?"
- **Making mistakes is safe.** Everything is virtual; the ↺ button takes the game back to the start.
- **Time.** Spacing the lessons out helps learning stick. In the project lesson, give the child extra time to draw their own map.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).
