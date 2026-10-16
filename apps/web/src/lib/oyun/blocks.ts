// Oyun Atölyesi — blok kataloğu (SAF VERİ: Blockly içe aktarılmaz, sunucuda ve Node testlerinde güvenle yüklenir).
// Her giriş hem Blockly tanımını, hem araç kutusunu, hem de "JavaScript" sekmesinin kod şablonunu üretir.
// Yorumlayıcı (interp.ts) aynı `type` adlarıyla çalışır. Standart bloklar (mantık, döngü, matematik, metin, değişken, fonksiyon) Blockly'nindir.

import { KINDS } from './types'
import { PALETTE } from './palette'
import { BLOCK_EN, CATEGORY_EN, KIND_EN, OPTION_EN, PALETTE_NAME_EN, type Locale } from './i18n-en'

export type CatKey = 'sprite' | 'hareket' | 'denetleyici' | 'oyun' | 'sahne' | 'ses' | 'mantik' | 'dongu' | 'degisken' | 'matematik' | 'metin' | 'fonksiyon'

export interface CategoryDef { key: CatKey; label: string; colour: string }
export const CATEGORIES: readonly CategoryDef[] = [
  { key: 'sprite', label: 'Sprite', colour: '#d6417a' },
  { key: 'hareket', label: 'Hareket', colour: '#3b82f6' },
  { key: 'denetleyici', label: 'Denetleyici', colour: '#d97706' },
  { key: 'oyun', label: 'Oyun', colour: '#7c3aed' },
  { key: 'sahne', label: 'Sahne / Harita', colour: '#0f9488' },
  { key: 'ses', label: 'Ses', colour: '#c026d3' },
  { key: 'mantik', label: 'Mantık', colour: '#2f6fe0' },
  { key: 'dongu', label: 'Döngü', colour: '#16a34a' },
  { key: 'degisken', label: 'Değişken', colour: '#e8590c' },
  { key: 'matematik', label: 'Matematik', colour: '#4f5bd5' },
  { key: 'metin', label: 'Metin', colour: '#0e8aa8' },
  { key: 'fonksiyon', label: 'Fonksiyon', colour: '#8b5cf6' },
]
export const CATEGORY_BY_KEY: Readonly<Record<CatKey, CategoryDef>> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CatKey, CategoryDef>

export type OutType = 'Number' | 'String' | 'Boolean' | 'Sprite' | 'Image' | 'Map'

export type Arg =
  | { t: 'spr' }
  | { t: 'num'; v: number }
  | { t: 'txt'; v: string }
  | { t: 'img' }
  | { t: 'map' }
  | { t: 'bool' }
  | { t: 'any' }
  | { t: 'dd'; opts: [string, string][]; v?: string }
  | { t: 'kind'; all?: boolean }
  | { t: 'col'; v: number }
  | { t: 'fnum'; v: number; min?: number; max?: number }
  | { t: 'ftxt'; v: string }

export interface BlockDef {
  type: string
  cat: CatKey
  shape: 'hat' | 'stmt' | 'cstmt' | 'val'
  out?: OutType | null
  /** Türkçe ileti; {AD} yer tutucuları `args` içindeki girişlerdir. */
  msg: string
  args: Record<string, Arg>
  tip: string
  /** JavaScript şablonu; {AD} = giriş ifadesi/alan değeri, {DO} = gövde. */
  js: string
}

const S: Arg = { t: 'spr' }
const num = (v: number): Arg => ({ t: 'num', v })
const txt = (v: string): Arg => ({ t: 'txt', v })
const dd = (opts: [string, string][], v?: string): Arg => ({ t: 'dd', opts, v })
const kind: Arg = { t: 'kind' }
const kindAll: Arg = { t: 'kind', all: true }
const IMG: Arg = { t: 'img' }
const col = (v: number): Arg => ({ t: 'col', v })

export const BUTTON_OPTS: [string, string][] = [['yukarı ↑', 'up'], ['aşağı ↓', 'down'], ['sol ←', 'left'], ['sağ →', 'right'], ['A', 'a'], ['B', 'b']]
export const ON_OPTS: [string, string][] = [['evet', 'true'], ['hayır', 'false']]
export const NOTES: { name: string; freq: number }[] = [
  ['C4', 261.63], ['D4', 293.66], ['E4', 329.63], ['F4', 349.23], ['G4', 392.0], ['A4', 440.0], ['B4', 493.88],
  ['C5', 523.25], ['D5', 587.33], ['E5', 659.25], ['F5', 698.46], ['G5', 783.99], ['A5', 880.0], ['B5', 987.77], ['C6', 1046.5],
].map(([name, freq]) => ({ name: name as string, freq: freq as number }))
export const MELODIES: [string, string][] = [
  ['zafer', 'zafer'], ['kayıp', 'kayip'], ['zıplama', 'ziplama'], ['puan', 'puan'], ['patlama', 'patlama'], ['güç', 'guc'], ['lazer', 'lazer'], ['başlangıç', 'baslangic'],
]
export const SPRITE_PROPS: [string, string][] = [
  ['x konumu', 'x'], ['y konumu', 'y'], ['x hızı', 'vx'], ['y hızı', 'vy'], ['genişliği', 'w'], ['yüksekliği', 'h'], ['yönü (derece)', 'dir'], ['kalan ömrü (ms)', 'life'],
]
export const SPRITE_FLAGS: [string, string][] = [
  ['dünyadan çıkınca silinsin', 'autoDestroy'], ['ekranda kalsın', 'stay'], ['duvar/kenara çarpınca sekmeli', 'bounce'], ['duvarlardan geçsin', 'ghost'], ['gizli olsun', 'hidden'],
]

