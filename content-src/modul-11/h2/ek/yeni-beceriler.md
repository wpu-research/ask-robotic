# Modül 11 Hafta 2: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır (modül 11'in diğer haftalarıyla aynı `game-` önekini paylaşırlar; aynı kimlik başka haftada tanımlıysa tek kez eklenir). `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-11` "bilinmeyen beceri" hatası verir.

## SKILLS'e eklenecekler
```ts
  { id: 'game-collision', label: 'Çarpışma', area: 'Oyun', description: 'Çarpışma olayını kurar; bu sprite ve diğer sprite farkını, değme anında bir kez çalışmasını bilir.' },
  { id: 'game-kinds', label: 'Sprite türleri', area: 'Oyun', description: 'Olayların sprite adını değil türünü kullandığını bilir; Oyuncu, Yiyecek ve Düşman türlerini doğru seçer.' },
  { id: 'game-score', label: 'Skor', area: 'Oyun', description: 'Skoru yap ve değiştir blokları ile yönetir; aralarındaki farkı bilir.' },
  { id: 'game-conditions', label: 'Oyunda koşullar', area: 'Oyun', description: 'eğer ... ise bloğunu ve = ile ≥ karşılaştırmasını doğru kullanır.' },
  { id: 'game-spawn', label: 'Nesne üretme', area: 'Oyun', description: 'her ... ms de bir olayıyla yeni sprite doğurur; ekran dışına çıkanları silmeyi bilir.' },
  { id: 'game-random', label: 'Rastgelelik', area: 'Oyun', description: 'Rastgele sayı bloğuyla konum ve hızı değiştirir; aralığı (uçlar dahil) doğru yazar.' },
  { id: 'game-timing', label: 'Oyunda zaman ve hız', area: 'Oyun', description: 'Milisaniye ile saniyeyi çevirir; saniyede piksel olarak hız ve süre hesabı yapar.' },
  { id: 'game-lives', label: 'Can', area: 'Oyun', description: 'Canı yap ve değiştir blokları ile yönetir; tehlike olayı ve geri bildirimi kurar.' },
  { id: 'game-flow', label: 'Oyun akışı', area: 'Oyun', description: 'can bitince ve süre bitince olaylarında oyunu kendisi bitirir; kazanma ve kaybetme kurallarını kurar.' },
  { id: 'game-debug', label: 'Oyunda hata bulma', area: 'Oyun', description: 'Yanlış tür, yanlış blok, eksik silme ve eksik bitirme gibi oyun hatalarını bulur.' },
  { id: 'game-design', label: 'Oyun tasarımı', area: 'Oyun', description: 'Oyunu amaç, risk ve son olarak tasarlar; olaylara böler; sayıları dengeler.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'oyun-atolyesi:2:1': ['game-collision', 'game-kinds', 'game-debug'],
  'oyun-atolyesi:2:2': ['game-score', 'game-conditions', 'game-debug'],
  'oyun-atolyesi:2:3': ['game-spawn', 'game-random', 'game-timing', 'game-debug'],
  'oyun-atolyesi:2:4': ['game-lives', 'game-collision', 'game-kinds', 'game-flow', 'game-debug'],
  'oyun-atolyesi:2:5': ['game-design', 'game-flow', 'game-score', 'game-lives', 'game-timing', 'game-conditions', 'game-collision', 'game-debug'],
```
Not: 2:5 eşlemesi 2:4'ten `game-kinds` ve `game-random` almaz; testlerde de kullanılmadı. 2:2'deki `game-conditions` d7 sorularında, d6 sorularında `game-kinds` bulunur.
