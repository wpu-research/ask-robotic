# DHT11 and DHT22: temperature and humidity
duration: 25

## Wonder
A weather app says "temperature 24 degrees, humidity 60 per cent". Is the air in the room dry or muggy? Temperature alone cannot tell you; you need humidity too. One small sensor can measure both. And it does it over a single data wire. In this lesson you will read the DHT sensor, compare the two models by measuring, and learn how to stop your program from crashing when the sensor does not answer.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| DHT sensor | VCC → 5V, GND → GND, DATA → **D5** |

The **Type** property of the DHT part in the right panel can be DHT22 or DHT11; the **Temperature** and **Humidity** sliders set the air the sensor "measures", and you can change them while the program runs. The part in the lab is the 3-leg module; the pull-up resistor needed for the data line counts as being on the module.

Info note: You can also buy bare 4-leg DHT sensors; on those you need a resistor between DATA and VCC (its value is in the datasheet). The module in the lab does not need one.

### New ideas
- **Relative humidity:** Tells you what percentage of the most water vapour the air can hold at that temperature it is holding now. 0 % means very dry, 100 % means saturated.
- **Library:** You met this in lesson 34. The DHT sensor talks with its own communication rules; instead of writing them by hand, we use the `DHT sensor library` (Adafruit). You write `#include <DHT.h>` at the top of the sketch.
- **`isnan(x)`:** This asks "Is this number valid?". `isnan` stands for "is not a number" (NaN). If the library cannot read the sensor, it returns `NaN`. If you calculate with `NaN`, the result is `NaN` too, so check the reading with `isnan` **before you use it**.

### Program 1: temperature and humidity
```cpp
// sketch: dht_oku
#include <DHT.h>

#define DHT_PIN 5
#define DHT_TIP DHT22        // DHT11 kullanıyorsan burayı DHT11 yap

DHT dht(DHT_PIN, DHT_TIP);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);                          // okumalar arası en az 2 sn
  float nem = dht.readHumidity();
  float sicaklik = dht.readTemperature();   // santigrat

  if (isnan(nem) || isnan(sicaklik)) {
    Serial.println("Okuma hatasi");
    return;
  }

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 1);
  Serial.print(" C  Nem: ");
  Serial.print(nem, 1);
  Serial.println(" %");
}
```

### How does it work?
1. `DHT dht(DHT_PIN, DHT_TIP)` tells the library which pin the sensor is on and which model it is. If the model is wrong, the values make no sense.
2. `delay(2000)` was not chosen at random. DHT sensors are slow: you must wait at least 2 seconds between two readings. If you ask more often, the library usually gives you the previous value again.
3. `readHumidity()` returns the humidity in per cent, and `readTemperature()` returns the temperature in degrees Celsius.
4. `if (isnan(...))` sets up the error path. If the DATA wire is not connected or the sensor does not answer, the program prints `Okuma hatasi` (reading error) and moves on to the next round.

### Measure the difference between the DHT11 and the DHT22
Change one line in the program: `#define DHT_TIP DHT11`. Set the sensor part's **Type** property to DHT11 as well (stop with ■ first). With the Temperature slider at 23.5 °C and the Humidity slider at 55 %, we read this in the lab:

| Model | Serial output |
|---|---|
| DHT22 | `Sicaklik: 23.5 C  Nem: 55.0 %` |
| DHT11 | `Sicaklik: 24.0 C  Nem: 55.0 %` |

The DHT22 gives one digit after the decimal point, the DHT11 gives only whole numbers (23.5 was rounded to 24). But be careful: seeing decimals on the screen does **not** mean the sensor measures correctly. For how accurately the two models measure, what range they work in and how fast they measure, look at the datasheets of the real sensors.

### Program 2: non-blocking reading and behaviour with no sensor
`delay(2000)` stops the whole program for 2 seconds. Let's time the reading with `millis()`, which you learned in lesson 27. This version also stops showing the old value after 3 errors in a row and says `SENSOR YOK` (no sensor), because showing an old temperature for hours as if it were up to date is misleading.

```cpp
// sketch: dht_millis
#include <DHT.h>

DHT dht(5, DHT22);

const unsigned long ARALIK = 2000;   // ms
unsigned long sonOlcum = 0;

float sicaklik = NAN;                // NAN: henüz geçerli değer yok
float nem = NAN;
int ardisikHata = 0;

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonOlcum >= ARALIK) {
    sonOlcum = simdi;

    float n = dht.readHumidity();
    float s = dht.readTemperature();

    if (isnan(n) || isnan(s)) {
      ardisikHata++;
      if (ardisikHata >= 3) {        // eski değeri artık gösterme
        sicaklik = NAN;
        nem = NAN;
      }
    } else {
      sicaklik = s;
      nem = n;
      ardisikHata = 0;
    }

    if (isnan(sicaklik)) {
      Serial.print("SENSOR YOK  Ardisik hata: ");
      Serial.println(ardisikHata);
    } else {
      Serial.print("T=");
      Serial.print(sicaklik, 1);
      Serial.print(" N=");
      Serial.println(nem, 1);
    }
  }
  // burada başka işler de yapılabilir; loop() beklemez
}
```

We also ran this program **without** the DATA wire (to delete the wire, press ■ first, select the wire and press **Delete**). The lab gives the warning "DHT sensor DATA is not connected: the sensor won’t work." Because there had not been a single valid reading yet, the lines `SENSOR YOK  Ardisik hata: 1`, `... 2`, `... 3` appeared from the first round on; the program did not crash, and `loop()` kept running. When you draw the DATA wire again and press ▶, the `T=...  N=...` lines begin. If the sensor stops answering after reading well for a while, the code keeps showing the last valid value for the first two errors and gives up at the third.

### Try it
- In the `dht_oku` program, change the `DHT_TIP` line to DHT11, set the sensor's **Type** property to DHT11 too, and compare with the table. While it runs, move the temperature slider slowly: how does the DHT11 output change step by step?
- Change `delay(2000)` to 500. Do the values in the serial output change every round, or is the same value repeated a few times?
- In the `dht_millis` program, stop with ■, delete the DATA wire and press ▶. On which line do you see `SENSOR YOK`? What happens when you draw the wire again?

### Common mistakes
- Leaving out the `isnan` check: if the reading fails, you calculate with `NaN` and see `nan` on the screen.
- Writing the wrong model (calling a DHT11 sensor `DHT22`): the values come out strange.
- Trying to read more often than every 2 seconds.
- Reading straight after powering up: give the sensor a little time after it switches on (for real sensors, look up the time in the datasheet).
- Forgetting the DATA wire or (on a bare sensor) the pull-up resistor: you keep seeing `Okuma hatasi`.

## Discuss
The DHT22 shows a digit after the decimal point and the DHT11 does not. So does showing more digits prove that the measurement is more accurate? Explain the difference between a computer or a screen "showing many digits" and "showing the right value" with an example.
