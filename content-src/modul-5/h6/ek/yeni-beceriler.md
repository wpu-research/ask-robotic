# Modül 5 (Robotik), Hafta 6 için yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` değiştirilmedi. Bu haftanın mini testleri aşağıdaki YENİ kimlikleri kullanır; koordinatör bunları `SKILLS` listesine ve `LESSON_SKILLS` eşlemesine eklemelidir. Eklenmezse `node tools/content/build.mjs modul-5` "bilinmeyen beceri" hatası verir.

Mevcut kimlikler (`prog-debug`, `prog-timing`) aynen kullanıldı. Başka haftalar aynı alanlarda kimlik önerdiyse birleştirilebilir; bu dosyadaki kimlikler H6'ya özgüdür.

## Yeni kimlikler (SKILLS)
| id | label | area | description |
|---|---|---|---|
| `imu-tilt` | İvmeölçerle eğim | Robotik | Yerçekimi payından atan2(ax, az) ile eğimi hesaplar; derece ve radyanı, tam sayı bölmesi tuzağını bilir. |
| `imu-gyro` | Jiroskop hızı ve sapma | Robotik | Ham jiroskop değerini aralığa uygun ölçekle °/s'ye çevirir; sapmayı açılışta ölçüp çıkarmanın nedenini bilir. |
| `filter-complementary` | Tamamlayıcı filtre | Robotik | Jiroskop ve ivmeölçeri α ile birleştirir; zaman sabitini ve kalıcı hatayı hesaplar, Kalman fikrini ayırt eder. |
| `ctrl-fixed-period` | Sabit periyotlu kontrol döngüsü | Robotik | dt'nin önemini, delay() tuzağını, planlanan zamanla (+=) sabit periyodu, taşmayı ve micros() sarmasını bilir. |
| `ctrl-cascade` | Kaskad kontrol | Robotik | Dış döngünün hedef açı, iç döngünün motor komutu ürettiğini bilir; hız oranını, işaretleri ve hedef sınırını yorumlar. |
| `ctrl-state-safety` | Durum makinesi ve güvenli duruş | Robotik | DENGE, KONTROLSUZ, DUSTU gibi durumlarla düşmeyi iki yönde algılar, motorları keser; en büyük eğim ve oturma süresini ölçer. |
| `robot-tuning` | Kazanç ayarı ve benzetimden gerçeğe geçiş | Robotik | Kazançların robota özel olduğunu, küçükten başlayıp önce KP, sonra KD, en son dış döngüyü ayarlamak gerektiğini bilir. |

## Önerilen LESSON_SKILLS eşlemesi
Her sorunun `skills` etiketleri dersin eşlemesinin alt kümesidir.

```
'robotik:6:1': ['imu-tilt', 'imu-gyro', 'prog-debug'],
'robotik:6:2': ['filter-complementary', 'imu-tilt', 'imu-gyro', 'prog-debug'],
'robotik:6:3': ['ctrl-fixed-period', 'prog-timing', 'prog-debug'],
'robotik:6:4': ['ctrl-cascade', 'robot-tuning', 'prog-debug'],
'robotik:6:5': ['ctrl-state-safety', 'ctrl-cascade', 'robot-tuning', 'imu-gyro', 'prog-debug'],
```
