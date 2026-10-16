// Sahne Atölyesi — blok kataloğu (SAF VERİ: Blockly içe aktarılmaz; sunucuda ve Node testlerinde güvenle yüklenir).
// Her giriş hem Blockly tanımını (blockJson) hem araç kutusunu hem de yorumlayıcının bilmesi gereken şekli üretir.
// Şekiller: hat (kubbeli başlık) · stmt (yığın) · cap (kapak, altına blok gelmez) · c (C biçimli) · ccap (C + kapak)
//           ifelse (iki ağızlı C) · val (yuvarlak değer) · bool (altıgen koşul). Bloklar özgün tasarımdır.
// Görünen metin dile bağlıdır: `locale` 'en' iken blocks-en.ts kullanılır (tür kimlikleri ve alan değerleri aynı kalır).
import type { Locale } from '@/i18n'
import { BLOCK_MSG_EN, CATEGORY_LABEL_EN, OPTION_LABEL_EN, SHADOW_TEXT_EN } from './blocks-en'

export type CatKey = 'hareket' | 'gorunum' | 'ses' | 'olaylar' | 'kontrol' | 'algilama' | 'islemler' | 'degiskenler' | 'bloklarim' | 'kalem'
export interface CategoryDef { key: CatKey; label: string; colour: string; icon: string }
export const CATEGORIES: readonly CategoryDef[] = [
  { key: 'hareket', label: 'Hareket', colour: '#3f8cf6', icon: '➜' },
  { key: 'gorunum', label: 'Görünüm', colour: '#8f66f0', icon: '👁' },
  { key: 'ses', label: 'Ses', colour: '#c85bc8', icon: '♪' },
  { key: 'olaylar', label: 'Olaylar', colour: '#e8ac00', icon: '⚑' },
  { key: 'kontrol', label: 'Kontrol', colour: '#f59a14', icon: '↻' },
  { key: 'algilama', label: 'Algılama', colour: '#35a6d4', icon: '◎' },
  { key: 'islemler', label: 'İşlemler', colour: '#4ab84a', icon: '＋' },
  { key: 'degiskenler', label: 'Değişkenler', colour: '#f2790f', icon: '▤' },
  { key: 'bloklarim', label: 'Bloklarım', colour: '#ec4f78', icon: '✚' },
  { key: 'kalem', label: 'Kalem', colour: '#0fa97d', icon: '✎' },
]
export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CatKey, CategoryDef>
/** Kategorinin görünen adı (dile göre). */
export const categoryLabel = (c: CategoryDef, locale: Locale = 'tr'): string => (locale === 'en' ? CATEGORY_LABEL_EN[c.key] ?? c.label : c.label)
/** Bloğun görünen iletisi (dile göre; yer tutucular aynı). */
export const blockMsg = (def: BlockDef, locale: Locale = 'tr'): string => (locale === 'en' ? BLOCK_MSG_EN[def.type] ?? def.msg : def.msg)
const optLabel = (label: string, locale: Locale): string => (locale === 'en' ? OPTION_LABEL_EN[label] ?? label : label)

/** Açılır listesi çalışma zamanında (projeye göre) üretilen alan türleri. */
export type DynKind = 'costume' | 'backdrop' | 'sound' | 'touch' | 'goto' | 'towards' | 'clone' | 'ofTarget' | 'message'

export type Arg =
  | { t: 'num'; v: number }
  | { t: 'txt'; v: string }
  | { t: 'bool' }
  | { t: 'any' }
  | { t: 'dd'; opts: [string, string][]; v?: string }
  | { t: 'dyn'; kind: DynKind }
  | { t: 'var' }
  | { t: 'list' }

export type Shape = 'hat' | 'stmt' | 'cap' | 'c' | 'ccap' | 'ifelse' | 'val' | 'bool'

export interface BlockDef {
  type: string
  cat: CatKey
  shape: Shape
  /** Türkçe ileti; {AD} yer tutucuları `args` içindeki girişlerdir (sırayla). */
  msg: string
  args: Record<string, Arg>
  /** Araç kutusunda bu bloktan önce ayırıcı boşluk. */
  sep?: boolean
}

const num = (v: number): Arg => ({ t: 'num', v })
const txt = (v: string): Arg => ({ t: 'txt', v })
const dd = (opts: [string, string][], v?: string): Arg => ({ t: 'dd', opts, v })
const dyn = (kind: DynKind): Arg => ({ t: 'dyn', kind })
const BOOL: Arg = { t: 'bool' }
const VAR: Arg = { t: 'var' }
const LIST: Arg = { t: 'list' }

