# Oyun çerçevesi (Blockly oyunları)

Sekiz oyun (`bulmaca`, `labirent`, `kus`, `kaplumbaga`, `film`, `muzik`, `golet-egitmeni`, `golet`) tek bir çerçeveyi paylaşır.
Çerçeve: seviye çubuğu, hedef/ipucu kutusu, Blockly çalışma alanı, çalıştır/sıfırla, blok sayacı, başarı penceresi,
"Kodu göster", ilerleme kaydı. **Oyun ajanı yalnız kendi `GameDef`'ini ve sahne bileşenini yazar.**

## Dosyalar

| Yol | İş |
|---|---|
| `lib/games/types.ts` | Sözleşme: `GameDef`, `LevelDef`, `GameBlockDef`, `GameRun`, `SceneProps` |
| `lib/games/program.ts` | Program modeli (Blockly JSON) ve kurucular: `b()`, `seq()`, `program()`, `varField()`, `countBlocks()` |
| `lib/games/interpreter.ts` | Güvenli adım adım yorumlayıcı: `runProgram`, `runProgramSync`, `HaltProgram` |
| `lib/games/codegen.ts` | "Kodu göster" için JavaScript üretici |
| `lib/games/toolbox.ts`, `builtin-blocks.ts` | Seviyeye göre araç kutusu, yerleşik blok bilgisi |
| `lib/games/progress.ts` | `localStorage` `ask:games:v1` ilerleme |
| `lib/games/testing.ts` | `assertLevelSolutions(game)` |
| `lib/games/meta.ts`, `registry.ts` | Oyun listesi (başlık/cümle) ve tembel yükleyiciler. **Hazır; dokunma.** |
| `lib/games/<slug>/index.ts` | **Senin dosyan:** `export const <slug>Game: GameDef` (şimdi `undefined` yer tutucu) |
| `components/games/<slug>/scene.tsx` | **Senin sahnen** (React, `export default`) |
| `lib/games/__fixtures__/deneme.ts` | Çalışan örnek oyun (kayıtta yok); kalıp için oku |

Değişken adları: `bulmacaGame, labirentGame, kusGame, kaplumbagaGame, filmGame, muzikGame, goletEgitmeniGame, goletGame`.
`index.ts` `GameDef` verince oyun kartı "Yakında"dan çıkar, `/oyunlar/<slug>` açılır. Kayıt dosyasını değiştirmen gerekmez.

## GameDef alanları

```ts
export const labirentGame: GameDef<MazeState> = {
  slug: 'labirent', title: 'Labirent', tagline: '…',      // title/tagline meta.ts ile uyumlu olsun
  levels,                      // LevelDef[10]
  blocks,                      // GameBlockDef[]: yalnız oyuna özgü bloklar
  engine: { createRun },       // oyun mantığı (saf, DOM yok)
  scene: () => import('@/components/games/labirent/scene'),   // React sahne (tembel)
  stepDelay: 450,              // eylem başına ms (hız kaydırıcısına bölünür)
  speed: { min: 0.5, max: 4, default: 1 },   // verirsen hız kaydırıcısı çıkar
  stageAspect: '1 / 1',        // sahne en-boy oranı
  maxSteps: 20000,
  toolboxFor: undefined,       // gerekirse özel Blockly araç kutusu JSON'u
}
```

### LevelDef
`id` (1..10), `intro` (Türkçe hedef), `hint?`, `maxBlocks?`, `toolbox: string[]` (blok türleri; özel + yerleşik),
`startBlocks?` (sabit başlangıç programı), `solution` (referans çözüm), `maxSteps?`, `data?` (harita, hedef…).

### Özel bloklar (`GameBlockDef`)
```ts
{ type: 'labirent_ileri', category: 'Hareket', colour: '#4c97ff',
  json: { message0: 'ileri git', previousStatement: null, nextStatement: null, tooltip: '…' },  // `type` YAZMA
  js: 'moveForward();' }                       // "Kodu göster" metni
{ type: 'labirent_yol_var', category: 'Sorgu', colour: '#ffab19',
  json: { message0: '%1 yol var', args0: [{ type: 'field_dropdown', name: 'DIR', options: [['önde','AHEAD'],['solda','LEFT']] }], output: 'Boolean' },
  js: (c) => `isPath('${c.field('DIR')}')` }   // string şablonda {ALAN} alan/giriş yerine geçer
```
- Tür adlarını **`<slug>_` ile önekle** (iki oyun aynı sayfada yüklenebilir; yerleşiklerle çakışma testle yakalanır).
- `hat: true`: başlık bloğu (araç kutusuna konmaz, sayılmaz). `free: true`: blok sınırına katılmaz.
- Yerleşik bloklar hazırdır (blok tanımı yazma): `controls_repeat_ext`, `controls_repeat`, `controls_whileUntil`, `controls_for`,
  `controls_if` (else/else-if), `controls_flow_statements`, `logic_*`, `math_arithmetic/number/modulo/single/round/random_int/number_property/change`,
  `variables_get/set`, `text`, `text_join`, `procedures_*` (temel). Araç kutusunda sadece tür adını yaz; sayı gölgeleri otomatik gelir.
  Başka bir yerleşik blok gerekirse `builtin-blocks.ts` + `interpreter.ts` + `codegen.ts`'e ekle (testle).

