# Project: temperature-controlled automatic fan and servo scanner
duration: 35

## Wonder
The fan in a computer case speeds up when the processor gets hot and slows down when it cools. You can also build a system that switches a fan on by itself when the room warms up, and also scans the room with a servo. What you learned this week comes together in one project.

## Activity
The system's job:
- Read the temperature from the NTC thermistor (A2).
- When the temperature rises to **30 °C** or above, switch the fan on. The speed should rise as the temperature rises (slow at 30 °C, full speed at 50 °C and above).
- Do not switch the fan off until the temperature drops below **28 °C** (hysteresis).
- While the fan runs, the servo should sweep between 30 and 150 degrees; when it is cool, the servo should park at 90 degrees.
- Print the temperature to the serial monitor.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| NTC thermistor | end **1** to **A2**, end **2** to GND |
| 10 kΩ resistor | end **1** to 5V, end **2** to **A2** |
| NPN transistor | **E** → GND; **C** → the fan motor's **M2** terminal |
| 1 kΩ resistor | end **1** to **D6**, end **2** to the transistor's **B** |
| DC motor (fan) | **M1** → 5V; **M2** → transistor **C** |
| Diode | **A** → transistor **C**; **K** (striped end) → 5V (fan plus) |
| Servo | **SIG** → **D9**; **VCC** → 5V; **GND** → GND |

This circuit is the same as in lesson 13: the NTC at the bottom, the fixed resistor at the top. As it warms up, the NTC's resistance falls, and so does the voltage on A2. We covered the temperature calculation there: first we find the NTC resistance from the ADC value, then the temperature with the Beta equation.

In the lab, the fan and the servo are powered from the Uno's 5V pin; you do not need a separate supply or a common GND connection. In a real circuit, the board can reset when the fan and the servo are powered from the same weak supply; there you use a separate 5 V supply and join the GNDs.

**Warming the room:** select the NTC part and change the **Temperature** property in the right panel. This property also changes while it runs. The default is 25 °C: the fan should be off and the servo parked at 90 degrees. When you set the temperature to 45 °C, the fan should turn and the servo should start sweeping. Then lower it to 29 °C: because of hysteresis, the fan should still stay on. At 27 °C it should switch off.

**Virtual measurement:** while it runs, select the NTC, the 10 kΩ resistor and the fan motor. The voltage across the NTC falls with temperature; the motor speed also rises with the temperature you choose.

### Program
```cpp
// sketch: fan_servo_proje
#include <Servo.h>

const int NTC_PIN = A2;
const int FAN_PIN = 6;          // PWM, transistör üzerinden fan
const int SERVO_PIN = 9;

const float SABIT_R = 10000.0;  // 10 kΩ sabit direnç
const float NTC_R25 = 10000.0;  // 25 °C'de 10 kΩ
const float BETA = 3950.0;

const float ACMA_C = 30.0;      // fan bu sıcaklıkta başlar
const float KAPAMA_C = 28.0;    // fan bu sıcaklığın altında durur

Servo tarayici;
bool fanAcik = false;
int aci = 90;
int yon = 2;                    // her adımda 2 derece
int sayac = 0;

float sicaklikOku() {
  int adc = analogRead(NTC_PIN);
  adc = constrain(adc, 1, 1022);                      // sıfıra bölmeyi önle
  float rntc = SABIT_R * adc / (1023.0 - adc);        // NTC altta (13. ders)
  float kelvin = 1.0 / (1.0 / 298.15 + log(rntc / NTC_R25) / BETA);
  return kelvin - 273.15;
}

void setup() {
  Serial.begin(9600);
  pinMode(FAN_PIN, OUTPUT);
  tarayici.attach(SERVO_PIN);
  tarayici.write(90);
}

void loop() {
  float sicak = sicaklikOku();

  // histerezisli açma/kapama
  if (!fanAcik && sicak >= ACMA_C) {
    fanAcik = true;
  } else if (fanAcik && sicak < KAPAMA_C) {
    fanAcik = false;
  }

  if (fanAcik) {
    // 30-50 °C arasını fan hızına çevir, çok düşük hızlarda motor dönmez
    int hiz = map((int)(sicak * 10), 300, 500, 90, 255);
    hiz = constrain(hiz, 90, 255);
    analogWrite(FAN_PIN, hiz);

    // servo bir adım ilerler
    aci = aci + yon;
    if (aci >= 150 || aci <= 30) {
      yon = -yon;                 // uca gelince yön değiştir
    }
    tarayici.write(aci);
  } else {
    analogWrite(FAN_PIN, 0);
    aci = 90;
    yon = 2;
    tarayici.write(90);           // park
  }

  sayac++;
  if (sayac >= 25) {              // yaklaşık yarım saniyede bir yazdır
    sayac = 0;
    Serial.print("Sicaklik: ");
    Serial.print(sicak, 1);
    Serial.print(" C  Fan: ");
    Serial.println(fanAcik ? "ACIK" : "KAPALI");
  }
  delay(20);
}
```

### How does it work?
1. The `sicaklikOku()` (read temperature) function reads A2 and works out the NTC resistance and the temperature. `constrain(adc, 1, 1022)` prevents a division error when the ADC is zero or 1023.
2. The fan decision has two thresholds: it switches on at 30 °C and off below 28 °C. At 29 °C it stays in the state it is in.
3. The speed is converted with `map` from the 30-50 °C range to the 90-255 PWM range. We do not go below 90, because real small motors do not start turning at low PWM.
4. The servo sweeps by moving only 2 degrees each time `loop` runs. This way the temperature is read again at every step, and the fan decision stays up to date even during the sweep.
5. When the fan switches off, the servo parks at 90 degrees; the `delay(20)` we use gives the servo time to move. The serial printing is thinned out by `sayac` (counter): it prints once every 25 rounds (about every half second).

### Try it
- Set the thresholds to 26 and 24 °C. Trigger the system by moving the Temperature property around 25 °C.
- Narrow the servo sweep range to 60-120 degrees.
- Add a condition that only prints "UYARI" (warning) to serial when the temperature goes above 60 °C. (The Temperature property goes up to 120 °C.)

### Common mistakes
- Using a formula that does not match the positions of the NTC and the fixed resistor: the temperature comes out backwards or makes no sense.
- Connecting the fan directly to D6: you need a transistor and a diode. The lab reports a missing diode with a "flyback" warning and a missing base resistor with a "base current" warning.
- Swapping the places of the NTC and the fixed resistor: the A2 line behaves the other way round, and the formula in the code has to change to match.
- Forgetting to connect the servo to 5V or GND: the servo does not move at all.
- Leaving out hysteresis: while the temperature is around the threshold, the fan keeps switching on and off.
- Expecting `analogWrite` from D9 and D10 while using a servo: the Servo library switches off PWM on these two pins. That is why the fan is on D6.

## Discuss
If you made the fan just "on/off" instead of making its speed proportional to the temperature, how would the system behave? If this were a real product, what would you use the servo for: showing a direction, opening a lid, turning a sensor?
