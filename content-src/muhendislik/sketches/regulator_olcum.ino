// Regülatörün girişini ve çıkışını ölçmek. Giriş: VIN -> 10 kΩ -> A1 -> 3,3 kΩ -> GND (1/4,03, 20 V'a kadar).
// Çıkış en çok 5 V ise doğrudan A0'a. Yük: çıkış -> 100 Ω -> GND. Pilin −, regülatörün GND'si ve Uno GND ortak.
const float BOLUCU = (10.0 + 3.3) / 3.3;

float oku(int pin) {
  long top = 0;
  for (int i = 0; i < 16; i++) top += analogRead(pin);
  return (top / 16.0) * 5.0 / 1023.0;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  float giris = oku(A1) * BOLUCU;
  float cikis = oku(A0);
  float akim = cikis / 100.0;                    // yük 100 Ω
  Serial.print("giris=");
  Serial.print(giris, 2);
  Serial.print(" V cikis=");
  Serial.print(cikis, 2);
  Serial.print(" V yuk=");
  Serial.print(akim * 1000, 0);
  Serial.println(" mA");
  delay(500);
}
