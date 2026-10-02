# Sahne Atölyesi — Modül 2 (8-12 yaş) blok editörü, motoru ve etkinlik altyapısı

Modül 2 "Scratch ile Kendi Oyununu Yap" (`slug: 'scratch'`, 16 ders) için bu projeye özgü, **tamamen sanal** bir sahne editörü:
480x360 sahne, sprite listesi, vektör/bitmap kostüm editörü, sentezlenmiş sesler, Türkçe blok seti (Blockly zelos), işbirlikçi (kooperatif) çalıştırıcı,
ders etkinliği altyapısı ve 16 etkinlik. Arayüzde başka bir ürünün adı/markası geçmez; editör adı **Sahne Atölyesi**.
Hiçbir yerde `eval` / `Function` yoktur; Blockly'nin JSON programı doğrudan dolaşılır.

## Dosya haritası

| Yol | Görev |
|---|---|
| `types.ts` | Ortak türler: proje, sprite, kostüm (`Shape`), ses, değişken; sabitler (`STAGE_W/H`, `FPS`) |
| `blocks.ts` | **Blok kataloğu** (saf veri): kategoriler, 120 blok, Blockly JSON üretimi, araç kutusu, `allow()` kısaltması |
| `blockly-defs.ts` | Blockly'ye yükleme: dinamik açılır listeler (`setOptionProviders`), kendi blok tanımları, Değişkenler/Bloklarım özel listeleri, tema |
| `engine.ts` | Dünya durumu ve ilkel işlemler (hareket, görünüm, ses, kalem, klon, değişken, liste, çit, sek). Saf TS, DOM yok |
| `interp.ts` | Yorumlayıcı: iş parçacıkları (generator), başlıklar, yayın, klonlar, "bir blok yap" çağrıları, adım/kare sınırları |
| `session.ts` | `SahneSession`: proje + motor + yorumlayıcı; testler ve hedef denetimi bunu kullanır |
| `geometry.ts` | Kostüm sınırı, döndürülmüş dörtgen, çarpışma (SAT), nokta, çit; şekil vuruş testi / taşıma / çevirme |
| `bitmap.ts` | Boya kovası (doldur) ve renk ayrıştırma (bitmap kipi) |
| `sounds.ts` | 22 hazır ses (notalar, efektler, oyun, hayvanlar) — WebAudio ile sentezlenir; efektler; `SahneAudio` çalıcısı |
| `render.ts` | Tuval çizicisi (yalnız tarayıcı): kostüm rasterleme, sahne, kalem katmanı, konuşma balonları, değişken/liste ekranları |
| `gallery/` | `characters.ts` (22 karakter), `backdrops.ts` (9 arka plan), `draw.ts` (çizim kurucuları). Hepsi bu projede çizildi |
| `project.ts` | Proje kurucuları, doğrulama (içe aktarma), `localStorage`, dışa aktarma, yardımcılar |
| `dsl.ts`, `kit.ts` | Kodla blok programı / proje yazma (etkinlikler, örnekler, testler) |
| `activity.ts` | `SahneActivity`, hedef türleri, senaryo çalıştırıcı, `evaluateGoals` |
| `activities/` | 16 etkinlik (`h1-h2.ts` … `h7-h8.ts`), `index.ts` (kayıt), `ortak.ts` |
| `../../components/sahne/` | React: `SahneEditor`, sahne, sprite paneli, blok alanı, kostüm editörü, sesler, galeriler, hedef kartı |
| `../../app/sahne-atolyesi/page.tsx` | Serbest atölye sayfası |

## Bağlantı noktaları

```tsx
import { SahneEditor } from '@/components/sahne/sahne-editor'
import { getSahneActivity } from '@/lib/sahne/activities'

// ders oynatıcıda (activityKey = 'scratch:<hafta>:<ders>', 1 tabanlı)
const sahne = getSahneActivity(p.activityKey)            // SahneActivity | null
{sahne && (
  <SahneEditor key={p.lesson.id} activity={sahne} storageKey={`ask:sahne:ders:${p.activityKey}`}
               onGoalsChange={(_results, all) => { if (all) onGoals() }} />
)}
// serbest atölye: <SahneEditor storageKey="ask:sahne:project:v1" />   (sayfa: /sahne-atolyesi)
```

