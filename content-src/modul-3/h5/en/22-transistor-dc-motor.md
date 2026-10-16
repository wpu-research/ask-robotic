# Switching with a transistor and a MOSFET, DC motor
duration: 25

## Wonder
An Arduino pin can easily light a small LED. What happens if you connect a fan motor to the same pin? The motor cannot get enough current, and you might even damage the pin. So how does a tiny pin control a motor that is much more powerful than itself?

## Activity
An Arduino pin works comfortably with up to about 20 mA; the absolute limit of an output pin is 40 mA. A small DC motor, however, can draw hundreds of mA while it runs. The solution: the pin does not drive the motor directly, it switches a **transistor** on and off. A transistor is an electronic switch that controls a large current with a small current.

- **NPN transistor** (for example 2N2222 / PN2222): if you give its base a small current, the path between collector and emitter conducts. The NPN in the lab starts to conduct when the base-emitter voltage goes above about 0.7 V, and its current gain is about 100. It is suitable for small motors.
- **Logic-level MOSFET** (for example IRLZ44N): it conducts when you give its gate a voltage above about 2 V. It works with voltage, draws almost no current and drives more powerful loads. Careful: not every MOSFET switches fully on with 5 V; choose a "logic level" one. The MOSFET in the lab is logic level.

A motor is a **coil**. When you cut the current, the coil makes a short high-voltage spike for a moment; this spike can damage the transistor. To prevent this, a **flyback diode** (for example 1N4007) is connected across the motor in the reverse direction. The striped end of the diode (the cathode) faces the motor's plus side. The lab checks this: if the motor is driven by a transistor or MOSFET but there is no flyback diode (or it is the wrong way round), you get a warning. In the same way, if you do not put a series resistor on the NPN's base, you get a "base current too high" warning; a base current above about 30 mA counts as a problem.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| NPN transistor | **E** (emitter) → GND; **C** (collector) → the motor's **M2** terminal |
| 1 kΩ resistor | end **1** to **D6**, end **2** to the transistor's **B** (base) |
| DC motor | **M1** terminal → Uno 5V; **M2** terminal → the transistor's C |
| Diode | **A** (anode) → the transistor's C; **K** (cathode, striped end) → 5V (the motor's plus side) |
| Potentiometer | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

If you want to try the MOSFET, add a MOSFET instead of the NPN: **G** (gate) → D6 (with a 100 Ω resistor in between), **S** (source) → GND, **D** (drain) → the motor's M2 terminal. Put a 10 kΩ resistor between the gate and GND; in real circuits it is there so the gate is not left floating while the Arduino starts up. The flyback diode is connected the same way (A → D, K → 5V).

In the lab you power the motor from the Uno's 5V pin; you do not need a separate supply or a common GND connection, because all GND pins are the same node in the lab. In a real circuit, however, powering a strong motor from the Arduino's 5 V pin can reset the board; there you use a separate supply and join the GNDs. Do not forget this detail, but it is not modelled in the lab.

**Virtual measurement:** press ▶ and select the motor. With the NPN at full throttle you see about 4.2 V and 0.4 A across the motor terminals (about 0.8 V less than 5 V: the transistor and the line also drop some voltage while conducting). The motor turns at a speed of about one sixth of the voltage across its terminals (full speed at 6 V): that is why the speed at full throttle is about 0.70 with the NPN and about 0.83 with the MOSFET. The MOSFET loses less because its resistance is very small while it conducts.

### Program
The first sketch sets the motor speed with a potentiometer. D6 is a PWM pin; `analogWrite` changes the average voltage going to the motor. Set the speed by changing the potentiometer's **Position** property in the right panel (even while it runs).

```cpp
// sketch: fan_pot
const int MOTOR = 6;        // transistörün bazına giden PWM pini

void setup() {
  pinMode(MOTOR, OUTPUT);
}

void loop() {
  int okuma = analogRead(A0);       // 0-1023
  int hiz = okuma / 4;              // 0-255
  analogWrite(MOTOR, hiz);
  delay(10);
}
```

The second sketch speeds the motor up slowly, holds it at full speed for a while, then slows it down slowly. A soft start instead of a sudden one protects both the supply and the gears of a real motor.

```cpp
// sketch: fan_rampa
const int MOTOR = 6;

void setup() {
  pinMode(MOTOR, OUTPUT);
}

void loop() {
  for (int hiz = 0; hiz <= 255; hiz += 5) {   // hızlan
    analogWrite(MOTOR, hiz);
    delay(40);
  }
  delay(1000);                                // tam hızda bekle
  for (int hiz = 255; hiz >= 0; hiz -= 5) {   // yavaşla
    analogWrite(MOTOR, hiz);
    delay(40);
  }
  delay(1000);
}
```

### How does it work?
1. `const int MOTOR = 6;` gives the pin number a name; `const` says this value will not change.
2. When D6 is high, base current flows, the transistor conducts and the motor current reaches GND through collector-emitter. When D6 is low, the motor stops.
3. `analogWrite(MOTOR, 128)` switches the pin on and off quickly; the duty cycle is about 50% and the motor runs at close to half power.
4. The flyback diode opens a path for the reverse voltage that appears when the motor current is cut. This way the spike dies away without harming the transistor.
5. Small motors may not turn at very low PWM values. With real motors you find the smallest value at which it starts to turn by trying. We will use this in the project.

### Try it
- With `fan_pot`, slowly increase the potentiometer position. How do the motor voltage and speed change in the virtual measurement?
- Make `delay(40)` bigger in `fan_rampa`. How does the start change?
- Write a program that runs the motor at full speed for 1 second every 3 seconds and then switches it off.
- Delete the flyback diode from the circuit and press ▶. Which warning appears? Then connect the diode the wrong way round; what does the warning message say?

### Common mistakes
- Connecting the motor directly to the pin: a real pin cannot cope and may be damaged. In the lab, too, a warning appears when the current limit of the pin is exceeded.
- Skipping the flyback diode or connecting it the wrong way round: in a real circuit the transistor fails over time. The lab gives a "flyback-missing" warning. When it is connected correctly, the diode normally carries no current.
- Leaving out the base resistor: the base current is unlimited; in a real circuit the pin and the transistor are damaged, and in the lab a "base current" warning appears.
- Using a MOSFET that is not logic level: it does not switch on enough at 5 V, it heats up and the motor stays weak.
- Not connecting the emitter (or the MOSFET's source) to GND: the current path is not complete and the motor does not turn.

## Discuss
When a small pin controls a large load, where does the power come from? If we think of the transistor as a "gate" or a "tap", why does the power needed to turn the tap not have to be the same as the power of the water flowing through it?
