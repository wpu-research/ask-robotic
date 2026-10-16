// Servo (SG90, MG90S, MG996R, DS3218, DS3225): SIG -> D9
// Büyük servolar (MG996R ve üstü) Uno 5V pininden BESLENMEZ: harici 5-6 V kaynak, GND ortak.
#include <Servo.h>

Servo s;

void setup() {
  Serial.begin(9600);
  s.attach(9);
}

void loop() {
  for (int a = 0; a <= 180; a += 45) {
    s.write(a);
    Serial.print("aci=");
    Serial.println(a);
    delay(600);
  }
}