const KEY_LABELS: [string, string][] = [['boşluk', 'space'], ['yukarı ok', 'up'], ['aşağı ok', 'down'], ['sağ ok', 'right'], ['sol ok', 'left'], ['herhangi bir tuş', 'any']]
export const KEY_OPTS: [string, string][] = [
  ...KEY_LABELS,
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map((c): [string, string] => [c, c]),
  ...'0123456789'.split('').map((c): [string, string] => [c, c]),
]
export const KEY_IDS: string[] = KEY_OPTS.map((o) => o[1])

export const NOTE_OPTS: [string, string][] = [
  ['Do (C4)', '60'], ['Re (D4)', '62'], ['Mi (E4)', '64'], ['Fa (F4)', '65'], ['Sol (G4)', '67'], ['La (A4)', '69'], ['Si (B4)', '71'], ['Do (C5)', '72'],
  ['Re (D5)', '74'], ['Mi (E5)', '76'], ['Fa (F5)', '77'], ['Sol (G5)', '79'],
]
export const COLOR_OPTS: [string, string][] = [
  ['kırmızı', '#e53935'], ['turuncu', '#fb8c00'], ['sarı', '#fdd835'], ['yeşil', '#43a047'], ['mavi', '#1e88e5'], ['mor', '#8e24aa'],
  ['pembe', '#ec407a'], ['turkuaz', '#00acc1'], ['kahverengi', '#6d4c41'], ['siyah', '#212121'], ['gri', '#9e9e9e'], ['beyaz', '#ffffff'],
]
export const EFFECT_OPTS: [string, string][] = [['renk', 'color'], ['hayalet', 'ghost'], ['parlaklık', 'brightness']]
export const MATH_OPS: [string, string][] = [['mutlak değer', 'abs'], ['aşağı yuvarla', 'floor'], ['yukarı yuvarla', 'ceiling'], ['karekök', 'sqrt'], ['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan'], ['ln', 'ln'], ['log', 'log']]
export const SENSE_PROPS: [string, string][] = [['x konumu', 'x'], ['y konumu', 'y'], ['yönü', 'dir'], ['kostüm no', 'costume'], ['boyutu', 'size']]
export const CURRENT_OPTS: [string, string][] = [['yıl', 'year'], ['ay', 'month'], ['gün', 'date'], ['haftanın günü', 'dayofweek'], ['saat', 'hour'], ['dakika', 'minute'], ['saniye', 'second']]

