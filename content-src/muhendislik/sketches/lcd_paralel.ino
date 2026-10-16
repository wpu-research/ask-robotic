// 16x2 LCD (HD44780, 4-bit): RS -> D12, E -> D11, D4-D7 -> D5, D4, D3, D2
// VSS ve RW -> GND, VDD -> 5V, V0 -> kontrast (GND'ye yakın), A -> 220 Ω -> 5V, K -> GND
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  lcd.begin(16, 2);
  lcd.print("Merhaba muhendis");
}

void loop() {
  lcd.setCursor(0, 1);
  lcd.print("t=");
  lcd.print(millis() / 1000);
  lcd.print(" s   ");
  delay(200);
}
