# Modül 10 Hafta 1: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır (mevcut Arduino odaklı kimlikler kullanılmadı). `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-10` "bilinmeyen beceri" hatası verir.

## SKILLS'e eklenecekler
```ts
  { id: 'mk-card', label: 'Mikro Kart tanıma', area: 'Mikro Kart', description: 'Sanal kartın parçalarını (5x5 LED, düğmeler, logo) ve yazı/sayı gösteriminin özelliklerini bilir.' },
  { id: 'mk-flow', label: 'Blok akışı', area: 'Mikro Kart', description: 'Başlık bloklarını (başlangıçta, sonsuza kadar) ve blokların yukarıdan aşağıya sırasını doğru kullanır.' },
  { id: 'mk-coords', label: 'LED koordinatları', area: 'Mikro Kart', description: 'LED adresini (x, y) 0 tabanlı olarak okur ve yazar; ekran sınırlarını bilir.' },
  { id: 'mk-images', label: 'Simge ve desen', area: 'Mikro Kart', description: 'Hazır simgeleri ve 5x5 desenleri kullanır, 1/0 gösterimiyle okur, animasyon kurar.' },
  { id: 'mk-repeat', label: 'Tekrar (döngü)', area: 'Mikro Kart', description: 'Tekrarla bloğunu kullanır, içeride/dışarıda farkını ve tur sayısını bilir.' },
  { id: 'mk-timing', label: 'Bekleme ve süre', area: 'Mikro Kart', description: 'bekle (ms) bloğunu kullanır, tur ve toplam süreyi hesaplar.' },
  { id: 'mk-debug', label: 'Blok hata bulma', area: 'Mikro Kart', description: 'Sıra, eksik bekleme/temizleme, yanlış adres ve parlaklık gibi küçük hataları bulur.' },
  { id: 'mk-planning', label: 'Planlama (Mikro Kart)', area: 'Mikro Kart', description: 'Projeyi önce adım tablosuna dökerek bölümlere (başlangıçta/sonsuza kadar) ayırır.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'mikro-kart:1:1': ['mk-card', 'mk-flow', 'mk-timing', 'mk-debug'],
  'mikro-kart:1:2': ['mk-coords', 'mk-flow', 'mk-timing', 'mk-debug'],
  'mikro-kart:1:3': ['mk-images', 'mk-coords', 'mk-flow', 'mk-timing', 'mk-debug'],
  'mikro-kart:1:4': ['mk-flow', 'mk-images', 'mk-repeat', 'mk-timing', 'mk-debug'],
  'mikro-kart:1:5': ['mk-flow', 'mk-repeat', 'mk-timing', 'mk-debug', 'mk-planning'],
```
Not: ders anahtarı biçimi (`mikro-kart:hafta:ders`) module.json `slug`'ından türetilmiştir; mevcut LESSON_SKILLS anahtar kuralı (`arduino-temelleri:1:1`) ile aynıdır.
