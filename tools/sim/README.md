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