export const BLOCKS: readonly BlockDef[] = [
  // ───── Hareket ─────
  { type: 'sh_move', cat: 'hareket', shape: 'stmt', msg: '{N} adım git', args: { N: num(10) } },
  { type: 'sh_turn_r', cat: 'hareket', shape: 'stmt', msg: '↻ {D} derece sağa dön', args: { D: num(15) } },
  { type: 'sh_turn_l', cat: 'hareket', shape: 'stmt', msg: '↺ {D} derece sola dön', args: { D: num(15) } },
  { type: 'sh_goto_xy', cat: 'hareket', shape: 'stmt', sep: true, msg: 'x: {X} y: {Y} konumuna git', args: { X: num(0), Y: num(0) } },
  { type: 'sh_goto', cat: 'hareket', shape: 'stmt', msg: '{T} konumuna git', args: { T: dyn('goto') } },
  { type: 'sh_glide_xy', cat: 'hareket', shape: 'stmt', msg: '{S} saniyede x: {X} y: {Y} konumuna kay', args: { S: num(1), X: num(0), Y: num(0) } },
  { type: 'sh_glide_to', cat: 'hareket', shape: 'stmt', msg: '{S} saniyede {T} konumuna kay', args: { S: num(1), T: dyn('goto') } },
  { type: 'sh_point', cat: 'hareket', shape: 'stmt', sep: true, msg: '{D} yönüne dön', args: { D: num(90) } },
  { type: 'sh_point_towards', cat: 'hareket', shape: 'stmt', msg: '{T} yönüne dön', args: { T: dyn('towards') } },
  { type: 'sh_change_x', cat: 'hareket', shape: 'stmt', sep: true, msg: 'x\'i {N} değiştir', args: { N: num(10) } },
  { type: 'sh_set_x', cat: 'hareket', shape: 'stmt', msg: 'x\'i {N} yap', args: { N: num(0) } },
  { type: 'sh_change_y', cat: 'hareket', shape: 'stmt', msg: 'y\'yi {N} değiştir', args: { N: num(10) } },
  { type: 'sh_set_y', cat: 'hareket', shape: 'stmt', msg: 'y\'yi {N} yap', args: { N: num(0) } },
  { type: 'sh_bounce', cat: 'hareket', shape: 'stmt', sep: true, msg: 'kenara değince sek', args: {} },
  { type: 'sh_rot_style', cat: 'hareket', shape: 'stmt', msg: 'dönme biçimi: {S}', args: { S: dd([['her yöne', 'all'], ['sağ-sol', 'lr'], ['dönme', 'none']]) } },
  { type: 'sh_xpos', cat: 'hareket', shape: 'val', sep: true, msg: 'x konumu', args: {} },
  { type: 'sh_ypos', cat: 'hareket', shape: 'val', msg: 'y konumu', args: {} },
  { type: 'sh_dir', cat: 'hareket', shape: 'val', msg: 'yön', args: {} },

  // ───── Görünüm ─────
  { type: 'sh_say_for', cat: 'gorunum', shape: 'stmt', msg: '{M} de {S} saniye', args: { M: txt('Merhaba!'), S: num(2) } },
  { type: 'sh_say', cat: 'gorunum', shape: 'stmt', msg: '{M} de', args: { M: txt('Merhaba!') } },
  { type: 'sh_think_for', cat: 'gorunum', shape: 'stmt', msg: '{M} diye düşün {S} saniye', args: { M: txt('Hmm...'), S: num(2) } },
  { type: 'sh_think', cat: 'gorunum', shape: 'stmt', msg: '{M} diye düşün', args: { M: txt('Hmm...') } },
  { type: 'sh_costume', cat: 'gorunum', shape: 'stmt', sep: true, msg: 'kostümü {C} yap', args: { C: dyn('costume') } },
  { type: 'sh_next_costume', cat: 'gorunum', shape: 'stmt', msg: 'sonraki kostüm', args: {} },
  { type: 'sh_backdrop', cat: 'gorunum', shape: 'stmt', msg: 'arka planı {B} yap', args: { B: dyn('backdrop') } },
  { type: 'sh_next_backdrop', cat: 'gorunum', shape: 'stmt', msg: 'sonraki arka plan', args: {} },
  { type: 'sh_change_size', cat: 'gorunum', shape: 'stmt', sep: true, msg: 'boyutu {N} değiştir', args: { N: num(10) } },
  { type: 'sh_set_size', cat: 'gorunum', shape: 'stmt', msg: 'boyutu % {N} yap', args: { N: num(100) } },
  { type: 'sh_change_effect', cat: 'gorunum', shape: 'stmt', sep: true, msg: '{E} efektini {N} değiştir', args: { E: dd(EFFECT_OPTS), N: num(25) } },
  { type: 'sh_set_effect', cat: 'gorunum', shape: 'stmt', msg: '{E} efektini {N} yap', args: { E: dd(EFFECT_OPTS), N: num(0) } },
  { type: 'sh_clear_effects', cat: 'gorunum', shape: 'stmt', msg: 'grafik efektlerini sıfırla', args: {} },
  { type: 'sh_show', cat: 'gorunum', shape: 'stmt', sep: true, msg: 'göster', args: {} },
  { type: 'sh_hide', cat: 'gorunum', shape: 'stmt', msg: 'gizle', args: {} },
  { type: 'sh_layer', cat: 'gorunum', shape: 'stmt', sep: true, msg: '{L} katmanına git', args: { L: dd([['en ön', 'front'], ['en arka', 'back']]) } },
  { type: 'sh_layer_by', cat: 'gorunum', shape: 'stmt', msg: '{N} katman {D} git', args: { N: num(1), D: dd([['öne', 'forward'], ['arkaya', 'backward']]) } },
  { type: 'sh_costume_info', cat: 'gorunum', shape: 'val', sep: true, msg: 'kostüm {P}', args: { P: dd([['numarası', 'number'], ['adı', 'name']]) } },
  { type: 'sh_backdrop_info', cat: 'gorunum', shape: 'val', msg: 'arka plan {P}', args: { P: dd([['numarası', 'number'], ['adı', 'name']]) } },
  { type: 'sh_size', cat: 'gorunum', shape: 'val', msg: 'boyut', args: {} },

  // ───── Ses ─────
  { type: 'sh_play_until', cat: 'ses', shape: 'stmt', msg: '{S} sesini bitene dek çal', args: { S: dyn('sound') } },
  { type: 'sh_play', cat: 'ses', shape: 'stmt', msg: '{S} sesini çal', args: { S: dyn('sound') } },
  { type: 'sh_stop_sounds', cat: 'ses', shape: 'stmt', msg: 'tüm sesleri durdur', args: {} },
  { type: 'sh_play_note', cat: 'ses', shape: 'stmt', sep: true, msg: '{NOTE} notasını {B} vuruş çal', args: { NOTE: dd(NOTE_OPTS), B: num(0.5) } },
  { type: 'sh_change_pitch', cat: 'ses', shape: 'stmt', sep: true, msg: 'perdeyi {N} değiştir', args: { N: num(10) } },
  { type: 'sh_set_pitch', cat: 'ses', shape: 'stmt', msg: 'perdeyi {N} yap', args: { N: num(0) } },
  { type: 'sh_clear_sfx', cat: 'ses', shape: 'stmt', msg: 'ses efektlerini sıfırla', args: {} },
  { type: 'sh_change_volume', cat: 'ses', shape: 'stmt', sep: true, msg: 'ses seviyesini {N} değiştir', args: { N: num(-10) } },
  { type: 'sh_set_volume', cat: 'ses', shape: 'stmt', msg: 'ses seviyesini % {N} yap', args: { N: num(100) } },
  { type: 'sh_volume', cat: 'ses', shape: 'val', msg: 'ses seviyesi', args: {} },

  // ───── Olaylar ─────
  { type: 'sh_when_flag', cat: 'olaylar', shape: 'hat', msg: '🏁 tıklanınca', args: {} },
  { type: 'sh_when_key', cat: 'olaylar', shape: 'hat', msg: '{K} tuşuna basılınca', args: { K: dd(KEY_OPTS, 'space') } },
  { type: 'sh_when_clicked', cat: 'olaylar', shape: 'hat', msg: 'bu sprite tıklanınca', args: {} },
  { type: 'sh_when_backdrop', cat: 'olaylar', shape: 'hat', msg: 'arka plan {B} olunca', args: { B: dyn('backdrop') } },
  { type: 'sh_when_timer', cat: 'olaylar', shape: 'hat', msg: 'zamanlayıcı > {N} olunca', args: { N: num(5) } },
  { type: 'sh_when_msg', cat: 'olaylar', shape: 'hat', msg: '{M} mesajını alınca', args: { M: dyn('message') } },
  { type: 'sh_broadcast', cat: 'olaylar', shape: 'stmt', sep: true, msg: '{M} mesajını yayınla', args: { M: dyn('message') } },
  { type: 'sh_broadcast_wait', cat: 'olaylar', shape: 'stmt', msg: '{M} mesajını yayınla ve bekle', args: { M: dyn('message') } },

  // ───── Kontrol ─────
  { type: 'sh_wait', cat: 'kontrol', shape: 'stmt', msg: '{S} saniye bekle', args: { S: num(1) } },
  { type: 'sh_repeat', cat: 'kontrol', shape: 'c', sep: true, msg: '{N} kere tekrarla', args: { N: num(10) } },
  { type: 'sh_forever', cat: 'kontrol', shape: 'ccap', msg: 'sonsuza kadar', args: {} },
  { type: 'sh_if', cat: 'kontrol', shape: 'c', sep: true, msg: 'eğer {C} ise', args: { C: BOOL } },
  { type: 'sh_if_else', cat: 'kontrol', shape: 'ifelse', msg: 'eğer {C} ise', args: { C: BOOL } },
  { type: 'sh_wait_until', cat: 'kontrol', shape: 'stmt', msg: '{C} olana dek bekle', args: { C: BOOL } },
  { type: 'sh_repeat_until', cat: 'kontrol', shape: 'c', msg: '{C} olana dek tekrarla', args: { C: BOOL } },
  { type: 'sh_stop', cat: 'kontrol', shape: 'cap', sep: true, msg: '{W} dur', args: { W: dd([['hepsini', 'all'], ['bu betiği', 'this'], ['sprite\'ın diğer betiklerini', 'others']]) } },
  { type: 'sh_when_clone', cat: 'kontrol', shape: 'hat', sep: true, msg: 'klon olarak başlayınca', args: {} },
  { type: 'sh_create_clone', cat: 'kontrol', shape: 'stmt', msg: '{T} klonunu oluştur', args: { T: dyn('clone') } },
  { type: 'sh_delete_clone', cat: 'kontrol', shape: 'cap', msg: 'bu klonu sil', args: {} },

  // ───── Algılama ─────
  { type: 'sh_touching', cat: 'algilama', shape: 'bool', msg: '{T} değiyor mu?', args: { T: dyn('touch') } },
  { type: 'sh_distance', cat: 'algilama', shape: 'val', msg: '{T} uzaklığı', args: { T: dyn('towards') } },
  { type: 'sh_ask', cat: 'algilama', shape: 'stmt', sep: true, msg: '{Q} diye sor ve bekle', args: { Q: txt('Adın ne?') } },
  { type: 'sh_answer', cat: 'algilama', shape: 'val', msg: 'cevap', args: {} },
  { type: 'sh_key_pressed', cat: 'algilama', shape: 'bool', sep: true, msg: '{K} tuşuna basılı mı?', args: { K: dd(KEY_OPTS, 'space') } },
  { type: 'sh_mouse_down', cat: 'algilama', shape: 'bool', msg: 'fare basılı mı?', args: {} },
  { type: 'sh_mouse_x', cat: 'algilama', shape: 'val', msg: 'fare x', args: {} },
  { type: 'sh_mouse_y', cat: 'algilama', shape: 'val', msg: 'fare y', args: {} },
  { type: 'sh_timer', cat: 'algilama', shape: 'val', sep: true, msg: 'zamanlayıcı', args: {} },
  { type: 'sh_reset_timer', cat: 'algilama', shape: 'stmt', msg: 'zamanlayıcıyı sıfırla', args: {} },
  { type: 'sh_of', cat: 'algilama', shape: 'val', sep: true, msg: '{P} / {T}', args: { P: dd(SENSE_PROPS), T: dyn('ofTarget') } },
  { type: 'sh_current', cat: 'algilama', shape: 'val', msg: 'şu anki {U}', args: { U: dd(CURRENT_OPTS) } },

  // ───── İşlemler ─────
  { type: 'sh_add', cat: 'islemler', shape: 'val', msg: '{A} + {B}', args: { A: num(0), B: num(0) } },
  { type: 'sh_sub', cat: 'islemler', shape: 'val', msg: '{A} − {B}', args: { A: num(0), B: num(0) } },
  { type: 'sh_mul', cat: 'islemler', shape: 'val', msg: '{A} × {B}', args: { A: num(0), B: num(0) } },
  { type: 'sh_div', cat: 'islemler', shape: 'val', msg: '{A} ÷ {B}', args: { A: num(0), B: num(1) } },
  { type: 'sh_random', cat: 'islemler', shape: 'val', sep: true, msg: '{A} ile {B} arasında rastgele sayı', args: { A: num(1), B: num(10) } },
  { type: 'sh_gt', cat: 'islemler', shape: 'bool', sep: true, msg: '{A} > {B}', args: { A: txt(''), B: txt('50') } },
  { type: 'sh_lt', cat: 'islemler', shape: 'bool', msg: '{A} < {B}', args: { A: txt(''), B: txt('50') } },
  { type: 'sh_eq', cat: 'islemler', shape: 'bool', msg: '{A} = {B}', args: { A: txt(''), B: txt('50') } },
  { type: 'sh_and', cat: 'islemler', shape: 'bool', sep: true, msg: '{A} ve {B}', args: { A: BOOL, B: BOOL } },
  { type: 'sh_or', cat: 'islemler', shape: 'bool', msg: '{A} veya {B}', args: { A: BOOL, B: BOOL } },
  { type: 'sh_not', cat: 'islemler', shape: 'bool', msg: '{A} değil', args: { A: BOOL } },
  { type: 'sh_join', cat: 'islemler', shape: 'val', sep: true, msg: '{A} {B} birleştir', args: { A: txt('elma'), B: txt('muz') } },
  { type: 'sh_letter', cat: 'islemler', shape: 'val', msg: '{N}. harf: {S}', args: { N: num(1), S: txt('elma') } },
  { type: 'sh_length', cat: 'islemler', shape: 'val', msg: '{S} uzunluğu', args: { S: txt('elma') } },
  { type: 'sh_contains', cat: 'islemler', shape: 'bool', msg: '{A} içinde {B} var mı?', args: { A: txt('elma'), B: txt('e') } },
  { type: 'sh_mod', cat: 'islemler', shape: 'val', sep: true, msg: '{A} bölü {B} kalanı', args: { A: num(0), B: num(2) } },
  { type: 'sh_round', cat: 'islemler', shape: 'val', msg: '{N} yuvarla', args: { N: num(0) } },
  { type: 'sh_math', cat: 'islemler', shape: 'val', msg: '{OP} / {N}', args: { OP: dd(MATH_OPS), N: num(9) } },

  // ───── Değişkenler ve listeler (araç kutusunda özel liste: değişken/liste başına bloklar) ─────
  { type: 'sh_var_set', cat: 'degiskenler', shape: 'stmt', msg: '{V} = {N} yap', args: { V: VAR, N: txt('0') } },
  { type: 'sh_var_change', cat: 'degiskenler', shape: 'stmt', msg: '{V} değişkenini {N} kadar değiştir', args: { V: VAR, N: num(1) } },
  { type: 'sh_var_show', cat: 'degiskenler', shape: 'stmt', msg: '{V} değişkenini göster', args: { V: VAR } },
  { type: 'sh_var_hide', cat: 'degiskenler', shape: 'stmt', msg: '{V} değişkenini gizle', args: { V: VAR } },
  { type: 'sh_list_add', cat: 'degiskenler', shape: 'stmt', msg: '{I} öğesini {L} listesine ekle', args: { I: txt('şey'), L: LIST } },
  { type: 'sh_list_del', cat: 'degiskenler', shape: 'stmt', msg: '{N}. öğeyi {L} listesinden sil', args: { N: num(1), L: LIST } },
  { type: 'sh_list_del_all', cat: 'degiskenler', shape: 'stmt', msg: '{L} listesinin tüm öğelerini sil', args: { L: LIST } },
  { type: 'sh_list_insert', cat: 'degiskenler', shape: 'stmt', msg: '{I} öğesini {L} listesinin {N}. sırasına ekle', args: { I: txt('şey'), N: num(1), L: LIST } },
  { type: 'sh_list_replace', cat: 'degiskenler', shape: 'stmt', msg: '{L} listesinin {N}. öğesini {I} yap', args: { L: LIST, N: num(1), I: txt('şey') } },
  { type: 'sh_list_item', cat: 'degiskenler', shape: 'val', msg: '{L} listesinin {N}. öğesi', args: { L: LIST, N: num(1) } },
  { type: 'sh_list_index', cat: 'degiskenler', shape: 'val', msg: '{I} öğesinin {L} listesindeki sırası', args: { I: txt('şey'), L: LIST } },
  { type: 'sh_list_len', cat: 'degiskenler', shape: 'val', msg: '{L} listesinin uzunluğu', args: { L: LIST } },
  { type: 'sh_list_has', cat: 'degiskenler', shape: 'bool', msg: '{L} listesinde {I} var mı?', args: { L: LIST, I: txt('şey') } },
  { type: 'sh_list_show', cat: 'degiskenler', shape: 'stmt', msg: '{L} listesini göster', args: { L: LIST } },
  { type: 'sh_list_hide', cat: 'degiskenler', shape: 'stmt', msg: '{L} listesini gizle', args: { L: LIST } },
  { type: 'sh_list_ref', cat: 'degiskenler', shape: 'val', msg: '{L}', args: { L: LIST } },

  // ───── Kalem ─────
  { type: 'sh_pen_down', cat: 'kalem', shape: 'stmt', msg: 'kalemi indir', args: {} },
  { type: 'sh_pen_up', cat: 'kalem', shape: 'stmt', msg: 'kalemi kaldır', args: {} },
  { type: 'sh_pen_clear', cat: 'kalem', shape: 'stmt', msg: 'çizimleri temizle', args: {} },
  { type: 'sh_pen_stamp', cat: 'kalem', shape: 'stmt', msg: 'damga bas', args: {} },
  { type: 'sh_pen_color', cat: 'kalem', shape: 'stmt', sep: true, msg: 'kalem rengini {C} yap', args: { C: dd(COLOR_OPTS) } },
  { type: 'sh_pen_set_size', cat: 'kalem', shape: 'stmt', msg: 'kalem kalınlığını {N} yap', args: { N: num(2) } },
  { type: 'sh_pen_change_size', cat: 'kalem', shape: 'stmt', msg: 'kalem kalınlığını {N} değiştir', args: { N: num(1) } },
]

