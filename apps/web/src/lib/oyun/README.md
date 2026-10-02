# Oyun Atölyesi — motor, blok seti ve etkinlik altyapısı

160×120 piksellik, tarayıcıda çalışan basit 2B oyun motoru + Türkçe Blockly blok seti + piksel resim/harita editörü.
Tamamen bu projeye özgü kodla yazılmıştır (dış oyun editörü kodu, adı, görseli yok). Hiçbir yerde `eval`/`Function` yoktur.

## Dosya haritası

| Yol | Görev |
|---|---|
| `engine.ts` | Oyun motoru (sprite, fizik, harita, olaylar, efektler). Saf TS, DOM yok |
| `interp.ts` | Güvenli blok yorumlayıcı (`Runner`): adım/süre sınırlı |
| `session.ts` | `OyunSession`: proje + motor + yorumlayıcı; testler ve etkinlik denetimi bunu kullanır |
| `render.ts` | Motoru 160×120 RGBA arabelleğine çizer (`renderFrame`) |
| `blocks.ts` | Blok kataloğu (Blockly JSON, araç kutusu, JS şablonları) — saf veri |
| `blockly-defs.ts`, `messages.ts` | Blockly'ye blok/tema/Türkçe ileti yükleme |
| `codegen.ts` | "JavaScript" sekmesi: bloklardan salt okunur JS metni |
| `dsl.ts` | Kodla blok programı yazma (örnekler, çözümler, testler) |
| `project.ts` | Proje modeli, doğrulama, içe/dışa aktarma, localStorage |
| `activity.ts`, `activities/` | Ders etkinliği altyapısı + 6 örnek etkinlik |
| `samples/` | 8 örnek oyun |
| `assets/` | 60 elle çizilmiş ASCII piksel resim (`GALLERY`) |
| `palette.ts`, `pixels.ts`, `font.ts`, `sound.ts` | 16 renk paleti, piksel işlemleri, 3×5 yazı tipi, WebAudio sentezi |
| `../../components/oyun/` | React: `OyunEditor`, sahne, blok alanı, piksel editörü, harita editörü |

## Motor kavramları

- **Ekran** 160×120 px; zaman sabit adımlı: `tick()` = 1/60 sn. Hızlar piksel/sn, ivme piksel/sn².
- **Sprite**: merkez konumu (x,y), hız (vx,vy), ivme, `tür` (oyuncu, dusman, yiyecek, mermi, nesne, bonus, engel, hedef), resim, ömür (ms), katman, `özellikler` (ad→değer), konuşma balonu.
  Çarpışma kutusu resmin **saydam olmayan piksellerinin** sınır kutusudur.
- **Ayarlar** (`sprite_bayrak`): `autoDestroy` dünyadan (harita yoksa ekrandan) tamamen çıkınca sil — dışarıdan gelen sprite önce içeri girmelidir;
  `stay` dünya sınırında kal; `bounce` duvara/kenara çarpınca hızı ters çevir; `ghost` duvar karolarından geç; `hidden` gizli.
- **Karo haritası**: 16×16 karolar; duvar karoları sprite'ı durdurur; `touch` (alt/üst/sol/sağ) duvara değiyor mu; kamera hedef sprite'ı izler (harita ekrandan büyükse).
- **Olaylar** (kenar tetiklemeli, yani üst üste gelince **bir kez**): başlangıç, her kare, her N ms, düğme basılınca/bırakılınca, sprite çarpışınca, karoya dokununca, sprite oluşunca/silinince, can bitince, süre bitince.
  Sıra her karede: düğme olayları → her kare → zamanlayıcılar → fizik → çarpışmalar → karo dokunmaları → ömürler → geri sayım → kamera → efektler.
