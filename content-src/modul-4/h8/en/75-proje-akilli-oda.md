# Final project: Smart room
duration: 35

## Wonder
In a classroom, the lights stay on in an empty room, and the fan spins when nobody is there. A smart room, however, does not ask you: if nobody is there, it saves energy; when someone comes in and it is dark, it switches the light on; when it gets warm, it switches the fan on. This is the module's final project: you will combine the sensors you have learnt about in a single state machine, and you will know where what you see in the lab will be different in a real circuit.

## Activity
### What are we going to do?
This project brings together what you have learnt:
- **Week 2:** Motion detection with the PIR and its warm-up time (D2).
- **Week 3:** Temperature and humidity with the DHT22 (D5).
- **Week 4:** Light measurement with the LDR and hysteresis (A1).
- **Week 5 and Module 3:** Fan control with a relay (D7), hysteresis.
- **Week 6 and Module 3:** Non-blocking code with `millis()`, the state machine, the I2C LCD.
- **Week 8:** Defence against real-world effects: a waiting margin for button bounce (D3), threshold hysteresis for noise, safe behaviour (fail-safe) when a sensor fails, and PIR warm-up.

### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires. For the "fan" we use a second LED instead of a small motor.

| Part | Connection |
|---|---|
| PIR | VCC → **5V**, GND → **GND**, OUT → **D2** |
| DHT22 | VCC → **5V**, GND → **GND**, DATA → **D5** (Type property DHT22) |
| LDR | 1 → **5V**, 2 → **A1** |
| Resistor (10 kΩ) | 1 → **A1**, 2 → **GND** (A1 rises in the light) |
| Relay | VCC → **5V**, GND → **GND**, IN → **D7**; COM → **5V**, NO → pin 1 of the fan resistor |
| Resistor (330 Ω, fan) | 1 → the relay's NO pin, 2 → the A pin of the "fan" LED |
| LED ("fan") | A → pin 2 of the fan resistor, K → **GND** |
| Resistor (330 Ω, lamp) | 1 → **D13**, 2 → the A pin of the "lamp" LED |
| LED ("lamp") | A → pin 2 of the lamp resistor, K → **GND** |
| Button | A → **D3**, B → **GND** (`INPUT_PULLUP`) |
| I2C LCD 16x2 | GND → **GND**, VCC → **5V**, SDA → **A4**, SCL → **A5** (address 0x27) |

Because the 5V line is ideal in the lab, powering the fan from the board causes no problem (lesson 73); in a real circuit it would. Safety: in this project no circuit is ever built with mains voltage (220 V); the relay only switches the low-voltage "fan" load.

The PIR output goes HIGH while there is motion, and stays HIGH for a while after the motion ends; in the lab the warm-up is 2 s and the hold time 3 s (lesson 41). On real modules these times depend on the model. Leave at least 2 seconds between DHT22 readings (lesson 46).

### State machine
| State | Lamp | Fan | LCD backlight | Leaving the state |
|---|---|---|---|---|
| ISINMA (warming up) | Off | Off | On | When `ISINMA_SURESI` is up, BOS. The PIR is ignored. |
| BOS (empty) | Off | Off | **Off** (saving) | If the PIR sees motion, DOLU |
| DOLU (occupied) | On if dark | On if warm | On | `BOS_SURESI` after the last motion, BOS |
| KAPALI (off) | Off | Off | On | Button: switches between KAPALI and BOS |

- **Light:** It lights only while the room is DOLU and it is dark. The dark/light decision is made **with hysteresis**: when the ADC value drops below 300 it is dark, and when it rises above 400 it is light. In between, the previous decision is kept (lesson 71). In the lab you try the thresholds with the LDR's **Light** property; in a real room you need to calibrate the thresholds for the light in that place (lesson 73).
- **Fan:** It switches on only while the room is DOLU and the temperature reaches 28 °C, and switches off when it drops to 26 °C.
- **Safe default:** If the DHT22 cannot be read, or the value is outside the sensible range (lesson 74), the fan stays **off** and the LCD shows `DHT HATA` (DHT error). Switching the fan off rather than keeping it on when the temperature is unknown is this project's answer to the question in the Hyvex case, "what happens when control is lost?": a dangerous or costly output is off by default.
- **Times:** To try it quickly in the lesson, `ISINMA_SURESI` (warm-up time) was taken as 3 s and `BOS_SURESI` (empty time) as 8 s. The lab's PIR warm-up is 2 s, so `ISINMA_SURESI` must be above this. On a real module the warm-up is much longer, and the empty-room time is measured in minutes.

