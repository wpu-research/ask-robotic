# LED
slug: led
category: Output
summary: A polarized two-lead part that gives off light when current flows through it. It always needs a series resistor.

## Pins
- A: Anode (+). The longer leg on a real LED. The lead where current enters.
- K: Cathode (-). The shorter leg on a real LED, on the side with the flat edge on the body. Goes to the GND side.

## How it works
An **LED** (light-emitting diode) is a part that lets current through in only one direction and gives off light while doing so. Current flows **from A to K**. If you connect it backwards, no current flows and the LED does not light; this does not damage the LED, it just gives no light.

An LED does not behave like a resistor. While it is lit, a roughly **constant voltage** drops across its leads; this is called the forward voltage (Vf) and it depends on the colour. The rest of the voltage has to drop across something else in the circuit. If that "something else" is not a **series resistor**, the current is not limited, the LED draws too much current and burns out. That is why you always put a resistor next to an LED:

`I = (Vsupply − Vf) / R`

Brightness increases with current. An LED gives clearly visible light at a few mA; the safe current to draw from an Uno pin is below about 20 mA.

**Advanced:** An LED's current-voltage relationship is not linear; when the voltage rises a little, the current rises quickly. So instead of connecting an LED directly to a voltage source, you set its current with a resistor. The lab models the LED as "constant Vf + a small internal resistance"; it also takes the Uno pin's internal resistance (about 25 Ω) into account.

## Wiring in the lab
Pin names are the same as the leads of the part in the lab.

| From | To |
|---|---|
| Uno **D13** (or another digital pin) | Resistor lead **1** |
| Resistor lead **2** | LED **A** |
| LED **K** | Uno **GND** |

The resistor can be on either the anode or the cathode side of the LED; it makes no difference for current limiting. In the lessons on this site the resistor is on the pin side. You choose the colour in the properties panel (red, yellow, green, blue, white).

The Uno has a built-in L LED connected to D13. When your code drives D13, it lights up too.

## Typical values
- Red LED Vf | 1.9 V | Lab model
- Yellow LED Vf | 2.0 V | Lab model
- Green LED Vf | 2.2 V | Lab model
- Blue and white LED Vf | 3.0 V | Lab model
- Series resistor (5 V, red) | 330 Ω | About 9 mA; the standard in this site's lessons
- Comfortable brightness current | 5-15 mA | In the lab, brightness looks full at around 10 mA
- Warning limit | 25 mA | Above this, a "no series resistor or too small" warning appears
- Burn-out limit | 30 mA | Above this the LED burns out; starting over with ↺ fixes it

## Common mistakes
- **Leaving out the resistor.** The current is not limited; the lab shows a warning and the LED can burn out. In a real circuit the LED and the Uno pin can be damaged.
- **Connecting the LED backwards.** It does not light. Connect lead A to the pin/resistor side and lead K to GND.
- **Forgetting GND.** The circuit is not closed; no current flows.
- **Expecting a blue/white LED to be as bright as a red one.** Because Vf is larger, the current is smaller with the same resistor: at 330 Ω a red LED draws about 8.6 mA, a blue one about 5.6 mA (lab model).
- **Putting one resistor on the shared lead of several LEDs.** A single resistor only limits the total current; give each LED its own resistor.
