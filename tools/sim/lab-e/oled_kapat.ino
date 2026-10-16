// Test: 0-1,5 s dolu dikdörtgen (0,0)-(63,31); 1,5-2,5 s ekran kapalı; 2,5 s açık; 3,5 s ters renk.
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
Adafruit_SSD1306 d(128, 64, &Wire, -1);
void setup() {
  Serial.begin(9600);
  if (!d.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { Serial.println("yok"); while (true) {} }
  d.clearDisplay();
  d.fillRect(0, 0, 64, 32, SSD1306_WHITE);
  d.display();
  Serial.println("ciz");
  delay(1500 - millis());
  d.ssd1306_command(SSD1306_DISPLAYOFF);
  Serial.println("kapali");
  delay(1000);
  d.ssd1306_command(SSD1306_DISPLAYON);
  Serial.println("acik");
  delay(1000);
  d.invertDisplay(true);
  Serial.println("ters");
}
void loop() {}
