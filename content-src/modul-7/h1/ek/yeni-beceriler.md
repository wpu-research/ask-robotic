# Modül 7 Hafta 1: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine (koordinatör tarafından) eklenmesi gerekenler. Mini testler bu kimlikleri kullanır; eklenmeden `build.mjs` "bilinmeyen beceri" hatası verir.

| id | label | area | description |
|---|---|---|---|
| ai-concepts | Yapay zekâ kavramları | Yapay zekâ | Yapay zekâ, makine öğrenmesi ve dil modeli arasındaki farkı bilir. |
| ai-simulation-literacy | Simülasyon okuryazarlığı | Yapay zekâ | Gerçek hesapla simülasyon/şablon etiketli adımı ayırt eder; model cevabı sanmaz. |
| ai-tokens | Token | Yapay zekâ | Metnin token'lara bölünüp sayıya çevrildiğini bilir; token sayısını etkileyenleri açıklar. |
| ai-bpe | BPE | Yapay zekâ | En sık çifti birleştirme kuralını uygular, çift sayar, görülmemiş kelimenin parçalanmasını açıklar. |
| ai-next-token | Sonraki parça tahmini | Yapay zekâ | Sayımdan olasılık hesaplar; bağlam, geri çekilme ve tohumu açıklar. |
| ai-model-limits | Modelin sınırları | Yapay zekâ | Kopya, yeniden birleştirme ve bağlam sınırı gibi garipliğin kaynağını bulur; küçük hataları ayıklar. |

## LESSON_SKILLS eşlemesi (test, soru becerilerinin dersin eşlemesinin alt kümesi olmasını denetler)

```
'ai-muhendisligi:1:1': ['ai-concepts', 'ai-next-token', 'ai-simulation-literacy'],
'ai-muhendisligi:1:2': ['ai-tokens', 'ai-bpe', 'ai-model-limits'],
'ai-muhendisligi:1:3': ['ai-bpe', 'ai-tokens', 'ai-model-limits'],
'ai-muhendisligi:1:4': ['ai-next-token', 'ai-model-limits', 'ai-simulation-literacy'],
'ai-muhendisligi:1:5': ['ai-next-token', 'ai-model-limits', 'ai-simulation-literacy'],
```