- **Oyun durumu**: skor, can (varsayılan 3; 0 olunca "can bitince" ya da otomatik kaybetme), geri sayım (bitince "süre bitince" ya da otomatik kaybetme), `oyun_bitir`; duraklat/devam; oyun bitti ekranı (A ile tekrar).
- **Denetleyici**: ok tuşları/WASD = yön, A = Boşluk/Z, B = X/Enter/Shift; ekranda dokunmatik tuşlar da aynı.
- **Efektler**: ekran sarsıntısı, konuşma balonu, mesaj, patlama (parçacık). **Ses**: bip, nota, 8 hazır melodi (kendi sentezimiz).
- **Yön**: derece, 0 = yukarı, 90 = sağ, 180 = aşağı, 270 = sol.
- **Güvenlik**: çağrı başına 60 000 adım, kare başına 300 000 adım, çağrı başına 400 ms; olay içinde olay en çok 12 derinlik; en çok 500 sprite; fonksiyon derinliği 40. Aşılırsa oyun durur ve **hangi blokta** olduğu söylenir (`engine.error.blockId`).

### Motor API'si (başsız kullanım)

```ts
import { OyunSession } from '@/lib/oyun/session'
const s = new OyunSession(project, { seed: 1 })   // project: OyunProject
s.start()                  // "oyun başlayınca" olayları
s.tick(60)                 // 1 sn ilerlet;   s.seconds(2)
s.press('right'); s.hold('a', 10); s.tap('b'); s.release('right')
s.engine.sprites; s.first('oyuncu'); s.engine.score; s.engine.life; s.engine.state  // 'running' | 'over'
s.error                    // { message, blockId } ya da null
s.play(600, (s, f) => { /* her karede basit bir bot */ })
```

`OyunEngine` doğrudan da kullanılabilir (`createSprite`, `loadMap`, `setTile`, `setScore`, `setLife`, `gameOver`, `shake`, `burst`, `say`, `press/release`, `snapshot()`).
Çizim: `renderFrame(engine, buf)` → 160×120×4 bayt.

## Proje biçimi (`OyunProject`, sürüm 1)

```ts
{ version: 1, name, bg /*0-15*/,
  blocks: { blocks: { languageVersion: 0, blocks: [...] }, variables: [...] },   // Blockly serialization
  images: { [id]: { name?, rows: string[] } },     // '0-9a-f' palet, '.' saydam; id: küçük harf/rakam/tire
  tileset: [{ image, wall }],                      // en çok 35 karo; hücre karakteri sıraya göre '1'..'9','a'..'z'
  maps: [{ name, cols, rows, cells: string[] }] }  // '.' boş
```
Kayıt: `localStorage['ask:oyun:project:v1']`. İçe/dışa aktarma: `.oyun.json` (`exportProject` / `parseProject`, 2 MB sınırı, doğrulamalı).
Engine, projede olmayan bir resim kimliğini **galeriden** çözer; `withGalleryImages(p)` kullanılan galeri resimlerini projeye kopyalar.

## Palet (16 renk)

`0` gece · `1` kahve · `2` kırmızı · `3` turuncu · `4` sarı · `5` açık yeşil · `6` yeşil · `7` mor · `8` lacivert · `9` mavi · `a` gök · `b` pembe · `c` beyaz · `d` açık gri · `e` gri · `f` koyu gri · `.` saydam.

## Blok listesi