export const BLOCKS: readonly BlockDef[] = [
  // ───── Oyun ─────
  { type: 'oyun_baslangic', cat: 'oyun', shape: 'hat', msg: 'oyun başlayınca', args: {}, tip: 'Oyun ilk açıldığında bir kez çalışır.', js: 'oyun.baslayinca(() => {\n{DO}\n})' },
  { type: 'oyun_her_kare', cat: 'oyun', shape: 'hat', msg: 'her karede', args: {}, tip: 'Saniyede 60 kez çalışır.', js: 'oyun.herKarede(() => {\n{DO}\n})' },
  { type: 'oyun_her_n_ms', cat: 'oyun', shape: 'hat', msg: 'her {MS} ms\'de bir', args: { MS: { t: 'fnum', v: 1000, min: 50, max: 600000 } }, tip: 'Belirtilen sürede bir (milisaniye) çalışır.', js: 'oyun.herMs({MS}, () => {\n{DO}\n})' },
  { type: 'oyun_can_bitince', cat: 'oyun', shape: 'hat', msg: 'can bitince', args: {}, tip: 'Can 0 olduğunda çalışır. Bu blok yoksa oyun otomatik biter.', js: 'oyun.canBitince(() => {\n{DO}\n})' },
  { type: 'oyun_sure_bitince', cat: 'oyun', shape: 'hat', msg: 'süre bitince', args: {}, tip: 'Geri sayım 0 olduğunda çalışır. Bu blok yoksa oyun otomatik biter.', js: 'oyun.sureBitince(() => {\n{DO}\n})' },
  { type: 'oyun_skor_ayarla', cat: 'oyun', shape: 'stmt', msg: 'skoru {N} yap', args: { N: num(0) }, tip: 'Skoru belirlediğin sayıya ayarlar ve ekranda gösterir.', js: 'oyun.skor = {N}' },
  { type: 'oyun_skor_degistir', cat: 'oyun', shape: 'stmt', msg: 'skoru {N} değiştir', args: { N: num(1) }, tip: 'Skora ekler (eksi sayı çıkarır).', js: 'oyun.skor += {N}' },
  { type: 'oyun_skor', cat: 'oyun', shape: 'val', out: 'Number', msg: 'skor', args: {}, tip: 'Şu anki skor.', js: 'oyun.skor' },
  { type: 'oyun_can_ayarla', cat: 'oyun', shape: 'stmt', msg: 'canı {N} yap', args: { N: num(3) }, tip: 'Can sayısını ayarlar ve kalpleri gösterir.', js: 'oyun.can = {N}' },
  { type: 'oyun_can_degistir', cat: 'oyun', shape: 'stmt', msg: 'canı {N} değiştir', args: { N: num(-1) }, tip: 'Cana ekler (eksi sayı azaltır). Can 0 olunca oyun biter.', js: 'oyun.can += {N}' },
  { type: 'oyun_can', cat: 'oyun', shape: 'val', out: 'Number', msg: 'can', args: {}, tip: 'Kalan can sayısı.', js: 'oyun.can' },
  { type: 'oyun_sure_baslat', cat: 'oyun', shape: 'stmt', msg: 'geri sayımı {N} saniyeden başlat', args: { N: num(30) }, tip: 'Süre dolunca "süre bitince" bloğu çalışır (yoksa oyun biter).', js: 'oyun.geriSayim({N})' },
  { type: 'oyun_sure', cat: 'oyun', shape: 'val', out: 'Number', msg: 'kalan süre (sn)', args: {}, tip: 'Geri sayımdan kalan saniye.', js: 'oyun.kalanSure' },
  { type: 'oyun_zaman', cat: 'oyun', shape: 'val', out: 'Number', msg: 'geçen süre (sn)', args: {}, tip: 'Oyun başladığından beri geçen saniye.', js: 'oyun.gecenSure' },
  { type: 'oyun_bitir', cat: 'oyun', shape: 'stmt', msg: 'oyunu bitir: {R}', args: { R: dd([['kazandın', 'win'], ['kaybettin', 'lose']]) }, tip: 'Oyun bitti ekranını gösterir.', js: 'oyun.bitir({R})' },
  { type: 'oyun_mesaj', cat: 'oyun', shape: 'stmt', msg: 'ekranda {T} yaz, {N} saniye', args: { T: txt('Merhaba!'), N: num(2) }, tip: 'Ekranın ortasında kısa bir mesaj gösterir.', js: 'oyun.mesaj({T}, {N})' },
  { type: 'oyun_sarsinti', cat: 'oyun', shape: 'stmt', msg: 'ekranı {N} ms salla', args: { N: num(300) }, tip: 'Ekran sarsıntısı efekti.', js: 'oyun.sars({N})' },
  { type: 'oyun_patlama', cat: 'oyun', shape: 'stmt', msg: 'x {X} y {Y} noktasında {C} patlama', args: { X: num(80), Y: num(60), C: col(4) }, tip: 'Renkli parçacıklar saçar.', js: 'oyun.patlama({X}, {Y}, {C})' },

  // ───── Sprite ─────
  { type: 'sprite_yeni', cat: 'sprite', shape: 'val', out: 'Sprite', msg: 'yeni {IMG} sprite\'ı, türü {K}', args: { IMG, K: kind }, tip: 'Ekranın ortasında yeni bir sprite oluşturur. Bir değişkene koyarak sonra ona ulaşabilirsin.', js: 'sprite.yeni({IMG}, {K})' },
  { type: 'oyun_bu_sprite', cat: 'sprite', shape: 'val', out: 'Sprite', msg: 'bu sprite', args: {}, tip: 'Olayın sprite\'ı (çarpışmada ilk sprite). Olay dışında en son oluşturulan sprite.', js: 'bu' },
  { type: 'oyun_diger_sprite', cat: 'sprite', shape: 'val', out: 'Sprite', msg: 'diğer sprite', args: {}, tip: 'Çarpışmada çarpılan öteki sprite.', js: 'diger' },
  { type: 'sprite_konum', cat: 'sprite', shape: 'stmt', msg: '{S} konumu x {X} y {Y}', args: { S, X: num(80), Y: num(60) }, tip: 'Sprite\'ı ekranda bir noktaya götürür (ekran 160 x 120).', js: '{S}.konum({X}, {Y})' },
  { type: 'sprite_resim', cat: 'sprite', shape: 'stmt', msg: '{S} resmi {IMG}', args: { S, IMG }, tip: 'Sprite\'ın görünüşünü değiştirir.', js: '{S}.resim({IMG})' },
  { type: 'sprite_sil', cat: 'sprite', shape: 'stmt', msg: '{S} sprite\'ını sil', args: { S }, tip: 'Sprite\'ı oyundan kaldırır.', js: '{S}.sil()' },
  { type: 'sprite_patlat', cat: 'sprite', shape: 'stmt', msg: '{S} patlayıp yok olsun', args: { S }, tip: 'Sprite\'ı patlama efektiyle siler.', js: '{S}.patlat()' },
  { type: 'sprite_omur', cat: 'sprite', shape: 'stmt', msg: '{S} {N} ms sonra yok olsun', args: { S, N: num(2000) }, tip: 'Sprite\'a bir ömür verir; süre dolunca silinir.', js: '{S}.omur = {N}' },
  { type: 'sprite_bayrak', cat: 'sprite', shape: 'stmt', msg: '{S} {F}: {ON}', args: { S, F: dd(SPRITE_FLAGS), ON: dd(ON_OPTS) }, tip: 'Sprite\'ın davranış ayarlarını açar ya da kapatır.', js: '{S}.ayar({F}, {ON})' },
  { type: 'sprite_bak', cat: 'sprite', shape: 'stmt', msg: '{S} {D} baksın', args: { S, D: dd([['sağa', 'right'], ['sola', 'left']]) }, tip: 'Resmi yatayda çevirir.', js: '{S}.bak({D})' },
  { type: 'sprite_katman', cat: 'sprite', shape: 'stmt', msg: '{S} katmanı {N}', args: { S, N: num(1) }, tip: 'Büyük katman numarası önde çizilir.', js: '{S}.katman = {N}' },
  { type: 'sprite_konus', cat: 'sprite', shape: 'stmt', msg: '{S} {T} desin, {N} saniye', args: { S, T: txt('Merhaba!'), N: num(2) }, tip: 'Sprite\'ın üstünde konuşma balonu gösterir.', js: '{S}.konus({T}, {N})' },
  { type: 'sprite_takip', cat: 'sprite', shape: 'stmt', msg: '{S}, {O} sprite\'ını {N} hızıyla takip etsin', args: { S, O: S, N: num(30) }, tip: 'Sprite sürekli hedefe doğru gider.', js: '{S}.takipEt({O}, {N})' },
  { type: 'sprite_takip_birak', cat: 'sprite', shape: 'stmt', msg: '{S} takibi bıraksın', args: { S }, tip: 'Takibi bırakır.', js: '{S}.takibiBirak()' },
  { type: 'sprite_ozellik_ayarla', cat: 'sprite', shape: 'stmt', msg: '{S} için {NAME} özelliği = {V}', args: { S, NAME: { t: 'ftxt', v: 'puan' }, V: { t: 'any' } }, tip: 'Sprite\'a kendi özelliğini (sayı ya da metin) saklar.', js: '{S}.ozellik({NAME}, {V})' },
  { type: 'sprite_ozellik', cat: 'sprite', shape: 'val', out: null, msg: '{S} için {NAME} özelliği', args: { S, NAME: { t: 'ftxt', v: 'puan' } }, tip: 'Sprite\'a saklanmış özelliği okur (yoksa 0).', js: '{S}.ozellik({NAME})' },
  { type: 'sprite_oku', cat: 'sprite', shape: 'val', out: 'Number', msg: '{S} {P}', args: { S, P: dd(SPRITE_PROPS) }, tip: 'Sprite\'ın bir sayısal bilgisini okur.', js: '{S}.{P}' },
  { type: 'sprite_cakisiyor', cat: 'sprite', shape: 'val', out: 'Boolean', msg: '{A} ile {B} çakışıyor mu?', args: { A: S, B: S }, tip: 'İki sprite üst üste mi?', js: '{A}.cakisiyorMu({B})' },
  { type: 'sprite_dokunuyor', cat: 'sprite', shape: 'val', out: 'Boolean', msg: '{S} {D} dokunuyor mu?', args: { S, D: dd([['alttan bir duvara', 'down'], ['üstten bir duvara', 'up'], ['soldan bir duvara', 'left'], ['sağdan bir duvara', 'right']]) }, tip: 'Duvar karosuna ya da (ekranda kalıyorsa) ekran kenarına değiyor mu? Platform oyunlarında "yerde mi?" için.', js: '{S}.dokunuyorMu({D})' },
  { type: 'sprite_mesafe', cat: 'sprite', shape: 'val', out: 'Number', msg: '{A} ile {B} arası mesafe', args: { A: S, B: S }, tip: 'İki sprite\'ın merkezleri arasındaki piksel uzaklığı.', js: '{A}.mesafe({B})' },
  { type: 'sprite_sayisi', cat: 'sprite', shape: 'val', out: 'Number', msg: '{K} sprite sayısı', args: { K: kindAll }, tip: 'O türden kaç sprite var?', js: 'sprite.say({K})' },
  { type: 'sprite_hepsini_sil', cat: 'sprite', shape: 'stmt', msg: 'tüm {K} sprite\'larını sil', args: { K: kindAll }, tip: 'Seçilen türdeki bütün sprite\'ları siler.', js: 'sprite.hepsiniSil({K})' },
  { type: 'sprite_her_biri', cat: 'sprite', shape: 'cstmt', msg: 'her {K} sprite\'ı için', args: { K: kindAll }, tip: 'İçindeki bloklar o türdeki her sprite için çalışır; "bu sprite" sırayla onlar olur.', js: 'for (const bu of sprite.hepsi({K})) {\n{DO}\n}' },
  { type: 'sprite_carpisinca', cat: 'sprite', shape: 'hat', msg: 'bir {KA} sprite\'ı bir {KB} sprite\'ına çarpınca', args: { KA: kindAll, KB: kindAll }, tip: 'Üst üste geldikleri anda bir kez çalışır. "bu sprite" birincisi, "diğer sprite" ikincisidir.', js: 'sprite.carpisinca({KA}, {KB}, (bu, diger) => {\n{DO}\n})' },
  { type: 'sprite_olusunca', cat: 'sprite', shape: 'hat', msg: 'bir {K} sprite\'ı oluşunca', args: { K: kindAll }, tip: 'Yeni sprite oluştuğunda çalışır; "bu sprite" o sprite\'tır.', js: 'sprite.olusunca({K}, (bu) => {\n{DO}\n})' },
  { type: 'sprite_silinince', cat: 'sprite', shape: 'hat', msg: 'bir {K} sprite\'ı silinince', args: { K: kindAll }, tip: 'Sprite silindiğinde çalışır.', js: 'sprite.silinince({K}, (bu) => {\n{DO}\n})' },

  // ───── Hareket ─────
  { type: 'hareket_hiz', cat: 'hareket', shape: 'stmt', msg: '{S} hızı x {VX} y {VY}', args: { S, VX: num(30), VY: num(0) }, tip: 'Saniyede kaç piksel gideceğini ayarlar. Eksi sayı ters yöne gider.', js: '{S}.hiz({VX}, {VY})' },
  { type: 'hareket_ivme', cat: 'hareket', shape: 'stmt', msg: '{S} ivmesi x {AX} y {AY}', args: { S, AX: num(0), AY: num(300) }, tip: 'Hız zamanla artar. Aşağı yönlü ivme yerçekimi gibidir.', js: '{S}.ivme({AX}, {AY})' },
  { type: 'hareket_yone', cat: 'hareket', shape: 'stmt', msg: '{S} {D} derece yönünde {N} hızla gitsin', args: { S, D: num(90), N: num(40) }, tip: '0 = yukarı, 90 = sağ, 180 = aşağı, 270 = sol.', js: '{S}.yonHiz({D}, {N})' },
  { type: 'hareket_dur', cat: 'hareket', shape: 'stmt', msg: '{S} dursun', args: { S }, tip: 'Hızı ve ivmeyi sıfırlar.', js: '{S}.dur()' },
  { type: 'hareket_ters', cat: 'hareket', shape: 'stmt', msg: '{S} {A} hızını ters çevir', args: { S, A: dd([['x (yatay)', 'x'], ['y (dikey)', 'y']]) }, tip: 'Yön değiştirir (sekme).', js: '{S}.tersCevir({A})' },
  { type: 'hareket_kaydir', cat: 'hareket', shape: 'stmt', msg: '{S} x {DX} y {DY} kadar kaydır', args: { S, DX: num(8), DY: num(0) }, tip: 'Konumuna ekler (duvarlar hesaba katılmaz).', js: '{S}.kaydir({DX}, {DY})' },

  // ───── Denetleyici ─────
  { type: 'den_dugme', cat: 'denetleyici', shape: 'hat', msg: '{B} düğmesine {E}', args: { B: dd(BUTTON_OPTS), E: dd([['basılınca', 'press'], ['bırakılınca', 'release']]) }, tip: 'Ok tuşları / WASD / A (boşluk, Z) / B (X, Enter) ya da ekrandaki oyun tuşları.', js: 'denetleyici.dugme({B}, {E}, () => {\n{DO}\n})' },
  { type: 'den_basili', cat: 'denetleyici', shape: 'val', out: 'Boolean', msg: '{B} düğmesi basılı mı?', args: { B: dd(BUTTON_OPTS) }, tip: 'Düğme şu anda basılı tutuluyor mu?', js: 'denetleyici.basiliMi({B})' },
  { type: 'den_yon', cat: 'denetleyici', shape: 'val', out: 'Number', msg: '{A} yön', args: { A: dd([['yatay', 'x'], ['dikey', 'y']]) }, tip: 'Yatay: sol -1, sağ +1. Dikey: yukarı -1, aşağı +1. Basılı değilse 0.', js: 'denetleyici.yon({A})' },
  { type: 'den_hareket', cat: 'denetleyici', shape: 'stmt', msg: '{S} oyuncu tuşlarıyla {M} hareket etsin, hız {N}', args: { S, M: dd([['dört yöne', 'four'], ['sağa-sola', 'h'], ['yukarı-aşağı', 'v']]), N: num(60) }, tip: 'Sprite\'ı ok tuşlarıyla (ve ekrandaki yön tuşlarıyla) sürersin.', js: '{S}.tuslaHareket({M}, {N})' },
  { type: 'den_hareket_birak', cat: 'denetleyici', shape: 'stmt', msg: '{S} tuşlarla hareket etmesin', args: { S }, tip: 'Tuş denetimini kaldırır.', js: '{S}.tuslaHareketiBirak()' },

  // ───── Sahne / Harita ─────
  { type: 'sahne_renk', cat: 'sahne', shape: 'stmt', msg: 'arka plan rengi {C}', args: { C: col(8) }, tip: 'Sahnenin arka plan rengi.', js: 'sahne.renk({C})' },
  { type: 'sahne_dosemesi', cat: 'sahne', shape: 'stmt', msg: 'arka planı {IMG} resmiyle döşe', args: { IMG }, tip: 'Küçük bir resmi arka plana tekrar tekrar döşer.', js: 'sahne.dose({IMG})' },
  { type: 'harita_yukle', cat: 'sahne', shape: 'stmt', msg: 'haritayı yükle: {M}', args: { M: { t: 'map' } }, tip: 'Harita sekmesinde çizdiğin haritayı oyuna koyar.', js: 'harita.yukle({M})' },
  { type: 'harita_karo_koy', cat: 'sahne', shape: 'stmt', msg: 'sütun {C} satır {R} karosunu {IMG} yap', args: { C: num(0), R: num(0), IMG }, tip: 'Haritanın bir karosunu değiştirir (sütun ve satır 0\'dan başlar).', js: 'harita.karoKoy({C}, {R}, {IMG})' },
  { type: 'harita_karo_sil', cat: 'sahne', shape: 'stmt', msg: 'sütun {C} satır {R} karosunu boşalt', args: { C: num(0), R: num(0) }, tip: 'Karoyu kaldırır.', js: 'harita.karoSil({C}, {R})' },
  { type: 'harita_karo', cat: 'sahne', shape: 'val', out: 'String', msg: 'sütun {C} satır {R} karosunun resmi', args: { C: num(0), R: num(0) }, tip: 'Karonun resim adı; boşsa boş metin.', js: 'harita.karo({C}, {R})' },
  { type: 'harita_duvar_mu', cat: 'sahne', shape: 'val', out: 'Boolean', msg: 'sütun {C} satır {R} duvar mı?', args: { C: num(0), R: num(0) }, tip: 'O karo bir duvar mı?', js: 'harita.duvarMi({C}, {R})' },
  { type: 'harita_duvar', cat: 'sahne', shape: 'stmt', msg: '{IMG} karoları duvar olsun: {ON}', args: { IMG, ON: dd(ON_OPTS) }, tip: 'Duvar karolarına sprite\'lar giremez.', js: 'harita.duvar({IMG}, {ON})' },
  { type: 'harita_sprite_yap', cat: 'sahne', shape: 'stmt', msg: 'tüm {IMG} karolarını {K} sprite\'ına çevir', args: { IMG, K: kind }, tip: 'Haritadaki işaretli karoların yerine sprite koyar (yiyecek, düşman yerleştirmek için). Her biri için "oluşunca" olayı çalışır.', js: 'harita.spriteYap({IMG}, {K})' },
  { type: 'harita_konumla', cat: 'sahne', shape: 'stmt', msg: '{S} sprite\'ını sütun {C} satır {R} karosuna koy', args: { S, C: num(1), R: num(1) }, tip: 'Sprite\'ı karonun ortasına yerleştirir.', js: 'harita.konumla({S}, {C}, {R})' },
  { type: 'sprite_karo', cat: 'sahne', shape: 'val', out: 'Number', msg: '{S} karo {A}', args: { S, A: dd([['sütunu', 'col'], ['satırı', 'row']]) }, tip: 'Sprite\'ın üstünde bulunduğu karonun sütunu ya da satırı.', js: '{S}.karo({A})' },
  { type: 'harita_say', cat: 'sahne', shape: 'val', out: 'Number', msg: 'haritadaki {IMG} karo sayısı', args: { IMG }, tip: 'Haritada o karodan kaç tane var?', js: 'harita.say({IMG})' },
  { type: 'harita_boyut', cat: 'sahne', shape: 'val', out: 'Number', msg: 'harita {A} (karo)', args: { A: dd([['genişliği', 'cols'], ['yüksekliği', 'rows']]) }, tip: 'Haritanın karo sayısı.', js: 'harita.{A}' },
  { type: 'kamera_takip', cat: 'sahne', shape: 'stmt', msg: 'kamera {S} sprite\'ını takip etsin', args: { S }, tip: 'Harita ekrandan büyükse kamera kayar.', js: 'sahne.kamera({S})' },
  { type: 'kamera_sabit', cat: 'sahne', shape: 'stmt', msg: 'kamera sabit kalsın', args: {}, tip: 'Takibi bırakır.', js: 'sahne.kamera(null)' },
  { type: 'harita_karoya_dokununca', cat: 'sahne', shape: 'hat', msg: 'bir {K} sprite\'ı {IMG} karosuna dokununca', args: { K: kindAll, IMG }, tip: 'Karoya değdiği anda bir kez çalışır. "olay karosu" bloklarıyla yerini öğrenirsin.', js: 'harita.karoyaDokununca({K}, {IMG}, (bu, sutun, satir) => {\n{DO}\n})' },
  { type: 'harita_olay_karo', cat: 'sahne', shape: 'val', out: 'Number', msg: 'olay karosunun {A}', args: { A: dd([['sütunu', 'col'], ['satırı', 'row']]) }, tip: '"karosuna dokununca" içinde dokunulan karonun yeri.', js: '{A}' },

  // ───── Ses ─────
  { type: 'ses_bip', cat: 'ses', shape: 'stmt', msg: '{F} Hz bip, {MS} ms', args: { F: num(440), MS: num(150) }, tip: 'Basit bir ses (200 - 2000 Hz arası iyi duyulur).', js: 'ses.bip({F}, {MS})' },
  { type: 'ses_nota', cat: 'ses', shape: 'stmt', msg: '{NOTE} notası, {MS} ms', args: { NOTE: dd(NOTES.map((n) => [n.name, n.name] as [string, string]), 'A4'), MS: num(250) }, tip: 'Bir müzik notası çalar.', js: 'ses.nota({NOTE}, {MS})' },
  { type: 'ses_melodi', cat: 'ses', shape: 'stmt', msg: '{M} melodisini çal', args: { M: dd(MELODIES) }, tip: 'Hazır kısa melodiler.', js: 'ses.melodi({M})' },
]

