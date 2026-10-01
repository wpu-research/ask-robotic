# Ders denetleyicisi

Arduino Uno sketch'lerini derler (`arduino-cli`) ve avr8js ile başsız çalıştırır.

```
node tools/sim/check.mjs modul-3 h1      # tek hafta
node tools/sim/check.mjs modul-3         # hepsi
```

## Ders dosyası (`content-src/modul-3/h1/03-blink.md`)
```
# Başlık
süre: 20            (15-40 dk)

## Merak          → ders sorusu/hikâyesi
## Etkinlik       → devre tablosu, sketch'ler, açıklama, "Dene", "Sık yapılan hatalar"
## Konuşalım      → ders sonu sorusu
```
Etkinlik içindeki ` ```cpp ` bloğu `// sketch: ad` ile başlıyorsa **denetlenir** (derlenir, varsa `checks.mjs` kontrolü çalışır).
Sketch adları bir hafta içinde benzersiz olmalı. İşaretsiz ` ```cpp ` blokları yalnızca gösterim içindir.

## Davranış kontrolü (`hN/checks.mjs`)
`export default { <sketch_adı>(sim, kaynak) { ... } }` — tutmayan koşulda `assert` fırlat.

`Sim` API'si (pin: 0-13, 'A0'-'A5'):
| Yöntem | Ne yapar |
|---|---|
| `sim.run(ms)` | ms milisaniye benzetim ilerletir (birikimlidir) |
| `sim.read(pin)` | pin şu an HIGH mı |
| `sim.drive(pin, high)` | pini dışarıdan sürer. **Girişler varsayılan HIGH** (INPUT_PULLUP gibi). Basılı buton = `drive(pin,false)`. Pull-down'lı düz INPUT için `drive(pin,false)` ile başla |
| `sim.analog(kanal, volt)` | A0-A5'e 0-5 V uygular (`sim.analog(0, 2.5)` → analogRead ≈ 512) |
| `sim.serial` | şimdiye kadar yazılan seri çıktı (string) |
| `sim.sendSerial(metin)` | seri girişe veri gönderir |
| `sim.pinEdges(pin, from, to)` | pin değişimleri `{pin,value,t}` (t: ms) |
| `sim.wave(pin, from, to)` | `{hz, duty, periods}` — PWM/tone/blink ölçümü |
| `sim.pulseWidthsUs(pin, from, to)` | HIGH darbe genişlikleri (µs) — servo, HC-SR04 |
| `sim.nowMs()` | benzetim zamanı |
| `sim.eeprom.backend.memory` | EEPROM baytları (Uint8Array) |

Doğrulanmış ölçümler: Blink 1 Hz %50; `analogWrite(9,128)` ≈ 490 Hz %50; `tone(8,440)` ≈ 440 Hz; `Servo.write(90)` ≈ 1472 µs; `analogRead` 2,5 V → 512.

## Sınırlar
LCD, I2C cihazları, sıcaklık/ışık gibi gerçek sensörler yok: LCD/I2C sketch'leri yalnızca **derlenir**. Sensörleri `sim.analog` veya `sim.drive` ile taklit et. `pulseIn` gibi zamanlamalı sensörler (HC-SR04, DHT) harici model gerektirir; bu aşamada yalnız derlenir.

---

# Cihaz modelleri (Modül 4) — `packages/sim/src/devices.ts` (`@ask/sim`)
Gerçek Arduino kütüphaneleriyle doğrulandı. `createSim` sonrası, `sim.run()` ÖNCESİ bağla.

| Çağrı | Ne yapar |
|---|---|
| `const u = sim.hcsr04({trig, echo, cm})` | HC-SR04. `u.cm = 40` ile mesafeyi canlı değiştir. 2 cm altı ve 400 cm üstü = echo yok (pulseIn 0 döner). `pulseIn` ve NewPing çalışır |
| `const d = sim.dht({pin, type:'DHT22'\|'DHT11', tempC, humidity})` | Adafruit DHT kütüphanesiyle çalışır. `d.tempC`, `d.humidity` canlı. DHT11 tam sayıya yuvarlar. Kütüphane okumalar arası ≥2 sn bekler |
| `const b = sim.bmp280({address:0x76, tempC, pressurePa})` | Adafruit_BMP280 ile çalışır. `b.tempC`, `b.pressurePa` canlı |
| `const m = sim.mpu6050({ax,ay,az (g), gx,gy,gz (°/s), tempC})` | Ham `Wire` ile 0x68. `m.ax…` canlı. Varsayılan ±2 g, ±250 °/s |
| `const r = sim.rtc({start: new Date(...)})` | DS3231/DS1307 0x68, RTClib ile çalışır. Saat benzetim zamanıyla ilerler |
| `const lcd = sim.lcd({rs,en,d4,d5,d6,d7})` | Paralel LiquidCrystal. `lcd.text` = satır dizisi (16 karakter, boşluk dolgulu) |
| `const lcd = sim.lcdI2C({address:0x27})` | LiquidCrystal_I2C. `lcd.text`, `lcd.backlight`. NOT: kütüphane başlangıçta ~1 sn bekler, ≥1500 ms çalıştır |
| `const k = sim.keypad({rows:[..], cols:[..]})` | Keypad kütüphanesiyle (sütunlar taranır, satırlar okunur). `k.press('5')`, `k.release()` |
| `sim.state(pin)` | 'High' \| 'Low' (çıkış) ya da 'Input' \| 'InputPullUp' |
| `sim.i2c.add({address, write(v), read()})` | Özel I2C cihazı. `registerDevice` (packages/sim/src/devices.ts) yazmaç göstergeli cihazlar içindir |

Basit sensörler (PIR, IR engel, reed, buton, joystick, enkoder, flame/MQ-2/toprak nemi/ses) için model GEREKMEZ: `sim.drive(pin, high)` ve `sim.analog(kanal, volt)` yeterli. Döner enkoder: CLK/DT pinlerini `drive` ile 90° faz farklı sür.

**Yalnızca derlenebilen** (davranış kontrolü yok): MFRC522 (RC522), IRremote, SD, VL53L0X (Pololu), Adafruit SSD1306/GFX. Bunları `checks.mjs`'e koyma; derste dürüstçe "kayıtlı örnek/kod anlatımı" olarak işle, simülatör iddiası yazma.

Kurulu kütüphaneler: Servo, LiquidCrystal, LiquidCrystal_I2C, Wire, EEPROM, SPI, SoftwareSerial, DHT sensor library, Adafruit Unified Sensor, Adafruit BMP280, Adafruit BusIO, RTClib, Keypad, NewPing, MFRC522, IRremote, SD, VL53L0X, Adafruit SSD1306, Adafruit GFX.

# Robot benzetimi (Modül 5) — `@ask/sim` (`packages/sim/src/robot.ts`; `tools/sim/robot.mjs` yeniden-export eder)
```js
import { Arena, STD_MOTORS, STD_ENCODERS, STD_ULTRASONIC } from '../../../tools/sim/robot.mjs'   // checks.mjs içinden
const arena = Arena.box(2, 2).line([[0.2,1],[1.8,1]]).wall(x1,y1,x2,y2)   // metre; çizgi genişliği arena.lineWidth (0,02)
const robot = sim.rover({ arena, pose:{x,y,theta}, motors: STD_MOTORS, encoders: STD_ENCODERS,
  ultrasonic: STD_ULTRASONIC, lineSensors:[{pin:0, kind:'analog', x:0.07, y:-0.024}, ...],
  bumpers:{left:2, right:3}, gain:{left:1, right:0.92}, noiseCm:1, seed:7 })
