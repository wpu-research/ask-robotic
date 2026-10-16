// Pil gerilimini ölçmek: + -> 10 kΩ -> A0 -> 3,3 kΩ -> GND (bölücü 1/4,03), pilin − ucu Uno GND'sine (ortak toprak).
// A0 en çok 5 V okur: bölücüyle 20 V'a kadar pil ölçülebilir. Yük: pil -> 470 Ω -> LED -> GND.
const float BOLUCU = (10.0 + 3.3) / 3.3;   // 4,03

void setup() {
  Serial.begin(9600);
}

void loop() {
  long top = 0;
  for (int i = 0; i < 16; i++) top += analogRead(A0);   // 16 ölçüm ortalaması
  float a0 = (top / 16.0) * 5.0 / 1023.0;
  float pil = a0 * BOLUCU;
  Serial.print("A0=");
  Serial.print(a0, 2);
  Serial.print(" V  pil=");
  Serial.print(pil, 2);
  Serial.println(" V");
  delay(500);
}
