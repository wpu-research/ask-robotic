# Modül 7 Hafta 2: yeni beceri kimlikleri (koordinatör için)

`ek/*.json` içindeki testler aşağıdaki YENİ kimlikleri kullanır. `apps/web/src/lib/skills.ts` içindeki `SKILLS` listesine eklenene kadar `node tools/content/build.mjs modul-7` "bilinmeyen beceri" hatası verir. (Başka Modül 7 haftaları aynı kimlikleri kullanıyorsa tekrar eklenmemeli.)

## SKILLS'e eklenecekler
```ts
  { id: 'ai-next-token', label: 'Sonraki token tahmini', area: 'Yapay zekâ', description: 'Dil modelinin bir sonraki token\'ı olasılıklarla seçtiğini bilir.' },
  { id: 'ai-temperature', label: 'Sıcaklık', area: 'Yapay zekâ', description: 'Sıcaklığın olasılık dağılımını nasıl keskinleştirip düzleştirdiğini ve hangi iş için hangi sıcaklığın uygun olduğunu bilir.' },
  { id: 'ai-softmax', label: 'Softmax hesabı', area: 'Yapay zekâ', description: 'Sayım ve sıcaklıktan olasılıkları (softmax) elle ya da kodla hesaplar.' },
  { id: 'ai-limits', label: 'Model sınırları', area: 'Yapay zekâ', description: 'Tutarlı çıktının doğru olmadığını, rolün bilgi eklemediğini ve denetimin gerekliliğini bilir.' },
  { id: 'ai-context-window', label: 'Bağlam penceresi', area: 'Yapay zekâ', description: 'Bağlam penceresinin neleri kapsadığını ve dolunca ne olduğunu bilir.' },
  { id: 'ai-token-budget', label: 'Token bütçesi', area: 'Yapay zekâ', description: 'Pencere, girdi ve cevap arasındaki token bütçesini ve şablon maliyetini hesaplar.' },
  { id: 'ai-truncation', label: 'Kırpma', area: 'Yapay zekâ', description: 'Pencere dolunca eski token\'ların dışarıda kaldığını ve bunu kodda yorumlar.' },
  { id: 'ai-messages', label: 'Mesaj yapısı', area: 'Yapay zekâ', description: 'Sistem, kullanıcı ve asistan mesajlarını ve geçmişin her istekte yeniden gönderildiğini bilir.' },
  { id: 'ai-roles', label: 'Rol verme', area: 'Yapay zekâ', description: 'Rolün üslubu yönlendirdiğini ama bilgi eklemediğini bilir.' },
  { id: 'ai-secrets', label: 'Gizli bilgi ve girdi ayırma', area: 'Yapay zekâ', description: 'Gizli bilginin prompt\'a yazılmaması gerektiğini ve girdiyi talimattan ayırmanın riski azalttığını bilir.' },
  { id: 'ai-prompt-parts', label: 'Prompt parçaları', area: 'Yapay zekâ', description: 'Görev, rol, bağlam, örnek, biçim ve kısıt parçalarını ayırt eder ve açık bir istem yazar.' },
  { id: 'ai-lint-limits', label: 'Denetleyici sınırları', area: 'Yapay zekâ', description: 'Kural tabanlı bir prompt denetleyicisinin nasıl puanladığını ve neyi ölçemediğini bilir.' },
  { id: 'ai-prompt-template', label: 'Prompt şablonu', area: 'Yapay zekâ', description: 'Sabit talimat ve yer tutuculu değişken girdiden tekrar kullanılabilir şablon kurar.' },
```

## LESSON_SKILLS'e eklenecekler (test: soru becerileri bu listelerin alt kümesi olmalı)
```ts
  'ai-muhendisligi:2:1': ['ai-next-token', 'ai-temperature', 'ai-softmax', 'ai-limits'],
  'ai-muhendisligi:2:2': ['ai-context-window', 'ai-token-budget', 'ai-truncation', 'ai-limits'],
  'ai-muhendisligi:2:3': ['ai-messages', 'ai-roles', 'ai-secrets', 'ai-context-window', 'ai-limits'],
  'ai-muhendisligi:2:4': ['ai-prompt-parts', 'ai-lint-limits', 'ai-limits'],
  'ai-muhendisligi:2:5': ['ai-prompt-template', 'ai-prompt-parts', 'ai-token-budget', 'ai-secrets', 'ai-lint-limits'],
```
Not: Ders 2:3'te `ai-context-window` yalnız bazı sorularda kullanılır; test yalnız alt küme denetler.

## Doğrulama notu
Bu kimlikler yokken yazarın kendi doğrulaması (ek.mjs `validateConcepts`/`validateQuiz` doğrudan, beceri kümesi bu listeyle) hatasız geçti.