export const BLOCK_BY_TYPE: Readonly<Record<string, BlockDef>> = Object.fromEntries(BLOCKS.map((b) => [b.type, b]))

/** Özel (kataloğun dışındaki) blok adları. */
export const VAR_GET = 'variables_get'
export const ARG_BLOCK = 'sh_arg'
export const PROC_DEF_PREFIX = 'sh_def_'
export const PROC_CALL_PREFIX = 'sh_call_'
/** `allowedBlocks` içinde "Bloklarım kategorisi açık" demek. */
export const PROC_PSEUDO = 'sh_proc'

export const HAT_TYPES: readonly string[] = BLOCKS.filter((b) => b.shape === 'hat').map((b) => b.type)

/** Her kategorideki blok türleri (araç kutusu sırası). */
const byCat = (c: CatKey): string[] => BLOCKS.filter((b) => b.cat === c).map((b) => b.type)
export const BLOCK_GROUPS: Readonly<Record<string, string[]>> = {
  hareket: byCat('hareket'),
  gorunum: byCat('gorunum'),
  ses: byCat('ses'),
  olaylar: byCat('olaylar'),
  kontrol: byCat('kontrol'),
  algilama: byCat('algilama'),
  islemler: byCat('islemler'),
  degiskenler: [VAR_GET, ...byCat('degiskenler')],
  bloklarim: [PROC_PSEUDO],
  kalem: byCat('kalem'),
}
export const ALL_BLOCK_TYPES: readonly string[] = [...BLOCKS.map((b) => b.type), VAR_GET, PROC_PSEUDO]

