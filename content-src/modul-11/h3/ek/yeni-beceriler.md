# Modül 11 Hafta 3: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-11` "bilinmeyen beceri" hatası verir. (Başka Modül 11 haftaları aynı kimlikleri kullanıyorsa tekrar eklenmemeli.)

## SKILLS'e eklenecekler
```ts
  { id: 'oyun-harita-izgara', label: 'Harita ızgarası', area: 'Oyun', description: 'Haritayı 16 piksellik karoların ızgarası olarak okur; sütun ve satırı 0\'dan sayar, karo sayısından piksel boyutunu hesaplar.' },
  { id: 'oyun-karo-duvar', label: 'Duvar karosu', area: 'Oyun', description: 'Karonun duvar kutusunun sprite\'ı durdurduğunu bilir ve karo takımını buna göre ayarlar.' },
  { id: 'oyun-karo-olay', label: 'Karoya dokununca olayı', area: 'Oyun', description: 'Karo olayının sprite karoya ilk değdiğinde bir kez çalıştığını bilir ve olay bloğunu kurar.' },
  { id: 'oyun-olay-karosu', label: 'Olay karosu', area: 'Oyun', description: 'Olay karosunun sütun ve satırıyla dokunulan karoyu boşaltır; sabit sayı ile farkını bilir.' },
  { id: 'oyun-kazanma-kosulu', label: 'Kazanma koşulu', area: 'Oyun', description: 'Karo sayacı, skor ve can ile kazanma ve kaybetme koşullarını kurar; kontrolün sırasını doğru verir.' },
  { id: 'oyun-kamera', label: 'Kamera ve dünya', area: 'Oyun', description: 'Dünya ile ekranı ayırır; kameranın takip konumunu ve kenar sınırlarını hesaplar.' },
  { id: 'oyun-karo-sprite', label: 'Karoyu sprite\'a çevirme', area: 'Oyun', description: 'Karo ile sprite arasındaki farkı ve karoyu hangi durumda sprite\'a çevireceğini bilir.' },
  { id: 'oyun-hata-ayiklama', label: 'Oyun blokları hata ayıklama', area: 'Oyun', description: 'Eksik blok, yanlış sıra ve yanlış koordinat gibi blok hatalarını bulur.' },
  { id: 'oyun-kural-planlama', label: 'Kural planlama', area: 'Oyun', description: 'Oyunun kurallarını karo ve sonuç tablosuna dökerek olay bloklarına çevirir.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'oyun-atolyesi:3:1': ['oyun-harita-izgara', 'oyun-karo-duvar', 'oyun-hata-ayiklama'],
  'oyun-atolyesi:3:2': ['oyun-karo-olay', 'oyun-karo-duvar', 'oyun-harita-izgara', 'oyun-hata-ayiklama', 'oyun-kazanma-kosulu'],
  'oyun-atolyesi:3:3': ['oyun-olay-karosu', 'oyun-karo-olay', 'oyun-kazanma-kosulu', 'oyun-harita-izgara', 'oyun-hata-ayiklama'],
  'oyun-atolyesi:3:4': ['oyun-kamera', 'oyun-karo-sprite', 'oyun-harita-izgara', 'oyun-hata-ayiklama'],
  'oyun-atolyesi:3:5': ['oyun-kural-planlama', 'oyun-olay-karosu', 'oyun-karo-olay', 'oyun-harita-izgara', 'oyun-kamera', 'oyun-hata-ayiklama', 'oyun-kazanma-kosulu'],
```
Modül slug'ı `oyun-atolyesi` (module.json). Hafta 3 = anahtardaki `3`.

## Doğrulama notu
Soru cevapları motor kodundan (`apps/web/src/lib/oyun/engine.ts`: karo olayı kenar tetiklemeli, kamera `clamp(t.x - 80, 0, dünya - 160)`, karo merkezi `sütun*16+8`) ve etkinlik dosyalarından (d11-d15) elle doğrulandı.
