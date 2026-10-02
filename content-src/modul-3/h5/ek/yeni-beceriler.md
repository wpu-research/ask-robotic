# Modül 3 Hafta 5: yeni beceri kimlikleri

Bu hafta `apps/web/src/lib/skills.ts` içine eklenmesi gereken kimlikler (koordinatör ekler). Mevcut kimlikler (prog-debug, prog-timing, prog-planning, circuit-wiring, elec-ohm) aynen kullanıldı.

## SKILLS'e eklenecek
- `servo-angle` | Servo açı kontrolü | Programlama | Servoyu attach ve write ile sürer; darbe genişliği (544-2400 µs) ile açı ilişkisini hesaplar; map ile potansiyometre değerini açıya çevirir.
- `transistor-switching` | Transistör ve MOSFET anahtarlama | Elektrik | Pinin motoru neden doğrudan süremediğini bilir; NPN baz akımını hesaplar; baz direncini ve flyback diyotu doğru kullanır.
- `motor-pwm-speed` | PWM ile motor hızı | Programlama | analogWrite ile motor hızını ayarlar; 0-255 doluluk oranını ve map ile hız dönüşümünü hesaplar.
- `h-bridge` | H-köprüsü ve yön | Elektrik | L293D'nin IN1, IN2, EN, VCC1, VCC2 pinleriyle motorun yönünü ve hızını denetler.
- `relay-logic` | Röle mantığı | Elektrik | COM, NO ve NC uçlarını ve aktif-LOW sürmeyi bilir; şebeke gerilimi güvenliğini açıklar.
- `hysteresis` | Histerezis | Programlama | İki eşikli açma/kapama kararı yazar ve neden gerektiğini açıklar.
- `sensor-actuator-project` | Sensörden çıkışa proje | Programlama | Ölçüm, karar ve çıkışı (fan, servo) tek programda birleştirir.

## LESSON_SKILLS eşlemesi
```
'arduino-temelleri:5:1': ['servo-angle', 'prog-timing', 'prog-debug', 'circuit-wiring'],
'arduino-temelleri:5:2': ['transistor-switching', 'motor-pwm-speed', 'elec-ohm', 'prog-debug', 'circuit-wiring'],
'arduino-temelleri:5:3': ['h-bridge', 'motor-pwm-speed', 'prog-debug', 'circuit-wiring'],
'arduino-temelleri:5:4': ['relay-logic', 'hysteresis', 'elec-ohm', 'prog-debug'],
'arduino-temelleri:5:5': ['hysteresis', 'sensor-actuator-project', 'motor-pwm-speed', 'servo-angle', 'elec-ohm', 'prog-debug', 'prog-planning'],
```
