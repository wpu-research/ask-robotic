# Electricity: V, I, R and Ohm's law
duration: 20

## Wonder
If you connect a real LED straight to 5 V, it can break very quickly. How does a small resistor in between save it? And can we calculate that resistor's value instead of guessing? The lab models this rule: if too much current goes to the LED, a warning appears. What's more, you can measure the current yourself.

## Activity
### Three basic quantities
| Quantity | Symbol | Unit | Water pipe comparison |
|---|---|---|---|
| Voltage | V | volt (V) | The pressure that pushes the water |
| Current | I | ampere (A) | The amount of water flowing through the pipe |
| Resistance | R | ohm (Ω) | How narrow the pipe is |

The water comparison is a simple model. Electricity is not like water, but the model helps you understand the idea: if the pressure rises, the flow rises; if the pipe gets narrower, the flow drops.

We write small currents in **milliamperes** (mA): 1 A = 1000 mA. We write large resistances in **kilohms** (kΩ): 1 kΩ = 1000 Ω.

### Ohm's law
The voltage across a resistor is equal to the current through it multiplied by the resistance:

**V = I × R**

Two more formulas come from this:
- **I = V / R** (to find the current)
- **R = V / I** (to find the resistance)

### Example calculations
1. 5 V and 1000 Ω (1 kΩ): I = 5 / 1000 = 0.005 A = **5 mA**.
2. 5 V and 500 Ω: I = 5 / 500 = 0.01 A = **10 mA**. When the resistance is halved, the current doubles.
3. 9 V and a load that needs 3 A: R = 9 / 3 = **3 Ω**.
4. 20 mA flows through a 220 Ω resistor: V = 0.02 × 220 = **4.4 V**.

### Working out the resistor for an LED
An LED is not a resistor. While it is lit, an almost constant voltage drops across it. For a red LED this value is typically about 2 V (the exact value is in the LED's datasheet). The rest of the voltage must drop across the series resistor.

If the supply is 5 V and the LED voltage is 2 V, then 5 − 2 = 3 V is left across the resistor.

This is an idealised calculation that ignores the internal resistance of the pin and of the LED:

- Current for 330 Ω: I = 3 / 330 ≈ 0.0091 A ≈ **9 mA**. The LED lights safely.
- Current for 150 Ω: I = 3 / 150 = 0.02 A = **20 mA**. It is brighter, but close to the limit.
- Current for 100 Ω: I = 3 / 100 = **30 mA**. This is too much; the LED and the pin can be damaged.

The recommended maximum current for one Arduino Uno pin is about 20 mA; 40 mA is the absolute limit that must never be exceeded. That is why we use **330 Ω** with red LEDs in this module.

### Virtual measurement: read the current and the voltage
In real circuits, a multimeter measures these values. In the lab, the equivalent is **virtual measurement**. While the circuit is running, select a part on the canvas (for example the resistor or the LED). The **voltage** across the part and the **current** through it appear in the properties panel. You must run the circuit with ▶ first; there is nothing to measure in a circuit that is not running.

You can test Ohm's law with this: connect D13 to an LED through a 330 Ω resistor, and let the code make D13 HIGH. When you select the resistor, you should see about 2.8 V and 8.6 mA. Our calculation said 3 V and 9 mA; the small difference is normal, because the lab also models the Uno pin's internal resistance (about 25 Ω) and the LED's internal resistance. These two resistances also take a share of the voltage, so not all of the 3 V drops across the series resistor. The difference grows with small resistor values: at 150 Ω you measure about 17 mA instead of 20 mA, and at 100 Ω about 24 mA instead of 30 mA. Then stop with ■, set the resistor to 1000 Ω in the properties panel, run it again and measure: the current should drop to about 3 mA (and the voltage gets closer to 3 V, because when the current is smaller, the share lost in the pin and the LED gets smaller).

### Resistor colour code
The coloured bands on real resistors give their value. In the lab you type the value in the properties panel, but knowing the code is useful for reading real resistors. For 330 Ω the order is: orange, orange, brown. The first two bands are digits (3 and 3), and the third band is the multiplier (brown = ×10), so 33 × 10 = 330 Ω.

### Try it
- How much current flows through a 220 Ω resistor connected to 5 V? (Answer: about 22.7 mA)
- If you want 10 mA to flow with the same 5 V, which resistor do you need? (Answer: 500 Ω)
- With a red LED (2 V) and a 5 V supply, what happens to the current if you use 1 kΩ instead of 330 Ω? How does the LED look? (Answer: 3 mA; it glows dimly)
- Build this circuit in the lab, change the resistor value and read the current with virtual measurement. Does the measured value match your calculation? Explain the reason for the small difference in your own words.

### Common mistakes
- Mixing up mA and A: 20 mA = 0.02 A. Convert to amperes before using the formula.
- Not putting a resistor on the LED: nothing limits the current. The lab models this and gives a warning if the LED burns out; you can start again with ↺.
- Thinking "a bigger resistance means a bigger current": it is the opposite; as the resistance grows, the current **drops**.

## Discuss
If you double the resistance, how does the LED's brightness change, and why? Is playing with the resistor a good idea for a very bright but safe LED?