`SahneEditor` props: `activity?`, `storageKey`, `onGoalsChange?(results, allPassed)`. `allPassed` yalnız **zorunlu** hedeflere bakar
(`optional: true` olanlar bonustur). Kayıt anahtarı proje başına `localStorage`'dır; ders kipinde de çalışma kaydedilir.
Etkinlik anahtarları: `SAHNE_ACTIVITIES` (`scratch:1:1` … `scratch:8:2`), modül slug'ı `SAHNE_MODULE_SLUG = 'scratch'`.

## Sahne, koordinatlar, zaman

- Sahne **480x360** mantıksal birim; merkez (0,0), x sağa, **y yukarı** artar. Yön: derece, `0` yukarı, `90` sağ (varsayılan), `180` aşağı, `-90` sol.
- Zaman **sanaldır**: 30 kare/sn; `bekle 0,2` = 6 kare. Testler gerçek zamandan bağımsız ve tekrarlanabilirdir (rastgelelik tohumludur).
- Sprite sahneden tamamen çıkamaz (en az ~15 birimi görünür kalır). "Kenara değince sek" ve "kenara değiyor mu" sahne kenarına göre çalışır.
- **Değme** (sprite–sprite, fare, kenar), kostümün içerik sınır kutusu üzerinden, dönme ve boyut hesaba katılarak (SAT) yapılır. Piksel hassasiyeti yoktur.

## Kooperatif çalıştırıcı

Her betik bir generator'dır; kare başına bir kez ilerler. Bir betik karede şunlarla durur: `bekle`, `…saniyede kay`, `…söyle … saniye`, `ses … bitene dek`,
`mesajı yayınla ve bekle`, `sor ve bekle`, `olana dek bekle/tekrarla` ve **bir döngü turunun sonunda (o kare görsel bir şey değiştiyse)**. Görsel değişiklik yoksa
döngü aynı karede dönmeye devam eder (yalnız değişken/liste işleyen döngüler tek karede biter).

| Sınır | Değer |
|---|---|
| İş parçacığı başına adım bütçesi (aşılınca o kareyi bırakır) | 3 000 |
| Kare başına toplam adım | 300 000 |
| Gerçek zaman bütçesi (tarayıcıda, kare başına) | 14 ms |
| "Bir blok yap" iç içe çağrı derinliği | 120 (aşılınca açıklamalı hata) |
| Klon | 300 · Sprite 40 · Kostüm 60 · Liste öğesi 20 000 · Metin 10 000 karakter |

Sonsuz döngü tarayıcıyı dondurmaz (boş `sonsuza kadar` her karede yalnız bütçesini harcar). Hata olursa çalıştırma durur ve **hangi blokta** olduğu söylenir
(`engine.error.blockId` → editörde "Bloğu göster").

Tuş başlıkları ("… tuşuna basılınca") tuş **olaylarıyla** (basma + işletim sisteminin tekrar olayları) başlar; basılı tutmak tek başına başlatmaz.
Sürekli hareket için derslerdeki gibi `sonsuza kadar` + `… tuşuna basılı mı?` kullanılır.

## Blok seti (Türkçe, özgün)

Şekiller: başlık (kubbeli), yığın, kapak, **C**, **iki ağızlı C** (`eğer/değilse`), **yuvarlak değer**, **altıgen koşul**.