/** `allowedBlocks` yazarken kısaltma: tür adları ve grup adları ('hareket', 'olaylar', …). */
export function allow(...items: string[]): string[] {
  const out = new Set<string>()
  for (const it of items) for (const t of BLOCK_GROUPS[it] ?? [it]) out.add(t)
  return [...out]
}

// ───────── Blockly JSON ─────────
const INPUT_NAMES = (def: BlockDef): string[] => Object.keys(def.args)

export interface BlockJson {
  type: string
  style: string
  message0: string
  args0: Record<string, unknown>[]
  message1?: string
  args1?: Record<string, unknown>[]
  message2?: string
  args2?: Record<string, unknown>[]
  message3?: string
  args3?: Record<string, unknown>[]
  previousStatement?: null
  nextStatement?: null
  output?: string | null
  tooltip: string
  inputsInline: boolean
}

export const styleName = (c: CatKey): string => `sh_${c}`

function argJson(name: string, a: Arg, locale: Locale): Record<string, unknown> {
  switch (a.t) {
    case 'num': case 'txt': case 'any': return { type: 'input_value', name }
    case 'bool': return { type: 'input_value', name, check: 'Boolean' }
    case 'dd': return { type: 'field_dropdown', name, options: locale === 'en' ? a.opts.map(([l, v]) => [optLabel(l, locale), v]) : a.opts }
    case 'dyn': return { type: 'field_sh_dyn', name, kind: a.kind }
    case 'var': return { type: 'field_variable', name, variable: '', variableTypes: [''], defaultType: '' }
    case 'list': return { type: 'field_variable', name, variable: '', variableTypes: ['List'], defaultType: 'List' }
  }
}