export const BLOCK_BY_TYPE: Readonly<Record<string, BlockDef>> = Object.fromEntries(BLOCKS.map((b) => [b.type, b]))

/** Yardımcı bloklar (kod tarafından gölge olarak kullanılır; araç kutusunda görünmez). */
export const HELPER_BLOCKS = ['oyun_resim', 'oyun_harita'] as const

/** Hazır (Blockly'nin) bloklar ve kategorileri: araç kutusu ve izin listesi için. */
export const STD_BLOCKS: Record<string, CatKey> = {
  controls_if: 'mantik', logic_compare: 'mantik', logic_operation: 'mantik', logic_negate: 'mantik', logic_boolean: 'mantik', logic_ternary: 'mantik', logic_null: 'mantik',
  controls_repeat_ext: 'dongu', controls_whileUntil: 'dongu', controls_for: 'dongu', controls_flow_statements: 'dongu',
  math_number: 'matematik', math_arithmetic: 'matematik', math_single: 'matematik', math_round: 'matematik', math_modulo: 'matematik', math_random_int: 'matematik', math_constrain: 'matematik', math_number_property: 'matematik', math_change: 'degisken',
  text: 'metin', text_join: 'metin',
  variables_get: 'degisken', variables_set: 'degisken',
  procedures_defnoreturn: 'fonksiyon', procedures_defreturn: 'fonksiyon', procedures_callnoreturn: 'fonksiyon', procedures_callreturn: 'fonksiyon', procedures_ifreturn: 'fonksiyon',
}

