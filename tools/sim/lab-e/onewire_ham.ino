// Test: kütüphanesiz DS18B20 (yalnız OneWire): READ ROM + CRC, CONVERT T (meşgul okuma), READ SCRATCHPAD + CRC.
#include <OneWire.h>
OneWire ow(2);
void setup() {
  Serial.begin(9600);
  if (!ow.reset()) { Serial.println("varlik yok"); return; }
  ow.write(0x33);
  byte rom[8];
  for (byte i = 0; i < 8; i++) rom[i] = ow.read();
  Serial.print("rom=");
  for (byte i = 0; i < 8; i++) { if (rom[i] < 16) Serial.print('0'); Serial.print(rom[i], HEX); }
  Serial.println(OneWire::crc8(rom, 7) == rom[7] ? " crc=ok" : " crc=hata");
}
void loop() {
  if (!ow.reset()) { Serial.println("varlik yok"); delay(500); return; }
  ow.skip();
  ow.write(0x44);
  unsigned long t0 = millis();
  while (ow.read_bit() == 0) {}
  unsigned long sure = millis() - t0;
  ow.reset();
  ow.skip();
  ow.write(0xBE);
  byte s[9];
  for (byte i = 0; i < 9; i++) s[i] = ow.read();
  int16_t raw = (s[1] << 8) | s[0];
  Serial.print("T=");
  Serial.print(raw / 16.0, 4);
  Serial.print(" sure=");
  Serial.print(sure);
  Serial.println(OneWire::crc8(s, 8) == s[8] ? " crc=ok" : " crc=hata");
}
