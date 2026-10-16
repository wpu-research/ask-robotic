# BMP280: pressure and altitude (I2C)
duration: 25

## Wonder
How do smartwatches and drones know which floor they are on or how high they have climbed? By looking at the weight of the air. The higher you go, the less air there is above you, and the air pressure drops. That is why a pressure sensor is also a height meter. In this lesson you will read the pressure with the BMP280, calculate the altitude from the pressure and see why the "sea-level pressure" setting matters.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| BMP280 | VCC → 5V, GND → GND |
| | SDA → **A4**, SCL → **A5** |

The BMP280 talks over I2C, which you learned in lesson 33. Its address is **0x76** or **0x77**. In the lab, when you select the part you see the **I2C address** property in the right panel (default 0x76); if the sensor does not work, this address and the address in your code must be the same. If you are not sure, run the address scanner program from lesson 33. The right panel also has **Temperature** and **Pressure** (hPa) sliders; you can change them while the program runs.

Info note: In the real world some bare BMP280 modules want 3.3 V only (the lab powers it from 5V or 3V3); look at the datasheet when you connect a real module. On real modules the address is chosen with the SDO leg. A sister sensor called the BME280 looks the same but also measures humidity; the BMP280 library may not recognise it.

### New ideas
- **Unit of pressure:** The library gives the pressure in **pascals (Pa)**. Weather reports use **hPa** (hectopascals): 1 hPa = 100 Pa. Standard pressure at sea level is about 101 325 Pa, that is **1013.25 hPa**.
- **Altitude:** The height of where you are above sea level (in metres).
- **Altitude formula:** A common approximate formula for working out height from pressure (`rakım` means altitude):

`rakım = 44330 · (1 − (P / P0) ^ (1 / 5,255))`

Here `P` is the pressure you measure and `P0` is **the current pressure at sea level**. Both must be in the same unit (both hPa or both Pa). The formula is based on the standard atmosphere assumption, so it gives a good result for differences of a few hundred metres and an approximate one very high up.

### Program 1: pressure, temperature and the library's altitude
```cpp
// sketch: bmp_oku
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
bool bmpHazir = false;

void setup() {
  Serial.begin(9600);
  bmpHazir = bmp.begin(0x76);          // modülün adresi 0x77 ise burayı değiştir
  if (!bmpHazir) {
    Serial.println("BMP280 bulunamadi");
  }
}

void loop() {
  delay(1000);
  if (!bmpHazir) {
    return;                            // sensör yoksa okuma yapma
  }
  float sicaklik = bmp.readTemperature();         // santigrat
  float hpa = bmp.readPressure() / 100.0;         // Pa -> hPa
  float rakim = bmp.readAltitude(1013.25);        // P0 hPa cinsinden

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 1);
  Serial.print(" C  Basinc: ");
  Serial.print(hpa, 1);
  Serial.print(" hPa  Rakim: ");
  Serial.print(rakim, 1);
  Serial.println(" m");
}
```

### How does it work?
1. `bmp.begin(0x76)` looks for the sensor at its address and sets it up. The library's default address is 0x77. So if you call `bmp.begin()` without a parameter on a 0x76 module, the sensor is not found. We tried this in the lab too: when we set the BMP280's address to 0x77, `begin(0x76)` printed `BMP280 bulunamadi` (BMP280 not found), while `begin()` without a parameter found the sensor.
2. `readPressure()` gives Pa. For hPa you divide by 100.
3. `readAltitude(1013.25)` works out the formula above for you. The parameter is the sea-level pressure `P0`, given in **hPa**.
4. The `bmpHazir` (BMP ready) flag sets up the error path: if the sensor is not found, the program prints `BMP280 bulunamadi` and never tries to read.

### Program 2: work out the formula yourself
Instead of trusting the library's function, write the formula yourself too; put the two results side by side and compare.

```cpp
// sketch: bmp_rakim_formul
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
const float P0_HPA = 1013.25;          // deniz seviyesi basinci, hPa

float rakimHesapla(float pHpa, float p0Hpa) {
  return 44330.0 * (1.0 - pow(pHpa / p0Hpa, 1.0 / 5.255));
}

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 bulunamadi");
  }
}

void loop() {
  delay(1000);
  float hpa = bmp.readPressure() / 100.0;
  Serial.print("Basinc: ");
  Serial.print(hpa, 1);
  Serial.print(" hPa  Formul: ");
  Serial.print(rakimHesapla(hpa, P0_HPA), 1);
  Serial.print(" m  Kutuphane: ");
  Serial.print(bmp.readAltitude(P0_HPA), 1);
  Serial.println(" m");
}
```

