# A multi-page screen interface (LCD/OLED)
duration: 25

## Wonder
The screen of a small weather station has 16 characters and 2 rows. But what you want to show is the temperature, humidity, pressure, altitude and soil moisture. You cannot fit them all at once. We will solve it with "pages", as on phones: the screen changes page every few seconds, and if you like you turn the page yourself with a button. While doing this, your program will not stop with `delay` anywhere.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| I2C LCD (address 0x27) | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND |
| BMP280 (address 0x76) | SDA → **A4**, SCL → **A5** (same bus as the LCD), VCC → 5V, GND → GND |
| DHT (DHT22) | DATA → **D5**, VCC → 5V, GND → GND |
| Soil moisture module | AO → **A2**, VCC → 5V, GND → GND |
| "Next page" button | A → **D2**, B → GND (`INPUT_PULLUP`) |

Because the LCD (0x27) and the BMP280 (0x76) are at different addresses, they share the same two wires (SDA, SCL) (lesson 33). You can draw two separate wires to pins A4 and A5, or you can connect the second device's SDA/SCL pin to the same pin on the first device. While it runs you can move the sensors' sliders and press the Button part by holding it down.

### The idea: a page number and a timer
A `sayfa` (page) variable holds which page is being shown. When the time is up, the variable goes up by one, and when it reaches the end it goes back to the start:

```cpp
sayfa = (sayfa + 1) % SAYFA_SAYISI;   // 0, 1, 2, 0, 1, 2, ...
```

`%` gives the remainder of a division: after 2, 3 % 3 = 0. For the time we use the `millis()` pattern from lesson 27: `simdi - sonSayfa >= 3000`.

### Updating the screen without flicker
If you call `lcd.clear()` on every update, the screen goes blank for a moment and flickers. A better way: write each line **always padded to 16 characters**. If the new text is shorter than the old one, the leftover spaces cover the old characters. We write a small helper for this. We will also use two new tools:

- **`snprintf(tampon, boyut, biçim, ...)`:** Writes formatted text into a character array (a buffer). `%s` means text, `%d` a whole number, `%-16s` "text left-aligned, 16 characters wide". `%%` prints a per cent sign. On the Arduino Uno, `snprintf` does not print decimal numbers (`%f`); you get `?` instead of the number.
- **`dtostrf(sayi, genislik, basamak, tampon)`:** Turns a decimal number into text (number, width, digits, buffer). `dtostrf(23.4, 1, 1, tampon)` writes `"23.4"` into the buffer. This way we put the decimal number into `snprintf` as text.

### Program: a 3-page weather screen
Page 1 shows the temperature and humidity, page 2 the pressure and altitude, page 3 the soil moisture. The page number, such as `1/3`, sits in the top right corner. The sensors are read every 2 seconds (the time the DHT needs), the page changes every 3 seconds, and the button changes the page straight away and restarts the 3-second timer.

