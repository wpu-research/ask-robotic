// Oyun Atölyesi — İngilizce görünüm metinleri (SAF VERİ). Türkçe kaynaklar yerinde kalır; burada yalnız İngilizce karşılıklar var.
// Blok türleri, alan değerleri, kod şablonları ve kayıt biçimi DEĞİŞMEZ: yalnız görünen metin.
import type { Locale } from '@/i18n'
import type { CatKey } from './blocks'

export type { Locale }

/** Blok iletisi ({AD} yer tutucuları Türkçedekilerle aynı) ve ipucu. */
export const BLOCK_EN: Readonly<Record<string, { msg: string; tip: string }>> = {
  // Oyun
  oyun_baslangic: { msg: 'when game starts', tip: 'Runs once when the game first starts.' },
  oyun_her_kare: { msg: 'every frame', tip: 'Runs 60 times every second.' },
  oyun_her_n_ms: { msg: 'every {MS} ms', tip: 'Runs again and again after this many milliseconds.' },
  oyun_can_bitince: { msg: 'when lives run out', tip: 'Runs when lives reach 0. Without this block the game just ends.' },
  oyun_sure_bitince: { msg: 'when time runs out', tip: 'Runs when the countdown reaches 0. Without this block the game just ends.' },
  oyun_skor_ayarla: { msg: 'set score to {N}', tip: 'Sets the score to your number and shows it on screen.' },
  oyun_skor_degistir: { msg: 'change score by {N}', tip: 'Adds to the score (a minus number takes away).' },
  oyun_skor: { msg: 'score', tip: 'The score right now.' },
  oyun_can_ayarla: { msg: 'set lives to {N}', tip: 'Sets how many lives you have and shows the hearts.' },
  oyun_can_degistir: { msg: 'change lives by {N}', tip: 'Adds to lives (a minus number takes away). At 0 lives the game ends.' },
  oyun_can: { msg: 'lives', tip: 'How many lives are left.' },
  oyun_sure_baslat: { msg: 'start countdown from {N} seconds', tip: 'When time is up, the "when time runs out" block runs (or the game ends).' },
  oyun_sure: { msg: 'time left (s)', tip: 'Seconds left on the countdown.' },
  oyun_zaman: { msg: 'time passed (s)', tip: 'Seconds since the game started.' },
  oyun_bitir: { msg: 'end game: {R}', tip: 'Shows the game over screen.' },
  oyun_mesaj: { msg: 'show {T} on screen for {N} seconds', tip: 'Shows a short message in the middle of the screen.' },
  oyun_sarsinti: { msg: 'shake screen for {N} ms', tip: 'A screen shake effect.' },
  oyun_patlama: { msg: '{C} explosion at x {X} y {Y}', tip: 'Throws out colorful sparkles.' },
  // Sprite
  sprite_yeni: { msg: 'new {IMG} sprite, kind {K}', tip: 'Makes a new sprite in the middle of the screen. Put it in a variable to use it later.' },
  oyun_bu_sprite: { msg: 'this sprite', tip: 'The sprite of the event (the first sprite in a collision). Outside events: the newest sprite.' },
  oyun_diger_sprite: { msg: 'other sprite', tip: 'The other sprite that was hit in a collision.' },
  sprite_konum: { msg: 'move {S} to x {X} y {Y}', tip: 'Moves the sprite to a spot on the screen (the screen is 160 x 120).' },
  sprite_resim: { msg: 'set {S} picture to {IMG}', tip: 'Changes how the sprite looks.' },
  sprite_sil: { msg: 'delete sprite {S}', tip: 'Removes the sprite from the game.' },
  sprite_patlat: { msg: 'make {S} explode', tip: 'Deletes the sprite with an explosion effect.' },
  sprite_omur: { msg: 'make {S} vanish after {N} ms', tip: 'Gives the sprite a lifetime; it is deleted when time is up.' },
  sprite_bayrak: { msg: '{S} {F}: {ON}', tip: 'Turns a sprite behaviour setting on or off.' },
  sprite_bak: { msg: '{S} faces {D}', tip: 'Flips the picture left or right.' },
  sprite_katman: { msg: 'set {S} layer to {N}', tip: 'Bigger layer numbers are drawn in front.' },
  sprite_konus: { msg: '{S} says {T} for {N} seconds', tip: 'Shows a speech bubble above the sprite.' },
  sprite_takip: { msg: '{S} follows sprite {O} at speed {N}', tip: 'The sprite keeps moving toward the target.' },
  sprite_takip_birak: { msg: '{S} stops following', tip: 'Stops following.' },
  sprite_ozellik_ayarla: { msg: 'set {NAME} of {S} to {V}', tip: 'Stores your own value (number or text) on the sprite.' },
  sprite_ozellik: { msg: '{NAME} of {S}', tip: 'Reads a value stored on the sprite (0 if there is none).' },
  sprite_oku: { msg: '{S} {P}', tip: 'Reads a number about the sprite.' },
  sprite_cakisiyor: { msg: 'is {A} touching {B}?', tip: 'Are the two sprites on top of each other?' },
  sprite_dokunuyor: { msg: 'is {S} touching {D}?', tip: 'Is it touching a wall tile or (if it stays on screen) the screen edge? Good for "on the ground?" in platform games.' },
  sprite_mesafe: { msg: 'distance from {A} to {B}', tip: 'How many pixels apart the centers of the two sprites are.' },
  sprite_sayisi: { msg: 'number of {K} sprites', tip: 'How many sprites of that kind are there?' },
  sprite_hepsini_sil: { msg: 'delete all {K} sprites', tip: 'Deletes every sprite of the chosen kind.' },
  sprite_her_biri: { msg: 'for each {K} sprite', tip: 'The blocks inside run for every sprite of that kind; "this sprite" becomes each one in turn.' },
  sprite_carpisinca: { msg: 'when a {KA} sprite hits a {KB} sprite', tip: 'Runs once when they overlap. "this sprite" is the first, "other sprite" is the second.' },
  sprite_olusunca: { msg: 'when a {K} sprite is created', tip: 'Runs when a new sprite appears; "this sprite" is that sprite.' },
  sprite_silinince: { msg: 'when a {K} sprite is deleted', tip: 'Runs when a sprite is deleted.' },
  // Hareket
  hareket_hiz: { msg: 'set {S} speed x {VX} y {VY}', tip: 'How many pixels it moves every second. A minus number goes the other way.' },
  hareket_ivme: { msg: 'set {S} acceleration x {AX} y {AY}', tip: 'Speed grows over time. Pulling downward works like gravity.' },
  hareket_yone: { msg: '{S} moves in direction {D} degrees at speed {N}', tip: '0 = up, 90 = right, 180 = down, 270 = left.' },
  hareket_dur: { msg: '{S} stops', tip: 'Sets speed and acceleration to zero.' },
  hareket_ters: { msg: 'reverse {S} {A} speed', tip: 'Changes direction (bounce).' },
  hareket_kaydir: { msg: 'move {S} by x {DX} y {DY}', tip: 'Adds to its position (walls are ignored).' },
  // Denetleyici
  den_dugme: { msg: 'when {B} button is {E}', tip: 'Arrow keys / WASD / A (space, Z) / B (X, Enter) or the on-screen game buttons.' },
  den_basili: { msg: 'is {B} button pressed?', tip: 'Is the button being held down right now?' },
  den_yon: { msg: '{A} direction', tip: 'Horizontal: left -1, right +1. Vertical: up -1, down +1. 0 if nothing is pressed.' },
  den_hareket: { msg: '{S} moves {M} with player keys, speed {N}', tip: 'You drive the sprite with the arrow keys (and the on-screen arrows).' },
  den_hareket_birak: { msg: '{S} stops moving with keys', tip: 'Turns off key control.' },
  // Sahne / Harita
  sahne_renk: { msg: 'background color {C}', tip: 'The color behind the stage.' },
  sahne_dosemesi: { msg: 'tile background with picture {IMG}', tip: 'Repeats a small picture all over the background.' },
  harita_yukle: { msg: 'load map: {M}', tip: 'Puts the map you drew in the Map tab into the game.' },
  harita_karo_koy: { msg: 'set tile at column {C} row {R} to {IMG}', tip: 'Changes one tile of the map (columns and rows start at 0).' },
  harita_karo_sil: { msg: 'clear tile at column {C} row {R}', tip: 'Removes the tile.' },
  harita_karo: { msg: 'picture of tile at column {C} row {R}', tip: 'The picture name of the tile; empty text if there is none.' },
  harita_duvar_mu: { msg: 'is column {C} row {R} a wall?', tip: 'Is that tile a wall?' },
  harita_duvar: { msg: '{IMG} tiles are walls: {ON}', tip: 'Sprites cannot go into wall tiles.' },
  harita_sprite_yap: { msg: 'turn all {IMG} tiles into {K} sprites', tip: 'Replaces marked tiles on the map with sprites (to place food or enemies). The "is created" event runs for each one.' },
  harita_konumla: { msg: 'put sprite {S} on tile column {C} row {R}', tip: 'Places the sprite in the middle of the tile.' },
  sprite_karo: { msg: '{S} tile {A}', tip: 'The column or row of the tile the sprite is on.' },
  harita_say: { msg: 'number of {IMG} tiles on map', tip: 'How many of that tile are on the map?' },
  harita_boyut: { msg: 'map {A} (tiles)', tip: 'How many tiles the map has.' },
  kamera_takip: { msg: 'camera follows sprite {S}', tip: 'If the map is bigger than the screen, the camera scrolls.' },
  kamera_sabit: { msg: 'camera stays still', tip: 'Stops following.' },
  harita_karoya_dokununca: { msg: 'when a {K} sprite touches tile {IMG}', tip: 'Runs once when it touches the tile. Use the "event tile" blocks to find where.' },
  harita_olay_karo: { msg: 'event tile {A}', tip: 'Inside "touches tile": where the touched tile is.' },
  // Ses
  ses_bip: { msg: 'beep {F} Hz for {MS} ms', tip: 'A simple sound (200 - 2000 Hz sounds good).' },
  ses_nota: { msg: 'play note {NOTE} for {MS} ms', tip: 'Plays a music note.' },
  ses_melodi: { msg: 'play melody {M}', tip: 'Short ready-made tunes.' },
}