robot.state  // x, y, theta (rad, + = sola/saat yönünün tersi), wL, wR (rad/s), ticksL, ticksR, distanceM, frontCm, collided, trail
```
Standart pinler: sol motor EN D5 (PWM) IN1 D7 IN2 D8; sağ motor EN D6 (PWM) IN3→`in1` D9 IN4→`in2` D10; enkoder sol D2 sağ D3 (kesme pinleri); ultrasonik TRIG D11 ECHO D12 servo D4 (servo açısı ışının yönünü belirler: 90° = ileri, büyük açı = sola); çizgi sensörleri analog A0…A4 (çizgi üstü ≈ 4,2 V → analogRead ≈ 860, zemin ≈ 0,8 V → ≈ 164) ya da `kind:'digital'` (çizgi = HIGH); tamponlar INPUT_PULLUP (basılı = LOW).
`imu:true` (+ isteğe bağlı `gyroBiasDps`, `gyroNoiseDps`) robota MPU6050 (0x68) ekler: `gz` = yaw hızı (°/s, sola dönüş +), `az=1`, diğerleri 0; ham `Wire` okumasıyla (ders 58) okunur, `robot.imu` canlı alanları verir.
Fizik: tekerlek yarıçapı 3,3 cm, aks aralığı 12 cm, robot yarıçapı 7,5 cm, azami tekerlek hızı 12 rad/s (≈ 0,4 m/s), PWM ölü bölgesi %20 (altında tekerlek dönmez), motor gecikmesi τ=80 ms, enkoder 20 yuva/devir. `theta=0` = +x ekseni. Robot duvara girmez (çarpışınca durur).
`sim.balancer({motors: STD_MOTORS, theta0Deg:3, A, B, C})` = ters sarkaç (θ'' = A·sinθ − B·u − C·θ'), MPU6050 (0x68) ham verisini besler: `ax=sinθ, az=cosθ`, `gy=θ'` (°/s). `bal.thetaDeg`, `bal.state.fell` (45° üstü = düştü), `bal.state.maxAbsDeg`. Kontrolsüz ≈ 1 sn'de düşer; `u = 0.15·açı° + 0.02·hız°/s` (−1…1, pwm=|u|·255, işaret yönü seçer) ayakta tutar (doğrulandı).
