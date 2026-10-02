# Modül 10 Hafta 5 — yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` bu ajan tarafından değiştirilmedi. Mini testler aşağıdaki YENİ kimlikleri kullanır (ayrıca mevcut `prog-debug` ve `prog-planning`); `node tools/content/build.mjs modul-10` bunları `SKILLS` içinde bulamazsa üretim durur. Koordinatör `SKILLS` dizisine bu kayıtları eklemeli ve `LESSON_SKILLS` eşlemesini aşağıdaki gibi genişletmeli.

## Eklenecek SKILLS kayıtları
| id | label | area | description |
|---|---|---|---|
| `mk-radio-group` | Radyo grubu | Haberleşme | Radyo grubunun (0-255) kartların birbirini duyması için aynı olması gerektiğini bilir. |
| `mk-message-flow` | Mesaj gönderme ve alma | Haberleşme | Gönderen ve alan tarafı ayrı programlar; gönderenin kendi mesajını almadığını ve alma sırasını (en çok 3 mesaj) bilir. |
| `mk-radio-types` | Radyo mesaj türleri | Haberleşme | Sayı, yazı ve ad = değer mesajlarını ve uzunluk sınırlarını (yazı 32, ad 12) kullanır. |
| `mk-conditions` | Koşul ve eğer zinciri | Programlama | Gelen değere göre eğer ve iç içe eğer zinciriyle karar verir. |
| `mk-variables` | Değişken ve hesap | Programlama | Değişkene değer atar, toplama ve çıkarma yapar, gelen mesajı değişkende tutar. |
| `mk-cipher` | Şifre ve anahtar | Haberleşme | Anahtarla toplayıp çıkararak basit şifreleme yapar; yanlış anahtarın sonucunu ve zayıflığını açıklar. |
| `mk-protocol` | Komut tablosu (protokol) | Haberleşme | İki taraf için ortak sayı-anlam tablosu kurar ve uyumsuzluğu bulur. |
| `mk-servo-tilt` | Yatış ve servo | Donanım | Kart yatış olayını (duruş değişince doğar) ve servo açısını (0-180) kullanır. |

## Eklenecek LESSON_SKILLS satırları (hafta:ders sırası, haftadaki ders numarasıdır)
```
'mikro-kart:5:1': ['mk-radio-group', 'mk-message-flow', 'mk-conditions', 'prog-debug'],
'mikro-kart:5:2': ['mk-radio-types', 'mk-conditions', 'prog-debug'],
'mikro-kart:5:3': ['mk-cipher', 'mk-variables', 'prog-debug'],
'mikro-kart:5:4': ['mk-protocol', 'mk-message-flow', 'mk-variables', 'mk-conditions', 'prog-debug'],
'mikro-kart:5:5': ['mk-protocol', 'mk-conditions', 'mk-servo-tilt', 'prog-planning', 'prog-debug'],
```
(Anahtar biçimi `modül-slug:hafta:ders`; mevcut girdilerdeki gibi `arduino-temelleri:1:1` kalıbı. Modül slug'ı `mikro-kart`.)
