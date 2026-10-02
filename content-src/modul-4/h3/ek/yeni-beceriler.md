# Modül 4 Hafta 3: yeni beceri kimlikleri

Bu dosya build tarafından okunmaz. Koordinatör `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine aşağıdaki kimlikleri ve `LESSON_SKILLS` eşlemesine aşağıdaki anahtarları ekler. Mini testlerdeki `skills` etiketleri bu kimlikleri kullanır; eklenene kadar `node tools/content/build.mjs modul-4` "bilinmeyen beceri" hatası verir.

## SKILLS'e eklenecekler (`id`, `label`, `area`, `description`)
| id | label | area | description |
|---|---|---|---|
| `sens-dht-read` | DHT sensörü okuma | Sensör | DHT11/DHT22 ile sıcaklık ve nem okur; NaN değerini isnan ile yakalar, 2 saniyelik okuma aralığını ve ardışık hata sayacını bilir. |
| `sens-i2c-bmp` | I2C sensör (BMP280) | Sensör | BMP280'i I2C adresiyle bulur, begin sonucunu denetler ve sensör yokken programı korur. |
| `sens-altitude` | Basınç ve rakım | Sensör | Pa ile hPa arasında çevirir, rakım formülünü ve deniz seviyesi basıncının (P0) etkisini yorumlar. |
| `sens-analog-calib` | Analog sensör kalibrasyonu | Sensör | Sensörün yönünü ölçerek bulur; map ve constrain ile ham değeri yüzdeye çevirir. |
| `sens-threshold-hyst` | Eşik ve histerezis | Sensör | Eşik titremesini tanır ve iki eşikle (histerezis) durum geçişlerini kurar. |
| `ui-paging` | Sayfalı ekran | Arayüz | Sayfa değişkenini % işleciyle döndürür; sayfa, buton ve ölçümü delay olmadan zamanlar. |
| `ui-text-format` | Metin biçimlendirme | Arayüz | snprintf ve dtostrf ile ekran metnini biçimler; satırı 16 karaktere tamamlar. |
| `proj-integration` | Proje bütünleştirme | Proje | Birden çok sensör ve çıkışı durum tablosuyla tasarlayıp tek programda birleştirir. |

Mevcut kimlikler (`prog-timing`, `prog-debug`, `prog-planning`) olduğu gibi kullanılır.

## LESSON_SKILLS'e eklenecekler (`modül-slug:hafta:ders`)
```ts
'sensorler-ve-projeler:3:1': ['sens-dht-read', 'prog-timing', 'prog-debug'],
'sensorler-ve-projeler:3:2': ['sens-i2c-bmp', 'sens-altitude', 'prog-debug'],
'sensorler-ve-projeler:3:3': ['sens-analog-calib', 'sens-threshold-hyst', 'prog-debug'],
'sensorler-ve-projeler:3:4': ['ui-paging', 'ui-text-format', 'prog-timing', 'prog-debug'],
'sensorler-ve-projeler:3:5': ['proj-integration', 'sens-threshold-hyst', 'prog-timing', 'prog-debug', 'prog-planning'],
```
