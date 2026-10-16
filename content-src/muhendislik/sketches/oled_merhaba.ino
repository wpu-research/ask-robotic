// SSD1306 128x64 OLED (I2C): VCC -> 5V, GND -> GND, SDA -> A4, SCL -> A5. Adres genelde 0x3C (bazı kartlarda 0x3D).
// Adafruit_SSD1306, ekranın kopyasını Uno'nun RAM'inde tutar (1 KB); display() bu tamponu I2C ile ekrana gönderir.
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 ekran(128, 64, &Wire, -1);  // -1: RESET pini yok

void setup() {
  Serial.begin(9600);
  if (!ekran.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {  // dahili şarj pompası, adres 0x3C
    Serial.println("OLED bulunamadi");
    while (true) {}
  }
  ekran.clearDisplay();
  ekran.setTextColor(SSD1306_WHITE);
  ekran.setTextSize(2);           // 12x16 piksel karakter
  ekran.setCursor(4, 4);
  ekran.print("Merhaba!");
  ekran.drawRect(0, 0, 128, 24, SSD1306_WHITE);   // yazının çevresine çerçeve
  ekran.fillCircle(112, 46, 10, SSD1306_WHITE);   // dolu daire
  ekran.display();                // tampon -> ekran
  Serial.println("OLED hazir");
}

void loop() {
  ekran.fillRect(0, 40, 90, 16, SSD1306_BLACK);  // eski sayıyı sil
  ekran.setTextSize(1);
  ekran.setCursor(0, 44);
  ekran.print("t = ");
  ekran.print(millis() / 1000);
  ekran.print(" s");
  ekran.display();
  delay(500);
}