### Program
```cpp
// sketch: akilli_oda
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

const int PIR = 2;
const int DUGME = 3;
const int DHT_PIN = 5;
const int ROLE = 7;
const int LAMBA = 13;
const int LDR = A1;

const unsigned long ISINMA_SURESI = 3000;    // ms (gerçekte çok daha uzun)
const unsigned long BOS_SURESI = 8000;       // ms (gerçekte dakikalar)
const unsigned long OLCUM_ARALIGI = 2000;    // DHT22 için en az 2 sn
const unsigned long EKRAN_ARALIGI = 500;
const int KARANLIK_ALT = 300;                // bunun altı: karanlık
const int AYDINLIK_UST = 400;                // bunun üstü: aydınlık
const float FAN_ACIK = 28.0;
const float FAN_KAPAT = 26.0;

enum Durum { ISINMA, BOS, DOLU, KAPALI };

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT22);

Durum durum = ISINMA;
bool karanlik = false;
bool fan = false;
bool olculdu = false;                // ilk DHT okuması yapıldı mı?
bool sensorTamam = false;
float sicaklik = 0;
float nem = 0;
bool arkaIsik = true;
bool oncekiDugme = false;
unsigned long sonDugme = 0;
unsigned long sonHareket = 0;
unsigned long sonOlcum = 0;
unsigned long sonEkran = 0;

const char *durumAdi() {
  if (durum == ISINMA) return "ISINMA";
  if (durum == BOS) return "BOS   ";
  if (durum == DOLU) return "DOLU  ";
  return "KAPALI";
}

void gec(Durum yeni) {
  durum = yeni;
  Serial.print("durum=");
  Serial.println(durumAdi());
}

void ekranYaz() {
  lcd.setCursor(0, 0);
  if (!olculdu) {
    lcd.print("Olcum bekleniyor");
  } else if (!sensorTamam) {
    lcd.print("DHT HATA        ");
  } else {
    lcd.print("T:");
    lcd.print(sicaklik, 1);
    lcd.print("C N:%");
    lcd.print((int)nem);
    lcd.print("    ");
  }
  lcd.setCursor(0, 1);
  lcd.print(durumAdi());
  lcd.print(" L");
  lcd.print(digitalRead(LAMBA) == HIGH ? 1 : 0);
  lcd.print(" F");
  lcd.print(fan ? 1 : 0);
  lcd.print("   ");
}

void setup() {
  pinMode(PIR, INPUT);
  pinMode(DUGME, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  pinMode(LAMBA, OUTPUT);
  digitalWrite(ROLE, LOW);             // varsayılan: kapalı
  digitalWrite(LAMBA, LOW);
  Serial.begin(9600);
  dht.begin();
  lcd.init();
  lcd.backlight();
  ekranYaz();
}

void loop() {
  unsigned long simdi = millis();

  // 1) Buton: basıldığı an bir kez, 50 ms sıçrama payıyla
  bool basili = (digitalRead(DUGME) == LOW);
  if (basili && !oncekiDugme && simdi - sonDugme > 50) {
    sonDugme = simdi;
    if (durum == KAPALI) gec(BOS); else gec(KAPALI);
  }
  oncekiDugme = basili;

  // 2) PIR: ısınırken ve kapalıyken yok sayılır
  bool hareket = (digitalRead(PIR) == HIGH);
  if (hareket && (durum == BOS || durum == DOLU)) {
    sonHareket = simdi;
    if (durum == BOS) gec(DOLU);
  }

  // 3) Işık: her turda oku, histerezisle karar ver
  int isik = analogRead(LDR);
  if (!karanlik && isik < KARANLIK_ALT) karanlik = true;
  if (karanlik && isik > AYDINLIK_UST) karanlik = false;

  // 4) Sıcaklık ve nem: iki saniyede bir
  if (simdi - sonOlcum >= OLCUM_ARALIGI) {
    sonOlcum = simdi;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    olculdu = true;
    sensorTamam = !isnan(t) && !isnan(h) && t > -40 && t < 80 && h >= 0 && h <= 100;
    if (sensorTamam) {
      sicaklik = t;
      nem = h;
    }
  }

  // 5) Durum geçişleri (zamana bağlı)
  if (durum == ISINMA && simdi >= ISINMA_SURESI) gec(BOS);
  if (durum == DOLU && simdi - sonHareket >= BOS_SURESI) gec(BOS);

  // 6) Fan: histerezis; sensör bozuksa ya da oda DOLU değilse kapalı
  if (durum != DOLU || !sensorTamam) {
    fan = false;
  } else if (sicaklik >= FAN_ACIK) {
    fan = true;
  } else if (sicaklik <= FAN_KAPAT) {
    fan = false;
  }

  // 7) Çıkışlar
  digitalWrite(LAMBA, (durum == DOLU && karanlik) ? HIGH : LOW);
  digitalWrite(ROLE, fan ? HIGH : LOW);

  // 8) Ekran ve arka ışık: BOS iken ışık kapalı (tasarruf)
  bool arkaIstenen = (durum != BOS);
  if (arkaIstenen != arkaIsik) {
    arkaIsik = arkaIstenen;
    if (arkaIsik) lcd.backlight(); else lcd.noBacklight();
  }
  if (simdi - sonEkran >= EKRAN_ARALIGI) {
    sonEkran = simdi;
    ekranYaz();
  }
}
```

