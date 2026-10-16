// BME280 (I2C): VCC -> 5V (kart üstünde 3,3 V regülatör), GND -> GND, SDA -> A4, SCL -> A5. Adres 0x76 (SDO 3,3 V'ta ise 0x77).
// BMP280'den farkı nem ölçmesidir; kimlik yazmacı (0xD0) BME280'de 0x60, BMP280'de 0x58 okunur.
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(9600);
  if (!bme.begin(0x76)) {
    Serial.println("BME280 bulunamadi");
    while (true) {}
  }
}

void loop() {
  Serial.print("T=");
  Serial.print(bme.readTemperature(), 2);        // °C
  Serial.print(" P=");
  Serial.print(bme.readPressure() / 100.0, 2);   // Pa -> hPa
  Serial.print(" H=");
  Serial.println(bme.readHumidity(), 1);         // %RH
  delay(1000);
}