We moved the BMP280's **Pressure** slider to these values in turn and measured this in the lab (P0 = 1013.25 hPa):

| Pressure on the slider | On screen | Formula | Library |
|---|---|---|---|
| 1013.25 hPa | 1013.2 hPa | 0.0 m | 0.0 m |
| 954.5 hPa | 954.5 hPa | 501.0 m | 501.0 m |
| 898.75 hPa | 898.8 hPa | 1000.1 m | 1000.1 m |

We chose these pressures by working out the formula by hand: about 954.5 hPa gives 500 m, and about 898.75 hPa gives 1000 m. Your formula and the library gave the same result (the 1013.2 on screen is because the sensor prints the pressure rounded to 0.1 hPa). The two methods give the same result; the library uses the same formula too.

### The P0 setting: why does it matter?
The pressure at sea level is not fixed; it changes with the weather. A P0 of 1013 hPa today can be 1003 hPa tomorrow. If you give the wrong `P0` in the formula, **the altitude of where you are drifts**. We measured the size of this drift in the lab: with the Pressure slider at 1000 hPa, lowering `P0` from 1013.25 to 1003.25 dropped the altitude from 110.9 m to 27.4 m; a difference of about 84 m. So near sea level, **1 hPa is about 8 m**.

That is why there are two ways to use it:
- If you want the altitude as an absolute value, give that day's sea-level pressure (weather data) as `P0`.
- If you already know the real altitude, turn the formula around and find `P0` yourself:

`P0 = P / (1 − rakım / 44330) ^ 5,255`

```cpp
// sketch: bmp_p0_ayar
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;
const float BILINEN_RAKIM = 100.0;     // metre: bulundugun yerin gercek rakimi
float p0 = 1013.25;

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 bulunamadi");
    return;
  }
  float hpa = bmp.readPressure() / 100.0;
  p0 = hpa / pow(1.0 - BILINEN_RAKIM / 44330.0, 5.255);
  Serial.print("P0: ");
  Serial.print(p0, 1);
  Serial.println(" hPa");
}

void loop() {
  delay(1000);
  Serial.print("Rakim: ");
  Serial.print(bmp.readAltitude(p0), 1);
  Serial.println(" m");
}
```

This program does a one-time setting at start-up: it takes the current pressure as "the altitude is 100 m now". After that, if the pressure changes, the altitude changes. This is not a bug; the sensor cannot tell a change in height from a change in the weather. In the lab we did the setting at 1000 hPa (P0 = 1011.9 hPa, altitude 100.0 m); when we pulled the pressure slider down to 999 hPa, the altitude became 108.4 m, so it rose by about 8 m. If the result does not stay steady when you measure the altitude in a real room, the reason is usually the air itself.

### Try it
- While `bmp_oku` runs, select the BMP280 and move the **Temperature** and **Pressure** sliders. How do the temperature, pressure and altitude in the serial output change?
- In the `bmp_rakim_formul` program, set `P0_HPA` to 1003.25. How far does the altitude drift? Does it match the "1 hPa is about 8 m" rule above?
- Set the sensor's I2C address to 0x77 (■ first) and run it with `bmp.begin(0x76)`. What does it print? Then change the code to `bmp.begin(0x77)`.
- Set `BILINEN_RAKIM` (known altitude) in the `bmp_p0_ayar` program to 300. Then, while it runs, lower the pressure slider by 2 hPa: how many metres did the altitude change? Why might the altitude reading change an hour later in a real place?

### Common mistakes
- Forgetting the address: getting `bulunamadi` (not found) with `begin()` (default 0x77) when the sensor is at 0x76.
- Mixing up Pa and hPa: `readAltitude` expects hPa. If you write `readAltitude(101325)`, the result is very wrong.
- Connecting SDA and SCL the wrong way round: the sensor is never found. The scanner program from lesson 33 helps.
- Carrying on reading when the sensor is not found: it prints meaningless numbers.
- Treating the altitude as "exact": when the weather changes, `P0` changes too. For real measurement accuracy, look at the datasheet.

## Discuss
A drone uses the altitude from the sensor to hold its height. If the altitude reading drifts when the weather changes, how does that affect the drone's behaviour? To answer the question "How much higher have I climbed since now?", what value would you use instead of `P0`?
