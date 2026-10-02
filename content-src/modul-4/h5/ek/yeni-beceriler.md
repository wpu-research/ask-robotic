# Modül 4 Hafta 5: yeni beceri kimlikleri (lib/skills.ts'e eklenecek)

Mini testler bu kimlikleri kullanır. `apps/web/src/lib/skills.ts` içinde yok; koordinatör eklemeden `node tools/content/build.mjs modul-4` "bilinmeyen beceri" hatası verir. `prog-debug` mevcuttur.

| id | label | area | description |
|---|---|---|---|
| analog-read | Analog okuma | Programlama | analogRead değerini (0-1023) gerilime ve gerilimi değere çevirir. |
| axis-calibration | Merkez ve ölü bölge | Programlama | Joystick gibi analog eksenlerde merkezi ölçer, ölü bölge koyar ve map ile ölçekler. |
| input-pullup | Giriş ve INPUT_PULLUP | Programlama | Düğmeyi INPUT_PULLUP ile okur; basılı düğmenin LOW olduğunu bilir. |
| interrupts | Kesmeler | Programlama | attachInterrupt, ISR kuralları, kesme pinleri ve volatile değişkeni kullanır. |
| quadrature | Enkoder yönü | Elektronik | CLK ve DT sinyalinin 90 derece farkından dönüş yönünü ve adımı bulur. |
| debounce | Sıçrama süzme | Programlama | Mekanik kontak sıçramasını zaman eşiğiyle süzer ve eşiği tık aralığına göre seçer. |
| i2c-registers | I2C yazmaçları | Programlama | I2C cihazın yazmaçlarını okur, baytları int16_t olarak birleştirir, adres çakışmasını bilir. |
| accel-angle | İvmeölçerle eğim | Programlama | İvmeyi g'ye çevirir ve atan2 ile eğim açısı hesaplar; hızlanmanın etkisini bilir. |
| gyro-drift | Jiroskop sapması | Programlama | Jiroskop hızını integralle açıya çevirir; sapmanın kaymaya yol açtığını hesaplar. |
| complementary-filter | Tamamlayıcı filtre | Programlama | İvmeölçer ve jiroskopu ALFA ile ağırlıklı birleştirir ve ALFA etkisini yorumlar. |
| servo-control | Servo sürme | Programlama | Açıyı hesaplar, constrain ile sınırlar ve darbe genişliğine (544-2400 µs) çevirir. |
| nonblocking-timing | Bloklamayan zamanlama | Programlama | delay yerine millis farkıyla birden çok işi kendi hızında çalıştırır. |
| control-loop | Kontrol çevrimi | Programlama | Açık çevrim ile kapalı çevrim kontrolü ayırt eder. |

## LESSON_SKILLS eşlemesi (modul-slug:hafta:ders)
```
'sensorler-ve-projeler:5:1': ['analog-read', 'axis-calibration', 'input-pullup', 'prog-debug'],
'sensorler-ve-projeler:5:2': ['quadrature', 'interrupts', 'debounce', 'prog-debug'],
'sensorler-ve-projeler:5:3': ['i2c-registers', 'accel-angle', 'prog-debug'],
'sensorler-ve-projeler:5:4': ['gyro-drift', 'complementary-filter', 'prog-debug'],
'sensorler-ve-projeler:5:5': ['servo-control', 'nonblocking-timing', 'control-loop', 'prog-debug'],
```