export function blockJson(def: BlockDef, locale: Locale = 'tr'): BlockJson {
  const names = INPUT_NAMES(def)
  const args0: Record<string, unknown>[] = []
  const msg = blockMsg(def, locale)
  // İletideki yer tutucu sırası dile göre değişebilir; %n numarası ileti içindeki sıraya göre verilir.
  // Türkçede eski sıra (args sırası) korunur.
  const order = locale === 'tr' ? names : [...msg.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((n) => names.includes(n))
  for (const n of names) if (!order.includes(n)) order.push(n)
  let message0 = msg
  order.forEach((n, i) => {
    message0 = message0.replace(`{${n}}`, `%${i + 1}`)
    args0.push(argJson(n, def.args[n], locale))
  })
  const j: BlockJson = { type: def.type, style: styleName(def.cat), message0, args0, tooltip: msg.replace(/\{(\w+)\}/g, '…'), inputsInline: true }
  switch (def.shape) {
    case 'hat': j.nextStatement = null; break
    case 'stmt': j.previousStatement = null; j.nextStatement = null; break
    case 'cap': j.previousStatement = null; break
    case 'c': j.previousStatement = null; j.nextStatement = null; j.message1 = '%1'; j.args1 = [{ type: 'input_statement', name: 'DO' }]; break
    case 'ccap': j.previousStatement = null; j.message1 = '%1'; j.args1 = [{ type: 'input_statement', name: 'DO' }]; break
    case 'ifelse':
      j.previousStatement = null; j.nextStatement = null
      j.message1 = '%1'; j.args1 = [{ type: 'input_statement', name: 'DO' }]
      j.message2 = locale === 'en' ? 'else' : 'değilse'; j.args2 = []
      j.message3 = '%1'; j.args3 = [{ type: 'input_statement', name: 'ELSE' }]
      break
    case 'val': j.output = null; break
    case 'bool': j.output = 'Boolean'; break
  }
  return j
}
export const BLOCK_JSON: BlockJson[] = BLOCKS.map((d) => blockJson(d))
/** Belirli bir dil için tüm blok tanımları. */
export const blockJsonFor = (locale: Locale): BlockJson[] => (locale === 'tr' ? BLOCK_JSON : BLOCKS.map((d) => blockJson(d, locale)))

// ───────── Araç kutusu ─────────
export interface Shadow { type: string; fields?: Record<string, unknown> }
export function shadowOf(a: Arg, locale: Locale = 'tr'): Shadow | null {
  if (a.t === 'num') return { type: 'math_number', fields: { NUM: a.v } }
  if (a.t === 'txt') return { type: 'text', fields: { TEXT: locale === 'en' ? SHADOW_TEXT_EN[a.v] ?? a.v : a.v } }
  return null
}

export function flyoutEntry(def: BlockDef, locale: Locale = 'tr'): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}
  for (const [n, a] of Object.entries(def.args)) { const s = shadowOf(a, locale); if (s) inputs[n] = { shadow: s } }
  const e: Record<string, unknown> = { kind: 'block', type: def.type }
  if (Object.keys(inputs).length) e.inputs = inputs
  return e
}

