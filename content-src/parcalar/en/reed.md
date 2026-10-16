# Reed switch
slug: reed
category: Input
summary: A switch that connects its two leads when a magnet comes close; electrically, it is a button operated by a magnet.

## Pins
- A: First lead. Connects to B while a magnet is near.
- B: Second lead.

## How it works
A reed switch consists of two thin metal reeds inside a glass tube. When a magnet comes close, the reeds touch each other and the contact **closes**; when the magnet moves away, the contact opens. In door and window alarms, one part is stuck to the frame and the magnet to the door.

On the Arduino it is read the same way as a button: one lead goes to a pin, the other lead to GND, and the pin is set to `INPUT_PULLUP`.
- Magnet far (contact open): the pin is pulled up to 5 V, and `digitalRead` reads **HIGH**.
- Magnet near (contact closed): the pin is connected to GND, and `digitalRead` reads **LOW**.

A plain reed switch does not care which pole of the magnet comes near. A limit switch is also electrically a button (in the lab the button part is used in its place).

**Advanced:** Real contacts bounce for a short time as they close; accepting a change only if it stays stable for a certain time prevents false events. In security applications, using a normally closed (NC) contact means a cut wire is also seen as a breach.

## Wiring in the lab
| From | To |
|---|---|
| Reed **A** | Uno **D4** |
| Reed **B** | Uno **GND** |

In the code you write `pinMode(4, INPUT_PULLUP);`. The **Mıknatıs yakın** (Magnet near) box in the properties panel brings the magnet closer and takes it away; it can also be changed while running. The lab reed behaves like a bare reed switch: it has no resistor of its own, so `INPUT_PULLUP` is essential.

## Typical values
- Recommended wiring | A to D4, B to GND | The Module 4 standard on this site
- Code setting | INPUT_PULLUP | No external resistor needed
- Magnet near | LOW | Contact closed, ≈ 0.1 Ω
- Magnet far | HIGH | Contact open, pulled up to 5 V by the internal pull-up ≈ 35 kΩ

## Common mistakes
- **Not writing `INPUT_PULLUP`.** When the contact is open the pin floats and the reading is random.
- **Thinking "magnet near = HIGH".** With a pull-up, the pin goes LOW when the contact closes.
- **Forgetting to connect lead B to GND.** Even if the contact closes, the pin does not go LOW.
- **Leaving out debounce.** In a real circuit, false events appear when the door rattles.
- **Mixing up NO and NC.** The circuit works the other way round.
