# HC-SR04 ultrasonic distance sensor
slug: hcsr04
category: Sensor
summary: A distance sensor that reports the round-trip time of a sound wave as how long its ECHO pin stays HIGH; typical range 2-400 cm.

## Pins
- VCC: 5 V supply. Connects to the Uno's 5V pin.
- TRIG: Trigger input. A short (10 µs) HIGH pulse from the board starts a measurement.
- ECHO: Echo output. Stays HIGH until the sound goes out and comes back; the duration gives the distance.
- GND: Ground. Connects to the Uno's GND.

## How it works
The HC-SR04 has two cylinders on the front: one sends out **ultrasonic** sound (too high for human ears to hear, 40 kHz on this sensor), and the other listens for the echo. When the board gives TRIG a 10 µs HIGH pulse, the sensor sends out a burst of sound and raises the ECHO pin. When the sound hits an object and comes back, ECHO goes LOW again.

The sensor does not tell you the distance; it gives you a **time**. You measure the time in microseconds with `pulseIn(ECHO, HIGH, 30000)` and convert it:

`distance (cm) = time (µs) × 0.0343 / 2`

You divide by two because the time covers both the trip out and the trip back. Shortcut: about 58 µs = 1 cm.

**Advanced:** The speed of sound depends on temperature (about c = 331.3 + 0.606 × T m/s). Because the program assumes 343 m/s, it shows distances too large in the cold and too small in the heat; between 0 °C and 40 °C there is a difference of about 7 cm at 100 cm. The sensor looks at a cone-shaped area (typically about 15° in the datasheet). Slanted, soft or very thin surfaces weaken the echo or bounce it off to the side; that is why a median filter is used to remove outliers (lesson 38).

## Wiring in the lab
| From | To |
|---|---|
| HC-SR04 **VCC** | Uno **5V** |
| HC-SR04 **GND** | Uno **GND** |
| HC-SR04 **TRIG** | Uno **D9** |
| HC-SR04 **ECHO** | Uno **D10** |

The **Mesafe** (Distance) value in the properties panel (2-400 cm) is how far away the object in front of the sensor is, and it can be changed while the program is running. Outside this range the lab produces no echo, so `pulseIn` times out and returns 0. The lab sensor is perfect: it reads exactly what you type into Mesafe, the speed of sound is constant and there is no noise. TRIG and ECHO must be connected directly to Uno pins.

## Typical values
- Measuring range | 2-400 cm | The lab produces an echo in this range; for a real sensor, check the datasheet
- Sound frequency | 40 kHz | Inaudible
- Trigger pulse | 10 µs | HIGH time on TRIG
- Time / distance | ≈ 58 µs / cm | Round trip; the lab model uses 58.2 µs/cm
- Measuring angle | ≈ 15° | Typical datasheet value; cone-shaped
- Wait between measurements | ≈ 60 ms | Recommended so the previous echo does not mix with the new one

## Common mistakes
- **Not dividing the time by two.** The distance comes out twice as large.
- **Swapping TRIG and ECHO.** No measurement comes in; you always read 0.
- **Not giving `pulseIn` a timeout.** If no echo arrives, it waits for the default 1 second.
- **Taking a return value of 0 as 0 cm.** 0 means there was no echo.
- **Not connecting VCC or GND.** The sensor gets no power and does not respond when triggered.
- **Powering a servo or motor from the same weak 5 V line (real circuit).** The voltage dip spoils the measurement; use a separate supply and a common GND.
