# Communication protocols: comparing UART, I2C and SPI
duration: 30

## Wonder
This week you talked to your Arduino in three different ways: with the computer over Serial, with the RTC and the LCD over I2C, and with the SD card over SPI. They all "carry data", but one uses two wires and another four; one talks to one device, another to dozens. Which one is faster? Which should you choose, and when? In this lesson you will find the speed of each one in numbers and compare them.

## Activity
### Circuit
No extra parts are needed in this lesson; in the lab we use only the Uno, and you type the programs into the editor and press ▶. The programs use **D4** as a "measurement window": they set D4 HIGH at the start of the job being measured and LOW at the end. We measure the time inside the program with `micros()`. (For information: in a real circuit, if an oscilloscope or a logic analyser were connected to D4, we would see the length of the same window from outside.) In the lab, the gap between windows that come one after another is very short, so D4 can look like one long HIGH; if you put a `delay(20)` between them, you see separate windows.

| Pin | Job |
|---|---|
| D4 | Measurement window |
| D0 (RX), D1 (TX) | UART |
| A4 (SDA), A5 (SCL) | I2C |
| D11 (MOSI), D12 (MISO), D13 (SCK), D10 (CS) | SPI |

On a real board, D0 and D1 are also used to talk to the computer over USB. If another device is connected to these pins, you can have trouble uploading a program or with the Serial Monitor. That is why you should avoid using D0 and D1 for anything else.

### UART: two wires, an agreed speed
**UART** (Serial) works with two lines: TX (send) from one end, RX (receive) at the other end. There is no shared clock line. That is why both sides have to choose the same **baud rate** (bits per second) in advance. A byte is sent like this: 1 start bit, 8 data bits, 1 stop bit. So one byte takes **10 bits**. The time of one bit is `1 / baud`.

Let's measure it. The program sends 100 `'U'` characters at three speeds. `'U'` (0x55) is a character whose bits keep changing, with the pattern "01010101", and it is easy to recognise when you watch the line. During sending, D4 stays HIGH. We measure the same time inside the program with `micros()`; on a real board, a device connected to D4 sees the same window too.

```cpp
// sketch: uart_hiz
const int PENCERE = 4;                        // ölçüm penceresi: yazma süresince HIGH
const int BAYT = 100;
const long HIZLAR[] = {9600, 19200, 38400};
unsigned long sureUs[3];

void setup() {
  pinMode(PENCERE, OUTPUT);

  for (int i = 0; i < 3; i++) {
    Serial.begin(HIZLAR[i]);
    Serial.flush();
    digitalWrite(PENCERE, HIGH);
    unsigned long t0 = micros();
    for (int k = 0; k < BAYT; k++) {
      Serial.write('U');
    }
    Serial.flush();                           // son bit çıkana kadar bekle
    sureUs[i] = micros() - t0;
    digitalWrite(PENCERE, LOW);
    Serial.end();
  }

  Serial.begin(9600);
  Serial.println();
  for (int i = 0; i < 3; i++) {
    Serial.print(HIZLAR[i]);
    Serial.print(" baud: bit suresi ");
    Serial.print(sureUs[i] / (BAYT * 10.0), 1);
    Serial.println(" us");
  }
}

void loop() {
}
```

On a real computer with the terminal at 9600, you would see meaningless characters on the screen during the 19200 and 38400 parts: the sending and receiving speeds were not the same. This is the nature of UART: the speed is agreed in advance. The lab's Serial monitor does not model the speed difference; the 100 `U` characters always look fine. At the end, the measurement table is printed at 9600.

The measurement result:

| Baud | Bit time (worked out: 1/baud) | Measured bit time | Bytes/s (baud ÷ 10) |
|---|---|---|---|
| 9600 | 104.2 µs | 104.4 µs | 960 |
| 19200 | 52.1 µs | 52.4 µs | 1920 |
| 38400 | 26.0 µs | 26.4 µs | 3840 |

The measured values are a little bigger than the calculation (less than 2 per cent). The small difference comes from the measurement method: `micros()` counts in 4 µs steps, and the loop and the work of queuing the bytes also go into the time. For 115200 baud the calculation gives 8.7 µs; we did not measure it.