## Motor (`engine.createRun`)
```ts
createRun(level, { seed }): GameRun<S> => {
  const st = initialState(level.data)
  return {
    api: { hats: ['labirent_basla'], blocks: {
      labirent_ileri: () => { move(st); if (hitWall(st)) throw new HaltProgram('Duvara çarptın!') },
      labirent_yol_var: (c) => isPath(st, String(c.field('DIR'))),      // değer bloğu: değer döndür
    } },
    snapshot: () => structuredClone(st),            // sahne için değişmez kopya (ilk çerçeve de budur)
    evaluate: (result) => st.atGoal && result.reason === 'finished' ? { ok: true } : { ok: false, message: '…' },
  }
}
```
- **İşleyici**: `(c: BlockCtx) => …`. Alan `c.field('ALAN')`, değer girişi `c.value('G')` / `c.num('G')` / `c.bool('G')`,
  deyim girişi (kendi C-bloğun) `yield* c.statements('DO')` (işleyiciyi `function*` yap), rastgele `c.random()`/`c.randomInt(a,b)` (tohumlu).
- **Deyim bloğu** her çalıştığında bir adım olur: vurgulanır, ardından `snapshot()` alınıp sahne güncellenir ve `stepDelay` beklenir.
  **Değer blokları** adım üretmez ve eşzamanlı olmalıdır.
- **Kontrollü durdurma:** çarpma, hedefe varma gibi durumlarda `throw new HaltProgram(mesaj)`. Hata sayılmaz; `evaluate` karar verir.
- **`hats`**: verirsen yalnız bu başlık türüyle başlayan yığınlar çalışır (başlığın altındakiler). Vermezsen tüm yığınlar yukarıdan aşağıya çalışır
  (bağlı olmayan "serseri" bloklar da çalışır; çoğu oyunda `hats` ile engelle).
- Sonsuz döngü: her deyim ve her döngü turu bir adımdır; `maxSteps` (varsayılan 20000) aşılınca `reason: 'limit'` ve çocuk dostu uyarı.
- `eval`/`Function` yoktur; program JSON'u yorumlanır.
- Süreli ya da çok aşamalı oyunlarda (Gölet gibi) tüm benzetimi `createRun` içinde yürütüp `snapshot()`'ı kare kare döndürebilirsin;
  ya da `evaluate` içinde hesaplayıp `stepDelay?(info)` ile hız ayarlarsın.

## Sahne bileşeni
`components/games/<slug>/scene.tsx`, `'use client'`, `export default function Scene({ level, frame, running, speed, outcome }: SceneProps<S>)`.
`frame` = en son `snapshot()`. Saf SVG/CSS çiz; kutu `stageAspect` oranlı ve genişliği doldurur (`width:100%;height:100%`).
Animasyon sürelerini `speed`'e böl. Ses gerekirse WebAudio (kullanıcı tıklamasından sonra). Renkler için kabuk değişkenlerini
(`var(--surface)` vb.) kullan ya da sahneye sabit renk ver.

## Test
```ts
// lib/games/labirent/labirent.test.ts
import { assertLevelSolutions } from '../testing'
import { labirentGame } from './index'
assertLevelSolutions(labirentGame!)
```
Her seviye için doğrulanır: kimlikler 1..10, çözüm **hedefi sağlar**, **boş program sağlamaz** (ve `startBlocks` tek başına sağlamaz),
blok sınırı aşılmaz, çözümde yalnız araç kutusundaki (ve başlık/free) bloklar var, JavaScript karşılığı üretilir.
Ek oyun testlerini `solveLevel(game, level, program)` ile yaz (yanlış program başarısız olmalı, vb.).
Çözümleri `program(seq(b(...), …))` ile kur: `b('controls_repeat_ext', {}, { TIMES: 4, DO: seq(…) })`; sayı/metin girişleri otomatik gölge blok olur.
Çalıştır: `cd apps/web && npx tsc --noEmit && pnpm vitest run`.

## Seviye çerçevesi (arayüz)
`/oyunlar` kart listesi, `/oyunlar/<slug>?seviye=N`. Blok sınırı çerçevenin sayacıyla uygulanır: sınır aşılırsa Çalıştır engellenir
(sayı/metin gölge blokları ve `hat`/`free` bloklar sayılmaz). Yarım kalan program seviye başına `ask:games:programs:v1` altında saklanır.
Başarıda `ask:games:v1` güncellenir (`done`, `best[seviye]` = en az blok).

## Lisans
Kod ve görselleri Blockly Games'ten KOPYALAMA. Sayfa alt bilgisinde atıf çerçeve tarafından eklenir; kök `NOTICE` dosyasına bak.
