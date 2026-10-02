# Yeni beceri kimlikleri (Modül 7 Hafta 8)

`apps/web/src/lib/skills.ts` bu ajanın kapsamı dışındadır. Aşağıdaki kimlikler `SKILLS` listesine eklenmeli ve `LESSON_SKILLS` eşlemesi tanımlanmalıdır. Aksi hâlde `node tools/content/build.mjs modul-7` bilinmeyen beceri hatası verir. Mevcut kimliklerden yalnız `prog-debug` kullanıldı.

## SKILLS satırları (id | label | area | description)
- ai-hallucination | Halüsinasyonu tanıma | Yapay zekâ | Çıktıdaki iddiayı kaynakla karşılaştırıp uyumlu, çelişiyor ya da kaynakta yok diye ayırır.
- ai-verify | Doğrulama | Yapay zekâ | Model çıktısını kaynağa bakarak ya da kodu çalıştırarak kontrol eder.
- ai-eval-rate | Oran ve doğruluk hesabı | Yapay zekâ | Vaka sayısından doğruluk, hata oranı ve beklenen hata sayısını hesaplar.
- ai-privacy | Gizlilik | Yapay zekâ | Servise yazılmaması gereken bilgileri bilir; veriyi anonimleştirir.
- ai-attribution | Kaynak ve dürüstlük | Yapay zekâ | Yapay zekâ yardımını belirtir ve kaynakları kendisi doğrular.
- ai-bias | Önyargıyı ölçme | Yapay zekâ | Grup bazlı doğruluğu karşılaştırarak önyargıyı gösterir.
- ai-rule-vs-model | Kural mı, model mi | Yapay zekâ | Bir kararın kurala ya da modele bırakılmasının nedenlerini ve eşik seçimini açıklar.
- ai-agent-script | Ajan betiği | Yapay zekâ | Ajan betiğini (araç çağrıları, eğer, $son) okur, izler ve hatalarını bulur.
- ai-safety-layer | Güvenlik katmanı | Yapay zekâ | Sert sınırın modelden bağımsız uygulanması gerektiğini bilir.
- ai-human-oversight | İnsan denetimi | Yapay zekâ | İnsan döngüde ve güvenli varsayılan örüntülerini uygular.
- ai-risk-assess | Risk değerlendirme | Yapay zekâ | Geri alınabilirlik, etkilenen kişiler ve hata maliyetiyle otomasyon riskini değerlendirir.
- ai-portfolio | Portföy ve kanıt | Yapay zekâ | İddiasını sayı ve kanıtla destekleyen kısa portföy yazar.
- ai-honesty | Dürüst raporlama | Yapay zekâ | Gerçek hesap, simülasyon ve eksik kısımları açıkça ayırır.

## LESSON_SKILLS eşlemesi (ders anahtarı: modül-slug:hafta:ders)
- 'ai-muhendisligi:8:1': ['ai-hallucination', 'ai-verify', 'ai-eval-rate', 'prog-debug']
- 'ai-muhendisligi:8:2': ['ai-privacy', 'ai-attribution', 'ai-bias', 'ai-eval-rate', 'prog-debug']
- 'ai-muhendisligi:8:3': ['ai-rule-vs-model', 'ai-agent-script', 'ai-safety-layer', 'prog-debug']
- 'ai-muhendisligi:8:4': ['ai-human-oversight', 'ai-risk-assess', 'ai-safety-layer', 'ai-eval-rate', 'prog-debug']
- 'ai-muhendisligi:8:5': ['ai-portfolio', 'ai-honesty', 'ai-eval-rate']
