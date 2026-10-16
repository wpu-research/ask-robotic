# What is a microcontroller?
duration: 20

## Wonder
How does a lift know which floor to go to? How does a washing machine know when to drain the water? Inside each one there is a tiny computer, and that computer is programmed for a single job. In this lesson you will learn what that tiny computer is and what you can find on an Arduino Uno board.

## Activity
### Microcontroller and computer
In a computer, the processor, the memory and the input-output parts are separate. A **microcontroller** puts all of them inside one small chip. It has no screen and no keyboard. It has legs instead. You connect parts such as LEDs, buttons, sensors and motors to these legs.

A microcontroller knows what to do thanks to its **program**. You upload the program once. Even if the power is cut and switched back on, the program stays on the chip, and it starts running as soon as the board gets power.

### Anatomy of the Arduino Uno
The Arduino Uno is a development board built around a microcontroller called the ATmega328P. You can see these parts on the **Uno drawing** in the lab: when you open the lab, the Uno is already waiting on the canvas. Find the chip, the pin headers and the small L LED next to D13 on the drawing. The main parts of the board are these.

| Part | What does it do? |
|---|---|
| ATmega328P chip | The microcontroller that runs the program |
| Digital pins (0-13) | Output HIGH/LOW (5 V / 0 V) or read from outside |
| Analogue input pins (A0-A5) | Measure a voltage between 0 and 5 V |
| 5V and GND pins | Give parts a 5 V supply and ground (0 V) |
| USB socket | On a real board, used to upload the program and power the board. In the lab, uploading and power are automatic |
| Reset button | Starts the program again from the beginning. In the lab, the ↺ button does this job |
| Built-in LED (L) connected to D13 | For experimenting without adding any parts |

Some numbers for the ATmega328P: a 16 MHz clock speed, 32 KB of program memory (flash), 2 KB of working memory (SRAM) and 1 KB of EEPROM. These are tiny compared with a phone. But they are more than enough to light an LED or control a motor.

### What does a digital pin do?
A digital pin is in one of two states:
- **HIGH:** The pin gives about 5 V.
- **LOW:** The pin gives 0 V.

A pin works either as an **output** (the board gives a voltage to the outside, for example to light an LED) or as an **input** (the board listens to the outside, for example to read a button). You make this setting in the program.

### How does a program run?
An Arduino program is called a **sketch**. Every sketch has two parts:
- `setup()`: Runs once when the board starts.
- `loop()`: Repeats over and over.

In the next lessons you will write these yourself. For now, just get to know the pattern:

```
void setup() {
  // commands that run once
}

void loop() {
  // commands that repeat over and over
}
```

### The working environment
In this module you will do everything in the platform's **circuit lab**. The code editor is on the left and the circuit canvas is on the right; the Uno is already on the canvas. You pick parts from the **Add part** menu and connect the pins by drawing wires. Then you press ▶ **Compile and run**, and the circuit comes to life. The lab powers the Uno's 5V, 3V3 and GND pins automatically. If you make a mistake, nothing breaks: stop with ■, fix it, and start again with ↺.

### Try it
- Look at the Uno drawing in the lab. Count the 14 digital pins and the 6 analogue pins.
- Find the labels 5V, GND and D13 on the drawing. Point to the L LED next to D13.
- Activity: without building a circuit, just by writing code, make the built-in L LED on D13 blink.
- Write down three devices in your home that contain a microcontroller (e.g. a microwave oven, a remote control).

### Common mistakes
- Thinking a microcontroller is a "small computer" and expecting it to do everything: it is designed for single, simple jobs.
- Mixing up the pin number with the label on the board: `A0` is an analogue pin, `0` is a digital pin.
- Forgetting GND when building the circuit: the circuit is not complete and the parts do not work.

## Discuss
Which device in your home do you think has a microcontroller inside, and how did you work that out? What would happen if we could program the same device for many jobs instead of just one?
