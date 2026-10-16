# H-bridge L293D: direction and speed
duration: 25

## Wonder
We ran a motor with a transistor, but it always turned the same way. A radio-controlled car, however, goes both forwards and backwards. Do you have to swap the motor's wires by hand to make it turn the other way?

## Activity
To make a DC motor turn the other way, you only need to swap its plus and minus terminals. To do this with code, you use a circuit with four switches; because its shape looks like the letter "H", it is called an **H-bridge**. The **L293D** chip has two H-bridges inside, and it also contains diodes against the kickback of the motor current. That is why you do not need a separate flyback diode.

The L293D pins we use in this lesson in the lab (the real chip's pin number in brackets):

| Lab pin | Job | Connection |
|---|---|---|
| **EN12** (pin 1) | Channel on/off, PWM speed | **D6** |
| **IN1** (pin 2) | Direction input 1 | **D7** |
| **IN2** (pin 7) | Direction input 2 | **D5** |
| **OUT1** (pin 3) | Motor terminal 1 | Motor **M1** |
| **OUT2** (pin 6) | Motor terminal 2 | Motor **M2** |
| **GND** (pins 4, 5, 12, 13) | Ground | Uno GND |
| **VCC2** (pin 8) | Motor power (4.5-36 V on the real chip) | Uno 5V |
| **VCC1** (pin 16) | The chip's logic power (5 V) | Uno 5V |

In the lab, the L293D's four GND pins are a single **GND** pin. The L293D gives at most 600 mA per channel; it is not suitable for bigger motors.

**Careful:** the L293D drops about 1.4 V at its output. When an output is "high", the voltage is VCC2 - 1.4 V; when it is "low", it is about 0.2 V. If the motor is powered from 5 V, it sees about 3.3 V across its terminals; that is why the same motor turns more slowly with the L293D than in the transistor circuit. In the lab you see this with virtual measurement. When the EN pin is low, or the chip's VCC1/VCC2 supply is missing, the outputs float (high impedance) and the motor stops.

Direction table:

| D7 (IN1) | D5 (IN2) | D6 (EN) | Motor |
|---|---|---|---|
| HIGH | LOW | PWM | Forwards, speed depends on PWM |
| LOW | HIGH | PWM | Backwards, speed depends on PWM |
| LOW | LOW | any | Stops |
| HIGH | HIGH | any | Stops (like a brake) |

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| L293D | As in the table above: EN12 → D6, IN1 → D7, IN2 → D5, VCC1 and VCC2 → 5V, GND → GND |
| DC motor | **M1** → L293D **OUT1**, **M2** → L293D **OUT2** |
| Button 1 | end **A** to **D2**, end **B** to GND (forwards) |
| Button 2 | end **A** to **D3**, end **B** to GND (backwards) |
| Potentiometer | **SIG** → **A0** (speed), **VCC** → 5V, **GND** → GND |

In the lab the motor supply comes from the Uno's 5V pin (VCC2 → 5V); there is no separate motor supply. In a real circuit, if the motor voltage is above 5 V, VCC2 is powered from a separate supply, and that supply's GND is joined to the Arduino GND.

### Program
The first sketch runs the motor automatically: forwards, stop, backwards, stop. Before changing direction, we stop the motor and wait a little.

```cpp
// sketch: motor_yon
const int EN = 6;     // hız (PWM)
const int IN1 = 7;
const int IN2 = 5;

void ileri(int hiz) {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(EN, hiz);
}

void geri(int hiz) {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(EN, hiz);
}

void dur() {
  analogWrite(EN, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}

void setup() {
  pinMode(EN, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  dur();
}

void loop() {
  ileri(200);
  delay(2000);
  dur();
  delay(1000);
  geri(200);
  delay(2000);
  dur();
  delay(1000);
}
```

The second sketch controls the motor with two buttons; the potentiometer sets the speed. If both buttons are pressed together, the motor stops. To press a button, hold down the button part on the canvas or turn on the **Pressed** option in the properties panel.

```cpp
// sketch: motor_buton
const int EN = 6;
const int IN1 = 7;
const int IN2 = 5;

void surus(bool yonIleri, int hiz) {
  digitalWrite(IN1, yonIleri ? HIGH : LOW);
  digitalWrite(IN2, yonIleri ? LOW : HIGH);
  analogWrite(EN, hiz);
}

void dur() {
  analogWrite(EN, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
}

void setup() {
  pinMode(EN, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  dur();
}

void loop() {
  int hiz = analogRead(A0) / 4;
  bool ileriBas = (digitalRead(2) == LOW);   // basılı = LOW
  bool geriBas = (digitalRead(3) == LOW);

  if (ileriBas && !geriBas) {
    surus(true, hiz);
  } else if (geriBas && !ileriBas) {
    surus(false, hiz);
  } else {
    dur();                                    // hiçbiri ya da ikisi birden
  }
}
```

### How does it work?
1. The direction is set by `IN1` and `IN2` being different. To reverse it, you only need to swap the two.
2. The speed is set with the PWM given to the `EN` pin; `analogWrite(EN, 200)` means a duty cycle of about 78%.
3. The `ileri` (forwards), `geri` (backwards) and `dur` (stop) functions make the code readable. Each job has a clear name.
4. The expression `yonIleri ? HIGH : LOW` means "HIGH if yonIleri is true, otherwise LOW".
5. Reversing the direction suddenly while the motor is turning strains a real motor and its supply. First `dur()`, then the new direction.

### Try it
- Set the speed in `motor_yon` to 120. Does the motor still turn? Look at the motor's voltage and speed in the virtual measurement.
- Write a program that runs the motor for 3 seconds in each direction and waits 2 seconds in between.
- In the `motor_buton` sketch, press both buttons together and check that the motor really stops.
- Take the EN12 wire off D6, connect it to GND and press ▶. Why does the motor not turn at all?

### Common mistakes
- Forgetting to give VCC1 5 V: the chip does not work at all. The lab gives an "L293D not powered" warning.
- Not connecting VCC2 (motor power): the outputs float and the motor does not turn.
- Not connecting GND: the chip does not work.
- Not driving the EN pin or keeping it LOW: the output floats and the motor stops.
- Connecting the motor supply to VCC1: on a real chip, if the motor voltage is above 5 V, the logic side is damaged. The motor supply goes to VCC2, and the 5 V logic power goes to VCC1.
- Connecting a powerful motor to the L293D: the real chip overheats. Big motors need a stronger driver.

## Discuss
If you connected the wheels of a robot car to the two channels of the L293D, what would you make the two motors do to turn the car right? How would you write these directions as code?
