# Push button
slug: buton
category: Input
summary: A switch that connects its two leads when pressed. The board reads the button's state through an input pin.

## Pins
- A: First lead. Connects to B when pressed.
- B: Second lead.

## How it works
A button is a switch with no connection between its two leads when it is not pressed, and that connects (shorts) the two leads when it is pressed. It does not produce any voltage by itself; it only opens or closes a path.

To read a button, the Arduino makes the pin an **input**, and you connect one lead of the button to that pin and the other lead to GND. The problem: while the button is not pressed, the pin is not connected to anything (a floating input) and reads randomly. The fix is to set the pin to `INPUT_PULLUP` in code: a resistor inside the board that pulls the pin up to 5 V is switched in.

The result is **inverted logic**:
- Not pressed: the pin is pulled up to 5 V, `digitalRead` reads **HIGH**.
- Pressed: the pin is connected to GND, `digitalRead` reads **LOW**.

**Advanced:** The contacts of real buttons bounce for a very short time when pressed. One press can show up several times in your code. Preventing this is called "debouncing" (Module 3, lesson 8).

## Wiring in the lab
| From | To |
|---|---|
| Button **A** | Uno **D2** |
| Button **B** | Uno **GND** |

In your code you write `pinMode(2, INPUT_PULLUP);`. To press the button, select the part and turn on the **Basılı** (Pressed) option in the properties panel, or press and hold the part; you can also change it while the circuit is running. In the lab a pressed button has a very small resistance (0.1 Ω), and when it is open there is no connection. The internal pull-up resistor is about 35 kΩ in the model.

The lab shows a warning for an unconnected (floating) input.

## Typical values
- Recommended wiring | A to D2, B to GND | The standard in this site's lessons
- Code setting | INPUT_PULLUP | No external resistor needed
- Reading when not pressed | HIGH | The pin is pulled up to 5 V by the internal pull-up
- Reading when pressed | LOW | The pin is connected to GND
- Second button | D3 | The second input pin on this site

## Common mistakes
- **Getting the button logic backwards.** With `INPUT_PULLUP`, pressed = LOW; if you expect "HIGH when pressed", your program works the wrong way round.
- **Forgetting to write `INPUT_PULLUP`.** Without an external resistor the pin floats and the reading is random.
- **Connecting the button's lead to 5 V.** When using `INPUT_PULLUP`, connect the other lead to GND.
- **Counting one press as several presses.** On real buttons, contact bounce causes this.
- **Forgetting the GND connection.** Even when the button is pressed, the pin cannot be pulled LOW.
