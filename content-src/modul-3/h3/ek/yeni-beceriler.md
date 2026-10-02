# Modül 3 Hafta 3 — yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` bu ajan tarafından değiştirilmedi. Mini testler aşağıdaki YENİ kimlikleri kullanır; `node tools/content/build.mjs modul-3` bunları `SKILLS` içinde bulamazsa üretim durur. Koordinatör `SKILLS` dizisine bu altı kaydı eklemeli ve `LESSON_SKILLS` eşlemesini aşağıdaki gibi genişletmeli.

## Eklenecek SKILLS kayıtları
| id | label | area | description |
|---|---|---|---|
| `analog-adc` | Analog okuma ve ADC | Programlama | analogRead'in 0-1023 verdiğini, ham değeri gerilime (ham × 5,0 / 1024) ve 0-255 aralığına çevirir. |
| `volt-divider` | Gerilim bölücü | Elektrik | Vout = Vin × R2 / (R1 + R2) formülünü kullanır; sensör direncini gerilim ve ham değerden hesaplar. |
| `sensor-ldr` | LDR ile ışık ölçme | Elektrik | LDR'yi bölücüyle okur, ışık yönünü bilir, eşik ve histerezisle karar verir. |
| `sensor-ntc` | NTC ile sıcaklık ölçme | Elektrik | NTC direncini ve beta formülüyle sıcaklığı (Kelvin, Celsius, log) hesaplar; geçersiz okumayı yakalar. |
| `map-constrain` | map ve constrain | Programlama | map ile aralık dönüştürür (tam sayı, sınırsız), constrain ile kırpar, ters aralık kullanır. |
| `calibration-smoothing` | Kalibrasyon ve yumuşatma | Programlama | Sensör aralığını kalibre eder, ortalama ve üstel yumuşatma ile gürültüyü azaltır. |

## Eklenecek LESSON_SKILLS satırları (hafta:ders sırası, haftadaki ders numarasıdır)
```
'arduino-temelleri:3:1': ['analog-adc', 'circuit-wiring', 'prog-debug'],
'arduino-temelleri:3:2': ['volt-divider', 'sensor-ldr', 'elec-ohm', 'prog-debug'],
'arduino-temelleri:3:3': ['sensor-ntc', 'volt-divider', 'prog-debug'],
'arduino-temelleri:3:4': ['map-constrain', 'calibration-smoothing', 'prog-timing', 'prog-debug'],
'arduino-temelleri:3:5': ['map-constrain', 'analog-adc', 'sensor-ldr', 'prog-timing', 'prog-loops-arrays', 'prog-debug', 'digital-out'],
```

## Not: soru kimliği biçimi
Kimlikler `m3h3dNN-qK` biçimindedir; NN küresel ders numarasıdır (11-15), dosya adlarıyla aynı. Pilot (`m3h1d3-q1`) küresel numarayı kullandığı için aynı kural sürdürüldü.
