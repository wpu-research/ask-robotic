# Modül 5 Hafta 7 için yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki SKILLS listesine koordinatör tarafından eklenmeli. Eklenene kadar `node tools/content/build.mjs modul-5` bu kimlikleri "bilinmeyen beceri" diye reddeder.
Aşağıdaki kimlikler mevcutlarla çakışmaz: `prog-timing`, `prog-debug`, `prog-planning` zaten tanımlıdır ve kullanılır.

| id | label | area | description |
|---|---|---|---|
| rob-sensor-fusion | Sensör birleştirme | Robotik | Enkoder ve jiroskopun güçlü ve zayıf yanlarını bilir; tamamlayıcı filtreyle birleşik yönelim hesaplar. |
| rob-gyro-scale | Jiroskop ölçeği | Robotik | Jiroskop ölçeğini (±250, ±500 ...) ve duyarlılığını seçer, doymayı ve sapmayı tanır, ham değeri °/s'ye çevirir. |
| rob-localization | Konum tahmini | Robotik | Enkoder yolu ve yönelimden (x, y) günceller; açı farkını −180...180 aralığına sarar; tahminin bozulma nedenlerini bilir. |
| rob-behavior-arbiter | Davranış ve hakem | Robotik | Robot programını öneri döndüren davranışlara ayırır; öncelik sırasıyla çalışan hakemi kurar. |
| rob-hysteresis | Histerezis (iki eşik) | Robotik | Bir davranışı başlatma ve bitirme için ayrı eşikler kullanarak titremeyi önler. |
| rob-ik | Ters kinematik | Robotik | İki eksenli kol için ileri ve ters kinematiği kosinüs teoremiyle hesaplar; erişilemeyen hedefi yakalar. |
| rob-servo-pulse | Servo açı ve darbe | Robotik | Servo açısını darbe genişliğine çevirir (544-2400 µs), derece-radyan ve tamsayı bölmesi tuzaklarını bilir. |
| rob-smooth-motion | Yumuşak hareket | Robotik | Doğrusal ara değerle servoyu zamana yayar, millis() ile bloklamadan yürütür, adım tablosu kurar. |
| rob-eval | Robotu ölçmek | Robotik | Kapsama, çarpma ve süre gibi ölçütlerle robotu değerlendirir; karşılaştırma koşusu yapar. |

## Ders eşlemesi (LESSON_SKILLS, anahtar: robotik:7:ders)
- robotik:7:1 (106): rob-sensor-fusion, rob-gyro-scale, rob-localization, prog-debug
- robotik:7:2 (107): rob-behavior-arbiter, rob-hysteresis, prog-debug
- robotik:7:3 (108): rob-ik, rob-servo-pulse, prog-debug
- robotik:7:4 (109): rob-smooth-motion, rob-servo-pulse, prog-timing, prog-planning, prog-debug
- robotik:7:5 (110): rob-localization, rob-hysteresis, rob-eval, rob-behavior-arbiter, prog-debug
