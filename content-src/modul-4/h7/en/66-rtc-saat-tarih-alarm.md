# RTC: time, date, alarm
duration: 25

## Wonder
`millis()` starts counting from zero when the board switches on, and forgets everything when you pull the plug. You cannot use it to answer the question "what time did the temperature rise last night?". You need a clock that knows the date and time and keeps running even when unplugged, like a wall clock. This job is done by an **RTC** (Real Time Clock) module. In this lesson you will connect it to the Arduino in the lab, read the time, set it and write your own alarm.

## Activity
### Circuit
Pick the parts from the **Add part** menu in the lab and connect the pins by drawing wires.

| Part | Connection |
|---|---|
| RTC | SDA → Uno **A4**, SCL → Uno **A5**, VCC → **5V**, GND → **GND** |
| Resistor (330 Ω from the properties panel) + LED | Uno **D13** → resistor **1**; resistor **2** → LED **A**; LED **K** → **GND** (alarm program only) |
| Buzzer (Type: Passive) | **+** → Uno **D8**; **-** → **GND** (alarm program only) |

The RTC module talks over I2C (lesson 33) and its address is **0x68**. In the lab we connect the RTC to 5V; the supply range of real modules changes from model to model, so check the datasheet of the module you use.

**For information:** A real module has a **backup battery holder**. When the main power is cut, this battery keeps the clock running; if there is no battery, or it is flat, the time is forgotten when the power is cut and has to be set again. The lab does not model the battery or power cuts: every time you press ▶ (or after ↺ Reset), the RTC starts from **2026-01-01 00:00:00** and `rtc.lostPower()` always returns `false`. You set the clock to any value you want with `rtc.adjust()` (below).

Watch out: the MPU6050 acceleration sensor also uses address 0x68 by default. If you connect both to the same I2C line, they clash. (If the MPU6050's AD0 pin is connected to 5V, its address becomes 0x69 and the clash ends; in the lab, the part's "I2C address" property lets you choose this.) In this course we will not use the MPU6050 and the RTC in the same circuit.

### Program: read the time
We use **RTClib** as the library. For the DS3231, the class name is `RTC_DS3231`.

```cpp
// sketch: rtc_saat
#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;
unsigned long sonOkuma = 0;

void iki(int n) {                     // 5 -> "05"
  if (n < 10) Serial.print('0');
  Serial.print(n);
}

void setup() {
  Serial.begin(9600);
  if (!rtc.begin()) {                 // modül I2C hattında yoksa false
    Serial.println("RTC bulunamadi");
    while (true) {}
  }
  if (rtc.lostPower()) {              // saat durmuşsa (pil bitti, hiç kurulmadı)
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
}

void loop() {
  if (millis() - sonOkuma >= 1000) {
    sonOkuma = millis();
    DateTime t = rtc.now();
    Serial.print(t.year()); Serial.print('-'); iki(t.month()); Serial.print('-'); iki(t.day());
    Serial.print(' ');
    iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());
    Serial.println();
  }
}
```

`rtc.now()` gives the current time as a `DateTime` object. You get its parts with `year()`, `month()`, `day()`, `hour()`, `minute()`, `second()`. The `iki()` (two) function, which puts a 0 in front of single-digit numbers, prints "08:05:03" instead of "8:5:3".

`rtc.lostPower()` reads a flag kept by the chip: if the oscillator stopped, the flag is raised. Then we set the time with `DateTime(F(__DATE__), F(__TIME__))`. `__DATE__` and `__TIME__` are the date and time of the moment you **compiled** the program. On a real board, uploading takes a few seconds, so the time that is set is that much behind. In the lab `lostPower()` is always `false`, so this line does not run; the clock starts from 2026-01-01 00:00:00, and your output runs `2026-01-01 00:00:01`, `2026-01-01 00:00:02` ...

### Program: set the time yourself
You set the clock to any value you want with `rtc.adjust()`. The program below first reads the time, then sets it to 5 seconds before midnight, then reads it again. You also see the change of day and the day of the week.

```cpp
// sketch: rtc_ayarla
#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;
const char* GUNLER[] = {"Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"};
unsigned long sonOkuma = 0;

void iki(int n) {
  if (n < 10) Serial.print('0');
  Serial.print(n);
}

void yaz(DateTime t) {
  Serial.print(t.year()); Serial.print('-'); iki(t.month()); Serial.print('-'); iki(t.day());
  Serial.print(' ');
  iki(t.hour()); Serial.print(':'); iki(t.minute()); Serial.print(':'); iki(t.second());
  Serial.print(' ');
  Serial.println(GUNLER[t.dayOfTheWeek()]);   // 0 = Pazar
}

void setup() {
  Serial.begin(9600);
  rtc.begin();

  Serial.print("Once:  ");
  yaz(rtc.now());

  rtc.adjust(DateTime(2026, 3, 14, 23, 59, 55));   // yıl, ay, gün, saat, dakika, saniye

  Serial.print("Sonra: ");
  yaz(rtc.now());
}

void loop() {
  if (millis() - sonOkuma >= 1000) {
    sonOkuma = millis();
    yaz(rtc.now());
  }
}
```

The start of the output looks like this: on the `Once:` (before) line you see the RTC's old value (in the lab `2026-01-01 00:00:00 Persembe`, Thursday), and on the `Sonra:` (after) line `2026-03-14 23:59:55 Cumartesi` (Saturday). A few seconds later the time goes from 23:59:59 to `2026-03-15 00:00:00`, and the day name becomes Pazar (Sunday). The RTC knows the calendar too: at the end of a month it changes the day by itself. It does not know about summer time or time zones; it only counts the numbers you give it.

