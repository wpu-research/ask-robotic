# Temperature and light
duration: 25

## Wonder
A weather app tells you how many degrees it is outside. Your phone's screen brightness also changes by itself depending on the light in the room. All of this happens thanks to small feelers called **sensors**. The card has a temperature sensor and a light sensor too. With them, you will make a small weather station.

## Activity
### Virtual sensors
On a real card, the sensors are physical parts. On the virtual card, though, **you** change the values. In the **Compass and sensors** section to the right of the card you will find three sliders:

- **Temperature:** from −5 to 50 degrees (°C).
- **Light:** from 0 (dark) to 255 (very bright).
- **Sound:** from 0 to 255 (we will use this in lesson 14).

The **Input** category has two matching value blocks:

- **temperature (°C):** gives the temperature at that moment.
- **light level:** gives the light at that moment.

### Bar graph
The **bar graph [3] up to [5]** block in the **LED** category shows a number with LEDs. The first number is the value you measured; the second is the largest value it could be. The LEDs fill up from the bottom to the top: if the value is half of the largest value, half the screen lights up. Because the light level is measured out of 255, you use **bar graph [light level] up to [255]**. If the light is 128, about 13 LEDs light up. If the light is 255, all 25 LEDs light up.

### Program: mini weather station
The **on button A** and **on button B** blocks are already in the editor.

1. **A button:**
   1. Put the **show number** block from the **Basic** category.
   2. Replace the number inside it with the **temperature (°C)** block from the **Input** category.
   3. Under it, put the **if ... then** block from the **Logic** category.
   4. For the condition, take a comparison block: **temperature (°C)** in the left hole, the sign **>**, and 30 in the right hole.
   5. Put **show icon** inside the if and choose **sad face**.
2. **B button:** put the **bar graph** block from the **LED** category inside it. Attach the **light level** block to the first hole and type 255 in the second hole.
3. ▶ **Run**.
4. With the temperature slider at 21, press A. Then raise the temperature to 35 and press A.
5. Pull the light slider all the way up and press B.

### Expected result
When you press A, the temperature number scrolls (such as 21). When the temperature is above 30, a sad face appears after the number. When you press B, as many LEDs light up as the light level says. When the light is pulled all the way up, the whole screen lights up. All four goals should have a ✓.

### How does it work?
- A sensor block reads the value **at the moment** it runs. If you change the temperature afterwards, the value that was read earlier does not change.
- **if temperature > 30 then** asks a question: is the temperature greater than 30? If it is, the block inside runs.
- The program waits while the number scrolls. When the number is done, the sad face is drawn. That is why you see the number first, then the face.
- A **threshold** is the boundary value where a decision changes. Here the threshold is 30 degrees: different things happen below and above 30.

### Try it
1. Lower the threshold to 25. At what temperature does the sad face appear?
2. Add an **else** branch to the A block: make it show a happy face if the temperature is less than 30.
3. Put **temperature (°C)** inside the **bar graph** block and set the largest value to 50. Set the temperature to 25. How many LEDs do you think will light up? Make your guess before you try, then try it.

### Common mistakes
- **Typing the wrong largest value for the bar.** Light goes up to 255. If you leave the largest value at 5, the whole screen lights up straight away.
- **Building the condition the wrong way round.** If you write **temperature < 30**, you see the sad face when it is cool.
- **Forgetting the slider when reading a sensor.** On the virtual card you change the values; if you do not change them, they stay fixed (the temperature is 21 and the light is 128 at the start).

## Discuss
Which is more reliable, a real thermometer or this card's temperature sensor? Do you think virtual sensors take real measurements, or do we tell them the value? Did the answer to this question surprise you?
