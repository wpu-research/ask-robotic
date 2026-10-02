# Modül 4, Hafta 4 için yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` değiştirilmedi. Bu haftanın mini testleri aşağıdaki YENİ kimlikleri kullanır; koordinatör bunları `SKILLS` listesine ve `LESSON_SKILLS` eşlemesine eklemelidir. Eklenmezse `node tools/content/build.mjs modul-4` "bilinmeyen beceri" hatası verir.

Mevcut kimlikler (`prog-debug`, `prog-timing`) aynen kullanıldı.

## Yeni kimlikler (SKILLS)
| id | label | area | description |
|---|---|---|---|
| `sens-ldr-divider` | Işık sensörü (LDR) okuma yönü | Sensör | LDR bölücüsünde ışığın analogRead değerini hangi yönde değiştirdiğini bilir ve karşılaştırmayı buna göre yazar. |
| `sens-hysteresis` | Histerezis | Sensör | Açma ve kapama için iki ayrı eşik kullanarak titremeyi önler; ölü bölgeyi ve bant genişliğini yorumlar. |
| `sens-noise` | Gürültü | Sensör | Okuma gürültüsünün eşik karşılaştırmasını nasıl bozduğunu ve gürültüye göre bant seçmeyi bilir. |
| `sens-event-detect` | Ses olayı tanıma | Sensör | Baz seviyeden sapma, tepe ve süre ile bir olayı sınıflandırır; sessizlik payının nedenini bilir. |
| `sens-baseline` | Baz değer ve göreli eşik | Sensör | Isınma sonrası temiz havada baz ölçer, eşiği bazın katı olarak yazar ve ppm yerine oran kullanır. |
| `sens-smoothing` | Yumuşatma | Sensör | Yeni okumayı eski ortalamayla karıştırarak ani sıçramaları yumuşatmanın etkisini hesaplar. |
| `sens-direction` | Sensör yönünü tek yerde çözmek | Sensör | Modülün çıkış yönünü (alevde düşer/yükselir) tek fonksiyonla "şiddet"e çevirir. |
| `sens-levels` | Çoklu seviye (enum ve seviyeBul) | Sensör | NORMAL, UYARI, TEHLIKE gibi seviyeleri dört eşikle ve enum ile yönetir. |
| `prog-reuse-functions` | Parametreli fonksiyonla yeniden kullanım | Programlama | Aynı mantığı kopyalamak yerine eşikleri parametre alan bir fonksiyonla birden çok sensörde kullanır. |
| `alarm-design` | Alarm paneli tasarımı | Proje | Girdi-karar-çıktı katmanlarını ayırır; genel durumu en kötü seviyeden bulur, çıkışları seviyeden türetir. |
| `safety-sensors` | Sensör güvenliği ve sınırları | Güvenlik | Sensör devrelerinin eğitim amaçlı olduğunu, gerçek güvenlik için sertifikalı cihaz gerektiğini bilir. |

## Önerilen LESSON_SKILLS eşlemesi
Her sorunun `skills` etiketleri dersin eşlemesinin alt kümesidir.

```
'sensorler-ve-projeler:4:1': ['sens-ldr-divider', 'sens-hysteresis', 'sens-noise', 'prog-debug'],
'sensorler-ve-projeler:4:2': ['sens-noise', 'sens-event-detect', 'prog-timing', 'prog-debug'],
'sensorler-ve-projeler:4:3': ['sens-baseline', 'sens-smoothing', 'safety-sensors', 'prog-debug'],
'sensorler-ve-projeler:4:4': ['sens-direction', 'sens-levels', 'sens-hysteresis', 'prog-reuse-functions', 'prog-debug'],
'sensorler-ve-projeler:4:5': ['alarm-design', 'sens-levels', 'sens-baseline', 'safety-sensors', 'prog-timing', 'prog-debug'],
```
