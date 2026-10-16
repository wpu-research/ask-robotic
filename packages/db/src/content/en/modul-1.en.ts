import type { ModuleEn } from '../en'

// English for Module 1 (First Steps in Block Coding). Week and lesson order mirrors modul-1-scratchjr.ts and extras/modul-1.ts.
// Block and button names follow the English block workshop UI (apps/web/src/i18n/en/studios.ts).
// Block stacks inside quiz code blocks stay exactly as in the Turkish source.

/** Writes a block stack as an untagged code block (same lines as the Turkish quiz). */
const kod = (...lines: string[]) => '```\n' + lines.join('\n') + '\n```'

const plan = `The week has two lessons. Each lesson is a short activity; you do not have to fit both into the same day. If the child gets tired, leave the second lesson for another day.`
const review = `As the end-of-week test, the mini tests of the two lessons are enough. Goal: get most answers right in each lesson. If something is missing, read the lesson's explanation together again.`

export const modul1En: ModuleEn = {
  weeks: [
    // ---------------- Week 1: Give a command, the robot does it ----------------
    {
      guideMd: `### Week goals
By the end of this week, the child:
1. Says that the robot only does the commands it is given.
2. Shows that commands run in order, and that changing the order changes the result.
3. Knows that the Green flag starts the script.
4. Knows that the number on the Forward block is the number of steps, and changes it.
5. Sees the difference between Turn right and Turn left on the screen.

### This week's plan
${plan}

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Robot game | ~25 min | Read the explanation together, take the robot to the star, do the order experiment, do the mini test. |
| 2 | First moves | ~25 min | Make the cat walk, change the number of steps, try the bin, do the mini test. |

### Prerequisite check
- Does the child know right and left? (If not, look at the coloured arrow on the turn blocks.)
- Can they drag and drop something with a finger or a mouse?
- Can they see the computer or tablet screen easily?

### Concept map
- **Command:** Forward, Turn right, Turn left, Hop
- **Order:** first this, then this
- **Script:** blocks stacked one under another, with the Green flag on top
- **Number of steps:** the number on the Forward block

### Common mistakes
- **Not adding the Green flag.** The script does not run. Nothing happens when you press Start.
- **Mixing up Turn right and Turn left.** The robot goes the other way; it is not a mistake, try it and see.
- **Mixing up the order.** If you turn first, the robot walks somewhere else.
- **Leaving the number too small.** The robot does not reach the star. Make the number bigger.
- **Forgetting the blocks below.** If you grab a block in the middle, the blocks under it come too.

### End-of-week review
1. Look at the concept cards of each lesson again and read the "Common mistake" line out loud.
2. Read the explanation of the wrong mini test answers together, then answer the question again.
3. Solve the robot game once more, this time with different numbers of steps.
4. Ask the child: "Does the robot think by itself, or does it do our commands?"

${review}

### Project assessment rubric
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Order | Mixes up the order, cannot say why | Builds the right order and takes the robot to the star | Breaks the order on purpose and says the result in advance |
| Starting | Forgets the Green flag | Starts the script with the Green flag | Explains what happens without the flag |
| Steps | Does not change the number | Changes the number and gets the robot to the star | Guesses the number of steps in advance |
| Explaining | Does not say what they did | Tells what the robot did in their own words | Finds their mistake and tells how they fixed it |

### Note for parents and teachers
- **Goal.** This week we are not asking the child to memorise code. The goal is to feel that the computer only does the commands it is given, in order.
- **How to help.** Do not place the block for the child. Ask: "What did the robot do? What did you want?"
- **Mistakes.** Do not say "wrong" to a child who builds the wrong order. Watch the robot together; let the child find the mistake.
- **Time.** Short, frequent sessions are better than one long session. Stop when the child gets bored.
- **Safety.** Everything on this platform is virtual; anything done wrong can be undone (the Reset button).
- **Progress.** Mini test results appear on the "My progress" page (draft feature).
`,
      lessons: [
        // 1.1 Robot game
        {
          title: 'Robot game',
          problem: 'A robot only does what you tell it. It does nothing else. If you say "go", where does it go?',
          contentMd: `## Getting ready
In the app next to this lesson, there is a **robot** on the stage and a **star** far away. You will take the robot to the star. On the left is the **block area**. On the far left, round coloured buttons show the **categories**. Next to them are the blocks of the category you pick. On the right is the empty work area. In this lesson only two categories are open: **Start** (yellow) and **Motion** (blue).

## Activity
1. Tap the **Start** category. Hold the **🏁 Green flag** block and drag it to the work area. Your script has started. A script is a train made of blocks. The Green flag is its engine (it has a round top).
2. Go to the **Motion** category. The robot only knows these commands: **Forward**, **Turn right**, **Turn left** and **Hop**.
3. Drag the **Forward** block close under the Green flag. When they snap together, let go. (If you tap a block once without dragging, it is added to the end of the script by itself.) Tap the number on the block and type a new number to change the number of steps.
4. The robot must go right first, then go down. Add a **Turn right** block under it. Put another **Forward** after it.
5. Press the green **🏁 Start** button above the stage. (If you tap any block of a script, only that script runs.) Did the robot reach the star? If not, change the numbers of steps. Use **↺ Reset** to take the robot back to the start.
6. Order experiment: hold the **Turn right** block and move it in front of the first **Forward**. Careful: if you grab a block in the middle, the blocks under it come too. Press **🏁 Start** again. Where did the robot go? Then put the old order back.
7. When the robot reaches the star, add a **Hop** at the very end to celebrate.

## For parents
This lesson has one goal: the idea of **order**. The order of commands changes the result. If the child builds the wrong order, do not fix it. Watch what the robot does together and ask: "What did the robot do? What did you want?" When the child finds the mistake by themselves, they feel that computers work like this too. Do not place the blocks for the child; just sit with them and ask questions.`,
          question: 'When you put Turn right before Forward, where did the robot go? Why?',
          explainerMd: `### What you will learn in this lesson
- The robot only does the command you give it.
- The order of commands matters.

### What you should know first
Nothing. You only need to know right and left.

### What does the robot do?
A robot does not think by itself. You give it **commands**. The commands are: **Forward**, **Turn right**, **Turn left** and **Hop**. Each command is a block. Blocks go one under another. The robot does them from top to bottom, **in order**.

If the order changes, the robot goes somewhere else. "First Forward, then Turn right" is not the same as "first Turn right, then Forward".

A stack of blocks is called a **script**. A script starts with the **Green flag**. Then you press the 🏁 Start button, and the robot does its blocks. If the robot goes to the wrong place, do not be sad. Change the order and try again.

### Talk together
"What did the robot do? What did you want?"

### Summary
The robot does your commands in order. If the order changes, the result changes too. A script starts with the Green flag.`,
          concepts: [
            { term: 'Command', definition: 'A block that tells the robot what to do.', example: 'Forward tells the robot "walk".', pitfall: 'Thinking the robot thinks of things by itself. The robot only does the command.' },
            { term: 'Order', definition: 'Which command comes first and which comes next.', example: 'First Forward, then Turn right: the robot walks first, then turns.', pitfall: 'Mixing up the order. If you turn first, the robot walks another way.' },
            { term: 'Script', definition: 'Blocks stacked one under another. Like a train.', example: 'Green flag, Forward, Turn right, Forward is a script.', pitfall: 'Leaving the blocks apart. If they do not snap together, it is not a script.' },
            { term: 'Green flag', definition: 'The block that starts the script. It sits at the top of the script.', example: 'When you press the 🏁 Start button, the script with the Green flag runs.', pitfall: 'Forgetting the Green flag. When you press Start, the robot does not move.' },
            { term: 'Turn right', definition: 'The block that turns the robot to the right.', example: 'A robot facing right looks down after Turn right.', pitfall: 'Mixing up Turn right and Turn left. The robot goes the other way.' },
          ],
          quiz: [
            { id: 'm1h1d1-q1', kind: 'mcq', prompt: 'What does the robot do? 🤖', options: ['Whatever it thinks of', 'My commands, in order'], answer: 1, explanation: 'A robot does not think by itself. It only does the commands you give with blocks, in the order you give them.', skills: ['jr-sequence'] },
            { id: 'm1h1d1-q2', kind: 'predict-output', prompt: 'The robot faces right. It did this script:\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 7', '↩️ Sağa dön', '➡️ İleri 6') + '\n\nAt the second Forward (`İleri`), which way does the robot walk?', options: ['⬆️ Up', '⬇️ Down', '➡️ Right'], answer: 1, explanation: 'A robot facing right looks down after Turn right (`Sağa dön`). So the second Forward makes the robot walk down. To go up, you need Turn left.', skills: ['jr-motion', 'jr-sequence'] },
            { id: 'm1h1d1-q3', kind: 'find-bug', prompt: 'The robot should go right first, then go down. Which script is wrong?\n\n' + kod('A: 🏁 → ➡️ İleri → ↩️ Sağa dön → ➡️ İleri', 'B: 🏁 → ↩️ Sağa dön → ➡️ İleri → ➡️ İleri'), options: ['A is wrong', 'B is wrong'], answer: 1, explanation: 'In B the robot turns first. So it walks down at once and never goes right. You need Forward first, then the turn. A is right.', skills: ['jr-sequence', 'jr-debug'] },
            { id: 'm1h1d1-q4', kind: 'numeric', prompt: 'The robot does this script. How many steps does it walk in all?\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 7', '↩️ Sağa dön', '➡️ İleri 6'), answer: 13, unit: 'steps', explanation: 'First it walks 7 steps, then 6 steps: 7 + 6 = 13. Turning does not count as a step.', skills: ['jr-motion'] },
          ],
        },
        // 1.2 First moves
        {
          title: 'First moves',
          problem: 'We found the star with the robot. Now let\'s make the cat walk. What happens if we line up the commands instead of giving them one by one?',
          contentMd: `## Getting ready
In the app next to this lesson, there is a cat on the stage. In this lesson the **Start** and **Motion** categories are open in the block area.

## Activity
1. Drag the **🏁 Green flag** block from the **Start** category to the work area. The top of a script is always a start block.
2. In the **Motion** category, tap the **Forward** block 3 times (or drag it three times and snap it under the flag). Three Forward blocks are stacked one under another.
3. Press **🏁 Start**. The cat walks! Use **↺ Reset** to take the cat back to the start.
4. Tap the number on a Forward block and type a new number. The cat walks less or more.
5. Add a **Turn right** block, and put a **Forward** after it again. Does the cat turn the corner? Also try the **Back** block to make the cat walk back.
6. Did you add a wrong block? Drag the block and drop it in the **bin** at the bottom right: it is deleted. You can also drag a block to move it. If you grab it in the middle, the blocks under it come too.

The goal list in the app shows what to do. When a goal is done, it gets a tick.

## For parents
If dragging a block is hard for the child, tapping the block in the category to add it is enough. "Think of the blocks as a train; the carriages go in order." The Green flag is the "go" button: if there is no start block at the top of the script, nothing happens. In these first days, getting this far is enough.`,
          question: 'What happened when you pressed the Green flag? What would happen without the flag?',
          explainerMd: `### What you will learn in this lesson
- A script is like a train; the Green flag is at the front.
- The number on the Forward block is the number of steps.
- You can throw a wrong block in the bin.

### What you should know first
Lesson 1: Robot game. You know that commands run in order.

### The cat walks
You snap blocks one under another, like carriages. At the front of the train is the engine: the 🏁 **Green flag**. Without the engine, the train does not leave. When you press Start, the cat does its blocks in order.

The number on the **Forward** block says how many **steps** the cat walks. If you type 3, it walks 3 steps. If you make the number bigger, it goes further. If you make it smaller, it walks less. The **Back** block makes the cat walk backwards. Forward and Back cancel each other out.

Did you add a wrong block? Drag it and drop it in the **bin**. It is deleted.

### Talk together
"What would happen without the Green flag?"

### Summary
A script starts with the Green flag. The number on Forward is the number of steps. A wrong block goes in the bin.`,
          concepts: [
            { term: 'Green flag', definition: 'The block at the top of the script that starts it.', example: 'When the Green flag is on top of 3 Forward blocks, the cat starts walking.', pitfall: 'Leaving the script without a flag. When you press Start, the script does not run.' },
            { term: 'Number of steps', definition: 'The number on the Forward block. The cat walks that many steps.', example: 'If you type Forward 3, the cat walks 3 steps.', pitfall: 'Forgetting to change the number. The cat does not reach the star.' },
            { term: 'Back', definition: 'The block that makes the cat walk backwards.', example: 'Forward 3, then Back 3: the cat goes back to where it started.', pitfall: 'Mixing up Back and Turn left. Back makes it walk, Turn left turns it.' },
            { term: 'Bin', definition: 'The place where you drag and drop a wrong block to delete it.', example: 'When you drop an extra Forward block in the bin, it is deleted.', pitfall: 'Building a long script without knowing how to delete a block. The bin helps.' },
            { term: 'Reset', definition: 'The button that takes the cat back to where it started.', example: 'When you press ↺ Reset, the cat comes back to the start.', pitfall: 'Pressing Start again without pressing Reset. The cat goes on from where it stopped.' },
          ],
          quiz: [
            { id: 'm1h1d2-q1', kind: 'mcq', prompt: 'Why do we put the Green flag at the top of the script? 🏁', options: ['So the cat looks nice', 'So the script starts with it'], answer: 1, explanation: 'The Green flag starts the script. Without the flag, the script does not run when you press Start.', skills: ['jr-start-block'] },
            { id: 'm1h1d2-q2', kind: 'numeric', prompt: 'The cat does this script. How many steps does it walk?\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 3', '➡️ İleri 3', '➡️ İleri 3'), answer: 9, unit: 'steps', explanation: '3 + 3 + 3 = 9 steps. Each Forward (`İleri`) block walks as many steps as its number.', skills: ['jr-motion', 'jr-sequence'] },
            { id: 'm1h1d2-q3', kind: 'predict-output', prompt: 'The cat did this script. Where does it stop?\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 3', '⬅️ Geri 3'), options: ['Where it started', '3 steps ahead', '6 steps ahead'], answer: 0, explanation: 'First it goes 3 steps forward (`İleri`), then 3 steps back (`Geri`). It comes back to the same place. To be 3 steps ahead, there should be no Back block.', skills: ['jr-motion'] },
            { id: 'm1h1d2-q4', kind: 'find-bug', prompt: 'I pressed Start, but the cat does not move.\n\n' + kod('➡️ İleri 3', '➡️ İleri 3', '➡️ İleri 3') + '\n\nWhat is wrong?', options: ['There are too many Forward blocks', 'There is no Green flag on top'], answer: 1, explanation: 'A script starts with the Green flag. If there is no flag on top, the script does not run when you press Start. Lots of blocks is not a problem.', skills: ['jr-start-block', 'jr-debug'] },
          ],
        },
      ],
    },

    // ---------------- Week 2: The same thing again and again ----------------
    {
      guideMd: `### Week goals
By the end of this week, the child:
1. Uses the Repeat block instead of writing the same thing many times.
2. Tells apart the blocks inside Repeat, which repeat, from the blocks outside, which do not.
3. Says how the result changes when the repeat number changes.
4. Knows that the Forever block never ends and stops with the Stop button.
5. Puts motion, looks and sound blocks together in a dance.

### This week's plan
${plan}

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Repeating | ~20 min | Make the long script short with Repeat, change the number and try it, do the mini test. |
| 2 | Dancing character | ~30 min | Pick dance steps, try Repeat and Forever, find the Stop button, do the mini test. |

### Prerequisite check
- Does the child remember the order and Green flag ideas from week 1?
- Can they drag a block and drop it inside another block?
- Can they tap a number and type a new number?

### Concept map
- **Repeat:** a C-shaped block, does what is inside it as many times as the number
- **Number:** how many times to repeat
- **Forever:** never ends, stops with Stop
- **Dance step:** motion, looks and sound blocks

### Common mistakes
- **Leaving blocks outside the C.** Only the blocks inside repeat.
- **Forgetting to delete the extra blocks.** The short way does not help; there is still a long script.
- **Mixing up the repeat number.** If you type 2 instead of 4, the cat does it half as many times.
- **Trying to add blocks after Forever.** You cannot, because it never ends.
- **Not finding the Stop button.** In an endless dance, press the red Stop button.

### End-of-week review
1. Look at the concept cards again and read the "Common mistake" lines out loud.
2. Build the dancing character's script again: this time pick a different dance step.
3. Set the repeat number to 2, 5 and 10, and compare how far the cat walks.
4. Ask the child: "What did the Repeat block save us?"

${review}

### Project assessment rubric
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Repeating | Copies the blocks one by one | Puts the dance steps inside Repeat | Changes the number and says the result in advance |
| Inside and outside | Blocks stay outside | Tells apart the blocks inside and outside | Explains why only the blocks inside repeat |
| Dance | Uses only one kind of block | Mixes motion with looks or sound | Links the dance to a story |
| Stopping | Cannot stop the endless dance | Finds the Stop button | Explains why no block can come after Forever |

### Note for parents and teachers
- **Goal.** This week the child should get a feel for the idea of a "loop". They do not have to memorise the word; saying "repeat it this many times" is enough.
- **How to help.** Ask: "How many blocks were there before, and how many now?" Let the child notice that it got shorter.
- **Endless dance.** The child may worry. Find the red Stop button together, so they see they can always stop it.
- **Let the child pick the dance.** Add a story to the moves: "Why is the cat dancing?"
- **Time.** The dance lesson is fun, but stop before they get tired.
- **Progress.** Mini test results appear on the "My progress" page (draft feature).
`,
      lessons: [
        // 2.1 Repeating
        {
          title: 'Repeating',
          problem: 'In a song, the same chorus is sung four times. Is there a way to make it shorter instead of writing it out each time?',
          contentMd: `## Getting ready
In the app next to this lesson, the cat's script is ready: the **Hop**, **Say** and **Forward** blocks are lined up **4 times** in a row. The script is very long!

## Activity
1. Press **🏁 Start** and watch the cat. It did the same three moves four times.
2. Let's do the same thing the short way. Drag the **Repeat** block from the **Control** category to the work area. Repeat looks like the letter "C". The blocks inside the C are repeated.
3. If you hold Hop, the blocks under it come too. **Drag** Hop, Say and Forward together **into the mouth of the C** and let go; when they snap, the C wraps around them. Snap Repeat under the Green flag.
4. Now you do not need the extra copies. Drag the leftover blocks into the **bin** to delete them.
5. Tap the number on Repeat, type **4** and press **🏁 Start**. Did the cat do the same thing?
6. Change the number and try: 2 times, 6 times… Each time the cat goes a different distance.

## For parents
The goal is the idea of a **loop** (repeating): instead of writing the same thing again and again, you say "repeat it this many times". Ask the child: "How many blocks were there before, and how many now?" The short way gives the same result with fewer blocks.`,
          question: 'What was the short way to make the same move happen 10 times?',
          explainerMd: `### What you will learn in this lesson
- Writing the same thing again and again is tiring.
- The Repeat block makes the job shorter.
- The blocks inside Repeat repeat.

### What you should know first
Week 1: commands run in order, and a script starts with the Green flag.

### The short way
The cat hops, talks and walks four times. If you write the same three blocks four times, the script gets very long.

The **Repeat** block looks like the letter C. The blocks you put inside the C repeat. They repeat as many times as the number you type. If you type 4, the three blocks run four times.

The short script does **the same job** as the long script. It just uses fewer blocks.

Careful: a block left outside the C does not repeat. It runs only once.

Changing the number is easy. If you type 6 instead of 4, the cat does it six times.

### Talk together
"How many blocks were there before, and how many now?"

### Summary
Repeat does the same job the short way. The blocks inside it repeat as many times as the number.`,
          concepts: [
            { term: 'Repeat', definition: 'A C-shaped block that repeats the blocks inside it as many times as the number.', example: 'If Hop is inside Repeat 4, the cat hops 4 times.', pitfall: 'Leaving blocks outside the C. A block outside does not repeat.' },
            { term: 'Repeat number', definition: 'The number on the Repeat block. It says how many times to repeat.', example: 'If Forward 2 inside Repeat 3 runs three times, the cat walks 6 steps.', pitfall: 'Typing the wrong number. If you type 2, the cat does it 2 times instead of 4.' },
            { term: 'Inside the C', definition: 'The mouth of the Repeat block. The blocks that should repeat go here.', example: 'Hop, Say and Forward go inside the C.', pitfall: 'Not dropping the block right in the mouth of the C. If it does not snap, it does not count as inside.' },
            { term: 'Short way', definition: 'Doing the same job with fewer blocks.', example: 'With Repeat, 4 blocks are enough instead of 12.', pitfall: 'Not deleting the extra blocks. The old copies should not stay in the short way.' },
          ],
          quiz: [
            { id: 'm1h2d1-q1', kind: 'mcq', prompt: 'What is the short way to do the same thing many times?', options: ['Copying the blocks one by one', 'The Repeat block 🔁'], answer: 1, explanation: 'With Repeat, you write the job once and it repeats as many times as the number. Copying makes the script long.', skills: ['jr-repeat'] },
            { id: 'm1h2d1-q2', kind: 'numeric', prompt: 'How many times does the cat hop?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 4', '  ⤴️ Zıpla 1'), answer: 4, unit: 'times', explanation: 'Hop (`Zıpla`) is inside Repeat (`Tekrarla`). Repeat is 4, so Hop runs 4 times: the cat hops 4 times.', skills: ['jr-repeat'] },
            { id: 'm1h2d1-q3', kind: 'predict-output', prompt: 'How many steps does the cat walk in all?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 3', '  ➡️ İleri 2'), options: ['2 steps', '6 steps', '3 steps'], answer: 1, explanation: 'Forward 2 (`İleri 2`) runs three times: 2 + 2 + 2 = 6 steps. 2 steps would be only one round.', skills: ['jr-repeat', 'jr-motion'] },
            { id: 'm1h2d1-q4', kind: 'find-bug', prompt: 'The cat should hop 4 times, but it hopped only once.\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 4', '  ➡️ İleri 1', '⤴️ Zıpla 1') + '\n\nWhat is wrong?', options: ['The Repeat number is 4', 'Hop is left outside the C'], answer: 1, explanation: 'Hop (`Zıpla`) is outside Repeat. A block outside runs only once. You need to drag Hop inside the C.', skills: ['jr-repeat', 'jr-debug'] },
          ],
        },
        // 2.2 Dancing character
        {
          title: 'Dancing character',
          problem: 'You want the character to dance by itself, but you do not want to keep tapping. What should you do?',
          contentMd: `## Getting ready
In the app next to this lesson, there is a cat and an empty script area. New categories are open in this lesson too: **Looks** (purple), **Sound** (green), **Control** (orange) and **End** (red).

## Activity
1. Drag the **🏁 Green flag** block from the **Start** category to the work area.
2. Pick dance steps from the **Motion** category: **Forward**, **Back**, **Hop**, **Turn right**… Add a few and press **🏁 Start**. The cat danced!
3. Add a **Grow** or **Shrink** block from the **Looks** category. Does the cat get bigger?
4. The **Sound** category has a **Play sound** block. Tap the number on it and type 1, 2 or 3.
5. The short way: add the **Repeat** block from the **Control** category. **Drag** the dance blocks **into the mouth of the C**. Set the repeat number by tapping it and typing.
6. For an endless dance, try the **Forever** block in the **End** category. This block never ends; to stop it, press the red **⏹ Stop** button above the stage. You cannot add blocks after Forever, because it never ends.

## For parents
Let the child pick the dance. Add a **story** to the moves: "Why is this cat dancing? Has it started raining?" An endless loop may surprise the child: find the **⏹ Stop** button together. Help them notice which blocks are inside the C and which are outside; the ones inside repeat.`,
          question: 'Why did the character dance without stopping? Which block made it do that?',
          explainerMd: `### What you will learn in this lesson
- Building a dance with motion, looks and sound blocks.
- Putting dance steps inside Repeat.
- Forever never ends; it stops with Stop.

### What you should know first
Week 2, lesson 1: the Repeat block.

### Dance time
The cat's dance steps are: **Forward**, **Back**, **Hop**, **Turn right**. **Grow** makes the cat bigger. **Play sound** makes a sound. You pick the steps. You can mix different steps to make a nice dance.

If you put the dance steps inside **Repeat**, the dance repeats a few times.

The **Forever** block is different. It never ends. The cat dances for ever. To stop it, you press the red **Stop** button above the stage. You cannot add blocks after Forever, because it never ends.

### Talk together
"Why is the cat dancing? Which block makes it dance without stopping?"

### Summary
Dance blocks go inside Repeat or Forever. The Stop button stops the endless dance.`,
          concepts: [
            { term: 'Dance step', definition: 'A motion, looks or sound block that the character does.', example: 'Hop and Grow are two dance steps.', pitfall: 'Putting the steps outside the C. A step outside does not repeat.' },
            { term: 'Forever', definition: 'A block that repeats what is inside it without ever stopping.', example: 'With Hop inside Forever, the cat hops without stopping.', pitfall: 'Thinking it will end by itself. You have to press the Stop button.' },
            { term: 'Stop button', definition: 'The red button that stops a running script.', example: 'You stop the endless dance with ⏹ Stop.', pitfall: 'Not looking for the Stop button. An endless loop does not end by itself.' },
            { term: 'Grow', definition: 'A Looks block that makes the character a bit bigger.', example: 'If you use Grow twice, the cat gets even bigger.', pitfall: 'Mixing up Grow and Shrink. Grow makes it bigger, Shrink makes it smaller.' },
            { term: 'Play sound', definition: 'A Sound block that makes a sound. The number on it picks the sound.', example: 'Play sound 2 plays the second sound.', pitfall: 'Never adding Play sound. The script makes no sound.' },
          ],
          quiz: [
            { id: 'm1h2d2-q1', kind: 'mcq', prompt: 'Which block never ends?', options: ['Repeat 4', 'Forever ♾️', 'Hop'], answer: 1, explanation: 'Forever repeats what is inside it without stopping. Repeat 4 does it four times and ends.', skills: ['jr-forever', 'jr-repeat'] },
            { id: 'm1h2d2-q2', kind: 'mcq', prompt: 'How do we stop the endless dance?', options: ['The cat stops when it gets tired', 'We press the ⏹ Stop button', 'We do nothing'], answer: 1, explanation: 'Forever does not end by itself. The red Stop button above the stage stops the script.', skills: ['jr-forever'] },
            { id: 'm1h2d2-q3', kind: 'mcq', prompt: 'Can we add a block after the Forever block?', options: ['Yes, always', 'No, it never ends'], answer: 1, explanation: 'Forever never ends. So you cannot add a block after it; that block would never run.', skills: ['jr-forever', 'jr-sequence'] },
            { id: 'm1h2d2-q4', kind: 'predict-output', prompt: 'How many times does the cat grow?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 2', '  ⤴️ Zıpla 1', '  🔼 Büyü'), options: ['1 time', '2 times', '4 times'], answer: 1, explanation: 'Grow (`Büyü`) is inside Repeat (`Tekrarla`). Repeat is 2, so Grow runs 2 times.', skills: ['jr-repeat', 'jr-looks'] },
            { id: 'm1h2d2-q5', kind: 'numeric', prompt: 'How many steps does the cat walk in all?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 5', '  ➡️ İleri 2'), answer: 10, unit: 'steps', explanation: 'Forward 2 (`İleri 2`) runs five times: 5 × 2 = 10 steps.', skills: ['jr-repeat', 'jr-motion'] },
          ],
        },
      ],
    },

    // ---------------- Week 3: What happens when? ----------------
    {
      guideMd: `### Week goals
By the end of this week, the child:
1. Says that an event (a tap) starts a script.
2. Knows that nothing happens when there is no event.
3. Makes a character react with the When tapped block.
4. Knows that each character has its own script, and that the script is written for the selected character.
5. Sets the order of what is said with the Wait block.

### This week's plan
${plan}

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Event: what happens when you tap? | ~20 min | Select a character, make the house talk and the cat hop with When tapped, do the mini test. |
| 2 | Animal that talks when tapped | ~30 min | Make the animal talk, add Wait, add the ball as a bonus, do the mini test. |

### Prerequisite check
- Does the child remember that the Green flag starts the script?
- Can they tap a character on the stage to select it?
- Can they type a short sentence in a text box?

### Concept map
- **Event:** a script that starts when something happens (a tap)
- **When tapped:** the block that starts the script when you tap the character
- **The character's script:** each character has its own script
- **Say and Wait:** speech bubble and waiting

### Common mistakes
- **The wrong character is selected.** The script belongs to another character; check which one is selected.
- **Using the Green flag instead of When tapped.** Nothing happens when you tap.
- **Not adding Wait.** The two sentences go by fast, almost on top of each other.
- **Pressing Start.** You do not need to press Start for a When tapped script; tapping the character is enough.
- **Empty text box.** If the Say block is empty, the character says nothing.

### End-of-week review
1. Read the "Common mistake" lines on the concept cards out loud.
2. Read the explanation of the wrong mini test answer together, then answer it again.
3. Build the house and animal scripts again; this time pick different words.
4. Ask the child: "What is the difference between the Green flag and When tapped?"

${review}

### Project assessment rubric
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Event | Cannot start the script | Starts the script with When tapped | Explains the difference between the Green flag and When tapped |
| Character | The script ends up on the wrong character | Selects the right character and writes the script | Gives two characters their own scripts and explains why |
| Talking | The character does not talk | Makes it say a sentence with Say | Builds a chat in the order Say, Wait, Say |
| Explaining | Does not say what they did | Explains in their own words | Finds their mistake and explains the fix |

### Note for parents and teachers
- **Goal.** This week's idea is the "event": the computer waits for something to happen. The child does not have to memorise the word.
- **How to help.** Ask: "What happens if we do not tap anything?" Let the child try it to find the answer.
- **Selecting a character.** Check together that the scripts belong to the selected character.
- **Wait.** "The speech bubble goes away too fast; how can we slow it down?" Let the child find the answer.
- **Time.** Keep it short; stop when the child gets bored.
- **Progress.** Mini test results appear on the "My progress" page (draft feature).
`,
      lessons: [
        // 3.1 Event
        {
          title: 'Event: what happens when you tap?',
          problem: 'What do you do when someone knocks on the door? And if nobody knocks?',
          contentMd: `## Getting ready
In the app next to this lesson, there is a **house** and a **cat** on the stage. When someone knocks, the house will say "Who is it?". First tap a character in the character strip to select it. The scripts in the work area belong to the selected character.

## Activity
1. Press **🏁 Start**. Nothing happened, did it? No character has a script. There is also no **event** to make something happen.
2. Select the **house** in the character strip. Drag the **👆 When tapped** block from the **Start** category to the work area. This script runs when you tap the character.
3. Snap the **Say** block from the **Looks** category under it. Tap the text box and type **Who is it?**.
4. Tap the house on the stage. The house said "Who is it?"! The event: a tap. The reaction: talking.
5. Now select the **cat**. Give it **👆 When tapped** and **Hop** from the **Motion** category. When you tap the cat, it should hop.
6. Bonus: add **Wait** from the **Control** category and one more **Say** to the house's script. A little after "Who is it?", the house should say something else.

## For parents
This is the idea of an **event**: the program waits for something to happen. If the event does not happen, nothing happens. Ask the child: "What is the difference between the Green flag and tapping?" Each character has its own scripts; characters do not send messages to each other.`,
          question: 'What happened when you did not tap anything? Does the computer wait like this too?',
          explainerMd: `### What you will learn in this lesson
- If nothing happens, the computer does nothing either.
- The When tapped block starts the script when you tap the character.
- Each character has its own script.

### What you should know first
Week 1: the script and the Green flag.

### When someone knocks
When someone knocks on the door, you say "Who is it?". If nobody knocks, you say nothing. This is called an **event**: something happens, and you answer.

A computer is the same. The **When tapped** block is an event. If you put it at the top of the script, the script runs when you tap the character. If you do not tap, nothing happens. The computer waits patiently.

Each character has **its own** script. First select the character, then add blocks to it. If you selected the house, the blocks belong to the house. If you selected the cat, they belong to the cat. Always check which character is selected.

### Talk together
"What happened when we did not tap anything?"

### Summary
When an event happens, the script runs. The When tapped block starts it when you tap the character. Each character has its own script.`,
          concepts: [
            { term: 'Event', definition: 'Something that happens. When an event happens, the script runs.', example: 'Tapping the house is an event; the house says "Who is it?".', pitfall: 'Thinking the script will run even with no event. If you do not tap, nothing happens.' },
            { term: 'When tapped', definition: 'The block that starts the script when you tap the character.', example: 'When you tap the cat, Hop runs.', pitfall: 'Using the Green flag instead of When tapped. Nothing happens when you tap.' },
            { term: 'The character\'s script', definition: 'Each character\'s own blocks. Blocks are written for the selected character.', example: 'If you select the house and add Say, the house talks.', pitfall: 'Having the wrong character selected. The block goes to another character.' },
            { term: 'Say', definition: 'The block that makes the character say something in a speech bubble.', example: 'If you type "Who is it?" in the Say block, the house says "Who is it?".', pitfall: 'Leaving the text box empty. The character says nothing.' },
          ],
          quiz: [
            { id: 'm1h3d1-q1', kind: 'mcq', prompt: 'A character has no script at all. What happens when you press Start?', options: ['The character talks by itself', 'Nothing happens'], answer: 1, explanation: 'With no script, there is no event either. The computer only looks at the script; it does nothing without an event.', skills: ['jr-events'] },
            { id: 'm1h3d1-q2', kind: 'mcq', prompt: 'The cat should hop when tapped. Which block do we put at the top?', options: ['⏹ Stop', '🏁 Green flag', '👆 When tapped'], answer: 2, explanation: 'The When tapped block starts the script when you tap the character. The Green flag only runs when you press the Start button.', skills: ['jr-events', 'jr-start-block'] },
            { id: 'm1h3d1-q3', kind: 'predict-output', prompt: 'What happens when you tap the house once?\n\n' + kod('👆 Dokununca', '💬 Söyle "Kim o?"', '⏱️ Bekle 1', '💬 Söyle "Gir!"'), options: ['First it says "Kim o?", then it waits, then it says "Gir!"', 'Nothing happens', 'It only says "Gir!"'], answer: 0, explanation: 'The blocks run in order: say, wait, say. "Kim o?" (Who is it?) comes first, and "Gir!" (Come in!) comes next.', skills: ['jr-events', 'jr-timing', 'jr-sequence'] },
            { id: 'm1h3d1-q4', kind: 'find-bug', prompt: 'The cat does not hop when you tap it.\n\n' + kod('🏁 Yeşil bayrak', '⤴️ Zıpla 1') + '\n\nWhat is wrong?', options: ['The Hop block is wrong', 'When tapped should be on top'], answer: 1, explanation: 'A script with the Green flag (`Yeşil bayrak`) runs when you press Start. For the cat to hop when tapped, When tapped must be at the top.', skills: ['jr-events', 'jr-debug'] },
          ],
        },
        // 3.2 Animal that talks when tapped
        {
          title: 'Animal that talks when tapped',
          problem: 'Make an animal talk when you tap it. Without pressing the flag, just by tapping it.',
          contentMd: `## Getting ready
In the app next to this lesson, there is an animal on the stage. This time you will use the **👆 When tapped** block from the last lesson in a longer script.

## Activity
1. Drag the **👆 When tapped** block from the **Start** category to the work area.
2. Add the **Say** block from the **Looks** category under it. Type a short sentence in the text box (for example "Hello, I am a dog!").
3. Tap the animal on the stage. Did it talk? You do not need to press **🏁 Start** for this script.
4. Add a **Wait** block from the **Control** category, then one more **Say**. The animal should say two sentences: say, wait, say. Tap the number on Wait to set the time.
5. Bonus: press the **+** button in the character strip and pick the **Ball** from the list. Select the ball in the strip, and give it **When tapped** and **Hop** from the **Motion** category. When you tap the ball, it should hop!

## For parents
The **Wait** block is a first taste of timing. Ask: "The speech bubble goes away too fast; how can we slow it down?" Let the child find the answer. Scripts belong to characters: the scripts on the right belong to whichever character is selected in the strip.`,
          question: 'When did the animal talk: when you pressed the flag, or when you tapped it? What is the difference?',
          explainerMd: `### What you will learn in this lesson
- Making an animal talk when you tap it.
- Putting space between sentences with Wait.
- Scripts are written for the selected character.

### What you should know first
Week 3, lesson 1: the When tapped block.

### The animal talks
If you want the animal to talk when you tap it, put **When tapped** at the top of the script. Add **Say** under it and type your sentence. You do not need to press Start; tapping the animal is enough.

If you want the animal to say two sentences, use **Wait**. Wait makes the next block wait a little. So it goes: words, wait, words. The animal talks as if it is chatting. The number on Wait says how long to wait.

Scripts belong to characters. To make the ball hop, first **select the ball**, then give it a script. The dog's script stays with the dog. First check which character you selected. Then add the blocks.

### Talk together
"When did the animal talk: when we pressed the flag, or when we tapped it?"

### Summary
You make the animal talk with When tapped. Wait puts space between the words. Each character's script is its own.`,
          concepts: [
            { term: 'When tapped', definition: 'The block that starts the script when you tap the character.', example: 'When you tap the dog, it says "Hello!".', pitfall: 'Pressing Start for a When tapped script. Tapping the character is enough.' },
            { term: 'Wait', definition: 'A Control block that makes the next block wait a little.', example: 'With Say, Wait 1, Say, the two sentences are said one at a time.', pitfall: 'Not adding Wait. The words come one right after the other and are hard to follow.' },
            { term: 'Selected character', definition: 'The character you are adding blocks to right now. You pick it in the character strip.', example: 'When you select the ball, the script belongs to the ball.', pitfall: 'Having the wrong character selected. The script ends up on another character.' },
            { term: 'Adding a character', definition: 'Putting a new character on the stage with the + in the character strip.', example: 'You add the Ball with + and give it Hop.', pitfall: 'Adding a character but giving it no script. The character does not move.' },
          ],
          quiz: [
            { id: 'm1h3d2-q1', kind: 'mcq', prompt: 'This is the dog\'s script.\n\n' + kod('👆 Dokununca', '💬 Söyle "Merhaba!"') + '\n\nWhen does the dog talk?', options: ['When you tap the ball', 'When you tap the dog'], answer: 1, explanation: 'The script belongs to the dog. When you tap the dog, the dog talks. Tapping the ball does not run this script.', skills: ['jr-sprite-scripts', 'jr-events'] },
            { id: 'm1h3d2-q2', kind: 'mcq', prompt: 'What does the Wait block do? ⏱️', options: ['It hides the character', 'It makes the next block wait a little', 'It plays a sound'], answer: 1, explanation: 'Wait makes the next block start a bit later. So there is a gap between the two sentences.', skills: ['jr-timing'] },
            { id: 'm1h3d2-q3', kind: 'numeric', prompt: 'When you tap the dog once, how many sentences does it say?\n\n' + kod('👆 Dokununca', '💬 Söyle "Merhaba!"', '⏱️ Bekle 1', '💬 Söyle "Oynar mısın?"'), answer: 2, unit: 'sentences', explanation: 'There are two Say (`Söyle`) blocks, and both run in order. Wait (`Bekle`) does not say a sentence.', skills: ['jr-timing', 'jr-events'] },
            { id: 'm1h3d2-q4', kind: 'find-bug', prompt: 'The ball does not hop when I tap it. I wrote the Hop script for the dog. What is wrong?', options: ['The ball is too small', 'The script is the dog\'s; I should select the ball and write it there'], answer: 1, explanation: 'Scripts are written for the selected character. For the ball to hop, you need to select the ball and give it When tapped and Hop.', skills: ['jr-sprite-scripts', 'jr-debug'] },
            { id: 'm1h3d2-q5', kind: 'mcq', prompt: 'Do you need to press Start for an animal with a When tapped block?', options: ['Yes, you always have to press it', 'No, tapping the animal is enough'], answer: 1, explanation: 'A When tapped script starts when you tap the character. The Start button is only for scripts with the Green flag.', skills: ['jr-events', 'jr-start-block'] },
          ],
        },
      ],
    },

    // ---------------- Week 4: The scenes of a story ----------------
    {
      guideMd: `### Week goals
By the end of this week, the child:
1. Says that a story has a beginning, a middle and an end.
2. Adds pages, picks a background and puts a character on each page.
3. Moves the story from one page to the next with the Go to page block.
4. Knows that the characters and scripts on each page are separate.
5. Links the story they planned with blocks.

### This week's plan
${plan}

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Beginning, middle, end | ~20 min | Split the story into three scenes, add the pages, pick the backgrounds, do the mini test. |
| 2 | Two-page story | ~30 min | Write Green flag scripts for the characters, link the scenes with Go to page, do the mini test. |

### Prerequisite check
- Can the child use the Green flag, Say and Forward blocks?
- Can they tell a short story with a beginning, a middle and an end?
- Can they find the + button in the page strip?

### Concept map
- **Story:** beginning, middle, end
- **Page:** one scene of the story
- **Background:** the picture behind a page
- **Go to page:** moves the story to another page

### Common mistakes
- **Fitting everything on one page.** If the scene changes, add a new page.
- **Not putting a character on page 2.** Each page has its own characters.
- **Not putting a start block on page 2.** The script does not start; it needs the Green flag.
- **Thinking the number in Go to page is the number of pages.** The number is the number of the page to go to.
- **Deleting a page by mistake.** The Delete page button deletes everything on that page.

### End-of-week review
1. Look at the concept cards again and read the "Common mistake" lines out loud.
2. Read the explanation of the wrong mini test answer together, then answer it again.
3. Build the story again, this time with a different character and background.
4. Ask the child: "How many scenes does your story have? Which one comes first?"

${review}

### Project assessment rubric
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Plan | The story's scenes are not clear | It has a beginning, a middle and an end | Tells each scene in their own words |
| Pages | There is only one page | At least two pages with different backgrounds | Each page has a fitting character |
| Moving on | Changing pages does not work | Moves to page 2 with Go to page | Explains why the Green flag is needed |
| Explaining | Does not say what they did | Tells the story in order | Thinks about giving the story a different ending |

### Note for parents and teachers
- **Goal.** This week the child first learns to plan, then moves on to blocks.
- **How to help.** First have them tell the story out loud: "What is in the first scene? What changed in the second?"
- **Pages.** Each page has its own characters. On page 2 you need to add them again.
- **Delete page.** It deletes everything on that page; be careful together.
- **Time.** Building a story can take a long time. If the child gets tired, leave the second scene for another day.
- **Progress.** Mini test results appear on the "My progress" page (draft feature).
`,
      lessons: [
        // 4.1 Beginning, middle, end
        {
          title: 'Beginning, middle, end',
          problem: 'In which order should you tell a story so people understand it? What happens if you put the end at the start?',
          contentMd: `## Getting ready
In the app next to this lesson, there is a **page strip** under the stage: small numbered pages, a **+** button, a **Background** list and a **Delete page** button. Each page will be one scene of your story. In this lesson you will not write blocks; you will only set up the scenes.

## Activity
1. Your story should have three parts: **1. beginning**, **2. something happens**, **3. end**. For example: the cat goes out of the house, it starts to rain, the cat goes back home.
2. Press the **+** button in the strip twice: now you have 3 pages.
3. Tap each page to select it. Pick a background that fits the scene from the **Background** list (for example Grass, Night, Room). At least two scenes should have different backgrounds.
4. Use the **+** in the character strip to add at least one character to each page.
5. Look at the pages in order: can people understand your story with its beginning, middle and end? What would your story be like if you mixed up the order?

## For parents
This lesson helps the child **plan** their story first: setting up the scenes makes it easier to link them with blocks later. Ask the child to tell the story out loud: "What is in the first scene? What changed in the second?" A child with a plan does not get lost in the next lesson.`,
          question: 'How many scenes does your story have? Which scene should come first?',
          explainerMd: `### What you will learn in this lesson
- A story has a beginning, a middle and an end.
- Each scene becomes a page.
- You add a background and characters to a page.

### What you should know first
Nothing. You only need to think of a little story.

### Plan the story first
A story has a **beginning**, a **middle** and an **end**. For example: the cat goes out of the house, it starts to rain, the cat goes back home. These three parts become three **scenes**.

In the app, each scene is a **page**. The **+** in the page strip adds a new page. You pick a **background** for each page: Grass, Night or Room. You can add characters with the **+** in the character strip.

If the scenes are in the right order, everyone understands your story. If you mix up the order, the story is hard to understand. If you put the end at the start, the cat goes back home, then goes out of the house!

### Talk together
"How many scenes does your story have? Which one comes first?"

### Summary
You plan a story with its beginning, middle and end. Each scene becomes a page.`,
          concepts: [
            { term: 'Scene', definition: 'One part of the story. In the app, it is a page.', example: 'The cat going out of the house is the first scene.', pitfall: 'Fitting everything into one scene. The story is hard to understand.' },
            { term: 'Beginning, middle, end', definition: 'The three parts of a story, told in this order.', example: 'The cat goes out, it starts to rain, the cat comes back.', pitfall: 'Mixing up the order. If you put the end at the start, the story is hard to understand.' },
            { term: 'Page', definition: 'The place where a scene is. You add it with + in the page strip.', example: 'When you press + twice, you have 3 pages.', pitfall: 'Forgetting to add a page. There is no room for the second scene.' },
            { term: 'Background', definition: 'The picture behind a page.', example: 'For a night scene, you pick the Night background.', pitfall: 'Putting the same background on every page. You cannot tell the scenes apart.' },
          ],
          quiz: [
            { id: 'm1h4d1-q1', kind: 'mcq', prompt: 'What are the three parts of a story?', options: ['Blue, red, yellow', 'Beginning, middle, end', 'Only the end'], answer: 1, explanation: 'Every story has a beginning, a middle and an end. Colours are not parts of a story.', skills: ['jr-planning'] },
            { id: 'm1h4d1-q2', kind: 'numeric', prompt: 'At first you have 1 page. If you press the + button in the page strip 2 times, how many pages do you have? ➕', answer: 3, unit: 'pages', explanation: 'Each press adds one page: 1 + 1 + 1 = 3 pages.', skills: ['jr-pages'] },
            { id: 'm1h4d1-q3', kind: 'mcq', prompt: 'Where do you change the picture behind a page?', options: ['In the bin', 'With the Stop button', 'In the Background list'], answer: 2, explanation: 'The Background list lets you pick the picture behind the page. The bin deletes blocks, and the Stop button stops the script.', skills: ['jr-pages'] },
            { id: 'm1h4d1-q4', kind: 'find-bug', prompt: 'The story goes like this:\n\n' + kod('1) Kedi eve döner', '2) Yağmur başlar', '3) Kedi evden çıkar') + '\n\n(1: the cat goes back home, 2: it starts to rain, 3: the cat goes out of the house.) Which scene is in the wrong place?', options: ['It starts to rain: it should be first', 'The cat goes out of the house: it should be last', 'The cat goes back home: it should be last'], answer: 2, explanation: 'First the cat goes out of the house, then it starts to rain, and at the very end it goes back home. "Goes back home" should be the end of the story.', skills: ['jr-planning', 'jr-debug'] },
          ],
        },
        // 4.2 Two-page story
        {
          title: 'Two-page story',
          problem: 'When the first scene ends, how do we go to the second scene?',
          contentMd: `## Getting ready
In the app next to this lesson, you will make a short story. In the page strip, the **+** button adds a new page, the **Background** list changes the picture behind the page, and **Delete page** removes that page.

## Activity
1. While you are on page 1, pick a background from the **Background** list (for example Grass).
2. Write a short script for your character that starts with the **Green flag**: go **Forward** a little, then **Say** something.
3. Press the **+** button in the page strip: a new, empty page (2) is added. Change its background (for example Night or Room).
4. On page 2, add a character with the **+** in the character strip and write a script for it that starts with the **Green flag**: use the **Say** block to make it say the words of the second scene.
5. Go back to page 1. Add the **Go to page** block from the **End** category to the end of the script, and type **2** in it: this number is the **number of the page to go to** ("go to page 2").
6. While you are on page 1, press **🏁 Start**: does the story move from the first scene to the second? Use **↺ Reset** to watch it from the start.

**Go to page** goes to the new page and starts the Green flag scripts on that page by itself.

## For parents
First let the child tell the two scenes of the story, then move it into the app. If they try to fit everything on one page, remind them: "Shall we move this to another scene?" Each page has its own characters: on page 2 you need to add the character again. The **Delete page** button deletes everything on that page; be careful together.`,
          question: 'Which block took you from the first scene to the second?',
          explainerMd: `### What you will learn in this lesson
- Splitting the story into two pages.
- Going to the second scene with the Go to page block.
- The new page needs a script too.

### What you should know first
Week 4, lesson 1: pages and backgrounds.

### From scene to scene
On the first page, the cat walks and says something. Then you want to go to the second scene. To do this, you put the **Go to page** block at the end of the script. The number on it is the **number of the page to go to**. If you type 2, it goes to the second page.

Each page has its **own** characters. You need to add a character to the second page. That character needs a script too. If the script starts with the **Green flag**, it runs by itself when the page changes.

Go to page goes at the end; you cannot add blocks after it. This way the scene changes and the story goes on.

### Talk together
"Which block took us from the first scene to the second?"

### Summary
Go to page moves the story to another page. The character on the new page needs a script with the Green flag too.`,
          concepts: [
            { term: 'Go to page', definition: 'The block that moves the story to the page whose number you type.', example: 'Go to page 2 takes you to the second page.', pitfall: 'Thinking the number on it is the number of pages. It is the number of the page to go to.' },
            { term: 'Page number', definition: 'The place of a page in the row: 1, 2, 3...', example: 'The second scene is on page 2.', pitfall: 'Going to a page that is not there. You must add the page first.' },
            { term: 'The page\'s characters', definition: 'Each page has its own characters and scripts.', example: 'On page 2, you add a house and give it Say.', pitfall: 'Forgetting to add a character to page 2. The scene stays empty.' },
            { term: 'Starting on a new page', definition: 'When the page changes, the Green flag scripts on that page run by themselves.', example: 'The house says "Welcome!", because its script starts with the Green flag.', pitfall: 'Not putting a start block on the script on the new page. The script does not run.' },
          ],
          quiz: [
            { id: 'm1h4d2-q1', kind: 'mcq', prompt: 'Which block moves the story from page 1 to page 2?', options: ['Hop', 'Wait', 'Go to page'], answer: 2, explanation: 'Go to page moves the story to the page whose number you type. Hop and Wait do not change the page.', skills: ['jr-pages'] },
            { id: 'm1h4d2-q2', kind: 'mcq', prompt: 'What does the 2 on the Go to page block mean? 📄', options: ['Wait 2 seconds', 'Go to page 2', 'Hop 2 times'], answer: 1, explanation: 'The number on Go to page is the number of the page to go to. If you type 2, the story goes to page 2.', skills: ['jr-pages'] },
            { id: 'm1h4d2-q3', kind: 'predict-output', prompt: 'Page 1:\n\n' + kod('🏁 Yeşil bayrak', '➡️ İleri 3', '💬 Söyle "Eve gidiyorum!"', '📄 Sayfaya git 2') + '\n\nThe house on page 2:\n\n' + kod('🏁 Yeşil bayrak', '💬 Söyle "Hoş geldin!"') + '\n\nWhat happens when you press Start?', options: ['Only the house talks', 'First the cat talks, then on page 2 the house says `Hoş geldin!`', 'Both pages show at the same time'], answer: 1, explanation: 'The cat walks and talks ("Eve gidiyorum!" means "I am going home!"). Then Go to page (`Sayfaya git`) moves to page 2. There the house\'s Green flag script runs, and the house says `Hoş geldin!` (Welcome!).', skills: ['jr-pages', 'jr-sequence'] },
            { id: 'm1h4d2-q4', kind: 'find-bug', prompt: 'On page 2, the house does not talk.\n\n' + kod('💬 Söyle "Hoş geldin!"') + '\n\nWhat is wrong?', options: ['The house is too big', 'There is no Green flag on top of the script'], answer: 1, explanation: 'When the page changes, only scripts with the Green flag start by themselves. A script with no start block does not run.', skills: ['jr-start-block', 'jr-pages', 'jr-debug'] },
            { id: 'm1h4d2-q5', kind: 'numeric', prompt: 'Your story has 2 pages. If you press the + button in the page strip 2 more times, how many pages do you have?', answer: 4, unit: 'pages', explanation: 'There were 2 pages, and two more pages were added: 2 + 2 = 4 pages.', skills: ['jr-pages'] },
          ],
        },
      ],
    },

    // ---------------- Week 5: Mistakes are a programmer's job ----------------
    {
      guideMd: `### Week goals
By the end of this week, the child:
1. Says that finding mistakes is a normal part of programming.
2. In a program that does not work, looks for a missing start block, a wrong direction and a wrong number.
3. Tells what they fixed after finding a mistake.
4. Builds their own story by putting repeat, talking and page blocks together.
5. Shows their project to the family and talks about it.

### This week's plan
${plan}

| Day | Lesson | Time | What you do |
|---|---|---|---|
| 1 | Bug hunt | ~25 min | Run the broken program, find and fix the mistakes, do the mini test. |
| 2 | My story (final) | ~40 min | Plan the story, build it, try it and show it to the family. Split it over two days if needed. |

### Prerequisite check
- Can the child use the Green flag, Repeat, Say and Go to page blocks?
- Are they curious about why a script does not work, and do they look?
- Can they tell their story out loud?

### Concept map
- **Bug:** the program does not work the way you expect
- **Debugging:** finding the mistake and fixing it
- **Start block:** without it, the script does not run
- **Direction and number:** a wrong turn, wrong steps or a wrong repeat number

### Common mistakes
- **Giving up after a mistake.** Mistakes are normal; look at where it stopped.
- **Forgetting to put a start block on a script.** The script looks faded and does not run.
- **Turning the wrong way.** Check Turn right and Turn left.
- **Typing a repeat number that is too small.** The cat does not reach the star.
- **Putting a flag on a block that is on its own.** A block that should be part of the script must be snapped onto the main script; if it becomes a separate script, the order breaks.
- **Forgetting the goals in the final.** There must be at least one repeat, one Say and two pages.

### End-of-week review
1. Read the "Common mistake" lines on the concept cards out loud.
2. Read the explanation of the wrong mini test answers together, then answer them again.
3. Break the bug hunt program from scratch and fix it again.
4. Ask the child: "Which mistake was the hardest? How did you find it?"

${review}

### Project assessment rubric
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Finding mistakes | Cannot find the mistake | Finds and fixes at least one mistake | Finds all three mistakes and explains each one |
| Story | The story does not work | It has a repeat, a Say and two pages | The story mixes blocks from different categories |
| Trying | Never tries it | Presses Start often to try it | Fixes a problem when they find it and tries again |
| Showing | Cannot explain it | Tells the family about their story | Explains how they made it and what they would change |

### Note for parents and teachers
- **Goal.** This week we show that making mistakes is normal. Instead of "You got it wrong", say "You caught a bug!"
- **How to help.** When they get stuck, give a hint: "Where did the cat stop? Which block ended there?"
- **Bug hunt.** Let the child find the mistakes, not you. When they find one, ask them to say out loud what they fixed.
- **Final.** Let the child make the plan. The goals are only the minimum; the child is free to add more.
- **Showing.** Ask questions: "Why does this character do that?" "How did you make this?"
- **Progress.** Mini test results appear on the "My progress" page (draft feature).
`,
      lessons: [
        // 5.1 Bug hunt
        {
          title: 'Bug hunt',
          problem: 'My program does not work! But can anyone write a program without mistakes? What do programmers do when they find a mistake?',
          contentMd: `## Getting ready
In the app next to this lesson, this time the project is **ready but broken**. There is a cat on the stage and a **star** far away. The cat needs to reach the star, but it cannot. The goal list shows what is needed.

## Activity
1. Press **🏁 Start** and look at what the cat does. Did it reach the star? Use **↺ Reset** to go back to the start.
2. Now be a detective: look at the scripts one by one. There are **at least three mistakes** hidden in the program. Look out for these:
   - Is there a script with no start block at the top? A script with no start block looks **faded** and does not run when you press **Start**. Careful: if you put a Green flag on such a script, it starts **at the same time** as the main script and walks the way it is facing; the cat goes right, not up. If you delete the script, the cat cannot reach the star either. The right fix: drag the block of this script and snap it under the **Turn left** block of the main script.
   - Does the cat turn the wrong way? Should it be **Turn right** or **Turn left**?
   - Does it not walk far enough? The **Repeat** number or the **Forward** steps may be too small. You can tap a number and type a new one.
3. After each fix, press **🏁 Start**. When the cat reaches the star, the goal gets a tick.
4. Did you break something by mistake? At the very bottom there is a **Start the project over** button.

## For parents
Do not say "You got it wrong"; say "**You caught a bug!**" Finding mistakes is a big part of a programmer's job. When the child gets stuck, give a hint: "Where did the cat stop? Which block ended there?" When they find the mistake, ask them to say out loud what they fixed.`,
          question: 'Which mistake was the hardest to find? How did you find it?',
          explainerMd: `### What you will learn in this lesson
- Making mistakes is part of a programmer's job.
- Finding and fixing a mistake is called debugging.
- What to look at in a broken program.

### What you should know first
Weeks 1, 2 and 3: order, repeating, events.

### Be a detective
Sometimes a program does not work the way you want. This is a **bug**. Programmers are not sad when they find a bug. First they **look**: where did the cat stop? Which block ended? Then they fix it and try again. This is called **debugging**.

Look at these:
- Is there a **start block** at the top of the script? If not, do not delete that script; snap its block into the right place in the main script (if you only add a flag, the script runs at the same time as the main script, facing the way it started).
- Does the cat turn **the wrong way**?
- Is the **number** too small? The number on Repeat or Forward may be too small.

After each fix, press Start and try it. Finding bugs is like a game. The more you find, the better a programmer you become.

### Talk together
"Which mistake was the hardest to find? How did you find it?"

### Summary
Mistakes are normal. Look, fix, try again. Look at three things: the start block, the direction, the number.`,
          concepts: [
            { term: 'Bug', definition: 'When the program does not work the way you want.', example: 'The cat did not reach the star; there is a bug.', pitfall: 'Thinking a bug is something to be ashamed of. Programmers find bugs all the time.' },
            { term: 'Debugging', definition: 'Finding the mistake and fixing it.', example: 'Changing the Repeat number from 2 to 3 and trying again.', pitfall: 'Deleting everything and starting again. First look at where it stopped.' },
            { term: 'Start block', definition: 'The Green flag or When tapped block at the top of the script.', example: 'The Green flag runs the script when you press Start.', pitfall: 'A script with no start block. The script looks faded and does not run.' },
            { term: 'Wrong direction', definition: 'Mixing up Turn right and Turn left.', example: 'If the star is up, you need Turn left.', pitfall: 'Always using Turn right. The robot goes the other way.' },
            { term: 'Wrong number', definition: 'The number on Forward or Repeat is too small or too big.', example: 'It should have been Repeat 3, not Repeat 2.', pitfall: 'Not looking at the number. The cat stops before the star.' },
          ],
          quiz: [
            { id: 'm1h5d1-q1', kind: 'mcq', prompt: 'My program does not work. What does a programmer do?', options: ['Turns off the computer', 'Looks at where it stopped and fixes it', 'Does nothing'], answer: 1, explanation: 'Programmers first look at where the mistake is. Then they fix it and try again. Making mistakes is normal.', skills: ['jr-debug'] },
            { id: 'm1h5d1-q2', kind: 'predict-output', prompt: 'The cat went 9 steps to the right. The star is up. Then it did this:\n\n' + kod('↩️ Sağa dön', '➡️ İleri 8') + '\n\nWhich way does the cat walk?', options: ['⬆️ Up', '⬇️ Down', '⬅️ Left'], answer: 1, explanation: 'A cat facing right looks down after Turn right (`Sağa dön`). To go up to the star, it needs Turn left.', skills: ['jr-motion', 'jr-debug'] },
            { id: 'm1h5d1-q3', kind: 'find-bug', prompt: 'The cat stops before the star. To reach the star, the cat must go 9 steps to the right.\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 2', '  ➡️ İleri 3', '↪️ Sola dön') + '\n\nWhat is wrong?', options: ['Turn left is wrong', 'Hop is missing', 'Repeat is 2; it should be 3'], answer: 2, explanation: '2 × 3 = 6 steps, not 9. With Repeat 3 (`Tekrarla 3`), it makes 3 × 3 = 9 steps. Turn left (`Sola dön`) is right for going up.', skills: ['jr-debug', 'jr-repeat'] },
            { id: 'm1h5d1-q4', kind: 'numeric', prompt: 'The cat walks 3 steps each round. With Repeat 3, how many steps does it walk in all?\n\n' + kod('🔁 Tekrarla 3', '  ➡️ İleri 3'), answer: 9, unit: 'steps', explanation: 'Three rounds, 3 steps each round: 3 × 3 = 9 steps.', skills: ['jr-repeat', 'jr-motion'] },
            { id: 'm1h5d1-q5', kind: 'mcq', prompt: 'There is no start block at the top of the script. What happens when you press Start?', options: ['It runs at once', 'It does not run'], answer: 1, explanation: 'A script with no start block looks faded and does not run when you press Start. This is a common cause of bugs.', skills: ['jr-start-block', 'jr-debug'] },
          ],
        },
        // 5.2 My story (final)
        {
          title: 'My story (final)',
          problem: 'It is time to make your own story with what you learned. Which character, which scene, what will happen?',
          contentMd: `## Getting ready
First make a plan in your head: which characters, how many scenes, who will do what? Tell your plan out loud to your parent. Then an empty project is waiting for you in the app next to this lesson.

## Activity
1. Use the **+** in the character strip to pick the characters you want from the list. Choose the pictures for your scenes from the **Background** list.
2. All the categories in the block area are open: **Start** (Green flag, When tapped), **Motion**, **Looks**, **Sound**, **Control** (Wait, Repeat) and **End** (Forever, Go to page, Stop).
3. Your story should have at least: **a Repeat or Forever**, **a Say**, **two pages**.
4. Press **🏁 Start** often to try it. If a script does not work, check that it has a start block at the top.
5. When you finish, **show it to your family**: run the project and talk about it.

## For parents
Ask questions during the show: "Why does this character do that?" "How did you make this?" When the child **explains their work**, it shows the learning will last. The goals are only the minimum; the child is free to add more. Praise the project; it does not have to be perfect.`,
          question: 'What did you like most in your story? What would you change next time?',
          explainerMd: `### What you will learn in this lesson
- Putting together what you learned in your own story.
- First plan, then try, then fix.
- Telling your family about your story.

### What you should know first
All the weeks: order, repeating, events, pages, debugging.

### Your own story
First **make a plan**: which characters, how many scenes, who will do what? Then build the blocks. You do not need lots of blocks. A small, nice story is enough.

Your story should have:
- a **Repeat** or **Forever**
- a **Say**
- **two pages**

Press Start often and try it. If a script does not work, check whether it has a start block on top.

When you finish, **show your story to your family**. Tell them what you made and how you made it. If there was a bug, tell them how you found it too.

### Talk together
"What did you like most in your story? What would you change next time?"

### Summary
Plan, build, try, fix, tell. Your story should have a repeat, talking and two pages.`,
          concepts: [
            { term: 'Plan', definition: 'Thinking first: the characters, the scenes, who will do what.', example: 'A cat, a house and two scenes: day and night.', pitfall: 'Starting without a plan and getting lost. Tell your story first.' },
            { term: 'Trying it', definition: 'Pressing Start often to have a look.', example: 'When you add a block, you press Start to see what the cat did.', pitfall: 'Trying it only at the very end. Then it is hard to find where the bug is.' },
            { term: 'Story goals', definition: 'A Repeat or Forever, a Say and two pages.', example: 'The cat hops four times, says "I am tired!" and goes to the second page.', pitfall: 'Forgetting the goals. One of them is missing from the story.' },
            { term: 'Showing your work', definition: 'Showing your story to your family and talking about it.', example: 'You run the project and say what you made.', pitfall: 'Showing it without a word. When you talk about it, what you learned stays with you.' },
          ],
          quiz: [
            { id: 'm1h5d2-q1', kind: 'mcq', prompt: 'What should you do before you make your story?', options: ['Delete it at once', 'Make a plan: characters and scenes', 'Nothing'], answer: 1, explanation: 'A plan stops you getting lost in your story. You think: which character, how many scenes, who will do what.', skills: ['jr-planning'] },
            { id: 'm1h5d2-q2', kind: 'mcq', prompt: 'What must the final story have, at least?', options: ['Only Hop', 'Repeat or Forever, Say and two pages', 'Only a background'], answer: 1, explanation: 'The goals: one repeat block, one Say and two pages. These are only the minimum; you can add more.', skills: ['jr-repeat', 'jr-looks', 'jr-pages'] },
            { id: 'm1h5d2-q3', kind: 'numeric', prompt: 'How many steps does the cat walk in all?\n\n' + kod('🏁 Yeşil bayrak', '🔁 Tekrarla 2', '  ➡️ İleri 2', '  ⤴️ Zıpla 1', '💬 Söyle "Yoruldum!"', '📄 Sayfaya git 2'), answer: 4, unit: 'steps', explanation: 'Forward 2 (`İleri 2`) runs two times: 2 + 2 = 4 steps. Hop and Say do not count as steps.', skills: ['jr-repeat', 'jr-motion'] },
            { id: 'm1h5d2-q4', kind: 'find-bug', prompt: 'My story does not work.\n\n' + kod('➡️ İleri 3', '💬 Söyle "Merhaba!"', '⤴️ Zıpla 1') + '\n\nWhat should I check first?', options: ['The background colour', 'Whether there is a start block on top'], answer: 1, explanation: 'A script with no start block does not run. You need to put the Green flag or When tapped on top.', skills: ['jr-start-block', 'jr-debug'] },
            { id: 'm1h5d2-q5', kind: 'predict-output', prompt: 'The cat\'s script:\n\n' + kod('🏁 Yeşil bayrak', '♾️ Sonsuza kadar', '  ⤴️ Zıpla 1') + '\n\nWhen does the cat stop?', options: ['After it hops once', 'When you press ⏹ Stop', 'It stops even if I do nothing'], answer: 1, explanation: 'Forever (`Sonsuza kadar`) never ends. The cat hops until someone presses the Stop button.', skills: ['jr-forever'] },
          ],
        },
      ],
    },
  ],
}
