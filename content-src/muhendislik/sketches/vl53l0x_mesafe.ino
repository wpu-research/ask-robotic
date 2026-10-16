// VL53L0X lazer ToF mesafe sensörü (I2C): VCC -> 5V, GND -> GND, SDA -> A4, SCL -> A5. Adres 0x29.
// XSHUT bağlı değilse kart üstündeki pull-up sensörü açık tutar; XSHUT LOW iken sensör kapalıdır (veri yolunda görünmez).
// Menzil ~2 m; hedef yoksa 8190 okunur.
#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  sensor.setTimeout(500);          // ms; ölçüm gelmezse timeoutOccurred() true olur
  if (!sensor.init()) {
    Serial.println("VL53L0X bulunamadi");
    while (true) {}
  }
}

void loop() {
  uint16_t mm = sensor.readRangeSingleMillimeters();  // tek atış: ~33 ms sürer
  if (sensor.timeoutOccurred()) {
    Serial.println("zaman asimi");
  } else if (mm >= 8190) {
    Serial.print("menzil disi ");
    Serial.println(mm);
  } else {
    Serial.print("mm=");
    Serial.println(mm);
  }
  delay(100);
}
