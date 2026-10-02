# Modül 7 Hafta 7: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` testleri aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-7` "bilinmeyen beceri" hatası verir. (Kimlikler `ai-` önekli; başka Modül 7 haftaları aynı kimlikleri kullanıyorsa birleştir.)

## SKILLS'e eklenecekler
```ts
  { id: 'ai-code-workflow', label: 'Yapay zekâyla kod yazma akışı', area: 'Yapay zekâ', description: 'Hedef, plan, küçük adım, test, inceleme ve commit basamaklarıyla bir kodlama aracını güvenli yönetir; araca en az yetki verir.' },
  { id: 'ai-code-review', label: 'Üretilen kodu inceleme', area: 'Yapay zekâ', description: 'Yapay zekânın ürettiği kodu ve açıklamasını okur; uydurulmuş fonksiyonu, yanlış girintiyi ve uç durumları yakalar.' },
  { id: 'ai-verification', label: 'İddiayı doğrulama', area: 'Yapay zekâ', description: 'Bir iddiayı kaynakla karşılaştırıp uyumlu, çelişen ya da kaynakta olmayan diye ayırır; çıktıyı elle tahmin eder.' },
  { id: 'ai-injection', label: 'Prompt injection', area: 'Yapay zekâ', description: 'Doğrudan ve dolaylı prompt injection saldırısını ve kara listenin neden kırılgan olduğunu açıklar.' },
  { id: 'ai-defense', label: 'Katmanlı savunma', area: 'Yapay zekâ', description: 'Veri/talimat ayrımı, hiyerarşi, çıktı süzgeci, en az yetki ve insan onayı katmanlarını seçer ve sınırlarını bilir.' },
  { id: 'ai-red-team', label: 'Kırmızı takım ve raporlama', area: 'Yapay zekâ', description: 'Bulgu, etki, öneri, kalan risk biçiminde rapor yazar; sorumlu ifşa ilkesini uygular.' },
```

## LESSON_SKILLS'e eklenecekler (soru becerileri bu listelerin alt kümesi)
```ts
  'ai-muhendisligi:7:1': ['ai-code-workflow', 'ai-code-review'],
  'ai-muhendisligi:7:2': ['ai-code-review', 'ai-verification'],
  'ai-muhendisligi:7:3': ['ai-injection', 'ai-defense'],
  'ai-muhendisligi:7:4': ['ai-defense', 'ai-injection'],
  'ai-muhendisligi:7:5': ['ai-red-team', 'ai-defense'],
```
