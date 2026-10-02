# Modül 10 (Mikro Kart) Hafta 3: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` dosyasına eklenmesi gereken kimlikler (bu hafta yazan ajan o dosyayı DEĞİŞTİRMEDİ). `NN.json` içindeki `skills` etiketleri bu kimlikleri kullanır. Eklenmezse `node tools/content/build.mjs modul-10` "bilinmeyen beceri" hatası verir. (Mikro Kart başka haftaları aynı kimlikleri kullanıyorsa tekrar eklenmemeli.)

## SKILLS
| id | label | area | description |
|---|---|---|---|
| `mk-events` | Olay blokları | Mikro Kart | Başlık (olay) bloklarının durum değişince çalıştığını, aynı durumun olayı yeniden üretmediğini bilir. |
| `mk-accel` | İvmeölçer ve duruş | Mikro Kart | x, y, z eksenlerini, milli-g birimini ve 700 duruş eşiğini yorumlar; hareket gücünü hesaplar. |
| `mk-conditions` | Eğer ve karşılaştırma | Mikro Kart | Eğer / değilse bloğunu ve karşılaştırma işaretlerini (>, <, =) doğru kurar. |
| `mk-sensors` | Sanal sensörler | Mikro Kart | Sıcaklık, ışık ve ses sensörlerinin aralıklarını ve okuma anında değer alındığını bilir. |
| `mk-threshold` | Eşik seçimi | Mikro Kart | Eşiği ölçülen aralığa göre seçer; sınır değerinde karşılaştırmanın sonucunu bilir. |
| `mk-bar` | Çubuk grafik hesabı | Mikro Kart | Çubuk grafikteki LED sayısını değer ÷ en çok × 25 ile hesaplar; en çok değerini doğru seçer. |
| `mk-compass` | Pusula ve yön | Mikro Kart | Pusula derecelerini yönlerle eşleştirir, 360'ın 0 olduğunu bilir ve ok açısını 360 eksi pusula olarak kurar. |
| `mk-variables` | Değişken ve sayaç | Mikro Kart | Değişkeni başlatır, artırır ve değişkenli bir programın sonucunu sırayla izleyerek bulur. |
| `mk-modulo` | Kalan ve mod döngüsü | Mikro Kart | Kalan işlemiyle 0..n-1 aralığında dönen bir sayaç kurar. |
| `mk-display` | Ekranı tek yerden yönetme | Mikro Kart | Aynı ekrana birden çok yerden yazmanın çakışma yarattığını bilir; çizimi tek yerde toplar. |
| `mk-debug` | Blok programda hata bulma | Mikro Kart | Eksik değilse kolu, yanlış eşik, yanlış en çok, yanlış işaret gibi blok hatalarını bulur. |

## LESSON_SKILLS
```ts
'mikro-kart:3:1': ['mk-accel', 'mk-events', 'mk-conditions', 'mk-debug'],
'mikro-kart:3:2': ['mk-sensors', 'mk-threshold', 'mk-conditions', 'mk-bar', 'mk-debug'],
'mikro-kart:3:3': ['mk-compass', 'mk-display', 'mk-events', 'mk-debug'],
'mikro-kart:3:4': ['mk-sensors', 'mk-threshold', 'mk-variables', 'mk-bar', 'mk-events', 'mk-debug'],
'mikro-kart:3:5': ['mk-modulo', 'mk-variables', 'mk-bar', 'mk-sensors', 'mk-conditions', 'mk-display', 'mk-debug'],
```