```cpp
// sketch: ekran_sayfalar
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

const int BUTON = 2;
const int SAYFA_SAYISI = 3;
const unsigned long SAYFA_SURESI = 3000;   // ms
const unsigned long OLCUM_ARALIGI = 2000;  // ms
const int KURU = 800;
const int ISLAK = 350;
const float P0_HPA = 1013.25;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP280 bmp;
DHT dht(5, DHT22);

int sayfa = 0;
unsigned long sonSayfa = 0;
unsigned long sonOlcum = 0;
unsigned long sonBasis = 0;
bool oncekiBasili = false;
bool bmpHazir = false;

float sicaklik = NAN;
float nem = NAN;
float hpa = NAN;
float rakim = NAN;
int toprakHam = 0;
int toprakYuzde = 0;

// Sayiyi metne cevirir; gecersizse "--" verir.
const char* sayi(float v, int basamak, char* tampon) {
  if (isnan(v)) {
    return "--";
  }
  dtostrf(v, 1, basamak, tampon);
  return tampon;
}

// Bir satiri her zaman 16 karaktere tamamlayarak yazar.
void satirYaz(int satir, const char* metin) {
  char tampon[17];
  snprintf(tampon, sizeof(tampon), "%-16s", metin);
  lcd.setCursor(0, satir);
  lcd.print(tampon);
}

void sayfaCiz() {
  char ust[17];
  char alt[17];
  char a[10];
  char b[10];

  if (sayfa == 0) {
    snprintf(ust, sizeof(ust), "Sic: %s C", sayi(sicaklik, 1, a));
    snprintf(alt, sizeof(alt), "Nem: %s %%", sayi(nem, 1, b));
  } else if (sayfa == 1) {
    if (bmpHazir) {
      snprintf(ust, sizeof(ust), "P:%s hPa", sayi(hpa, 1, a));
      snprintf(alt, sizeof(alt), "Rakim: %s m", sayi(rakim, 0, b));
    } else {
      snprintf(ust, sizeof(ust), "BMP280 yok");
      snprintf(alt, sizeof(alt), " ");
    }
  } else {
    snprintf(ust, sizeof(ust), "Toprak: %%%d", toprakYuzde);
    snprintf(alt, sizeof(alt), "Ham: %d", toprakHam);
  }

  char baslik[17];
  snprintf(baslik, sizeof(baslik), "%-13s%d/%d", ust, sayfa + 1, SAYFA_SAYISI);
  satirYaz(0, baslik);
  satirYaz(1, alt);
}

void olcumYap() {
  float n = dht.readHumidity();
  float s = dht.readTemperature();
  sicaklik = s;                         // okunamazsa NAN kalir, ekran "--" yazar
  nem = n;

  if (bmpHazir) {
    hpa = bmp.readPressure() / 100.0;
    rakim = bmp.readAltitude(P0_HPA);
  }

  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(A2);
  }
  toprakHam = toplam / 8;
  toprakYuzde = constrain(map(toprakHam, KURU, ISLAK, 0, 100), 0, 100);
}

void setup() {
  pinMode(BUTON, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  dht.begin();
  bmpHazir = bmp.begin(0x76);
  delay(1500);                          // DHT sensoru acilsin
  olcumYap();
  sayfaCiz();
  sonOlcum = millis();
  sonSayfa = millis();                  // sayfa suresi simdi baslasin
}

void loop() {
  unsigned long simdi = millis();

  // Butona basilinca hemen sonraki sayfa
  bool basili = (digitalRead(BUTON) == LOW);
  if (basili && !oncekiBasili && simdi - sonBasis > 50) {
    sonBasis = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sonSayfa = simdi;                   // 3 saniyelik sure bastan
    sayfaCiz();
  }
  oncekiBasili = basili;

  // Sensorler 2 saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    olcumYap();
    sayfaCiz();
  }

  // Sayfa 3 saniyede bir
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }
}
```

### How does it work?
1. `sayfa` takes the values 0, 1 and 2. `sayfaCiz()` (draw page) looks at the page number and prepares the matching two lines. The only place that touches the screen is `satirYaz` (write line).
2. The `sayi()` helper function writes `"--"` if the measurement is invalid. So when the DHT or BMP280 is missing, you see `--` on the screen instead of `nan`.
3. Three jobs run on separate clocks: checking the button, reading the sensors (2 s) and turning the page (3 s). None of them uses `delay` (lesson 27).
4. At the end of `setup` we wrote `sonSayfa = millis()`. If we had not done this, because `millis()` counts from start-up, the 1.5-second `delay` in `setup` and the LCD start-up time would have been eaten out of the page time, and the first page would have appeared very briefly.
5. If there is no BMP280 on page 2, the screen says `BMP280 yok` (no BMP280); the program still runs.

