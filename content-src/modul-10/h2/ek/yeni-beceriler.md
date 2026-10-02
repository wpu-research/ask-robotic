# Modül 10 Hafta 2: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-10` "bilinmeyen beceri" hatası verir. Mevcut kimlikler (prog-debug, prog-planning) olduğu gibi kullanılmıştır.

## SKILLS'e eklenecekler
```ts
  { id: 'mk-events', label: 'Olaylar ve düğmeler', area: 'Mikro Kart', description: 'Olay bloklarını (A, B, A+B) kullanır; olay bloğunun içinin yalnız olay gelince çalıştığını bilir.' },
  { id: 'mk-input-timing', label: 'Logo, uzun basış ve süre', area: 'Mikro Kart', description: 'Logo olaylarını ve 1 saniyelik uzun basışı kullanır; ezgi ve gösterim sürelerini hesaplar.' },
  { id: 'mk-variables', label: 'Değişken ve sayaç', area: 'Mikro Kart', description: 'Değişkene değer koyar, artırır ve gösterir; toplam ve sayaç programlarını izler.' },
  { id: 'mk-random', label: 'Rastgele sayı', area: 'Mikro Kart', description: 'Rastgele sayı bloğunun aralığını (uçlar dahil) ve sonucu değişkende saklama gerekçesini bilir.' },
  { id: 'mk-conditions', label: 'Koşul ve karşılaştırma', area: 'Mikro Kart', description: 'eğer ... ise ve karşılaştırma işleçlerini kullanır; atama ile karşılaştırma farkını bilir.' },
```

## LESSON_SKILLS'e eklenecekler (anahtar: modül-slug:hafta:ders; test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'mikro-kart:2:1': ['mk-events', 'prog-debug'],
  'mikro-kart:2:2': ['mk-variables', 'mk-events', 'prog-debug'],
  'mikro-kart:2:3': ['mk-random', 'mk-conditions', 'mk-variables', 'prog-debug'],
  'mikro-kart:2:4': ['mk-input-timing', 'mk-events', 'mk-variables', 'prog-debug'],
  'mikro-kart:2:5': ['prog-planning', 'mk-variables', 'mk-conditions', 'mk-random', 'mk-events', 'mk-input-timing', 'prog-debug'],
```
Not: 2:4 eşlemesinde `mk-variables` yalnız 2. soruda (sayaç olarak) kullanılır.
