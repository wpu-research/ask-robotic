# Modül 4 Hafta 2: yeni beceri kimlikleri (koordinatör için)

Bu dosya build.mjs tarafından OKUNMAZ. `apps/web/src/lib/skills.ts` değiştirilmediği için h2 soruları aşağıdaki YENİ kimlikleri kullanır. Koordinatör bu kimlikleri `SKILLS` listesine ve `LESSON_SKILLS` eşlemesine ekleyene kadar `node tools/content/build.mjs modul-4` "bilinmeyen beceri" hatasıyla durur. Başka dalgalarda aynı kimlik farklı yazılmışsa (örneğin `prog-millis`, `prog-debounce`) tek kayıt tutulmalı.

## SKILLS'e eklenecekler
| id | label | area | description |
|---|---|---|---|
| sensor-pir | PIR hareket sensörü | Sensörler | PIR'ın ısı ışınımındaki değişimi algıladığını, ısınma ve tutma süresini bilir; OUT ucunu doğru okur. |
| sensor-ir-obstacle | IR engel sensörü | Sensörler | IR engel modülünün var/yok bilgisini, dijital ve analog çıkışı ve eşiği bilir. |
| sensor-contact | Kontak anahtarları | Sensörler | Reed ve limit anahtarını INPUT_PULLUP ile okur; NO ve NC farkını bilir. |
| sensor-tof | ToF mesafe sensörü | Sensörler | VL53L0X'in ışıkla ölçtüğünü, I2C adresini ve init/timeout kontrollerini bilir. |
| prog-edge-detect | Kenar algılama | Programlama | Seviye yerine değişimi (kenarı) yakalayarak olay sayar ya da bildirir. |
| prog-debounce | Debounce | Programlama | Kontak titreşimini, değişimin belirli süre kararlı kalmasını bekleyerek eler. |
| prog-hysteresis | Histerezis | Programlama | İki eşikle karar verip eşik civarındaki titremeyi önler. |
| prog-millis | Bloklamayan zamanlama | Programlama | delay() yerine millis() ile geçen süreyi ölçer. |
| prog-state-machine | Durum makinesi | Programlama | Sistemi enum ve switch ile durumlara ve geçişlere ayırır. |
| design-failsafe | Güvenli tasarım | Sistem tasarımı | Arıza ve sabotajda sessiz kalmayan (NC, mandal, hatırlama) çözümler seçer. |

## LESSON_SKILLS'e eklenecekler (anahtar: modül-slug:hafta:ders)
```
'sensorler-ve-projeler:2:1': ['sensor-pir', 'prog-edge-detect', 'prog-millis', 'prog-timing', 'prog-debug'],
'sensorler-ve-projeler:2:2': ['sensor-ir-obstacle', 'prog-hysteresis', 'prog-edge-detect', 'prog-debug'],
'sensorler-ve-projeler:2:3': ['sensor-contact', 'prog-debounce', 'design-failsafe', 'prog-debug'],
'sensorler-ve-projeler:2:4': ['sensor-tof', 'prog-hysteresis', 'circuit-wiring', 'prog-debug'],
'sensorler-ve-projeler:2:5': ['prog-state-machine', 'prog-millis', 'sensor-pir', 'sensor-contact', 'design-failsafe', 'prog-debug'],
```
`circuit-wiring`, `prog-timing`, `prog-debug` mevcut kimliklerdir (skills.ts). Test, soru becerilerinin dersin eşlemesinin alt kümesi olmasını arar; bu liste soruların kullandığı tüm kimlikleri kapsar.

## Parça sayfaları
`pir`, `irobstacle`, `reed` yeni eklendi (`content-src/parcalar/`). `apps/web/src/lib/platform-icerik.test.ts` içindeki "pilotta 6 parça var" testi bu yüzden 9'a (ya da bu sayıya) güncellenmelidir; `new Set(partType).size` da aynı sayıya bakıyor.
