### Week goals
By the end of this week, the learner:
1. Can say that sound is a vibration, that **frequency** (Hz) sets the pitch, and what the card's notes are (C 262 Hz, A 440 Hz).
2. Can work out a note's duration from the tempo with `60000 / tempo` and build a rhythm with the **rest** block.
3. Can play ready-made melodies; can build their own melody with a **list** and play it with the **for each item** loop.
4. Can make an instrument played with the buttons, the logo and the light sensor; can turn off a continuous sound with **stop sound**.
5. Can build a five-key virtual piano that records and plays back, starting from a plan table.

### Plan for the week
The week has five lessons; each lesson takes about 18-32 minutes. The plan below is for one lesson a day. In the music lessons the sound must be on; the browser turns the sound on after the first press of ▶ Run.

| Day | Lesson | Time | What to do |
|---|---|---|---|
| 1 | The first note | ~18 min | Read the explainer, play C, D, E, show the note icon, do the mini quiz. |
| 2 | Duration, rests and tempo | ~20 min | Set the tempo to 60 and 240, work out the durations and compare them with the Speaker section. |
| 3 | Melodies and lists | ~22 min | Listen to the ready-made melodies, build a four-note list, try the for each item loop. |
| 4 | Make an instrument | ~22 min | Play notes with three buttons, make a continuous sound with the logo and light, try the map block. |
| 5 | Project: Virtual piano | ~32 min | Fill in the table, get the A key working, copy it, add recording and playback. |

### Prerequisite check
This week needs the three-week foundation of Module 10. Before you start, check these:
- Can they drag a block and drop it inside a hat block? (Week 1)
- Do they know event hat blocks such as **on button [A] pressed** and the ▶ Run button? (Week 2)
- Do they know that sensor (light) values are numbers and are changed with a slider? (Week 3)
- Can they make a variable and give it a value?
- Is the sound on? The computer's sound and the **Sound on** button in the Speaker section must both be on.

### Concept map
- **Sound:** vibration → frequency (Hz) → note (C 262, A 440) → octave (twice as much)
- **Time:** tempo (bpm) → 60000 / tempo → beat values (1/16 ... 2) → rest
- **Data:** variable → list → index (from 0) → length → for each item
- **Instrument:** input (button, logo, light) → rule → output (speaker) → map → continuous sound
- **Project:** plan table → a single key pattern → copy → recording list → playback

### Common mistakes
- **Leaving the note blocks outside the hat block.** The block looks faded and never runs.
- **Pressing a button without pressing ▶.** The program has to be run first.
- **Mixing up beats and milliseconds.** **pause [500] ms** does not listen to the tempo; notes and rests do.
- **Thinking it is stuck at tempo 60.** At tempo 20 a 1/4 beat is 3 seconds.
- **Not building the list in on start.** The add block stops with the error "This block needs a list."
- **Starting the list numbers at 1.** The first item is number 0; the last number is one less than the length.
- **Not putting in stop sound.** A continuous sound does not stop by itself.
- **Writing the ranges in the map block the wrong way round.** First the sensor's range, then the sound's range.
- **Giving the same column to two keys.** In the project the keys cannot be told apart on the screen.

### End-of-week review
1. Look at each lesson's concept cards again and read the "common mistake" lines out loud.
2. Read the explanations of the questions you got wrong in the mini quizzes, then answer the question again.
3. Set the tempo to 60, 120 and 240, work out the duration of a 1/4 beat (1000, 500, 250 ms) and compare it with the Speaker section.
4. Know that the Fanfare melody lasts 2750 ms at tempo 120; work out how long it would last at tempo 60.
5. Answer in your own words: "Why do list numbers start at 0?" and "Why does a continuous sound need stop sound?"

As an end-of-week test, the mini quizzes of the five lessons are enough; 5 questions in each lesson, 25 questions in total. Target: at least 4 correct in each lesson. Go back to the explainer of any lesson that falls short.

### Project assessment rubric (Virtual piano)
| Criterion | Developing | Secure | Advanced |
|---|---|---|---|
| Keys | One or two keys do not work or play the wrong note | All five keys play their own note | An extra key or an octave change beyond the notes in the table has been added |
| Screen | The columns are mixed up or do not light | Each key lights its own column and turns it off | The column time matches the note time, and the screen stays clean |
| Recording | The list is not built, and the program gives an error | The notes are added to the recording list in order | A key that deletes the recording, or a number that shows the recording's length, has been added |
| Playback | Nothing plays when the logo is touched | The recording plays from the start in the order it was played | The tempo or the pause between notes has been adjusted and its effect explained |
| Explanation | Cannot explain what they did | Explains the key pattern and the list step by step | Explains a mistake they made and how they found it |

### Note for parents and teachers
- **Aim.** The aim this week is not to memorise a song, but for the learner to see sound as a number (frequency) and time as a calculation (tempo). For those who love music this is an everyday table, and for those who do not it is a puzzle; both are fine.
- **How to help.** When the learner gets stuck, instead of giving the answer, ask these questions: "Which hat block is it inside?", "How many Hz does the Speaker section say?", "How many items does the list have, and what is its last number?"
- **Sound.** The sound comes from the virtual card and turns on after the first ▶ Run. For a learner who cannot hear the sound, check the computer's sound first, then the Sound on button in the Speaker section. Even without sound, the frequency, the screen and the activity goals are still visible.
- **Time.** Spacing the lessons out, rather than doing them one after another on the same day, helps the learning stick. Paper and a pencil are handy for the tempo calculations.
- **Safety.** Everything on this platform is virtual. If headphones are used, the volume should be kept low.
- **Progress.** The mini quiz results at the end of each lesson appear by skill on the "My progress" page (a draft/pilot feature; saved only if consent has been given).