/** Açılır liste etiketleri (Türkçe etiket → İngilizce). Değerler değişmez. */
export const OPTION_EN: Readonly<Record<string, string>> = {
  'yukarı ↑': 'up ↑', 'aşağı ↓': 'down ↓', 'sol ←': 'left ←', 'sağ →': 'right →',
  evet: 'yes', hayır: 'no',
  zafer: 'victory', kayıp: 'lose', zıplama: 'jump', puan: 'point', patlama: 'boom', güç: 'power up', lazer: 'laser', başlangıç: 'start',
  'x konumu': 'x position', 'y konumu': 'y position', 'x hızı': 'x speed', 'y hızı': 'y speed', genişliği: 'width', yüksekliği: 'height', 'yönü (derece)': 'direction (degrees)', 'kalan ömrü (ms)': 'time left to live (ms)',
  'dünyadan çıkınca silinsin': 'delete when it leaves the world', 'ekranda kalsın': 'stay on screen', 'duvar/kenara çarpınca sekmeli': 'bounce off walls/edges', 'duvarlardan geçsin': 'go through walls', 'gizli olsun': 'hidden',
  kazandın: 'you win', kaybettin: 'you lose',
  sağa: 'right', sola: 'left',
  'alttan bir duvara': 'a wall below', 'üstten bir duvara': 'a wall above', 'soldan bir duvara': 'a wall on the left', 'sağdan bir duvara': 'a wall on the right',
  'x (yatay)': 'x (sideways)', 'y (dikey)': 'y (up-down)',
  basılınca: 'pressed', bırakılınca: 'released',
  yatay: 'horizontal', dikey: 'vertical',
  'dört yöne': 'in 4 directions', 'sağa-sola': 'left-right', 'yukarı-aşağı': 'up-down',
  sütunu: 'column', satırı: 'row',
  hepsi: 'any',
}

