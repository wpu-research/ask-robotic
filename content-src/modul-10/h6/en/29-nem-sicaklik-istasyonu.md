# Humidity and temperature station
duration: 30

## Wonder
How do you know when the potted plant at home is thirsty? You push your finger into the soil. But what about when you are not at home? That is exactly what a station is for: it measures the temperature and how moist the soil is, and warns you when the soil dries out. In this lesson you will build your own small weather and plant pot station.

## Activity
### Sensors
The card has no moisture sensor of its own. We will pretend a virtual **soil moisture sensor** is connected to the **P1** pin. Open the **Pins** section in the right panel; in the **P1** row there is an **Input** slider. This slider sets the number the sensor reads: we will take **0 as very dry and 1023 as very wet**. On a real sensor, the values come out differently depending on the sensor; that is why you first need to calibrate a real sensor when you use one.

For temperature, the card has its own **temperature (°C)** sensor. You change its value with the **Temperature** slider in the **Compass and sensors** section.

### Turning 0-1023 into a percentage
The number read is between 0 and 1023; we want to see a **percentage** (0-100). The **map** block in the **Math** category does this:

**map [analog read P1 (0-1023)] from [0]-[1023] to [0]-[100]**

Examples: 0 → 0%, 512 → 50%, 1023 → 100%.

### New blocks
- The **analog read [P1] (0-1023)** block in the **Pins** category gives the pin's input value as a number.
- The **bar graph [3] up to [5]** block in the **LED** category shows a value with LEDs, compared to the largest value. The LEDs fill from the bottom up. If the value is **50** and the largest is **100**, half of the 25 LEDs (13 when rounded) light up.
- The **print to console [hello]** block in the **Basic** category writes a value to the card's console. The console appears in the **Console** section in the right panel.

### Step by step
**on start**, three button hat blocks (**A**, **B**, **A+B**) and **every [2000] ms** are ready in the editor.

1. In the **Variables** category, make the **nem** ("moisture") variable. Put **set nem to [0]** inside **on start**.
2. Put **show number** inside **on button [A] [pressed]**; plug in **temperature (°C)** from the **Input** category as the number.
3. Put **show number** inside **on button [B] [pressed]**; plug in the **map** block above as the number (the **analog read [P1] (0-1023)** value from 0-1023 to 0-100).
4. Put **bar graph [...] up to [100]** inside **on button [A+B] [pressed]**. Plug in the same **map** block (you can copy it) as the value.
5. Inside **every [2000] ms**, in this order:
   - **set nem to [...]**; plug in the **map** block as the value.
   - **print to console [nem]**
   - **if ... then**: condition **nem** **<** **30**. Inside it, **show icon [sad face]** and **play melody [Sad]**.
6. Getting ready: set the **Temperature** slider to 27, and bring the **P1 Input** slider to about 512.
7. Press ▶ **Run**. Press **A**, **B** and **A+B** in turn. Then pull the **P1** slider down to 100 and wait a few seconds.

### Expected result
**A** scrolls 27, and **B** scrolls 50. **A+B** shows a half-full bar graph (13 LEDs). In the Console section, a moisture value appears every two seconds. When you pull **P1** down to 100, the moisture becomes about 10%: the sad face and the **Sad** melody (3 seconds) start. All seven goals should have a ✓.

**Note:** When the program first runs, the **P1** slider is at 0. So the moisture is 0%, and right at the end of the first two seconds the sad face appears. This is not a mistake; the soil is taken to be dry. When you pull the slider up, it goes back to normal.

### How does it work?
- **every [2000] ms** reads the moisture every two seconds, writes it to the console and warns you if the soil is dry.
- **nem < 30** is the warning threshold. The threshold changes with the real plant; it is chosen separately for each plant.
- **A**, **B** and **A+B** are for seeing the current value whenever you want. The station keeps running in the background anyway.
- The **map** block rounds the result to the nearest whole number. That is why the value 512 becomes 50% (50.05).

### Try it
1. Make the threshold 20 instead of 30. At which **P1** value does the warning start?
2. Measure the light too: make **on button [A+B] [long pressed]** show the light level. In the dark (light below 50), imagine the plant wants to "sleep": **show icon [sleeping face]**.
3. Write not only the moisture but also the temperature to the console: add a second **print to console** block.
4. If the heat is high (above 35 °C) and the moisture is low (below 30), play a different warning. To combine the two conditions, use the **and** block in the **Logic** category.

### Common mistakes
- **Writing the ranges wrongly.** The input range must be **0-1023** and the output range **0-100**. If you write it the other way round when mapping 1023 to 100, the results come out backwards.
- **The wrong sign in the threshold comparison.** **nem < 30** means dry; if you write **>**, it warns you when it is wet.
- **Playing a melody on every round.** The Sad melody lasts 3 seconds. Set how often it warns, and the melody, with that in mind.
- **Mixing up temperature and moisture.** The temperature comes from the card's own sensor, and the moisture from the **P1** pin. Their sliders are in different sections.

## Discuss
If the threshold for a potted plant were 30, what would it be for a cactus? How would you make the program more flexible so you can change the threshold for each plant? What would you do if a real sensor gave you random numbers?
