# Final project: Thermostat
duration: 35

## Wonder
The boiler at home, the aquarium heater, the egg incubator: they all have the same small brain inside. It measures the temperature, compares it with the value you want, and switches the heater on or off. And it does not forget the temperature you want even when it is unplugged. In this module's final project, you will build this brain yourself.

## Activity
### What are we going to do?
This project brings together what you have learnt:
- **Week 3:** working out the temperature with an NTC thermistor (A2).
- **Week 5:** switching on and off with a relay, and hysteresis (D7).
- **Week 6:** non-blocking code with `millis()` and a state machine.
- **Week 7:** the I2C LCD display and a permanent setting in the EEPROM.

The user sets the target temperature with two buttons. When the measured temperature falls below the target, the relay switches the heater on; when it reaches the target, it switches it off. The target temperature is stored in the EEPROM.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. Parts you need: an NTC (`ntc`), two resistors (10 kΩ and 330 Ω), two buttons, a relay (`relay`), an LED and an I2C LCD (`lcdI2c`).

| Part | Connection |
|---|---|
| NTC thermistor | Pin 1 to **A2**, pin 2 to GND |
| 10 kΩ resistor (fixed) | Pin 1 to 5V, pin 2 to **A2** |
| "Up" button | Pin A to **D2**, pin B to GND |
| "Down" button | Pin A to **D3**, pin B to GND |
| Relay IN | **D7** (relay VCC → 5V, relay GND → GND) |
| LED in place of the "heater" | Relay COM → 5V; relay NO → 330 Ω resistor → LED A; LED K → GND |
| I2C LCD 16x2 | SDA → **A4**, SCL → **A5**, VCC → 5V, GND → GND (address 0x27) |

We use an LED instead of a heater: if the LED is lit, it means "heater on". Because the buttons are `INPUT_PULLUP`, a pressed button reads `LOW`. The NTC's resistance is 10 kΩ (at 25 °C) and its β value is 3950; you change the temperature by selecting the NTC and using the right panel (this works while it runs too). In the relay's properties, **Trigger** must be "Energized by HIGH" (the default); if you choose "Energized by LOW", you have to swap the `HIGH` and `LOW` in the program. If the LCD's address is not 0x27, find it with the scan program you learnt in the previous lesson. Because of the wait inside `lcd.init()`, the LCD shows text about 1.5 seconds after ▶.

The NTC and the fixed resistor make a **voltage divider**: as the temperature rises, the NTC's resistance falls and the voltage on A2 drops. We find the NTC's resistance with the formula `R = 10000 × ADC / (1023 − ADC)`. We work out the temperature with the Steinhart-Hart (beta) formula with β = 3950. If a real thermistor has a different β value, you change the constant; the lab's NTC uses 3950.

### State machine
The thermostat has three states:

| State | Relay | Leaving this state |
|---|---|---|
| `KAPALI` (off) | Off | If the temperature is equal to or lower than `hedef − 0,5`, `ISITIYOR`; if a button is pressed, `AYAR` |
| `ISITIYOR` (heating) | On | If the temperature is equal to or higher than `hedef + 0,5`, `KAPALI`; if a button is pressed, `AYAR` |
| `AYAR` (setting) | Off | 2 seconds after the last button press, the target is written to the EEPROM, `KAPALI` |

There are two separate thresholds, 0.5 degrees below and above the target (**hysteresis**). This way the relay does not keep switching on and off while the temperature wobbles around the target.

In the `AYAR` state, every press changes the target by 1 degree and restarts the 2-second timer. Writing to the EEPROM is done **once**, after the setting is finished; this way 5 presses in a row do not use up 5 writes.