export const VARS_CALLBACK = 'SAHNE_DEGISKENLER'
export const PROCS_CALLBACK = 'SAHNE_BLOKLARIM'

/** Blockly araç kutusu JSON'u. `allowed` verilmezse hepsi. Değişkenler ve Bloklarım kategorileri özeldir (özel liste). */
export function toolboxJson(allowed?: readonly string[], locale: Locale = 'tr') {
  const ok = allowed ? new Set(allowed) : null
  const contents: Record<string, unknown>[] = []
  for (const c of CATEGORIES) {
    const base = { kind: 'category', name: categoryLabel(c, locale), categorystyle: `sh_cat_${c.key}`, cssConfig: { icon: `shb-ic-${c.key}` } }
    if (c.key === 'degiskenler') {
      if (ok && !BLOCK_GROUPS.degiskenler.some((t) => ok.has(t))) continue
      contents.push({ ...base, custom: VARS_CALLBACK })
      continue
    }
    if (c.key === 'bloklarim') {
      if (ok && !ok.has(PROC_PSEUDO)) continue
      contents.push({ ...base, custom: PROCS_CALLBACK })
      continue
    }
    const items: Record<string, unknown>[] = []
    for (const b of BLOCKS) {
      if (b.cat !== c.key || (ok && !ok.has(b.type))) continue
      if (b.sep && items.length) items.push({ kind: 'sep', gap: 22 })
      items.push(flyoutEntry(b, locale))
    }
    if (!items.length) continue
    contents.push({ ...base, contents: items })
  }
  return { kind: 'categoryToolbox', contents }
}

/** Bir blok durumunda (program) kullanılan tür adları (iç içe girişler ve `next` zinciri dahil, gölgeler hariç). */
export function typesUsed(state: { blocks?: { blocks?: { type: string }[] } } | undefined): Set<string> {
  const out = new Set<string>()
  const walk = (n: { type: string; inputs?: Record<string, { block?: unknown; shadow?: unknown }>; next?: { block?: unknown } } | undefined): void => {
    for (let b = n; b; b = b.next?.block as typeof n) {
      out.add(b.type)
      for (const i of Object.values(b.inputs ?? {})) walk(i.block as typeof n)
    }
  }
  for (const t of (state?.blocks?.blocks ?? []) as Parameters<typeof walk>[0][]) walk(t)
  return out
}
