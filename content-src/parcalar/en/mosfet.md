# MOSFET
slug: mosfet
category: Power
summary: An N-channel switch controlled by gate voltage that draws almost no current and drives heavy loads.

## Pins
- G: Gate. The control lead; connects to an Uno pin.
- D: Drain. The load current enters here.
- S: Source. Connects to GND.

## How it works
A MOSFET works with **voltage**: when the voltage between the gate and the source rises above the threshold (about 2 V), current flows between the drain and the source. The gate draws almost no current, so unlike an NPN you do not need to calculate a base current.

Careful: not every MOSFET turns fully on at 5 V. With an Arduino you choose a **logic-level** one. When it conducts, its resistance is very small (about 0.05 Ω in the lab), so the motor sees almost the full 5 V and spins faster than with an NPN.

Because a motor is a coil, you still need a flyback diode.

**Advanced:** The gate behaves like a small capacitor; in a real circuit you put a series resistor of around 100 Ω on the gate, and a 10 kΩ resistor between the gate and GND keeps the gate from floating at power-up.

## Wiring in the lab
| From | To |
|---|---|
| MOSFET **S** | Uno **GND** |
| MOSFET **D** | Motor **M2** (and diode **A**) |
| MOSFET **G** | Uno **D6** through a 100 Ω resistor |
| 10 kΩ resistor | Between **G** and **GND** |

The motor's **M1** lead connects to 5V; the diode's K lead also goes to 5V.

## Typical values
- Threshold voltage | ≈ 2 V | Lab model, logic level
- On-resistance | ≈ 0.05 Ω | Lab model
- Motor speed at full throttle | ≈ 0.83 | ≈ 0.70 with an NPN
- Gate resistor | 100 Ω | The standard in this site's lessons

## Common mistakes
- **Choosing a MOSFET that is not logic-level.** It does not turn on fully at 5 V and heats up.
- **Not connecting the source to GND.** The current path is not complete.
- **Leaving out the flyback diode.** The voltage spike from the coil can damage the MOSFET.
- **Leaving the gate floating.** It can conduct randomly at power-up.
