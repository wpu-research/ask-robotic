# DHT11 / DHT22 temperature and humidity sensor
slug: dht
category: Sensor
summary: A sensor that reports temperature and relative humidity over a single data line. The DHT22 gives results with decimals, the DHT11 gives whole numbers.

## Pins
- VCC: Supply lead. Connected to 5V.
- DATA: Data lead. Connected to one of the Uno's digital pins (D5 in the lessons).
- GND: Ground lead. Connected to GND.

## How it works
The DHT sensor measures temperature and **relative humidity** and sends both digitally over **a single data line**. Relative humidity tells you what percentage of the maximum water vapour the air could hold at that temperature it is actually holding. The sensor is slow: you need to wait **at least 2 seconds** between two readings.

The program uses the `DHT.h` library: you set it up with `DHT dht(pin, model)`, `readTemperature()` gives degrees Celsius, and `readHumidity()` gives a percentage. If a reading fails it returns `NaN`; the value should be checked with `isnan()`.

**Advanced:** Bare 4-pin DHT sensors need a pull-up resistor between the data lead and VCC. On the 3-pin module in the lab, this resistor is on the board. Check the datasheet for the measurement range and accuracy of a real sensor.

## Wiring in the lab
| From | To |
|---|---|
| DHT **VCC** | Uno **5V** |
| DHT **GND** | Uno **GND** |
| DHT **DATA** | Uno **D5** |

The properties panel has **Tür** (Type: DHT11 or DHT22), **Sıcaklık** (Temperature, -40 to 80 °C) and **Nem** (Humidity, 0 to 100 %); temperature and humidity can be changed while the program is running. If the DATA lead is not connected, the lab shows a warning and the sensor does not work.

## Typical values
- Reading interval | at least 2 s | Reading more often repeats the old value
- DHT22 resolution | 1 decimal place | In the lab, a value of 23.5 °C prints as "23.5"
- DHT11 resolution | whole number | In the lab, a value of 23.5 °C prints as "24.0"
- Data pin | D5 | The standard in this site's lessons
- If the reading fails | NaN | Caught with isnan()

## Common mistakes
- **Not adding an `isnan` check.** When a reading fails, `nan` appears on the screen.
- **Writing the wrong model.** Calling a DHT11 sensor `DHT22` produces meaningless values.
- **Reading more often than every 2 seconds.** The sensor cannot keep up and the same value repeats.
- **Forgetting the DATA wire.** The program keeps printing "Okuma hatasi" (Read error).
- **Mistaking the number of digits for accuracy.** The fact that the DHT22 shows more digits does not always prove that it is more accurate.
