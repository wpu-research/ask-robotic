# Project: Virtual piano
duration: 32

## Wonder
In a band everyone has a key to play, but the magic is being able to record the song you play and listen to it again. In this project you will turn your card into a five-key piano. As you press the keys, a column will light up on the screen, the notes will be recorded, and when you touch the logo, the song you played will play again from the start.

## Activity
### Project: Virtual piano
You will put together everything you learnt this week: playing notes, tempo, lists, loops and taking input from buttons and sensors.

**Goals:**
- Five keys play five different notes: C, D, E, G, A.
- Each key lights up its own column on the screen.
- The notes that are played are added to a recording list.
- When you touch the logo, the recording plays from the start.

### The keys
The card has five inputs: the **A**, **B** and **A+B** buttons and the **P0** and **P1** pins. The pins are the three touch areas at the bottom of the card (the boxes marked **0**, **1**, **2** on the card). On the virtual card, clicking them with the mouse counts as touching them. Let's match them like this:

| Key | Note | Column to light on the screen (x) |
|---|---|---|
| A | C | 0 |
| B | D | 1 |
| A+B | E | 2 |
| P0 | G | 3 |
| P1 | A | 4 |

### New block
The **on pin [P0] [touched]** block in the **Pins** category is a new hat block that runs when a pin is touched. It is no different from the button hat blocks; only the thing that triggers it is a pin.

### Step by step
Seven hat blocks are ready in the editor: **on start**, three buttons, two pins and **when logo is [touched]**. First build only the **A** key and see that it works. Then copy it for the others.

1. In the **Variables** category, make a variable called **kayit** ("recording").
2. Put **set kayit to [0]** inside **on start**. In place of the zero, plug in an empty **make list** block from the **Lists** category.
3. Put these inside **on button [A] [pressed]**, in this order:
   - **plot x [0] y [2]**
   - **play note [C] for [1/8] beat**
   - **add [note C] to list [kayit]**. Plug the **kayit** variable in place of the list, and the **note [C]** block in place of the item to add.
   - **clear screen**
4. Select these four blocks and copy them (Ctrl+C, Ctrl+V). Move the copies to the **B**, **A+B**, **P0** and **P1** hat blocks. In each copy, change the **x** value and the note as in the table.
5. Put the **for each item [item] in list [kayit]** block inside **when logo is [touched]**. Put the **play tone [440] Hz for [1/8] beat** block inside it, and plug the loop variable in place of the frequency.
6. Press ▶ **Run**. Play a short melody by clicking the keys. Then click the logo.

### Expected result
Each key plays its own note, and its own column in the middle row of the screen lights up for a moment and goes out. When you press the logo, the notes you played are played again in the order you played them. All four goals should have a ✓.

### How does it work?
- The list stores the frequency of every note played, in order. To add to the end of the list, you use **add ... to list**.
- When you touch the logo, the loop plays every number in the list from start to end. The speed is set by the duration of the notes and the tempo.
- The body of every key follows the same pattern: light, play, record, clear. Only the note and the column change.
- Because the notes are 1/8 beat, each one lasts a quarter of a second at tempo 120. If you click fast, a new key starts before the previous note has finished.

### Try it
1. Put the **set tempo to [80] (bpm)** block inside **on start**. Did the song you played slow down?
2. In the playback, add **pause [50] ms** inside the loop. A small gap appears between the notes.
3. To find out how many notes the list holds, put the **length of list [kayit]** block inside **show number**.
4. The recording is never deleted by itself. How would you make your own key to delete the recording? (Hint: give the recording variable an empty list again.)

### Common mistakes
- **Not building the list in on start.** If **kayit** never becomes a list, the add block gives the error "This block needs a list." and the program stops.
- **Giving the same column to two keys.** You cannot tell from the screen which key you pressed.
- **Leaving the pin key with an empty hat block.** If the **on pin [P0] [touched]** block is empty, touching it does nothing.

## Discuss
If a friend used your piano, what would they most like to change? In which other project would you use the recording feature: a password, a game, a diary?
