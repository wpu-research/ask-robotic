# Modül 11 Hafta 1: yeni beceri kimlikleri

Bu dosya içerik değildir (build okumaz). Koordinatör `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine aşağıdaki kimlikleri ekler ve `LESSON_SKILLS` eşlemesini tamamlar. Soru etiketleri bu kimliklerle yazılmıştır; kimlikler eklenmeden `node tools/content/build.mjs modul-11` "bilinmeyen beceri" hatası verir.

## SKILLS girişleri (id | label | area | description)

| id | label | area | description |
|---|---|---|---|
| game-coords | Sahne ve koordinat | Oyun | Sahnenin 160 x 120 olduğunu, x soldan ve y yukarıdan sayıldığını (y aşağı artar) bilir; konum ve uzaklık hesaplar. |
| game-sprite | Sprite, tür ve değişken | Oyun | Sprite, tür ve değişkenin ne olduğunu bilir; sprite oluşturur, yerleştirir, resmini ve yönünü değiştirir. |
| game-blocks | Bloklar ve olaylar | Oyun | Blokların bir olay bloğuna bağlı olduğunda sırayla çalıştığını ve olayların (başlayınca, düğme) ne zaman tetiklendiğini bilir. |
| game-input | Denetleyici ve tuşlar | Oyun | Yön tuşları ile A ve B düğmelerini, tuşla hareketi ve hareket biçimlerini kullanır. |
| game-motion | Hız ve hareket | Oyun | Hızı (saniyede piksel), eksi/artı yönü, sekmeyi ve dereceyle yönü kullanır; yol = hız x süre hesaplar. |
| game-effects | Ses ve efektler | Oyun | Patlama, sarsıntı, mesaj ve ses bloklarını kullanır ve nasıl çalıştıklarını bilir. |
| game-debug | Blok hata ayıklama | Oyun | Bloklu programdaki yaygın hataları (bağlanmamış blok, yanlış değişken, yanlış yön) bulur. |
| game-design | Oyun planlama | Oyun | Bir oyunu hedef listesine böler ve çalıştır, dene, düzelt döngüsüyle geliştirir. |

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)

```
'oyun-atolyesi:1:1': ['game-coords', 'game-sprite', 'game-blocks', 'game-debug'],
'oyun-atolyesi:1:2': ['game-input', 'game-motion', 'game-blocks', 'game-debug'],
'oyun-atolyesi:1:3': ['game-blocks', 'game-input', 'game-sprite', 'game-debug', 'game-motion'],
'oyun-atolyesi:1:4': ['game-motion', 'game-coords', 'game-blocks', 'game-debug'],
'oyun-atolyesi:1:5': ['game-design', 'game-effects', 'game-blocks', 'game-input', 'game-debug', 'game-motion'],
```

Not: test yalnız soru becerilerinin dersin eşlemesinin alt kümesi olmasını arar; eşleme sorulardan geniş olabilir.
