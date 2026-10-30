# Kod örneklerinin İngilizcesi

Arayüz İngilizceyken kod örneklerinin **değişken/işlev adları ve yorumları** İngilizce görünür. Kaynak kod Türkçe kalır; çeviri sözlükle yapılır.

- `ids.json`: Türkçe tanımlayıcı → İngilizce (`sonYon` → `lastDir`). Eşleme birebirdir (iki ad aynı hedefe gitmez).
- `comments.json`: Türkçe yorum metni → İngilizce. Anahtar, yorum işaretsiz ve kırpılmış tam metindir.
- Mantık: `../code-i18n.ts` (çalışma zamanı, tarayıcı) ve `tools/content/code-i18n.mjs` (derleme betikleri; aynı algoritma, `code-dict.test.ts` eşliği doğrular).
- **String değerlere dokunulmaz** (`Serial.println("EN ACIK")` programın gerçek çıktısıdır). Yorum içindeki tırnaklı alıntılar da çevrilmez.
- **Çakışma güvenliği:** bir kod bloğunda iki ad aynı hedefe gidecekse ya da hedef zaten kodda varsa o blokta adlar korunur, yorumlar yine çevrilir.

## Nerede uygulanır
- Çalışma zamanı: arena ve laboratuvar editörlerinin başlangıç kodu, robotik proje başlangıç kodları, MuRoKo (`lib/mujoco/names-en.ts`).
- Derleme: İngilizce ders içeriği (`tools/content/en.mjs`, `ek.mjs` → `code-localize.mjs`). `content-src/**/en/*` dosyaları Türkçeyle **birebir aynı kod** içerir; çıktıdaki `contentEn`/`stepsEn` yerelleştirilir. Düzyazıdaki satır içi `kod` adları da aynı sözlükle eşlenir.
- **Hedef denetimleri** (`codeHas(/sonPlanUs/)`) kodun Türkçe (kanonik) hâline bakar: `canonicalCode` İngilizce adları geri çevirir.

## Yeni kod örneği eklerken
1. Kodu Türkçe yaz (yorumlar Türkçe).
2. `npx vitest run src/lib/code-dict src/lib/content-en.test.ts`: çevrilmemiş yorum ya da Türkçe harf varsa test söyler.
3. Eksik yorumu `comments.json`'a, eksik adı `ids.json`'a ekle (hedef ad Arduino/C++ API adı ve ayrılmış sözcük olmamalı).
4. Derleme kanıtı (arduino-cli gerekir): `CODE_I18N_COMPILE=1 npx vitest run src/lib/code-dict/compile-en.test.ts`.
5. Ders içeriği değiştiyse: `pnpm content:build` ve `pnpm --filter @ask/db build`.