### I2C: two wires, talking by address
**I2C** also works with two lines: SDA (data) and SCL (clock). The difference from UART is that it has a **clock line** and the devices are chosen **by address** (lesson 33). The RTC (0x68), the LCD (0x27) and other devices are connected together to the same two wires. You choose the speed of the clock line with `Wire.setClock()`. On the Arduino Uno, this speed is set with a divider written to a register called `TWBR`: `SCL = 16 MHz / (16 + 2 × TWBR × ön bölücü)` (where `ön bölücü` is the prescaler).

The program reads the default speed, then sets 100 kHz and 400 kHz and works out the frequency that comes from the register. One I2C byte takes 9 clock pulses (8 data bits + 1 acknowledge bit). An address byte and one data byte make 18 pulses in total; we turn this into a time too.

```cpp
// sketch: i2c_hiz
#include <Wire.h>

const long ISTENEN[] = {100000, 400000};

long sclHz() {
  int onbolucu[] = {1, 4, 16, 64};
  int p = onbolucu[TWSR & 0x03];
  return F_CPU / (16L + 2L * TWBR * p);
}

void rapor(const char* etiket) {
  Serial.print(etiket);
  Serial.print(": TWBR=");
  Serial.print(TWBR);
  Serial.print("  SCL=");
  Serial.print(sclHz());
  Serial.println(" Hz");
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  rapor("varsayilan");

  for (int i = 0; i < 2; i++) {
    Wire.setClock(ISTENEN[i]);
    rapor("setClock");
    // adres baytı + 1 veri baytı = 2 bayt = 18 saat darbesi
    Serial.print("  2 baytlik aktarim ~ ");
    Serial.print(18.0e6 / sclHz(), 0);
    Serial.println(" us");
  }
}

void loop() {
}
```

The result:

| Setting | TWBR | SCL frequency | 2-byte transfer (worked out) |
|---|---|---|---|
| Default (`Wire.begin`) | 72 | 100 kHz | 180 µs |
| `setClock(100000)` | 72 | 100 kHz | 180 µs |
| `setClock(400000)` | 12 | 400 kHz | 45 µs |

The start and stop conditions are not included in the time; the real transfer takes a little longer. These values were **worked out** from the settings read from the register; in a real circuit you would need to check them by measuring the SCL line with an oscilloscope or a logic analyser. To use the 400 kHz speed, every device on the line must support it; check the device's datasheet.

### SPI: four wires, very fast
**SPI** has three shared lines (SCK, MOSI, MISO) and a **CS** line for each device (lesson 67). Because there is a clock line, the speed is free, and much higher than I2C. On the Uno the highest SCK is half the processor clock: 16 MHz ÷ 2 = 8 MHz. You choose the speed in two ways: the old `SPI.setClockDivider(...)` or the new `SPISettings(hız, bitSırası, mod)` (speed, bit order, mode). With each setting, the program works out the real SCK frequency from the SPI registers (`SPCR`, `SPSR`).

```cpp
// sketch: spi_hiz
#include <SPI.h>

long sckHz() {
  const int bolen[] = {4, 16, 64, 128, 2, 8, 32, 64};
  int dizin = (SPCR & 0x03) | ((SPSR & 0x01) ? 4 : 0);   // SPR1:SPR0 ve SPI2X
  return F_CPU / bolen[dizin];
}

void rapor(const char* etiket) {
  Serial.print(etiket);
  Serial.print(" -> SCK=");
  Serial.print(sckHz());
  Serial.println(" Hz");
}

void setup() {
  Serial.begin(9600);
  SPI.begin();

  SPI.setClockDivider(SPI_CLOCK_DIV4);
  rapor("DIV4 ");
  SPI.setClockDivider(SPI_CLOCK_DIV16);
  rapor("DIV16");
  SPI.setClockDivider(SPI_CLOCK_DIV128);
  rapor("DIV128");

  const long istenen[] = {250000, 1000000, 3000000, 8000000, 20000000};
  for (int i = 0; i < 5; i++) {
    SPI.beginTransaction(SPISettings(istenen[i], MSBFIRST, SPI_MODE0));
    Serial.print("istenen ");
    Serial.print(istenen[i]);
    Serial.print(" Hz");
    rapor("");
    SPI.endTransaction();
  }
}

void loop() {
}
```

The result:

