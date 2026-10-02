# Modül 11 Hafta 6: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine EKLENMEDİ (görev gereği o dosyaya dokunulmadı). Koordinatörün eklemesi gerekir; eklenmezse `node tools/content/build.mjs modul-11` "bilinmeyen beceri" hatasıyla durur. Başka M11 haftaları aynı kimlikleri tanımlıyorsa birleştir.

## SKILLS'e eklenecek (id | etiket | alan | açıklama)
- `oyun-iskelet` | Oyun iskeleti | Oyun tasarımı | Bir oyunun oyuncu, hedef, tehlike, kazanma ve kaybetme parçalarını sayar; skor ve canı başlangıçta ayarlar.
- `oyun-tasarim` | Oyun tasarımı ve planı | Oyun tasarımı | Fikri tasarım kartına döker, oyunu iskelet, tehlike, bitiş ve cila turlarına böler; sprite türlerini doğru seçer.
- `oyun-olay` | Olaylar ve çarpışma | Oyun programlama | Çarpışma (bir kez), her karede (saniyede 60) ve zamanlı olayların ne zaman çalıştığını bilir; kuralları bağımsız olaylara ayırır.
- `oyun-kosul` | Koşul ve karar | Oyun programlama | `eğer … ise … değilse` ve `≥`/`=` farkını kullanır; kontrolü doğru yere koyar.
- `oyun-degisken` | Değişken ve bayrak | Oyun programlama | Değişkeni başlatır, `değiştir` ile `yap` farkını bilir; bayrak değişkeniyle olaylar arası bilgi taşır.
- `oyun-zorluk` | Zorluk, zaman ve hesap | Oyun programlama | Geri sayımı, periyodik olayları ve hız, mesafe, süre hesaplarını kullanarak zorluğu dengeler.
- `oyun-harita` | Harita ve karo koordinatı | Oyun programlama | Karo (sütun, satır) ile piksel koordinatı arasında dönüşüm yapar (x = sütun × 16 + 8).
- `oyun-hata` | Hata ayıklama (oyun) | Oyun programlama | Dedektif yöntemiyle belirtiden bloğa ulaşır; yaygın hataları (işaret, silmeyi unutma, yanlış değer) bulur.

## Kullanılan mevcut beceriler
Yok.

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)
```
'oyun-atolyesi:6:1': ['oyun-iskelet', 'oyun-tasarim', 'oyun-kosul', 'oyun-olay', 'oyun-hata'],
'oyun-atolyesi:6:2': ['oyun-zorluk', 'oyun-degisken', 'oyun-olay', 'oyun-iskelet', 'oyun-hata'],
'oyun-atolyesi:6:3': ['oyun-degisken', 'oyun-kosul', 'oyun-harita', 'oyun-zorluk', 'oyun-hata'],
'oyun-atolyesi:6:4': ['oyun-hata', 'oyun-olay', 'oyun-zorluk'],
'oyun-atolyesi:6:5': ['oyun-olay', 'oyun-tasarim', 'oyun-iskelet', 'oyun-zorluk'],
```
(Her sorunun `skills` etiketi ilgili dersin kümesinin içindedir; betikle denetlendi.)
