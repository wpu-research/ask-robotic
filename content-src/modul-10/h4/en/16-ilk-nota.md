# The first note
duration: 18

## Wonder
When you pluck a guitar string, the string vibrates and makes a sound. The faster the string vibrates, the higher the sound. The Virtual Micro Card's speaker works the same way: you give it a number of vibrations, and it plays that sound. So how many blocks does it take to make the card play C, D, E?

## Activity
### Getting ready
In the editor the blocks are on the left and the virtual card is on the right. Among the panels under the card there is also a **Speaker** section. Open it: it shows which sound is playing. To hear sound on the page, press the ▶ **Run** button once; browsers only turn sound on after you have touched the page. The **Sound on** button in the Speaker section turns the sound off and on.

### What is frequency?
The number of times a sound vibrates in one second is called its **frequency**. Its unit is **Hz** (hertz). The card plays the notes at these frequencies:

| Note | C | D | E | F | G | A | B | High C |
|---|---|---|---|---|---|---|---|---|
| Hz | 262 | 294 | 330 | 349 | 392 | 440 | 494 | 523 |

**High C** has about twice the frequency of **C** (262 × 2 = 524). The same note one step higher is called an "octave". **Low C** is 131 Hz, which is half of C.

### New blocks
- The **play note [C] for [1/4] beat** block in the **Music** category plays a note. It does not move on to the next block until the note has finished. So if you put two note blocks one under the other, the notes play in turn; they do not overlap.
- The **show icon [heart]** block in the **Basic** category puts a ready-made picture on the screen. You can choose the **note** icon from the list.

### Step by step
The **on button [A] [pressed]** block is already in the editor. There are three goals in the Goals panel.

1. Drag the **play note [C] for [1/4] beat** block from the **Music** category. Drop it inside the **on button [A] [pressed]** block.
2. Take two more of the same block and attach them underneath. In the second one choose **D** from the list, and in the third one **E**.
3. Take the **show icon [heart]** block from the **Basic** category and put it above the notes. Choose the **note** icon from the list.
4. Press the ▶ **Run** button. Then click the card's **A** button.

### Expected result
When you press A, the note icon appears on the card's screen. In the Speaker section you see **playing: 262 Hz**, **294 Hz**, **330 Hz** in turn, and (if your sound is on) you hear three notes. Each note lasts half a second, one and a half seconds in total. All three goals should have a ✓.

### How does it work?
- The blocks run from top to bottom, in order.
- The note block starts the note and waits until its time is up. That is why D only starts when C has finished.
- **[1/4] beat**: says how long the note lasts. The card's tempo starts at 120 beats per minute. At this speed, "1/4 beat" is exactly 500 milliseconds. You will look at duration in detail in the next lesson.
- If you click the **JavaScript** and **Python** tabs at the top, you see the code of the same program. For example, the first note is written as `music.playNote("Do", 1)` (the code uses the Turkish note names: `Do` is C). These tabs are only for reading; you run the program with blocks.

### Try it
1. Make the first note **Low C** and the last one **High C**. How did the sound change? Read the Hz values from the Speaker section.
2. Find your own three-note ringtone. Which order sounds more cheerful to you?
3. Put seven notes instead of three and climb a staircase from C to B.

### Common mistakes
- **Leaving the blocks outside the hat block.** If the note blocks are not inside **on button [A] [pressed]**, they do not run; they look faded in the editor.
- **Pressing A without pressing ▶.** The program has to be run first.
- **Changing a block and not running again.** If you change something while it is running, the warning "Press ▶ to use your changes" appears.
- **Not hearing the sound.** Make sure the Speaker section says **Sound on**. Your computer's sound must be on too.

## Discuss
What difference did you hear between C and High C? Do you think animal sounds (birdsong, a cat's miaow) have high or low frequencies? Why?