| Requested | SCK used |
|---|---|
| `SPI_CLOCK_DIV4` | 4 MHz |
| `SPI_CLOCK_DIV16` | 1 MHz |
| `SPI_CLOCK_DIV128` | 125 kHz |
| `SPISettings(250000, ...)` | 250 kHz |
| `SPISettings(1000000, ...)` | 1 MHz |
| `SPISettings(3000000, ...)` | **2 MHz** |
| `SPISettings(8000000, ...)` | 8 MHz |
| `SPISettings(20000000, ...)` | 8 MHz |

Notice: when you asked for 3 MHz, it dropped to 2 MHz. On the Uno, SCK can only be the processor clock divided by 2, 4, 8, ... (8, 4, 2, 1 MHz ...). `SPISettings` chooses the highest value that does not go above the speed you asked for. When 20 MHz is asked for, it can go up to 8 MHz at most.

A real SPI transfer is done with `SPI.transfer(değer)` (value); we did not need it in this program, because we were only reading the speed that was set.

### Put the three side by side
The table below combines the numbers you read in this lesson with general knowledge.

| | UART | I2C | SPI |
|---|---|---|---|
| Pins on the Uno | 2 (RX, TX) | 2 (SDA, SCL) | 3 shared (SCK, MOSI, MISO) + 1 CS for each device |
| Clock line | None (the speed is agreed in advance) | Yes | Yes |
| Speed read in this lesson | 9600-38400 baud | 100 kHz, 400 kHz | 125 kHz - 8 MHz |
| Bits per byte | 10 | 9 | 8 |
| Number of devices | Usually 2 ends (one to one) | Many devices on the same line, by address (7-bit address) | As many as there are CS pins |
| Distance (general knowledge) | Short at TTL level; for long distances, other electrical standards such as RS-485 | Short; as the cable gets longer, the line capacitance causes problems | Short; the higher the speed, the more the cable length matters |

How long does it take to carry 100 bytes? The times below were **worked out** from the bit counts above (start/stop overhead and addressing not included):

| Way | Calculation | Time |
|---|---|---|
| UART, 9600 baud | 100 × 10 bits ÷ 9600 | about 104 ms |
| UART, 38400 baud | 100 × 10 bits ÷ 38400 | about 26 ms |
| I2C, 100 kHz | 100 × 9 bits ÷ 100000 | 9 ms |
| I2C, 400 kHz | 100 × 9 bits ÷ 400000 | about 2.3 ms |
| SPI, 4 MHz | 100 × 8 bits ÷ 4000000 | 0.2 ms |
| SPI, 8 MHz | 100 × 8 bits ÷ 8000000 | 0.1 ms |

Your data logger will use all three: it writes rows to the computer with **UART**, reads/writes the RTC and the LCD with **I2C**, and writes a file to the SD card with **SPI**. The right way is different for each job: the clock and the screen carry little data, so I2C's two wires are enough. The SD card carries a lot of data and needs SPI's speed. And for talking to the computer, there is UART already.

### Try it
- In the `uart_hiz` program, set `BAYT` (bytes) to 200. Does the bit time change? Why should it not change? How does the length of the D4 window change?
- In the `i2c_hiz` program, change the value 100000 in the `ISTENEN` (requested) array to 50000. What does `TWBR` become, and how many µs does a 2-byte transfer take? (Work it out with the formula first, then compare with ▶.)
- In the `istenen` array in the `spi_hiz` program, write 500000 instead of 250000. Which SCK speed comes out? Work out what 16 MHz has been divided by.

### Common mistakes
- Choosing different baud rates at the two ends of a UART link: on a real connection, meaningless characters appear on the screen.
- Connecting TX to TX on a UART link: one end's TX must go to the other end's RX.
- Two devices on I2C using the same address (for example the RTC and the MPU6050, both 0x68).
- Raising the speed on the I2C line without checking that every device supports it.
- Forgetting the CS line on SPI, or making the CS of two devices LOW at the same time.
- Thinking the speed set on SPI is the speed you asked for: `SPISettings` uses the nearest value **below** the requested speed.
- Mixing up 3.3 V and 5 V levels: read the documentation of some SPI devices (such as the SD card).

## Discuss
You have four sensors, an LCD and an SD card in a room. Which one would you connect with which protocol? Why does I2C make more sense for the RTC and SPI for the SD card?
