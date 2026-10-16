// Sharp IR mesafe sensörü (GP2Y0A21 benzeri, 10-80 cm): VO -> A0
// Çıkış gerilimi uzaklıkla ters orantılı düşer; bu laboratuvar modelinde cm ≈ 26 / V.
// Gerçek sensörde eğri her modül için kalibre edilmelidir (datasheet grafiği).
const int VO_PIN = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  // 8 ölçümün ortalaması: Sharp çıkışı gürültülüdür
  long top = 0;
  for (int i = 0; i < 8; i++) top += analogRead(VO_PIN);
  float volt = (top / 8.0) * 5.0 / 1023.0;
  float cm = 26.0 / volt;
  Serial.print("V=");
  Serial.print(volt, 2);
  Serial.print(" cm=");
  Serial.println(cm, 1);
  delay(200);
}
