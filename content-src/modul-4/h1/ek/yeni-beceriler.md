# Modül 4 Hafta 1: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine EKLENMEDİ (görev gereği o dosyaya dokunulmadı). Koordinatörün eklemesi gerekir; eklenmezse `node tools/content/build.mjs modul-4` "bilinmeyen beceri" hatasıyla durur.

## SKILLS'e eklenecek (id | etiket | alan | açıklama)
- `sens-ultrasonic` | Ultrasonik ölçüm | Sensör | HC-SR04'ün sesin gidiş-dönüş süresiyle mesafe ölçtüğünü bilir; süreden santimetreyi hesaplar (süre × 0,0343 / 2).
- `sens-sound-speed` | Ses hızı ve sıcaklık | Sensör | Ses hızının sıcaklığa bağlı olduğunu ve sabit 343 m/s varsayımının ölçümü nasıl kaydırdığını açıklar.
- `sens-pulsein` | pulseIn ve tetik | Sensör | TRIG darbesi verir, pulseIn ile süre ölçer, zaman aşımını ve 0 (yankı yok) dönüşünü doğru yorumlar.
- `sens-filter` | Gürültü ve filtre | Sensör | Aykırı değeri tanır; ortalama ile medyanı karşılaştırır; kayan pencereli medyan filtre kurar ve gecikme bedelini bilir.
- `sens-servo-scan` | Servo ile tarama | Sensör | Servo ve sensörü birleştirip açı açı ölçer, en yakın nesneyi bulur, ışın konisi sınırlarını bilir.
- `sens-thresholds` | Eşik ve orantılı çıkış | Sensör | Ölçümü eşiklerle bölgelere ayırır, map() ile orantılı çıkış üretir, sınırda titremeyi (histerezis) ve ekran satırı kalıntısını bilir.
- `prog-nonblocking` | Bloklamayan kod | Programlama | delay() ve pulseIn() gibi bekleten çağrıların bedelini bilir; millis() ile birden çok işi birbirini beklemeden yürütür.

## Kullanılan mevcut beceriler
`prog-timing`, `prog-debug`, `prog-loops-arrays` (zaten SKILLS içinde).

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)
```
'sensorler-ve-projeler:1:1': ['sens-ultrasonic', 'sens-sound-speed', 'prog-debug'],
'sensorler-ve-projeler:1:2': ['sens-pulsein', 'sens-ultrasonic', 'prog-debug', 'prog-nonblocking'],
'sensorler-ve-projeler:1:3': ['sens-filter', 'prog-loops-arrays', 'prog-debug'],
'sensorler-ve-projeler:1:4': ['sens-servo-scan', 'sens-filter', 'sens-ultrasonic', 'prog-loops-arrays', 'prog-timing', 'prog-debug'],
'sensorler-ve-projeler:1:5': ['sens-thresholds', 'prog-nonblocking', 'sens-filter', 'prog-timing', 'prog-debug'],
```
(Bütün soruların `skills` etiketleri ilgili dersin kümesinin içindedir; doğrulama betiğiyle denetlendi.)
