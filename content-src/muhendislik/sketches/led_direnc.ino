// LED + seri direnç: D9 -> 220 Ω -> LED anot, LED katot -> GND
// I = (5 V - Vf) / R = (5 - 1.9) / 220 ≈ 14 mA. Direnci kaldırırsan akım sınırsızdır ve LED yanar.
// Multimetre: dirence tıkla, üzerindeki gerilim ve akımı gör (V = I · R).
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // PWM ile parlaklık rampası: ortalama akım doluluk oranıyla orantılı
  for (int d = 0; d <= 255; d += 5) { analogWrite(LED_PIN, d); delay(15); }
  for (int d = 255; d >= 0; d -= 5) { analogWrite(LED_PIN, d); delay(15); }
}
