// NPN transistörle (BC547 / 2N2222 / TIP122) DC motor anahtarlama, alçak taraf:
// D9 -> 1 kΩ -> taban (B); emitör (E) -> GND; kolektör (C) -> motor -> 5V.
// Motorun uçlarına 1N4007 ters paralel (katot 5V tarafında): kesilen akımın geri tepmesini söndürür.
const int TABAN = 9;

void setup() {
  Serial.begin(9600);
  pinMode(TABAN, OUTPUT);
}

void loop() {
  Serial.println("tam");   analogWrite(TABAN, 255); delay(1500);
  Serial.println("yarim"); analogWrite(TABAN, 128); delay(1500);
  Serial.println("dur");   analogWrite(TABAN, 0);   delay(1500);
}