export const ALL_BLOCK_TYPES: readonly string[] = [...BLOCKS.map((b) => b.type), ...Object.keys(STD_BLOCKS)]

/** Etkinlik izin listesinde kullanılabilen kısa gruplar. */
export const BLOCK_GROUPS: Record<string, string[]> = {
  mantik: ['controls_if', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_ternary'],
  dongu: ['controls_repeat_ext', 'controls_whileUntil', 'controls_for', 'controls_flow_statements'],
  matematik: ['math_number', 'math_arithmetic', 'math_single', 'math_round', 'math_modulo', 'math_random_int', 'math_constrain', 'math_number_property'],
  metin: ['text', 'text_join'],
  degisken: ['variables_get', 'variables_set', 'math_change'],
  fonksiyon: ['procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn'],
}

// ───────── Blockly JSON üretimi (saf veri) ─────────

export interface BlockJson { type: string; style: string; message0: string; args0: Record<string, unknown>[]; message1?: string; args1?: Record<string, unknown>[]; previousStatement?: null; nextStatement?: null; output?: string | null; tooltip: string; inputsInline: boolean }

/** Renk açılır listesindeki küçük kare (SVG veri adresi; DOM gerekmez). */
export const swatch = (hex: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><rect x="1" y="1" width="20" height="20" rx="4" fill="${hex}" stroke="#15131f" stroke-width="2"/></svg>`)}`

const CHECK: Partial<Record<Arg['t'], string>> = { spr: 'Sprite', num: 'Number', txt: 'String', img: 'Image', map: 'Map', bool: 'Boolean' }

/** Açılır liste etiketi (İngilizcede çeviri tablosundan; yoksa olduğu gibi). Değer değişmez. */
const optLabel = (label: string, locale: Locale): string => (locale === 'en' ? OPTION_EN[label] ?? label : label)

function argJson(name: string, a: Arg, locale: Locale = 'tr'): Record<string, unknown> {
  const en = locale === 'en'
  switch (a.t) {
    case 'dd': return { type: 'field_dropdown', name, options: en ? a.opts.map(([l, v]) => [optLabel(l, locale), v]) : a.opts }
    case 'kind': return { type: 'field_dropdown', name, options: [...(a.all ? [[optLabel('hepsi', locale), 'hepsi']] : []), ...KINDS.map((k) => [en ? KIND_EN[k.id] ?? k.label : k.label, k.id])] }
    case 'col': return { type: 'field_dropdown', name, options: PALETTE.map((p) => [{ src: swatch(p.hex), width: 22, height: 22, alt: en ? PALETTE_NAME_EN[p.index] ?? p.name : p.name }, p.hex]) }
    case 'fnum': return { type: 'field_number', name, value: a.v, min: a.min, max: a.max, precision: 1 }
    case 'ftxt': return { type: 'field_input', name, text: a.v, spellcheck: false }
    case 'any': return { type: 'input_value', name }
    default: return { type: 'input_value', name, check: CHECK[a.t] }
  }
}

export function blockJson(def: BlockDef, locale: Locale = 'tr'): BlockJson {
  const args0: Record<string, unknown>[] = []
  let n = 0
  const en = locale === 'en' ? BLOCK_EN[def.type] : undefined
  const message0 = (en?.msg ?? def.msg).replace(/\{([A-Z0-9_]+)\}/g, (_m, name: string) => {
    const a = def.args[name]
    if (!a) throw new Error(`${def.type}: '${name}' girişi tanımlı değil`)
    args0.push(argJson(name, a, locale))
    return `%${++n}`
  })
  const json: BlockJson = { type: def.type, style: `oyun_${def.cat}`, message0, args0, tooltip: en?.tip ?? def.tip, inputsInline: true }
  if (def.shape === 'val') json.output = def.out ?? null
  else {
    if (def.shape !== 'hat') { json.previousStatement = null; json.nextStatement = null }
  }
  if (def.shape === 'hat' || def.shape === 'cstmt') {
    json.message1 = '%1'
    json.args1 = [{ type: 'input_statement', name: 'DO' }]
  }
  return json
}
export const BLOCK_JSON: readonly BlockJson[] = BLOCKS.map((d) => blockJson(d))
/** Dile göre blok tanımları (Türkçe: BLOCK_JSON). */
export const blockJsonFor = (locale: Locale): readonly BlockJson[] => (locale === 'tr' ? BLOCK_JSON : BLOCKS.map((d) => blockJson(d, locale)))
/** Kategorinin görünen adı. */
export const categoryLabel = (c: CategoryDef, locale: Locale = 'tr'): string => (locale === 'en' ? CATEGORY_EN[c.key] : c.label)

// ───────── Araç kutusu ─────────

interface ShadowSpec { type: string; fields?: Record<string, unknown> }
/** Araç kutusundaki hazır metin (yalnız başlangıç değeri; davranışı etkilemez). */
const TEXT_EN: Readonly<Record<string, string>> = { 'Merhaba!': 'Hello!' }

function shadowOf(a: Arg, locale: Locale = 'tr'): ShadowSpec | null {
  switch (a.t) {
    case 'num': return { type: 'math_number', fields: { NUM: a.v } }
    case 'txt': return { type: 'text', fields: { TEXT: locale === 'en' ? TEXT_EN[a.v] ?? a.v : a.v } }
    case 'spr': return { type: 'oyun_bu_sprite' }
    case 'img': return { type: 'oyun_resim' }
    case 'map': return { type: 'oyun_harita' }
    default: return null
  }
}

export function flyoutEntry(def: BlockDef, locale: Locale = 'tr'): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}
  for (const [name, a] of Object.entries(def.args)) {
    const sh = shadowOf(a, locale)
    if (sh) inputs[name] = { shadow: sh }
  }
  const fields: Record<string, unknown> = {}
  for (const [name, a] of Object.entries(def.args)) if (a.t === 'col') fields[name] = PALETTE[a.v].hex
  const e: Record<string, unknown> = { kind: 'block', type: def.type }
  if (Object.keys(inputs).length) e.inputs = inputs
  if (Object.keys(fields).length) e.fields = fields
  return e
}

