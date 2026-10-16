// ESC + fırçasız motor: D9 -> ESC sinyal (beyaz/sarı), ESC GND -> Uno GND (ortak toprak şart)
// GÜVENLİK: Gerçek motorda pervaneyi TAKMADAN dene. ESC önce düşük gazla "kurulur" (arm).
#include <Servo.h>

Servo esc;

void setup() {
  Serial.begin(9600);
  esc.attach(9, 1000, 2000);
  esc.writeMicroseconds(1000);   // düşük gaz: kurulum
  Serial.println("kuruluyor");
  delay(2000);
  Serial.println("hazir");
}

void loop() {
  for (int us = 1000; us <= 1400; us += 20) { esc.writeMicroseconds(us); delay(50); }
  Serial.println("gaz 1400");
  delay(1500);
  for (int us = 1400; us >= 1000; us -= 20) { esc.writeMicroseconds(us); delay(50); }
  Serial.println("gaz 1000");
  delay(1500);
}