| Kategori | Bloklar |
|---|---|
| Hareket | adım git, sağa/sola dön, x y'ye git, … konumuna git (rastgele/fare/sprite), kay, … yönüne dön, x/y değiştir/yap, kenara değince sek, dönme biçimi · x, y, yön |
| Görünüm | söyle / düşün (süreli), kostümü yap, sonraki kostüm, arka planı yap, sonraki arka plan, boyut, efekt (renk, hayalet, parlaklık), göster/gizle, katman · kostüm no/ad, arka plan no/ad, boyut |
| Ses | sesi çal / bitene dek çal, tüm sesleri durdur, **nota çal** (do…sol, vuruş), perde, ses seviyesi |
| Olaylar | 🏁 tıklanınca, tuşuna basılınca, sprite tıklanınca, arka plan … olunca, zamanlayıcı > …, mesajı alınca · mesajı yayınla (+ bekle) |
| Kontrol | bekle, tekrarla, sonsuza kadar, eğer, eğer/değilse, olana dek bekle/tekrarla, dur (hepsi/bu betik/diğerleri), klon olarak başlayınca, klonunu oluştur, bu klonu sil |
| Algılama | değiyor mu?, uzaklığı, sor ve bekle · cevap, tuşa basılı mı?, fare basılı mı?, fare x/y, zamanlayıcı, … / sprite, şu anki … |
| İşlemler | + − × ÷, rastgele, > < =, ve/veya/değil, birleştir, harf, uzunluk, içinde var mı?, kalan, yuvarla, mutlak/karekök/sin/cos… |
| Değişkenler | değişken oluştur, = yap, değiştir, göster/gizle · **liste**: ekle, sil, ekle (sıraya), değiştir, öğe, sıra, uzunluk, var mı?, göster/gizle |
| Bloklarım | **Bir blok yap** (ad + girdiler), çağrı blokları, girdi blokları |
| Kalem | kalemi indir/kaldır, temizle, damga, renk, kalınlık |

Blok kataloğu tek yerdedir (`blocks.ts`); Blockly tanımı, araç kutusu, DSL ve yorumlayıcı aynı `type` adlarını kullanır (`sh_…`).
Değişkenler **tüm sprite'lar için** ortaktır (kimlik `v:<ad>`); sprite'a özel değişken ve liste yoktur. Mesaj, kostüm, ses açılır listeleri projeden beslenir
(`setOptionProviders`); sprite başvuruları ad değil **kimlik** tutar (adı değiştirince bloklar bozulmaz). Kostüm/ses adı değişince bloklardaki başvuru otomatik güncellenir.

## Proje biçimi (`SahneProject`, sürüm 1)

```ts
{ version: 1, name, notes,                       // notes: plan / "nasıl oynanır"
  stage:   { backdrops: Costume[], backdrop, sounds, procs, blocks },
  sprites: [{ id, name, costumes, costume, sounds, x, y, dir, size, visible, rotationStyle, procs, blocks }],   // arkadan öne
  variables: [{ id, name, type: ''|'List', value, items, visible }],                                            // başlangıç içerikleri
  messages: string[] }
Costume = { id, name, w, h, shapes: Shape[], bitmap?: 'data:image/png;base64,…' }   // vektör + isteğe bağlı bitmap katmanı
Shape   = rect | ellipse | poly | path
```

Kayıt: `localStorage['ask:sahne:project:v1']` (serbest atölye). İçe/dışa aktarma: `.sahne.json` (`exportProject` / `parseProject`, 3 MB sınırı, **doğrulamalı**:
bilinmeyen blok türleri ayıklanır, sayılar sınırlanır, bitmap yalnız `data:image/png;base64` kabul edilir).
Çalışma durumu (konum, değişken değeri) kaydedilmez; proje her zaman **başlangıç durumunu** tutar. Editörde ↺ ile oturum projeden yeniden kurulur.

## Kostüm editörü

- **Vektör kipi** (varsayılan): fırça, çizgi, dikdörtgen, daire, **doldur** (şeklin rengini değiştirir), **silgi** (dokunduğu şekilleri siler), seç/taşı, öne/arkaya, kopyala, yatay/dikey çevir, geri al/yinele, dolgu/çizgi rengi, kalınlık.
- **Bitmap kipi**: "Bitmap'e çevir" çizimi piksellere çevirir; fırça/silgi piksel boyar (silgi saydamlaştırır), doldur boya kovasıdır. Bitmap yüzünden sonra çizilen vektör şekiller üstte kalır.
- Hazır galeri: 22 karakter (çoğu 2 kostümlü: yürüyüş/hareket verir) ve 9 arka plan. Sprite ya da sahne için "Çiz" boş kostüm açar.

## Ses

Hazır sesler `ToneStep` listeleridir (frekans, süre, dalga türü); çalma `SahneAudio` ile. Her ses sprite'a eklenir; efektler (hızlı, yavaş, yüksek, alçak, daha sessiz, ters)
`SoundRef` alanlarına yazılır. **Kayıt yoktur.** "Bitene dek çal" sanal süre kadar bekler (test edilebilir).

## Etkinlik yazımı