const STD_FLYOUT: Partial<Record<CatKey, unknown[]>> = {
  mantik: [
    { kind: 'block', type: 'controls_if' },
    { kind: 'block', type: 'controls_if', extraState: { hasElse: true } },
    { kind: 'block', type: 'logic_compare', inputs: { A: { shadow: { type: 'math_number', fields: { NUM: 0 } } }, B: { shadow: { type: 'math_number', fields: { NUM: 0 } } } } },
    { kind: 'block', type: 'logic_operation' }, { kind: 'block', type: 'logic_negate' }, { kind: 'block', type: 'logic_boolean' },
    { kind: 'block', type: 'logic_ternary' },
  ],
  dongu: [
    { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 10 } } } } },
    { kind: 'block', type: 'controls_whileUntil' },
    { kind: 'block', type: 'controls_for', inputs: { FROM: { shadow: { type: 'math_number', fields: { NUM: 1 } } }, TO: { shadow: { type: 'math_number', fields: { NUM: 10 } } }, BY: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } },
    { kind: 'block', type: 'controls_flow_statements' },
  ],
  matematik: [
    { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
    { kind: 'block', type: 'math_arithmetic', inputs: { A: { shadow: { type: 'math_number', fields: { NUM: 1 } } }, B: { shadow: { type: 'math_number', fields: { NUM: 1 } } } } },
    { kind: 'block', type: 'math_modulo', inputs: { DIVIDEND: { shadow: { type: 'math_number', fields: { NUM: 10 } } }, DIVISOR: { shadow: { type: 'math_number', fields: { NUM: 3 } } } } },
    { kind: 'block', type: 'math_random_int', inputs: { FROM: { shadow: { type: 'math_number', fields: { NUM: 1 } } }, TO: { shadow: { type: 'math_number', fields: { NUM: 100 } } } } },
    { kind: 'block', type: 'math_single', inputs: { NUM: { shadow: { type: 'math_number', fields: { NUM: 9 } } } } },
    { kind: 'block', type: 'math_round', inputs: { NUM: { shadow: { type: 'math_number', fields: { NUM: 3.1 } } } } },
    { kind: 'block', type: 'math_constrain', inputs: { VALUE: { shadow: { type: 'math_number', fields: { NUM: 50 } } }, LOW: { shadow: { type: 'math_number', fields: { NUM: 1 } } }, HIGH: { shadow: { type: 'math_number', fields: { NUM: 100 } } } } },
    { kind: 'block', type: 'math_number_property', inputs: { NUMBER_TO_CHECK: { shadow: { type: 'math_number', fields: { NUM: 0 } } } } },
  ],
  metin: [{ kind: 'block', type: 'text' }, { kind: 'block', type: 'text_join' }],
}

