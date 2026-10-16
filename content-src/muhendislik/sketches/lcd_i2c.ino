// PCF8574 I2C LCD adaptörü: VCC -> 5V, GND, SDA -> A4, SCL -> A5. Adres genelde 0x27 (bazı kartlarda 0x3F).
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.print("I2C: 2 kablo");
}

void loop() {
  lcd.setCursor(0, 1);
  lcd.print("t=");
  lcd.print(millis() / 1000);
  lcd.print(" s   ");
  delay(200);
}