### Program: our own alarm
Some RTC chips have a hardware alarm, but the DS1307 does not. We choose a way that works on both chips: read the time at regular intervals and compare it with the alarm time. We do the reading every quarter of a second with `millis()` (lesson 27); there is no `delay`, so `loop()` can look after other jobs too.

```cpp
// sketch: rtc_alarm
#include <Wire.h>
#include <RTClib.h>

const int LED = 13;
const int BUZZER = 8;
const int ALARM_SAAT = 7;
const int ALARM_DAKIKA = 30;
const unsigned long KONTROL_ARALIGI = 250;   // ms: RTC'ye çeyrek saniyede bir bak
const unsigned long ALARM_SURESI = 5000;     // ms: alarm 5 saniye çalsın

RTC_DS3231 rtc;
unsigned long sonKontrol = 0;
unsigned long alarmBasla = 0;
bool alarmCaliyor = false;
int sonTetikGunu = -1;                       // alarmın son çaldığı ayın günü

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
  rtc.begin();
  rtc.adjust(DateTime(2026, 3, 14, 7, 29, 55));   // gösteri için: alarmdan 5 sn önce
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonKontrol >= KONTROL_ARALIGI) {
    sonKontrol = simdi;
    DateTime t = rtc.now();
    bool saatGeldi = (t.hour() == ALARM_SAAT && t.minute() == ALARM_DAKIKA);
    if (saatGeldi && !alarmCaliyor && t.day() != sonTetikGunu) {
      sonTetikGunu = t.day();
      alarmCaliyor = true;
      alarmBasla = simdi;
      digitalWrite(LED, HIGH);
      tone(BUZZER, 1000);
      Serial.println("ALARM 07:30");
    }
  }

  if (alarmCaliyor && simdi - alarmBasla >= ALARM_SURESI) {
    alarmCaliyor = false;
    digitalWrite(LED, LOW);
    noTone(BUZZER);
  }
}
```

When the program starts, it sets the clock to 07:29:55, so the alarm goes off 5 seconds later: the LED lights, a 1000 Hz tone starts on the buzzer pin (D8), and the Serial monitor shows `ALARM 07:30`. In a real alarm you would delete the `rtc.adjust` line inside `setup()`.

### The difference from the DS1307
There are two common RTC chips on the market. Both use address **0x68** on I2C and are read in the same way with RTClib. The RTC part in the lab is a single type; you can also run DS1307 code with this part.

| | DS3231 | DS1307 |
|---|---|---|
| RTClib class | `RTC_DS3231` | `RTC_DS1307` |
| Clock crystal | Inside the chip, corrects itself for temperature (temperature-compensated) | A crystal fitted outside; affected by temperature |
| Accuracy | Usually clearly better than the DS1307; check the datasheet for the exact value | Drifts more |
| Alarm | Has a hardware alarm | None |
| "Has the clock stopped?" | `lostPower()` | `isrunning()` |

To switch to the DS1307, you only change the class name and this check in the code:

```cpp
// sketch: rtc_ds1307
#include <Wire.h>
#include <RTClib.h>

RTC_DS1307 rtc;                              // tek fark: sınıf adı
unsigned long sonOkuma = 0;

void setup() {
  Serial.begin(9600);
  rtc.begin();
  if (!rtc.isrunning()) {                    // DS1307'de "saat çalışıyor mu?" kontrolü
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
}

void loop() {
  if (millis() - sonOkuma >= 1000) {
    sonOkuma = millis();
    Serial.println(rtc.now().timestamp());   // ISO 8601: 2026-03-14T08:30:01
  }
}
```

`timestamp()` gives the time as a single piece of text: year-month-dayThour:minute:second. You will see why this format is good in lesson 68.

### How does it work?
1. The RTC chip counts the seconds with its own crystal and keeps the date. The Arduino just asks it over I2C.
2. `rtc.now()` reads the chip's registers and gives you a `DateTime`. Every call causes I2C traffic, so looking a few times a second inside `loop()` is enough.
3. `rtc.adjust()` changes the chip's time. Thanks to the battery, the chip keeps this value even when the power is cut.
4. The alarm is a comparison of the time read from the RTC with the target time. `sonTetikGunu` (day of last trigger) stops the alarm from going off again and again during the same minute, and lets it go off again the next day.

### Try it
- In the `rtc_ayarla` program, set the date to `DateTime(2027, 2, 28, 23, 59, 55)`. After midnight, what date and day name come out? Why? (2027 is not a leap year.)
- In the `rtc_alarm` program, reduce the alarm time to 2 seconds, then change the alarm so that it only goes off on weekdays (Monday-Friday). Hint: `t.dayOfTheWeek()` must be between 1 and 5.
- Run the `rtc_saat` program, wait 10 seconds, stop it with ■ and press ▶ again. Where does the clock start from? On a real module, what would the result be with the backup battery fitted, and without it?

### Common mistakes
- Putting the line `rtc.adjust(DateTime(F(__DATE__), F(__TIME__)))` in `setup()` without a condition: every time the board switches on, the time goes back to the moment of compiling. Only set it if `lostPower()` is true.
- Connecting the MPU6050 and the RTC on the same line: both use 0x68.
- Trying to keep the time with `millis()` and thinking the RTC is unnecessary: `millis()` resets when the power is cut; the RTC keeps going.
- Writing the alarm with a `t.second() == 0` check and reading the RTC rarely: you miss that second. Keep the reading interval shorter than 1 second and use a "has it gone off today?" flag.
- Connecting SDA and SCL the wrong way round, or leaving VCC/GND unconnected: the program prints "RTC bulunamadi" (RTC not found).

## Discuss
If you made a school bell or a medicine reminder, would you link the alarm to the Arduino's `millis()` clock or to the RTC? What does each of them do when the power goes off and comes back?
