// Test: XSHUT D7 ile sensörü yeniden başlatır, sürekli (arka arkaya) ölçüm kipinde okur.
#include <Wire.h>
#include <VL53L0X.h>
VL53L0X s;
void setup() {
  Serial.begin(9600);
  pinMode(7, OUTPUT);
  digitalWrite(7, LOW);
  delay(10);
  digitalWrite(7, HIGH);
  delay(10);
  Wire.begin();
  s.setTimeout(500);
  if (!s.init()) { Serial.println("init hatasi"); while (true) {} }
  s.startContinuous();
  Serial.println("surekli");
}
void loop() {
  uint16_t mm = s.readRangeContinuousMillimeters();
  if (s.timeoutOccurred()) Serial.println("zaman asimi");
  else { Serial.print("mm="); Serial.println(mm); }
}
