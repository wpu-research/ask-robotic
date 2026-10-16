// HC-05 Bluetooth (veri kipi, 9600 baud): VCC -> 5V, GND -> GND, TXD -> D10 (Arduino RX), STATE -> D4.
// RXD 3,3 V girişidir: D11 -> 1 kΩ -> RXD, RXD -> 2 kΩ -> GND (gerilim bölücü: 5 V x 2/3 = 3,3 V).
// D0/D1 USB seri hattıdır (yükleme ve seri monitör); modül SoftwareSerial ile başka pinlere bağlanır.
// Telefondaki terminalden "1" LED'i yakar, "0" söndürür, "?" durumu sorar.
#include <SoftwareSerial.h>

SoftwareSerial bt(10, 11);  // RX, TX (Arduino tarafından)
const int LED = 13;
const int STATE_PIN = 4;    // HC-05 STATE: telefon bağlıyken HIGH
bool bagliydi = false;

void setup() {
  Serial.begin(9600);
  bt.begin(9600);           // HC-05 veri kipinin fabrika hızı
  pinMode(LED, OUTPUT);
  pinMode(STATE_PIN, INPUT);
  Serial.println("HC-05 hazir");
}

void loop() {
  bool bagli = digitalRead(STATE_PIN) == HIGH;
  if (bagli != bagliydi) {
    bagliydi = bagli;
    Serial.println(bagli ? "telefon bagli" : "baglanti yok");
    if (bagli) bt.println("Merhaba! 1: LED yak, 0: sondur, ?: durum");
  }
  while (bt.available()) {
    char c = bt.read();
    if (c == '1') { digitalWrite(LED, HIGH); bt.println("LED acik"); Serial.println("komut 1"); }
    else if (c == '0') { digitalWrite(LED, LOW); bt.println("LED kapali"); Serial.println("komut 0"); }
    else if (c == '?') { bt.println(digitalRead(LED) ? "LED acik" : "LED kapali"); }
  }
}
