// DS18B20 (1-Wire): GND -> GND, VCC -> 5V, DQ -> D2. DQ ile 5V arasına 4,7 kΩ pull-up direnci ŞART:
// hat açık-akaçtır, direnç olmadan hiç yükselmez ve sensör bulunamaz.
// requestTemperatures() dönüşümü başlatır ve bitmesini bekler (12 bit: en fazla 750 ms).
#include <OneWire.h>
#include <DallasTemperature.h>

OneWire hat(2);
DallasTemperature sensorler(&hat);

void setup() {
  Serial.begin(9600);
  sensorler.begin();               // hattı tarar (SEARCH ROM)
  Serial.print("sensor sayisi=");
  Serial.println(sensorler.getDeviceCount());
}

void loop() {
  sensorler.requestTemperatures(); // CONVERT T
  float t = sensorler.getTempCByIndex(0);
  if (t == DEVICE_DISCONNECTED_C) {
    Serial.println("sensor yok");
  } else {
    Serial.print("T=");
    Serial.println(t, 2);
  }
  delay(250);
}
