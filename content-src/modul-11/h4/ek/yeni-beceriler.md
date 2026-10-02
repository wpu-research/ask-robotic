# Modül 11 Hafta 4: önerilen yeni beceri kimlikleri

Not: `apps/web/src/lib/skills.ts` bu ajan tarafından DEĞİŞTİRİLMEDİ. Aşağıdaki kimlikler `SKILLS` listesine eklenmeden `node tools/content/build.mjs modul-11` "bilinmeyen beceri" hatasıyla durur. Diğer haftaların ajanları aynı ya da benzer kimlikleri (özellikle `game-debug`, `game-collision`, `game-spawn`) tanımlıyor olabilir; koordinatör tekrarları birleştirmelidir.

## SKILLS (id | etiket | alan | açıklama)
- game-timer | Zamanlayıcı olayı | Oyun yapımı | "her N ms'de bir" olayını ve milisaniye-saniye çevirisini kullanır; belirli sürede kaç kez çalışacağını hesaplar.
- game-velocity | Hız ve yol | Oyun yapımı | Hızı (piksel/sn) ve işaretini okur, ters çevirir; yol = hız x süre hesabını yapar.
- game-heading | Yön (derece) | Oyun yapımı | Yönü derece olarak okur (0 yukarı, 90 sağ, 180 aşağı, 270 sol) ve hıza çevirir.
- game-random | Rastgele sayı | Oyun yapımı | Rastgele sayı aralığını amaca göre seçer; uçların dahil olduğunu ve tohum fikrini bilir.
- game-follow | Takip | Oyun yapımı | Takip bloğunu kurar; dursun ile takibi bıraksın farkını ve kendini takip hatasını bilir.
- game-distance | Mesafe | Oyun yapımı | İki sprite arasındaki merkez mesafesini hesaplar ve algılama eşiği olarak kullanır.
- game-condition | Oyunda koşul | Oyun yapımı | eğer/değilse ile oyun kuralı kurar ve kuralı doğru olaya (her karede, çarpışma) yerleştirir.
- game-spawn | Sprite yaratma | Oyun yapımı | Oyun çalışırken yeni sprite yaratır; tür, konum ve hız verir; kullanılmayanı siler.
- game-collision | Çarpışma kuralı | Oyun yapımı | Türe göre çarpışma olayı yazar; bu sprite ve diğer sprite'ı ayırt eder.
- game-debug | Oyun hatası bulma | Oyun yapımı | Blok programındaki yaygın hataları (yanlış eksen, yanlış tür, olay dışı blok) bulur.
- game-planning | Oyun planı | Oyun yapımı | Oyunu parçalara bölüp parça-olay tablosu çıkarır ve parçaları bağımsız kurar.

## LESSON_SKILLS eşlemesi (anahtar: oyun-atolyesi:4:<ders>)
- 'oyun-atolyesi:4:1': ['game-timer', 'game-velocity', 'game-debug']
- 'oyun-atolyesi:4:2': ['game-follow', 'game-distance', 'game-condition', 'game-debug']
- 'oyun-atolyesi:4:3': ['game-random', 'game-heading', 'game-velocity', 'game-timer', 'game-debug']
- 'oyun-atolyesi:4:4': ['game-spawn', 'game-collision', 'game-velocity', 'game-debug']
- 'oyun-atolyesi:4:5': ['game-planning', 'game-timer', 'game-follow', 'game-collision', 'game-condition', 'game-velocity', 'game-debug']

Kullanılan ders anahtarı biçimi `modül-slug:hafta:ders` (hafta içi sıra 1-5). Modül slug'ı `oyun-atolyesi`.
