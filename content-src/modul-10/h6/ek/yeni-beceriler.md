# Modül 10 Hafta 6: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine EKLENMEDİ (görev gereği o dosyaya dokunulmadı). Koordinatörün eklemesi gerekir; eklenmezse `node tools/content/build.mjs modul-10` "bilinmeyen beceri" hatasıyla durur.

## SKILLS'e eklenecek (id | etiket | alan | açıklama)
- `mk-events` | Olaylar ve başlıklar | Mikro Kart | Düğme, sallanma gibi olayların başlıklarını kullanır ve her olayın bir kez çalıştığını bilir.
- `mk-variables` | Değişken ve sayaç | Mikro Kart | Değişkeni başlangıçta ayarlar, değer yapar ve ekler; sayacı sıfırlar; ölçüm sonuçlarını çarpmayla hesaplar.
- `mk-conditions` | Koşul ve karşılaştırma | Mikro Kart | Eğer bloğu, eşitlik, büyük-eşit, küçüktür ve kalan (mod) ile koşul kurar ve sonucunu tahmin eder.
- `mk-concurrency` | Eşzamanlı başlıklar ve bekleme | Mikro Kart | Bekle bloğunun yalnız kendi başlığını durdurduğunu, öteki başlıkların çalıştığını ve olay kuyruğunun (en çok 3) sınırını bilir.
- `mk-state` | Durum makinesi | Mikro Kart | Bir cihazı durumlar ve geçişler olarak tarif eder; durumu değişkenlerle tutar ve olaylarla değiştirir.
- `mk-sensors` | Sensör okuma ve eşleme | Mikro Kart | Analog değeri (0-1023) yüzdeye eşler, eşiği hesaplar ve kalibrasyonun gerekçesini bilir.
- `mk-display` | Değer gösterme | Mikro Kart | Sayı, çubuk grafik ve konsol ile değeri gösterir; çubuk grafikte LED sayısını hesaplar.
- `mk-radio` | Radyo mesajlaşma | Mikro Kart | Radyo grubu, ad = değer gönderimi ve alınan ad/değer ile iki kart arasında bilgi taşır.
- `mk-debug` | Blok programında hata bulma | Mikro Kart | Sıfırlama, bayrak sırası, eşit/büyük karışıklığı, ters aralık ve yanlış kaynak gibi hataları bulur.
- `mk-planning` | Proje planı | Mikro Kart | Projeyi başlıklara bölen bir akış planı yazar ve önceki derslerden parçaları birleştirir.

## Kullanılan mevcut beceriler
Yok.

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)
```
'mikro-kart:6:1': ['mk-variables', 'mk-concurrency', 'mk-events', 'mk-debug'],
'mikro-kart:6:2': ['mk-events', 'mk-variables', 'mk-conditions', 'mk-debug', 'mk-concurrency'],
'mikro-kart:6:3': ['mk-state', 'mk-conditions', 'mk-events', 'mk-concurrency', 'mk-debug', 'mk-variables'],
'mikro-kart:6:4': ['mk-sensors', 'mk-display', 'mk-conditions', 'mk-debug'],
'mikro-kart:6:5': ['mk-radio', 'mk-sensors', 'mk-display', 'mk-planning', 'mk-debug', 'mk-variables', 'mk-conditions'],
```
(Bütün soruların `skills` etiketleri ilgili dersin kümesinin içindedir; betikle denetlendi.)