The behaviour we saw in the lab: the screen changed every 3 seconds in the order `1/3`, `2/3`, `3/3`, `1/3` (the interval was very close to 3000 ms). With the DHT temperature at 25 °C and the humidity at 50 %, the first page showed `Sic: 25.0 C` and `Nem: 50.0 %`. The button turned the page straight away, and the next automatic change came 3 seconds after the button. The LCD and the BMP280 worked together on the same I2C bus. When we changed the temperature slider while it was running, the first page showed the new value within 2 seconds at most. With the Soil moisture module's **Soil moisture** slider at 0.5, the third page shows `Toprak: %41` and `Ham: 614` (the measurement from lesson 48).

### The OLED screen (a short introduction)
**There is no OLED part in the lab**; this section is for you to learn by reading, and only the LCD is used in the activity.

An OLED is a small screen where every pixel makes its own light. Common modules are 128x64 pixels and connect over I2C (the address is usually 0x3C; check the label). The difference from the LCD: you draw **pixels**, not characters, you can choose the text size, and you can also draw lines and shapes. The libraries used are Adafruit SSD1306 and Adafruit GFX.

Careful: the image buffer of a 128x64 screen is 1024 bytes. That is half of the Uno's 2048 bytes of SRAM (lesson 34). Together with big text arrays and other libraries, make sure the memory does not fill up.

The example below applies the same page logic to an OLED. This sketch was only tried by compiling it; because there is no OLED in the lab, the screen behaviour was not checked. For how to use the library, look at the Adafruit SSD1306 and GFX documentation and examples.

```cpp
// sketch: oled_sayfalar
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 oled(128, 64, &Wire, -1);   // genislik, yukseklik, I2C, reset yok

const int SAYFA_SAYISI = 3;
const unsigned long SAYFA_SURESI = 3000;
int sayfa = 0;
unsigned long sonSayfa = 0;
bool oledHazir = false;

void sayfaCiz() {
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setTextColor(SSD1306_WHITE);
  oled.setCursor(0, 0);
  if (sayfa == 0) {
    oled.println("Sicaklik");
    oled.print(23.4, 1);
    oled.println(" C");
  } else if (sayfa == 1) {
    oled.println("Basinc");
    oled.print(1013.2, 1);
    oled.println(" hPa");
  } else {
    oled.println("Toprak");
    oled.println("%45");
  }
  oled.display();                       // cizdiklerini ekrana gonder
}

void setup() {
  Serial.begin(9600);
  oledHazir = oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!oledHazir) {
    Serial.println("OLED bulunamadi");
    return;
  }
  sayfaCiz();
}

void loop() {
  if (!oledHazir) {
    return;
  }
  unsigned long simdi = millis();
  if (simdi - sonSayfa >= SAYFA_SURESI) {
    sonSayfa = simdi;
    sayfa = (sayfa + 1) % SAYFA_SAYISI;
    sayfaCiz();
  }
}
```

On an OLED, what you draw does not go to the screen until `oled.display()` is called; you first draw into the buffer, then send it all in one go. On real modules, if the address is not 0x3C, you need to change the address inside `begin`.

### Try it
- Set `SAYFA_SURESI` (page time) to 1500. Can you read the text? Which time do you think is long enough for reading?
- Add a fourth page (for example how many seconds the program has been running, with `millis() / 1000`). What needs to change in `SAYFA_SAYISI` and `sayfaCiz`?
- Remove the padding inside `satirYaz` and write `lcd.print(metin)` directly instead. When the page changes, are there leftovers of the old text on the screen?

### Common mistakes
- Waiting on the page with `delay(3000)`: you miss button presses and the sensors stop.
- Not padding the line to 16 characters: when short text is written over a long one, the old characters stay on the screen.
- Using `%f` with `snprintf`: on the Uno it does not print decimal numbers; use `dtostrf`.
- Not limiting the `sayfa` variable: if you write `sayfa++` and forget to go back to the start, the page number goes past the limit.
- Making the buffer too small: long text can overflow and corrupt other variables; `snprintf` limits the size, `sprintf` does not.

## Discuss
While a user is trying to read a value on the screen, the page changes when the 3 seconds are up. Do you think the page time should be fixed, or should it wait longer when the user presses the button? If there is a critical warning that must be shown (for example "watering needed"), what place should you give it in the page cycle?