export const CATEGORY_EN: Readonly<Record<CatKey, string>> = {
  sprite: 'Sprite', hareket: 'Motion', denetleyici: 'Controller', oyun: 'Game', sahne: 'Stage / Map', ses: 'Sound',
  mantik: 'Logic', dongu: 'Loops', degisken: 'Variables', matematik: 'Math', metin: 'Text', fonksiyon: 'Functions',
}

/** Sprite türlerinin görünen adları (kimlikler değişmez). */
export const KIND_EN: Readonly<Record<string, string>> = {
  oyuncu: 'Player', dusman: 'Enemy', yiyecek: 'Food', mermi: 'Bullet', nesne: 'Object', bonus: 'Bonus', engel: 'Obstacle', hedef: 'Goal',
}

/** Palet renk adları (sıra = palet sırası). */
export const PALETTE_NAME_EN: readonly string[] = [
  'night', 'brown', 'red', 'orange', 'yellow', 'light green', 'green', 'purple',
  'navy', 'blue', 'sky', 'pink', 'white', 'light gray', 'gray', 'dark gray',
]

/** Galeri resim adları (kimlik → İngilizce). */
export const ASSET_NAME_EN: Readonly<Record<string, string>> = {
  'karo-cimen': 'Grass', 'karo-toprak': 'Dirt', 'karo-cimenli-toprak': 'Grassy dirt', 'karo-tas': 'Stone wall', 'karo-tugla': 'Brick wall',
  'karo-su': 'Water', 'karo-kum': 'Sand', 'karo-agac': 'Tree', 'karo-lav': 'Lava', 'karo-zemin': 'Floor', 'karo-mavi-duvar': 'Blue wall',
  'karo-platform': 'Platform', 'karo-cicek': 'Flower', 'karo-diken': 'Spikes',
  'nesne-lazer': 'Laser', 'nesne-yildiz': 'Star', 'nesne-kalp': 'Heart', 'nesne-altin': 'Gold', 'nesne-anahtar': 'Key', 'nesne-elmas': 'Diamond',
  'nesne-bomba': 'Bomb', 'nesne-balon': 'Balloon', 'nesne-top': 'Ball', 'nesne-raket': 'Paddle', 'nesne-tugla': 'Brick', 'nesne-kapi': 'Door',
  'nesne-sandik': 'Chest', 'nesne-patlama': 'Explosion', 'nesne-tugla-sari': 'Yellow brick', 'nesne-tugla-mavi': 'Blue brick',
  'nesne-balon-mavi': 'Blue balloon', 'nesne-balon-sari': 'Yellow balloon', 'nesne-yilan-govde': 'Snake body',
  'yiyecek-elma': 'Apple', 'yiyecek-portakal': 'Orange', 'yiyecek-kiraz': 'Cherry', 'yiyecek-pizza': 'Pizza', 'yiyecek-dondurma': 'Ice cream',
  'yiyecek-kurabiye': 'Cookie', 'yiyecek-mantar': 'Mushroom', 'yiyecek-karpuz': 'Watermelon', 'yiyecek-mini-elma': 'Small apple',
  'dusman-balcik': 'Slime', 'dusman-hayalet': 'Ghost', 'dusman-yarasa': 'Bat', 'dusman-uzayli': 'Alien', 'dusman-ufo': 'UFO',
  'dusman-orumcek': 'Spider', 'dusman-kaktus': 'Cactus', 'dusman-kafatasi': 'Skull',
  'oyuncu-kedi': 'Cat', 'oyuncu-robot': 'Robot', 'oyuncu-astronot': 'Astronaut', 'oyuncu-ninja': 'Ninja', 'oyuncu-kahraman': 'Hero',
  'oyuncu-gemi': 'Spaceship', 'oyuncu-araba': 'Car', 'oyuncu-yilan-bas': 'Snake head', 'oyuncu-mini-kedi': 'Mini cat', 'oyuncu-mini-robot': 'Mini robot',
}

