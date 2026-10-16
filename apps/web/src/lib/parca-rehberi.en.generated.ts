// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/parcalar/en/ · Komut: node tools/content/build.mjs parcalar
import type { ComponentGuideText } from './parca-rehberi-types'

export const parcalarEn: Record<string, ComponentGuideText> = {
  "arduino-uno": {
    "title": "Arduino Uno",
    "category": "Board",
    "summary": "A development board with an ATmega328P microcontroller. It runs your program and uses its pins to drive and read the circuit.",
    "pins": [
      {
        "name": "D0",
        "description": "Digital pin 0 (shared with serial RX; not used for LEDs/buttons in the lessons)"
      },
      {
        "name": "D1",
        "description": "Digital pin 1 (shared with serial TX)"
      },
      {
        "name": "D2",
        "description": "Digital pin 2. The first button input on this site"
      },
      {
        "name": "D3",
        "description": "Digital pin 3 (PWM). The second button input on this site"
      },
      {
        "name": "D4",
        "description": "Digital pin 4"
      },
      {
        "name": "D5",
        "description": "Digital pin 5 (PWM)"
      },
      {
        "name": "D6",
        "description": "Digital pin 6 (PWM)"
      },
      {
        "name": "D7",
        "description": "Digital pin 7"
      },
      {
        "name": "D8",
        "description": "Digital pin 8. The buzzer on this site"
      },
      {
        "name": "D9",
        "description": "Digital pin 9 (PWM). Servo/RGB"
      },
      {
        "name": "D10",
        "description": "Digital pin 10 (PWM)"
      },
      {
        "name": "D11",
        "description": "Digital pin 11 (PWM)"
      },
      {
        "name": "D12",
        "description": "Digital pin 12"
      },
      {
        "name": "D13",
        "description": "Digital pin 13. Also connected to the board's built-in L LED"
      },
      {
        "name": "A0",
        "description": "Analog input 0 (reads 0-5 V). The potentiometer on this site"
      },
      {
        "name": "A1",
        "description": "Analog input 1. The LDR on this site"
      },
      {
        "name": "A2",
        "description": "Analog input 2. The NTC on this site"
      },
      {
        "name": "A3",
        "description": "Analog input 3"
      },
      {
        "name": "A4",
        "description": "Analog input 4 (I2C SDA)"
      },
      {
        "name": "A5",
        "description": "Analog input 5 (I2C SCL)"
      },
      {
        "name": "5V",
        "description": "5 volt supply output"
      },
      {
        "name": "3V3",
        "description": "3.3 volt supply output"
      },
      {
        "name": "GND",
        "description": "Ground (0 V)"
      },
      {
        "name": "GND2",
        "description": "Ground (0 V); same node as GND"
      },
      {
        "name": "GND3",
        "description": "Ground (0 V); same node as GND"
      },
      {
        "name": "VIN",
        "description": "External supply input"
      }
    ],
    "howItWorksMd": "The Arduino Uno is a board built around the **ATmega328P** microcontroller. The program (sketch) is stored in the chip's **flash** memory; when power comes on, `setup()` runs once, then `loop()` runs over and over.\n\nMain specs: 16 MHz clock, 32 KB flash (program), 2 KB SRAM (working memory), 1 KB EEPROM (persistent data).\n\n**Digital pins (D0-D13)** are always in one of two states: HIGH (≈ 5 V) or LOW (0 V). You make them outputs or inputs with `pinMode`. **Analog inputs (A0-A5)** turn a voltage between 0 and 5 V into a number from 0 to 1023 using a 10-bit ADC. Pins marked **PWM** (D3, D5, D6, D9, D10, D11) give an \"adjustable\" output from 0 to 255 with `analogWrite`.\n\nPin current is limited: the recommended maximum current per pin is about 20 mA, and the absolute limit is 40 mA. The lab shows a warning above 40 mA. In the model, an output pin drives through an internal resistance of about 25 Ω.",
    "wiringMd": "When you open the lab, the Uno is already on the canvas. The lab automatically powers the Uno's **5V**, **3V3** and **GND** pins and uploads the program for you: ▶ **Derle ve çalıştır** (Compile and run), ■ stops, ↺ starts over (like the Reset button on a real board).\n\nYou connect the leads of the parts by drawing wires to the pin names on the Uno (for example resistor **1** → **D13**). **GND, GND2 and GND3** are the same node; it makes no difference which one you use.",
    "typicalValues": [
      {
        "label": "Logic voltage",
        "value": "5 V",
        "note": "HIGH ≈ 5 V, LOW ≈ 0 V"
      },
      {
        "label": "Digital input threshold",
        "value": "≈ 2.5 V",
        "note": "Above it reads HIGH, below it LOW (lab model)"
      },
      {
        "label": "Pin current (recommended)",
        "value": "≤ 20 mA",
        "note": "Absolute limit 40 mA"
      },
      {
        "label": "ADC resolution",
        "value": "10 bit",
        "note": "0-1023, step ≈ 4.9 mV"
      },
      {
        "label": "INPUT_PULLUP resistance",
        "value": "≈ 35 kΩ",
        "note": "Lab model"
      },
      {
        "label": "Clock",
        "value": "16 MHz",
        "note": "-"
      },
      {
        "label": "Memories",
        "value": "32 KB flash, 2 KB SRAM, 1 KB EEPROM",
        "note": "-"
      }
    ],
    "commonMistakesMd": "- **Mixing up `A0` and `0`.** `A0` is an analog input, `0` is a digital pin.\n- **Using D0 and D1 for parts.** These pins are shared with serial communication; in the lessons, start from D2 for LEDs/buttons.\n- **Forgetting GND.** The circuit is not complete.\n- **Drawing too much current from a pin.** Do not connect motors, relays or other large loads directly to a pin.\n- **Connecting two outputs to one pin at the same time.** If one drives HIGH and the other LOW, you get a short circuit.\n- **Forgetting to write `pinMode`.** The pin does not become an output; the LED glows very dimly or not at all."
  },
  "bmp280": {
    "title": "BMP280 pressure sensor",
    "category": "Sensor",
    "summary": "A sensor that reports air pressure and temperature over I2C. Altitude can be calculated from the pressure.",
    "pins": [
      {
        "name": "VCC",
        "description": "Supply lead. Connected to 5V in the lab."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connected to GND."
      },
      {
        "name": "SDA",
        "description": "I2C data line. Goes to the Uno's A4 pin."
      },
      {
        "name": "SCL",
        "description": "I2C clock line. Goes to the Uno's A5 pin."
      }
    ],
    "howItWorksMd": "The BMP280 measures air pressure. As you go higher there is less air above you, so the pressure drops; that is why **altitude** can be calculated from pressure. The sensor sits on the I2C bus at address **0x76** or **0x77**. It can share the same two wires (SDA and SCL) with other I2C devices that have different addresses.\n\nIn the `Adafruit_BMP280` library, `bmp.begin(0x76)` looks for the sensor at that address; the library's default address is 0x77. `readPressure()` returns the pressure in **Pa**, and `readTemperature()` returns the temperature in degrees Celsius. `readAltitude(P0)` calculates the altitude and expects the sea-level pressure P0 in **hPa**.\n\n**Advanced:** The altitude formula `44330 × (1 − (P / P0) ^ (1 / 5.255))` is based on the standard atmosphere assumption. Because P0 changes with the weather, the altitude reading drifts too; near sea level, 1 hPa is about 8 m. Check the datasheet for the supply voltage of a real module.",
    "wiringMd": "| From | To |\n|---|---|\n| BMP280 **VCC** | Uno **5V** |\n| BMP280 **GND** | Uno **GND** |\n| BMP280 **SDA** | Uno **A4** |\n| BMP280 **SCL** | Uno **A5** |\n\nThe properties panel has **Sıcaklık** (Temperature, -40 to 85 °C), **Basınç** (Pressure, 300 to 1100 hPa) and **I2C adresi** (I2C address, 0x76 or 0x77). Temperature and pressure can be changed while the program is running. The address in your code must match the address in the properties panel.",
    "typicalValues": [
      {
        "label": "Standard pressure at sea level",
        "value": "1013.25 hPa",
        "note": "101 325 Pa"
      },
      {
        "label": "I2C address",
        "value": "0x76 (default)",
        "note": "0x77 can also be selected in the lab"
      },
      {
        "label": "Pressure 954.5 hPa",
        "value": "≈ 500 m",
        "note": "For P0 = 1013.25 hPa"
      },
      {
        "label": "Pressure 898.75 hPa",
        "value": "≈ 1000 m",
        "note": "For P0 = 1013.25 hPa"
      },
      {
        "label": "1 hPa change",
        "value": "≈ 8 m",
        "note": "Near sea level"
      }
    ],
    "commonMistakesMd": "- **Forgetting the address.** Getting a \"not found\" result with `begin()` without a parameter while the sensor is at 0x76.\n- **Mixing up Pa and hPa.** If you write `readAltitude(101325)`, the altitude comes out very wrong.\n- **Swapping SDA and SCL.** The sensor is not found at all.\n- **Not checking the result of `begin`.** Without a sensor, you read meaningless numbers.\n- **Treating the altitude as exact.** When the weather changes, P0 changes and the altitude drifts even though you have not moved."
  },
  "buton": {
    "title": "Push button",
    "category": "Input",
    "summary": "A switch that connects its two leads when pressed. The board reads the button's state through an input pin.",
    "pins": [
      {
        "name": "A",
        "description": "First lead. Connects to B when pressed."
      },
      {
        "name": "B",
        "description": "Second lead."
      }
    ],
    "howItWorksMd": "A button is a switch with no connection between its two leads when it is not pressed, and that connects (shorts) the two leads when it is pressed. It does not produce any voltage by itself; it only opens or closes a path.\n\nTo read a button, the Arduino makes the pin an **input**, and you connect one lead of the button to that pin and the other lead to GND. The problem: while the button is not pressed, the pin is not connected to anything (a floating input) and reads randomly. The fix is to set the pin to `INPUT_PULLUP` in code: a resistor inside the board that pulls the pin up to 5 V is switched in.\n\nThe result is **inverted logic**:\n- Not pressed: the pin is pulled up to 5 V, `digitalRead` reads **HIGH**.\n- Pressed: the pin is connected to GND, `digitalRead` reads **LOW**.\n\n**Advanced:** The contacts of real buttons bounce for a very short time when pressed. One press can show up several times in your code. Preventing this is called \"debouncing\" (Module 3, lesson 8).",
    "wiringMd": "| From | To |\n|---|---|\n| Button **A** | Uno **D2** |\n| Button **B** | Uno **GND** |\n\nIn your code you write `pinMode(2, INPUT_PULLUP);`. To press the button, select the part and turn on the **Basılı** (Pressed) option in the properties panel, or press and hold the part; you can also change it while the circuit is running. In the lab a pressed button has a very small resistance (0.1 Ω), and when it is open there is no connection. The internal pull-up resistor is about 35 kΩ in the model.\n\nThe lab shows a warning for an unconnected (floating) input.",
    "typicalValues": [
      {
        "label": "Recommended wiring",
        "value": "A to D2, B to GND",
        "note": "The standard in this site's lessons"
      },
      {
        "label": "Code setting",
        "value": "INPUT_PULLUP",
        "note": "No external resistor needed"
      },
      {
        "label": "Reading when not pressed",
        "value": "HIGH",
        "note": "The pin is pulled up to 5 V by the internal pull-up"
      },
      {
        "label": "Reading when pressed",
        "value": "LOW",
        "note": "The pin is connected to GND"
      },
      {
        "label": "Second button",
        "value": "D3",
        "note": "The second input pin on this site"
      }
    ],
    "commonMistakesMd": "- **Getting the button logic backwards.** With `INPUT_PULLUP`, pressed = LOW; if you expect \"HIGH when pressed\", your program works the wrong way round.\n- **Forgetting to write `INPUT_PULLUP`.** Without an external resistor the pin floats and the reading is random.\n- **Connecting the button's lead to 5 V.** When using `INPUT_PULLUP`, connect the other lead to GND.\n- **Counting one press as several presses.** On real buttons, contact bounce causes this.\n- **Forgetting the GND connection.** Even when the button is pressed, the pin cannot be pulled LOW."
  },
  "buzzer": {
    "title": "Buzzer",
    "category": "Output",
    "summary": "A part that makes sound. The active type plays a single fixed tone; the passive type plays any pitch you want with `tone()`.",
    "pins": [
      {
        "name": "+",
        "description": "Positive lead. Connected to the Uno's sound pin (D8 on this site)."
      },
      {
        "name": "-",
        "description": "Negative lead. Connected to GND."
      }
    ],
    "howItWorksMd": "A buzzer is a small speaker that turns an electrical signal into sound vibrations. There are two types:\n\n- **Active buzzer:** It has its own oscillator inside. When you give it 5 V, it makes a sound at a single fixed pitch (about 2 kHz). You can only turn the sound on and off. You cannot change the frequency.\n- **Passive buzzer:** It has no oscillator inside; it is just a membrane. The pitch of the sound is set by the vibration you send. `tone(8, 440)` switches the pin HIGH-LOW 440 times per second and the buzzer plays 440 Hz (A). `noTone(8)` stops the sound.\n\nThe higher the frequency, the higher (thinner) the sound.",
    "wiringMd": "| From | To |\n|---|---|\n| Buzzer **+** | Uno **D8** |\n| Buzzer **-** | Uno **GND** |\n\nYou choose the type in the **Tür** (Type) field of the properties panel: Aktif (Active, has its own sound) or Pasif (Passive, with tone). The default is Pasif. To hear the sound you need to turn on the sound button in the lab. On this site the buzzer is connected directly to a pin; in a real circuit, large or powerful buzzers may need a transistor (Module 3, lesson 22).",
    "typicalValues": [
      {
        "label": "Active buzzer frequency",
        "value": "≈ 2000 Hz",
        "note": "Fixed; makes sound above 2 V"
      },
      {
        "label": "Note A (A4)",
        "value": "440 Hz",
        "note": "`tone(8, 440)`"
      },
      {
        "label": "Note C (C4)",
        "value": "≈ 262 Hz",
        "note": "`tone(8, 262)`"
      },
      {
        "label": "Comfortable playing range",
        "value": "a few hundred Hz - a few kHz",
        "note": "At very low or very high frequencies it does not sound like a note"
      },
      {
        "label": "Type",
        "value": "Passive",
        "note": "Lab default"
      }
    ],
    "commonMistakesMd": "- **Trying to play notes with `tone()` on an active buzzer.** It always makes the same pitch; for notes you need the passive type.\n- **Wrong pin.** If you wrote `tone(8, ...)` in your code, the buzzer's + lead must be connected to D8.\n- **Not connecting GND.** The circuit is not closed and there is no sound.\n- **Not hearing the sound.** Check that the sound button in the lab is turned on.\n- **Forgetting that `tone()` plays forever.** If you do not give a duration, the sound keeps playing; you stop it with `noTone()`."
  },
  "dcmotor": {
    "title": "DC motor",
    "category": "Output",
    "summary": "A small brushed motor. The voltage across its leads sets the speed, and the direction of the voltage sets the direction of rotation.",
    "pins": [
      {
        "name": "M1",
        "description": "First motor lead."
      },
      {
        "name": "M2",
        "description": "Second motor lead."
      }
    ],
    "howItWorksMd": "A DC motor spins when you apply a voltage across its leads. The bigger the voltage, the higher the speed; when you swap the positive and negative leads, the direction reverses. A motor is a **coil**: when the current is cut off it produces a voltage spike in the opposite direction, which is why a flyback diode is needed when it is driven by a transistor.\n\nAn Arduino pin cannot drive a motor directly; the motor draws hundreds of mA. A transistor, a MOSFET or a driver such as the L293D is used. With `analogWrite` (PWM) you change the average voltage and therefore the speed.\n\n**Advanced:** In the lab model the motor resistance is 10 Ω and the rated voltage is 6 V; the speed is taken as roughly lead voltage / 6 (at most 1). Real small motors do not start spinning at very low PWM values.",
    "wiringMd": "| From | To |\n|---|---|\n| Motor **M1** | Uno **5V** (transistor circuit) or L293D **OUT1** |\n| Motor **M2** | Transistor **C** or L293D **OUT2** |\n\nIf you select the motor during virtual measurement, you see the voltage across its leads and the current. With an NPN at full throttle you get about 4.2 V and 0.4 A, and a speed of about 0.70.",
    "typicalValues": [
      {
        "label": "Motor resistance",
        "value": "10 Ω",
        "note": "Lab model"
      },
      {
        "label": "Rated voltage",
        "value": "6 V",
        "note": "Full speed at this voltage"
      },
      {
        "label": "Full throttle with NPN",
        "value": "≈ 4.2 V, ≈ 0.4 A",
        "note": "Speed ≈ 0.70"
      },
      {
        "label": "With L293D (5 V)",
        "value": "≈ 3.3 V",
        "note": "Slower because of the output loss"
      }
    ],
    "commonMistakesMd": "- **Connecting the motor directly to a pin.** The pin cannot supply enough current and can be damaged.\n- **Skipping the flyback diode.** When driving with a transistor, the spike destroys the transistor.\n- **Reversing the direction all at once.** Stop first, then set the new direction.\n- **Expecting it to spin at a very low PWM value.** A small motor stays still below its threshold value."
  },
  "dht": {
    "title": "DHT11 / DHT22 temperature and humidity sensor",
    "category": "Sensor",
    "summary": "A sensor that reports temperature and relative humidity over a single data line. The DHT22 gives results with decimals, the DHT11 gives whole numbers.",
    "pins": [
      {
        "name": "VCC",
        "description": "Supply lead. Connected to 5V."
      },
      {
        "name": "DATA",
        "description": "Data lead. Connected to one of the Uno's digital pins (D5 in the lessons)."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connected to GND."
      }
    ],
    "howItWorksMd": "The DHT sensor measures temperature and **relative humidity** and sends both digitally over **a single data line**. Relative humidity tells you what percentage of the maximum water vapour the air could hold at that temperature it is actually holding. The sensor is slow: you need to wait **at least 2 seconds** between two readings.\n\nThe program uses the `DHT.h` library: you set it up with `DHT dht(pin, model)`, `readTemperature()` gives degrees Celsius, and `readHumidity()` gives a percentage. If a reading fails it returns `NaN`; the value should be checked with `isnan()`.\n\n**Advanced:** Bare 4-pin DHT sensors need a pull-up resistor between the data lead and VCC. On the 3-pin module in the lab, this resistor is on the board. Check the datasheet for the measurement range and accuracy of a real sensor.",
    "wiringMd": "| From | To |\n|---|---|\n| DHT **VCC** | Uno **5V** |\n| DHT **GND** | Uno **GND** |\n| DHT **DATA** | Uno **D5** |\n\nThe properties panel has **Tür** (Type: DHT11 or DHT22), **Sıcaklık** (Temperature, -40 to 80 °C) and **Nem** (Humidity, 0 to 100 %); temperature and humidity can be changed while the program is running. If the DATA lead is not connected, the lab shows a warning and the sensor does not work.",
    "typicalValues": [
      {
        "label": "Reading interval",
        "value": "at least 2 s",
        "note": "Reading more often repeats the old value"
      },
      {
        "label": "DHT22 resolution",
        "value": "1 decimal place",
        "note": "In the lab, a value of 23.5 °C prints as \"23.5\""
      },
      {
        "label": "DHT11 resolution",
        "value": "whole number",
        "note": "In the lab, a value of 23.5 °C prints as \"24.0\""
      },
      {
        "label": "Data pin",
        "value": "D5",
        "note": "The standard in this site's lessons"
      },
      {
        "label": "If the reading fails",
        "value": "NaN",
        "note": "Caught with isnan()"
      }
    ],
    "commonMistakesMd": "- **Not adding an `isnan` check.** When a reading fails, `nan` appears on the screen.\n- **Writing the wrong model.** Calling a DHT11 sensor `DHT22` produces meaningless values.\n- **Reading more often than every 2 seconds.** The sensor cannot keep up and the same value repeats.\n- **Forgetting the DATA wire.** The program keeps printing \"Okuma hatasi\" (Read error).\n- **Mistaking the number of digits for accuracy.** The fact that the DHT22 shows more digits does not always prove that it is more accurate."
  },
  "diode": {
    "title": "Diode",
    "category": "Power",
    "summary": "A part that lets current through in only one direction. In the lessons it is used as a flyback diode that absorbs the motor's kickback voltage.",
    "pins": [
      {
        "name": "A",
        "description": "Anode. Current enters here."
      },
      {
        "name": "K",
        "description": "Cathode (the striped end). Current leaves here."
      }
    ],
    "howItWorksMd": "A diode lets current through only from the anode to the cathode. While conducting, about 0.7 V drops across its leads (the **forward voltage**). It does not let current through in the reverse direction.\n\nWhen the current is cut off, a motor or relay coil produces a high voltage in the opposite direction. A diode connected in parallel with the coil, facing the reverse direction, gives this current a path and protects the transistor: a **flyback diode**. In normal operation the diode does not conduct; it conducts only at the moment of the spike.\n\n**Advanced:** In a real circuit a rectifier diode such as the 1N4007 is used. An LED is also a diode, but it gives off light and its forward voltage is 1.9-3.0 V depending on the colour.",
    "wiringMd": "| From | To |\n|---|---|\n| Diode **A** | The transistor's **C** lead (or MOSFET **D**) |\n| Diode **K** (striped end) | The positive side of the motor, **5V** |\n\nIf the motor is driven by a transistor or MOSFET but the flyback diode is missing or connected backwards, the lab shows a \"flyback\" warning. When wired correctly, the diode normally carries no current.",
    "typicalValues": [
      {
        "label": "Forward voltage",
        "value": "0.7 V",
        "note": "Lab model"
      },
      {
        "label": "Series resistance",
        "value": "1 Ω",
        "note": "Lab model"
      },
      {
        "label": "Direction",
        "value": "A to K",
        "note": "The striped end is the cathode"
      },
      {
        "label": "Flyback position",
        "value": "Parallel to the motor, reversed",
        "note": "K to the positive side"
      }
    ],
    "commonMistakesMd": "- **Connecting the diode backwards.** It does not give the spike a path; a warning appears.\n- **Leaving out the diode completely.** The transistor fails over time.\n- **Mixing up the striped end.** The striped end is the cathode and goes to the 5V side.\n- **Connecting the diode in series with the motor.** The motor does not run; the diode must be in parallel with the motor."
  },
  "direnc": {
    "title": "Resistor",
    "category": "Passive component",
    "summary": "A two-lead part that limits current. Its value is measured in ohms (Ω) and its leads have no direction.",
    "pins": [
      {
        "name": "1",
        "description": "First lead. Non-polarized; 1 and 2 are interchangeable."
      },
      {
        "name": "2",
        "description": "Second lead."
      }
    ],
    "howItWorksMd": "A **resistor** opposes the current flowing through it. The voltage across its leads equals the current through it multiplied by the resistance (**Ohm's law**):\n\n`V = I × R`   ·   `I = V / R`   ·   `R = V / I`\n\nThe larger the resistance, the **smaller** the current at the same voltage. 5 mA flows through 1 kΩ connected to 5 V, and 10 mA through 500 Ω.\n\nA resistor has two basic jobs:\n1. **Limiting current.** The resistor you put in front of an LED sets the current that flows through the LED.\n2. **Dividing voltage.** If you connect two resistors in series, you get part of the voltage at the point between them. This is the basis of sensor circuits (LDR, NTC).\n\nUnits: 1 kΩ = 1000 Ω, 1 MΩ = 1,000,000 Ω.\n\n**Colour code (real resistors):** The first two bands are digits, the third band is the multiplier. 330 Ω = orange (3), orange (3), brown (×10). 1 kΩ = brown, black, red (10 × 100).",
    "wiringMd": "The two leads of a resistor are equivalent. A typical LED connection:\n\n| From | To |\n|---|---|\n| Uno **D13** | Resistor **1** |\n| Resistor **2** | LED **A** |\n\nWhen you select the part, you type its value in the **Direnç** (Resistance) field of the properties panel (from 1 Ω to 1,000,000 Ω). If you select the resistor while the circuit is running, the panel shows the **voltage** across its leads and the **current** through it (virtual measurement).",
    "typicalValues": [
      {
        "label": "In front of an LED (5 V, red)",
        "value": "330 Ω",
        "note": "About 9 mA"
      },
      {
        "label": "Dimmer LED",
        "value": "1 kΩ",
        "note": "About 3 mA"
      },
      {
        "label": "Pull resistor for a button (pull-up/pull-down)",
        "value": "10 kΩ",
        "note": "This site uses the internal pull-up (INPUT_PULLUP)"
      },
      {
        "label": "Voltage divider (with LDR/NTC)",
        "value": "10 kΩ",
        "note": "A common choice in sensor circuits"
      },
      {
        "label": "Potentiometer total resistance",
        "value": "10 kΩ",
        "note": "Default value"
      }
    ],
    "commonMistakesMd": "- **Mixing up mA and A.** 20 mA = 0.02 A. Convert to amperes before using the formula.\n- **Thinking \"bigger resistance means bigger current\".** It is the opposite: the current gets smaller.\n- **Choosing a resistor value that is too small for an LED.** With 100 Ω the current rises to 25-30 mA; the LED and the pin are overstressed.\n- **Reading the bands of a real resistor backwards.** Read it with the gold/silver (tolerance) band on the right.\n- **Treating the calculation as ideal and expecting it to match the measurement exactly.** The lab also models the internal resistance of the Uno pin (about 25 Ω) and of the LED; the measurement comes out a little smaller than the calculation."
  },
  "enkoder": {
    "title": "Rotary encoder",
    "category": "Input",
    "summary": "A rotary knob that turns endlessly and reports steps and direction with two signals (CLK and DT). It also has a push button.",
    "pins": [
      {
        "name": "CLK",
        "description": "First signal (A). Falls once per click; connected to an interrupt pin (D2)."
      },
      {
        "name": "DT",
        "description": "Second signal (B). Shifted by a quarter period (90 degrees) from CLK; it gives the direction."
      },
      {
        "name": "SW",
        "description": "Button output. Connected to GND when pressed."
      },
      {
        "name": "VCC",
        "description": "Supply (5V) for the module's pull-up resistors. Even if you do not connect it, INPUT_PULLUP is enough."
      },
      {
        "name": "GND",
        "description": "Ground. Must always be connected."
      }
    ],
    "howItWorksMd": "A **rotary encoder** is an endlessly turning knob with two contacts inside. The contacts do not change at the same time; one changes a little before the other. That is why there is a 90 degree difference between CLK and DT (quadrature). Clockwise, the (CLK, DT) states change in the order 11, 01, 00, 10, 11; counter-clockwise, 11, 10, 00, 01, 11.\n\nDirection rule: look at DT when CLK falls from 1 to 0. If DT is 1 it is turning one way, if it is 0 the other way. That is why CLK is connected to an interrupt pin and DT is read inside the ISR.\n\n**Advanced:** Real contacts bounce; one click can produce 2-3 edges. The fix is to ignore an edge if less than a certain time (for example 2000 µs) has passed since the previous one. The lab model does not bounce and applies one state transition per simulated millisecond; one click is 4 transitions, so it turns at most 250 clicks/s.",
    "wiringMd": "| From | To |\n|---|---|\n| Encoder **CLK** | Uno **D2** (`INPUT_PULLUP`, interrupt pin) |\n| Encoder **DT** | Uno **D3** (`INPUT_PULLUP`) |\n| Encoder **SW** | Uno **D4** (`INPUT_PULLUP`) |\n| Encoder **VCC** | Uno **5V** (optional) |\n| Encoder **GND** | Uno **GND** |\n\nWhen the **Konum (tık)** (Position, clicks) value in the properties panel changes, the encoder is turned by that many clicks (clockwise is positive). **Düğme basılı** (Button pressed) presses the button.",
    "typicalValues": [
      {
        "label": "One click",
        "value": "4 state transitions",
        "note": "11, 01, 00, 10, 11"
      },
      {
        "label": "Duration of one transition",
        "value": "1 ms",
        "note": "Lab model"
      },
      {
        "label": "Fastest rotation",
        "value": "250 clicks/s",
        "note": "4 ms per click"
      },
      {
        "label": "Pull-up resistor",
        "value": "10 kΩ",
        "note": "On the module board, to VCC"
      },
      {
        "label": "Recommended bounce threshold",
        "value": "2000 µs",
        "note": "Must be less than 4 ms"
      }
    ],
    "commonMistakesMd": "- **Connecting CLK to a pin that is not an interrupt pin.** On the Uno only D2 and D3 support interrupts.\n- **Not making the sayac variable volatile.** loop() may not see the change.\n- **Using Serial.print or delay inside the ISR.** An ISR must be short.\n- **Not adding a bounce filter, or making the threshold too large.** In the first case the counter skips extra steps; in the second, clicks are lost when you turn quickly.\n- **Mixing up CLK and DT.** The direction comes out reversed."
  },
  "flame": {
    "title": "Flame sensor",
    "category": "Sensor",
    "summary": "A module that detects the infrared (IR) light given off by a flame. On the lab module, the analog output drops as the flame gets stronger.",
    "pins": [
      {
        "name": "VCC",
        "description": "Power supply pin. Connects to 5V; needs at least 3 V."
      },
      {
        "name": "GND",
        "description": "Ground pin. Connects to GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Goes to one of the Uno's analog inputs (A1 in the lessons); the voltage drops when there is a flame."
      },
      {
        "name": "DO",
        "description": "Digital output. Goes LOW when the flame intensity passes the threshold; not used in the lessons."
      }
    ],
    "howItWorksMd": "A flame sensor is a receiver that is sensitive to the **infrared (IR) light** a flame gives off. When a flame comes closer, the analog output changes. On the lab module **the value drops when there is a flame**, but on some modules it may be the other way round. That is why you convert the raw reading in a single function (`siddet()`, \"intensity\") so that \"bigger number = stronger flame\"; the rest of your code then does not depend on the direction.\n\nSunlight and some lamps also give off IR; in a real circuit they can cause false alarms. The sensor's viewing angle and range are limited. On its own, this sensor is not a reliable fire detector.\n\n**Advanced:** In the lab model, AO = VCC × (1 − 0.95 × Flame intensity). With no flame, AO = VCC and `analogRead` gives 1023; at intensity 1 you read about 0.25 V (raw ≈ 51).",
    "wiringMd": "| From | To |\n|---|---|\n| Flame sensor **VCC** | Uno **5V** |\n| Flame sensor **GND** | Uno **GND** |\n| Flame sensor **AO** | Uno **A1** |\n\n**Alev şiddeti** (Flame intensity, 0 to 1) in the properties panel simulates the flame and can be changed while the program is running. **Eşik (DO)** (Threshold (DO)) only affects the digital output. No experiments are done with a real flame.",
    "typicalValues": [
      {
        "label": "Flame intensity 0",
        "value": "raw = 1023, intensity 0",
        "note": "No flame"
      },
      {
        "label": "Flame intensity 0.31",
        "value": "raw ≈ 722, intensity ≈ 301",
        "note": "Just past the WARNING threshold (300) used in the lessons"
      },
      {
        "label": "Flame intensity 0.4",
        "value": "raw ≈ 634, intensity ≈ 389",
        "note": "WARNING"
      },
      {
        "label": "Flame intensity 0.62",
        "value": "raw ≈ 420, intensity ≈ 603",
        "note": "Just past the DANGER threshold (600) used in the lessons"
      },
      {
        "label": "Flame intensity 0.8",
        "value": "raw ≈ 246, intensity ≈ 777",
        "note": "DANGER"
      },
      {
        "label": "Intensity conversion",
        "value": "intensity = 1023 − raw",
        "note": "For a module whose value drops with a flame"
      }
    ],
    "commonMistakesMd": "- **Not knowing the direction.** If you do not check the `ALEVDE_DUSER` (\"drops with flame\") value, the alarm either always goes off or never does.\n- **Thinking about the direction separately everywhere.** Do the conversion in a single function.\n- **Setting the turn-off threshold higher than the turn-on threshold.** The level flickers or never drops.\n- **Forgetting about IR sources.** Sunlight and some lamps can cause false alarms (the lab does not model this).\n- **Experimenting with a real flame.** It is dangerous; in the lessons the flame is only simulated from the properties panel."
  },
  "hcsr04": {
    "title": "HC-SR04 ultrasonic distance sensor",
    "category": "Sensor",
    "summary": "A distance sensor that reports the round-trip time of a sound wave as how long its ECHO pin stays HIGH; typical range 2-400 cm.",
    "pins": [
      {
        "name": "VCC",
        "description": "5 V supply. Connects to the Uno's 5V pin."
      },
      {
        "name": "TRIG",
        "description": "Trigger input. A short (10 µs) HIGH pulse from the board starts a measurement."
      },
      {
        "name": "ECHO",
        "description": "Echo output. Stays HIGH until the sound goes out and comes back; the duration gives the distance."
      },
      {
        "name": "GND",
        "description": "Ground. Connects to the Uno's GND."
      }
    ],
    "howItWorksMd": "The HC-SR04 has two cylinders on the front: one sends out **ultrasonic** sound (too high for human ears to hear, 40 kHz on this sensor), and the other listens for the echo. When the board gives TRIG a 10 µs HIGH pulse, the sensor sends out a burst of sound and raises the ECHO pin. When the sound hits an object and comes back, ECHO goes LOW again.\n\nThe sensor does not tell you the distance; it gives you a **time**. You measure the time in microseconds with `pulseIn(ECHO, HIGH, 30000)` and convert it:\n\n`distance (cm) = time (µs) × 0.0343 / 2`\n\nYou divide by two because the time covers both the trip out and the trip back. Shortcut: about 58 µs = 1 cm.\n\n**Advanced:** The speed of sound depends on temperature (about c = 331.3 + 0.606 × T m/s). Because the program assumes 343 m/s, it shows distances too large in the cold and too small in the heat; between 0 °C and 40 °C there is a difference of about 7 cm at 100 cm. The sensor looks at a cone-shaped area (typically about 15° in the datasheet). Slanted, soft or very thin surfaces weaken the echo or bounce it off to the side; that is why a median filter is used to remove outliers (lesson 38).",
    "wiringMd": "| From | To |\n|---|---|\n| HC-SR04 **VCC** | Uno **5V** |\n| HC-SR04 **GND** | Uno **GND** |\n| HC-SR04 **TRIG** | Uno **D9** |\n| HC-SR04 **ECHO** | Uno **D10** |\n\nThe **Mesafe** (Distance) value in the properties panel (2-400 cm) is how far away the object in front of the sensor is, and it can be changed while the program is running. Outside this range the lab produces no echo, so `pulseIn` times out and returns 0. The lab sensor is perfect: it reads exactly what you type into Mesafe, the speed of sound is constant and there is no noise. TRIG and ECHO must be connected directly to Uno pins.",
    "typicalValues": [
      {
        "label": "Measuring range",
        "value": "2-400 cm",
        "note": "The lab produces an echo in this range; for a real sensor, check the datasheet"
      },
      {
        "label": "Sound frequency",
        "value": "40 kHz",
        "note": "Inaudible"
      },
      {
        "label": "Trigger pulse",
        "value": "10 µs",
        "note": "HIGH time on TRIG"
      },
      {
        "label": "Time / distance",
        "value": "≈ 58 µs / cm",
        "note": "Round trip; the lab model uses 58.2 µs/cm"
      },
      {
        "label": "Measuring angle",
        "value": "≈ 15°",
        "note": "Typical datasheet value; cone-shaped"
      },
      {
        "label": "Wait between measurements",
        "value": "≈ 60 ms",
        "note": "Recommended so the previous echo does not mix with the new one"
      }
    ],
    "commonMistakesMd": "- **Not dividing the time by two.** The distance comes out twice as large.\n- **Swapping TRIG and ECHO.** No measurement comes in; you always read 0.\n- **Not giving `pulseIn` a timeout.** If no echo arrives, it waits for the default 1 second.\n- **Taking a return value of 0 as 0 cm.** 0 means there was no echo.\n- **Not connecting VCC or GND.** The sensor gets no power and does not respond when triggered.\n- **Powering a servo or motor from the same weak 5 V line (real circuit).** The voltage dip spoils the measurement; use a separate supply and a common GND."
  },
  "irobstacle": {
    "title": "IR obstacle sensor",
    "category": "Sensor",
    "summary": "A module that tells you whether there is an obstacle in front of it by looking at reflected infrared light; it does not measure distance, it just says \"yes/no\".",
    "pins": [
      {
        "name": "VCC",
        "description": "Power supply. In the lab it works with 3 V and above; in the lessons it connects to the 5V pin."
      },
      {
        "name": "OUT",
        "description": "Digital output. LOW when there is an obstacle, HIGH when there is none (the common arrangement; some modules do the opposite)."
      },
      {
        "name": "GND",
        "description": "Ground. Connects to the Uno's GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Its voltage rises as the reflection gets stronger; you choose the threshold in your code."
      }
    ],
    "howItWorksMd": "The module has an infrared LED and a receiver on it. The LED sends out light; if there is an object in front, part of the light bounces back to the receiver. If the reflection goes above a certain level, the module says \"obstacle detected\".\n\nThe threshold can be set in two places. For the **OUT** output, the threshold is on the module's small **adjustment screw** (hardware). For the **AO** output, you read the raw reflection voltage and set the threshold in your code. If the value wobbles around the threshold, using two thresholds (hysteresis) instead of one stops the output from flickering.\n\nThe reflection depends not only on distance but also on the object's colour and surface: light-coloured matte surfaces are easy to detect, dark and shiny ones are hard. Strong ambient light can spoil the measurement on real modules (the lab does not model this).\n\n**Advanced:** In the lab model, AO is a linear function of the proximity value: it is the fraction 0.05 + 0.9 × proximity of VCC. At proximity 0 you read about 0.25 V, at 1 about 4.75 V. When counting objects, you count the \"nothing to something\" transition (the edge), not the level.",
    "wiringMd": "| From | To |\n|---|---|\n| IR obstacle **VCC** | Uno **5V** |\n| IR obstacle **GND** | Uno **GND** |\n| IR obstacle **OUT** | Uno **D3** |\n| IR obstacle **AO** (optional) | Uno **A0** |\n\nThe properties panel has two sliders: **Yakınlık** (Proximity, 0-1, how much the object reflects) and **Eşik (ayar vidası)** (Threshold (adjustment screw), 0-1, default 0.5). If the proximity is equal to or greater than the threshold, an obstacle is detected. Use `INPUT` for OUT; the module drives the output.",
    "typicalValues": [
      {
        "label": "OUT, with an obstacle",
        "value": "LOW",
        "note": "Common arrangement; check the module's documentation"
      },
      {
        "label": "OUT, with no obstacle",
        "value": "HIGH",
        "note": "Common arrangement"
      },
      {
        "label": "Default threshold",
        "value": "0.5",
        "note": "Position of the adjustment screw in the lab"
      },
      {
        "label": "AO, proximity 0",
        "value": "≈ 0.25 V (analogRead ≈ 51)",
        "note": "Lab model"
      },
      {
        "label": "AO, proximity 1",
        "value": "≈ 4.75 V (analogRead ≈ 972)",
        "note": "Lab model"
      },
      {
        "label": "Operating voltage",
        "value": "≥ 3 V",
        "note": "In the lab, 3.3 V also counts as powered"
      }
    ],
    "commonMistakesMd": "- **Assuming the output level is the same on every module.** Some modules give HIGH for an obstacle; put the level in a constant.\n- **Expecting centimetres from it.** OUT only says yes/no; for distance you need an HC-SR04 or a ToF sensor.\n- **Using a single threshold.** When the AO value wobbles around the threshold, the output flickers; use two thresholds.\n- **Counting the level when counting objects.** An object that stays put gets counted on every loop; count the edge.\n- **Ignoring colour.** Dark or shiny surfaces reflect little and may not be detected."
  },
  "joystick": {
    "title": "Joystick",
    "category": "Input",
    "summary": "A two-axis stick with a push button. Each axis gives a voltage between 0-5 V, like a potentiometer.",
    "pins": [
      {
        "name": "VCC",
        "description": "Power supply. Connects to 5V (needs at least about 3 V, but with 3V3 the end value is about 675 instead of 1023)."
      },
      {
        "name": "GND",
        "description": "Ground."
      },
      {
        "name": "VRX",
        "description": "Horizontal (X) axis output. Goes to one of the Uno's analog inputs (A0)."
      },
      {
        "name": "VRY",
        "description": "Vertical (Y) axis output. Goes to another analog input (A1)."
      },
      {
        "name": "SW",
        "description": "Button output. Connects to GND when pressed; goes to a digital pin (INPUT_PULLUP)."
      }
    ],
    "howItWorksMd": "A **joystick** is made of two potentiometers set at right angles to each other, plus a button at the end of the stick. Each axis is a voltage divider: the wiper sliding along the track between VCC and GND gives a voltage to VRX or VRY. With the stick in the middle, the voltage is about 2.5 V and the `analogRead` value is about 512. Pushed all the way in one direction, it gets close to 0 V or 5 V, that is, 0 or 1023.\n\nOn real modules the centre is not exactly 512 (it may be 497 or 530, for example). That is why the centre is measured at startup and a small dead zone is placed around it.\n\n**Advanced:** In the lab model, each axis is a divider with a total resistance of 10 kΩ. While the SW pin is connected to VCC, it is pulled HIGH by the module's 10 kΩ pull-up resistor; when the button is pressed, it is connected to GND through about 100 Ω. You can also read the button with `INPUT_PULLUP`.",
    "wiringMd": "| From | To |\n|---|---|\n| Joystick **VCC** | Uno **5V** |\n| Joystick **GND** | Uno **GND** |\n| Joystick **VRX** | Uno **A0** |\n| Joystick **VRY** | Uno **A1** |\n| Joystick **SW** | Uno **D2** (`INPUT_PULLUP`) |\n\nThe properties panel has **X ekseni** (X axis) and **Y ekseni** (Y axis) (between 0 and 1) and **Düğme basılı** (Button pressed); they can also be changed while the program is running. You do not need to write `pinMode` for `analogRead`.",
    "typicalValues": [
      {
        "label": "Stick in the middle (X or Y = 0.5)",
        "value": "≈ 2.5 V, reading ≈ 512",
        "note": "Centre"
      },
      {
        "label": "Axis 0",
        "value": "≈ 0 V, reading ≈ 0",
        "note": "One end"
      },
      {
        "label": "Axis 1",
        "value": "≈ 5 V, reading ≈ 1023",
        "note": "The other end"
      },
      {
        "label": "Axis 0.25",
        "value": "≈ 1.25 V, reading ≈ 256",
        "note": "Quarter position"
      },
      {
        "label": "Button pressed",
        "value": "SW ≈ 0 V (LOW)",
        "note": "Reads LOW with INPUT_PULLUP"
      },
      {
        "label": "Axis divider resistance",
        "value": "10 kΩ",
        "note": "Total, lab model"
      }
    ],
    "commonMistakesMd": "- **Hard-coding the centre as 512.** On a real module the value drifts when the stick is released; measure it at startup.\n- **Not adding a dead zone.** When the stick is released, the value wobbles: 510, 514, 509.\n- **Not setting SW to INPUT_PULLUP.** If the pin is left floating, random presses are read.\n- **Connecting VCC to 3V3.** The ADC measures relative to 5 V; the end value becomes about 675.\n- **Starting the program with the stick pushed.** The centre is measured wrong."
  },
  "keypad": {
    "title": "Keypad 4x4",
    "category": "Input",
    "summary": "A matrix keypad that reads 16 keys with 8 pins. The rows and columns connect directly to Uno pins.",
    "pins": [
      {
        "name": "R1",
        "description": "First row. Connects to an input pin on the Uno (D9 on this site)."
      },
      {
        "name": "R2",
        "description": "Second row (D8 on this site)."
      },
      {
        "name": "R3",
        "description": "Third row (D7 on this site)."
      },
      {
        "name": "R4",
        "description": "Fourth row (D6 on this site)."
      },
      {
        "name": "C1",
        "description": "First column (D5 on this site)."
      },
      {
        "name": "C2",
        "description": "Second column (D4 on this site)."
      },
      {
        "name": "C3",
        "description": "Third column (D3 on this site)."
      },
      {
        "name": "C4",
        "description": "Fourth column (D2 on this site)."
      }
    ],
    "howItWorksMd": "On a keypad, each key connects one row to one column when it is pressed. Instead of 16 wires for 16 keys, 4 rows and 4 columns, that is 8 wires, are enough. The Arduino keeps the rows waiting HIGH with `INPUT_PULLUP` and sets the columns LOW one at a time. While the pressed key's column is LOW, that key's row also reads LOW; the row and column that cross give away the key.\n\nThe `Keypad` library does this scanning and the debouncing. `getKey()` returns a newly pressed key once as a `char`; if nothing is pressed, it returns `'\\0'`.\n\n**Advanced:** In a matrix without diodes, if three keys are pressed at the same time a \"ghost\" key can be detected, because the current returns through the wrong path. That is why single-key jobs, such as entering a password, are the safest use of a matrix. The lab part counts only one key as pressed at a time.",
    "wiringMd": "| From | To |\n|---|---|\n| Keypad **R1, R2, R3, R4** | Uno **D9, D8, D7, D6** |\n| Keypad **C1, C2, C3, C4** | Uno **D5, D4, D3, D2** |\n\nYou pick a key from the **Basılı tuş** (Pressed key) list in the right panel; the selected key counts as pressed, and choosing **Yok** (None) releases it. Leaving a key selected in the list means holding it down. The key map, row by row, is `1 2 3 A`, `4 5 6 B`, `7 8 9 C`, `* 0 # D`.",
    "typicalValues": [
      {
        "label": "Number of keys",
        "value": "16",
        "note": "4 rows × 4 columns"
      },
      {
        "label": "Pins needed",
        "value": "8",
        "note": "4 rows + 4 columns"
      },
      {
        "label": "Row pin mode",
        "value": "INPUT_PULLUP",
        "note": "The library sets this itself"
      },
      {
        "label": "Row while a key is pressed",
        "value": "LOW",
        "note": "While its column is driven LOW"
      },
      {
        "label": "`getKey()` when idle",
        "value": "'\\0'",
        "note": "If nothing is pressed"
      }
    ],
    "commonMistakesMd": "- **Swapping the row and column pins in code.** Keys give the wrong character or are not detected at all. Select each key in turn and check what the serial monitor prints.\n- **Using the `getKey()` value without checking it.** It returns `'\\0'` when nothing is pressed; filter with `if (tus)`.\n- **Giving the keypad pins to other parts too.** D2-D9 belong to the keypad this week; parts such as a servo must be moved to another pin.\n- **Waiting with `delay()`.** Keys pressed while waiting can be missed; use `millis()`.\n- **Forgetting to release the key.** In the lab, set the list back to **Yok** after each press."
  },
  "l293d": {
    "title": "L293D motor driver",
    "category": "Power",
    "summary": "A chip with two H-bridges inside. You set a motor's direction with IN1 and IN2, and its speed with EN.",
    "pins": [
      {
        "name": "VCC1",
        "description": "The chip's logic power (5 V)."
      },
      {
        "name": "VCC2",
        "description": "The motor power."
      },
      {
        "name": "GND",
        "description": "Ground (the real chip has four GND legs; in the lab it is a single pin)."
      },
      {
        "name": "EN12",
        "description": "Turns the first channel on/off; speed with PWM."
      },
      {
        "name": "IN1",
        "description": "First channel direction input 1."
      },
      {
        "name": "IN2",
        "description": "First channel direction input 2."
      },
      {
        "name": "OUT1",
        "description": "First motor lead."
      },
      {
        "name": "OUT2",
        "description": "Second motor lead."
      },
      {
        "name": "EN34",
        "description": "Turns the second channel on/off."
      },
      {
        "name": "IN3",
        "description": "Second channel direction input 1."
      },
      {
        "name": "IN4",
        "description": "Second channel direction input 2."
      },
      {
        "name": "OUT3",
        "description": "Second channel's first motor lead."
      },
      {
        "name": "OUT4",
        "description": "Second channel's second motor lead."
      }
    ],
    "howItWorksMd": "The L293D uses the **H-bridge** idea to change the direction of the voltage across the motor's leads. If IN1 and IN2 are different, the motor turns: IN1 HIGH and IN2 LOW means forward; IN1 LOW and IN2 HIGH means reverse. If they are the same, the motor stops. If EN12 is LOW, the outputs are left floating; if you give EN12 a PWM signal, the speed changes.\n\nThe chip has built-in kickback diodes, so you do not need separate flyback diodes. It supplies at most 600 mA per channel.\n\n**Advanced:** The output transistors lose about 1.4 V on the high side. A high output is VCC2 − 1.4 V, and a low output is about 0.2 V. If VCC2 = 5 V, the motor sees about 3.3 V.",
    "wiringMd": "| From | To |\n|---|---|\n| L293D **EN12** | Uno **D6** |\n| L293D **IN1** | Uno **D7** |\n| L293D **IN2** | Uno **D5** |\n| L293D **VCC1** | Uno **5V** |\n| L293D **VCC2** | Uno **5V** |\n| L293D **GND** | Uno **GND** |\n| L293D **OUT1** | Motor **M1** |\n| L293D **OUT2** | Motor **M2** |\n\nIf VCC1 or VCC2 is not powered, the lab shows a warning. In a real circuit, if the motor needs more than 5 V, VCC2 is powered from a separate source and the GNDs are connected together.",
    "typicalValues": [
      {
        "label": "Channel current",
        "value": "600 mA",
        "note": "Real chip limit"
      },
      {
        "label": "Voltage loss",
        "value": "≈ 1.4 V",
        "note": "On a high output"
      },
      {
        "label": "Low output",
        "value": "≈ 0.2 V",
        "note": "Above GND"
      },
      {
        "label": "VCC1",
        "value": "5 V",
        "note": "Logic power"
      },
      {
        "label": "Motor (VCC2 = 5 V)",
        "value": "≈ 3.3 V",
        "note": "Lab model"
      }
    ],
    "commonMistakesMd": "- **Not connecting VCC1 or VCC2.** The chip does not work or the output stays floating.\n- **Forgetting GND.** The chip does not work.\n- **Not driving EN12, or keeping it LOW.** The motor stops.\n- **Setting IN1 and IN2 the same.** The motor stops.\n- **Connecting the motor supply to VCC1.** A voltage above 5 V can damage the logic side.\n- **Connecting a big motor.** The chip overheats."
  },
  "lcd1602": {
    "title": "LCD 16x2 display",
    "category": "Output",
    "summary": "A character display that shows 16 characters on each of two lines and is driven with 6 signal pins (in 4-bit mode).",
    "pins": [
      {
        "name": "VSS",
        "description": "Ground. Connects to GND."
      },
      {
        "name": "VDD",
        "description": "Power supply, 5V."
      },
      {
        "name": "V0",
        "description": "Contrast pin. Usually connected to the middle pin of a potentiometer."
      },
      {
        "name": "RS",
        "description": "Command / data select. Driven by the Uno."
      },
      {
        "name": "RW",
        "description": "Read / write select. Connects to GND (we only write)."
      },
      {
        "name": "E",
        "description": "Enable pulse. Driven by the Uno."
      },
      {
        "name": "D0",
        "description": "Data bit 0 (left unconnected in 4-bit mode)."
      },
      {
        "name": "D1",
        "description": "Data bit 1 (left unconnected in 4-bit mode)."
      },
      {
        "name": "D2",
        "description": "Data bit 2 (left unconnected in 4-bit mode)."
      },
      {
        "name": "D3",
        "description": "Data bit 3 (left unconnected in 4-bit mode)."
      },
      {
        "name": "D4",
        "description": "Data bit 4. Connects to the Uno."
      },
      {
        "name": "D5",
        "description": "Data bit 5. Connects to the Uno."
      },
      {
        "name": "D6",
        "description": "Data bit 6. Connects to the Uno."
      },
      {
        "name": "D7",
        "description": "Data bit 7. Connects to the Uno."
      },
      {
        "name": "A",
        "description": "Backlight positive pin. Connects to 5V through a resistor."
      },
      {
        "name": "K",
        "description": "Backlight negative pin. Connects to GND."
      }
    ],
    "howItWorksMd": "An **LCD 16x2** shows 16 characters on each of two lines; each character is drawn from 5x8 dots. Most displays carry an HD44780 controller. When working with the Uno in **4-bit mode**, 6 signal pins are enough: RS, E and D4-D7; D0-D3 are left unconnected.\n\nIn the program you create a `LiquidCrystal lcd(RS, E, D4, D5, D6, D7);` object, start the display with `lcd.begin(16, 2)`, and write with `lcd.setCursor(column, row)` and `lcd.print()`. Counting starts at 0. The LCD does not erase old characters; new text is written over them.\n\n**V0** sets the contrast. If its voltage is too high, the characters are invisible. The backlight is independent of the text; even if the light is on, the screen looks blank when the contrast is not right.\n\n**Advanced:** The display draws characters from dots, 5 columns x 8 rows; you can define 8 custom characters with `createChar`. Because it needs many pins, the same display can also be driven with two wires through an I2C adapter (the lcdI2c part).",
    "wiringMd": "| From | To |\n|---|---|\n| **VSS**, **RW** and **K** | **GND** |\n| **VDD** | **5V** |\n| **A** | **5V** through a 220 Ω resistor |\n| **V0** | Potentiometer **SIG** pin (pot VCC = 5V, GND = GND) |\n| **RS** | Uno **D12** |\n| **E** | Uno **D11** |\n| **D4**, **D5**, **D6**, **D7** | Uno **D5**, **D4**, **D3**, **D2** |\n\nIn the lab, for text to appear, VDD must be at least 4 V and VSS and RW must be connected to ground. If the V0 voltage goes above about 1.6 V, the screen looks blank; if V0 is not connected at all, the text is visible. The backlight counts as on when more than 1 mA flows between A and K.",
    "typicalValues": [
      {
        "label": "Size",
        "value": "16 columns x 2 rows",
        "note": "32 characters"
      },
      {
        "label": "Number of signal pins",
        "value": "6",
        "note": "RS, E, D4, D5, D6, D7 (4-bit mode)"
      },
      {
        "label": "Contrast limit (V0)",
        "value": "1.6 V",
        "note": "Above this the screen looks blank (lab model)"
      },
      {
        "label": "Backlight Vf",
        "value": "3 V",
        "note": "Lab model"
      },
      {
        "label": "Backlight turn-on threshold",
        "value": "1 mA",
        "note": "A-K current"
      },
      {
        "label": "Number of custom characters",
        "value": "8",
        "note": "Slots 0-7"
      }
    ],
    "commonMistakesMd": "- **Mixing up the pin order.** The order in `LiquidCrystal lcd(12, 11, 5, 4, 3, 2)` is RS, E, D4, D5, D6, D7; the code and the wires must match.\n- **Not adjusting the contrast.** If the V0 voltage is high, the screen looks blank; turn the potentiometer down.\n- **Not connecting VSS, VDD or RW.** The display does not turn on; connect RW to GND.\n- **Not writing `lcd.begin(16, 2)`.** The display is not initialised.\n- **Not clearing old text.** If short text is written over longer text, the old characters stay.\n- **Using Turkish letters.** ı, ş, ğ are not in the display's character table."
  },
  "lcdI2c": {
    "title": "I2C LCD 16x2",
    "category": "Output",
    "summary": "An LCD with an I2C expander on the back that writes two lines of 16 characters using only two data wires (SDA and SCL).",
    "pins": [
      {
        "name": "GND",
        "description": "Ground. Connects to Uno GND."
      },
      {
        "name": "VCC",
        "description": "Power supply. Connects to Uno 5V."
      },
      {
        "name": "SDA",
        "description": "I2C data line. Connects to A4 on the Uno."
      },
      {
        "name": "SCL",
        "description": "I2C clock line. Connects to A5 on the Uno."
      }
    ],
    "howItWorksMd": "A parallel LCD needs a lot of pins. The small board on the back of an I2C LCD (a PCF8574 expander) takes care of those pins; the Arduino talks to the display over just two wires, SDA and SCL. Every I2C device on the bus has a 7-bit address, and the board only answers messages written to that address. The display has 16 columns and 2 rows, so it shows at most 32 characters.\n\n**Advanced:** On common boards the address is 0x27 (PCF8574); on some it is 0x3F (PCF8574A). If the address you write in your code does not match the display's, the display does not respond. To find the address, you run an I2C scanner program. The built-in character table does not include Turkish letters (ç, ş, ğ, ı).",
    "wiringMd": "| From | To |\n|---|---|\n| LCD **SDA** | Uno **A4** |\n| LCD **SCL** | Uno **A5** |\n| LCD **VCC** | Uno **5V** |\n| LCD **GND** | Uno **GND** |\n\nYou choose 0x27 or 0x3F in the **I2C adresi** (I2C address) field of the properties panel (default 0x27). If VCC or GND is missing, a \"not powered\" warning appears. The program must call `lcd.init()` and `lcd.backlight()`; because `init()` includes a wait of about 1 second, the text appears with a short delay after ▶.",
    "typicalValues": [
      {
        "label": "Screen size",
        "value": "16 × 2",
        "note": "16 columns, 2 rows"
      },
      {
        "label": "Default address",
        "value": "0x27",
        "note": "0x3F on some boards"
      },
      {
        "label": "SDA pin",
        "value": "A4",
        "note": "Uno hardware I2C"
      },
      {
        "label": "SCL pin",
        "value": "A5",
        "note": "Uno hardware I2C"
      },
      {
        "label": "Power supply",
        "value": "5 V",
        "note": "In the lab, VCC and GND must be connected"
      }
    ],
    "commonMistakesMd": "- **Address mismatch.** If the properties panel says 0x3F but your code says 0x27, the screen stays blank. Check the address with the scanner program.\n- **Crossing SDA and SCL.** Neither the display nor the scanner finds any device.\n- **Connecting to pins other than A4 and A5.** The Uno's hardware I2C is only on these two pins.\n- **Not calling `init()` and `backlight()`.** The display does not start or the backlight does not turn on.\n- **Rewriting the whole screen on every loop.** The bus gets needlessly busy; only write the line that changed."
  },
  "ldr": {
    "title": "LDR",
    "category": "Input",
    "summary": "A two-lead part whose resistance goes down as light increases. It is read by building a voltage divider with a fixed resistor.",
    "pins": [
      {
        "name": "1",
        "description": "First lead. It has no polarity; 1 and 2 can be swapped."
      },
      {
        "name": "2",
        "description": "Second lead."
      }
    ],
    "howItWorksMd": "An **LDR** (light-dependent resistor) is a part whose resistance changes with the light falling on it. As the light increases, its resistance **goes down**: in the dark it is very large (hundreds of kΩ), in bright light it is very small (a few hundred Ω). The Uno cannot measure resistance, only voltage; that is why the LDR is connected in series with a fixed resistor to make a **voltage divider**.\n\nThe standard circuit on this site: the LDR between 5V and A1, and a 10 kΩ resistor between A1 and GND. As the light increases, the LDR's resistance drops, and the voltage at A1 and the `analogRead(A1)` value **go up**. If you swap the two parts, the direction is reversed.\n\n**Advanced:** From the raw value `ham` read at A1, you find the LDR's resistance with `R_ldr = 10000 × (1024 − ham) / ham`. To stop flickering around the threshold, a two-threshold decision (hysteresis) is used.",
    "wiringMd": "| From | To |\n|---|---|\n| LDR **1** | Uno **5V** |\n| LDR **2** | Uno **A1** and lead 1 of the 10 kΩ resistor |\n| Lead 2 of the 10 kΩ resistor | Uno **GND** |\n\nYou change the light level while the program is running with the **Işık** (Light) slider in the properties panel (between 0 and 1). You do not need to write `pinMode` for `analogRead`.",
    "typicalValues": [
      {
        "label": "Dark (Light 0)",
        "value": "≈ 1 MΩ",
        "note": "Upper limit of the lab model; with 10 kΩ the reading is ≈ 10"
      },
      {
        "label": "Medium light (Light 0.5)",
        "value": "≈ 14 kΩ",
        "note": "With 10 kΩ the reading is ≈ 424"
      },
      {
        "label": "Bright light (Light 1)",
        "value": "≈ 200 Ω",
        "note": "With 10 kΩ the reading is ≈ 1004"
      },
      {
        "label": "Fixed divider resistor",
        "value": "10 kΩ",
        "note": "The standard in this site's lessons"
      }
    ],
    "commonMistakesMd": "- **Forgetting the fixed resistor.** The LDR sits directly between 5V and A1; the pin is left floating and the measurement becomes meaningless.\n- **Swapping the LDR and the fixed resistor.** The circuit works, but `ham` goes down as the light increases; your program's logic is reversed.\n- **Choosing a fixed resistor that is too small.** With a value like 100 Ω, Vout stays at almost 0 V all the time and the range gets narrow.\n- **Using a single threshold.** When the light is near the threshold, the LED keeps blinking on and off; use two thresholds (hysteresis)."
  },
  "led": {
    "title": "LED",
    "category": "Output",
    "summary": "A polarized two-lead part that gives off light when current flows through it. It always needs a series resistor.",
    "pins": [
      {
        "name": "A",
        "description": "Anode (+). The longer leg on a real LED. The lead where current enters."
      },
      {
        "name": "K",
        "description": "Cathode (-). The shorter leg on a real LED, on the side with the flat edge on the body. Goes to the GND side."
      }
    ],
    "howItWorksMd": "An **LED** (light-emitting diode) is a part that lets current through in only one direction and gives off light while doing so. Current flows **from A to K**. If you connect it backwards, no current flows and the LED does not light; this does not damage the LED, it just gives no light.\n\nAn LED does not behave like a resistor. While it is lit, a roughly **constant voltage** drops across its leads; this is called the forward voltage (Vf) and it depends on the colour. The rest of the voltage has to drop across something else in the circuit. If that \"something else\" is not a **series resistor**, the current is not limited, the LED draws too much current and burns out. That is why you always put a resistor next to an LED:\n\n`I = (Vsupply − Vf) / R`\n\nBrightness increases with current. An LED gives clearly visible light at a few mA; the safe current to draw from an Uno pin is below about 20 mA.\n\n**Advanced:** An LED's current-voltage relationship is not linear; when the voltage rises a little, the current rises quickly. So instead of connecting an LED directly to a voltage source, you set its current with a resistor. The lab models the LED as \"constant Vf + a small internal resistance\"; it also takes the Uno pin's internal resistance (about 25 Ω) into account.",
    "wiringMd": "Pin names are the same as the leads of the part in the lab.\n\n| From | To |\n|---|---|\n| Uno **D13** (or another digital pin) | Resistor lead **1** |\n| Resistor lead **2** | LED **A** |\n| LED **K** | Uno **GND** |\n\nThe resistor can be on either the anode or the cathode side of the LED; it makes no difference for current limiting. In the lessons on this site the resistor is on the pin side. You choose the colour in the properties panel (red, yellow, green, blue, white).\n\nThe Uno has a built-in L LED connected to D13. When your code drives D13, it lights up too.",
    "typicalValues": [
      {
        "label": "Red LED Vf",
        "value": "1.9 V",
        "note": "Lab model"
      },
      {
        "label": "Yellow LED Vf",
        "value": "2.0 V",
        "note": "Lab model"
      },
      {
        "label": "Green LED Vf",
        "value": "2.2 V",
        "note": "Lab model"
      },
      {
        "label": "Blue and white LED Vf",
        "value": "3.0 V",
        "note": "Lab model"
      },
      {
        "label": "Series resistor (5 V, red)",
        "value": "330 Ω",
        "note": "About 9 mA; the standard in this site's lessons"
      },
      {
        "label": "Comfortable brightness current",
        "value": "5-15 mA",
        "note": "In the lab, brightness looks full at around 10 mA"
      },
      {
        "label": "Warning limit",
        "value": "25 mA",
        "note": "Above this, a \"no series resistor or too small\" warning appears"
      },
      {
        "label": "Burn-out limit",
        "value": "30 mA",
        "note": "Above this the LED burns out; starting over with ↺ fixes it"
      }
    ],
    "commonMistakesMd": "- **Leaving out the resistor.** The current is not limited; the lab shows a warning and the LED can burn out. In a real circuit the LED and the Uno pin can be damaged.\n- **Connecting the LED backwards.** It does not light. Connect lead A to the pin/resistor side and lead K to GND.\n- **Forgetting GND.** The circuit is not closed; no current flows.\n- **Expecting a blue/white LED to be as bright as a red one.** Because Vf is larger, the current is smaller with the same resistor: at 330 Ω a red LED draws about 8.6 mA, a blue one about 5.6 mA (lab model).\n- **Putting one resistor on the shared lead of several LEDs.** A single resistor only limits the total current; give each LED its own resistor."
  },
  "mosfet": {
    "title": "MOSFET",
    "category": "Power",
    "summary": "An N-channel switch controlled by gate voltage that draws almost no current and drives heavy loads.",
    "pins": [
      {
        "name": "G",
        "description": "Gate. The control lead; connects to an Uno pin."
      },
      {
        "name": "D",
        "description": "Drain. The load current enters here."
      },
      {
        "name": "S",
        "description": "Source. Connects to GND."
      }
    ],
    "howItWorksMd": "A MOSFET works with **voltage**: when the voltage between the gate and the source rises above the threshold (about 2 V), current flows between the drain and the source. The gate draws almost no current, so unlike an NPN you do not need to calculate a base current.\n\nCareful: not every MOSFET turns fully on at 5 V. With an Arduino you choose a **logic-level** one. When it conducts, its resistance is very small (about 0.05 Ω in the lab), so the motor sees almost the full 5 V and spins faster than with an NPN.\n\nBecause a motor is a coil, you still need a flyback diode.\n\n**Advanced:** The gate behaves like a small capacitor; in a real circuit you put a series resistor of around 100 Ω on the gate, and a 10 kΩ resistor between the gate and GND keeps the gate from floating at power-up.",
    "wiringMd": "| From | To |\n|---|---|\n| MOSFET **S** | Uno **GND** |\n| MOSFET **D** | Motor **M2** (and diode **A**) |\n| MOSFET **G** | Uno **D6** through a 100 Ω resistor |\n| 10 kΩ resistor | Between **G** and **GND** |\n\nThe motor's **M1** lead connects to 5V; the diode's K lead also goes to 5V.",
    "typicalValues": [
      {
        "label": "Threshold voltage",
        "value": "≈ 2 V",
        "note": "Lab model, logic level"
      },
      {
        "label": "On-resistance",
        "value": "≈ 0.05 Ω",
        "note": "Lab model"
      },
      {
        "label": "Motor speed at full throttle",
        "value": "≈ 0.83",
        "note": "≈ 0.70 with an NPN"
      },
      {
        "label": "Gate resistor",
        "value": "100 Ω",
        "note": "The standard in this site's lessons"
      }
    ],
    "commonMistakesMd": "- **Choosing a MOSFET that is not logic-level.** It does not turn on fully at 5 V and heats up.\n- **Not connecting the source to GND.** The current path is not complete.\n- **Leaving out the flyback diode.** The voltage spike from the coil can damage the MOSFET.\n- **Leaving the gate floating.** It can conduct randomly at power-up."
  },
  "mpu6050": {
    "title": "MPU6050 accelerometer and gyroscope",
    "category": "Input",
    "summary": "A three-axis accelerometer and gyroscope that talks over I2C. It measures tilt and rotation speed.",
    "pins": [
      {
        "name": "VCC",
        "description": "Power. Connects to 5V (needs at least about 3 V)."
      },
      {
        "name": "GND",
        "description": "Ground."
      },
      {
        "name": "SDA",
        "description": "I2C data line. A4 on the Uno."
      },
      {
        "name": "SCL",
        "description": "I2C clock line. A5 on the Uno."
      }
    ],
    "howItWorksMd": "The **MPU6050** is an I2C chip that contains a three-axis accelerometer and a three-axis gyroscope. The accelerometer measures gravity and acceleration in g, and the gyroscope measures rotation speed in °/s. The chip is asleep at power-up; it wakes up when you write 0 to register 0x6B. The measurements are in 14 bytes starting at 0x3B: acceleration X, Y, Z, temperature, gyroscope X, Y, Z (2 bytes each, high byte first, 16-bit signed).\n\nIn the default ranges, the raw value is divided by 16384 for acceleration (g) and by 131 for the gyroscope (°/s). Because a chip at rest measures gravity, the tilt angle is found with `atan2(ax, az)`. The accelerometer does not drift but is sensitive to vibration; the gyroscope is fast but builds up drift. The two are combined with a complementary filter.\n\n**Advanced:** The temperature is `raw / 340 + 36.53` degrees. A real gyroscope shows an offset of a few °/s when at rest; the datasheet allows a tolerance of up to ±20 °/s for the initial offset. The lab chip is ideal, so it has no offset and its temperature is fixed at 25 °C.",
    "wiringMd": "| From | To |\n|---|---|\n| MPU6050 **VCC** | Uno **5V** |\n| MPU6050 **GND** | Uno **GND** |\n| MPU6050 **SDA** | Uno **A4** |\n| MPU6050 **SCL** | Uno **A5** |\n\nThe properties panel has **İvme X, Y, Z** (Acceleration X, Y, Z, in g), **Jiroskop X, Y, Z** (Gyroscope X, Y, Z, in °/s) and **I2C adresi (AD0)** (I2C address). The values can also be changed while the program is running. If you choose address 0x69, you must also change the `MPU` constant in your code to 0x69.",
    "typicalValues": [
      {
        "label": "I2C address",
        "value": "0x68",
        "note": "0x69 if AD0 is connected to 5V"
      },
      {
        "label": "Chip lying flat",
        "value": "ax = 0, ay = 0, az = 1 g",
        "note": "Lab default"
      },
      {
        "label": "Acceleration conversion",
        "value": "raw / 16384",
        "note": "In the ±2 g range; 1 g = 16384"
      },
      {
        "label": "Gyroscope conversion",
        "value": "raw / 131",
        "note": "In the ±250 °/s range"
      },
      {
        "label": "Temperature",
        "value": "25 °C",
        "note": "Fixed for the lab chip"
      },
      {
        "label": "Tilt example",
        "value": "ax = 0.5, az = 0.866 → 30°",
        "note": "pitch = atan2(ax, az)"
      }
    ],
    "commonMistakesMd": "- **Forgetting to write 0 to register 0x6B.** The chip stays asleep.\n- **Writing ax / 16384.** Integer division gives 0; write 16384.0.\n- **Combining the bytes as unsigned.** A negative value shows up as something like 65000; use int16_t.\n- **Using it on the same bus as the RTC (DS3231).** Both are at address 0x68.\n- **Trusting the angle of a moving chip.** The accelerometer cannot tell gravity apart from the chip's own acceleration."
  },
  "mq2": {
    "title": "MQ-2 gas sensor",
    "category": "Sensor",
    "summary": "A module sensitive to flammable gases and smoke that reports, as an analog voltage, \"how much it has risen compared with clean air\". It cannot tell gas types apart.",
    "pins": [
      {
        "name": "VCC",
        "description": "Power lead. Connects to 5V; needs at least 4 V."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connects to GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Goes to one of the Uno's analog inputs (A3 in the lessons); the voltage rises as gas increases."
      },
      {
        "name": "DO",
        "description": "Digital output. Goes LOW when the gas level passes the threshold; not used in the lessons."
      }
    ],
    "howItWorksMd": "Inside the MQ-2 there is a heated sensing element. Flammable gases and smoke change the resistance of this element; the module reports this as a voltage on its analog output. As gas increases, AO rises. `analogRead` turns this voltage into a number from 0 to 1023.\n\nThe sensor **cannot tell** which gas it is. Also, the readings are unstable until the heater reaches its working temperature; on a real module the warm-up time is long. After it warms up, you measure a **baseline value** in clean air and write the alarm threshold as a multiple of the baseline (for example 1.5 times). To get a unit such as ppm you need the curve from the datasheet, the gas type and calibration; without these, you do not write ppm.\n\n**Advanced:** In the lab model, AO = VCC × (0.1 + 0.9 × gas level). In a real MQ-2, AO comes from a divider made of the sensor resistance and the module's load resistor, and warm-up and room temperature shift the value; the lab does not model this. The heater of a real MQ-2 also runs hot.",
    "wiringMd": "| From | To |\n|---|---|\n| MQ-2 **VCC** | Uno **5V** |\n| MQ-2 **GND** | Uno **GND** |\n| MQ-2 **AO** | Uno **A3** |\n\n**Gaz düzeyi** (Gas level, 0 to 1) in the properties panel simulates gas and can be changed while the program is running. **Eşik (DO)** (Threshold) only affects the digital output. The module does not work on a supply below 4 V; if you connect it to 3.3 V, it counts as unpowered.",
    "typicalValues": [
      {
        "label": "Gas level 0 (clean air)",
        "value": "raw ≈ 102",
        "note": "About 0.5 V; this is your baseline value"
      },
      {
        "label": "Gas level 0.03",
        "value": "raw ≈ 130",
        "note": "About 1.27 times the baseline"
      },
      {
        "label": "Gas level 0.1",
        "value": "raw ≈ 194",
        "note": "About 1.9 times the baseline"
      },
      {
        "label": "Gas level 0.3",
        "value": "raw ≈ 379",
        "note": "About 3.7 times the baseline"
      },
      {
        "label": "Gas level 1",
        "value": "raw = 1023",
        "note": "Full scale (5 V)"
      },
      {
        "label": "Alarm thresholds in the lessons",
        "value": "baseline × 1.5 and × 2.5",
        "note": "Turn-off thresholds are baseline × 1.25 and × 2"
      }
    ],
    "commonMistakesMd": "- **Not waiting for warm-up.** On a real module the baseline comes out wrong, and the alarm goes off falsely or never goes off.\n- **Measuring the baseline in air that contains gas.** The thresholds shift up and a real increase is missed.\n- **Comparing with a fixed number.** `okuma > 400` is meaningless on another module or in different air; use a multiple of the baseline.\n- **Converting the reading into a unit like ppm.** Without calibration the number is not reliable.\n- **Integer division.** If `ort / baz` are both `int`, you get 1 instead of 1.6; use `float` for the division.\n- **Using it alone for real safety.** This sensor and the lesson circuits are for education; they do not replace a certified detector."
  },
  "npn": {
    "title": "NPN transistor",
    "category": "Power",
    "summary": "An electronic switch that uses a small base current to control a much larger collector current.",
    "pins": [
      {
        "name": "B",
        "description": "Base. The control lead; connects to an Uno pin through a small resistor."
      },
      {
        "name": "C",
        "description": "Collector. The load current enters here (the load is usually between 5V and C)."
      },
      {
        "name": "E",
        "description": "Emitter. Connects to GND."
      }
    ],
    "howItWorksMd": "An Arduino pin is comfortable at about 20 mA; loads such as motors draw more current. An NPN transistor solves this problem: when the base-emitter voltage goes above about 0.7 V, a small **base current** flows and the transistor lets a much larger current pass from the collector to the emitter. The current gain in the lab is about 100.\n\nA **series resistor** limits the base current. With D6 = 5 V and 1 kΩ, the base current is (5 − 0.7) / 1000 = 4.3 mA. This is enough for a load current of up to 100 × 4.3 = 430 mA.\n\nIf the load is a coil, such as a motor, a **flyback diode** is placed across the motor to protect the transistor.\n\n**Advanced:** When it conducts, a saturation voltage (about 0.2 V) remains between collector and emitter; so the motor sees a little less than 5 V (about 4.2 V at full throttle).",
    "wiringMd": "| From | To |\n|---|---|\n| Transistor **E** | Uno **GND** |\n| Transistor **C** | Motor **M2** (and diode **A**) |\n| 1 kΩ resistor **2** | Transistor **B** |\n| 1 kΩ resistor **1** | Uno **D6** |\n\nThe motor's **M1** lead connects to 5V. If the base current goes above about 30 mA, the lab shows a warning.",
    "typicalValues": [
      {
        "label": "Base-emitter threshold",
        "value": "≈ 0.7 V",
        "note": "Lab model"
      },
      {
        "label": "Current gain",
        "value": "≈ 100",
        "note": "Lab model"
      },
      {
        "label": "Base resistor",
        "value": "1 kΩ",
        "note": "The standard in this site's lessons; base current ≈ 4.3 mA"
      },
      {
        "label": "Saturation voltage",
        "value": "≈ 0.2 V",
        "note": "Between C and E while conducting"
      },
      {
        "label": "Base current warning limit",
        "value": "30 mA",
        "note": "Above this, a warning appears"
      }
    ],
    "commonMistakesMd": "- **Leaving out the base resistor.** The base current is not limited; the lab shows a warning.\n- **Not connecting the emitter to GND.** The current path is not complete and the motor does not turn.\n- **Forgetting the flyback diode.** The voltage spike from the coil damages the transistor; the lab shows a warning.\n- **Mixing up the legs.** If B, C and E are swapped, the transistor does not conduct."
  },
  "ntc": {
    "title": "NTC thermistor",
    "category": "Input",
    "summary": "A two-lead part whose resistance drops as temperature rises. It is turned into a temperature by building a divider with a fixed resistor and using the beta formula.",
    "pins": [
      {
        "name": "1",
        "description": "First lead. It is not polarized; 1 and 2 can be swapped."
      },
      {
        "name": "2",
        "description": "Second lead."
      }
    ],
    "howItWorksMd": "An **NTC** (Negative Temperature Coefficient) thermistor is a resistor whose resistance **drops** as the temperature rises. The common type is 10 kΩ at 25 °C. The change in resistance with temperature is not linear; it follows an exponential curve.\n\nThe sensor is built as a voltage divider with a 10 kΩ fixed resistor: the fixed resistor between 5V and A2, the NTC between A2 and GND. When the temperature rises, the NTC's resistance gets smaller, so the A2 voltage and the `analogRead(A2)` value **decrease**. From the raw value, the NTC resistance is found with `R = 10000.0 × raw / (1024 − raw)`.\n\n**Advanced:** To get temperature from resistance, you use the beta formula: `1/T = 1/T0 + log(R / R0) / B`. Here T0 = 298.15 K, R0 = 10 kΩ, B = 3950 (lab model). The result is in Kelvin; for Celsius, subtract 273.15. A more accurate model is the Steinhart-Hart equation. For a real part, read the B value from its datasheet.",
    "wiringMd": "| From | To |\n|---|---|\n| NTC **1** | Uno **A2** and lead 2 of the 10 kΩ resistor |\n| NTC **2** | Uno **GND** |\n| Lead 1 of the 10 kΩ resistor | Uno **5V** |\n\nYou change the temperature while running with the **Sıcaklık** (Temperature) slider in the properties panel (-20 to 120 °C). You do not need to write `pinMode` for `analogRead`.",
    "typicalValues": [
      {
        "label": "0 °C",
        "value": "≈ 33.6 kΩ",
        "note": "B = 3950 model"
      },
      {
        "label": "25 °C",
        "value": "10 kΩ",
        "note": "Reference point; reading ≈ 512"
      },
      {
        "label": "50 °C",
        "value": "≈ 3.59 kΩ",
        "note": "Reading ≈ 270"
      },
      {
        "label": "100 °C",
        "value": "≈ 0.70 kΩ",
        "note": "Reading ≈ 67"
      },
      {
        "label": "Beta coefficient (B)",
        "value": "3950",
        "note": "Lab model; varies for a real part"
      }
    ],
    "commonMistakesMd": "- **Mixing up Kelvin and Celsius.** The formula gives Kelvin; if you forget to subtract 273.15, you see numbers like 298.\n- **Using `log10` instead of `log`.** The beta formula needs the natural logarithm.\n- **Writing the wrong fixed-resistor value in the code.** If you write 10000 in the code but use a different value in the circuit, the result is off.\n- **Writing `10000 * ham`.** The `int` overflows; write `10000.0 *`.\n- **Not checking for raw = 0 or 1023.** A disconnected or short-circuited sensor gives a meaningless temperature."
  },
  "pir": {
    "title": "PIR motion sensor",
    "category": "Sensor",
    "summary": "A sensor that detects changes in infrared radiation and sets its OUT output HIGH while there is motion; it needs a warm-up time at power-up.",
    "pins": [
      {
        "name": "VCC",
        "description": "Power. Connects to 5V in the lab."
      },
      {
        "name": "OUT",
        "description": "Digital output. HIGH while there is motion, LOW when there is none."
      },
      {
        "name": "GND",
        "description": "Ground. Connects to the Uno's GND."
      }
    ],
    "howItWorksMd": "A PIR (passive infrared) sensor detects changes in the infrared (heat) radiation around it. When a warm object (a person, an animal) moves in its field of view, the radiation changes and the OUT output goes HIGH. An object standing still, or a slowly changing room temperature, does not create this change. \"Passive\" means the sensor does not send out any light itself; it only listens.\n\nAfter the motion ends, the output stays HIGH for a while. In the lab this time is 3 seconds. At power-up the sensor waits through a warm-up time; during this, the output may jump around because of noise. In the lab the warm-up is 2 seconds, and the **Hareket** (Motion) box is ignored during it.\n\n**Advanced:** On real modules the warm-up time is usually around half a minute to a minute and depends on the module; most have adjustment screws for sensitivity and for how long the output stays HIGH. Which screw does what depends on the module, so check the datasheet. In applications such as an alarm, you ignore the PIR for this long after power-up (lesson 75).",
    "wiringMd": "| From | To |\n|---|---|\n| PIR **VCC** | Uno **5V** |\n| PIR **GND** | Uno **GND** |\n| PIR **OUT** | Uno **D2** |\n\nIn the code you write `pinMode(2, INPUT)`; because OUT drives its own voltage, `INPUT_PULLUP` is not needed. You give motion with the **Hareket** (Motion) box in the properties panel, and you can change it while running.",
    "typicalValues": [
      {
        "label": "Lab warm-up",
        "value": "2 s",
        "note": "On a real module usually half a minute to 1 minute, depending on the module"
      },
      {
        "label": "Stays HIGH after motion",
        "value": "3 s",
        "note": "Lab model"
      },
      {
        "label": "Supply threshold for operation",
        "value": "4 V",
        "note": "Below this the module counts as unpowered"
      },
      {
        "label": "Recommended wiring",
        "value": "OUT to D2",
        "note": "The standard in this site's lessons"
      }
    ],
    "commonMistakesMd": "- **Not allowing for the warm-up time.** At power-up the output jumps around because of noise, and the room is wrongly taken as \"occupied\".\n- **Using `INPUT_PULLUP`.** OUT drives its own voltage; plain `INPUT` is enough.\n- **Expecting the output to go LOW as soon as motion stops.** The output stays HIGH for a while.\n- **Expecting it to detect a person standing still.** A PIR detects motion (a change in radiation), not presence.\n- **Not connecting GND.** The circuit is not closed and the output is meaningless."
  },
  "potansiyometre": {
    "title": "Potentiometer",
    "category": "Input",
    "summary": "A three-lead resistor whose position you can change. A voltage between 0 and 5 V is read from its middle lead.",
    "pins": [
      {
        "name": "VCC",
        "description": "One end. Connects to 5V."
      },
      {
        "name": "SIG",
        "description": "Middle lead (wiper). Gives a voltage between 0 and 5 V depending on the position. Goes to one of the Uno's analog inputs."
      },
      {
        "name": "GND",
        "description": "The other end. Connects to GND."
      }
    ],
    "howItWorksMd": "A potentiometer (pot) contains a fixed resistive track between two ends and a **wiper** that slides along this track. If you connect the two ends of the track to 5 V and GND, the wiper gives a voltage between 0 V and 5 V depending on where it sits on the track. This is a **voltage divider**.\n\nWhen the wiper is turned towards the GND end, the SIG voltage approaches 0 V; when it is turned towards the VCC end, it approaches 5 V. In the lab the `Konum` (Position) property is between 0 and 1, and the SIG voltage is ≈ `Konum × 5 V`.\n\nOn the Arduino, `analogRead(A0)` turns this voltage into a number from 0 to 1023 (10-bit ADC). If the position is 0.5, the reading is about 512.\n\nThe pot's total resistance (for example 10 kΩ) between its ends stays the same whatever the wiper's position; the position only changes how this resistance is shared.",
    "wiringMd": "| From | To |\n|---|---|\n| Pot **VCC** | Uno **5V** |\n| Pot **GND** | Uno **GND** |\n| Pot **SIG** | Uno **A0** |\n\nYou change the position while running with the **Konum** (Position) slider in the properties panel. The total resistance can be set between 100 Ω and 1 MΩ; the default is 10 kΩ. You do not need to write `pinMode` for `analogRead`.",
    "typicalValues": [
      {
        "label": "Total resistance",
        "value": "10 kΩ",
        "note": "Default; the standard in this site's lessons"
      },
      {
        "label": "Position 0",
        "value": "≈ 0 V, reading ≈ 0",
        "note": "SIG close to GND"
      },
      {
        "label": "Position 0.5",
        "value": "≈ 2.5 V, reading ≈ 512",
        "note": "Midpoint"
      },
      {
        "label": "Position 1",
        "value": "≈ 5 V, reading ≈ 1023",
        "note": "SIG close to VCC"
      },
      {
        "label": "ADC step",
        "value": "≈ 4.9 mV",
        "note": "5 V / 1024"
      }
    ],
    "commonMistakesMd": "- **Connecting SIG to a digital pin and expecting an analog value.** Use A0-A5 for analog reading.\n- **Mixing up VCC and GND.** The pot works the other way round: the direction is reversed. It does no harm, but the result is reversed.\n- **Connecting the middle lead (SIG) to 5V or GND.** The reading stays fixed.\n- **Forgetting to connect SIG.** A floating analog input reads random numbers.\n- **Thinking the reading is directly a voltage.** `analogRead` gives a number from 0 to 1023; for the voltage, calculate `ham × 5.0 / 1024`."
  },
  "rain": {
    "title": "Rain sensor",
    "category": "Sensor",
    "summary": "A sensor that reports drops falling on its board as an analog voltage. The wetter it gets, the lower the output value.",
    "pins": [
      {
        "name": "VCC",
        "description": "Power lead. Connects to 5V."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connects to GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Goes to one of the Uno's analog inputs (A0 in the lessons); the voltage drops as it gets wet."
      },
      {
        "name": "DO",
        "description": "Digital output. Goes LOW when the wetness passes the threshold; not used in the lessons."
      }
    ],
    "howItWorksMd": "The rain sensor's board has two copper traces. Falling drops bridge these traces and the output voltage **drops**. On a dry board the output is high. `analogRead` turns the voltage into a number from 0 to 1023; the program uses a threshold to decide \"raining\" or \"not raining\".\n\nNear the threshold the reading can fluctuate and the state can change quickly; the cure is to use two thresholds (hysteresis). The direction and the numbers of the sensor vary from module to module; set the thresholds by measuring with the sensor you are actually using.\n\n**Advanced:** In the lab model, AO = VCC × (0.95 − 0.85 × wetness). So you get about 4.75 V when dry (raw ≈ 972) and about 0.5 V when fully wet (raw ≈ 102).",
    "wiringMd": "| From | To |\n|---|---|\n| Rain **VCC** | Uno **5V** |\n| Rain **GND** | Uno **GND** |\n| Rain **AO** | Uno **A0** |\n\nThe **Islaklık (yağmur)** (Wetness (rain), 0 to 1) slider in the properties panel sets how much rain falls on the board and can be changed while running. The module needs a supply of at least 3 V to work.",
    "typicalValues": [
      {
        "label": "Wetness 0 (dry)",
        "value": "raw ≈ 972",
        "note": "About 4.75 V"
      },
      {
        "label": "Wetness 0.5",
        "value": "raw ≈ 537",
        "note": "\"Raining\" if the threshold is 600"
      },
      {
        "label": "Wetness 1 (downpour)",
        "value": "raw ≈ 102",
        "note": "About 0.5 V"
      },
      {
        "label": "Threshold in the lesson",
        "value": "600",
        "note": "Below it means \"raining\"; this threshold was measured for the lab model"
      }
    ],
    "commonMistakesMd": "- **Assuming the direction is the other way round.** On this module the value does not rise in rain; it drops.\n- **Using a single threshold.** Near the threshold, \"VAR\" (yes) and \"YOK\" (no) flip back and forth quickly.\n- **Taking the threshold from another sensor.** Set the thresholds by measuring with the sensor you are using.\n- **Trusting a single measurement.** A single passing drop can cause a false alarm."
  },
  "reed": {
    "title": "Reed switch",
    "category": "Input",
    "summary": "A switch that connects its two leads when a magnet comes close; electrically, it is a button operated by a magnet.",
    "pins": [
      {
        "name": "A",
        "description": "First lead. Connects to B while a magnet is near."
      },
      {
        "name": "B",
        "description": "Second lead."
      }
    ],
    "howItWorksMd": "A reed switch consists of two thin metal reeds inside a glass tube. When a magnet comes close, the reeds touch each other and the contact **closes**; when the magnet moves away, the contact opens. In door and window alarms, one part is stuck to the frame and the magnet to the door.\n\nOn the Arduino it is read the same way as a button: one lead goes to a pin, the other lead to GND, and the pin is set to `INPUT_PULLUP`.\n- Magnet far (contact open): the pin is pulled up to 5 V, and `digitalRead` reads **HIGH**.\n- Magnet near (contact closed): the pin is connected to GND, and `digitalRead` reads **LOW**.\n\nA plain reed switch does not care which pole of the magnet comes near. A limit switch is also electrically a button (in the lab the button part is used in its place).\n\n**Advanced:** Real contacts bounce for a short time as they close; accepting a change only if it stays stable for a certain time prevents false events. In security applications, using a normally closed (NC) contact means a cut wire is also seen as a breach.",
    "wiringMd": "| From | To |\n|---|---|\n| Reed **A** | Uno **D4** |\n| Reed **B** | Uno **GND** |\n\nIn the code you write `pinMode(4, INPUT_PULLUP);`. The **Mıknatıs yakın** (Magnet near) box in the properties panel brings the magnet closer and takes it away; it can also be changed while running. The lab reed behaves like a bare reed switch: it has no resistor of its own, so `INPUT_PULLUP` is essential.",
    "typicalValues": [
      {
        "label": "Recommended wiring",
        "value": "A to D4, B to GND",
        "note": "The Module 4 standard on this site"
      },
      {
        "label": "Code setting",
        "value": "INPUT_PULLUP",
        "note": "No external resistor needed"
      },
      {
        "label": "Magnet near",
        "value": "LOW",
        "note": "Contact closed, ≈ 0.1 Ω"
      },
      {
        "label": "Magnet far",
        "value": "HIGH",
        "note": "Contact open, pulled up to 5 V by the internal pull-up ≈ 35 kΩ"
      }
    ],
    "commonMistakesMd": "- **Not writing `INPUT_PULLUP`.** When the contact is open the pin floats and the reading is random.\n- **Thinking \"magnet near = HIGH\".** With a pull-up, the pin goes LOW when the contact closes.\n- **Forgetting to connect lead B to GND.** Even if the contact closes, the pin does not go LOW.\n- **Leaving out debounce.** In a real circuit, false events appear when the door rattles.\n- **Mixing up NO and NC.** The circuit works the other way round."
  },
  "relay": {
    "title": "Relay module",
    "category": "Power",
    "summary": "A switch operated by an electromagnet. It opens and closes a circuit that is electrically separate from the Arduino.",
    "pins": [
      {
        "name": "VCC",
        "description": "Module power. Connects to 5V."
      },
      {
        "name": "GND",
        "description": "Ground. Connects to GND."
      },
      {
        "name": "IN",
        "description": "Signal input. Connects to an Uno pin."
      },
      {
        "name": "COM",
        "description": "Common terminal of the contact side."
      },
      {
        "name": "NO",
        "description": "Normally open terminal. Connected to COM when the relay is energised (pulled in)."
      },
      {
        "name": "NC",
        "description": "Normally closed terminal. Connected to COM when the relay is not energised."
      }
    ],
    "howItWorksMd": "When current flows through the relay coil, an electromagnet pulls a contact. The contact side is separate from the coil side and behaves only like a switch (a dry contact). The module already has the transistor that drives the coil and the flyback diode built in.\n\nMost modules are **active-LOW**: when the IN pin is LOW the relay pulls in, and when it is HIGH the relay releases. In the lab you choose this with the **Tetik** (Trigger) property.\n\nA relay is a mechanical part; it is not used for fast PWM. To avoid chattering near a threshold, two-threshold control (hysteresis) is used.\n\n**Advanced:** A contact rating (such as \"250 V\") is not a certificate of safe use. Working with mains voltage (220 V) can kill you and is a job only for a trained professional.",
    "wiringMd": "| From | To |\n|---|---|\n| Relay **VCC** | Uno **5V** |\n| Relay **GND** | Uno **GND** |\n| Relay **IN** | Uno **D7** |\n| Relay **COM** | Uno **5V** |\n| Relay **NO** | Resistor **1** (load) |\n\nIn the properties panel, set Tetik (Trigger) to \"LOW ile çeker\" (pulls in on LOW). If VCC is below 4 V or GND is missing, the relay does not pull in and a warning appears. The lab only offers low-voltage 5 V circuits.",
    "typicalValues": [
      {
        "label": "Trigger",
        "value": "pulls in on LOW",
        "note": "The lessons' assumption"
      },
      {
        "label": "Supply",
        "value": "5 V",
        "note": "Does not pull in below 4 V"
      },
      {
        "label": "Contact resistance",
        "value": "0.1 Ω",
        "note": "Lab model"
      },
      {
        "label": "Example load",
        "value": "≈ 9 mA",
        "note": "330 Ω and a red LED"
      },
      {
        "label": "Safe limit",
        "value": "5 V only",
        "note": "Mains voltage is a job for professionals"
      }
    ],
    "commonMistakesMd": "- **Experimenting with mains voltage.** It can kill you; it is never needed on this portal.\n- **Getting the active-LOW logic backwards.** The relay may stay pulled in at startup; write HIGH before `pinMode`.\n- **Connecting a bare relay to a pin.** The coil current is too high and the voltage spike damages the pin.\n- **Mixing up COM, NO and NC.** The load works the opposite way.\n- **Not connecting VCC or GND.** The relay does not pull in."
  },
  "rgbled": {
    "title": "RGB LED",
    "category": "Output",
    "summary": "A part that combines three LEDs (red, green and blue) in one package. You make any colour by mixing the brightness of the three channels.",
    "pins": [
      {
        "name": "R",
        "description": "Red channel lead. Connects through a resistor to a PWM pin (D9 on this site)."
      },
      {
        "name": "G",
        "description": "Green channel lead. Connects through a resistor to a PWM pin (D10 on this site)."
      },
      {
        "name": "B",
        "description": "Blue channel lead. Connects through a resistor to a PWM pin (D11 on this site)."
      },
      {
        "name": "COM",
        "description": "Common lead of the three channels. Goes to GND on a common cathode, to 5V on a common anode."
      }
    ],
    "howItWorksMd": "An **RGB LED** holds three separate LEDs (red, green and blue) in the same package. One lead of each of the three LEDs is joined into a single **COM** lead. If the cathodes are joined it is called **common cathode**; if the anodes are joined it is called **common anode**. In the lab the default is common cathode.\n\nWith light, colours **add up**: red + green gives yellow, green + blue gives cyan, red + blue gives purple, and all three together give white. If you set each channel separately with `analogWrite(pin, 0-255)`, you get about 16.7 million colours (256 × 256 × 256).\n\nOn a common cathode, a channel lights when its pin is HIGH. On a common anode the logic is reversed: COM goes to 5V and a channel lights when its pin is LOW. That is why you write `analogWrite(pin, 255 - değer)` (değer = value).\n\n**Advanced:** The three LEDs are made from different semiconductors, so their forward voltages differ: red is the lowest, blue the highest. With the same resistor, the blue channel's current is smaller and blue looks dimmer. That is why (255, 255, 255) may look like a slightly tinted white in the lab. In a real circuit you can choose different resistor values for the channels to balance the colour.",
    "wiringMd": "| From | To |\n|---|---|\n| Uno **D9** | Resistor lead 1; resistor lead 2 to RGB **R** |\n| Uno **D10** | Resistor lead 1; resistor lead 2 to RGB **G** |\n| Uno **D11** | Resistor lead 1; resistor lead 2 to RGB **B** |\n| RGB **COM** | Uno **GND** (common cathode) |\n\nEach channel must have its own resistor. In the properties panel you choose common cathode or common anode in the **Ortak uç** (Common lead) field; on a common anode, COM connects to the Uno 5V. All three pins can do PWM, so you set the brightness of each channel separately.",
    "typicalValues": [
      {
        "label": "Red channel Vf",
        "value": "1.9 V",
        "note": "Lab model"
      },
      {
        "label": "Green channel Vf",
        "value": "2.2 V",
        "note": "Lab model"
      },
      {
        "label": "Blue channel Vf",
        "value": "3.0 V",
        "note": "Lab model"
      },
      {
        "label": "Series resistor (5 V)",
        "value": "330 Ω",
        "note": "A separate one for each channel; the standard in this site's lessons"
      },
      {
        "label": "Channel current (330 Ω, pin HIGH)",
        "value": "red ≈ 8.6 mA, green ≈ 7.8 mA, blue ≈ 5.6 mA",
        "note": "Lab model; includes the pin and LED internal resistance"
      },
      {
        "label": "Burn-out limit",
        "value": "30 mA",
        "note": "A channel burns out if it goes above this; start over with ↺"
      },
      {
        "label": "Number of colours",
        "value": "≈ 16.7 million",
        "note": "256 × 256 × 256"
      }
    ],
    "commonMistakesMd": "- **Connecting COM to the wrong place.** On a common cathode LED, COM goes to GND. If you connect it to 5V the channels do not light.\n- **Not inverting the values on a common anode.** You ask for red and see cyan; write `255 - değer`.\n- **Using one resistor for all three channels.** The channels affect each other's brightness; give each channel its own resistor.\n- **Mixing up the R, G and B leads.** The colours come out different from what you expect; check your wires.\n- **Connecting to a pin without PWM.** Brightness control does not work; the channel only turns fully on or off. Use D9, D10 and D11."
  },
  "rtc": {
    "title": "RTC clock module",
    "category": "Sensor",
    "summary": "A clock module read over I2C that keeps the real date and time even when unplugged (DS3231 type).",
    "pins": [
      {
        "name": "VCC",
        "description": "Supply. In the lab it connects to the Uno 5V."
      },
      {
        "name": "GND",
        "description": "Ground."
      },
      {
        "name": "SDA",
        "description": "I2C data line. A4 on the Uno."
      },
      {
        "name": "SCL",
        "description": "I2C clock line. A5 on the Uno."
      }
    ],
    "howItWorksMd": "An **RTC** (Real Time Clock) is a separate chip that counts seconds with its own crystal and knows the calendar. The Arduino only asks it over I2C; the counting is done by the chip itself. `millis()` starts from zero when the board powers up and is forgotten when power is lost; an RTC, on the other hand, keeps the real date and time.\n\nReal modules have a **backup battery holder**: when main power is lost, this battery keeps the clock running. If there is no battery or it is flat, the time is lost and must be set again. The library (RTClib) gives the time as a `DateTime` with `rtc.now()`, sets the clock with `rtc.adjust()`, and tells you whether the clock has stopped with `rtc.lostPower()`.\n\nAn RTC does not know about daylight saving time or time zones; it only counts on from the numbers you set.\n\n**Advanced:** The DS3231's clock crystal is inside the chip and it corrects itself for temperature; on the DS1307 the crystal is fitted externally and is affected more by temperature. The DS1307 has no hardware alarm. Both use address 0x68 on I2C.",
    "wiringMd": "| From | To |\n|---|---|\n| RTC **SDA** | Uno **A4** |\n| RTC **SCL** | Uno **A5** |\n| RTC **VCC** | Uno **5V** |\n| RTC **GND** | Uno **GND** |\n\nIn code you write `#include <RTClib.h>` and `RTC_DS3231 rtc;`; `rtc.begin()` returns `false` if the module is not on the bus. The lab does not model the backup battery or power loss: every time you press ▶ (or after ↺ Sıfırla (Reset)) the RTC starts from 2026-01-01 00:00:00 and `lostPower()` always returns `false`. You set the time with `rtc.adjust()`.",
    "typicalValues": [
      {
        "label": "I2C address",
        "value": "0x68",
        "note": "The MPU6050 also uses 0x68 by default; do not connect both on the same bus"
      },
      {
        "label": "Lab start time",
        "value": "2026-01-01 00:00:00",
        "note": "Starts from this value on every run"
      },
      {
        "label": "Connection",
        "value": "SDA A4, SCL A5",
        "note": "The standard I2C pins of Module 4"
      },
      {
        "label": "Library class",
        "value": "RTC_DS3231",
        "note": "RTC_DS1307 for the DS1307"
      }
    ],
    "commonMistakesMd": "- **Putting the `adjust(__DATE__, __TIME__)` line unconditionally in `setup()`.** Every time the board powers up, the clock jumps back to the moment the code was compiled; only set it if `lostPower()` is true.\n- **Connecting the MPU6050 and the RTC on the same bus.** Both use 0x68 and they clash.\n- **Trying to keep time with `millis()`.** When power is lost `millis()` resets; the RTC keeps going.\n- **Swapping SDA and SCL or leaving VCC/GND unconnected.** `rtc.begin()` returns false and the program prints \"RTC bulunamadi\" (RTC not found).\n- **Assuming month, day and hour values have two digits.** `month()` returns 3 for March; you add the leading zero yourself."
  },
  "servo": {
    "title": "Servo motor",
    "category": "Output",
    "summary": "A small motor that turns its shaft to an angle between 0 and 180 degrees according to a control signal and holds it there.",
    "pins": [
      {
        "name": "SIG",
        "description": "Control signal. Goes to an Uno digital pin (for example D6); the pulse width sets the angle."
      },
      {
        "name": "VCC",
        "description": "Supply. Connects to 5V (in the lab at least about 4 V is needed)."
      },
      {
        "name": "GND",
        "description": "Ground."
      }
    ],
    "howItWorksMd": "A **servo** is a box containing a motor, gears and position feedback. The width of a pulse that arrives every 20 ms sets the angle. In Arduino's `Servo` library, `write(0)` produces a pulse of about 544 µs and `write(180)` about 2400 µs; angles in between are linear. `write(90)` gives about 1472 µs.\n\nThe servo reaches the commanded angle by itself and stays there, so you do not need to write a loop for the angle. Pushing against the mechanical ends (0 and 180) strains the servo; in projects the angle is limited to a safe range such as 10...170 with `constrain`.\n\n**Advanced:** Under load a real servo draws current and the 5 V can drop; that is why in a real setup the servo is powered from a separate 5 V supply and the GNDs are connected together. The lab does not model this voltage drop.",
    "wiringMd": "| From | To |\n|---|---|\n| Servo **SIG** | Uno **D6** (or another digital pin) |\n| Servo **VCC** | Uno **5V** |\n| Servo **GND** | Uno **GND** |\n\nThe program uses `#include <Servo.h>`, `servo.attach(6)` and `servo.write(açı)` (açı = angle). The lab calculates the servo's shaft angle from the incoming pulse width and shows it.",
    "typicalValues": [
      {
        "label": "Pulse width range",
        "value": "544...2400 µs",
        "note": "Servo library default"
      },
      {
        "label": "0°",
        "value": "≈ 544 µs",
        "note": "Lower end"
      },
      {
        "label": "90°",
        "value": "≈ 1472 µs",
        "note": "Middle"
      },
      {
        "label": "70°",
        "value": "≈ 1266 µs",
        "note": "544 + 70/180 x 1856"
      },
      {
        "label": "Safe angle range",
        "value": "10...170°",
        "note": "Recommended limit for projects"
      },
      {
        "label": "Minimum supply",
        "value": "≈ 4 V",
        "note": "Lab model"
      }
    ],
    "commonMistakesMd": "- **Connecting the servo to 3V3 instead of 5V.** In the lab the servo does not work (it needs at least about 4 V).\n- **Driving the angle all the way to the mechanical ends.** The servo strains, heats up and makes noise.\n- **Writing microseconds or radians instead of degrees in write().** The servo goes to an unexpected angle.\n- **Powering a real servo from the board's 5 V pin.** Under load the board can reset.\n- **Not connecting the GNDs together.** The servo cannot read the signal."
  },
  "sevenseg": {
    "title": "7-segment display",
    "category": "Output",
    "summary": "A display made of seven bars and a dot that shows a single digit. Each bar is a separate LED.",
    "pins": [
      {
        "name": "a",
        "description": "Segment A (top horizontal bar)."
      },
      {
        "name": "b",
        "description": "Segment B (upper right vertical bar)."
      },
      {
        "name": "c",
        "description": "Segment C (lower right vertical bar)."
      },
      {
        "name": "d",
        "description": "Segment D (bottom horizontal bar)."
      },
      {
        "name": "e",
        "description": "Segment E (lower left vertical bar)."
      },
      {
        "name": "f",
        "description": "Segment F (upper left vertical bar)."
      },
      {
        "name": "g",
        "description": "Segment G (middle horizontal bar)."
      },
      {
        "name": "dp",
        "description": "Dot LED (decimal point)."
      },
      {
        "name": "COM",
        "description": "Common lead. Connects to GND on a common cathode display, to 5V on a common anode display."
      }
    ],
    "howItWorksMd": "A **7-segment display** is made of seven small LED bars (a-g) and one dot LED (dp). Which bars are lit decides which digit you see. Because each bar is a separate LED, it must have **its own series resistor**.\n\nThere are two kinds of display. On a **common cathode** display the negative leads of all LEDs are joined at COM; COM connects to GND and a bar lights when it is driven HIGH. On a **common anode** display the positive leads are joined; COM connects to 5V and a bar lights when it is driven LOW. That is why the pattern is inverted on a common anode display.\n\nDriving eight LEDs with eight pins is costly; in the lessons this is reduced to three pins with a 74HC595. One digit is one byte: bit 0 = a, bit 1 = b, ... bit 6 = g, bit 7 = dp.\n\n**Advanced:** On multi-digit displays the digits are lit one after another very quickly (multiplexing), and the eye thinks they are all lit at once. The part in the lab is single-digit and models each bar like an LED.",
    "wiringMd": "| From | To |\n|---|---|\n| 74HC595 **QA** ... **QG** | Each through a 330 Ω resistor to display lead **a** ... **g** |\n| 74HC595 **QH** (optional) | Through a resistor to display lead **dp** |\n| Display **COM** | **GND** (common cathode) |\n\nWhen you select the part, the **Ortak uç** (Common lead) option appears in the properties panel: \"Ortak katot\" (common cathode, the default) or \"Ortak anot\" (common anode). While it runs, you can select a resistor and see the bar current with **Sanal ölçüm** (Virtual measurement).",
    "typicalValues": [
      {
        "label": "Segment forward voltage (Vf)",
        "value": "1.9 V",
        "note": "Lab model"
      },
      {
        "label": "Series resistor (with 74HC595)",
        "value": "330 Ω",
        "note": "About 8 mA per bar"
      },
      {
        "label": "74HC595 output resistance",
        "value": "50 Ω",
        "note": "Lab model"
      },
      {
        "label": "Default common lead",
        "value": "Common cathode",
        "note": "COM connects to GND"
      },
      {
        "label": "Digit 1 pattern",
        "value": "0x06",
        "note": "Only b and c light (bit 1 and bit 2)"
      }
    ],
    "commonMistakesMd": "- **Not giving each bar its own resistor.** The bar draws too much current; the lab shows a warning. Seven bars need seven resistors.\n- **Mixing up common anode and common cathode.** The digits look inverted; on a common anode, COM connects to 5V and the pattern is inverted with `~RAKAM[i]`.\n- **Mixing up the bar names.** The a-g order must match the bit order; otherwise the digits look garbled.\n- **Putting a single resistor on COM.** The brightness changes with the number of lit bars (two bars light for 1, seven for 8)."
  },
  "soil": {
    "title": "Soil moisture sensor",
    "category": "Sensor",
    "summary": "A module that reports how wet the soil is as an analog voltage. The output value drops as the soil gets wetter.",
    "pins": [
      {
        "name": "VCC",
        "description": "Supply lead. Connects to 5V."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connects to GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Goes to an Uno analog input (A2 in the lessons); the voltage drops as the soil gets wetter."
      },
      {
        "name": "DO",
        "description": "Digital output. Goes LOW when the moisture threshold is crossed; not used in the lessons."
      }
    ],
    "howItWorksMd": "The soil moisture module turns the moisture of the soil into a voltage. On the module in the lab, **the output is high when dry and drops as it gets wetter**. `analogRead` turns this voltage into a number from 0 to 1023. To turn the number into a percentage, you measure the dry and wet end values and use `map` and `constrain`.\n\nIn real life there are two kinds. A **resistive** sensor has bare metal probes buried in the soil that corrode over time. A **capacitive** sensor has probes covered with insulation and usually lasts longer. The output direction and the numbers vary from maker to maker; you need to calibrate every sensor with its own dry and wet measurements.\n\n**Advanced:** In the lab model, AO = VCC × (0.9 − 0.6 × moisture). So with 5 V you get about 4.5 V (raw ≈ 921) at moisture 0 and about 1.5 V (raw ≈ 307) at moisture 1.",
    "wiringMd": "| From | To |\n|---|---|\n| Soil moisture **VCC** | Uno **5V** |\n| Soil moisture **GND** | Uno **GND** |\n| Soil moisture **AO** | Uno **A2** |\n\nThe **Toprak nemi** (Soil moisture) slider (0 to 1) in the properties panel sets how wet the soil is and can be changed while the program is running. **Eşik (DO)** (Threshold) is only used for the digital output. The module needs a supply of at least 3 V to work.",
    "typicalValues": [
      {
        "label": "Moisture 0 (dry)",
        "value": "raw ≈ 921",
        "note": "About 4.5 V"
      },
      {
        "label": "Moisture 0.5",
        "value": "raw ≈ 614",
        "note": "Midpoint"
      },
      {
        "label": "Moisture 1 (wet)",
        "value": "raw ≈ 307",
        "note": "About 1.5 V"
      },
      {
        "label": "Calibration example",
        "value": "KURU = 800, ISLAK = 350",
        "note": "A raw value of 575 is about 50%"
      },
      {
        "label": "Reading noise",
        "value": "average of 8 readings",
        "note": "A single reading can be misleading"
      }
    ],
    "commonMistakesMd": "- **Not knowing the direction.** Assuming \"a bigger number means wetter\"; on this module the value drops as it gets wetter.\n- **Forgetting `constrain`.** Readings outside the calibration give values like -26% or 130%.\n- **Using another sensor's end values.** The percentage comes out wrong.\n- **Leaving a resistive sensor in the soil and powered all the time.** The probes corrode and the reading drifts over time.\n- **Looking at a single reading.** Because of noise you need to take an average."
  },
  "sound": {
    "title": "Sound sensor",
    "category": "Sensor",
    "summary": "A sound module with a microphone. When it is quiet the analog output sits at a baseline level; as sound arrives it moves away from that level.",
    "pins": [
      {
        "name": "VCC",
        "description": "Supply lead. Connects to 5V; needs at least 3 V."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connects to GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Goes to an Uno analog input (A0 in the lessons); the voltage rises as the sound gets louder."
      },
      {
        "name": "DO",
        "description": "Digital output. Goes LOW when the loudness crosses the threshold; not used in the lessons."
      }
    ],
    "howItWorksMd": "The sound module has a microphone and an amplifier. When the surroundings are quiet, the analog output sits at a steady **baseline level**. With a real microphone, when sound arrives the output swings both above and below this level; that is why the deviation is calculated with `abs(analogRead - baz)` (baz = baseline). The baseline differs from module to module, so it is not assumed but measured at startup.\n\nHeight alone is not enough to recognise a clap: you also look at the **duration** of the event. A very short sound is noise, and a very long sound (music, shouting) is not a clap.\n\n**Advanced:** In the lab model, AO = VCC × (0.25 + 0.7 × loudness) and it only goes up; it does not model the two-way swing of a real microphone. When quiet (loudness 0), AO = 1.25 V, so `analogRead` ≈ 256 (not 512).",
    "wiringMd": "| From | To |\n|---|---|\n| Sound sensor **VCC** | Uno **5V** |\n| Sound sensor **GND** | Uno **GND** |\n| Sound sensor **AO** | Uno **A0** |\n\nThe **Ses şiddeti** (Loudness) slider (0 to 1) in the properties panel simulates sound and can be changed while the program is running. To simulate a clap, set the loudness to 0.8 and immediately set it back to 0. **Eşik (DO)** (Threshold) only affects the digital output.",
    "typicalValues": [
      {
        "label": "Loudness 0 (quiet)",
        "value": "raw ≈ 256",
        "note": "About 1.25 V; the baseline"
      },
      {
        "label": "Loudness 0.1",
        "value": "raw ≈ 327",
        "note": "Deviation from baseline ≈ 71"
      },
      {
        "label": "Loudness 0.5",
        "value": "raw ≈ 614",
        "note": "Deviation from baseline ≈ 358"
      },
      {
        "label": "Loudness 0.8",
        "value": "raw ≈ 829",
        "note": "Deviation from baseline ≈ 573"
      },
      {
        "label": "Peak threshold in the lessons",
        "value": "150",
        "note": "Smaller deviations do not count as an event"
      },
      {
        "label": "Duration limits in the lessons",
        "value": "10 ms and 500 ms",
        "note": "Short noise / clap / long sound"
      }
    ],
    "commonMistakesMd": "- **Assuming the baseline is 512.** The module's baseline is different; always measure it.\n- **Measuring the baseline while there is sound.** All the deviations are calculated wrong.\n- **Ending the event after a single sample.** When the swinging signal crosses the baseline, a single clap looks like two events; use a quiet margin.\n- **Looking only at height.** A slamming door also looks like a clap; check the duration too.\n- **Forgetting `abs()`.** A real microphone also swings below the baseline."
  },
  "sr595": {
    "title": "74HC595 shift register",
    "category": "Output",
    "summary": "A chip that turns three Uno pins into eight outputs. It receives bits serially, drives eight pins at once and can be chained.",
    "pins": [
      {
        "name": "QA",
        "description": "Output 1 (bit 0)."
      },
      {
        "name": "QB",
        "description": "Output 2 (bit 1)."
      },
      {
        "name": "QC",
        "description": "Output 3 (bit 2)."
      },
      {
        "name": "QD",
        "description": "Output 4 (bit 3)."
      },
      {
        "name": "QE",
        "description": "Output 5 (bit 4)."
      },
      {
        "name": "QF",
        "description": "Output 6 (bit 5)."
      },
      {
        "name": "QG",
        "description": "Output 7 (bit 6)."
      },
      {
        "name": "QH",
        "description": "Output 8 (bit 7)."
      },
      {
        "name": "SER",
        "description": "Serial data input; the bits arrive on this wire."
      },
      {
        "name": "SRCLK",
        "description": "Shift clock; one bit shifts in on each rising edge."
      },
      {
        "name": "RCLK",
        "description": "Latch clock; on a rising edge the byte inside is copied to the outputs."
      },
      {
        "name": "OE",
        "description": "Output enable (active-LOW). If connected to GND the outputs are on; if connected to 5V they are off."
      },
      {
        "name": "SRCLR",
        "description": "Register clear (active-LOW). If connected to 5V it works normally; if on GND the register is cleared."
      },
      {
        "name": "QH_",
        "description": "Serial output (QH'). Connect it to the SER lead of the next chip to build a chain."
      },
      {
        "name": "VCC",
        "description": "Supply, 5V."
      },
      {
        "name": "GND",
        "description": "Ground."
      }
    ],
    "howItWorksMd": "The **74HC595** is a shift register that turns bits arriving one after another into eight outputs. The Uno sends the bits on the SER wire, and one bit shifts in each time SRCLK gets a pulse. Once eight bits are in, RCLK (the latch) goes high and copies the byte to the outputs all at once. The outputs do not change before the latch.\n\n`shiftOut(veri, saat, MSBFIRST, bayt)` (data, clock, MSBFIRST, byte) does this job. With MSBFIRST the most significant bit goes first; the last bit sent, bit 0, ends up on QA. The latch is driven by one pin: `digitalWrite(mandal, LOW)`, `shiftOut`, `digitalWrite(mandal, HIGH)` (mandal = latch). Three pins (SER, SRCLK, RCLK) are enough.\n\nIf there is a second chip, the first chip's QH_ lead connects to the second chip's SER lead; the clock and latch are shared by both. This way you get 16 outputs from three pins.\n\n**Advanced:** Each output can only supply a limited current on its own (on the real chip up to about 35 mA per pin is allowed); every LED needs its own resistor.",
    "wiringMd": "| From | To |\n|---|---|\n| **VCC** and **SRCLR** | **5V** |\n| **GND** and **OE** | **GND** |\n| **SER** | Uno **D4** |\n| **SRCLK** | Uno **D6** |\n| **RCLK** | Uno **D5** |\n| **QA** ... **QG** | Through resistors to the display's a ... g leads (or to LEDs) |\n\nIf you leave OE and SRCLR unconnected, the lab shows an \"unconnected input\" warning: if OE is left open the outputs are treated as off, and if SRCLR is left open the register is treated as constantly cleared. If VCC and GND are not connected, an \"unpowered\" warning appears; there is no output.",
    "typicalValues": [
      {
        "label": "Number of outputs",
        "value": "8",
        "note": "QA-QH"
      },
      {
        "label": "Uno pins needed",
        "value": "3",
        "note": "SER, SRCLK, RCLK"
      },
      {
        "label": "Output resistance",
        "value": "50 Ω",
        "note": "Lab model"
      },
      {
        "label": "Counts as powered",
        "value": "4 V and above",
        "note": "Difference between VCC and GND"
      },
      {
        "label": "Chain of two chips",
        "value": "16 outputs",
        "note": "Still 3 Uno pins"
      }
    ],
    "commonMistakesMd": "- **Not using the latch.** The bits shift in but the outputs do not change; the display stays blank.\n- **Wiring OE or SRCLR wrong.** If you connect OE to 5V or SRCLR to GND, the chip gives no output or clears the register.\n- **Forgetting the power wires.** If VCC and GND are not connected, the chip does not work.\n- **Mixing up the bit order.** If you write LSBFIRST instead of MSBFIRST, the pattern appears in the reverse direction.\n- **Not giving each output a resistor.** The LED or bar draws too much current."
  },
  "waterlevel": {
    "title": "Water level sensor",
    "category": "Sensor",
    "summary": "A sensor that reports, as an analog voltage, how much of a stick with bare traces is under water. The output value rises as the water rises.",
    "pins": [
      {
        "name": "VCC",
        "description": "Supply lead. Connects to 5V."
      },
      {
        "name": "GND",
        "description": "Ground lead. Connects to GND."
      },
      {
        "name": "AO",
        "description": "Analog output. Goes to an Uno analog input (A1 in the lessons); the voltage rises as the water rises."
      },
      {
        "name": "DO",
        "description": "Digital output. Goes LOW when the level crosses the threshold; not used in the lessons."
      }
    ],
    "howItWorksMd": "The water level sensor's stick has bare conductive traces. As the water rises, more of the traces are under water and the output voltage **rises**. This is the opposite of the soil moisture and rain sensors. `analogRead` turns the voltage into a number; in the program, thresholds separate states such as \"empty\", \"half\" or \"full\".\n\nEven at 5 V the stick does not reach full scale (1023); its highest value is about 819. So thresholds should be chosen according to the sensor's real range, not according to 1023. The bare traces in contact with water can wear away over time; for a real sensor, check the datasheet.\n\n**Advanced:** In the lab model, AO = VCC × (0.05 + 0.75 × level). At level 0 you get about 0.25 V (raw ≈ 51), and at level 1 about 4 V (raw ≈ 819).",
    "wiringMd": "| From | To |\n|---|---|\n| Water level **VCC** | Uno **5V** |\n| Water level **GND** | Uno **GND** |\n| Water level **AO** | Uno **A1** |\n\nThe **Su seviyesi** (Water level) slider (0 to 1) in the properties panel sets how much of the stick is under water and can be changed while running. The module needs a supply of at least 3 V to work.",
    "typicalValues": [
      {
        "label": "Level 0 (empty)",
        "value": "raw ≈ 51",
        "note": "About 0.25 V"
      },
      {
        "label": "Level 0.4",
        "value": "raw ≈ 358",
        "note": "\"Half\" according to the lesson's thresholds"
      },
      {
        "label": "Level 1 (completely full)",
        "value": "raw ≈ 819",
        "note": "About 4 V; does not reach 1023"
      },
      {
        "label": "Thresholds in the lesson",
        "value": "300 and 600",
        "note": "Below is empty, between is half, above is full"
      }
    ],
    "commonMistakesMd": "- **Assuming the direction is reversed.** On this sensor the value rises as the water rises.\n- **Choosing thresholds based on 1023.** The stick's top value is about 819.\n- **Using a single threshold.** When the water surface ripples, the state flips quickly.\n- **Leaving the sensor in water all the time.** The bare traces wear away over time."
  }
}
