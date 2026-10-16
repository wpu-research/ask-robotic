# Melodies and lists
duration: 22

## Wonder
Writing every note of a song as a separate block takes a very long time. The card has ready-made melodies inside it: one block plays a whole song. But what if you want to write your own melody? Then you can put the notes into a **list** and have them all played in turn. This lesson teaches you both.

## Activity
### Ready-made melodies
The **play melody [Ode to joy]** block in the **Music** category plays a melody from start to finish and waits until it ends. There are nine melodies in the list: **Ode to joy**, **Twinkle star**, **Fanfare**, **Sad**, **Alarm**, **Going up**, **Going down**, **Jingle**, **Birdsong**. At tempo 120, **Twinkle star** lasts 8 seconds, **Fanfare** 2.75 seconds and **Alarm** 1.6 seconds.

### What is a list?
A list is a box that holds several values in order. Every item has a number, and **the numbers start at 0**: the first item is 0, the second item is 1, the third item is 2... In this lesson we will put the frequencies of notes into a list.

### New blocks
- The **note [C]** block in the **Music** category gives the frequency (Hz) of the note as a number. For example, **note [E]** = 330.
- The **play tone [440] Hz for [1/4] beat** block in the **Music** category plays with a number instead of a note name. You can plug a value such as **note [C]** into it.
- The **make list** block in the **Lists** category makes a list. You add more items with the gear on top of it.
- The **for each item [item] in list [list]** block in the **Loops** category takes each item in the list in turn and runs the blocks inside it for that item.
- The **set [ezgi] to [0]** block and the variable block (called **ezgi**, "melody") in the **Variables** category are for storing the list.

### Step by step
The **on start**, **on button [A] [pressed]** and **on button [B] [pressed]** blocks are ready in the editor.

1. In the **Variables** category, press the **Make a variable...** button. Name it **ezgi** (it is best not to use special letters such as `ç` or `ş`).
2. Put the **set ezgi to [0]** block inside **on start**. In place of the zero, plug in the **make list** block from the **Lists** category. Open four slots in the list.
3. Plug a **note [C]** block from the **Music** category into each of the four slots: **C**, **E**, **G**, **High C**, in that order.
4. Put the **play melody [Ode to joy]** block inside **on button [A] [pressed]**, and choose **Twinkle star** from the list.
5. Put the **for each item [item] in list [list]** block inside **on button [B] [pressed]**. Plug the **ezgi** variable in place of the list.
6. Put the **play tone [440] Hz for [1/4] beat** block inside the loop. Plug the loop variable in place of the frequency (you can take it from the Variables category).
7. Press ▶ **Run**. First press **B**, then press **A**.

### Expected result
When you press **B**, four notes play: 262, 330, 392 and 523 Hz. When you press **A**, Twinkle star plays for eight seconds. All three goals should have a ✓.

### How does it work?
- **on start** runs once and makes the list. That is why the list is not built again every time you press B.
- The loop takes one item from the list at a time, puts it into the loop variable and plays the note inside. Because there are four items, it goes round four times.
- In the code tab, the loop looks like `for (oge of ezgi)`. In the code tab, Turkish letters in variable names are written with their plain ASCII versions (`o` instead of `ö`); `oge` comes from the Turkish loop variable name `öğe` ("item").
- If you press B while a melody is playing after pressing A, the two melodies try to play together. The card has only one speaker; the new sound takes the place of the old one.

### Try it
1. Put eight notes in the list instead of four and find your own melody.
2. Put the **set tempo to [160] (bpm)** block before the loop. Did your melody speed up?
3. Try another ready-made melody: **Birdsong**. Describe what you hear.
4. Put the **length of list [ezgi]** block from the **Lists** category inside **show number**. You should see 4 on the screen.

### Common mistakes
- **Not making the list in on start.** If the list is empty, the loop never goes round and no sound comes out.
- **Writing the note name straight into the list.** We put frequency blocks such as **note [C]** into the list, because the **play tone Hz** block expects a number.
- **Starting the numbers at 1.** In lists, the first item's number is 0.

## Discuss
Why is putting the notes of a song into a list more useful than writing them one by one with blocks? Could you use the same list for both notes and colours?