### How does it work?
1. `loop` never uses `delay`; every job keeps its own time with `millis()` (lesson 27). This way the button, the PIR and the light are watched on every pass, while the DHT is read every two seconds.
2. On every pass, first the **inputs** (button, PIR, LDR, DHT) are worked out, then the **state changes**, then the **outputs** (lamp, relay, screen). The outputs are a direct result of the state.
3. The PIR is only taken into account in the BOS and DOLU states: the fake motion the PIR gives while warming up is ignored (lesson 41). The PIR is also ignored while KAPALI.
4. The fan condition is written with the "safe side" spelt out: if the room is not DOLU or the sensor is invalid, `fan = false`. Otherwise the temperature is checked.
5. The DHT reading is checked with `isnan` and a range check (the "is the value sensible?" layer from lesson 74). If the sensor is broken, the last good value does not stay on the screen; `DHT HATA` is shown.
6. The LCD backlight is only updated when the state changes; this way the I2C line is not kept busy for nothing.

### Testing from end to end
In this section, try these in order in the lab; at each step, first guess for yourself what you expect. You change the part properties from the right panel while it runs:
1. Press ▶ and, within the first 2 s, switch the PIR's **Motion** property on and off: during warm-up the PIR output wobbles with interference, but the state should stay ISINMA and the lamp off. The bottom line of the LCD shows `ISINMA`.
2. After 3 s, set the LDR's **Light** property to 0.2 (dark). Switch the PIR's **Motion** property on and off: the state should become DOLU and the lamp should light.
3. Set the **Light** property to 0.9: the lamp should go off. Then set it to about 0.46 (neither dark nor light): the lamp should stay at its previous decision.
4. Set the DHT22's **Temperature** property to 29 °C: the fan LED (relay) should light within 2 s. Lower it to 27 °C: it should stay on. At 25 °C it should switch off. (The DHT22 is read at most once every 2 s; the response delay exists in the lab too.)
5. Let there be no motion for 8 s: the state is BOS; the lamp and the fan should switch off, and the LCD backlight should go out.
6. Press the button: KAPALI; trigger the PIR, and nothing should happen. Press it again: BOS. (The lab's button does not bounce; that is why the 50 ms margin in the code stays untested.)
7. Stop with ■, delete the DHT22's DATA wire, and start again with ▶. After 3 s, trigger the PIR: the fan should be off and the LCD should show `DHT HATA`; the lamp keeps working.

### Try it
- Make the difference between `FAN_ACIK` (fan on) and `FAN_KAPAT` (fan off) 0.5 °C: how often does the fan switch on and off?
- Run the fan if not only the temperature but also the humidity in the room is high (for example above 70%). Which section will you add it to?
- When leaving the BOS state, write "Hos geldin" (welcome) on the LCD, and have it cleared after 2 s (without blocking).
- Save `BOS_SURESI` to EEPROM and set it with the button.

### Common mistakes
- Not taking the PIR's warm-up time into account: at start-up the room is thought to be "occupied".
- Building the LDR divider the wrong way round: "dark" and "light" swap places.
- Using a single threshold and letting the lamp flicker.
- Reading the DHT22 more often than every two seconds.
- Leaving the fan on while the sensor is invalid.
- Using mains voltage with the relay: this is never, ever done in this project.
- Powering the fan from the board's 5 V pin: in a real circuit the board can reset; the lab does not show this (lesson 73).

## Discuss
Even if this project works perfectly in the lab, which three things would surprise you when you move it into a real room? (Things to think about: button bounce, analogue noise, the supply voltage and the PIR's real warm-up time.) Which safety measure would you add before really leaving the room and walking out?
