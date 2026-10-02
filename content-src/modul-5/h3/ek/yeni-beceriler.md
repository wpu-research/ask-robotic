# Modül 5 Hafta 3: yeni beceri kimlikleri (koordinatör: apps/web/src/lib/skills.ts'e eklenecek)

apps/web/src/lib/skills.ts değiştirilmedi. `node tools/content/build.mjs modul-5`, bu kimlikler SKILLS listesine eklenene kadar "bilinmeyen beceri" hatası verir.
Modül slug'ı: `robotik`. Ders anahtarı biçimi `modül-slug:hafta:ders` (hafta içi sıra 1-5; küresel ders numaraları 86-90).

## Yeni SKILLS girdileri (id | label | area | description)
- rob-line-sensor | Yansımalı IR sensör | Robotik | Yansımalı IR sensörün yüzeye göre nasıl okuduğunu bilir ve modülün yönünü ham değerlere bakarak belirler.
- rob-line-geometry | Sensör dizisi geometrisi | Robotik | Sensör aralığı ve çizgi genişliğinden dizinin kapsadığı genişliği ve kör bölgeyi hesaplar.
- rob-line-pattern | Çizgi deseni ve konum | Robotik | Eşiklenmiş sensör değerlerinden bit desenini ve çizgi konumunu (−2…+2) çıkarır.
- rob-calibration | Min/max kalibrasyon | Robotik | Eşiği (min + max) / 2 ile hesaplar; başlangıç değerlerinin ve sallanma koşullarının sonucu nasıl etkilediğini bilir.
- rob-bangbang | Bang-bang yön kararı | Robotik | Sensör desenine göre sola, düz ya da sağa gitme kararını verir ve zigzağın nedenini açıklar.
- rob-line-memory | Son yön hafızası ve histerezis | Robotik | Son görülen yönü saklar ve iki eşikli kararla titremeyi önler.
- rob-gap-recovery | Boşluk ve çizgi kaybı | Robotik | Çizgi kaybında boşluk ile aşılan virajı son yönle ayırır ve süre sınırlı kurtarma uygular.
- rob-junction | Kavşak ve viraj | Robotik | Kavşak desenini tanır; ileri-dön-düz aşamalarıyla önceden verilmiş karara göre geçer.
- rob-line-fsm | Çizgi izleyen durum makinesi | Robotik | Kalibrasyon, izleme, boşluk, arama ve bitiş durumlarını tek bir durum makinesinde birleştirir.
- rob-safe-stop | Güvenli durma | Robotik | Kontrast düşükse ya da çizgi bulunamazsa robotu sürmek yerine durdurur.
- rob-line-metrics | Ölçüm ve hız ödünleşimi | Robotik | Tur süresi, kayıp süresi ve en uzun kesintiyi ölçer; hız ile güvenilirlik arasındaki ödünleşimi yorumlar.

## LESSON_SKILLS eşlemesi (mevcut kimlikler dahil)
- 'robotik:3:1': ['rob-line-sensor', 'rob-line-geometry', 'rob-line-pattern', 'prog-loops-arrays', 'prog-debug']
- 'robotik:3:2': ['rob-calibration', 'rob-line-pattern', 'prog-debug']
- 'robotik:3:3': ['rob-bangbang', 'rob-line-memory', 'prog-debug']
- 'robotik:3:4': ['rob-gap-recovery', 'rob-line-memory', 'rob-junction', 'rob-line-fsm', 'prog-timing', 'prog-debug']
- 'robotik:3:5': ['rob-calibration', 'rob-gap-recovery', 'rob-line-fsm', 'rob-safe-stop', 'rob-line-metrics', 'prog-timing', 'prog-debug']
