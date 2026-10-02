# Modül 5 Hafta 8: yeni beceri kimlikleri (koordinatör: apps/web/src/lib/skills.ts'e eklenecek)

apps/web/src/lib/skills.ts değiştirilmedi. `node tools/content/build.mjs modul-5`, bu kimlikler SKILLS listesine eklenene kadar "bilinmeyen beceri" hatası verir.
Modül slug'ı: `robotik`. Ders anahtarı biçimi `modül-slug:hafta:ders` (hafta içi sıra 1-5). Küresel ders numaraları 111-115.

## Yeni SKILLS girdileri (id | label | area | description)
- bit-requirements | Ölçülebilir gereksinim | Proje | Dileği sayı, birim ve ölçüm yöntemi içeren gereksinime çevirir.
- bit-acceptance | Kabul ölçütü | Proje | Ölçütü sınır değerleri (< ve <=) ve mantıksal birleşimle (&&, ||) doğru yazar.
- bit-subsystems | Alt sistemler | Proje | İşi tek başına sınanabilen alt sistemlere böler ve geçme koşulunu sayıyla yazar.
- bit-test-matrix | Test matrisi | Proje | Beklenen sonucu ölçümden önce yazarak birden çok senaryoyla sınar.
- rob-servo-pulse | Servo darbe genişliği | Robotik | Açıyı doğrusal bağıntıyla mikrosaniye darbeye çevirir (544 + açı x 1856 / 180).
- rob-median | Ortanca filtre | Robotik | Üç ölçümün ortancasıyla aykırı okumayı eler.
- rob-ik-check | Ters kinematik doğrulama | Robotik | İki eksenli kolun açılarını bulur ve ileri kinematikle gidiş-dönüş sınar.
- rob-failsafe | Güvenli varsayılan | Robotik | Emin olunamayan durumda (hedef kaybı gibi) çıkışı güvenli hâle getirir; art arda sayaç kullanır.
- rob-fsm | Robot durum makinesi | Robotik | Durumları, geçiş koşullarını ve durum başlangıç zamanını millis() ile kurar.
- rob-tuning-transfer | Ayar aktarımı | Robotik | Düzenek değişince kazancı yeniden ölçer ya da orantılı ayarlar (KP 55 -> 46).
- rob-telemetry | Veri sözleşmesi | Robotik | Seri satırı sabit alanlar, aralıklar ve null ile yazar; baud hızının satır süresine etkisini hesaplar.
- rob-error-stats | Hata istatistiği | Robotik | Ortalama ve en büyük mutlak hatayı işaretsiz hesaplar.
- rep-root-cause | Kök neden analizi | Raporlama | Belirtiyi kök nedenden ayırır, katmanları ölçerek tek değişiklikle düzeltir.
- rep-honest-results | Dürüst raporlama | Raporlama | Sonucu ölçüm yöntemi ve kapsam sınırıyla yazar; simülatör ile gerçeği ayırır.

Mevcut kimlikler (değişmez): prog-planning, prog-debug, prog-timing, circuit-wiring.

## LESSON_SKILLS eşlemesi (mevcut kimlikler dahil)
- 'robotik:8:1': ['bit-requirements', 'bit-acceptance', 'prog-planning', 'prog-debug', 'circuit-wiring']
- 'robotik:8:2': ['bit-subsystems', 'rob-servo-pulse', 'rob-median', 'rob-ik-check', 'rob-failsafe', 'prog-debug']
- 'robotik:8:3': ['bit-test-matrix', 'rob-fsm', 'rob-failsafe', 'rob-tuning-transfer', 'prog-timing', 'prog-debug']
- 'robotik:8:4': ['rob-telemetry', 'rob-error-stats', 'prog-debug']
- 'robotik:8:5': ['rep-root-cause', 'rep-honest-results', 'rob-error-stats', 'prog-timing', 'prog-debug']
