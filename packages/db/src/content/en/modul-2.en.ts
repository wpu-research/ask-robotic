import type { ModuleEn } from '../en'

// Modul 2 (Scratch) English: weeks and lessons in the same order as modul-2-scratch.ts + extras/modul-2.ts.
export const modul2En: ModuleEn = {
  weeks: [
    // Week 1
  {
    guideMd: `### Week goals
By the end of this week, the learner:
1. Can explain that a program is a list of commands in order, which the computer follows exactly.
2. Can show that the order of commands changes the result, and that **tekrarla** (repeat) makes a program shorter.
3. Can find the stage, the sprite list, the block palette and the code area in Stage Workshop, and can say how a sprite, a costume and a backdrop are different.
4. Can start a program with the **when green flag clicked** hat block.
5. Can read the x and y coordinates on the stage and move a sprite to any place they choose.

### Week plan
The week has two lessons; the third day is free project time. If you want a busier timetable, you can put both lessons on the same day.

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | A programmed dance | ~25 min | Read the explainer, write the dance program, watch Robot, find and fix the bug, do the mini quiz. |
| 2 | My first project in Stage Workshop | ~30 min | Get to know the parts, add a new sprite and a backdrop, snap a motion block under the flag and run it. |
| 3 | Week project: My first project | ~20 min | Make your sprite do something with 10 different blocks; show it to a friend. |

### Prerequisite check
No special knowledge is needed this week. Before you start, check these:
- Does Stage Workshop open in the browser?
- Can the learner drag and drop with the mouse?
- Are they comfortable with left-right and up-down? (Coordinates are built on these.)

### Concept map
- **Program:** command → order → repeat → debugging
- **Stage Workshop:** stage, sprite list, block palette, code area → sprite, costume, backdrop
- **Starting:** hat block → when green flag clicked
- **Position:** x (grows to the right), y (grows upwards), centre (0, 0)

### Common mistakes
- **Not snapping blocks onto the flag.** The blocks sit next to each other but are not joined; nothing happens.
- **Working in another sprite's code area.** Every sprite has its own code; check which sprite is selected.
- **Mixing up sprite and costume.** A costume is how a sprite looks; it is not a separate character.
- **Missing the order of commands.** Turning first and then walking is different from walking first and then turning.
- **Thinking y goes the wrong way.** y grows as you go up; to go down you need a minus number.

### End-of-week review
1. Read the concept cards for each lesson once more and say the "common mistake" lines out loud.
2. Read the explanations for the mini quiz questions you got wrong, then answer the question again.
3. Write the Robot dance again without looking, and use a **tekrarla** (repeat) card in one place.
4. Draw the stage on paper and write (0, 0) in the middle. Say the coordinates of three points.
5. Answer in your own words: "What is the difference between a sprite, a costume and a backdrop?"

The two lessons' mini quizzes are enough as the end-of-week test; 9 questions in total. Goal: at least 3 correct from each lesson. If one lesson is weak, go back to its explainer.

### Project rubric (My first project)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Starting | The blocks are not joined to the flag, the project does not run | The sprite moves when you click the flag | Uses more than one hat block or sprite |
| Stage | The character and backdrop are left as they were | A new character and a backdrop have been chosen | Explains their choices with a story |
| Blocks | Fewer than 5 different blocks | 10 different blocks | More than 10, and the blocks do something meaningful |
| Explaining | Cannot explain what they made | Explains their blocks in order | Explains a mistake they made and how they fixed it |

### Note for parents and teachers
- **Goal.** This week is not about memorising anything. It is about the child feeling that the computer does not interpret, and getting used to Stage Workshop. A wrong block is only on the screen; it can be undone.
- **How to help.** Instead of giving the answer, ask: "Are the blocks joined to the flag?", "Which sprite is selected?", "What did Robot do, and what had you written?"
- **Time.** Spreading the lessons out, rather than doing them back to back on the same day, helps learning stick.
- **Safety.** Real names, schools, addresses and photos are not written in the project or the project notes. They could be seen in a shared file.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; saved only if consent has been given).`,
    lessons: [
      {
        title: 'A programmed dance',
        problem: 'You need to teach a friend a dance, but only with written command cards. How do you write a dance?',
        contentMd: `## Activity
1. You have three command cards: **step**, **turn** and **clap**. In the activity window, use these cards to teach Robot a dance of 6 cards.
2. Line the cards up in order under the flag: this is your dance **program**.
3. Robot follows the cards **exactly** and adds nothing of its own. Click the flag and look only at what Robot does. If you like, explain the dance by showing it to your family.
4. If the dance looks wrong, fix the program: change cards, add cards, take cards away.
5. Now add a **repeat** to the dance: "repeat 3 times: step, clap".

## Note for parents / teachers
Goal: help the child feel that the computer **does not interpret**; it follows what is written exactly. The person acting out the dance should not fix any unclear card. The child should learn to say "the program came out wrong, that's my mistake".`,
        question: 'Why didn\'t the dance come out the way you wanted? What did you change in the program?',
        explainerMd: `### What you will learn in this lesson
- What a program is and how the computer follows it
- Why the order of commands changes the result
- How to write the same job in a short way with **repeat**
- How to find the bug in a program that doesn't work

### What you should know first
Nothing. This lesson needs no computer knowledge; you will teach Robot a dance with command cards.

### A program is a recipe made of commands
A **program** is a list of commands given to a computer in order. It is like a recipe: "crack the egg, pour it into the pan, cook it." But the computer is a very careful cook who never thinks for itself. It does **exactly** what you write. It never guesses "they probably meant this".

### Order matters
At the start, Robot faces right. Look at these two programs:
\`\`\`
yeşil bayrak tıklanınca
  40 adım git
  ↻ 90 derece sağa dön
  Alkış sesini çal
\`\`\`
\`\`\`
yeşil bayrak tıklanınca
  ↻ 90 derece sağa dön
  40 adım git
  Alkış sesini çal
\`\`\`
In the first one, Robot walks right first, then faces down and claps. In the second one, it faces down first, then walks down. The same three cards, a different order, a different dance.

### Repeat
To do the same two cards three times, you don't have to line up six cards:
\`\`\`
3 kere tekrarla
  20 adım git
  Alkış sesini çal
\`\`\`
The **repeat 3 times** block runs the cards inside it three times. The program gets shorter, and it is easier to change.

### Finding bugs
If the dance looks wrong, the computer did not make a mistake; the program did what you wrote. A mistake in a program is called a **bug**, and finding and fixing it is called **debugging**. Here's how: follow the cards in order with your finger and say what Robot will do at each card. The card where things stop matching what you expected is the wrong card.

### Summary
A program is commands in order. The computer follows the commands exactly and in order. The repeat block runs the same commands a set number of times. If a program doesn't do what you expected, you find the bug by following the commands one by one.`,
        concepts: [
          { term: 'Program', definition: 'A list of commands given to a computer, in order.', example: 'When you line up the dance cards under the flag, you have written a dance program for Robot.', pitfall: 'Thinking the computer will understand what you mean; it only does what is written.' },
          { term: 'Command', definition: 'The smallest piece that makes the computer do one job (a block or a card).', example: '"Move 20 steps" is a command.', pitfall: 'Leaving out a step and expecting the computer to fill it in by itself.' },
          { term: 'Order', definition: 'Commands run from top to bottom, in the order they are written.', example: 'Turning first and then walking takes you to a different place from walking first and then turning.', pitfall: 'Putting the same cards in a different order and expecting the same result.' },
          { term: 'Repeat', definition: 'A block that runs the commands inside it a set number of times.', example: '"Repeat 3 times: move, clap" makes the dance do the step and the clap three times.', pitfall: 'Putting cards next to the repeat block instead of inside it; then they run only once.' },
          { term: 'Hat block', definition: 'A block that starts a stack of commands. The flag hat block runs the program when you click the green flag.', example: 'The cards under the "when green flag clicked" block run when you click the flag.', pitfall: 'Leaving cards next to the flag without snapping them on; commands that are not joined never run.' },
          { term: 'Debugging', definition: 'Finding and fixing a mistake in a program.', example: 'When the dance looks wrong, you follow the cards in order and find the card where things stop matching what you expected.', pitfall: 'Blaming the computer when something goes wrong; the mistake is usually in the program.' },
        ],
        quiz: [
          { id: 'm2h1d1-q1', kind: 'mcq', prompt: 'Even if Robot thinks a card in the dance program is strange, what does it do?', options: ['It fixes it in its own way', 'It skips the card', 'It follows the card exactly', 'It stops and asks you'], answer: 2, explanation: 'A computer does not interpret; it follows the written command exactly. That\'s why making the program right is your job. Robot never fixes, skips or asks about things by itself.', skills: ['sh-program'] },
          { id: 'm2h1d1-q2', kind: 'predict-output', prompt: `At the start, Robot faces right. What does Robot do when this program runs?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  20 adım git\n  ↻ 90 derece sağa dön\n  30 adım git\n\`\`\``, options: ['First it moves 20 steps to the right, then 30 steps downwards', 'First it moves 20 steps down, then 30 steps to the right', 'It moves 50 steps to the right', 'It moves 30 steps upwards'], answer: 0, explanation: 'The commands run in order: first 20 steps while facing right, then it turns right (now it faces down) and moves 30 steps. The turn comes after the walk, so the first 20 steps still go to the right.', skills: ['sh-program'] },
          { id: 'm2h1d1-q3', kind: 'numeric', prompt: `How many steps does Robot walk in total?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  10 adım git\n  4 kere tekrarla\n    5 adım git\n\`\`\``, answer: 30, tolerance: 0, unit: 'steps', explanation: 'The first command walks 10 steps. The repeat block walks 5 steps 4 times: 4 × 5 = 20 steps. Total: 10 + 20 = 30. Repeat only repeats what is inside it, not the 10 steps outside.', skills: ['sh-loop', 'sh-program'] },
          { id: 'm2h1d1-q4', kind: 'find-bug', prompt: `Deniz wants Robot to turn first and then clap. He clicks the flag, but nothing happens. This is in the code area:\n\n\`\`\`\nyeşil bayrak tıklanınca\n\n↻ 90 derece sağa dön      (standing apart)\nAlkış sesini çal        (standing apart)\n\`\`\`\n\nWhat is the problem?`, options: ['The angle of the turn block is too small', 'Robot has no clap sound', 'The flag block is the wrong colour', 'The turn and clap blocks are not snapped onto the flag block'], answer: 3, explanation: 'Commands that are not joined to the flag block never run, because there is no hat block to start them. You need to snap the blocks under the flag. A small angle or the chosen sound would not fix it: the blocks don\'t run, so these settings are never seen.', skills: ['sh-debug', 'sh-program'] },
        ],
      },
      {
        title: 'My first project in Stage Workshop',
        problem: 'The instructions you write will control the character on the screen. But where do the character, the stage and the instructions live?',
        contentMd: `## Getting ready
Use **Stage Workshop** in the activity window. Your project is saved in this browser; you don't need an account or to install anything.

## Activity
1. Find the parts of the screen: the **Stage** (top right), the **Sprite list** (bottom right), the **Block palette** (left) and the **Code area** (middle).
2. Delete the cat sprite and choose a new sprite. You build code in the **Code** tab and the way your character looks in the **Costumes** tab; look at both.
3. Add a **backdrop** to the stage.
4. From the Events (yellow) category, drag the **when 🏁 clicked** (green flag) hat block into the code area.
5. Snap a motion block from the Motion (blue) category under it and click the green flag.
6. **10-block challenge:** make your sprite do something using 10 different blocks. How many could you use?

## Safety note
When you share your project (by downloading it as a file), don't write your **real name, school, address or photo** in the project or in the project notes.`,
        question: 'What is the difference between a sprite, a costume and the stage?',
        explainerMd: `### What you will learn in this lesson
- The parts of Stage Workshop
- The difference between a sprite, a costume and a backdrop
- How to start a program with **when green flag clicked**
- How to read the x and y coordinates on the stage

### What you should know first
Lesson 1: a program is made of commands, the commands run in order, and they must be joined to a hat block.

### The parts of Stage Workshop
At the top right is the **stage**; that is where the game is played. At the bottom right is the list of characters on the stage. On the left is the block palette, and in the middle is the **code area**.

### Sprite, costume, backdrop
A **sprite** is the character itself on the stage. A **costume** is how that character looks; a sprite can have more than one costume. The **backdrop** is the picture of the stage. You make costumes in the **Costumes** tab and code in the **Code** tab. Every sprite has its own code: the code area belongs to the sprite that is selected right now. The blocks that make the dog walk must be in the dog's code area.

### Starting a program
Blocks that sit on their own do nothing. A program starts with a **hat** block. The one used most is the **when green flag clicked** block. The blocks you snap under it run when you click the flag.

### Coordinates
The stage is like a grid. Its centre is the point (0, 0). **x** grows to the right, and **y** grows upwards. The stage is 480 units wide and 360 units tall. So x is between −240 and 240, and y is between −180 and 180. Example:
\`\`\`
yeşil bayrak tıklanınca
  x: 60 y: -40 konumuna git
  y'yi 20 değiştir
\`\`\`
First the sprite goes to the point (60, −40), then y goes up by 20: it becomes (60, −20).

### Safety
If you are going to share your project as a file, don't write your real name, school, address or photo in the project or the project notes.

### Summary
Sprites act on the stage; a costume is how a sprite looks, and the backdrop is the picture of the stage. Every sprite has its own code. A program starts with a hat block. A position is given as (x, y); the centre is (0, 0), x grows to the right and y grows upwards.`,
        concepts: [
          { term: 'Sprite', definition: 'A character or object on the stage. Every sprite has its own code.', example: 'The cat and the dog are two different sprites; each has its own code area.', pitfall: 'Expecting a sprite that is not selected to move; code is written for whichever sprite is selected.' },
          { term: 'Costume', definition: 'One of the ways a sprite can look.', example: 'The cat has two costumes: two poses of its step.', pitfall: 'Thinking a costume is a separate character; when the costume changes, the sprite stays the same.' },
          { term: 'Backdrop', definition: 'The picture of the stage. It sits behind the sprites.', example: 'If you choose a sky backdrop, the cat appears in front of the sky.', pitfall: 'Trying to move the backdrop like a sprite.' },
          { term: 'Code area', definition: 'The middle part where you drag and join blocks. It shows the code of the selected sprite.', example: 'When the cat is selected, the cat\'s blocks appear in the code area.', pitfall: 'Writing code while the wrong sprite is selected, then being surprised when nothing happens on the stage.' },
          { term: 'Coordinate', definition: 'Two numbers that show a position on the stage: x (grows to the right) and y (grows upwards). The centre is (0, 0).', example: '"Go to x: 60 y: -40" takes the sprite to a place on the right and a little lower down.', pitfall: 'Thinking y goes the wrong way: to go down, y gets smaller.' },
        ],
        quiz: [
          { id: 'm2h1d2-q1', kind: 'mcq', prompt: 'In Stage Workshop, which tab do you go to if you want to change how a character looks (its picture)?', options: ['Code', 'Costumes', 'Sounds', 'Block palette'], answer: 1, explanation: 'How a character looks is kept in its costume and changed in the Costumes tab. The Code tab holds the blocks, and the Sounds tab holds the sounds.', skills: ['sh-stage'] },
          { id: 'm2h1d2-q2', kind: 'mcq', prompt: 'Which one is true?', options: ['A sprite is the backdrop picture of the stage', 'The backdrop is the sprite\'s code', 'A costume is one of the ways a sprite can look', 'The code area is shared by all the sprites'], answer: 2, explanation: 'A sprite is a character, a costume is how it looks, and the backdrop is the picture of the stage. The code area is not shared; every sprite has its own code.', skills: ['sh-stage'] },
          { id: 'm2h1d2-q3', kind: 'predict-output', prompt: `The cat starts at the point (0, 0). When you click the flag, where does the cat end up?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  x: -100 y: 50 konumuna git\n  x'i 30 değiştir\n  y'yi -80 değiştir\n\`\`\``, options: ['(-70, -30)', '(-130, 130)', '(-70, 30)', '(-100, -30)'], answer: 0, explanation: 'First it goes to the point (-100, 50). 30 is added to x: -100 + 30 = -70. -80 is added to y: 50 - 80 = -30. The result is (-70, -30).', skills: ['sh-coords'] },
          { id: 'm2h1d2-q4', kind: 'numeric', prompt: `At the start, the cat is at x = -150. When you click the flag, what is the cat\'s x value?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  4 kere tekrarla\n    x'i 30 değiştir\n\`\`\``, answer: -30, tolerance: 0, unit: 'x', explanation: '30 is added to x four times: 4 × 30 = 120. -150 + 120 = -30. When you go right, x grows, so the number gets closer to zero.', skills: ['sh-coords', 'sh-loop'] },
          { id: 'm2h1d2-q5', kind: 'find-bug', prompt: `Seda wants the dog to walk too when she clicks the flag. But only the cat walks:\n\n\`\`\`\nCat's code area:\n  yeşil bayrak tıklanınca\n    20 adım git\n\nDog's code area:\n  (empty)\n\`\`\`\n\nWhat is the problem?`, options: ['The dog is missing a costume', 'The green flag only runs the first sprite', '20 steps is too few for the dog', 'The dog has no code of its own; the walking block is only in the cat\'s code area'], answer: 3, explanation: 'Each sprite only runs the blocks in its own code area. The dog\'s code area is empty, so it doesn\'t move. You need to select the dog and give it a green flag block and a motion block too.', skills: ['sh-stage', 'sh-debug'] },
        ],
      },
    ],
  },
    // Week 2
  {
    guideMd: `### Week goals
By the end of this week, the learner can:
1. Make an animation by switching costumes, and knows that the **next costume** block goes back to the start after the last costume.
2. Work out how the wait time changes the speed of an animation (a 0.2 second wait means 5 changes per second).
3. Explain the difference between **forever** and **repeat N times**, and choose the right one.
4. Show that several sprites can run at the same time (in parallel).
5. Move a character around the stage with **if on edge, bounce**.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Switch costumes, make your character walk | ~30 min | Bring a two-costume character to life, set the wait time to 0.1 and 1 second, and see the difference. |
| 2 | Forever and repeat | ~30 min | Put the blocks inside the loop, make the character bounce off the edge, and bring a second sprite to life too. |
| 3 | Week project: A living character | ~25 min | Make a walking scene with two characters, choose a backdrop and show it to a friend. |

### Prerequisite check
- Can the learner put a green flag hat block on a sprite and snap blocks to it?
- Can they say the difference between a costume and a sprite? (Week 1)
- Do they understand decimal seconds like 0.2? If needed, first work on paper: "How many 0.2s fit into 1 second?"

### Concept map
- **Animation:** costume → next costume → wait → speed (1 ÷ wait time)
- **Loop:** repeat (counted) → forever → inside and outside the loop
- **Parallel running:** two sprites → two separate scripts → run at the same time
- **Movement:** move steps → if on edge, bounce

### Common mistakes
- **Putting the blocks outside the loop.** They run only once, so the character takes one step and stops.
- **Forgetting the wait block.** The change is so fast that your eyes cannot see it.
- **Making the wait time big and thinking it is "stuck".** A 1 second wait looks like a slide show.
- **Leaving the if on edge, bounce block outside the loop.** The character tries to bounce once, then stays at the edge.
- **Leaving the second sprite's code area empty.** Only a sprite that has code will move.

### End-of-week review
1. Read the concept cards and say the "common mistake" lines out loud.
2. Solve again the mini quiz questions you got wrong, together with their explanations.
3. If the wait time is 0.5, how many changes happen per second? Then work it out for 0.1.
4. From scratch, write a program where the character jumps 5 times and then says "Done!".
5. Answer in your own words: "When do you use forever, and when do you use repeat?"

The mini quizzes of the two lessons are enough as the end-of-week test; 10 questions in total. Goal: at least 3 correct answers from each lesson.

### Project rubric (A living character)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Animation | The character does not move, or it is too fast for the eye to follow | The costume changes and movement can be followed by eye | The speed is chosen on purpose and the reason is explained |
| Loop | The movement blocks are outside the loop | The blocks are inside the loop and the right loop is chosen | Uses both a counted loop and a forever loop in the right places |
| Number of sprites | One sprite | Two sprites come to life at the same time | Two sprites move at different speeds and in different directions, bouncing off the edge |
| Explaining | Cannot explain what they did | Explains the program step by step | Compares the result with another speed they tried |

### Note for parents and teachers
- **Goal.** The child should see that a loop means "doing the same job again and again", and that two sprites run at the same time.
- **How to help.** Ask: "Are the blocks inside or outside the loop?" and "What will happen if we change the wait time? Guess!"
- **Watching.** If the character does not move, first check whether the blocks are snapped to the hat block.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; saved only if consent was given).`,
    lessons: [
      {
        title: 'Switch costumes, make your character walk',
        problem: 'How do cartoons move? What happens if we quickly show slightly different pictures of the same character, one after another?',
        contentMd: `## Activity
1. Choose a sprite. It should have at least two costumes in the **Costumes** tab (pick ready-made ones or draw your own).
2. Find the **next costume** block in the Looks (purple) category.
3. Under the green flag block, build this: *next costume → wait 0.2 seconds*.
4. Run it. Does the character look like it is walking?
5. Change the wait time to 0.1 and to 1 second. What changes when it gets faster or slower? (The stage is drawn 30 times a second. 0.1 seconds is 3 frames, which means 10 changes per second. With waits much shorter than this, your eyes cannot see the difference.)

## Debugging tip
If the character does not move at all: are the blocks **really snapped** to the green flag block? Just standing next to it is not enough.`,
        question: 'Why did the animation look smoother when you made the wait time shorter?',
        explainerMd: `### What you will learn in this lesson
- How to make an animation by switching costumes
- How the **next costume** block works
- How the wait time changes the speed
- How to find out why a character does not move

### What you should know first
Lesson 2: the difference between a sprite and a costume, and the green flag hat block.

### What is animation?
In a cartoon, the character does not really walk. Slightly different pictures are shown quickly, one after another, and your eyes think it is moving. In Stage Workshop, these pictures are the sprite's **costumes**. The cat has two costumes; they show the two halves of a step.

### Next costume
The **next costume** block switches the sprite to its next costume. If it is on the last costume, it goes back to the start. The cat has 2 costumes, so the order goes like this: 1, 2, 1, 2, 1... So if this block runs three times, the cat ends up on costume 2.

### Set the speed with wait
Without a wait block, the change happens about 30 times a second; your eyes cannot see it. With **wait**, the speed is in your hands. To find how many changes happen per second, divide 1 by the wait time:
- 0.2 second wait: 1 ÷ 0.2 = 5 changes per second
- 0.1 second wait: 1 ÷ 0.1 = 10 changes per second
- 1 second wait: 1 change per second (like a slide show)

The stage is drawn 30 times a second. That is why the sum does not work exactly for very short times like 0.05; it works for 0.1 and above.

Example program:
\`\`\`
yeşil bayrak tıklanınca
  10 kere tekrarla
    sonraki kostüm
    0.2 saniye bekle
\`\`\`
Here there are 10 rounds, and each round takes 0.2 seconds. The program runs for 10 × 0.2 = 2 seconds.

### Debugging
If the character does not move at all, first check whether the blocks are really snapped to the flag. If it flickers too fast, add a wait in between.

### Summary
Animation means showing costumes one after another. **next costume** goes back to the start after the last costume. The shorter the wait time, the faster the animation; the number of changes per second is 1 divided by the wait time.`,
        concepts: [
          { term: 'Animation', definition: 'Showing slightly different pictures quickly, one after another, so that they look like movement.', example: 'When you switch the cat\'s two costumes quickly, the cat looks like it is walking.', pitfall: 'Expecting animation with only one costume; you need at least two different costumes.' },
          { term: 'next costume', definition: 'Switches the sprite to its next costume; after the last costume it goes back to the start.', example: 'On a cat with 2 costumes, running it three times leaves the cat on costume 2.', pitfall: 'Thinking it will give an error after the last costume; the order goes back to the start.' },
          { term: 'wait', definition: 'Pauses the program for the given number of seconds.', example: 'With "wait 0.2 seconds", the costumes change 5 times a second.', pitfall: 'Forgetting to add a wait: the animation becomes too fast for your eyes to see.' },
          { term: 'Working out speed', definition: 'Changes per second = 1 ÷ wait time.', example: 'With a 0.1 second wait, there are 1 ÷ 0.1 = 10 changes.', pitfall: 'Thinking the animation will slow down when you make the time smaller; less time means more speed.' },
          { term: 'Frame', definition: 'A single picture of an animation; here, one costume of the sprite.', example: 'The walking cat has two frames.', pitfall: 'Expecting smooth movement without adding more frames; with few costumes, the movement looks jumpy.' },
        ],
        quiz: [
          { id: 'm2h2d1-q1', kind: 'mcq', prompt: 'How do you make an animation?', options: ['By making the sprite bigger and smaller', 'By showing slightly different pictures quickly, one after another', 'By deleting the backdrop', 'By playing a sound all the time'], answer: 1, explanation: 'An animation is made by quickly showing pictures that look alike but are slightly different, one after another. In Stage Workshop, these pictures are costumes.', skills: ['sh-costume'] },
          { id: 'm2h2d1-q2', kind: 'predict-output', prompt: `The cat has 2 costumes and starts on costume 1. Which costume is the cat on when the program ends?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  sonraki kostüm\n  sonraki kostüm\n  sonraki kostüm\n\`\`\``, options: ['Costume 1', 'Costume 3', 'Costume 2', 'The program gives an error'], answer: 2, explanation: 'The costume order goes round: 1, 2, 1, 2. After three changes, it stays on costume 2. There is no costume 3; after the last costume it goes back to the start, with no error.', skills: ['sh-costume', 'sh-program'] },
          { id: 'm2h2d1-q3', kind: 'numeric', prompt: `How many seconds does this program last?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  12 kere tekrarla\n    sonraki kostüm\n    0.1 saniye bekle\n\`\`\``, answer: 1.2, tolerance: 0, unit: 'seconds', explanation: 'Each round waits 0.1 seconds. 12 rounds: 12 × 0.1 = 1.2 seconds. Switching costume takes no time; the wait block decides how long it lasts.', skills: ['sh-wait', 'sh-loop'] },
          { id: 'm2h2d1-q4', kind: 'numeric', prompt: 'In an animation that waits 0.1 seconds at the end of each round, how many times does the costume change in one second?', answer: 10, tolerance: 0, unit: 'times', explanation: 'Changes per second = 1 ÷ wait time: 1 ÷ 0.1 = 10. The shorter the wait time, the faster the animation.', skills: ['sh-wait', 'sh-costume'] },
          { id: 'm2h2d1-q5', kind: 'find-bug', prompt: `Efe wants to watch the cat walk, but the cat only seems to flicker:\n\n\`\`\`\nyeşil bayrak tıklanınca\n  10 kere tekrarla\n    sonraki kostüm\n\`\`\`\n\nWhat is the problem?`, options: ['There is no wait after each costume; the change is too fast for the eye to see', 'The repeat number is too small', 'The cat has no costumes', 'The green flag block is missing'], answer: 0, explanation: 'Because there is no wait block, the costumes change about 30 times a second and the eye cannot see the movement. Adding a 0.1–0.2 second wait to the loop fixes the problem.', skills: ['sh-debug', 'sh-wait'] },
        ],
      },
      {
        title: 'Forever and repeat',
        problem: 'You want your character to keep walking, but you don\'t want to drag 100 blocks. Is there another way?',
        contentMd: `## Activity
1. Carry on with your last project. Take the **forever** block from the Control (orange) category.
2. Put the costume-switching and movement blocks **inside** it.
3. What happens when the character hits the edge of the screen? Add the **if on edge, bounce** block.
4. Now try a counted loop with the **repeat 10 times** block instead of forever.
5. Add two sprites and make both of them animate at the same time. Start with a green flag in each of the two code areas.

## Challenge
Make the character stop after 10 steps and say something.

## Note for parents / teachers
Key ideas: **loop** and **parallel running** (two characters at the same time). If the child misses "putting the block inside", show them how the block's shape holds other blocks like a container.`,
        question: 'What is the difference between "forever" and "repeat 10 times"? When would you use each one?',
        explainerMd: `### What you will learn in this lesson
- The difference between **forever** and **repeat N times**
- What happens when you put blocks inside or outside a loop
- How to keep movement on the stage with **if on edge, bounce**
- How two sprites can run at the same time

### What you should know first
Lessons 1 and 3: the repeat block, **next costume** and **wait**.

### What is a loop for?
You don't have to drag 100 blocks to make the character keep walking. A **loop** runs the blocks inside it again and again. There are two kinds:
- **repeat N times** runs a set number of times and then finishes.
- **forever** runs until the program is stopped.

### Inside and outside the loop
It matters a lot whether a block is inside or outside the loop. The blocks inside run every round; the blocks outside run only once.
\`\`\`
yeşil bayrak tıklanınca
  x: -100 y: 0 konumuna git
  8 kere tekrarla
    15 adım git
\`\`\`
The move command runs 8 times: 8 × 15 = 120 steps. The cat stops at x = −100 + 120 = 20. The first command is outside the loop, so it ran only once.

### If on edge, bounce
If you don't want the character to get stuck when it reaches the edge of the stage:
\`\`\`
yeşil bayrak tıklanınca
  sonsuza kadar
    10 adım git
    kenara değince sek
    sonraki kostüm
    0.1 saniye bekle
\`\`\`
The **if on edge, bounce** block turns the character the other way when it hits the edge. This way, the cat keeps going back and forth across the stage.

### Running at the same time
If the cat and the dog both start with the green flag, they run at the same time. This is called **parallel** running. Each sprite runs its own loop in its own code area.

### Summary
A loop runs blocks again and again. Use repeat for a counted job, and forever for a job that never ends. The blocks inside the loop run every round. If on edge, bounce keeps the character on the stage. Each sprite's code can run at the same time.`,
        concepts: [
          { term: 'Loop', definition: 'A block that runs the blocks inside it again and again.', example: 'You put the cat\'s costume switching and walking inside a loop.', pitfall: 'Copying the same block by hand; a loop is both shorter and easier to fix.' },
          { term: 'forever', definition: 'A loop that repeats what is inside it until the program stops.', example: '"forever" is used for a character that keeps walking.', pitfall: 'Trying to add another block under it: nothing after a forever loop ever runs.' },
          { term: 'repeat N times', definition: 'A loop that runs what is inside it the given number of times and then finishes.', example: '"repeat 8 times: move 15 steps" walks 120 steps in total.', pitfall: 'Mixing up the number inside with the number of rounds: repeat 8 times and 15 steps are different numbers.' },
          { term: 'Inside and outside the loop', definition: 'The blocks inside run every round; the blocks outside run only once.', example: 'You put the block that goes to the starting position outside the loop.', pitfall: 'Leaving the walking block outside the loop and being surprised when the character takes one step and stops.' },
          { term: 'if on edge, bounce', definition: 'If the sprite touches the edge of the stage, it turns the other way.', example: 'When the cat reaches the right edge, it turns back.', pitfall: 'Putting this block outside the loop; it is tried only once and the character stays at the edge.' },
          { term: 'Parallel running', definition: 'The code of several sprites running at the same time.', example: 'The cat and the dog start with the same flag and walk at the same time.', pitfall: 'Leaving the second sprite\'s code area empty and expecting it to move too.' },
        ],
        quiz: [
          { id: 'm2h2d2-q1', kind: 'mcq', prompt: 'You want your character to walk around the stage without ever stopping. Which block is right?', options: ['repeat 5 times', 'wait 1 seconds', 'if on edge, bounce on its own', 'forever'], answer: 3, explanation: 'For a job that never ends, you use forever. Repeat 5 times stops after five rounds. Wait only pauses. If on edge, bounce on its own is not a loop, so it runs once.', skills: ['sh-loop'] },
          { id: 'm2h2d2-q2', kind: 'numeric', prompt: `What is the cat's final x value?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  x: -100 y: 0 konumuna git\n  8 kere tekrarla\n    15 adım git\n\`\`\``, answer: 20, tolerance: 0, unit: 'x', explanation: 'First the cat goes to x = -100. Then it walks 15 steps 8 times: 8 × 15 = 120. -100 + 120 = 20. The cat is facing right, so x goes up.', skills: ['sh-loop', 'sh-coords'] },
          { id: 'm2h2d2-q3', kind: 'predict-output', prompt: `The cat starts in the middle of the stage, facing right. When you click the flag, what do you see after a long time?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  sonsuza kadar\n    10 adım git\n    kenara değince sek\n    0.05 saniye bekle\n\`\`\``, options: ['The cat stops at the right edge', 'The cat hits the right edge, turns back and keeps going back and forth', 'The cat leaves the stage and disappears', 'The cat moves 10 steps and stops'], answer: 1, explanation: 'The forever loop keeps repeating the steps. If on edge, bounce turns the cat the other way at the edge; the cat goes to the left edge and turns again. So it keeps going back and forth. Without the edge block, the cat would stop at the right edge.', skills: ['sh-loop', 'sh-coords'] },
          { id: 'm2h2d2-q4', kind: 'find-bug', prompt: `Zara wants the cat to keep walking, but the cat takes one step and stops:\n\n\`\`\`\nyeşil bayrak tıklanınca\n  10 adım git\n  sonraki kostüm\n  sonsuza kadar\n    0.2 saniye bekle\n\`\`\`\n\nWhat is the problem?`, options: ['The wait time is too short', 'You need repeat instead of forever', 'The step and costume blocks are outside the forever loop; they run only once', 'The hat block is wrong'], answer: 2, explanation: 'The blocks inside the loop run every round; the ones outside run once. The step and costume blocks are outside the loop, so they run only the first time; the loop only waits. You need to drag both of them inside the forever block.', skills: ['sh-debug', 'sh-loop'] },
          { id: 'm2h2d2-q5', kind: 'mcq', prompt: 'The cat and the dog both have a green flag hat block. What happens when you click the flag?', options: ['Both run at the same time', 'The cat runs first, and the dog runs when the cat is finished', 'Only the sprite added first runs', 'The flag chooses one of them'], answer: 0, explanation: 'Each sprite has its own code, and the green flag starts them all at the same time. This is called parallel running.', skills: ['sh-parallel'] },
        ],
      },
    ],
  },
    // Week 3
  {
    guideMd: `### Week goals
By the end of this week, the learner can:
1. Explain what an **event** is, and say that clicking the green flag, pressing a key and clicking a sprite are all events.
2. Build an interactive program with the **when … key pressed** and **when this sprite clicked** hat blocks.
3. Tell the difference between **start sound** and **play sound until done**, and make a tune from notes played one after another.
4. Know that volume stays between 0 and 100, and work out how it changes.
5. Plan the instrument first and then build it, let a friend play it and get feedback.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Press a key, make a sound | ~30 min | Link sounds to the a, s, d, f keys, change the colour, make a sound play when you click the sprite. |
| 2 | My own instrument | ~35 min | Build a four-key instrument, add a visual reaction, play a tune with a record button. |
| 3 | Week project: My own instrument | ~25 min | Improve your instrument, let a friend play it and write down where they got stuck. |

### Prerequisite check
- Does the learner remember that the green flag is an event (a hat block)? (Week 1)
- Do they know that each sprite has its own code? In the instrument, each button can be a separate sprite.
- Can they find a sound and the block that plays it? (Sounds tab, Sound category)

### Concept map
- **Event:** green flag → when key pressed → when sprite clicked
- **Sound:** start sound (carries on straight away) → play sound until done (waits) → volume (0-100)
- **Visual reaction:** colour effect, size → back to normal
- **Design:** plan → build → try → fix

### Common mistakes
- **Choosing the wrong hat block.** Using the green flag hat when the sound should play on clicking the sprite.
- **Lining up notes with start sound.** They all play at the same time; to play them in order you need play until done or wait.
- **Not shrinking a button that grew.** The button grows when pressed but stays big for ever.
- **Linking the same key in two places.** It gets confusing which one will run.
- **Forgetting the 100 limit when working out volume.** Volume can't go above 100.

### End-of-week review
1. Look at the concept cards and say the "common mistake" lines out loud.
2. Solve the mini quiz questions you got wrong again, together with their explanations.
3. Make a three-note tune first with "start sound", then with "play until done"; listen for the difference.
4. Add two keys to your instrument that turn the volume down and up.
5. Answer in your own words: "What is the difference between the green flag and pressing a key?"

The two lessons' mini quizzes are enough as the end-of-week test; 9 questions in total. Goal: at least 3 right from each lesson.

### Project rubric (My own instrument)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Keys | Fewer than 4 keys work | 4 keys, each a different sound | 6 or more keys, neatly laid out |
| Visual reaction | Nothing changes on screen when a key is pressed | Growing, colour or costume change | The reaction goes back to normal afterwards |
| Tune | None | The record button plays 3 notes | The tune is in the right order, with the waits between notes set |
| Testing | Didn't let anyone play it | Let a friend play it and took notes | Fixed something based on the notes and explained it |

### Note for parents and teachers
- **Goal.** The child should notice that a program waits for something to happen (an event), and that notes need timing to play in order.
- **How to help?** Ask: "Which event starts this sound?" and "Are the sounds playing at the same time or one after another?"
- **All sounds are virtual.** You work with the ready-made sounds in the Sounds tab; there is no recording or uploading sounds from outside.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; saved only if consent was given).`,
    lessons: [
      {
        title: 'Press a key, make a sound',
        problem: 'When you press a piano key, it makes a sound. How can you do this with your keyboard?',
        contentMd: `## Activity
1. From the Events (yellow) category, take the **when … key pressed** block.
2. Snap a **start sound …** block from the Sound (pink) category under it (choose a sound from the sound list), then choose the key (for example **a**).
3. In the same way, link other sounds to the **s**, **d** and **f** keys.
4. For each key, change the sprite's colour (**change colour effect by** in the Looks category). Let the picture and the sound work together.
5. Also add a button that plays a sound with the mouse, using the **when this sprite clicked** hat block.

Note: Holding a key down does not, on its own, keep starting the hat block; the hat block works with the key-press event (and the keyboard's repeat events). If you want something to keep happening for as long as the key is held down, use the **key … pressed?** block in the Sensing category (lesson 9).

## Note for parents / teachers
Concept: **event**. The program is waiting for something to happen. The child should notice that "the program runs even without clicking the green flag".`,
        question: 'What is the difference between the green flag and pressing a key? Do both of them start a program?',
        explainerMd: `### What you will learn in this lesson
- What an **event** is
- How to start a program when you press a key or click a sprite
- How to play a sound and change the colour
- How to find an event that isn't working

### What you should know first
Lesson 2: a program starts with a hat block; the green flag is a hat block.

### What is an event?
When you press a piano key, it makes a sound; if you don't press it, it doesn't. On a computer, too, a program sometimes **waits for something to happen**. This something is called an **event**. Clicking the green flag is an event. Pressing a key on the keyboard is an event too. So is clicking a sprite with the mouse.

### Event hat blocks
Each event has its own hat block, and you find them in the Events category:
- **when green flag clicked**
- **when a key pressed** (you choose the key from the list)
- **when this sprite clicked**

The blocks under the hat block run only when that event happens.
\`\`\`
a tuşuna basılınca
  Do sesini çal
  renk efektini 30 değiştir

s tuşuna basılınca
  Re sesini çal
  renk efektini 30 değiştir
\`\`\`
Here, when you press the a key, Do plays and the colour changes; when you press the s key, Re plays. If no key is pressed, none of them run. A key that isn't linked (for example d) stays silent too.

### Sound and colour
A block like **start sound Do** plays a sound from the sprite's sound list. You must first add the sound to the sprite in the Sounds tab. To change the colour, you use the **change colour effect by** block in the Looks category. When sound and picture work together, the instrument looks alive.

### Choosing the right event
If something isn't working, first check whether you chose the right event. If you want a sound to play when you click the cat, the hat block must be **when this sprite clicked**. If you put it under the green flag hat block, the sound plays on the flag, not on the click.

### Summary
An event is something the program waits for: the flag, a key or a click. Each event has a hat block, and the blocks under it run only when that event happens. To play a sound and change the colour, you snap those blocks to the hat block. If an event isn't working, first make sure you chose the right hat block.`,
        concepts: [
          { term: 'Event', definition: 'Something the program waits for, which runs code when it happens: clicking the flag, pressing a key, clicking a sprite.', example: 'Pressing the a key is an event; the Do sound linked to it plays then.', pitfall: 'Expecting the program to run without the event happening (without pressing the key).' },
          { term: 'when key pressed', definition: 'A hat block that runs the blocks under it when the chosen key is pressed.', example: 'If you put the Re sound under "when s key pressed", the s key plays Re.', pitfall: 'Forgetting to choose the key, or using the same key in two hat blocks.' },
          { term: 'when this sprite clicked', definition: 'A hat block that runs when you click on the sprite with the mouse.', example: 'You use this hat block so that a meow sound plays when you click the cat.', pitfall: 'Using the green flag hat block for a sprite click; it does not start with a click.' },
          { term: 'start sound', definition: 'Plays the chosen sound and moves on to the next block without waiting.', example: '"Start sound Miyav" makes the cat meow.', pitfall: 'Trying to play a sound without adding it to the sprite; the sound must be in the list.' },
          { term: 'Colour effect', definition: 'A looks effect that changes the sprite\'s colour.', example: '"Change colour effect by 30" turns the cat a different colour on every key press.', pitfall: 'Making the effect value very small and not noticing that the colour changed.' },
        ],
        quiz: [
          { id: 'm2h3d1-q1', kind: 'mcq', prompt: 'What is the difference between the green flag hat block and the "when a key pressed" hat block?', options: ['There is no difference, both run at the same time', 'The green flag only plays sounds', 'The key hat block can only be used once', 'One starts when you click the green flag, the other when you press the a key'], answer: 3, explanation: 'Each hat block waits for its own event. The green flag hat block runs when the flag is clicked; the key hat block runs when that key is pressed. You can use the key hat block for as many different keys as you like.', skills: ['sh-events'] },
          { id: 'm2h3d1-q2', kind: 'predict-output', prompt: `The cat's code is:\n\n\`\`\`\na tuşuna basılınca\n  Do sesini çal\n\ns tuşuna basılınca\n  Re sesini çal\n\`\`\`\n\nIf the player presses the a, d and s keys in that order, which sounds play?`, options: ['Do, Mi, Re', 'Do, Re', 'Only Do', 'No sound plays'], answer: 1, explanation: 'The a key plays Do, and the s key plays Re. Nothing happens for the d key, because no hat block was written for it. The sounds play in the order of the presses: Do, then Re.', skills: ['sh-events', 'sh-sound'] },
          { id: 'm2h3d1-q3', kind: 'find-bug', prompt: `Ali wants the cat to meow when he clicks it, but no sound comes when he clicks:\n\n\`\`\`\nyeşil bayrak tıklanınca\n  Miyav sesini çal\n\`\`\`\n\nWhat is the problem?`, options: ['The Miyav sound must not have been added to the cat', 'The volume is too low', 'Wrong hat block: a click needs "when this sprite clicked"', 'The cat is too small'], answer: 2, explanation: 'The green flag hat block plays the sound when the flag is clicked; clicking the cat is a different event. You need the "when this sprite clicked" hat block. If it were a volume or sound list problem, there would be no sound on the flag either.', skills: ['sh-debug', 'sh-events'] },
          { id: 'm2h3d1-q4', kind: 'numeric', prompt: `In the instrument, the a, s, d and f keys each play one sound. The player presses the keys a, s, d, f, a, a in that order. How many sounds play in total?`, answer: 6, tolerance: 0, unit: 'sounds', explanation: 'Each key press plays one sound. Six presses make six sounds; pressing the same key again is still a new event, and the sound plays again.', skills: ['sh-events', 'sh-sound'] },
        ],
      },
      {
        title: 'My own instrument',
        problem: 'If you wanted to make a drum kit or a small piano, how many keys, how many sounds and what kind of look would you need?',
        contentMd: `## Activity
1. **Plan:** draw a picture of your instrument on paper. How many keys? Which sounds?
2. Make an instrument with at least **4 keys**. Each key should play a different sound.
3. Add **visual feedback** for each key: a colour change, growing, glowing.
4. Make one sprite a separate **record button**: when you click it, a tune plays by itself (play sound … until done, play sound … until done…).
5. Let a friend play it, write down the places that confused them, and fix them.

## Challenge
Add two keys to the instrument that change the volume (**change volume by 10** and **change volume by -10**).`,
        question: 'Where did your friend have the most trouble using your instrument? What did you change?',
        explainerMd: `### What you will learn in this lesson
- How to plan the instrument project first
- The difference between **start sound** and **play sound until done**
- How to give a visual reaction to a key press and go back to normal
- How to work out volume in the 0-100 range

### What you should know first
Lesson 5: events, the key hat block and the start sound block.

### Plan first
Before you make the instrument, draw it on paper: how many keys are there, which sound will each one play, and which keyboard key is it linked to? A plan stops you wondering "what do I do now?" once you move on to the blocks.

### Timing for a tune
A tune is notes playing **one after another**. But the **start sound** block starts the sound and goes straight on to the next block. This program starts all three sounds at the same time:
\`\`\`
bu sprite tıklanınca
  Do sesini çal
  Mi sesini çal
  Sol sesini çal
\`\`\`
To make them play in order, you either use **play sound until done**, or put a **wait** after each note:
\`\`\`
bu sprite tıklanınca
  Do sesini çal
  0.5 saniye bekle
  Mi sesini çal
  0.5 saniye bekle
  Sol sesini çal
  1 saniye bekle
\`\`\`
This tune lasts 0.5 + 0.5 + 1 = 2 seconds.

### Visual reaction
If a button grows when pressed and then shrinks back, the instrument looks alive:
\`\`\`
a tuşuna basılınca
  Do sesini çal
  boyutu % 130 yap
  0.1 saniye bekle
  boyutu % 100 yap
\`\`\`
If you don't go back to the old size, the button stays big for ever.

### Volume
Every sprite's volume is between 0 and 100. If you try to turn it up when it is at 100, it stays at 100. That's why, if you start at 100 and do +20, −20, −20, the result is 60, not 80.

### Summary
Plan before you make the instrument. To play notes in order, use play until done or wait. After a visual reaction, go back to normal. Volume is limited to between 0 and 100.`,
        concepts: [
          { term: 'start sound and play sound until done', definition: 'The start block starts the sound and carries on straight away; play until done waits for the end of the sound.', example: 'To play three notes one after another, you use "play until done".', pitfall: 'Lining up notes with only "start sound" and expecting them to play in order; they all start at the same time.' },
          { term: 'Tune', definition: 'Notes played in a certain order and for certain lengths of time.', example: 'Do, wait, Mi, wait, Sol is a simple tune.', pitfall: 'Not putting waits between the notes: the sounds get mixed up.' },
          { term: 'Visual feedback', definition: 'The reaction the player sees on the screen when they press: growing, a colour or costume change.', example: 'When the button plays, it grows to 130% and goes back to its old size.', pitfall: 'Forgetting to put the reaction back to normal, so the button stays big all the time.' },
          { term: 'Volume', definition: 'How loud the sprite\'s sound is; it is between 0 and 100.', example: '"Change volume by -20" turns the sound down.', pitfall: 'Thinking it can go above 100; volume is limited at 100.' },
          { term: 'Plan', definition: 'A sketch written or drawn on paper before you make the project.', example: 'Drawing the instrument\'s keys, its sounds and which keyboard keys they are linked to before you start.', pitfall: 'Starting without a plan and not knowing what to do after the first block.' },
        ],
        quiz: [
          { id: 'm2h3d2-q1', kind: 'mcq', prompt: 'What do you use to play three notes in order (one after the other finishes)?', options: ['Use "play sound until done" for each sound', 'Line up three "start sound" blocks one after another', 'Add three sprites', 'Turn the volume down'], answer: 0, explanation: '"Play sound until done" waits for the end of the sound, then moves on to the next block. "Start sound" blocks in a row start the sounds at the same time.', skills: ['sh-sound', 'sh-wait'] },
          { id: 'm2h3d2-q2', kind: 'predict-output', prompt: `What happens when this program runs?\n\n\`\`\`\nbu sprite tıklanınca\n  Do sesini çal\n  Mi sesini çal\n  Sol sesini çal\n\`\`\``, options: ['The three sounds play one after another', 'Only Do plays', 'Only Sol plays', 'The three sounds start at the same time'], answer: 3, explanation: '"Start sound" starts the sound and carries on without waiting. So the three blocks run almost at the same moment, and the three sounds start on top of each other. To play them in order, you need "play until done" or "wait".', skills: ['sh-sound'] },
          { id: 'm2h3d2-q3', kind: 'numeric', prompt: `How many seconds does this tune last?\n\n\`\`\`\nbu sprite tıklanınca\n  3 kere tekrarla\n    Do sesini çal\n    0.4 saniye bekle\n  1 saniye bekle\n\`\`\``, answer: 2.2, tolerance: 0, unit: 'seconds', explanation: 'The repeat block goes round 3 times and waits 0.4 seconds each time: 3 × 0.4 = 1.2. After the loop it waits 1 more second: 1.2 + 1 = 2.2. Starting a sound takes no time; only the wait blocks decide how long it lasts.', skills: ['sh-wait', 'sh-loop'] },
          { id: 'm2h3d2-q4', kind: 'find-bug', prompt: `Lale wants the button to grow for a moment and then shrink when pressed, but the button stays big all the time:\n\n\`\`\`\na tuşuna basılınca\n  Do sesini çal\n  boyutu % 130 yap\n\`\`\`\n\nWhat is the problem?`, options: ['The size percentage is too big', 'There is no block that sets the button back to its old size (100%)', 'Sound and size can\'t be under the same hat block', 'The key hat block is wrong'], answer: 1, explanation: 'There is no block that sets the size back to 100 after making it 130, so the button stays big. You need to put a short wait in between and then add "set size to 100 %".', skills: ['sh-debug', 'sh-events'] },
          { id: 'm2h3d2-q5', kind: 'numeric', prompt: `A sprite's volume starts at 100. These three blocks run in order: "change volume by 20", "change volume by -20", "change volume by -20". What is the volume at the end?`, answer: 60, tolerance: 0, unit: 'level', explanation: 'Volume can\'t go above 100: the first block doesn\'t make 100 into 120, it leaves it at 100. Then -20 makes it 80, and -20 again makes it 60. If you forgot the limit and just added up, you would get 80.', skills: ['sh-sound'] },
        ],
      },
    ],
  },
    // Week 4
  {
    guideMd: `### Week goals
By the end of this week, the learner:
1. Knows that the **say … for … seconds** block is timed speech, and that the untimed **say** block leaves the speech bubble on screen.
2. Can put two characters' lines in order without overlapping them, by working out the wait times.
3. Can connect characters to each other with the **broadcast …** and **when I receive …** blocks.
4. Can change the scene with **next backdrop** when a message arrives.
5. Can explain why timing with waits is fragile and why working with messages is solid.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Talking and timing | ~30 min | Two characters, three lines of talk; work out the wait times, see the overlap and fix it. |
| 2 | Broadcasts and scene changes | ~35 min | Swap the waits for messages, change the backdrop when a message arrives, build a 3-scene story. |
| 3 | Week project: A two-character story | ~30 min | Give the story a beginning, an event and an ending; tell it to a friend. |

### Prerequisite check
- Does the learner remember that two sprites run at the same time? (week 2)
- Can they use event hat blocks? (week 3)
- Are they comfortable adding and taking away seconds (2 + 2 = 4)?

### Concept map
- **Talking:** say (untimed) → say … for … seconds (timed) → when does the bubble close?
- **Timing:** wait → adding up times → overlap
- **Messages:** broadcast → when I receive → taking turns
- **Scene:** backdrop → next backdrop → parts of the story

### Common mistakes
- **Making the second character's wait too short.** The lines overlap.
- **Waiting for the wrong message.** The message that is broadcast and the message that is received must have the same name.
- **Leaving the waits in along with the messages.** Using both together makes the story longer and the times slip.
- **Counting the backdrops wrong.** After the last backdrop, it goes back to the first one.
- **Using the untimed "say" and not clearing the bubble.** The bubble stays until a new "say" comes.

### End-of-week review
1. Read the concept cards and say the "common mistake" lines out loud.
2. Read the explanations for the questions you got wrong, then solve them again.
3. Write a three-line conversation first with wait blocks, then with messages. Which one is easier to change?
4. Add one more line for the second character in your story. In how many places does the code change?
5. Answer in your own words: "Is it safer to work with waits or with messages?"

The mini quizzes of the two lessons are enough as the end-of-week test: 9 questions in total. Goal: at least 3 correct from each lesson.

### Project rubric (A two-character story)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Talking | The lines overlap | Three lines, they take turns to talk | The lines add meaning to the story and are timed to their length |
| Messages | No messages, only waits | At least one message is used to pass the turn | Messages run the whole story, no waits |
| Scenes | One backdrop | At least 3 scenes (backdrops) | Scene changes match the parts of the story |
| Telling | Can't tell the story | Tells the beginning, the event and the ending | Shows how they fixed wrong timing |

### Note for parents and teachers
- **Goal.** The child should see that the computer counts time with "wait", and that characters can let each other know things with messages.
- **How to help.** Ask: "When does the second character start?" and "What happens if the first line gets longer?"
- **Pair work (optional).** Each child writes one character, and they join them with messages. They write who wrote what in the project notes.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; saved only if consent was given).`,
    lessons: [
      {
        title: 'Talking and timing',
        problem: 'Two characters take turns to talk. What happens if one starts talking before the other has finished?',
        contentMd: `## Activity
1. Choose two sprites (for example an animal and a person) and a backdrop.
2. First sprite: when the green flag is clicked, it says the first line with the **say Hello! for 2 seconds** block (Looks category; type your first line in the box).
3. Second sprite: it starts with the same flag. **wait 2 seconds**, then it answers.
4. Write a three-line conversation. Work out the waits **carefully** so the lines don't overlap.
5. Break the conversation with **wrong timing**, then fix it again. What did you change?

## Debugging tip
If the two sprites' lines clash, add up the wait times: the first sprite's talking time + a gap = the second sprite's wait time.`,
        question: 'If you take the wait away, why do the two characters talk at the same time?',
        explainerMd: `### What you will learn in this lesson
- The timed and untimed talking blocks
- What happens when two characters start at the same time
- How to build a conversation by working out wait times
- How to fix lines that overlap

### What you should know first
Lesson 3: the **wait** block counts time. Lesson 4: two sprites run at the same time.

### Talking blocks
There are two kinds in the Looks category:
- **say Hello! for 2 seconds**: the bubble shows for 2 seconds, then disappears and the program carries on.
- **say Hello!**: the bubble stays on screen until something else is said or the program ends.

### If they start at the same time
If the cat and the dog both start with the green flag, they start talking at the same time.
\`\`\`
Cat: yeşil bayrak tıklanınca
  Merhaba! de 2 saniye

Dog: yeşil bayrak tıklanınca
  Selam! de 2 saniye
\`\`\`
Both bubbles appear at second 0 and overlap. To take turns, the second character must wait.

### Work out the wait time
The second character's wait time should be equal to, or a bit more than, the first character's talking time. If you want a natural gap, add half a second:
- The cat talks for 3 seconds.
- The dog must wait at least 3 seconds.
- For 0.5 seconds of silence, it waits 3 + 0.5 = 3.5 seconds.

You can build a three-line conversation like this:
\`\`\`
Cat: yeşil bayrak tıklanınca
  Merhaba! de 2 saniye
  2 saniye bekle
  Nasılsın? de 2 saniye

Dog: yeşil bayrak tıklanınca
  2 saniye bekle
  İyiyim! de 2 saniye
\`\`\`
The cat's first line lasts from second 0 to 2, and the dog's line from second 2 to 4. The cat waits 2 seconds and says its second line at second 4.

### Fragile
Working out the times by hand works, but if you make one line longer, you have to work out all the times again. In the next lesson you will see a better way to do this.

### Summary
Timed talking closes the bubble; untimed talking leaves the bubble. If two characters start at the same time, their lines clash. To stop the clash, the second character waits as long as the first one talks (plus an optional gap).`,
        concepts: [
          { term: 'say … for … seconds', definition: 'A block that shows what the character says in a bubble for the given time, then removes it.', example: '"say Hello! for 2 seconds" shows the bubble for 2 seconds, then the program carries on.', pitfall: 'Forgetting the time and using the untimed "say"; the bubble stays on screen.' },
          { term: 'say (untimed)', definition: 'A block that leaves the bubble on screen until something else is said or the program ends.', example: 'You use the untimed "say" to keep "Game over" on the screen.', pitfall: 'Thinking the untimed bubble will disappear by itself.' },
          { term: 'Starting at the same time', definition: 'Two scripts that start with the same event run at the same time.', example: 'The cat and the dog both start talking with the green flag.', pitfall: 'Thinking the two characters will take turns and not adding any wait.' },
          { term: 'Timing sum', definition: 'The second character\'s wait time = the first character\'s talking time + the gap you want.', example: 'The cat talks for 3 seconds; for a 0.5 gap the dog waits 3.5 seconds.', pitfall: 'Making the wait shorter than the talking time; the lines clash.' },
          { term: 'Overlap', definition: 'Two speech bubbles on the screen at the same time.', example: 'If the dog waits 2 seconds while the cat talks for 3 seconds, they clash for 1 second.', pitfall: 'Only checking for clashes by eye; adding up the times is more reliable.' },
        ],
        quiz: [
          { id: 'm2h4d1-q1', kind: 'predict-output', prompt: `Here is the cat's and the dog's code. What happens when you click the flag?\n\n\`\`\`\nCat: yeşil bayrak tıklanınca\n  Merhaba! de 2 saniye\n\nDog: yeşil bayrak tıklanınca\n  Selam! de 2 saniye\n\`\`\``, options: ['The cat talks first, then the dog', 'The dog talks first, then the cat', 'They both talk at the same time and the bubbles overlap', 'Neither of them talks'], answer: 2, explanation: 'Both start with the same green flag event, and neither has a wait. So the two lines start at the same time and overlap for 2 seconds.', skills: ['sh-wait', 'sh-program'] },
          { id: 'm2h4d1-q2', kind: 'numeric', prompt: 'The cat talks for 3 seconds. The dog wants to start talking exactly half a second after the cat finishes. How many seconds should the dog wait?', answer: 3.5, tolerance: 0, unit: 'seconds', explanation: 'The dog\'s wait time is the cat\'s talking time plus the gap you want: 3 + 0.5 = 3.5 seconds. If it waited 3 seconds, it would talk as soon as the cat finished, with no gap.', skills: ['sh-wait'] },
          { id: 'm2h4d1-q3', kind: 'numeric', prompt: `In this conversation, at which second does the cat start saying its second line?\n\n\`\`\`\nCat: yeşil bayrak tıklanınca\n  Merhaba! de 2 saniye\n  2 saniye bekle\n  Nasılsın? de 2 saniye\n\nDog: yeşil bayrak tıklanınca\n  2 saniye bekle\n  İyiyim! de 2 saniye\n\`\`\``, answer: 4, tolerance: 0, unit: 'seconds', explanation: 'The cat first talks for 2 seconds, then waits 2 seconds. 2 + 2 = 4. The second line starts at second 4. Meanwhile, the dog talks between seconds 2 and 4.', skills: ['sh-wait'] },
          { id: 'm2h4d1-q4', kind: 'find-bug', prompt: `The cat talks for 3 seconds, and the dog answers. But the bubbles overlap for 1 second:\n\n\`\`\`\nCat: yeşil bayrak tıklanınca\n  Nasılsın? de 3 saniye\n\nDog: yeşil bayrak tıklanınca\n  2 saniye bekle\n  İyiyim! de 2 saniye\n\`\`\`\n\nWhat is the problem?`, options: ['The dog\'s wait time (2) is shorter than the cat\'s talking time (3)', 'The dog\'s talking time is too long', 'The cat has the wrong costume', 'The dog\'s hat block is missing'], answer: 0, explanation: 'The cat talks for 3 seconds, but the dog only waits 2 seconds, so they clash for 1 second. The wait time needs to be 3 seconds or a bit more.', skills: ['sh-debug', 'sh-wait'] },
          { id: 'm2h4d1-q5', kind: 'mcq', prompt: 'After the untimed "say Hello!" block runs, when does the bubble disappear?', options: ['By itself after 1 second', 'Straight away, as soon as the block runs', 'When the sprite moves', 'It stays until another "say" block comes or the program ends'], answer: 3, explanation: 'The untimed "say" leaves the bubble; the bubble stays on screen until something new is said or the program stops. To make it disappear by itself, you need the "say … for … seconds" block.', skills: ['sh-wait', 'sh-program'] },
        ],
      },
      {
        title: 'Broadcasts and scene changes',
        problem: 'When one character says "you can start", how does the other character hear it? Is there a better way than working out waits?',
        contentMd: `## Activity
1. In the Events (yellow) category, find the **broadcast …** and **when I receive …** blocks.
2. Take the wait blocks out of your story from last time. When the first character finishes its line, it should broadcast the \`sıra sende\` (your turn) message.
3. The second character answers **when I receive \`sıra sende\`**, then broadcasts a new message.
4. **Changing the backdrop:** when a message arrives, start the second scene with the **next backdrop** (or **switch backdrop to …**) block.
5. Your story should have a **beginning, an event and an ending**: at least 3 scenes.

## Note for parents / teachers
Concept: **messages** (broadcast). The characters "let each other know". Counting with wait times is fragile; working with messages is more solid. Let the child see the difference for themselves.

## Pair work (optional)
Split the story with a friend, "you write this one, I'll talk to it": each of you writes one character, then you join them with messages. Write down whose code is where, as a source note.`,
        question: 'Is it safer to work with waits or with messages? If you made the story longer, which one would break?',
        explainerMd: `### What you will learn in this lesson
- How to broadcast a message and receive it
- Why waiting is fragile and messages are solid
- How to change the backdrop when a message arrives
- How characters let each other know things

### What you should know first
Lesson 7: talking times and working out waits. Lesson 5: event hat blocks.

### What is a message?
If the cat could say "your turn" to the dog when it finishes its line, you wouldn't need to work out times. That is exactly what a **message** does. One character **broadcasts** a message, and the characters that have a hat block for receiving it spring into action.
\`\`\`
Cat: yeşil bayrak tıklanınca
  Merhaba! de 2 saniye
  "sıra1" mesajını yayınla

Dog: "sıra1" mesajını alınca
  Selam! de 1 saniye
\`\`\`
The dog talks at second 2, when the cat's line ends and the message is broadcast. Even if you make the cat's line longer, the dog still talks right on time, because the message is broadcast after the line has finished.

### How it differs from waiting
With waits, you have to work out the times yourself. If you make one line longer, you work them all out again. With a message, the turn comes at the exact moment the job is really finished. This is a more **solid** way.

### The message name must match
The name of the message that is broadcast and the name of the message that is received must be the same. If the cat broadcasts \`sıra1\` and the dog is waiting for \`sıra2\`, the dog never talks.

### Changing the scene
You can add several backdrops for the parts of your story. When a message arrives, the **next backdrop** block changes the scene. After the last backdrop, it goes back to the first one. For example, say you have 3 backdrops and you start with the first one. If the \`sıra\` (turn) message arrives 5 times, the backdrops go round as 1, 2, 3, 1, 2, 3, and you end up on backdrop 3.

### Summary
A message lets characters tell each other things. The broadcast message and the received message must have the same name. Working with messages is more solid than working out wait times. The next backdrop block changes the scene when a message arrives, and goes back to the start after the last backdrop.`,
        concepts: [
          { term: 'Message', definition: 'A signal with a name that characters use to let each other know something.', example: 'When the cat finishes its line, it broadcasts the `sıra1` (turn 1) message.', pitfall: 'Thinking a message is speech or a sound; a message is only a signal and is not shown on screen.' },
          { term: 'broadcast …', definition: 'Sends the chosen message; every hat block waiting for that message runs.', example: '"broadcast `sıra1`" starts the dog talking.', pitfall: 'Broadcasting a message without a hat block to receive it; nothing happens.' },
          { term: 'when I receive …', definition: 'A hat block that runs the blocks under it when a message with the matching name is broadcast.', example: 'The dog talks "when I receive `sıra1`".', pitfall: 'Choosing the wrong message name; the dog waits for `sıra2`, which is never broadcast, and never runs.' },
          { term: 'Solid program', definition: 'A program that doesn\'t break even when the times change.', example: 'A story that works with messages keeps the right order even when a line gets longer.', pitfall: 'Working out the times by hand and breaking the story when one line changes.' },
          { term: 'next backdrop', definition: 'Switches the stage backdrop to the next one; after the last one, it goes back to the start.', example: 'In a story with 3 backdrops, after it runs 5 times, backdrop 3 is showing.', pitfall: 'Thinking it will stop and stay on the last backdrop; it goes back to the start.' },
        ],
        quiz: [
          { id: 'm2h4d2-q1', kind: 'mcq', prompt: 'For two characters to take turns talking, why is a message more solid than wait times?', options: ['A message runs faster', 'Even if the talking gets longer or shorter, the turn comes when the line ends; you don\'t need to work out the times again', 'Wait blocks never work', 'A message plays a sound'], answer: 1, explanation: 'The message is broadcast after the line ends; whether the talking is long or short, the turn comes at the right time. With wait times, when a line changes you have to work out all the times again.', skills: ['sh-msg', 'sh-wait'] },
          { id: 'm2h4d2-q2', kind: 'predict-output', prompt: `Here is the code. When does the dog talk?\n\n\`\`\`\nCat: yeşil bayrak tıklanınca\n  Hazır mısın? de 2 saniye\n  "başla" mesajını yayınla\n\nDog: "başla" mesajını alınca\n  Hazırım! de 1 saniye\n\`\`\``, options: ['As soon as the flag is clicked', 'It never talks', 'When the cat finishes its line and broadcasts the message, that is at second 2', '2 seconds after the message'], answer: 2, explanation: 'The cat first talks for 2 seconds, then broadcasts the `başla` (start) message. The dog talks when it receives the message; that is at second 2. The message fires when the turn comes, so there is no extra wait.', skills: ['sh-msg', 'sh-events'] },
          { id: 'm2h4d2-q3', kind: 'find-bug', prompt: `In Burak's story, the dog never talks:\n\n\`\`\`\nCat: yeşil bayrak tıklanınca\n  Merhaba! de 2 saniye\n  "sıra1" mesajını yayınla\n\nDog: "sıra2" mesajını alınca\n  Selam! de 2 saniye\n\`\`\`\n\nWhat is the problem?`, options: ['The cat broadcasts `sıra1` but the dog is waiting for `sıra2`; the message names are different', 'The dog\'s bubble is too short', 'The dog needs a green flag hat block', 'Messages can only be used once'], answer: 0, explanation: 'The broadcast message and the received message must have the same name. The cat broadcasts `sıra1`, but the dog is waiting for `sıra2`, which is never broadcast. Changing the message in the dog\'s hat block to `sıra1` fixes the problem.', skills: ['sh-debug', 'sh-msg'] },
          { id: 'm2h4d2-q4', kind: 'numeric', prompt: 'The story has 3 backdrops, and backdrop 1 is showing at the start. The stage script runs the "next backdrop" block when the `sıra` (turn) message arrives. When the `sıra` message has been broadcast 5 times, which backdrop number is showing?', answer: 3, tolerance: 0, unit: 'backdrop no.', explanation: 'Each message moves it on by one: 2, 3, 1, 2, 3. After the fifth message, backdrop 3 is showing. After the last backdrop it goes back to the start, so it never goes to 6 or 5.', skills: ['sh-msg', 'sh-loop'] },
        ],
      },
    ],
  },
    // Week 5
  {
    guideMd: `### Week goals
By the end of this week, the learner can:
1. Build a **key … pressed?** check inside **forever** to steer a character with the arrow keys.
2. Explain that **if … then** runs the blocks inside it when the condition is true, and skips them when it is false.
3. Make a falling object by lowering its y coordinate, and send it back to the top when it reaches the ground.
4. Explain what a variable is; create the \`skor\` (score) variable, reset it and increase it.
5. Say why the score must be reset at the start of the game.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Move and catch | ~30 min | Steer the basket with the arrow keys, drop the apple, and start it again from the top when it touches. |
| 2 | Score: variables | ~30 min | Create the \`skor\` (score) variable, reset it on the flag, increase it when the apple touches, add the golden apple. |
| 3 | Week project: Catch game | ~30 min | Finish the game, let a friend play it, adjust its speed and points. |

### Prerequisite check
- Can the learner put blocks inside the **forever** block? (Week 2)
- Do they know the x and y coordinates, and that y gets bigger going up? (Week 1)
- Do they recognise the event hat blocks? (Week 3)

### Concept map
- **Input:** key … pressed? → if … then → forever
- **Falling object:** lower y → back to the top at the ground → back to the top when it touches the basket
- **Score:** make a variable → set to (starting value) → change by (increase) → show on the Stage

### Common mistakes
- **Leaving the key check outside the loop.** The key is checked only once; the basket does not move.
- **Changing y in the wrong direction.** To go down, y gets smaller (a negative value).
- **Not resetting the score on the flag.** A new game starts with the old score.
- **Mixing up the "set to" and "change by" blocks.** One puts in a value, the other adds to it.
- **Forgetting to show the score variable on the Stage.** The player cannot see their points.

### End-of-week review
1. Read the concept cards and say the "common mistake" lines out loud.
2. Solve the questions you got wrong again, together with their explanations.
3. Raise the apple's speed from 5 to 8: how many rounds does it take to reach the ground? (about 300 ÷ 8)
4. In a game where a golden apple is worth 5 points and a normal apple 1 point, work out the score for 3 golden and 6 normal apples.
5. Answer in your own words: "What is a variable? Why do we reset it on the flag?"

For the end-of-week test, the mini quizzes of the two lessons are enough; 10 questions in total. Goal: at least 3 correct from each lesson.

### Project rubric (Catch game)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Control | The basket does not react to the arrow keys | The basket moves left and right | The basket does not leave the Stage, and the movement is smooth |
| Falling object | The apple does not fall, or always stays on the ground | The apple falls and starts again when it touches the ground or the basket | The apple's starting place changes |
| Score | There is no score, or it never goes up | The score is reset on the flag and goes up on a catch | There is a golden apple and a score shown on the Stage |
| Explaining | Cannot explain | Explains their blocks step by step | Explains a mistake they made and how they fixed it |

### Note for parents and teachers
- **Goal.** The child should grasp the idea that "the computer must keep looking" (a condition inside a loop) and see a variable as a box with a name.
- **How to help.** Ask: "How many times is the key checked?" and "What is in the box right now?"
- **Bug hunt.** Forgetting to reset the score is a very common mistake; let the child find it like a bug hunt.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; saved only if consent was given).`,
    lessons: [
      {
        title: 'Move and catch',
        problem: 'In your game, you want to steer a character with the keyboard and catch a falling object. What do you need?',
        contentMd: `## Activity
1. Two sprites: the **player** (a bucket or basket) and the **object** (an apple).
2. Player: inside **forever**, **if key right arrow pressed? then** **change x by 10**; **if key left arrow pressed? then** **change x by -10** (Control and Sensing categories).
3. Object: it starts at the top and moves down **forever** (**change y by -5**).
4. When the object's **touching bucket?** (Sensing) condition becomes true, or when it reaches the ground, send it back up to the top.
5. Make the player and the object bump into each other and see what happens.

## Debugging tip
If the player does not move, make sure you put the key check **inside** the forever loop.

Note: holding a key down does not, on its own, keep starting the **when … key pressed** hat block; the hat works with the key-press event (and the keyboard's repeat events). For smooth, non-stop movement, use the **key … pressed?** condition inside forever.`,
        question: 'What is the difference between "when key pressed" and "key pressed?"? Which one keeps the player moving?',
        explainerMd: `### What you will learn in this lesson
- How to steer the player with the arrow keys
- The difference between **when … key pressed** and **key … pressed?**
- The **if … then** condition
- How to lower a falling object's y coordinate and start it again

### What you should know first
Lesson 2: coordinates (y gets bigger going up). Lesson 4: forever. Lesson 5: events.

### Keep looking
The **when … key pressed** hat runs at the moment the key is pressed. If you want the basket to slide smoothly, the program must keep checking: inside **forever** you ask "is the right arrow key pressed?". This question is called a **condition**.

### if … then
The **if** block asks the condition. If it is true, it runs the blocks inside it; if not, it skips them.
\`\`\`
Sepet: yeşil bayrak tıklanınca
  x: 0 y: -140 konumuna git
  sonsuza kadar
    eğer sağ ok tuşuna basılı mı? ise
      x'i 10 değiştir
    eğer sol ok tuşuna basılı mı? ise
      x'i -10 değiştir
\`\`\`
In every round, the loop checks both keys. If the right arrow is pressed, x goes up by 10. Without the loop, the keys would be checked only once and the basket would not move. If the right arrow stays pressed for 5 rounds, the basket moves 5 × 10 = 50 units to the right.

### The falling apple
The apple moves from the top to the bottom; that means y gets smaller. When it reaches the ground (y < −150), it teleports back to the top:
\`\`\`
Elma: yeşil bayrak tıklanınca
  x: 0 y: 150 konumuna git
  sonsuza kadar
    y'yi -5 değiştir
    eğer y konumu < -150 ise
      y'yi 150 yap
\`\`\`
The apple moves down 5 units every round. To go from y = 150 to 0, it needs 150 ÷ 5 = 30 rounds.

### When it touches the basket
The **touching basket?** condition tells you whether the apple is touching the basket. If it is, you send the apple back to the top. The apple goes back to the start when it touches either the basket or the ground.

### Summary
For smooth control, put the key check inside the forever loop. The if block runs when its condition is true. For a falling object, y gets smaller, and the object starts again when it reaches the ground. The apple can also go back to the start when it touches the basket.`,
        concepts: [
          { term: 'Condition', definition: 'A question that is either true or false, like "is the right arrow key pressed?".', example: '"touching basket?" is true if the apple touches the basket, and false if it does not.', pitfall: 'Leaving a condition on its own; it does nothing unless it is placed in an if block.' },
          { term: 'if … then', definition: 'Runs the blocks inside it if the condition is true, and skips them if it is false.', example: '"if key right arrow pressed? then: change x by 10" moves the basket only while the right arrow is pressed.', pitfall: 'Putting the movement blocks outside the if block; then they always run without checking the condition.' },
          { term: 'key … pressed?', definition: 'A condition block that is true if the key is pressed at that moment.', example: 'When you use it inside forever, the basket slides for as long as the key is held down.', pitfall: 'Using this block outside a loop; the key is checked only once.' },
          { term: 'when key pressed vs key pressed?', definition: 'The hat block runs at the moment the key is pressed; the condition block asks about the key every time the loop goes round.', example: 'For smooth walking, use "pressed?" inside a loop.', pitfall: 'Relying only on the "when pressed" hat for smooth movement while holding the key down.' },
          { term: 'Falling object', definition: 'A sprite whose y gets smaller every round, and which is put back at the top when it reaches the ground.', example: 'The apple moves down 5 units every round; when y < -150, y is set to 150.', pitfall: 'Trying to move it down by increasing y; when y goes up, the object rises.' },
        ],
        quiz: [
          { id: 'm2h5d1-q1', kind: 'mcq', prompt: 'Which set-up is best for making the basket slide smoothly to the right for as long as the right arrow key is held down?', options: ['change x by 10 under the "when right arrow key pressed" hat', 'change x by 10 under the green flag', 'change x by 10 under "when this sprite clicked"', 'change x by 10 inside "forever" with "if key right arrow pressed? then"'], answer: 3, explanation: 'The loop asks about the key every round and moves the basket if it is pressed. The "when pressed" hat runs only at the moment of pressing, so holding the key down does not give smooth movement. The green flag and click hats have nothing to do with the key.', skills: ['sh-events', 'sh-loop', 'sh-cond'] },
          { id: 'm2h5d1-q2', kind: 'numeric', prompt: `The basket is at x = 0. The loop runs for 9 rounds with the right arrow pressed, then 2 rounds with the left arrow pressed (+10 for right, −10 for left). What is the basket's final x value?\n\n\`\`\`
sonsuza kadar
  eğer sağ ok tuşuna basılı mı? ise
    x'i 10 değiştir
  eğer sol ok tuşuna basılı mı? ise
    x'i -10 değiştir
\`\`\``, answer: 70, tolerance: 0, unit: 'x', explanation: 'Right: 9 × 10 = +90. Left: 2 × 10 = −20. Total: 90 − 20 = 70. In each round, only the block for the pressed key runs.', skills: ['sh-coords', 'sh-cond'] },
          { id: 'm2h5d1-q3', kind: 'predict-output', prompt: `What happens when the apple reaches the ground (y < -150)?\n\n\`\`\`
Elma: yeşil bayrak tıklanınca
  x: 0 y: 150 konumuna git
  sonsuza kadar
    y'yi -5 değiştir
    eğer y konumu < -150 ise
      y'yi 150 yap
\`\`\``, options: ['The apple stays on the ground', 'The apple is put back at y = 150 and starts falling again', 'The apple leaves the Stage and disappears', 'The program shows an error'], answer: 1, explanation: 'When the apple reaches the ground, the if condition becomes true and y is set to 150; the loop keeps going, so the apple falls again. It does not stop because forever never ends, and it does not disappear because its y value stays on the Stage.', skills: ['sh-cond', 'sh-coords'] },
          { id: 'm2h5d1-q4', kind: 'numeric', prompt: 'The apple starts at y = 150 and does change y by -5 every round. How many rounds does it take to reach y = -100?', answer: 50, tolerance: 0, unit: 'rounds', explanation: 'The total distance it has to fall is 150 − (−100) = 250 units. It moves down 5 units each round, so it needs 250 ÷ 5 = 50 rounds.', skills: ['sh-coords', 'sh-loop'] },
          { id: 'm2h5d1-q5', kind: 'find-bug', prompt: `Can wants the basket to move with the arrow keys, but the basket does not move:\n\n\`\`\`
Sepet: yeşil bayrak tıklanınca
  eğer sağ ok tuşuna basılı mı? ise
    x'i 10 değiştir
  eğer sol ok tuşuna basılı mı? ise
    x'i -10 değiştir
\`\`\`\n\nWhat is the problem?`, options: ['10 steps is too few', 'The left arrow and the right arrow cannot be used at the same time', 'The key check is not inside a forever loop; the keys are checked only once', 'The basket has no costume'], answer: 2, explanation: 'When the flag is clicked, the program checks the two conditions once and then ends. No key is pressed at that moment, so nothing happens. You need to put the checks inside the forever block.', skills: ['sh-debug', 'sh-loop', 'sh-cond'] },
        ],
      },
      {
        title: 'Score: variables',
        problem: 'The game needs to remember how many apples you caught. Where does the computer keep that number?',
        contentMd: `## Activity
1. In the Variables (orange) category, click the **Make a Variable** button and name it \`skor\` (score).
2. Under the green flag hat, use the **set skor to 0** block.
3. When the apple touches the player, **change skor by 1** and start the apple again from the top.
4. Can you see the score on the Stage? If not, use the **show variable skor** block, or tick the box next to the variable. Run it: does it go up as you catch apples?
5. Bonus: when you catch a golden apple, make it **change skor by 5**.

## Challenge
When the score reaches 10, make the sprite say "You win!".

## Note for parents / teachers
Concept: a **variable** = a box with a name written on it. Ask the child "what is inside the box?". Forgetting to reset the score on the green flag is a very common mistake; let them find it like a bug hunt.`,
        question: 'What would have happened if you had not set the score to 0 on the green flag?',
        explainerMd: `### What you will learn in this lesson
- What a variable is
- How to create a variable, put a value in it and change it
- Why it matters to reset the score at the start of the game
- How to show the score on the Stage

### What you should know first
Lesson 9: if … then, **touching …?** and forever.

### A variable: a box with a name
A **variable** is a box with a name written on it; inside it there is a number or some text. In the game, the computer keeps the number of apples you caught in a variable, for example in a box called \`skor\` (score). You create a variable in the Variables category with "Make a Variable" and give it a name. Variables are shared by all sprites; the basket and the apple both see the same \`skor\` box.

### Two basic blocks
- **set skor to 0** puts a value straight into the box and wipes out the old value.
- **change skor by 1** adds to the number in the box. If you type a negative number, it takes away.

Example:
\`\`\`
skor = 5 yap
skor değişkenini 2 kadar değiştir
\`\`\`
Now the box holds 7.

### Reset at the start of the game
So that the score starts from zero when the game starts again, you put **set skor to 0** under the flag. If you don't, you carry on with the value left over from the last game.
\`\`\`
Elma: yeşil bayrak tıklanınca
  skor = 0 yap
  sonsuza kadar
    y'yi -5 değiştir
    eğer sepet değiyor mu? ise
      skor değişkenini 1 kadar değiştir
      y'yi 150 yap
\`\`\`

### Show the score
If the box next to the variable is ticked, the score appears on the Stage. You can also put it into speech: with the **join** block, you place the text "Score: " and the \`skor\` variable side by side and make the sprite say them. If you want the golden apple to give 5 points, use **change skor by 5** in its code. For example, if you catch 3 normal apples and 1 golden apple, the score becomes 3 + 5 = 8.

### Summary
A variable is a box with a name. "set to" puts in a value; "change by" adds or takes away. Reset the score at the start of the game. You can show the score to the player by showing it on the Stage.`,
        concepts: [
          { term: 'Variable', definition: 'A box with a name that stores a value.', example: 'The `skor` (score) variable holds the number of apples you caught.', pitfall: 'Thinking each sprite has its own copy of the variable; variables are shared.' },
          { term: 'set to', definition: 'Puts a value straight into the variable and wipes out the old one.', example: '"set skor to 0" resets the score.', pitfall: 'Mixing up the "set to" and "change by" blocks; one puts in a value, the other adds.' },
          { term: 'change by', definition: 'Adds the given number to the variable\'s value; a negative number takes away.', example: '"change skor by 1" raises the score by 1.', pitfall: 'Typing a positive number to take away; to make it smaller you need a negative number.' },
          { term: 'Starting value', definition: 'The first value given to a variable when the game starts.', example: 'Under the flag, you set the score to 0.', pitfall: 'Forgetting to reset it, so a new game starts with the old score.' },
          { term: 'Score', definition: 'The variable that keeps the player\'s points.', example: 'A normal apple adds 1 point, a golden apple adds 5.', pitfall: 'Forgetting to show the score on the Stage, so the player cannot see their points.' },
        ],
        quiz: [
          { id: 'm2h5d2-q1', kind: 'mcq', prompt: 'In Stage Workshop, which of these best describes a "variable"?', options: ['A box with a name that stores a value', 'A sprite\'s costume', 'The Stage\'s backdrop', 'A sound file'], answer: 0, explanation: 'A variable is a box with a name written on it that holds a number or some text. Costumes, backdrops and sounds are different things.', skills: ['sh-var'] },
          { id: 'm2h5d2-q2', kind: 'numeric', prompt: `What is the value of the \`skor\` (score) variable after this program?\n\n\`\`\`
yeşil bayrak tıklanınca
  skor = 0 yap
  4 kere tekrarla
    skor değişkenini 2 kadar değiştir
  skor değişkenini -3 kadar değiştir
\`\`\``, answer: 5, tolerance: 0, unit: 'score', explanation: 'The score starts at 0. The loop adds 2 four times: 8. Then -3 is added, which means 3 is taken away: 8 − 3 = 5.', skills: ['sh-var', 'sh-loop'] },
          { id: 'm2h5d2-q3', kind: 'numeric', prompt: 'A normal apple gives 1 point and a golden apple gives 5 points. The score started at 0. The player caught 4 normal apples and 2 golden apples. What is the score?', answer: 14, tolerance: 0, unit: 'points', explanation: '4 normal apples give 4 × 1 = 4 points, and 2 golden apples give 2 × 5 = 10 points. Total: 4 + 10 = 14.', skills: ['sh-var'] },
          { id: 'm2h5d2-q4', kind: 'find-bug', prompt: `Mina finishes the game and clicks the green flag again. The score does not start from 0; it carries on from the last game's score:\n\n\`\`\`
Elma: yeşil bayrak tıklanınca
  sonsuza kadar
    y'yi -5 değiştir
    eğer sepet değiyor mu? ise
      skor değişkenini 1 kadar değiştir
      y'yi 150 yap
\`\`\`\n\nWhat is the problem?`, options: ['The block that raises the score is wrong', 'The apple falls too fast', 'The score variable is not shown on the Stage', 'There is no "set skor to 0" under the flag; the score is never reset'], answer: 3, explanation: 'A variable keeps its value even after the game ends. If you don\'t say "set skor to 0" at the start of the game, you carry on with the old value. You need to put in the starting value at the start of every game.', skills: ['sh-debug', 'sh-var'] },
          { id: 'm2h5d2-q5', kind: 'predict-output', prompt: `What does Robot say at the very end?\n\n\`\`\`
skor = 10 yap
skor değişkenini -4 kadar değiştir
skor = 3 yap
skor değişkenini 1 kadar değiştir
("Skor: " skor birleştir) de
\`\`\``, options: ['Skor: 10', 'Skor: 6', 'Skor: 4', 'Skor: 3'], answer: 2, explanation: '"set to" wipes out the old value. It is set to 10 and drops to 6, but then "set skor to 3" makes it 3. The last block adds 1: 4. When "Skor: " (Score: ) and 4 are joined, Robot says "Skor: 4".', skills: ['sh-var', 'sh-program'] },
        ],
      },
    ],
  },
    // Week 6
  {
    guideMd: `### Week goals
By the end of this week, the learner:
1. Sets up variables that go down, like \`can\` (lives) and \`süre\` (time), and writes the condition that ends the game.
2. Knows the difference between comparing with **=** and with **<**, and explains why **<** is safer in an end condition.
3. Knows the difference between **stop all** and **stop this script**.
4. Knows the range of the **pick random** block (both end numbers included) and drops objects from random places.
5. Creates a **clone**, writes the clone's behaviour under **when I start as a clone** and deletes the clone.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Timer, lives and game over | ~35 min | Set up the lives and time variables, write the end condition, stop everything. |
| 2 | Random and clones | ~35 min | Drop the apple from a random place, make lots of apples with clones, delete the clones. |
| 3 | Week project: Improve the game | ~30 min | Make the game harder (speed, lives) and let a friend play it. |

### Prerequisite check
- Can they create a variable and change its value? (week 5)
- Can they use the **if … then** block? (week 5)
- Are they comfortable adding and taking away with negative numbers? (For the lives −2 example.)

### Concept map
- **Game over:** lives → time → if lives < 1 → stop all
- **Randomness:** random number (end numbers included) → random x position
- **Clone:** create clone of myself → when I start as a clone → delete this clone

### Common mistakes
- **Writing "lives = 0".** Lives can jump over 0 (from 1 to −1); "lives < 1" is safer.
- **Lowering the time on every loop.** Time should go down once a second; put a 1 second wait in between.
- **Trying to end the game with "stop this script".** The other code keeps running; you need "stop all".
- **Writing the clone's behaviour under the green flag.** Clones don't get the flag event; you need "when I start as a clone".
- **Not deleting clones.** The stage fills up and the game slows down.

### End-of-week review
1. Read the concept cards and say the "common mistake" lines out loud.
2. Solve the questions you got wrong again, together with their explanations.
3. Set lives to 5 and make a falling apple take away 2 lives. What condition should end the game?
4. Make the apple's x position a random number from −150 to 150. How many different values can come up?
5. Answer in your own words: "What is a clone, and why do we use it?"

The mini quizzes of the two lessons are enough as the end-of-week test: 10 questions in total. Goal: at least 3 right answers from each lesson.

### Project rubric (Improve the game)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Lives and time | Missing, or they never change | Lives and time go down, and the game ends | Both are shown on the screen, and when one ends the game the other is stopped too |
| Ending | The game never ends | When lives reach 0 it says "Game over" and stops | At the end it tells you your score |
| Randomness | Everything always comes from the same place | The apple falls from a random x position | Random speed or a chance of a golden apple |
| Clone | No clones | At least 3 apples fall at the same time | Clones are deleted and the game runs without bugs |

### Note for parents and teachers
- **Goal.** The child should understand that a game has an "end condition", and that clones are a way to use the same code many times.
- **How to help.** Ask: "When does the game end?" and "Is this code for the apple or for a clone?"
- **Clones are hard.** If the child struggles, first do a random position with a single apple, then add clones.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; only saved if consent was given).`,
    lessons: [
      {
        title: 'Timer, lives and game over',
        problem: 'You don\'t want your game to go on forever. When should the game end, and what should happen when it does?',
        contentMd: `## Activity
1. Two new variables: \`can\` (lives, start it at 3) and \`süre\` (time, start it at 30).
2. When the apple hits the ground, **change \`can\` by -1**.
3. **If \`can\` < 1 then** say "Game over" and **stop all** (Control and Operators categories). There is no block that stops just the forever loop on its own: **stop all** stops every script, and **stop this script** stops only the script it is in.
4. For the time, inside the forever loop wait 1 second, then **change \`süre\` by -1**. When it reaches 0, the game should end.
5. When the game ends, **all sprites** should stop. Which block does this? (Hint: **stop all**.)

## Debugging tip
If "Game over" never appears, use **\`can\` < 1** in the condition instead of **\`can\` = 0**: if lives jump over 0 into negative numbers, "=" is never true, but "<" still catches it. Also put the end check **inside** the forever loop.`,
        question: 'Which two conditions did you use to end the game? What happens if both are true at the same time?',
        explainerMd: `### What you will learn in this lesson
- How to set up lives and time variables
- How to make a variable go down
- How to write a game over condition
- The difference between **=** and **<**, and the **stop all** block

### What you should know first
Lesson 10: variables, score. Lesson 9: if … then and the falling apple.

### Lives and time
The \`can\` (lives) variable starts at 3. When the apple lands on the ground, you take a life away with **change by -1**. The \`süre\` (time) variable starts at 30. Time should go down once every second, so you put a wait in between:
\`\`\`
yeşil bayrak tıklanınca
  süre = 30 yap
  sonsuza kadar
    1 saniye bekle
    süre değişkenini -1 kadar değiştir
\`\`\`
After 12 seconds, the time is 30 − 12 = 18.

### The game over condition
The game should stop when the lives run out or the time is up:
\`\`\`
sonsuza kadar
  y'yi -5 değiştir
  eğer y konumu < -150 ise
    can değişkenini -1 kadar değiştir
    y'yi 150 yap
  eğer can < 1 ise
    Oyun bitti de
    hepsini dur
\`\`\`

### = or <?
**lives = 0** is only true when lives are exactly 0. If an apple takes away 2 lives when it falls, lives jump from 1 to −1 and never hit 0, so "Game over" never appears. **lives < 1** is true at 0 and below, so it is safer.

### Stop blocks
**stop all** stops all the code of every sprite; you use it when the game ends. **stop this script** stops only that one stack of code. If the time counter is in a different stack, it keeps running.

### Summary
Lives and time are variables that go down. Check for the end of the game with a condition like "lives < 1"; using "<" instead of "=" lowers the risk of jumping over the limit. When the game ends, stop all the code with stop all.`,
        concepts: [
          { term: 'Lives', definition: 'A variable you are given at the start. It goes down when you make a mistake, and the game ends when it reaches 0.', example: 'Lives start at 3 and go down by 1 when an apple hits the ground.', pitfall: 'Writing a plus number instead of a minus one, so the lives go up instead of down.' },
          { term: 'Time', definition: 'A variable that counts down; it goes down once every second.', example: 'With "wait 1 second" and "time -1", the time counts down from 30.', pitfall: 'Not putting a wait in between: the time runs out in a flash.' },
          { term: 'End condition', definition: 'The if condition that says when the game will end.', example: '"If lives < 1 then: say Game over, stop all."', pitfall: 'Never writing the condition, then being surprised that the game goes on forever.' },
          { term: '= and <', definition: '"=" checks for exactly equal, "<" checks for less than.', example: 'When lives are −1, "lives < 1" is true and "lives = 0" is false.', pitfall: 'Using "=" when the number can jump over 0; then the end condition is never met.' },
          { term: 'stop all', definition: 'Stops all the code of every sprite.', example: 'When the game ends, the counter should stop too, so you use stop all.', pitfall: 'Trying to end the game with "stop this script"; the other code keeps running.' },
        ],
        quiz: [
          { id: 'm2h6d1-q1', kind: 'numeric', prompt: 'At the start of the game, lives are 3. The player let 2 apples fall to the ground (each one takes 1 life) and caught 1 apple (catching doesn\'t change lives). How many lives are left?', answer: 1, tolerance: 0, unit: 'lives', explanation: 'Only apples that hit the ground take lives away: 3 − 2 = 1. Catching an apple adds to the score but doesn\'t change the lives.', skills: ['sh-var'] },
          { id: 'm2h6d1-q2', kind: 'numeric', prompt: `The time starts at 4. After how many seconds does the game say "Time's up" and stop?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  süre = 4 yap\n  sonsuza kadar\n    1 saniye bekle\n    süre değişkenini -1 kadar değiştir\n    eğer süre < 1 ise\n      Süre doldu de\n      hepsini dur\n\`\`\``, answer: 4, tolerance: 0, unit: 'seconds', explanation: 'The time goes down by 1 every second: 3, 2, 1, 0. When the time is 0 (at the 4th second), "time < 1" becomes true and the program stops. In the first three seconds the time is still 1 or more.', skills: ['sh-wait', 'sh-cond'] },
          { id: 'm2h6d1-q3', kind: 'find-bug', prompt: `Lives start at 3, but an apple that hits the ground takes away 2 lives. "Game over" never appears:\n\n\`\`\`\neğer y konumu < -150 ise\n  can değişkenini -2 kadar değiştir\n  y'yi 150 yap\neğer can = 0 ise\n  Oyun bitti de\n  hepsini dur\n\`\`\`\n\nWhat is the problem?`, options: ['The apple is too slow', 'Lives go 3, 1, −1 and never become 0, so "lives = 0" is never true', 'The stop all block is wrong', 'The Game over message is too short'], answer: 1, explanation: 'When 2 is taken away from 3, lives become 1, then −1; they are never exactly 0. That is why "lives = 0" is never true. If you write "lives < 1", the condition is true for every value below 1.', skills: ['sh-debug', 'sh-cond'] },
          { id: 'm2h6d1-q4', kind: 'mcq', prompt: 'When the game ends, which block is right for stopping all the code in the game?', options: ['stop this script', 'wait 1 second', 'stop all', 'if on edge, bounce'], answer: 2, explanation: '"Stop all" stops all the code of every sprite. "Stop this script" stops only that one stack of code; other stacks, like the time counter, keep running.', skills: ['sh-cond', 'sh-loop'] },
          { id: 'm2h6d1-q5', kind: 'predict-output', prompt: `What is the score when the program ends?\n\n\`\`\`\ncan = 3 yap\nskor = 0 yap\n3 kere tekrarla\n  can değişkenini -2 kadar değiştir\n  eğer can < 1 ise\n    skor değişkenini 1 kadar değiştir\n\`\`\``, options: ['0', '1', '2', '3'], answer: 2, explanation: 'Lives become 1, then −1, then −3. In the first loop lives are 1, so "lives < 1" is false. In the second and third loops lives are below 1, so the score goes up twice: the score is 2.', skills: ['sh-cond', 'sh-var', 'sh-loop'] },
        ],
      },
      {
        title: 'Random and clones',
        problem: 'If the apple falls from the same place in every game, it gets boring. And if you want lots of apples to fall at the same time, do you have to draw hundreds of sprites?',
        contentMd: `## Activity
1. **Random:** find the **pick random … to …** block in the Operators category. When the apple starts, make its x position **a random number from −200 to 200**.
2. **Clone:** find the **create clone of myself** block in the Control category. In the apple's main code, make one clone every second.
3. Under the **when I start as a clone** hat block, write what the clone does: it falls down, the score goes up when it touches the player, and then it runs **delete this clone**.
4. How many apples fall in a few seconds? Adjust the number.

## Challenge
Make the falling speed go up over time (so the game gets harder).

## Note for parents / teachers
Clones are a hard idea: they are copies of the same sprite. If the child struggles, first do a random position with a single apple, then add clones.`,
        question: 'If you didn\'t use clones, what would you have to do to have 10 apples at the same time?',
        explainerMd: `### What you will learn in this lesson
- The pick random block and its range
- How to create a clone
- The **when I start as a clone** hat block
- How to delete a clone with **delete this clone**

### What you should know first
Lesson 11: if, stop all. Lesson 9: the falling apple. Lesson 2: coordinates.

### Random numbers
**pick random 1 to 6** picks one of 1, 2, 3, 4, 5 or 6 every time it runs. The end numbers can come up too, so there are 6 different possibilities. If you make the apple's x position a random number from −200 to 200, every apple falls from a different place:
\`\`\`
x: (-200 ile 200 arasında rastgele sayı) y: 150 konumuna git
\`\`\`

### Clones
To get lots of apples without drawing hundreds of sprites, the **create clone of myself** block makes a copy of the sprite. The clone takes the main apple's look and position. You write what the clone will do under the **when I start as a clone** hat block:
\`\`\`
Apple: yeşil bayrak tıklanınca
  gizle
  sonsuza kadar
    kendimin klonunu oluştur
    0.7 saniye bekle

Apple: klon olarak başlayınca
  göster
  x: (-200 ile 200 arasında rastgele sayı) y: 150 konumuna git
  y konumu < -150 olana dek tekrarla
    y'yi -5 değiştir
  bu klonu sil
\`\`\`
The main apple stays hidden and only makes clones. Each clone appears, falls from a random place and deletes itself when it reaches the ground.

### Counting clones
If clones are not deleted, you count them together with the main sprite. If you do "repeat 5 times: create clone of myself" and delete none of them, there are the main apple and 5 clones on the stage: 6 apples. If the main apple is hidden, you see 5 apples.

### Where does the clone's code go?
Clones are made later; the green flag event has already happened for them. So if you write the clone's behaviour under the green flag, the clones do nothing. The right place is the **when I start as a clone** hat block.

### Summary
The pick random block picks a number from a range, with the end numbers included. A clone is a copy of a sprite. The clone's code goes under "when I start as a clone", and the clone is deleted when its job is done.`,
        concepts: [
          { term: 'pick random', definition: 'Picks a random whole number between two numbers (with the end numbers included).', example: '"pick random 1 to 6" gives 1, 2, 3, 4, 5 or 6.', pitfall: 'Thinking the end numbers won\'t come up; both of them can.' },
          { term: 'Clone', definition: 'A copy of a sprite that is made while the program is running.', example: 'The main apple makes a clone every 0.7 seconds; each clone becomes an apple.', pitfall: 'Counting only the clones; the main sprite is on the stage too.' },
          { term: 'create clone of myself', definition: 'Adds a copy of the running sprite to the stage.', example: 'If you use this block inside forever, new apples keep appearing.', pitfall: 'Making endless clones without ever deleting them; the stage fills up.' },
          { term: 'when I start as a clone', definition: 'The hat block that starts the code a clone runs when it is created.', example: 'The clone shows itself, goes to a random x, falls down and deletes itself.', pitfall: 'Writing the clone\'s behaviour under the green flag; clones don\'t get the flag event.' },
          { term: 'delete this clone', definition: 'Makes the clone remove itself.', example: 'When the apple reaches the ground, delete this clone runs.', pitfall: 'Putting this block in the main sprite; the main sprite isn\'t deleted, only clones are.' },
        ],
        quiz: [
          { id: 'm2h6d2-q1', kind: 'mcq', prompt: 'Which numbers can come up when the "pick random 1 to 6" block runs?', options: ['Only 2, 3, 4, 5', '1, 2, 3, 4, 5 and 6 (all of them)', 'From 0 to 6', 'Always the same number'], answer: 1, explanation: 'The pick random block includes the end numbers too: 1 and 6 can also come up. 0 is outside the range. A different number can come up each time, so it isn\'t always the same.', skills: ['sh-random'] },
          { id: 'm2h6d2-q2', kind: 'numeric', prompt: `The apple sprite runs this code and doesn't delete its clones. When the code ends, how many apple sprites are on the stage in total, counting the main apple?\n\n\`\`\`\nyeşil bayrak tıklanınca\n  5 kere tekrarla\n    kendimin klonunu oluştur\n\`\`\``, answer: 6, tolerance: 0, unit: 'apples', explanation: '5 clones are made and the main apple stays on the stage too: 1 + 5 = 6. The main sprite isn\'t deleted and isn\'t counted as a clone, but it is still on the stage.', skills: ['sh-clone', 'sh-loop'] },
          { id: 'm2h6d2-q3', kind: 'predict-output', prompt: `4 seconds after the program starts, how many apples can you SEE on the stage?\n\n\`\`\`\nApple: yeşil bayrak tıklanınca\n  gizle\n  3 kere tekrarla\n    kendimin klonunu oluştur\n    1 saniye bekle\n\nApple: klon olarak başlayınca\n  göster\n\`\`\``, options: ['0', '1', '3', '4'], answer: 2, explanation: 'The main apple is hidden, so you can\'t see it. Three clones are made and each one becomes visible with "show"; none of them is deleted, so you see 3 apples. Not 4, because the main apple is hidden.', skills: ['sh-clone', 'sh-loop'] },
          { id: 'm2h6d2-q4', kind: 'find-bug', prompt: `Selin wants to drop lots of apples with clones. But only the main apple falls; the clones stay frozen where they were made:\n\n\`\`\`\nApple: yeşil bayrak tıklanınca\n  gizle\n  sonsuza kadar\n    kendimin klonunu oluştur\n    1 saniye bekle\n\nApple: yeşil bayrak tıklanınca\n  göster\n  y konumu < -150 olana dek tekrarla\n    y'yi -5 değiştir\n  bu klonu sil\n\`\`\`\n\nWhat is the problem?`, options: ['The clone\'s behaviour is under the green flag; clones don\'t get the flag event, so it needs "when I start as a clone"', 'The wait time is too long', 'The hide block can never be used', 'The apple\'s speed is missing'], answer: 0, explanation: 'Clones are made after the flag is clicked; the flag event is already over for them. Their behaviour must go under the "when I start as a clone" hat block. Otherwise only the main apple runs this code, and the clones stay still where they were made.', skills: ['sh-debug', 'sh-clone'] },
          { id: 'm2h6d2-q5', kind: 'numeric', prompt: 'The apple\'s x position is chosen with "pick random -200 to 200" (whole numbers, end values included). How many different x values can come up?', answer: 401, tolerance: 0, unit: 'values', explanation: 'When you count with the ends included, take the difference and add 1: 200 − (−200) + 1 = 401. The difference is 400, but -200 and 200 can also come up, so there are 401 possibilities. It is the same idea as 1 to 6 having 6 possibilities.', skills: ['sh-random', 'sh-coords'] },
        ],
      },
    ],
  },
    // Week 7
  {
    guideMd: `### Week goals
By the end of this week, the learner:
1. Uses **Make a Block** to define their own block and calls it in their main code; knows that defining a block is not the same as running it.
2. Adds an **input** to a block and uses the same block with different values.
3. Explains that their own block makes the code shorter and lets them make a change in one place.
4. Knows what a **list** is; can say that item numbers start at 1 and can read item N of a list.
5. Builds a quiz game that walks through two matching lists (questions and answers) with a \`sıra\` (position) variable.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Make your own block | ~30 min | Make the \`zıpla\` (jump) block, add an input, call it a few times in the main code, then make a second block. |
| 2 | A quiz game with lists | ~35 min | Set up the questions and answers lists, ask the questions in order with the position variable, give a point for each right answer. |
| 3 | Week project: Quiz game | ~30 min | Make a 5-question quiz on your own topic and let a friend play it. |

### Prerequisite check
- Can they make a variable and change it? (week 5)
- Can they use **if / else** and the comparison operators? (weeks 5-6)
- Do they know the repeat and repeat until loops? (weeks 2, 6)

### Concept map
- **Your own block:** definition → call → input → change in one place
- **List:** item → item number (from 1) → item N of the list → length
- **Quiz:** position variable → ask and wait → answer = item (position) of the list → score

### Common mistakes
- **Defining a block but never calling it.** A definition is only a recipe.
- **Not using the input.** Leaving a fixed number in the definition and never using the input.
- **Writing the two lists in different orders.** The answer is compared with the wrong item.
- **Not increasing the position variable.** The same question is asked again and again.
- **Starting the item number at 0.** List items are counted from 1.

### End-of-week review
1. Read the concept cards and say the "common mistake" lines out loud.
2. Solve the questions you got wrong again, together with their explanations.
3. Change the \`dans et\` (dance) block in three different ways. What changes where it is called?
4. Add a 6th question to your quiz. Did you have to change the code?
5. Answer in your own words: "Why does making your own block make your work easier?"

The mini quizzes of the two lessons are enough as the end-of-week test; 10 questions in total. Goal: at least 3 right answers from each lesson.

### Project rubric (Quiz game)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Own block | None | At least one block is defined and called | A block with an input and several calls |
| Lists | No question or answer list | Two lists, at least 4 items, in the same order | 5+ questions; adding a question does not change the code |
| Quiz | Questions are not asked in order | Questions are asked in order with the position variable, and the answer is checked | Right/wrong feedback and a score summary at the end |
| Explaining | Cannot explain | Explains the lists and the position variable | Explains how they found and fixed a bug |

### Note for parents and teachers
- **Goal.** The child sees the power of giving jobs a name and reusing them (abstraction), and of keeping many values together (a list).
- **How to help?** Ask: "Where is this block called?" and "Which question in the questions list are we asking now?"
- **Personal information.** Quiz questions should not contain private information about family or friends.
- **Progress.** Mini quiz results appear skill by skill on the "My progress" page (draft feature; saved only if consent was given).`,
    lessons: [
      {
        title: 'Make your own block',
        problem: 'You keep writing the same 5 blocks again and again all over your program. What if you could give them one name and call them as a single block?',
        contentMd: `## Activity
1. In the My Blocks (pink) category, click the **Make a Block** button and name it \`zıpla\` (jump).
2. Under the definition block, build this: *change y by 20 → wait 0.1 seconds → change y by -20*.
3. Use the \`zıpla\` block in your main code. Call it a few times.
4. Add an **input** to the block (for example \`yükseklik\`, height) and choose how high it jumps when you call it.
5. Now define other blocks, such as \`dans\` (dance) and \`ses\` (sound).

## Note for parents / teachers
Concept: **function / abstraction**. Writing a job once and calling it by its name. The code gets shorter and easier to change: change the jump height in one place and it changes everywhere.`,
        question: 'Why did making your own block make your work easier? What happened when you made a change in one place?',
        explainerMd: `### What you will learn in this lesson
- How to define your own block with **Make a Block**
- How to call the block you defined
- How to add an input to a block
- Why it helps to make a change in just one place

### What you should know first
Lesson 4: repeat. Lesson 2: the y coordinate. Lesson 12: clones (the idea of splitting a job into parts).

### Writing the same blocks again and again
To jump, you need three blocks: change y by 20, wait 0.1 seconds, change y by −20. If you make the sprite jump in five places in your program, you write 15 blocks. To change one thing, you have to fix all five.

### Make a Block
In the **My Blocks** category, you use the **Make a Block** button to create a new block and name it \`zıpla\` (jump). You drag commands under the definition block. Then you call the \`zıpla\` block in your main code:
\`\`\`
tanım: zıpla
  y'yi 20 değiştir
  0.1 saniye bekle
  y'yi -20 değiştir

yeşil bayrak tıklanınca
  zıpla
  zıpla
\`\`\`
A definition is only a recipe. To make it run, you have to **call** it somewhere.

### Input
To make each jump a different height, you add an **input** to the block. Let's name the input \`yükseklik\` (height):
\`\`\`
tanım: zıpla (yükseklik)
  y'yi (yükseklik) değiştir
  0.1 saniye bekle
  y'yi (yükseklik × -1) değiştir
\`\`\`
Now \`zıpla 30\` makes the cat jump 30 units, and \`zıpla 60\` makes it jump 60 units. After jumping, the cat comes back to where it was, because the same height is taken away again.

### Change it in one place
To make the jump slower, you change the wait time in the definition to 0.2. Everywhere the block is called, it now runs the new way.

### Summary
Your own block is a name you give to commands you use often. First you define it, then you call it. An input lets you run the same block with different values. You make changes only in the definition.`,
        concepts: [
          { term: 'Make a Block', definition: 'A feature for defining a new block with a name you choose.', example: 'A block called `zıpla` (jump) puts three commands under one name.', pitfall: 'Defining a block but never using it in the main code.' },
          { term: 'Calling', definition: 'Using a defined block in the main code so that it runs.', example: 'When you put `zıpla` under the flag, the commands in the definition run.', pitfall: 'Thinking the definition block runs on its own; a definition is only a recipe.' },
          { term: 'Input', definition: 'A slot that lets you give a block a different value each time you call it.', example: '`zıpla 30` and `zıpla 60` are the same block with different values.', pitfall: 'Adding an input but not using it in the definition.' },
          { term: 'Abstraction', definition: 'Hiding the details behind a name so you can use them easily.', example: 'Saying `dans et` (dance) saves you from remembering three turn and wait commands.', pitfall: 'Putting everything into one block; a block should be small and do one job.' },
          { term: 'Change in one place', definition: 'When you change the definition, every call of the block changes too.', example: 'You change the jump time once in the definition, and the new time works everywhere.', pitfall: 'Trying to change every call by hand instead of the definition.' },
        ],
        quiz: [
          { id: 'm2h7d1-q1', kind: 'mcq', prompt: 'What is the biggest benefit of making your own block?', options: ['The program runs faster', 'The sounds are nicer', 'The sprite gets bigger', 'You put commands you use often under one name, call them anywhere, and make changes in one place'], answer: 3, explanation: 'Your own block puts repeating commands under one name. The code gets shorter and changes are made in one place. It has nothing to do with speed, sound or size.', skills: ['sh-proc'] },
          { id: 'm2h7d1-q2', kind: 'numeric', prompt: `The cat starts at y = 0. While this program runs, what is the highest y value the cat reaches?\n\n\`\`\`\ntanım: zıpla (yükseklik)\n  y'yi (yükseklik) değiştir\n  0.1 saniye bekle\n  y'yi (yükseklik × -1) değiştir\n\nyeşil bayrak tıklanınca\n  zıpla 25\n  zıpla 45\n  y'yi 10 değiştir\n\`\`\``, answer: 45, tolerance: 0, unit: 'y', explanation: 'On the first jump, the cat goes up to 25 and comes back down to 0. On the second, it goes up to 45 and comes back down to 0. The highest value is 45. At the end y becomes 10, but that is less than 45.', skills: ['sh-proc', 'sh-coords'] },
          { id: 'm2h7d1-q3', kind: 'find-bug', prompt: `Ece defined the \`zıpla\` (jump) block, but when she clicks the flag the cat does not jump:\n\n\`\`\`\ntanım: zıpla\n  y'yi 20 değiştir\n  0.1 saniye bekle\n  y'yi -20 değiştir\n\nyeşil bayrak tıklanınca\n  x'i 10 değiştir\n\`\`\`\n\nWhat is the problem?`, options: ['The jump block has the wrong name', 'The `zıpla` block was defined but never called in the main code', 'You cannot use a wait block in a definition', 'The green flag hat block is too short'], answer: 1, explanation: 'A definition is only a recipe. The `zıpla` block will not run until you put it in the main code and call it. Right now, the only block under the flag is "change x by 10".', skills: ['sh-debug', 'sh-proc'] },
          { id: 'm2h7d1-q4', kind: 'predict-output', prompt: `The cat is pointing in direction 90. Which direction is it pointing in when the program ends?\n\n\`\`\`\ntanım: dans et\n  ↻ 30 derece sağa dön\n  0.1 saniye bekle\n  ↺ 10 derece sola dön\n\nyeşil bayrak tıklanınca\n  dans et\n  dans et\n  dans et\n\`\`\``, options: ['Direction 90', 'Direction 120', 'Direction 150', 'Direction 210'], answer: 2, explanation: 'One call of `dans et` (dance) turns the cat 30 − 10 = 20 degrees to the right overall. Three calls add 3 × 20 = 60 degrees: 90 + 60 = 150.', skills: ['sh-proc', 'sh-coords'] },
          { id: 'm2h7d1-q5', kind: 'mcq', prompt: 'What does adding a `yükseklik` (height) input to the jump block let you do?', options: ['Make the block run faster', 'Make the cat switch costumes', 'Use the same block with a different height each time you call it', 'Make the block run on its own'], answer: 2, explanation: 'An input lets you give the block a different value each time you call it. `zıpla 30` and `zıpla 60` use the same block but jump to different heights.', skills: ['sh-proc'] },
        ],
      },
      {
        title: 'A quiz game with lists',
        problem: 'A quiz has 5 questions. Is it better to keep each question in its own variable, or to keep them all in one list?',
        contentMd: `## Activity
1. In the Variables category, click the **Make a List** button and name it \`sorular\` (questions). Add 4-5 questions to it.
2. Make a second list called \`cevaplar\` (answers) and write the answers in the same order.
3. Make a variable called \`sıra\` (position), starting at 1. The sprite asks **item \`sıra\` of \`sorular\`** (with the **ask … and wait** block).
4. If the answer equals **item \`sıra\` of \`cevaplar\`**, say "Correct!" and **change \`skor\` (score) by 1**; if not, say "Wrong". Then **change \`sıra\` by 1**.
5. When the list runs out, the quiz should end and say the score.

## Challenge
Ask the questions in a random order each time.`,
        question: 'How is keeping the questions in a list different from keeping them in separate variables? Why is it easy to add more questions?',
        explainerMd: `### What you will learn in this lesson
- What a list is, and that item numbers start at 1
- How to read item N of a list
- How to walk through a list with the \`sıra\` (position) variable
- How to match up a questions list and an answers list

### What you should know first
Lesson 13: your own block. Lesson 10: variables. Lesson 9: if. Lesson 11: repeat until.

### What is a list?
A variable holds one value. A **list** holds many values in order, like a shopping list. Each item has an **item number**, and counting starts at **1**. Think of a \`meyveler\` (fruits) list: \`elma\` (apple), \`armut\` (pear), \`kiraz\` (cherry). Here item 3 is \`kiraz\`.
Some list blocks:
- **item 2 of \`meyveler\`**: \`armut\`
- **length of \`meyveler\`**: 3
- **add \`muz\` (banana) to \`meyveler\`**: adds it at the end
- **insert \`muz\` at 1 of \`meyveler\`**: adds it at the start, and the others move along

### Quiz game
Set up two lists: \`sorular\` (questions) and \`cevaplar\` (answers). Both must be in the same order: the answer to item 2 of the questions list is item 2 of the answers list. The \`sıra\` variable starts at 1 and goes up by 1 for each question:
\`\`\`
yeşil bayrak tıklanınca
  sıra = 1 yap
  skor = 0 yap
  sıra > (sorular listesinin uzunluğu) olana dek tekrarla
    (sorular listesinin (sıra). öğesi) diye sor ve bekle
    eğer cevap = (cevaplar listesinin (sıra). öğesi) ise
      Doğru! de 0.5 saniye
      skor değişkenini 1 kadar değiştir
    değilse
      Yanlış de 0.5 saniye
    sıra değişkenini 1 kadar değiştir
\`\`\`
The loop keeps going until \`sıra\` is bigger than the length of the list. If the questions list has 5 questions, the loop goes round 5 times.

### Why a list?
If you keep each question in its own variable, you have to change the code for every new question. With lists, you just add one item to each of the two lists; the code stays the same. The comparison does not care about capital and small letters: "Paris" and "paris" count as equal.

### Summary
A list is a group of values in order. Positions start at 1. You make a quiz by keeping the questions and answers lists in the same order and walking through them with a position variable. To add a new question, you only add items to the lists.`,
        concepts: [
          { term: 'List', definition: 'A kind of variable that holds many values in order.', example: 'The `sorular` (questions) list holds all the quiz questions in order.', pitfall: 'Making a separate variable for each item; a list keeps them all in one place.' },
          { term: 'Item number', definition: 'The place of an item in the list; counting starts at 1.', example: 'In the list apple, pear, cherry, item 3 is cherry.', pitfall: 'Starting to count at 0; the first item is 1.' },
          { term: 'item N of the list', definition: 'The block that gives the value at place number N in the list.', example: '"item 2 of `sorular`" gives the second question.', pitfall: 'Writing a number bigger than the list; you get an empty value.' },
          { term: 'Position variable', definition: 'A number variable that shows which item of the list you are on right now.', example: 'Each time a question is asked, `sıra` (position) goes up by 1.', pitfall: 'Forgetting to increase the position variable and asking the same question again and again.' },
          { term: 'Matching lists', definition: 'Two lists kept in the same order, where items in the same place belong together.', example: 'The answer to question 3 in the questions list is item 3 of the answers list.', pitfall: 'Writing the lists in different orders; the answers are compared with the wrong questions.' },
        ],
        quiz: [
          { id: 'm2h7d2-q1', kind: 'predict-output', prompt: `The \`meyveler\` (fruits) list starts like this: elma, armut, kiraz (apple, pear, cherry). What does the cat say?\n\n\`\`\`\nmuz öğesini meyveler listesinin 1. sırasına ekle\nmeyveler listesinin 3. öğesi de\n\`\`\``, options: ['elma', 'armut', 'kiraz', 'muz'], answer: 1, explanation: 'When `muz` (banana) goes into place 1, the list becomes muz, elma, armut, kiraz, and the old items each move along by one. Item 3 is `armut` (pear). `kiraz` (cherry) is now in place 4.', skills: ['sh-list'] },
          { id: 'm2h7d2-q2', kind: 'numeric', prompt: `The \`sorular\` (questions) list has 8 questions. The \`sıra\` (position) variable starts at 3 and goes up by 1 each round. How many rounds does the loop run?\n\n\`\`\`\nsıra = 3 yap\nsıra > (sorular listesinin uzunluğu) olana dek tekrarla\n  (ask a question)\n  sıra değişkenini 1 kadar değiştir\n\`\`\``, answer: 6, tolerance: 0, unit: 'rounds', explanation: 'The loop runs when `sıra` is 3, 4, 5, 6, 7 and 8. When it becomes 9, it is bigger than the length (8) and the loop ends. That is 6 rounds: 8 − 3 + 1.', skills: ['sh-list', 'sh-loop'] },
          { id: 'm2h7d2-q3', kind: 'find-bug', prompt: `The quiz code is correct, but even when the player gives the right answer, it says "Wrong". The lists look like this:\n\n\`\`\`\nsorular: [ "How many days are in a week?", "How many sides does a triangle have?" ]\ncevaplar: [ "3", "7" ]\n\`\`\`\n\nWhat is the problem?`, options: ['The questions and answers lists are not in matching order: the answer to question 1 should be 7', 'The answers list is too short', 'The position variable starts at 0', 'The "Wrong" block is too short'], answer: 0, explanation: 'The questions and answers must be in the same order. Here the answer to question 1 (how many days in a week) should be 7, and the answer to question 2 should be 3. When the lists do not match, the right answer is compared with the wrong item.', skills: ['sh-debug', 'sh-list'] },
          { id: 'm2h7d2-q4', kind: 'find-bug', prompt: `The quiz keeps asking the same question:\n\n\`\`\`\nyeşil bayrak tıklanınca\n  sıra = 1 yap\n  sıra > (sorular listesinin uzunluğu) olana dek tekrarla\n    (sorular listesinin (sıra). öğesi) diye sor ve bekle\n    eğer cevap = (cevaplar listesinin (sıra). öğesi) ise\n      Doğru! de 0.5 saniye\n    değilse\n      Yanlış de 0.5 saniye\n\`\`\`\n\nWhat is the problem?`, options: ['The questions list is empty', 'The if block is too long', 'The "Correct!" message is too short', 'The position variable is never increased in the loop, so question 1 is always asked'], answer: 3, explanation: 'If `sıra` (position) stays at 1, question 1 is always asked, and the loop never ends because "position > length" never becomes true. You need "change `sıra` by 1" at the end of the loop.', skills: ['sh-debug', 'sh-var', 'sh-list'] },
          { id: 'm2h7d2-q5', kind: 'mcq', prompt: 'You want to add a 6th question to the quiz. If the questions and answers are kept in lists, what do you do?', options: ['You write all the code again from the start', 'You add one item to the questions list and one to the answers list, in the same order; the code does not change', 'You add a new sprite', 'You delete the position variable'], answer: 1, explanation: 'Because the code loops according to the length of the list, a new question only needs to be added to the two lists (questions and answers). You do not need to change the code; this is the main advantage of lists.', skills: ['sh-list'] },
        ],
      },
    ],
  },
    // Week 8
  {
    guideMd: `### Week goals
By the end of this week, the student:
1. Plans a project idea: who or what is in it (sprites), which scenes, which blocks will be needed.
2. Builds the **smallest working version** of the project (one sprite, one interaction) and grows it step by step.
3. Tries it with the green flag after every new feature; finds and fixes bugs with a checklist.
4. Finds a test friend, watches them without helping and notes where they get stuck.
5. Shows the project: explains what they made, which blocks were tricky and how they solved them; says which ideas inspired them.

### Week plan
| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Idea and plan | ~30 min | Choose the project type, write the plan, build the smallest working version. |
| 2 | Build, test, show | ~45 min | Grow the project, try it with a test friend, fix two things, show it. |
| 3 | Week project: My game / my story | ~45 min | Finishing touches, project info, show it to family or friends. |

### Prerequisite check
- Does the student have a finished project from the earlier weeks?
- Can they name the ideas of event, loop, variable, message, clone, own block and list?
- Are they ready to run code on their own and look for bugs?

### Concept map
- **Planning:** idea → list of sprites → scenes → blocks needed
- **Smallest working version:** one sprite + one interaction → grow it
- **Making loop:** build → try → find → fix → try again
- **Sharing:** test friend → show → project info → saying where ideas came from

### Common mistakes
- **Starting without a plan.** The project turns into a heap that never ends.
- **Adding everything at once.** When it doesn't work, nobody knows where the bug is.
- **Plan and code not matching.** For example, writing "right arrow" in the plan but choosing another key in the code.
- **Not resetting things when the game starts again.** Score, position and show/hide stay as they were.
- **Writing personal details in the project info.** Real name, school and address are never written there.

### End-of-week review
1. Look at the concept cards from all eight weeks: event, loop, variable, condition, message, clone, own block, list.
2. Solve again the mini quiz questions you got wrong.
3. Explain your project plan to a friend in 1 minute without looking.
4. Use the checklist to look for three possible bugs in your project.
5. Answer in your own words: "What did you learn most in this module, and where did you use it in your project?"

Two lessons' mini quizzes are enough as the end-of-week test; 10 questions in total. Goal: at least 3 right answers from each lesson.

### Project rubric (My game / my story)
| Criterion | Developing | Proficient | Advanced |
|---|---|---|---|
| Plan | No plan | Sprites, scenes and blocks needed are written down | Plan matches the code, changes are noted |
| Working | Project has errors or no interaction | The player does something with a key or a click, and the stage reacts | No bugs, works properly when restarted |
| Scope | 1 sprite, fewer than 5 blocks | At least 2 sprites, 10 different blocks, a variable or a message | Loop, condition, variable, message and own block together |
| Testing and fixing | No testing | At least two fixes from the test friend's notes | Explains the fixes and why they were made |
| Explaining | Can't explain it | How to play is written in the project info | Explains the tricky block and its solution, and the ideas that inspired them |

### Note for parents and teachers
- **Goal.** The child learns to turn an idea into a finished project through a loop of planning, building, trying and fixing.
- **How to help.** Instead of giving the answer, ask: "What did your plan say?", "What is the smallest working version?", "Which block are you looking at?"
- **Test friend.** Watch without steering the child; the place where they get stuck is a clue that will improve the project.
- **Safety.** The project and its notes are a file that can be shared; they must not contain a real name, school, address or photo.
- **What's next?** In Stage Workshop you controlled characters on the screen. In the next module (Arduino) you will control real lights and sensors: the same logic, a different world.`,
    lessons: [
      {
        title: 'Idea and plan',
        problem: 'It\'s time to put together everything you have learnt and make your own project. But first: what are you going to make?',
        contentMd: `## Activity
1. Choose your project type: a **game**, a **story**, an **instrument / music** or a **quiz**.
2. Make a **plan** on paper:
   - Who or what is in it (sprites)?
   - Which scenes / levels?
   - Which blocks will you need (event, loop, variable, message, own block)?
3. Build the **smallest working version** of your project (MVP): just one sprite and one interaction.
4. **Explain** your plan to a friend or your family in 1 minute. As you talk, write down anything you notice is missing.
5. If you got ideas from someone else, write that in the project notes.

## Note for parents / teachers
A plan makes it less likely that the child falls into the "never-ending project" trap. Suggest starting small and growing it.`,
        question: 'What is the smallest working version of your project? If you focus on that first, what path will you follow?',
        explainerMd: `### What you will learn in this lesson
- How to write a project plan
- How to decide on the smallest working version of your project
- What an interaction is
- How to write a plan and a description in the project info

### What you should know first
The whole module. Especially events (lesson 5), variables (lesson 10), messages (lesson 8), clones (lesson 12), your own blocks (lesson 13) and lists (lesson 14).

### Why do you need a plan?
A project that starts without a plan often never gets finished. Write your plan on paper or in **Project info**:
- Who or what is in it? (sprites)
- Which scenes or backdrops are there?
- Which blocks will you need? (event, loop, variable, message, clone, own block)
- What will the player be able to do?

### The smallest working version
Don't try to finish the project all at once. Start with just one sprite and one interaction:
\`\`\`
Kedi: sağ ok tuşuna basılınca
  x'i 10 değiştir
  sonraki kostüm

Kedi: bu sprite tıklanınca
  Miyav! de 1 saniye
\`\`\`
When this works, you add pieces like the apple, the score and the timer one by one, and click the flag to try it after each one. If something breaks, the bug is in the last piece you added.

### Interaction
An **interaction** is when the player does something and the stage reacts to it: pressing a key, clicking, or using a message to set another character moving. Without interaction, the program is just a film that plays by itself. When the player interacts, something you can see or hear on the stage should change. For example, in the code above, if you press the right arrow 3 times, the cat moves 3 × 10 = 30 units to the right.

### Inspiration and safety
If you got ideas from someone else, write that in the project notes. Don't write your real name, school, address or photo in the notes; the project file can be shared.

### Summary
Plan first: sprites, scenes and blocks. Build the smallest working version and grow it step by step. Your project should have an interaction the player can do. Say which ideas inspired you, and don't write personal details.`,
        concepts: [
          { term: 'Plan', definition: 'A draft you write before making the project: sprites, scenes, blocks needed and what the player will do.', example: '"There is a cat and an apple, 3 backdrops, a variable for the score, walking with the right arrow."', pitfall: 'Starting without a plan and not knowing what to do after the first block.' },
          { term: 'Smallest working version', definition: 'The simplest version of the project that works: one sprite and one interaction.', example: 'The cat walks when you press the right arrow. That is a start.', pitfall: 'Trying to add everything at once, so that nothing works.' },
          { term: 'Interaction', definition: 'When the player does something and the stage reacts to it.', example: 'The cat walking when you press an arrow key is an interaction.', pitfall: 'Writing a program that only runs on the flag and gives the player nothing to do.' },
          { term: 'Project info', definition: 'The section where you write the name of the project and notes (plan, how to play).', example: '"Walk the cat with the right and left arrow keys. You score a point when it touches the apple."', pitfall: 'Writing your real name, school or address in this section.' },
          { term: 'Inspiration', definition: 'Starting from someone else\'s idea and changing it to fit your own project.', example: 'If your friend\'s catch game gave you the idea, write that in your notes.', pitfall: 'Showing someone else\'s idea as if it were your own.' },
        ],
        quiz: [
          { id: 'm2h8d1-q1', kind: 'mcq', prompt: 'Which of these is the "smallest working version" of a project?', options: ['Adding all the sprites, scenes and the score in one go', 'Only drawing a backdrop', 'A version where one sprite and one interaction (e.g. walking when you press the right arrow) work', 'Writing a plan without using any blocks'], answer: 2, explanation: 'The smallest working version is the simplest version that really works: one sprite and one interaction. New pieces are added on top of it one by one. Adding everything at once makes it hard to find the cause when there is a bug.', skills: ['sh-plan'] },
          { id: 'm2h8d1-q2', kind: 'numeric', prompt: `The cat is at x = 0. This is its code. The player presses the right arrow key 3 times and clicks the cat once. What is the cat's final x value?\n\n\`\`\`
Kedi: sağ ok tuşuna basılınca
  x'i 10 değiştir
  sonraki kostüm

Kedi: bu sprite tıklanınca
  Miyav! de 1 saniye
\`\`\``, answer: 30, tolerance: 0, unit: 'x', explanation: 'Each press of the right arrow adds 10 to x: 3 × 10 = 30. The click only makes the cat talk; it doesn\'t change its position.', skills: ['sh-events', 'sh-coords'] },
          { id: 'm2h8d1-q3', kind: 'find-bug', prompt: `The plan says "the cat walks with the right arrow key". But when the player presses the right arrow, the cat doesn't move:\n\n\`\`\`
Kedi: a tuşuna basılınca
  x'i 10 değiştir
  sonraki kostüm
\`\`\`\n\nWhat is the problem?`, options: ['The code doesn\'t match the plan: the "a" key is chosen in the hat block instead of "right arrow"', '10 steps is too few', 'The next costume block doesn\'t move the sprite', 'The cat has only one costume'], answer: 0, explanation: 'The plan says right arrow, but the a key is chosen in the code. Matching the key in the hat block to the plan fixes it. Comparing the plan with the code is a good way to find bugs.', skills: ['sh-debug', 'sh-plan', 'sh-events'] },
          { id: 'm2h8d1-q4', kind: 'mcq', prompt: 'Which of these should you NOT write in the project info?', options: ['How to play', 'The idea that inspired you', 'The name of the project', 'Your real name and the name of your school'], answer: 3, explanation: 'The project file can be shared, so personal details like your real name, school, address and photo are not written. How to play, the project name and your inspiration are things you should write.', skills: ['sh-safety'] },
          { id: 'm2h8d1-q5', kind: 'mcq', prompt: 'Which of these is an interaction?', options: ['The green flag makes the cat walk once and the program ends', 'The player presses an arrow key and the character walks', 'The backdrop picture is the sky', 'The sprite is called "Kedi" (Cat)'], answer: 1, explanation: 'In an interaction, the player does something and the stage reacts. A program that runs once on the flag, a backdrop or a sprite name is not something the player does.', skills: ['sh-events', 'sh-plan'] },
        ],
      },
      {
        title: 'Build, test, show',
        problem: 'The secret to finishing your project: build, try, find, fix, try again. Are you ready?',
        contentMd: `## Activity
1. Build your project following your plan. After each new feature, **try it with the green flag**.
2. Find a **test friend**: while they use your project, **don't help them**, just watch. Where did they get stuck? Take notes.
3. **Fix at least two things** from your notes.
4. **Show it:** show your project to your family / friends. Tell them: what did you make, which blocks were tricky, what did you solve?
5. Click the **Project info** button at the top of the editor, and in the section that opens, write **how to play** and **which ideas inspired you**. Don't write personal details.

## What's next?
In Stage Workshop you controlled characters on the screen. In the next module (Arduino) you will control a circuit and real lights and sensors: the same logic, a different world.`,
        question: 'What did your test friend notice in your project that you hadn\'t noticed? What did you fix?',
        explainerMd: `### What you will learn in this lesson
- How to build and try in small steps
- A checklist for bug hunting
- How to test with a test friend
- How to explain your project

### What you should know first
Lesson 15: the plan and the smallest working version. The bug-finding tips from earlier lessons.

### Build, try, find, fix
Don't write a big project in one go. The loop goes like this: add a small feature, try it with the green flag, if there is a bug find it and fix it straight away, then add a new feature. The old feature must work before you move on to a new one.

### Bug hunt checklist
If something doesn't work, check these:
- Are the blocks attached to a hat block? (lesson 1)
- Is the right sprite selected? (lesson 2)
- Is the block inside the loop? (lesson 4)
- Is it the right event and the right message name? (lessons 5, 8)
- Are the score and the timer set at the start? (lesson 10)
- When the game starts again, does everything go back to how it was at the start? Position, showing/hiding, variables.

### Test friend
Let a friend play your project and **don't help them**; just watch and note where they get stuck. If your friend got stuck, the game isn't clear enough; that is useful information for you. For example, if 3 out of 5 friends get stuck on the first level, the stuck rate is 3 ÷ 5 = 60%. A number like this shows you what to fix first. Fix at least two things from your notes.

### Showing your project
Show your project to your family and friends. Tell them what you made, which block was tricky for you and how you solved it. Say which ideas inspired you. Write how to play in the project info; don't write personal details.

### Summary
Go in small steps and try after each step. Use the checklist to look for what isn't working. Watch your test friend without helping and make fixes from your notes. When you talk about your project, share the tricky parts and how you solved them.`,
        concepts: [
          { term: 'Build, try, fix', definition: 'A way of working where you add a small piece, try it straight away and fix bugs at once.', example: 'When you add the score, you run the game and see that the score goes up.', pitfall: 'Writing everything and trying it only at the end; then it is hard to find where the bug is.' },
          { term: 'Test friend', definition: 'The person who tries your project while you watch without helping.', example: 'If your friend gets stuck on the first level, you know that part isn\'t clear.', pitfall: 'Giving your friend hints; then you can\'t see the real problem.' },
          { term: 'Bug hunt checklist', definition: 'A list of things to check one by one when a project doesn\'t work.', example: 'You ask: is it attached to a hat block, is it the right sprite, is it inside the loop?', pitfall: 'Changing blocks at random; checking in order with a list is quicker.' },
          { term: 'Going back to the start', definition: 'When the game starts again, position, showing/hiding and variables go back to how they were at first.', example: 'Resetting the score under the flag and showing the sprite that was hidden.', pitfall: 'Leaving a project that works the first time but breaks the second time.' },
          { term: 'Showing your project', definition: 'Showing your project to others and explaining what you made and how you solved things.', example: 'You tell your family about the tricky block and how you solved it.', pitfall: 'Only showing the result; explaining what you learnt matters too.' },
        ],
        quiz: [
          { id: 'm2h8d2-q1', kind: 'mcq', prompt: 'What should you do while your test friend plays your project?', options: ['Give a hint as soon as they get stuck', 'Not take any notes', 'Watch without helping and note where they get stuck', 'Play instead of your friend'], answer: 2, explanation: 'If you help, you can\'t see where the game is really hard to understand. Watching and noting where they get stuck shows you what to fix.', skills: ['sh-plan'] },
          { id: 'm2h8d2-q2', kind: 'numeric', prompt: `The cat starts at x = -150. The player presses the right arrow key 8 times.\n\n\`\`\`
Kedi: sağ ok tuşuna basılınca
  x'i 12 değiştir
\`\`\`\n\nWhat is the cat's final x value?`, answer: -54, tolerance: 0, unit: 'x', explanation: 'Each press adds 12 to x: 8 × 12 = 96. -150 + 96 = -54. The cat is still on the left side of the stage (x is negative).', skills: ['sh-coords', 'sh-events'] },
          { id: 'm2h8d2-q3', kind: 'find-bug', prompt: `The apple disappears when it falls into the basket, but when the player clicks the green flag again, the apple doesn't appear:\n\n\`\`\`
Elma: yeşil bayrak tıklanınca
  y konumu < -100 olana dek tekrarla
    y'yi -5 değiştir
  gizle
\`\`\`\n\nWhat is the problem?`, options: ['There is no block to show the apple and put it back in its starting place when the game restarts', 'The apple falls too fast', 'The hide block is in the wrong category', 'You need repeat instead of repeat until'], answer: 0, explanation: 'The hide block hides the apple, so in the second game the apple is still hidden and stays at the bottom. Under the flag you first need **show** and **go to x: … y: …** to go back to the start.', skills: ['sh-debug', 'sh-plan'] },
          { id: 'm2h8d2-q4', kind: 'mcq', prompt: 'Which way of working is better for growing your project?', options: ['Write everything, then try it all at once at the end', 'Show it first, then test it', 'If you find a bug, delete the project', 'Add a small feature, try it, fix any bug, then add the next one'], answer: 3, explanation: 'Going in small steps narrows the bug down to the last piece you added. Writing everything and trying it afterwards makes it hard to find where the bug is.', skills: ['sh-plan', 'sh-debug'] },
          { id: 'm2h8d2-q5', kind: 'numeric', prompt: '3 out of 5 test friends got stuck on the first level. What percentage got stuck?', answer: 60, tolerance: 0, unit: '%', explanation: '3 ÷ 5 = 0.6, which is 60 per cent. A rate like this shows that you should make the first level simpler.', skills: ['sh-plan'] },
        ],
      },
    ],
  },
  ],
}
