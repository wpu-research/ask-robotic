# Duration, rests and tempo
duration: 20

## Wonder
If you play the same song slowly and then fast, it sounds like a different song. What makes a song a lullaby or a march is not so much the notes as their durations. Inside the card there is a "metronome", a tempo setting. When you change it, the duration of every note changes at the same time.

## Activity
### Beat and tempo
In music, duration is measured in **beats**. On the card, the **tempo** says how many beats are played in one minute. It starts at 120.

The card works out the duration of a "1/4 beat" like this: 60 000 ms ÷ tempo.

| Tempo | 1/4 beat | 1/8 beat | 1/2 beat |
|---|---|---|---|
| 60 | 1000 ms | 500 ms | 2000 ms |
| 120 | 500 ms | 250 ms | 1000 ms |
| 240 | 250 ms | 125 ms | 500 ms |

As the tempo gets bigger, the notes get shorter and the music speeds up. The values **1/16, 1/8, 1/4, 1/2, 1, 2** in the note list choose how many "quarter-beat units" that note lasts. A 1/4 beat is one unit; a 1/2 beat is two units and 1 beat is four units.

### New blocks
- The **set tempo to [120] (bpm)** block in the **Music** category sets the tempo.
- The **rest for [1/4] beat** block leaves a silence in the music. It waits as long as a note, but makes no sound.
- The **tempo** block gives the current tempo as a number. To show it on the screen, you can put it inside **show number**.

### Step by step
**on button [A] [pressed]** is ready in the editor. In this activity you will play a slow and a fast "ta ta ta".

1. Put these inside **on button [A] [pressed]**, in this order:
   - **set tempo to [60] (bpm)**
   - **play note [G] for [1/4] beat**
   - **rest for [1/4] beat**
   - **set tempo to [240] (bpm)**
   - **play note [G] for [1/4] beat**
   - **rest for [1/4] beat**
   - **play note [G] for [1/4] beat**
2. Press ▶ **Run**, then press the card's **A** button.

### Expected result
The first G is slow and long: a whole second. Then the two Gs are fast and short: a quarter of a second each, with a quarter of a second of silence between them. In the Speaker section you see **playing: 392 Hz** appear and disappear. All three goals should have a ✓.

### How does it work?
- The **set tempo to ...** block runs once, but it affects the duration of every note that comes after it. It stays in force until a new tempo block comes.
- The **rest** block follows the tempo too. When the tempo is 60, a 1/4 beat rest is silent for 1 second.
- When you play the same note several times in a row, it is harder to tell the notes apart if you do not put rests between them.

### Try it
1. Set the tempo to different values between 20 and 400. The card automatically pulls values outside this range back to the limit.
2. Put the **tempo** block into a **show number** block and show on the screen which tempo you are at.
3. Check that two 1/8 beat notes fill the same time as one 1/4 beat note.

### Common mistakes
- **Mixing up beat values and milliseconds.** **pause [500] ms** gives a real time and does not listen to the tempo at all. The note and **rest** blocks, however, change with the tempo.
- **Leaving the tempo very low and thinking "the program is stuck".** At tempo 20, a quarter beat is 3 seconds.
- **Forgetting the rests.** Rhythm is made of gaps as much as of notes.

## Discuss
What would a lullaby sound like at tempo 240? And a march at tempo 40? How does the tempo change the feeling in a song?
