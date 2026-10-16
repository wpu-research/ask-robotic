// MAX17048 yakıt göstergesi (I2C 0x36), kütüphanesiz: tek hücreli LiPo'nun + ucu CELL'e, − ucu GND'ye; SDA -> A4, SCL -> A5.
// VCELL (0x02): 78,125 µV/LSB. SOC (0x04): üst bayt yüzde, alt bayt 1/256 yüzde. Yazmaçlar 16 bit, önce yüksek bayt.
#include <Wire.h>

const int ADR = 0x36;

uint16_t oku16(uint8_t reg) {
  Wire.beginTransmission(ADR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom(ADR, 2);
  uint16_t hi = Wire.read();
  return (hi << 8) | Wire.read();
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Serial.print("surum=0x");
  Serial.println(oku16(0x08), HEX);      // MAX17048: 0x0012
}

void loop() {
  float v = oku16(0x02) * 78.125e-6;     // volt
  float soc = oku16(0x04) / 256.0;       // yüzde
  Serial.print("V=");
  Serial.print(v, 3);
  Serial.print(" SOC=");
  Serial.println(soc, 1);
  delay(1000);
}
