# Modül 5 Hafta 4: yeni beceri kimlikleri (koordinatör: apps/web/src/lib/skills.ts'e eklenecek)

apps/web/src/lib/skills.ts değiştirilmedi. `node tools/content/build.mjs modul-5`, bu kimlikler SKILLS listesine eklenene kadar "bilinmeyen beceri" hatası verir.
Modül slug'ı: `robotik`. Ders anahtarı biçimi `modül-slug:hafta:ders` (hafta içi sıra 1-5). Mevcut kimlikler: prog-debug, prog-timing, prog-planning.

## Yeni SKILLS girdileri (id | label | area | description)
- rob-encoder | Enkoder ve tık | Robotik | Enkoder diskinin tık ürettiğini, RISING/CHANGE sayımının farkını ve sayacın gerçek dönüşü verdiğini bilir.
- rob-ticks-distance | Tık-mesafe dönüşümü | Robotik | Tekerlek yarıçapı ve yuva sayısından tık mesafesini hesaplar; tıkı mesafeye, mesafeyi tıka çevirir.
- rob-interrupt-count | Kesmeyle sayma | Robotik | Sayacı volatile yapar, güvenli okur, farkı işaretsiz çıkarmayla alır ve sayacı sıfırlamanın riskini bilir.
- rob-speed-window | Pencereyle hız | Robotik | Hızı pencerede gelen tık sayısı ve gerçek süreden hesaplar.
- rob-quantization | Nicemleme ve çözünürlük | Robotik | Sayaçtan gelen ölçümün basamaklı olduğunu, adım büyüklüğünü ve pencere/gecikme uzlaşmasını açıklar.
- rob-straight-p | P ile düz gitme | Robotik | Tık farkından orantılı düzeltme yazar, işaretini ve PWM kırpmasını doğru kurar.
- rob-odometry | Odometri | Robotik | Tekerlek yollarından Δs, Δθ, x, y ve θ'yı hesaplar; radyan/derece farkını yönetir.
- rob-drift | Sapma ve birikme | Robotik | Çözünürlük ve sistematik hataların yol boyunca birikimini ve odometrinin kendini düzeltemediğini açıklar.
- rob-turn-geometry | Dönüş ve daire geometrisi | Robotik | Yerinde dönüş yayını ile iç/dış tekerlek yollarını ve ölü bölge düzeltmeli PWM'i hesaplar.
- rob-proj-square | Şekil çizen robot projesi | Robotik | Şekli hareketlere böler, mutlak hedef kullanır ve başlangıca dönüş hatasını toleransla karşılaştırır.

## LESSON_SKILLS eşlemesi (mevcut kimlikler dahil)
- 'robotik:4:1': ['rob-encoder', 'rob-ticks-distance', 'rob-interrupt-count', 'prog-debug']
- 'robotik:4:2': ['rob-speed-window', 'rob-quantization', 'rob-interrupt-count', 'prog-timing', 'prog-debug']
- 'robotik:4:3': ['rob-straight-p', 'rob-ticks-distance', 'rob-drift', 'prog-debug']
- 'robotik:4:4': ['rob-odometry', 'rob-drift', 'rob-quantization', 'prog-debug']
- 'robotik:4:5': ['rob-proj-square', 'rob-turn-geometry', 'rob-ticks-distance', 'rob-drift', 'prog-planning', 'prog-debug']
