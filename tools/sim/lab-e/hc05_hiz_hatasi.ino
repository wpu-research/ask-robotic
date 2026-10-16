// HC-05 veri kipindeyken (9600) Arduino yanlış hızda (38400) gönderiyor: telefonda bozuk karakterler görünür.
#include <SoftwareSerial.h>

SoftwareSerial bt(10, 11);

void setup() {
  bt.begin(38400);
}

void loop() {
  bt.println("merhaba");
  delay(200);
}
