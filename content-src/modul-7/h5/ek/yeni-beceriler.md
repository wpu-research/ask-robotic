# Modül 7 Hafta 5: yeni beceri kimlikleri

`apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine EKLENMEDİ (görev gereği o dosyaya dokunulmadı). Koordinatörün eklemesi gerekir; eklenmezse `node tools/content/build.mjs modul-7` "bilinmeyen beceri" hatasıyla durur. (Modül 7 başka haftaları aynı kimlikleri kullanmaz; çakışma yok.)

## SKILLS'e eklenecek (id | etiket | alan | açıklama)
- `ai-vektor-kosinus` | Metin vektörü ve kosinüs | Yapay zekâ | Metni terim sayılarından oluşan vektöre çevirir; iki vektörün kosinüs benzerliğini hesaplar ve ortak terim yoksa 0 çıktığını bilir.
- `ai-tfidf` | TF-IDF ağırlığı | Yapay zekâ | Nadir terimlerin neden daha çok ağırlık aldığını açıklar; idf = ln((n+1)/(df+1)) + 1 formülünü hesaplar.
- `ai-embed-limit` | Sayım vektörünün sınırı | Yapay zekâ | Eş anlamlıların sayım vektöründe neden eşleşmediğini, gövdelemenin ve sorgu genişletmenin neyi çözdüğünü bilir; gömme modellerinin fikrini söyler.
- `ai-chunking` | Parçalama ve örtüşme | Yapay zekâ | Belgeyi boy ve örtüşmeyle parçalar; parça sayısını (adım = boy - örtüşme) hesaplar; boyun bedellerini bilir.
- `ai-rag-pipeline` | RAG hattı | Yapay zekâ | Parçala, vektörleştir, getir, yerleştir ve sentezle adımlarını sıralar; hangi adımın gerçek hesap, hangisinin şablon olduğunu ayırır.
- `ai-retrieval` | Getirme ve top-K | Yapay zekâ | Parçaları benzerliğe göre sıralayıp top-K seçer; belirsiz sorunun getirmeyi nasıl bozduğunu bilir.
- `ai-rag-grounding` | Bağlama dayanma | Yapay zekâ | Prompt şablonuyla bağlamı yerleştirir; "bilmiyorum" talimatının ve kaynak kalitesinin önemini bilir.
- `ai-rag-eval` | RAG ölçümü | Yapay zekâ | Getirme isabetini ve cevabın sadakatini ayrı ölçer; hatayı doğru adıma bağlar.

## LESSON_SKILLS eşlemesi (anahtar: modül-slug:hafta:ders)
```
'ai-muhendisligi:5:1': ['ai-vektor-kosinus', 'ai-tfidf'],
'ai-muhendisligi:5:2': ['ai-embed-limit', 'ai-vektor-kosinus', 'ai-retrieval'],
'ai-muhendisligi:5:3': ['ai-chunking', 'ai-rag-pipeline'],
'ai-muhendisligi:5:4': ['ai-retrieval', 'ai-rag-pipeline', 'ai-rag-grounding'],
'ai-muhendisligi:5:5': ['ai-rag-pipeline', 'ai-chunking', 'ai-retrieval', 'ai-rag-grounding', 'ai-rag-eval'],
```
(Sorulardaki `skills` etiketleri bu eşlemenin alt kümesidir.)