/** Blockly araç kutusu JSON'u (kategori sırası: Sprite … Fonksiyon). `allowed` verilmezse hepsi. */
export function toolboxJson(allowed?: readonly string[], locale: Locale = 'tr'): { kind: 'categoryToolbox'; contents: Record<string, unknown>[] } {
  const ok = allowed ? new Set(allowed) : null
  const contents: Record<string, unknown>[] = []
  for (const c of CATEGORIES) {
    let items: unknown[] = []
    let custom: string | null = null
    if (c.key === 'degisken') {
      if (ok && !ok.has('variables_get') && !ok.has('variables_set')) continue
      custom = 'VARIABLE'
    } else if (c.key === 'fonksiyon') {
      if (ok && !['procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn'].some((t) => ok.has(t))) continue
      custom = 'PROCEDURE'
    } else {
      const own = BLOCKS.filter((b) => b.cat === c.key && (!ok || ok.has(b.type))).map((d) => flyoutEntry(d, locale))
      const std = (STD_FLYOUT[c.key] ?? []).filter((e) => !ok || ok.has((e as { type: string }).type))
      items = [...own, ...std]
      if (!items.length) continue
    }
    const cat: Record<string, unknown> = { kind: 'category', name: categoryLabel(c, locale), categorystyle: `oyun_cat_${c.key}`, cssConfig: { icon: `oyb-ic-${c.key}` }, contents: items }
    if (custom) { cat.custom = custom; if (!items.length) delete cat.contents }
    contents.push(cat)
  }
  return { kind: 'categoryToolbox', contents }
}