### Program
```cpp
// sketch: termostat
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>

const int ARTIR = 2;
const int AZALT = 3;
const int ROLE = 7;
const int NTC_PIN = A2;

const int ADRES = 0;                // hedef sıcaklığın EEPROM adresi
const int HEDEF_MIN = 10;
const int HEDEF_MAX = 35;
const int HEDEF_VARSAYILAN = 22;
const float HISTEREZIS = 0.5;       // hedefin altı ve üstü için pay
const unsigned long AYAR_SURESI = 2000;   // ms
const unsigned long OLCUM_ARALIGI = 500;  // ms

enum Durum { KAPALI, ISITIYOR, AYAR };

LiquidCrystal_I2C lcd(0x27, 16, 2);

Durum durum = KAPALI;
int hedef;
float sicaklik;
unsigned long sonOlcum = 0;
unsigned long ayarBasla = 0;
unsigned long sonBasis = 0;
bool oncekiArtir = false;
bool oncekiAzalt = false;

float sicaklikOku() {
  long toplam = 0;
  for (int i = 0; i < 8; i++) {
    toplam += analogRead(NTC_PIN);
  }
  float adc = toplam / 8.0;
  if (adc < 1.0) adc = 1.0;           // sıfıra bölmeyi önle
  if (adc > 1022.0) adc = 1022.0;
  float direnc = 10000.0 * adc / (1023.0 - adc);
  float kelvin = 1.0 / (log(direnc / 10000.0) / 3950.0 + 1.0 / 298.15);
  return kelvin - 273.15;
}

const char* durumAdi() {
  if (durum == ISITIYOR) return "ISIT  ";
  if (durum == AYAR) return "AYAR  ";
  return "KAPALI";
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  lcd.print("Su an: ");
  lcd.print(sicaklik, 1);
  lcd.print(" C    ");
  lcd.setCursor(0, 1);
  lcd.print("Hedef:");
  lcd.print(hedef);
  lcd.print("C ");
  lcd.print(durumAdi());
}

void setup() {
  pinMode(ARTIR, INPUT_PULLUP);
  pinMode(AZALT, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  digitalWrite(ROLE, LOW);
  Serial.begin(9600);

  hedef = EEPROM.read(ADRES);
  if (hedef < HEDEF_MIN || hedef > HEDEF_MAX) {
    hedef = HEDEF_VARSAYILAN;         // boş (255) ya da bozuk değer
  }

  lcd.init();
  lcd.backlight();
  sicaklik = sicaklikOku();
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Butonlar: basıldığı an (yüksekten alçağa geçiş) bir kez işle
  bool artirBasili = (digitalRead(ARTIR) == LOW);
  bool azaltBasili = (digitalRead(AZALT) == LOW);
  bool artirYeni = artirBasili && !oncekiArtir;
  bool azaltYeni = azaltBasili && !oncekiAzalt;
  oncekiArtir = artirBasili;
  oncekiAzalt = azaltBasili;

  if ((artirYeni || azaltYeni) && simdi - sonBasis > 50) {   // 50 ms: sıçrama önleme
    sonBasis = simdi;
    if (artirYeni && hedef < HEDEF_MAX) hedef++;
    if (azaltYeni && hedef > HEDEF_MIN) hedef--;
    durum = AYAR;                      // ayar moduna gir, 2 saniyelik süreyi başlat
    ayarBasla = simdi;
    ekranYaz();
  }

  // 2) Sıcaklık: yarım saniyede bir ölç
  bool olcumZamani = false;
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    sicaklik = sicaklikOku();
    olcumZamani = true;
  }

  // 3) Durum makinesi
  switch (durum) {
    case KAPALI:
      if (sicaklik <= hedef - HISTEREZIS) durum = ISITIYOR;
      break;
    case ISITIYOR:
      if (sicaklik >= hedef + HISTEREZIS) durum = KAPALI;
      break;
    case AYAR:
      if (simdi - ayarBasla >= AYAR_SURESI) {
        EEPROM.update(ADRES, hedef);   // ayar bitti: yalnızca değiştiyse yazar
        durum = KAPALI;
      }
      break;
  }
  digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW);

  // 4) Ekran ve seri çıktı: her ölçümden sonra
  if (olcumZamani) {
    ekranYaz();
    Serial.print("sicaklik=");
    Serial.print(sicaklik, 1);
    Serial.print(" hedef=");
    Serial.print(hedef);
    Serial.print(" role=");
    Serial.println(durum == ISITIYOR ? 1 : 0);
  }
}
```

### How does it work?
1. In `setup`, the target is first read from the EEPROM. A cell that has never been written holds 255; because this value is outside the 10-35 range, the default of 22 degrees is used.
2. `loop` does four jobs, and none of them has a `delay`: buttons, measurement, state machine, display. The measurement and the display are done every half second with `millis()`. Debouncing is also done with `millis()`: if 50 ms have not passed since the last press, a new press is not counted.
3. The buttons are handled only **at the moment they are pressed**: if a button was not pressed on the previous pass and is pressed now, the target changes. This way holding the button down does not keep raising the target.
4. When a button is pressed, the program moves to the `AYAR` state. In this state the relay is off; the heater does not run while the user is changing the target. If no button is pressed for 2 seconds, the target is written to the EEPROM.
5. With `switch`, the three states are written in one place. The relay output follows directly from the state: `digitalWrite(ROLE, durum == ISITIYOR ? HIGH : LOW)`.
6. Because `EEPROM.update` is used, if the target has stayed the same (for example, if you raised it and lowered it back), nothing is written to the EEPROM.

### Try it
- Set `HISTEREZIS` to 0.2 and to 2. How often does the relay switch on and off?
- Raise the target above the temperature, then raise the NTC's **Temperature** property step by step. At what temperature does the relay switch off?
- Change the target once (for example 22 → 24), wait 2 seconds, stop with ■ and press ▶ again (cutting and restoring the power). Did it start with the target at 24? Why? Then press ↺ Reset and run it again: why is the target 22 again? (The EEPROM is kept when the power is cut; ↺ Reset empties the EEPROM, so `255` is read and the default 22 is used.) Also try pressing ■ straight after changing the setting (before the 2 seconds are up): has the new target been saved?
- Add a new feature: add a buzzer in the lab (+ pin to D8, - pin to GND). Make it sound if the temperature is more than 5 degrees below the target. Which state will you add it to?

### Common mistakes
- Putting the NTC and the fixed resistor the wrong way round (connecting the NTC to 5V and the fixed resistor to GND): the reading falls as the temperature rises, or it works backwards. Work out the resistor divider again with the voltage formula.
- Using a single threshold without hysteresis: when the temperature wobbles around the threshold, the relay switches on and off very fast and wears out.
- Writing to the EEPROM on every button press: presses in a row use up needless writes. Do the write after the setting is finished.
- Not limiting the target value: negative or very high targets can leave the heater on all the time.
- Taking an empty EEPROM that reads as 255 for a valid target.

## Discuss
Think about what the thermostat does if the temperature sensor comes loose or is connected wrongly: does the heater stay on forever? If you wanted to add a safety measure to this project, what would you add?
