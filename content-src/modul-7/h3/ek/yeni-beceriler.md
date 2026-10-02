# Modül 7 Hafta 3: önerilen yeni beceri kimlikleri

Not: `apps/web/src/lib/skills.ts` bu ajan tarafından DEĞİŞTİRİLMEDİ. Aşağıdaki kimlikler `SKILLS` listesine eklenmeden `node tools/content/build.mjs modul-7` "bilinmeyen beceri" hatasıyla durur. Diğer haftaların ajanları aynı kimlikleri (özellikle `ai-prompt-parts`, `ai-honest-measure`) kullanıyor/tanımlıyor olabilir; koordinatör tekrarları birleştirmelidir.

## SKILLS (id | etiket | alan | açıklama)
- ai-prompt-parts | Prompt parçaları | Prompt mühendisliği | Görev, rol, bağlam, örnek, biçim ve kısıt parçalarını tanır ve yerleştirir.
- ai-fewshot | Az örnekle öğretme | Prompt mühendisliği | Sıfır ve az örnekli istemi ayırır; dengeli, tutarlı, doğru örnekler yazar; ince ayardan farkını bilir.
- ai-structured-output | Yapılandırılmış çıktı | Prompt mühendisliği | Programın okuyacağı biçimi (JSON) ister; anahtar adlarını ve geçerli JSON kurallarını bilir.
- ai-output-validate | Çıktı doğrulama | Prompt mühendisliği | Model çıktısını ayrıştırıp anahtarlarını kontrol eder; başarısızlığı yeniden deneme ya da hata ile karşılar.
- ai-reasoning-steps | Düşünme zinciri | Prompt mühendisliği | Ara adım isteme, cevabı ayrı satıra yazdırma, adımları doğrulama ve kesin hesap için araç kullanma kararını verir.
- ai-prompt-iterate | Yinelemeyle prompt geliştirme | Prompt mühendisliği | Tek değişiklik yapar, sürümleri kaydeder, gerçek örneklerde başarı oranını karşılaştırır.
- ai-honest-measure | Ölçüm ve araç sınırları | Prompt mühendisliği | Kural tabanlı denetleyicinin ve simülasyonun sınırlarını bilir; kanıtı ölçülmüş sonuçta arar.

## LESSON_SKILLS eşlemesi (anahtar: ai-muhendisligi:3:<ders>)
- 'ai-muhendisligi:3:1': ['ai-fewshot', 'ai-prompt-parts', 'ai-honest-measure']
- 'ai-muhendisligi:3:2': ['ai-structured-output', 'ai-output-validate', 'ai-honest-measure']
- 'ai-muhendisligi:3:3': ['ai-reasoning-steps', 'ai-output-validate', 'ai-honest-measure']
- 'ai-muhendisligi:3:4': ['ai-prompt-iterate', 'ai-honest-measure']
- 'ai-muhendisligi:3:5': ['ai-prompt-parts', 'ai-prompt-iterate', 'ai-honest-measure']

Kullanılan ders anahtarı biçimi `modül-slug:hafta:ders` (hafta içi sıra 1-5; küresel numara değil). Modül slug'ı `ai-muhendisligi`.
