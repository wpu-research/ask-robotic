# Make an instrument
duration: 22

## Wonder
A piano's keys make a sound when you press them. But can there be an instrument with no keys at all? A strange instrument called the theremin is played without touching it, just by bringing your hand closer. We will make something similar, a "light string", with the virtual card's light sensor.

## Activity
### Buttons: a three-key instrument
The card has three button combinations: **A**, **B** and **A+B**. **A+B** works when you press both at once. We will use these three buttons for three notes.

### Continuous sound
The note blocks so far played for a set time and then went quiet. The **ring tone [440] Hz** block in the **Music** category, however, starts the sound and does not let go until you use the **stop sound** block. These two blocks are used together: one turns the sound on, the other turns it off. The **playing** box in the Speaker section only shows notes with a duration; it may not show the continuous sound.

### New blocks
- The **every [1000] ms** block in the **Basic** category runs what is inside it again and again at a set interval. We will make the interval 100.
- The **light level** block in the **Input** category gives a number between 0 (dark) and 255 (very bright). You can change it with the **Light** slider in the **Compass and sensors** section next to the card.
- The **logo touched?** block in the **Input** category is true if the logo is being touched right now.
- The **map [light level] from [0]-[255] to [200]-[1000]** block in the **Math** category scales a number from one range to another. When the light is 0 you get 200; when the light is 255 you get 1000. Light levels in between give frequencies in between.
- The **when logo is [touched]** and **when logo is [released]** hat blocks.

### Step by step
Five hat blocks are ready in the editor: three buttons, the timer **every [100] ms** and **when logo is [released]**.

1. Put **play note [C] for [1/4] beat** inside **on button [A] [pressed]**, **D** inside **on button [B] [pressed]** and **E** inside **on button [A+B] [pressed]**.
2. Put the **if ... then** block from the **Logic** category inside **every [100] ms**. Plug **logo touched?** from the **Input** category into the condition.
3. Put **ring tone [440] Hz** from the **Music** category inside the **if**. Plug the **map** block in place of the frequency. Drop the **light level** block into the first input of the map block, and make the ranges 0-255 and 200-1000.
4. Put the **stop sound** block inside **when logo is [released]**.
5. Press ▶ **Run**. Play the notes with the three buttons. Then click the logo and hold it down; move the light slider.

### Expected result
The buttons play C, D, E. When you hold the logo down, the sound rings continuously. When you pull the light slider up, the sound gets higher (close to 1000 Hz); when you pull it down, it gets deeper (close to 200 Hz). When you let go of the logo, the sound stops. All four goals should have a ✓.

### How does it work?
- **every [100] ms** looks at the light every 0.1 seconds and updates the sound. As you change the light, the sound follows.
- If the logo is not being touched, the blocks inside **if** are skipped, and the sound never starts.
- **stop sound** runs when you let go of the logo. If you do not put this block in, the continuous sound does not stop by itself.
- The **map** block rounds the result to the nearest whole number.

### Try it
1. Make the range 100-2000. Do you want to hear a very high sound?
2. The **set volume to [128] (0-255)** block sets how loud the sound is. Try 40 first, then 255.
3. Put the **sound level** block in place of the light and try playing the string with sound. Move the card's **Sound** slider.

### Common mistakes
- Not putting in **stop sound**.
- Writing the ranges in the **map** block the wrong way round. The first range must be the sensor's range (0-255), the second the sound's range (200-1000).
- Forgetting the **if** block and turning the sound on every 100 ms. The sound plays even if you never touch the logo.

## Discuss
A theremin is played by bringing your hand closer; your card is played with light. Which other sensors could you turn into an instrument? What kind of sound would the sound level, the temperature or the tilt make?
