### Week goals
By the end of this week the learner:
1. Can say what a stage, a sprite, a kind and a variable are; can put a sprite wherever they want on the stage with x and y coordinates.
2. Can walk a sprite with the arrow keys, choose its speed and keep the sprite on the screen.
3. Can change a sprite's picture, direction and speech with button events (A, B, direction keys).
4. Can give a sprite a speed and bounce it off the edges; can give a direction in degrees.
5. Can build a small game by splitting it into a goal list, and add feedback such as sound and explosions.

### Plan for the week
The week has five lessons. The plan below is for one lesson a day. Every activity happens in the Game Workshop, on the virtual stage; no camera, kit or paper is needed.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Set up your stage: colour, cat and apple | ~20 min | Read the explainer, put the cat and the apple on the stage, change the x and y values and see the result, do the mini quiz. |
| 2 | Walk the cat with the arrow keys | ~20 min | Build the key movement block, try the speed, add the stay on screen setting. |
| 3 | Change and talk when you press the A button | ~20 min | Write the button events; try the picture, direction and talking blocks. |
| 4 | The ball that keeps bouncing | ~20 min | Give a speed, turn on bounce, tile with grass, give a direction in degrees. |
| 5 | Project: The wandering cat | ~30 min | Do the seven goals one at a time, add the A and B abilities, add your own touch. |

### Prerequisite check
No special knowledge is needed this week. Before you start, check the following:
- Does the Game Workshop open in the browser, and do the start, stop and restart buttons under the stage work?
- Can the learner drag blocks with the mouse and snap them together?
- Can they compare numbers? (Which is bigger, which is smaller? What is a minus number?)
- Can they multiply and add (speed x time)? Lessons 2 and 4 use this.

### Concept map
- **Stage:** stage (160 x 120) → sprite → position (x, y) → kind → variable
- **Input:** controller → key movement → way of moving → stay on screen → event (pressed, released)
- **Movement:** speed (x speed, y speed) → minus and plus → bounce → direction (degrees) → tiled background
- **Sprite actions:** changing the picture → direction (faces right/left) → speech bubble
- **Project:** goal list → run, try, fix → feedback (explosion, shake, sound)

### Common mistakes
- **Not connecting blocks to the `when game starts` block.** A block that is not connected never runs.
- **Not restarting after a change.** The stage runs the old version; press the ↺ button.
- **Thinking y grows upwards.** y grows downwards; to go up, make y smaller.
- **Using `this sprite`.** The sprite made last is affected; give each sprite its own variable name.
- **Giving two sprites the same variable name.** The first sprite can never be reached again.
- **Forgetting the stay on screen setting.** The sprite leaves the screen and cannot be seen.
- **Choosing the wrong way of moving.** With left-right chosen, the up key does nothing; this is not a bug.
- **Writing 90 for up in degrees.** Up is 0, right 90, down 180, left 270.
- **Not turning on the bounce setting.** The ball goes out through the edge and is never seen again.
- **Putting notes one after another and expecting them to play in order.** Sound blocks do not wait for each other; they all play at the same time.

### End-of-week review
1. Look at each lesson's concept cards once more and read the "common mistake" lines out loud.
2. Read again the explanations of the questions you got wrong in the mini quizzes, then do the question again.
3. Set up the stage again from scratch, without looking: blue background, cat at the bottom left, apple at the top right. Write the x and y values on paper first, then try them.
4. Walk the cat first with speed 40, then with speed 120. Work out how many pixels it goes in 2 seconds and compare with what you see.
5. Answer this question in your own words: "What is the difference between key movement and a button event?"

The five lessons' mini quizzes are enough as an end-of-week test; 5 questions in each lesson, 25 questions in total. Target: at least 4 right in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (The wandering cat)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Stage and movement | The cat does not walk or it leaves the screen | The cat walks and stays on the screen, the star bounces, the floor is tiled | The speeds are chosen to suit the game and the learner can explain why |
| Events | One of the A and B events does not work | Talking and the melody work on A, the explosion and sound on B | At least two abilities of their own have been added to the events |
| Goals | Fewer than half of the goals are green | All seven goals are green | Extra abilities have been added without breaking the goals |
| Organisation | The blocks are messy and the variable names are mixed up | Each sprite has its own variable and the blocks are tidy | The blocks are grouped and the learner can explain what they do |
| Explanation | Cannot explain what they did | Explains step by step how the game works | Explains how they found and fixed a bug |

### Note for parents and teachers
- **Aim.** This week the aim is for the child to see that they "can make the computer do what they say". The first game is small, but it is a working game. Programming with blocks teaches logic without the fear of typing mistakes.
- **How to help.** When they get stuck, instead of giving the answer, ask these questions: "Which event is this block under?", "Which block runs first?", "Did you restart the stage?"
- **Time.** Spacing the lessons out, instead of doing them one after another on the same day, helps learning stick. As soon as the activity is finished, ask the child to show you the game; explaining is the best review.
- **Curiosity and creativity.** The free experiments in the "Try it" sections are not compulsory, but they are where most of the learning happens. Changing the sprite's picture and floor makes the child feel that the game is their own.
- **Safety.** Everything on this platform is virtual; no personal information is entered. When sharing games, do not use names or photos.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (a draft/pilot feature; recorded only if consent has been given).
