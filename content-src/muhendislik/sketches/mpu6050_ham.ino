// MPU6050 ham ivme okuması (kütüphanesiz, Wire): VCC -> 5V, GND, SDA -> A4, SCL -> A5. Adres 0x68.
// ±2 g aralığında 1 g = 16384. Eğim: atan2(ay, az).
#include <Wire.h>

const int MPU = 0x68;

int16_t oku16() { return (Wire.read() << 8) | Wire.read(); }

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B);   // PWR_MGMT_1
  Wire.write(0);      // uykudan uyandır
  Wire.endTransmission();
}

void loop() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);   // ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  float ax = oku16() / 16384.0, ay = oku16() / 16384.0, az = oku16() / 16384.0;
  Serial.print("ax=");
  Serial.print(ax, 2);
  Serial.print(" ay=");
  Serial.print(ay, 2);
  Serial.print(" az=");
  Serial.print(az, 2);
  Serial.print(" egim=");
  Serial.println(atan2(ay, az) * 180.0 / PI, 1);
  delay(200);
}
