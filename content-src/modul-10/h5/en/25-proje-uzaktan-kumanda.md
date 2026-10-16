# Project: Remote control
duration: 32

## Wonder
As you tilt the remote control of a toy car, the car changes direction. The remote and the car are really two separate devices, and the only link between them is a radio message: "go left", "go right". In this project Card 1 will be the remote, and Card 2 will be the car. When you tilt the remote, the car will show an arrow in that direction and turn its steering servo.

## Activity
### Project: Remote control
You will put together all of this week's ideas: radio group, sending numbers, receiving, reading into a variable and a chain of **if** blocks inside each other. On top of that, detecting tilt with the accelerometer and a servo output are added.

**Goals:**
- When you tilt Card 1 left, right, forward and back, the commands 1, 2, 3 and 4 are sent.
- When Card 2 receives a command, it shows the matching direction arrow.
- When you tilt left, the servo turns to 45 degrees; when you tilt right, it turns to 135 degrees.
- Button A sends the "stop" command (0), and Card 2 shows the "no" icon.

### Command table
| Command number | Remote movement | Car screen | Servo (P0) |
|---|---|---|---|
| 1 | tilt left | left arrow | 45° |
| 2 | tilt right | right arrow | 135° |
| 3 | tilt forward | up arrow | 90° |
| 4 | tilt back | down arrow | 90° |
| 0 | button A | "no" icon | 90° |

### New blocks
- The **when card is [tilted left]** hat block in the **Input** category runs when the card is tilted. From the list you can choose **tilted right**, **tilted forward** and **tilted back**.
- The **show arrow [↑ north]** block in the **LED** category draws an arrow in one of eight directions. We will use **← west** (left), **→ east** (right), **↑ north** (up) and **↓ south** (down).
- The **servo [P0] to angle [90]** block in the **Pins** category turns the virtual servo connected to pin P0 to an angle between 0 and 180 degrees. You can see the servo turn in the **Pins** section next to the card.

### Step by step
**on start**, four **when card is [tilted left]** hat blocks, **on button [A] [pressed]** and **on radio received** are ready in the editor.

**The remote side**
1. Put **set radio group to [1]** inside **on start**.
2. Put **radio send number [1]** inside **when card is [tilted left]**; **2** inside **when card is [tilted right]**; **3** inside **when card is [tilted forward]**; and **4** inside **when card is [tilted back]**.
3. Put **radio send number [0]** inside **on button [A] [pressed]**.

**The car side**
4. In the **Variables** category, make the variable **komut** ("command").
5. Put **set komut to [0]** inside **on radio received**; plug **received [number]** in place of the zero.
6. Underneath, build an **if ... then ... else** chain:
   - if **komut = 1**: **show arrow [← west]** and **servo [P0] to angle [45]**.
   - else if **komut = 2**: **show arrow [→ east]** and **servo [P0] to angle [135]**.
   - else if **komut = 3**: **show arrow [↑ north]** and **servo [P0] to angle [90]**.
   - else if **komut = 4**: **show arrow [↓ south]** and **servo [P0] to angle [90]**.
   - else (that is, 0): **show icon [no]** and **servo [P0] to angle [90]**.

**Testing**
7. Press ▶ **Run**. Choose the **Card 1** tab in the right panel. In the **Motion (accelerometer)** section, press the **Tilt left**, **Tilt right**, **Tilt forward** and **Tilt back** buttons in turn. Then press Card 1's **A** button.
8. Switch to the **Card 2** tab, open the **Pins** section and look at the servo's angle.

### Expected result
Every time you tilt Card 1, the arrow for that direction appears on Card 2's screen. When you tilt left and right, Card 2's **P0** servo turns to 45° and 135°. When you press **A**, Card 2 shows the "no" icon and the servo comes to the middle (90°). All nine goals should have a ✓.

### How does it work?
- When the card tilts, the accelerometer detects a new position and the **when card is [tilted left]** hat block runs. The event only happens when the position **changes**. If you tilt in the same direction twice in a row, the command is not sent the second time; first straighten it with **Face up**.
- Because Card 2 runs the same program too, if you tilt Card 2, Card 1 behaves like a car as well. The two cards control each other.
- The command numbers are the agreement in the table. The sending and receiving sides use the same table; if you change the table, change both together.
- In the virtual portal there is no real motor or servo; the virtual servo display in the **Pins** section shows the angle.

### Try it
1. Make "stop" go in the **Face up** position too: put **radio send number [0]** inside the **when card is [face up]** hat block.
2. Make a short beep play when a command is received: add the **play note [C] for [1/8] beat** block inside **on radio received**.
3. Send the remote's tilt angle too: send the **tilt (side) degrees** block from the **Input** category with **radio send [aci] = [...]** (`aci` means "angle"), and set the servo's angle on the receiving card from it.

### Common mistakes
- **Mixing up the remote's and the car's tables.** If the sender sends 1 but the receiver thinks 1 is the right arrow, you see the wrong direction.
- **Thinking that tilting in the same direction again is a command.** No new event is produced unless the position changes.
- **Leaving a hat block empty.** If a **when card is [tilted left]** hat block is empty, that direction sends no message.
- **Trying to turn the servo beyond 180.** The servo angle is pulled into the 0-180 range.

## Discuss
Only one thing flows between the remote and the car: numbers. This is a very simple method. Where would this method fall short in a real vehicle? If a message is lost or arrives wrong, what should the vehicle do?
