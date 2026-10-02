# Modül 7 Hafta 4: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` dosyasına eklenmesi gereken kimlikler (bu hafta yazan ajan o dosyayı DEĞİŞTİRMEDİ). `NN.json` içindeki `skills` etiketleri bu kimlikleri kullanır. Eklenmezse `node tools/content/build.mjs modul-7` "bilinmeyen beceri" hatası verir.

## SKILLS
| id | label | area | description |
|---|---|---|---|
| `eval-basics` | Eval ve doğruluk | Yapay zekâ | Eval'ın ne olduğunu, test vakasının girdi ve beklenen çıktıdan oluştuğunu bilir; doğruluğu (doğru / toplam) hesaplar. |
| `eval-cases` | Test vakası tasarımı | Yapay zekâ | Net, tekrarsız, kolay ve zor vakalardan; olumlu, olumsuz ve belirsiz etiketlerden dengeli bir test seti yazar. |
| `eval-metrics` | Etiket bazlı ölçü | Yapay zekâ | Geri çağırmayı bir etiket için hesaplar; dengesiz veride tek doğruluk sayısının neden yanıltıcı olduğunu ve hataları gruplamayı bilir. |
| `eval-edge` | Kenar durumlar | Yapay zekâ | Eşiklerin iki yanını ve çift vakaları kullanarak bir kuraldaki sınır hatalarını ve eksik girdiyi bulur. |
| `eval-method` | Eval yöntemi ve güven | Yapay zekâ | Veri sızıntısını, küçük setin güven sınırını ve değişiklik sonrası yeniden ölçmeyi (gerileme testi) bilir; dürüst rapor yazar. |

## LESSON_SKILLS
```ts
'ai-muhendisligi:4:1': ['eval-basics', 'eval-cases', 'eval-method'],
'ai-muhendisligi:4:2': ['eval-cases', 'eval-basics', 'eval-method'],
'ai-muhendisligi:4:3': ['eval-metrics', 'eval-basics', 'eval-method'],
'ai-muhendisligi:4:4': ['eval-edge', 'eval-basics', 'eval-cases', 'eval-method'],
'ai-muhendisligi:4:5': ['eval-method', 'eval-metrics', 'eval-basics', 'eval-cases'],
```