Bloklar Blockly (zelos) ile çizilir. Sprite alanı boş bırakılırsa **"bu sprite"** sayılır (olayın sprite'ı; olay dışında en son oluşturulan). Resim ve harita seçimleri
`oyun_resim` / `oyun_harita` gölge bloklarıdır (açılır listede küçük resim görünür). Aşağıdaki "JavaScript karşılığı" **gösterim içindir**: JavaScript sekmesi salt okunurdur,
oyun doğrudan bloklardan çalışır. Çıkan kodda alan değerleri blok kimlikleriyle yazılır (`"up"`, `"a"`, `"win"`, `"stay"`, `"col"` …).

#### Sprite (`sprite`)

| Tür | Blok | Biçim | JavaScript karşılığı |
|---|---|---|---|
| `sprite_yeni` | yeni ‹IMG› sprite'ı, türü ‹K› | değer | `sprite.yeni({IMG}, {K})` |
| `oyun_bu_sprite` | bu sprite | değer | `bu` |
| `oyun_diger_sprite` | diğer sprite | değer | `diger` |
| `sprite_konum` | ‹S› konumu x ‹X› y ‹Y› | eylem | `{S}.konum({X}, {Y})` |
| `sprite_resim` | ‹S› resmi ‹IMG› | eylem | `{S}.resim({IMG})` |
| `sprite_sil` | ‹S› sprite'ını sil | eylem | `{S}.sil()` |
| `sprite_patlat` | ‹S› patlayıp yok olsun | eylem | `{S}.patlat()` |
| `sprite_omur` | ‹S› ‹N› ms sonra yok olsun | eylem | `{S}.omur = {N}` |
| `sprite_bayrak` | ‹S› ‹F›: ‹ON› | eylem | `{S}.ayar({F}, {ON})` |
| `sprite_bak` | ‹S› ‹D› baksın | eylem | `{S}.bak({D})` |
| `sprite_katman` | ‹S› katmanı ‹N› | eylem | `{S}.katman = {N}` |
| `sprite_konus` | ‹S› ‹T› desin, ‹N› saniye | eylem | `{S}.konus({T}, {N})` |
| `sprite_takip` | ‹S›, ‹O› sprite'ını ‹N› hızıyla takip etsin | eylem | `{S}.takipEt({O}, {N})` |
| `sprite_takip_birak` | ‹S› takibi bıraksın | eylem | `{S}.takibiBirak()` |
| `sprite_ozellik_ayarla` | ‹S› için ‹NAME› özelliği = ‹V› | eylem | `{S}.ozellik({NAME}, {V})` |
| `sprite_ozellik` | ‹S› için ‹NAME› özelliği | değer | `{S}.ozellik({NAME})` |
| `sprite_oku` | ‹S› ‹P› | değer | `{S}.{P}` |
| `sprite_cakisiyor` | ‹A› ile ‹B› çakışıyor mu? | değer | `{A}.cakisiyorMu({B})` |
| `sprite_dokunuyor` | ‹S› ‹D› dokunuyor mu? | değer | `{S}.dokunuyorMu({D})` |
| `sprite_mesafe` | ‹A› ile ‹B› arası mesafe | değer | `{A}.mesafe({B})` |
| `sprite_sayisi` | ‹K› sprite sayısı | değer | `sprite.say({K})` |
| `sprite_hepsini_sil` | tüm ‹K› sprite'larını sil | eylem | `sprite.hepsiniSil({K})` |
| `sprite_her_biri` | her ‹K› sprite'ı için | kapsayıcı | `for (const bu of sprite.hepsi({K})) {` |
| `sprite_carpisinca` | bir ‹KA› sprite'ı bir ‹KB› sprite'ına çarpınca | olay | `sprite.carpisinca({KA}, {KB}, (bu, diger) => {` |
| `sprite_olusunca` | bir ‹K› sprite'ı oluşunca | olay | `sprite.olusunca({K}, (bu) => {` |
| `sprite_silinince` | bir ‹K› sprite'ı silinince | olay | `sprite.silinince({K}, (bu) => {` |

#### Hareket (`hareket`)

| Tür | Blok | Biçim | JavaScript karşılığı |
|---|---|---|---|
| `hareket_hiz` | ‹S› hızı x ‹VX› y ‹VY› | eylem | `{S}.hiz({VX}, {VY})` |
| `hareket_ivme` | ‹S› ivmesi x ‹AX› y ‹AY› | eylem | `{S}.ivme({AX}, {AY})` |
| `hareket_yone` | ‹S› ‹D› derece yönünde ‹N› hızla gitsin | eylem | `{S}.yonHiz({D}, {N})` |
| `hareket_dur` | ‹S› dursun | eylem | `{S}.dur()` |
| `hareket_ters` | ‹S› ‹A› hızını ters çevir | eylem | `{S}.tersCevir({A})` |
| `hareket_kaydir` | ‹S› x ‹DX› y ‹DY› kadar kaydır | eylem | `{S}.kaydir({DX}, {DY})` |

#### Denetleyici (`denetleyici`)

| Tür | Blok | Biçim | JavaScript karşılığı |
|---|---|---|---|
| `den_dugme` | ‹B› düğmesine ‹E› | olay | `denetleyici.dugme({B}, {E}, () => {` |
| `den_basili` | ‹B› düğmesi basılı mı? | değer | `denetleyici.basiliMi({B})` |
| `den_yon` | ‹A› yön | değer | `denetleyici.yon({A})` |
| `den_hareket` | ‹S› oyuncu tuşlarıyla ‹M› hareket etsin, hız ‹N› | eylem | `{S}.tuslaHareket({M}, {N})` |
| `den_hareket_birak` | ‹S› tuşlarla hareket etmesin | eylem | `{S}.tuslaHareketiBirak()` |

#### Oyun (`oyun`)

| Tür | Blok | Biçim | JavaScript karşılığı |
|---|---|---|---|
| `oyun_baslangic` | oyun başlayınca | olay | `oyun.baslayinca(() => {` |
| `oyun_her_kare` | her karede | olay | `oyun.herKarede(() => {` |
| `oyun_her_n_ms` | her ‹MS› ms'de bir | olay | `oyun.herMs({MS}, () => {` |
| `oyun_can_bitince` | can bitince | olay | `oyun.canBitince(() => {` |
| `oyun_sure_bitince` | süre bitince | olay | `oyun.sureBitince(() => {` |
| `oyun_skor_ayarla` | skoru ‹N› yap | eylem | `oyun.skor = {N}` |
| `oyun_skor_degistir` | skoru ‹N› değiştir | eylem | `oyun.skor += {N}` |
| `oyun_skor` | skor | değer | `oyun.skor` |
| `oyun_can_ayarla` | canı ‹N› yap | eylem | `oyun.can = {N}` |
| `oyun_can_degistir` | canı ‹N› değiştir | eylem | `oyun.can += {N}` |
| `oyun_can` | can | değer | `oyun.can` |
| `oyun_sure_baslat` | geri sayımı ‹N› saniyeden başlat | eylem | `oyun.geriSayim({N})` |
| `oyun_sure` | kalan süre (sn) | değer | `oyun.kalanSure` |
| `oyun_zaman` | geçen süre (sn) | değer | `oyun.gecenSure` |
| `oyun_bitir` | oyunu bitir: ‹R› | eylem | `oyun.bitir({R})` |
| `oyun_mesaj` | ekranda ‹T› yaz, ‹N› saniye | eylem | `oyun.mesaj({T}, {N})` |
| `oyun_sarsinti` | ekranı ‹N› ms salla | eylem | `oyun.sars({N})` |
| `oyun_patlama` | x ‹X› y ‹Y› noktasında ‹C› patlama | eylem | `oyun.patlama({X}, {Y}, {C})` |

#### Sahne / Harita (`sahne`)

| Tür | Blok | Biçim | JavaScript karşılığı |
|---|---|---|---|
| `sahne_renk` | arka plan rengi ‹C› | eylem | `sahne.renk({C})` |
| `sahne_dosemesi` | arka planı ‹IMG› resmiyle döşe | eylem | `sahne.dose({IMG})` |
| `harita_yukle` | haritayı yükle: ‹M› | eylem | `harita.yukle({M})` |
| `harita_karo_koy` | sütun ‹C› satır ‹R› karosunu ‹IMG› yap | eylem | `harita.karoKoy({C}, {R}, {IMG})` |
| `harita_karo_sil` | sütun ‹C› satır ‹R› karosunu boşalt | eylem | `harita.karoSil({C}, {R})` |
| `harita_karo` | sütun ‹C› satır ‹R› karosunun resmi | değer | `harita.karo({C}, {R})` |
| `harita_duvar_mu` | sütun ‹C› satır ‹R› duvar mı? | değer | `harita.duvarMi({C}, {R})` |
| `harita_duvar` | ‹IMG› karoları duvar olsun: ‹ON› | eylem | `harita.duvar({IMG}, {ON})` |
| `harita_sprite_yap` | tüm ‹IMG› karolarını ‹K› sprite'ına çevir | eylem | `harita.spriteYap({IMG}, {K})` |
| `harita_konumla` | ‹S› sprite'ını sütun ‹C› satır ‹R› karosuna koy | eylem | `harita.konumla({S}, {C}, {R})` |
| `sprite_karo` | ‹S› karo ‹A› | değer | `{S}.karo({A})` |
| `harita_say` | haritadaki ‹IMG› karo sayısı | değer | `harita.say({IMG})` |
| `harita_boyut` | harita ‹A› (karo) | değer | `harita.{A}` |
| `kamera_takip` | kamera ‹S› sprite'ını takip etsin | eylem | `sahne.kamera({S})` |
| `kamera_sabit` | kamera sabit kalsın | eylem | `sahne.kamera(null)` |
| `harita_karoya_dokununca` | bir ‹K› sprite'ı ‹IMG› karosuna dokununca | olay | `harita.karoyaDokununca({K}, {IMG}, (bu, sutun, satir) => {` |
| `harita_olay_karo` | olay karosunun ‹A› | değer | `{A}` |

#### Ses (`ses`)

| Tür | Blok | Biçim | JavaScript karşılığı |
|---|---|---|---|
| `ses_bip` | ‹F› Hz bip, ‹MS› ms | eylem | `ses.bip({F}, {MS})` |
| `ses_nota` | ‹NOTE› notası, ‹MS› ms | eylem | `ses.nota({NOTE}, {MS})` |
| `ses_melodi` | ‹M› melodisini çal | eylem | `ses.melodi({M})` |

#### Standart bloklar (Blockly)

- **Mantık**: `controls_if` (değilse/değilse eğer), `logic_compare`, `logic_operation`, `logic_negate`, `logic_boolean`, `logic_ternary`
- **Döngü**: `controls_repeat_ext`, `controls_whileUntil`, `controls_for`, `controls_flow_statements` (çık/devam)
- **Matematik**: `math_number`, `math_arithmetic` (+ − × ÷ üs), `math_single` (karekök, mutlak…), `math_round`, `math_modulo`, `math_random_int`, `math_constrain`, `math_number_property`
- **Metin**: `text`, `text_join`
- **Değişken**: `variables_get`, `variables_set`, `math_change` (global; araç kutusunda "Değişken oluştur…")
- **Fonksiyon**: `procedures_defnoreturn`, `procedures_defreturn`, `procedures_callnoreturn`, `procedures_callreturn`, `procedures_ifreturn` (parametreli, özyineleme sınırlı)

Liste blokları yoktur (bilinçli sınır). `math_random_int` motorun tohumlu rastgeleliğini kullanır.

## Etkinlik yazımı (`OyunActivity`)

```ts
// activities/ornek.ts
import { allow, type OyunActivity } from '../activity'
import { b, set } from '../dsl'
import { makeProject } from '../samples/kit'

export const ETKINLIK: OyunActivity = {
  id: 'ilk-sprite',
  title: 'Kedini sahneye getir',
  intro: 'Oyun başlayınca bir kedi oluştur ve sağ yarıya koy.',
  allowedBlocks: allow('oyun_baslangic', 'sprite_yeni', 'sprite_konum', 'degisken', 'math_number'),
  starter: () => makeProject('Başlangıç', [b('oyun_baslangic', {}, [])]),   // her çağrıda YENİ nesne
  scenario: [{ do: 'press', button: 'right', frames: 30 }],                // yoksa 2 sn çalışır
  goals: [
    { id: 'kedi', label: 'Bir kedi oluşturdun', hint: '"yeni sprite" bloğunu kullan', kind: 'sprites', of: 'oyuncu', image: 'oyuncu-kedi', min: 1 },
    { id: 'sag', label: 'Kedi sağ yarıda', kind: 'spriteProp', of: 'oyuncu', prop: 'x', op: 'gt', value: 100 },
  ],
  solution: () => makeProject('Çözüm', [/* … */]),
}
```
Etkinlik `activities/index.ts` içindeki `ACTIVITIES` listesine eklenir. Genel test (`activity.test.ts`) her etkinlik için şunu zorlar:
**starter hedeflerin tamamını sağlamaz · solution hepsini sağlar · solution yalnız `allowedBlocks` bloklarını kullanır · çıktı belirlenimcidir**.

**`allowedBlocks`**: blok `type` adları; kısayol gruplar: `mantik`, `dongu`, `matematik`, `metin`, `degisken`, `fonksiyon` (`allow()` ile). Araç kutusu yalnız izinli blokları ve dolu kategorileri gösterir
(Değişken/Fonksiyon kategorileri Blockly'nin dinamik paneli olduğundan ya hep ya hiç). `oyun_resim`/`oyun_harita` her zaman serbesttir.

**Senaryo adımları** (başsız çalışır; `runScenario`): `wait {frames}`, `seconds {s}`, `press {button, frames?}`, `tap`, `down`/`up`, `collide {a, b}` (a türünün ilk sprite'ını b'nin üstüne taşır),
`place {kind,x,y}`, `goto {kind,col,row}` (haritada karoya götürür), `spawn {image,kind,x?,y?}`.

**Hedef türleri** (`kind`): `sprites` (sprite sayısı; tür/resim, min/max; senaryo boyunca en çok görülen) · `spriteProp` (sonda bir sprite'ın x,y,vx,vy,z,w,h,image,kind,life,`props.ad` özelliği) ·
`moved` (oyuncu hareketi: eksen x/y/any, en az px) · `score` (`increased` | `gte`) · `life` (`decreased` | `lte` | `gte`) · `map` (harita yüklendi, boyut) · `tileCount` (haritadaki karo sayısı) ·
`gameOver` (kazanma/kaybetme) · `event` (`overlap`, `tileTouch`, `sound`, `created`, `destroyed`, `buttonPress`, `shake`, `particles`, `message`) · `usesBlocks` (statik: şu bloklar kullanılmış) · `custom` (kodla `test(report)`).
Çalışma hatası verirse tüm dinamik hedefler başarısız olur ve hata blok kimliğiyle raporlanır.

Değerlendirme: `evaluateGoals(activity, project)` → `{ results: [{id,label,ok,detail}], allPassed, error, report }`.

## Arayüz bileşenleri

```tsx
<OyunEditor storageKey="ask:oyun:project:v1" />                       // serbest atölye
<OyunEditor activity={ACTIVITY_BY_ID['ilk-sprite']} storageKey="ask:oyun:lesson:42"
            onGoalsChange={(results, allPassed) => …} />              // ders etkinliği
```
Tam genişlik/tam yükseklik: üst öğenin yüksekliğini doldurur (`height:100%`, en az 560 px); dar ekranda sahne üstte, düzenleme altta. Sahne: ▶/⏸ · ■ · ↺ · 1x/2x · ses · tam ekran; ekranda yön/A/B tuşları.
Sekmeler: Bloklar · JavaScript · Resimler (galeri + piksel editörü) · Harita.

## Bilinen sınırlar

- JavaScript sekmesi **salt okunur** (blok→JS tek yönlü); JS'ten bloğa dönüş yok.
- Liste/dizi blokları yok; yılan örneği gövdeyi "ömürlü parçalar" ile yapar.
- Karolar 16×16 olmalı; sprite resimleri en çok 32×32 (editör 8×8, 16×16, 16×8, 8×16 oluşturur; galeride 32×8 raket var).
- Sprite ölçeği/döndürme yok; tek ses kanalı sınırı yok ama aynı ses 40 ms içinde tekrar çalınmaz.
- Çalışırken blok değişiklikleri canlı uygulanmaz; ↺ gerekir.
- Hedefler başsız senaryoyla denetlenir; rastgelelik tohumludur (etkinlikte `seed`).
