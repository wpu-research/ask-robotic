# Servo: angle control
duration: 20

## Wonder
Robot arms, camera holders and radar scanners all share one part: the servo. You tell a servo "go to exactly 37 degrees", and it goes there and stays. So why can't an ordinary motor do this, and how does the servo learn which angle to go to from its signal wire?

## Activity
Inside a servo there is a small motor, some gears and a sensor that measures position. The servo looks at the **pulse width** that arrives on one of its three wires. The pulse repeats every 20 ms:

- Short pulse (about 544 µs): 0 degrees
- Medium pulse (about 1472 µs): 90 degrees
- Long pulse (about 2400 µs): 180 degrees

The `Servo` library makes these pulses for you. You only tell it the angle.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Servo | **GND** pin → Uno GND |
| | **VCC** pin → Uno 5V |
| | **SIG** (signal) pin → **D9** |
| Potentiometer (for the second sketch) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

In the lab, the servo is powered from the Uno's 5V pin; you do not need a separate supply for the servo. If the servo gets less than 4 V, or if VCC/GND is not connected, it does not move and its angle does not change. In a real circuit, small servos under load can strain the board's 5 V line; the lab does not model this effect.

While it runs, you can watch the angle of the servo arm on the canvas. Virtual measurement does not show anything for the servo; measurement is for two-terminal parts such as resistors, LEDs and motors.

### Program
The first sketch moves the servo to three positions. Type the code into the editor (or **Copy** the block below), then press ▶.

```cpp
// sketch: servo_uc_nokta
#include <Servo.h>

Servo servom;               // bir servo nesnesi oluştur

void setup() {
  servom.attach(9);         // servo sinyal teli D9'a bağlı
}

void loop() {
  servom.write(0);          // 0 dereceye git
  delay(1000);
  servom.write(90);         // 90 dereceye git
  delay(1000);
  servom.write(180);        // 180 dereceye git
  delay(1000);
}
```

The second sketch sets the angle with a potentiometer. `map` turns the 0-1023 range into 0-180 degrees. You can change the potentiometer's **Position** property in the right panel (even while it runs).

```cpp
// sketch: servo_pot
#include <Servo.h>

Servo servom;

void setup() {
  servom.attach(9);
}

void loop() {
  int okuma = analogRead(A0);              // 0-1023
  int aci = map(okuma, 0, 1023, 0, 180);   // 0-180 derece
  servom.write(aci);
  delay(15);                               // servonun gitmesi için kısa bekleme
}
```

The third sketch sweeps the servo from 0 to 180 and then back. This is the basis of the "scanner" movement we will use in the project.

```cpp
// sketch: servo_tarama
#include <Servo.h>

Servo servom;

void setup() {
  servom.attach(9);
}

void loop() {
  for (int aci = 0; aci <= 180; aci++) {   // ileri tara
    servom.write(aci);
    delay(15);
  }
  for (int aci = 180; aci >= 0; aci--) {   // geri tara
    servom.write(aci);
    delay(15);
  }
}
```

### How does it work?
1. `#include <Servo.h>` adds the servo library to the program. `Servo servom;` defines a servo object.
2. `attach(9)` connects the servo to D9 and starts making the 20 ms pulses.
3. With `write(aci)` you give the angle between 0 and 180. The library turns this into a pulse between 544 and 2400 µs; 90 degrees is about 1472 µs.
4. The servo does not teleport; turning takes time. That is why we wait `delay(15)` after each step. For a slow sweep, make the wait longer; for a fast sweep, make it shorter.
5. The Servo library switches off the `analogWrite` (PWM) feature on D9 and D10. In a program that uses a servo, do not expect PWM output from these two pins.

### Try it
- In `servo_tarama`, change `delay(15)` to 5 and then to 40. How does the sweep speed change?
- Make the sweep go only between 30 and 150 degrees.
- In the `servo_pot` sketch, move the potentiometer to the middle. Does the servo go to 90 degrees? If not, check the potentiometer's SIG, VCC and GND wires.

### Common mistakes
- Trying to power the servo from D9: the pin only gives the signal. Power comes from the 5V and GND pins. In the lab, if the VCC or GND wire is missing, the servo does not move at all.
- Mixing up the SIG and VCC wires: if the signal goes to the 5V line, the servo cannot get commands.
- Forgetting to write `attach`: the servo does not move at all.
- Forcing the servo past its mechanical limit: in a real servo the gears whine and can be damaged. So do not go outside 0-180 with `write`, and narrow the sweep range if you need to.

## Discuss
Why does a servo always turn between 0 and 180 degrees instead of spinning continuously like a DC motor? In which projects is a "continuously spinning" motor the better choice, and in which is a servo that "goes to the angle you want" better?
