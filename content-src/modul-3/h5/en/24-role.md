# Relay: high-current switching and safety
duration: 20

## Wonder
The transistor drove small motors, but sometimes you need to switch a bigger load, or a circuit that is completely separate from the Arduino, on and off. A small box that makes a "click" does this: the relay. Let's find out together what is inside it and why it needs so much care.

## Safety warning
In the virtual lab you only build **low-voltage** circuits: the Uno's 5 V is enough, and the lab does not offer mains voltage. In real life, **mains voltage (220 V)** can kill; switching a device that is plugged into a socket with a relay is a job for a specialist who has been trained for it and has the right equipment. A relay module having "250 V" printed on it does not mean you can use it safely on your own. The logic you learn here (COM, NO, NC, active-LOW) is the same at low voltage too.

## Activity
A relay is a switch that works with an **electromagnet**. When you send current through the coil, the magnet pulls a metal arm and the contacts close. The circuit you switch with the Arduino (the contact side) is electrically separate from the coil circuit. The contact side is a circuit that carries no voltage of its own and simply behaves like a switch; this is called a **dry contact**.

A relay module comes with the transistor that drives the coil, a diode and usually an LED already fitted. The module has three input pins: VCC (5 V), GND and IN (signal). On the contact side there are three terminals:

- **COM**: the common terminal
- **NO** (normally open): open when the relay is not energised, connected to COM when it is energised
- **NC** (normally closed): connected to COM when the relay is not energised, opens when it is energised

Most modules on the market (especially the ones with an optocoupler) are **energised by LOW**: when you give the IN pin `LOW` the relay pulls in, and when you give it `HIGH` it releases. Some modules are the other way round; on a real module you check what is printed on it or find out with a quick test. On the relay part in the lab, this is the **Trigger** property: "Energized by HIGH" (default) or "Energized by LOW (active-LOW)". In this lesson we assume a module that is energised by LOW; so after adding the relay, set Trigger to **Energized by LOW**. The relay module needs more than 4 V on its VCC to work; if VCC or GND is not connected, the relay never pulls in.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| Relay module | **VCC** → 5V, **GND** → GND, **IN** → **D7**; in the properties, Trigger: Energized by LOW |
| Contact side | Relay **COM** terminal → Uno 5V |
| Small load: 330 Ω resistor + LED | Relay **NO** terminal → end **1** of the resistor; end **2** of the resistor → LED **A**; LED **K** → GND |
| Button | end **A** to **D2**, end **B** to GND |
| Potentiometer (second sketch) | **SIG** → **A0**, **VCC** → 5V, **GND** → GND |

In the lab, the voltage on the contact side also comes from the Uno's 5V pin. Although the contact side and the coil side are electrically separate, we use the same 5V line for convenience. In a real circuit, the load current must stay well below the contact current rating printed on the relay; here we only work with small loads of at most a few hundred mA (the LED draws about 9 mA).

**Virtual measurement:** press ▶ and select the resistor or the LED while the relay pulls in and releases. You see about 9 mA flowing through the LED while the relay is energised, and the current dropping to zero when it releases.

### Program
The first sketch toggles the relay each time you press the button. Because the relay module is energised by LOW, its "off" state is `HIGH`. By writing `HIGH` before making the pin an output, we stop the relay clicking for a moment at start-up.

```cpp
// sketch: role_buton
const int ROLE = 7;
const int BUTON = 2;
bool acik = false;

void setup() {
  digitalWrite(ROLE, HIGH);        // önce kapalı durumu yaz
  pinMode(ROLE, OUTPUT);
  pinMode(BUTON, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(BUTON) == LOW) {     // basıldı
    acik = !acik;                      // durumu ters çevir
    if (acik) {
      digitalWrite(ROLE, LOW);         // röle çeker
    } else {
      digitalWrite(ROLE, HIGH);        // röle bırakır
    }
    delay(50);
    while (digitalRead(BUTON) == LOW) {
      // buton bırakılana kadar bekle
    }
    delay(50);
  }
}
```

The second sketch switches the relay on and off according to a sensor value. The potentiometer on A0 imitates a temperature sensor. The switch-on threshold (600) and the switch-off threshold (500) are different. This difference is called **hysteresis**.

```cpp
// sketch: role_esik
const int ROLE = 7;
const int ACMA = 600;     // bunun üstünde röle çeker
const int KAPAMA = 500;   // bunun altında röle bırakır

bool acik = false;

void setup() {
  digitalWrite(ROLE, HIGH);
  pinMode(ROLE, OUTPUT);
}

void loop() {
  int deger = analogRead(A0);
  if (!acik && deger > ACMA) {
    acik = true;
    digitalWrite(ROLE, LOW);
  } else if (acik && deger < KAPAMA) {
    acik = false;
    digitalWrite(ROLE, HIGH);
  }
  delay(50);
}
```

### How does it work?
1. The relay coil is powered through a transistor or the module's own driver. Like a motor, the coil makes a voltage spike when the current is cut. That is why the coil needs a flyback diode; on the module this diode is already fitted.
2. `role_buton` counts a press once: even if you hold the button down, the state changes only once.
3. `role_esik` uses two separate thresholds. While the value is between 500 and 600, the relay stays in the state it is in.
4. If you used a single threshold, the relay would click all the time while the value jittered around the threshold, and the contacts would wear out. Hysteresis prevents this.
5. A relay is a mechanical part and its life is limited. Do not use it for fast switching such as PWM, switching it on and off dozens of times a second. Where you need speed control, use a transistor or a MOSFET.

### Try it
- In `role_esik`, set the thresholds to 520 and 480. What changes when the hysteresis range gets narrower? Watch the relay while you slowly change the potentiometer's Position property.
- Extend the `role_buton` program so that it prints "ACIK" (on) to the serial monitor while the relay is on and "KAPALI" (off) while it is off.
- Connect the load to the NC terminal instead of NO. In which state does the load work? Try it and take notes.
- Set the Trigger property to "Energized by HIGH" and press ▶ with `role_buton`. What happens? Why?

### Common mistakes
- Trying out a relay with mains voltage (220 V): never. This job belongs only to a trained specialist; in the lab, 5 V is enough.
- Not knowing the relay module's LOW/HIGH logic: the relay can stay energised at start-up. Writing `HIGH` before `pinMode` makes this less likely. In the lab, a wrong Trigger property causes the same confusion.
- Connecting a bare relay (without a module) directly to a pin: the coil current is too much for the pin, and without a diode the spike damages the pin.
- Mixing up the COM, NO and NC terminals: the load works with the opposite logic.
- Not connecting the relay module's VCC or GND: the relay does not pull in, and a "relay module not powered" warning appears.
- In a real circuit, letting the contact current go above the contact rating: the contacts weld together or burn.

## Discuss
The contact side of the relay is electrically separate from the Arduino. Think about which kind of safety this separation gives you and which it does not. What knowledge and equipment does a person need before working with mains voltage?
