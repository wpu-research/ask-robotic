// LDR gerilim bölücü: 5V -> LDR -> A0 -> 10 kΩ -> GND
// Işık arttıkça LDR direnci düşer, A0 gerilimi yükselir: V = 5 · 10k / (R_LDR + 10k)
const int SENS = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int ham = analogRead(SENS);
  float v = ham * 5.0 / 1023.0;
  // Bölücü denkleminden LDR direncini geri hesapla
  float rLdr = v > 0.01 ? 10000.0 * (5.0 - v) / v : 1e9;
  Serial.print("V=");
  Serial.print(v, 2);
  Serial.print(" R_LDR=");
  Serial.println(rLdr, 0);
  delay(250);
}
