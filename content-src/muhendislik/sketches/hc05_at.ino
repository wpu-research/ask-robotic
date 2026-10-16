// HC-05 AT komut kipi: EN (KEY) -> 3V3 iken modüle güç ver; LED yavaş yanıp söner, hız SABİT 38400 baud.
// VCC -> 5V, GND -> GND, TXD -> D10, D11 -> 1 kΩ -> RXD, RXD -> 2 kΩ -> GND.
// Seri monitörden yaz: AT, AT+NAME?, AT+NAME=Robotum, AT+PSWD?, AT+UART?, AT+UART=38400,0,0, AT+ROLE?
// HC-05 her komutun sonunda CR+LF ("\r\n") ister; seri monitör yalnız "\n" gönderdiği için köprü araya '\r' ekler.
#include <SoftwareSerial.h>

SoftwareSerial bt(10, 11);  // RX, TX

void setup() {
  Serial.begin(9600);
  bt.begin(38400);          // AT kipi: modülün veri hızından bağımsız olarak 38400
  Serial.println("AT kipi: komut yaz");
}

void loop() {
  while (bt.available()) Serial.write(bt.read());     // modülün cevabı -> seri monitör
  while (Serial.available()) {                        // seri monitör -> modül
    char c = Serial.read();
    if (c == '\n') bt.write('\r');
    bt.write(c);
  }
}
