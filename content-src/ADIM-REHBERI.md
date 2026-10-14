# Etkileşimli ders (v2) yazar rehberi

Bir dersin `ek/NN.adimlar.json` dosyası varsa ders, Brilliant tarzı tam ekran oynatıcıda açılır
(`apps/web/src/components/lesson-v2`). Klasik görünüm (`?klasik=1`) anlatım, kavram kartları ve mini testle durur.
Örnek: `content-src/modul-3/h1/ek/01.adimlar.json`, `02.adimlar.json`.
Tip tanımı: `packages/db/src/content/types.ts` → `LessonStep`. Doğrulama: `tools/content/ek.mjs` → `validateSteps`.

## Akış ilkeleri

1. **Önce problem, sonra açıklama.** Ders bir merak kancasıyla açılır (`intro`), hemen ardından ya bir tahmin sorusu
   ya da kısa açıklama gelir. Uzun metin yok: `explain` en çok 3 kısa cümle.
2. **Her açıklamadan sonra etkileşim.** İki `explain` arka arkaya gelmez. Ders başına **8–15 adım**, en az **4 etkileşimli**
   (`choice`, `numeric`, `fill`, `order`, `widget`, `activity`).
3. **Aynı araç, değişen kısıt.** Bir widget'ı 2–3 adımda giderek zorlaşan hedeflerle tekrar kullan
   ("LED yansın" → "20 mA'yı geçmesin" → "8–10 mA arası").
4. **Sezgi önce, formül/kod sonra.** Önce elle/kaydırıcıyla dene, sonra formülü ya da kodu göster.
5. **Yanlış seçenekler kavram yanılgısını hedefler.** Rastgele yanlış yazma; öğrencilerin gerçekten yaptığı hataları kullan
   (büyük/küçük harf, `A0` ile `0`, setup/loop karışıklığı, birim çevirme).
6. **`why` her etkileşimli adımda zorunlu**: doğru cevaptan sonra "Neden?" ile açılır; 1–3 cümle, sonucu ve gerekçeyi verir.
   **`hint`** cevabı söylemez, düşünmeyi yönlendirir.
7. Dersin simülatör etkinliği varsa sondan bir önceki adım `activity` olur; son adım `reflect` (Konuşalım).
8. Metinlerde satır içi `kod`, **kalın** kullanılabilir. Başlık, liste, tablo kullanılmaz.
9. Yaşa göre dil: 5–8 yaş için cümleler çok kısa, sayı ve sembol az (sesli anlatım bu metinleri okur);
   12+ için teknik terim serbest ama ilk geçtiğinde açıklanır.
10. **Doğruluk:** her sayı, kod çıktısı ve cevap hesaplanarak kontrol edilir. Kod parçaları derlenebilir olmalı.

## Adım türleri

| kind | Zorunlu alanlar | Not |
|------|-----------------|-----|
| `intro` | `title`, `body` | `art`: `chip`, `led`, `bolt`, `robot`, `clock`, `traffic`, `brain`, `code`, `search`, `spark`, `wave`, `gear` ya da tek emoji |
| `explain` | `body` | `code`, `art` isteğe bağlı |
| `choice` | `prompt`, `options` (2–5), `answer` (0 tabanlı), `why` | `code`, `hint`, `skills` |
| `numeric` | `prompt`, `answer`, `why` | `tolerance` (mutlak), `unit`, `hint`, `skills` |
| `fill` | `prompt`, `code` (her boşluk `___`), `tokens`, `answer` (boşluk sayısı kadar), `why` | Her cevap `tokens` içinde olmalı; tuzak çip ekle |
| `order` | `prompt`, `lines` (3–8, **doğru sırada**, tekrarsız), `why` | Oynatıcı karıştırır |
| `widget` | `prompt`, `widget`, `goals`, `why` | Aşağıya bak |
| `activity` | `prompt` | Dersin laboratuvar/arena/atölye etkinliği gömülü açılır; hedefleri etkinliğin kendi hedefleridir |
| `reflect` | `prompt` | Doğru/yanlışı yok |

`skills`: `apps/web/src/lib/skills.ts` içindeki kimlikler (ör. `elec-ohm`, `digital-out`, `mk-coords`).

## Widget'lar

| type | Ayarlar | Metrikler (hedeflerde `metric`) |
|------|---------|------|
| `ohm` | `v` (0–9 V, 0,5 adım), `r` (10…10000 Ω standart değerler), `lockV`, `lockR`, `led` (varsayılan true; LED ileri gerilimi 2 V) | `V`, `R`, `I_mA`, `P_mW`, `ledOn` (0/1, ≥ 1 mA) |
| `blink` | `onMs`, `offMs` (100–2000 ms, 50 adım) | `onMs`, `offMs`, `periodMs`, `hz`, `duty` (%) |

Hedef: `{ "label": "Akım 8–10 mA arasında olsun", "metric": "I_mA", "min": 8, "max": 10 }` — uçlar dahil.
Başlangıç ayarı hedefi **zaten sağlamamalı** (öğrenci bir şey yapmalı).

## Elle yazılmış modüller (Modül 1, 2)

Adımlar `packages/db/src/content/extras/modul-N.ts` içinde ilgili dersin `steps` alanına yazılır (aynı `LessonStep` tipi).
Doğrulama testi tüm modüllerin adımlarını `validateSteps` ile denetler (`apps/web/src/lib/steps-content.test.ts`).

## Kontrol

```
node tools/content/build.mjs modul-3          # JSON → generated.ts (doğrulama dahil)
pnpm --filter web test -- steps                # adım içerik testleri
```