```ts
export const A_5_1: SahneActivity = {
  id: 'scratch:5:1', title: '…', intro: '…',
  allowedBlocks: allow('sh_when_flag', 'hareket', 'sh_forever', 'sh_if'),   // tür adı ya da grup adı (hareket, gorunum, ses, olaylar, kontrol, algilama, islemler, degiskenler, bloklarim, kalem)
  starter: () => makeProject('Yakalama oyunu', [{ id: 'sepet', char: 'sepet', blocks: [...] }], { backdrops: ['gokyuzu'] }),
  scenario: [{ do: 'seconds', s: 1.5 }, { do: 'checkpoint', name: 'dusme' }, { do: 'key', key: 'right', frames: 15 }],
  goals: [{ id: 'sag', label: '…', hint: '…', kind: 'prop', sprite: 'sepet', prop: 'x', op: 'gt', value: 5, at: 'sag' }],
  solution: () => makeProject(...),   // yalnız izinli blokları kullanmalı
}
```

Hedefler **bildirimseldir** ve başsız çalıştırılan **senaryonun** sonunda denetlenir (öğrencinin programı gerçekten çalışır). Senaryo her zaman 🏁 ile başlar.
Senaryo adımları: `flag, wait, seconds, key, down, up, click, mouse, place, collide, setVar, answer, autoAnswer, checkpoint, hatKeys, stop`.
Hedef türleri — **statik** (programa bakar): `usesBlocks, distinctBlocks, sprites, costumes, backdrops, scripted, hats, defined, procs, notes, named`;
**dinamik** (senaryoyu çalıştırır): `prop, moved, var, event, dialogue, clonesPeak, spread, noError`; ve kodla yazılan `custom`.
`optional: true` hedefler bonustur (kartta "isteğe bağlı"). Hedefler editörde **yüzen öğretici kartında** adım adım gösterilir (adım noktaları, küçült/kapat, otomatik ilerleme).

**Genel test** (`activities.test.ts`, her etkinlik için): başlangıç projesi zorunlu hedefleri **sağlamaz**; çözüm tüm (zorunlu + isteğe bağlı) hedefleri sağlar; çözüm yalnız
izinli blokları kullanır; başlangıç ve çözüm Blockly'de (başsız) yüklenir, JSON gidiş-dönüşü korunur.

## Testler

`cd apps/web && npx tsc --noEmit && pnpm vitest run src/lib/sahne` — motor/yorumlayıcı (`engine.test.ts`), Blockly entegrasyonu (`blockly-defs.test.ts`),
etkinlikler (`activities.test.ts`), geometri, proje doğrulama/galeriler/sesler (`geometry.test.ts`, `project.test.ts`), boya kovası (`bitmap.test.ts`).
Tarayıcı kısmı (`render.ts`, bileşenler) gerçek Chrome ile elle/ekran görüntüsüyle doğrulanır.

## Bilinen sınırlar

- **Palet** kategori başına bir akış listesidir (tek uzun kaydırılan liste değil). Üstte sekme (Kod/Kostümler/Sesler), solda kategori sütunu vardır.
- Sprite'a özel (yerel) değişken yok; yalnız "tüm sprite'lar için". Listeler sahnede gösterilir ama sahnede doğrudan düzenlenmez (üstteki **Değişkenler** penceresinden düzenlenir).
- Klonlar kendi değişken kopyasına sahip değildir (ortak değişkenler); klon sürüklenemez.
- Renk algılama ("renge değiyor mu"), mikrofon/ses şiddeti, kamera, video, kayıt, dışarıdan resim/ses yükleme yoktur (tamamen sanal ve kapalı). Çevrimiçi paylaşım yok: yalnız `.sahne.json`.
- Değme dörtgen tabanlıdır (kostümün içerik kutusu); ince çubuklarda ve dairelerde köşe payı vardır.
- Safari'de `ctx.filter` olmadığından renk/parlaklık efekti sahnede görünmeyebilir (hayalet efekti her yerde çalışır).
- Çalışırken blokları değiştirmek yeni hali ancak 🏁 ile uygulanır ("Programı değiştirdin" uyarısı çıkar).
- Gerçek zamanlı hedef denetimi ağır senaryolarda (6. hafta) ~0,1-0,3 sn sürer; düzenleme durunca (700 ms sonra) çalışır.