/** Oyun ekranındaki (piksel yazı) metinler. */
export const SCREEN_EN: Readonly<Record<string, string>> = {
  'KAZANDIN!': 'YOU WIN!', 'OYUN BİTTİ': 'GAME OVER', 'CAN BİTTİ': 'NO LIVES LEFT', 'SÜRE BİTTİ': 'TIME IS UP',
  SKOR: 'SCORE', DURAKLATILDI: 'PAUSED', 'A: TEKRAR': 'A: AGAIN',
}

/** Yorumlayıcı/motor hata iletileri (çalışma zamanı Türkçe üretir; gösterirken çevrilir). */
const ERROR_EN: [RegExp, string | ((...m: string[]) => string)][] = [
  [/^Olaylar çok iç içe girdi \(sonsuz tekrar olabilir\)\.$/, 'Too many events inside each other (it may repeat forever).'],
  [/^Çok fazla sprite var \(en çok 500\)\. Kullanılmayanları silmeyi unutma\.$/, 'Too many sprites (500 at most). Remember to delete the ones you don\'t use.'],
  [/^Fonksiyon çok derin iç içe çağrıldı \(kendini sonsuza kadar çağırıyor olabilir\)\.$/, 'A function was called too deeply (it may be calling itself forever).'],
  [/^Programın çok uzun sürdü: bir döngü hiç bitmiyor olabilir\. Döngüye bir bitiş koşulu ekle\.$/, 'Your program took too long: a loop may never end. Give the loop a way to stop.'],
  [/^Programın çok yavaş çalıştı: sonsuz döngü olabilir\.$/, 'Your program ran too slowly: there may be a never-ending loop.'],
  [/^Burada bir sprite gerekiyor ama değişken boş\. Önce "yeni sprite" ile bir sprite oluştur\.$/, 'A sprite is needed here but the variable is empty. First make one with "new sprite".'],
  [/^Henüz hiç sprite yok\. Önce "yeni sprite" bloğuyla bir sprite oluştur\.$/, 'There are no sprites yet. First make one with the "new sprite" block.'],
  [/^Burada bir sprite gerekiyor\.$/, 'A sprite is needed here.'],
  [/^'(.*)' adlı resim bulunamadı\. Resim sekmesinden ekleyebilirsin\.$/, (_m, id) => `Picture '${id === '(boş)' ? '(empty)' : id}' was not found. You can add it in the Pictures tab.`],
  [/^Önce "haritayı yükle" bloğuyla bir harita yüklemelisin\.$/, 'First load a map with the "load map" block.'],
  [/^Bir sprite en çok 30 özellik taşıyabilir\.$/, 'A sprite can hold at most 30 values.'],
  [/^'(.*)' adlı harita yok\. Harita sekmesinden çizebilirsin\.$/, (_m, id) => `There is no map called '${id}'. You can draw it in the Map tab.`],
  [/^'(.*)' adlı fonksiyon tanımlı değil\.$/, (_m, n) => `There is no function called '${n}'.`],
  [/^"diğer sprite" yalnızca çarpışma olayının içinde kullanılabilir\.$/, '"other sprite" only works inside a collision event.'],
  [/^"olay karosu" yalnızca "karosuna dokununca" olayının içinde kullanılabilir\.$/, '"event tile" only works inside a "touches tile" event.'],
  [/^Program hata verdi\.$/, 'The program has an error.'],
]

/** Türkçe hata iletisini dile göre gösterir; bilinmeyen ileti olduğu gibi kalır. */
export function oyunErrorText(msg: string, locale: Locale): string {
  if (locale !== 'en') return msg
  for (const [re, en] of ERROR_EN) {
    const m = msg.match(re)
    if (m) return typeof en === 'string' ? en : en(...m)
  }
  return msg
}

/** Blockly'nin hazır İngilizce iletilerinde çocuklar için küçük düzeltmeler. */
export const EN_OVERRIDES: Readonly<Record<string, string>> = {
  VARIABLES_DEFAULT_NAME: 'variable',
  CONTROLS_REPEAT_TITLE: 'repeat %1 times',
  PROCEDURES_DEFNORETURN_TITLE: 'function',
  PROCEDURES_DEFRETURN_TITLE: 'function',
  PROCEDURES_DEFNORETURN_PROCEDURE: 'function',
  PROCEDURES_DEFRETURN_PROCEDURE: 'function',
}

export const BLOCKLY_TEXT_EN = { noImage: '(no picture)', noMap: '(no map)', pickImage: 'Choose a picture.', pickMap: 'Choose a map.' }
