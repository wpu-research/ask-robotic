# Final: Your own game
duration: 40

## Wonder
In five weeks you have moved sprites, handled collisions, drawn maps, and given enemies brains and the hero gravity. Now all of this is yours: an empty stage, an idea and the blocks in your hands. In this lesson you will make your own game. The idea is entirely up to you; I will only check whether the game is "complete".

## Activity
### Starting point
On the stage there is a navy background and nothing else. All the blocks are available: Sprite, Motion, Controller, Game, Stage / Map, Sound, Logic, Loops, Variables, Math, Text and Functions. You can also draw your own pictures and map with the Pictures and Map tabs.

### Decide first: the five-question design card
Fill in the card from lesson 26: Who is the player? What is the goal? What is the danger? How do you win? How do you lose? You can pick one of the ideas below or come up with your own:
- **Fruit hunter:** a cat collects fruit and escapes from a ghost.
- **Space defence:** a ship shoots enemies (lesson 27).
- **Treasure maze:** collect the diamonds and get out through the door (lesson 28).
- **Platform adventure:** collect gold and jump over spikes (lesson 25).
- **Your own idea:** fishing, protecting a balloon in the air, a race…

### The goal list: signs of a complete game
The Goals panel checks your game. The design belongs to you; the list only tests what a complete game must have:

| Goal | What does it mean? |
|---|---|
| Player | A sprite of the **Player** kind that moves with the arrow keys |
| Something to collect | A sprite of the **Food**, **Bonus**, **Goal** or **Object** kind |
| Danger | A sprite of the **Enemy** or **Obstacle** kind |
| Score | The score goes up when you collect something |
| Lives | Lives go down when you touch the danger |
| Ending | Your program has an `end game` block |
| Sound | At least one melody or beep plays |
| Polish | A screen shake, an explosion or a message on the screen |

Important: the goals look at sprite kinds and collision events. Choose the kinds correctly: **Food** for things to collect, **Enemy** for dangers, and so on.

### Do it in four rounds (about 35 minutes)
**Round 1 (10 min): the skeleton.** Create the player sprite with the `when game starts` block, add the `moves … with player keys` block, turn on the `stay on screen` setting, and set the score to 0 and lives to 3. Press ↺: does your player walk?

**Round 2 (10 min): something to collect and a danger.** With an `every [1000] ms` event, make sprites to collect appear in random places (for a random position, use `random integer from [ ] to [ ]`). Create an enemy; make it bounce, follow, or move randomly. Write the `when a [Player] sprite hits a [Food] sprite` and `… hits a [Enemy] sprite` events: raise the score, take away a life, delete.

**Round 3 (5 min): the ending.** In the collision event, write `end game: [you win]` with `if [score] ≥ [5] do`. For losing, the game ends by itself when lives drop to 0; if you like, add a special message in the `when lives run out` event.

**Round 4 (10 min): polish.** Add sounds (a point melody when you collect, a lose melody when you crash), and use `shake screen` and `show … on screen`. Play your game yourself from start to finish; if it is too easy or too hard, adjust the numbers (speed, time, score target).

Expected result: all eight goals ✓ and the game can be played from start to finish. When all the goals are ✓, your game counts as "complete"; the best part is carrying on making it even better.

### How does it work?
- The goal check tries out your game the way a robot would play it: it presses keys and makes the player collide with the thing to collect and with the danger. If you have no collision events, the score and lives do not change, and the goals do not turn ✓.
- The **Ending** goal checks whether your program contains an `end game` block. To see that the ending really works, try winning your game yourself.
- The same game can be solved in many ways. Your solution may be very different from mine; that is a good thing.

### Example solution: Fruit hunter
If you get stuck on an idea, look at this example design: a cat (in 4 directions, stay on screen), a ghost bouncing around from a corner (Enemy), and every second a cherry (Food) in a random place that lives for 5 seconds. A cherry gives 1 point and the ghost takes 1 life; when the score reaches 5, "Hunter wins!" appears and the game is won; there are sounds and screen shakes. You can make this design on your own, then change it.

### Try it
1. Add a **time limit** to your game: `start countdown from [30] seconds`, and decide what happens in the `when time runs out` event.
2. Add **levels** to your game: when the score reaches 5, make the enemy faster (with a variable, as in lesson 27).
3. Draw a maze or platforms in the **Map** tab and move your game onto the map.
4. Draw your own pictures in the **Pictures** tab.
5. On the free Game Workshop page (outside the lessons), you can download your game as a file with the **💾 Save** button and load it back with **📂 Open**.

### Common mistakes
- Choosing the wrong kind in a collision event: if the event expects "Food" but you made the sprite with the **Object** kind, the event never runs and the score does not change.
- Trying to put one event block inside another event block: event blocks only stand on their own, in the workspace.
- Trying to do lots of things at once and not finishing any part: first the skeleton, then the danger, then the ending, and polish last.
- Pressing the **↺ Start over** button by accident: the activity goes back to the starter project and the blocks you made are gone. The ↺ on the stage only restarts the game.

## Discuss
What is the strongest thing about your game? If someone played it, what would they understand in the first 10 seconds? What would be the first thing you would add in the next version?
