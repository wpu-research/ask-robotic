# Resistor
slug: direnc
category: Passive component
summary: A two-lead part that limits current. Its value is measured in ohms (Ω) and its leads have no direction.

## Pins
- 1: First lead. Non-polarized; 1 and 2 are interchangeable.
- 2: Second lead.

## How it works
A **resistor** opposes the current flowing through it. The voltage across its leads equals the current through it multiplied by the resistance (**Ohm's law**):

`V = I × R`   ·   `I = V / R`   ·   `R = V / I`

The larger the resistance, the **smaller** the current at the same voltage. 5 mA flows through 1 kΩ connected to 5 V, and 10 mA through 500 Ω.

A resistor has two basic jobs:
1. **Limiting current.** The resistor you put in front of an LED sets the current that flows through the LED.
2. **Dividing voltage.** If you connect two resistors in series, you get part of the voltage at the point between them. This is the basis of sensor circuits (LDR, NTC).

Units: 1 kΩ = 1000 Ω, 1 MΩ = 1,000,000 Ω.

**Colour code (real resistors):** The first two bands are digits, the third band is the multiplier. 330 Ω = orange (3), orange (3), brown (×10). 1 kΩ = brown, black, red (10 × 100).

## Wiring in the lab
The two leads of a resistor are equivalent. A typical LED connection:

| From | To |
|---|---|
| Uno **D13** | Resistor **1** |
| Resistor **2** | LED **A** |

When you select the part, you type its value in the **Direnç** (Resistance) field of the properties panel (from 1 Ω to 1,000,000 Ω). If you select the resistor while the circuit is running, the panel shows the **voltage** across its leads and the **current** through it (virtual measurement).

## Typical values
- In front of an LED (5 V, red) | 330 Ω | About 9 mA
- Dimmer LED | 1 kΩ | About 3 mA
- Pull resistor for a button (pull-up/pull-down) | 10 kΩ | This site uses the internal pull-up (INPUT_PULLUP)
- Voltage divider (with LDR/NTC) | 10 kΩ | A common choice in sensor circuits
- Potentiometer total resistance | 10 kΩ | Default value

## Common mistakes
- **Mixing up mA and A.** 20 mA = 0.02 A. Convert to amperes before using the formula.
- **Thinking "bigger resistance means bigger current".** It is the opposite: the current gets smaller.
- **Choosing a resistor value that is too small for an LED.** With 100 Ω the current rises to 25-30 mA; the LED and the pin are overstressed.
- **Reading the bands of a real resistor backwards.** Read it with the gold/silver (tolerance) band on the right.
- **Treating the calculation as ideal and expecting it to match the measurement exactly.** The lab also models the internal resistance of the Uno pin (about 25 Ω) and of the LED; the measurement comes out a little smaller than the calculation.
