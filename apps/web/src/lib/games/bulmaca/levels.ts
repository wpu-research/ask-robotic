// Bulmaca: 10 seviye. Zorluk: blok birleştirme → tekrar → renk/ad → sayı girişi → koşul → kart sensörleri → genel kopyalayıcı.
import { b, program, seq, type ProgramBlock } from '../program'
import type { LevelDef } from '../types'
import type { PuzzleLevelData } from './engine'
import { makeFeatures as F, type Card } from './features'

const HAT = () => b('bulmaca_basla')
const withHat = (...blocks: ProgramBlock[]) => program(seq(HAT(), ...blocks))
const rep = (n: number | ProgramBlock, ...body: ProgramBlock[]) => b('controls_repeat_ext', {}, { TIMES: n, DO: seq(...body) })
const sensor = (oz: string) => b('bulmaca_kartta_var', { OZ: oz })
const say = (oz: string) => b('bulmaca_kart_say', { OZ: oz })
const cardsLoop = (...body: ProgramBlock[]) => b('bulmaca_her_kart', {}, body.length ? { DO: seq(...body) } : {})

const data = (cards: Card[], multi = false): PuzzleLevelData => ({ cards, multi })

const serce: Card = { title: 'Serçe', titleEn: 'Sparrow', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) }
const ordek: Card = { title: 'Ördek', titleEn: 'Duck', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) }
const kedi: Card = { title: 'Kedi', titleEn: 'Cat', f: F({ legs: 4, ears: 2, eyes: 2, tail: true, whiskers: true }) }
const orumcek: Card = { title: 'Örümcek', titleEn: 'Spider', f: F({ legs: 8, eyes: 2 }) }
const tavsan: Card = { title: 'Tavşan', titleEn: 'Rabbit', f: F({ legs: 4, ears: 2, eyes: 2, tail: true, color: 'BEYAZ', name: 'Pamuk' }) }
const ugurBocegi: Card = { title: 'Uğur böceği', titleEn: 'Ladybug', f: F({ legs: 6, wings: 2, eyes: 2, color: 'KIRMIZI', name: 'Benekli' }) }

// Seviye 1'in başlangıç bloğu: gaga dışında her şey hazır.
const serceBasi = [b('bulmaca_bacak'), b('bulmaca_bacak'), b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_goz'), b('bulmaca_goz')]

// Seviye 7-10 başlangıç programı: başlık + "her kart için" (içi boş).
const loopStart = () => program(seq(HAT(), cardsLoop()))

export const levels: LevelDef[] = [
  {
    id: 1,
    intro: 'Bu serçenin gagası eksik! Soldaki kutudan "gaga ekle" bloğunu sürükleyip diğer blokların en altına tak. Sonra yeşil oynat düğmesine bas.',
    hint: 'Bloğu tutup altındaki bloğa yaklaştır; mıknatıs gibi yapışır. Yapışmazsa çalışmaz.',
    en: { intro: 'This sparrow is missing its beak! Drag the "add beak" block from the box on the left and snap it under the other blocks. Then press the green play button.', hint: 'Hold the block and bring it close to the block above; it snaps on like a magnet. If it does not snap, it will not run.' },
    toolbox: ['bulmaca_gaga', 'bulmaca_bacak', 'bulmaca_kanat', 'bulmaca_goz'],
    startBlocks: withHat(...serceBasi),
    solution: withHat(...serceBasi, b('bulmaca_gaga')),
    data: data([serce]),
  },
  {
    id: 2,
    intro: 'Karttaki ördeği yap! Resme bak, parçaları say ve her parça için bir blok ekle. Blokları alt alta tak.',
    hint: 'İki bacak, iki kanat, iki göz ve bir gaga gerekiyor. Sıranın önemi yok.',
    en: { intro: 'Make the duck on the card! Look at the picture, count the parts and add one block for each part. Snap the blocks one under another.', hint: 'You need two legs, two wings, two eyes and a beak. The order does not matter.' },
    toolbox: ['bulmaca_bacak', 'bulmaca_kanat', 'bulmaca_goz', 'bulmaca_gaga'],
    startBlocks: withHat(),
    solution: withHat(b('bulmaca_gaga'), b('bulmaca_bacak'), b('bulmaca_bacak'), b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_goz'), b('bulmaca_goz')),
    data: data([ordek]),
  },
  {
    id: 3,
    intro: 'Şimdi bir kedi yapalım. Kedinin kaç bacağı, kulağı ve gözü var? Sayarak ekle. Kedide gaga ve kanat yok!',
    hint: 'Dört bacak, iki kulak, iki göz, bir kuyruk ve bir bıyık gerekiyor.',
    en: { intro: 'Now let\'s make a cat. How many legs, ears and eyes does a cat have? Count and add them. A cat has no beak and no wings!', hint: 'You need four legs, two ears, two eyes, a tail and whiskers.' },
    toolbox: ['bulmaca_bacak', 'bulmaca_kulak', 'bulmaca_goz', 'bulmaca_kuyruk', 'bulmaca_biyik'],
    startBlocks: withHat(),
    solution: withHat(...Array.from({ length: 4 }, () => b('bulmaca_bacak')), b('bulmaca_kulak'), b('bulmaca_kulak'), b('bulmaca_goz'), b('bulmaca_goz'), b('bulmaca_kuyruk'), b('bulmaca_biyik')),
    data: data([kedi]),
  },
  {
    id: 4,
    intro: 'Örümceğin 8 bacağı var! Sekiz blok koymak yerine "tekrarla" bloğunu kullan. En fazla 4 blok kullanabilirsin.',
    hint: '"tekrarla 8 kere" bloğunun içine bir "bacak ekle" koy. Gözler için ikinci bir tekrarla bloğu al.',
    en: { intro: 'The spider has 8 legs! Instead of using eight blocks, use the "repeat" block. You can use at most 4 blocks.', hint: 'Put one "add leg" inside the "repeat 8 times" block. Take a second repeat block for the eyes.' },
    maxBlocks: 4,
    toolbox: ['bulmaca_bacak', 'bulmaca_goz', 'controls_repeat_ext'],
    startBlocks: withHat(),
    solution: withHat(rep(8, b('bulmaca_bacak')), rep(2, b('bulmaca_goz'))),
    data: data([orumcek]),
  },
  {
    id: 5,
    intro: 'Karttaki tavşanı boya ve adını yaz! Rengi "boya" bloğuyla seç, adını "adını yaz" bloğunun kutusuna yaz. En fazla 9 blok.',
    hint: 'Kartta tavşanın rengi beyaz, adı Pamuk. Dört bacak, iki kulak, iki göz ve bir kuyruk da gerekiyor.',
    en: { intro: 'Paint the rabbit on the card and write its name! Pick the color with the "paint" block and type the name in the box of the "write name" block. At most 9 blocks.', hint: 'On the card the rabbit is white and its name is Pamuk. It also needs four legs, two ears, two eyes and a tail.' },
    maxBlocks: 9,
    toolbox: ['bulmaca_boya', 'bulmaca_ad', 'bulmaca_bacak', 'bulmaca_kulak', 'bulmaca_goz', 'bulmaca_kuyruk', 'controls_repeat_ext'],
    startBlocks: withHat(),
    solution: withHat(b('bulmaca_boya', { RENK: 'BEYAZ' }), b('bulmaca_ad', { AD: 'Pamuk' }), rep(4, b('bulmaca_bacak')), rep(2, b('bulmaca_kulak')), rep(2, b('bulmaca_goz')), b('bulmaca_kuyruk')),
    data: data([tavsan]),
  },
  {
    id: 6,
    intro: 'Uğur böceğini yap! Bu kez parça sayısını blokun içine bir sayı olarak yaz: "bacak ekle: 6 tane". Rengini ve adını da unutma.',
    hint: 'Altı bacak, iki kanat, iki göz. Kırmızıya boya ve adını "Benekli" yap. 6 sayısını 3 + 3 olarak da yazabilirsin.',
    en: { intro: 'Make the ladybug! This time type the number of parts as a number in the block: "add legs: 6". Don\'t forget its color and name.', hint: 'Six legs, two wings, two eyes. Paint it red and name it "Benekli". You can also write 6 as 3 + 3.' },
    maxBlocks: 8,
    toolbox: ['bulmaca_boya', 'bulmaca_ad', 'bulmaca_bacak_n', 'bulmaca_goz_n', 'bulmaca_kanat', 'math_number', 'math_arithmetic'],
    startBlocks: withHat(),
    solution: withHat(b('bulmaca_boya', { RENK: 'KIRMIZI' }), b('bulmaca_ad', { AD: 'Benekli' }), b('bulmaca_bacak_n', {}, { N: 6 }), b('bulmaca_goz_n', {}, { N: 2 }), b('bulmaca_kanat'), b('bulmaca_kanat')),
    data: data([ugurBocegi]),
  },
  {
    id: 7,
    intro: 'Kartlar sırayla gelecek: bir papağan ve bir maymun! Programın her kart için çalışır. Kanatlı mı? Eğer kartta kanat varsa kanat ve gaga, yoksa kulak ve kuyruk ekle.',
    hint: 'İkisinin de 2 bacağı ve 2 gözü var; bunları en üste koy. Sonra "eğer … değilse" bloğuna "kartta kanat var mı?" koşulunu tak. Bloklar "her kart için" içine girecek.',
    en: { intro: 'The cards come one after another: a parrot and a monkey! Your program runs for each card. Does it have wings? If the card has wings, add wings and a beak; if not, add ears and a tail.', hint: 'Both have 2 legs and 2 eyes; put those at the top. Then attach the "card has wings?" condition to the "if … else" block. The blocks go inside "for each card".' },
    maxBlocks: 13,
    toolbox: ['bulmaca_bacak', 'bulmaca_goz', 'bulmaca_kanat', 'bulmaca_gaga', 'bulmaca_kulak', 'bulmaca_kuyruk', 'bulmaca_kartta_var', 'controls_if'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(
      b('bulmaca_bacak'), b('bulmaca_bacak'), b('bulmaca_goz'), b('bulmaca_goz'),
      b('controls_if', {}, {
        IF0: sensor('KANAT'),
        DO0: seq(b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_gaga')),
        ELSE: seq(b('bulmaca_kulak'), b('bulmaca_kulak'), b('bulmaca_kuyruk')),
      }, { extraState: { hasElse: true } }),
    )),
    data: data([
      { title: 'Papağan', titleEn: 'Parrot', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) },
      { title: 'Maymun', titleEn: 'Monkey', f: F({ legs: 2, ears: 2, eyes: 2, tail: true }) },
      { title: 'Güvercin', titleEn: 'Pigeon', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) },
    ], true),
  },
  {
    id: 8,
    intro: 'Bu kez kartlardaki bacak sayısı hep değişiyor: 2, 4, 6, 8! Sayıyı kendin yazma; "kartta kaç bacak var" bloğunu kullan. En fazla 5 blok.',
    hint: '"tekrarla" bloğunun sayı yerine "kartta kaç bacak var" bloğunu tak. İçine "bacak ekle" koy. Gözler hep 2.',
    en: { intro: 'This time the number of legs on the cards keeps changing: 2, 4, 6, 8! Don\'t type the number yourself; use the "how many legs on the card" block. At most 5 blocks.', hint: 'Attach "how many legs on the card" in place of the number in the "repeat" block. Put "add leg" inside. There are always 2 eyes.' },
    maxBlocks: 5,
    toolbox: ['bulmaca_bacak', 'bulmaca_goz', 'bulmaca_kart_say', 'controls_repeat_ext'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(rep(say('BACAK'), b('bulmaca_bacak')), rep(2, b('bulmaca_goz')))),
    data: data([
      { title: 'Serçe', titleEn: 'Sparrow', f: F({ legs: 2, eyes: 2 }) },
      { title: 'Köpek', titleEn: 'Dog', f: F({ legs: 4, eyes: 2 }) },
      { title: 'Arı', titleEn: 'Bee', f: F({ legs: 6, eyes: 2 }) },
      { title: 'Örümcek', titleEn: 'Spider', f: F({ legs: 8, eyes: 2 }) },
    ], true),
  },
  {
    id: 9,
    intro: 'Her kartta farklı sayıda bacak, kanat, göz ve kulak var. Dört tekrarla bloğuyla hepsini kopyala. En fazla 12 blok.',
    hint: 'Her parça için aynı kalıp: "tekrarla (kartta kaç … var) → … ekle". Bacak, kanat, göz ve kulak için dört kez kur.',
    en: { intro: 'Every card has a different number of legs, wings, eyes and ears. Copy them all with four repeat blocks. At most 12 blocks.', hint: 'The same pattern for each part: "repeat (how many … on the card) → add …". Build it four times for legs, wings, eyes and ears.' },
    maxBlocks: 12,
    toolbox: ['bulmaca_bacak', 'bulmaca_kanat', 'bulmaca_goz', 'bulmaca_kulak', 'bulmaca_kart_say', 'controls_repeat_ext'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(
      rep(say('BACAK'), b('bulmaca_bacak')), rep(say('KANAT'), b('bulmaca_kanat')), rep(say('GOZ'), b('bulmaca_goz')), rep(say('KULAK'), b('bulmaca_kulak')),
    )),
    data: data([
      { title: 'Serçe', titleEn: 'Sparrow', f: F({ legs: 2, wings: 2, eyes: 2 }) },
      { title: 'Kedi', titleEn: 'Cat', f: F({ legs: 4, eyes: 2, ears: 2 }) },
      { title: 'Uğur böceği', titleEn: 'Ladybug', f: F({ legs: 6, wings: 2, eyes: 2 }) },
      { title: 'Örümcek', titleEn: 'Spider', f: F({ legs: 8, eyes: 2 }) },
      { title: 'Yarasa', titleEn: 'Bat', f: F({ legs: 2, wings: 2, eyes: 2, ears: 2 }) },
    ], true),
  },
  {
    id: 10,
    intro: 'Son bulmaca! Kartlarda her şey var: bacak, kanat, göz, kulak, gaga, kuyruk, bıyık, renk ve ad. Tek tek yazmak yerine "her özellik için" bloğunu kullan. En fazla 6 blok!',
    hint: '"her özellik için" içine: tekrarla (kartta bu özellikten kaç var) → bu özelliği ekle. Rengi ve adı için "kartın rengine boya" ve "kartın adını yaz" blokları var.',
    en: { intro: 'The last puzzle! The cards have everything: legs, wings, eyes, ears, beak, tail, whiskers, color and name. Instead of writing them one by one, use the "for each feature" block. At most 6 blocks!', hint: 'Inside "for each feature": repeat (how many of this feature on the card) → add this feature. For color and name there are the "paint card\'s color" and "write card\'s name" blocks.' },
    maxBlocks: 6,
    toolbox: ['bulmaca_her_ozellik', 'bulmaca_ekle_bu', 'bulmaca_kart_say_bu', 'bulmaca_boya_kart', 'bulmaca_ad_kart', 'controls_repeat_ext'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(
      b('bulmaca_boya_kart'), b('bulmaca_ad_kart'),
      b('bulmaca_her_ozellik', {}, { DO: rep(b('bulmaca_kart_say_bu'), b('bulmaca_ekle_bu')) }),
    )),
    data: data([
      { title: 'Serçe', titleEn: 'Sparrow', f: F({ legs: 2, wings: 2, eyes: 2, beak: true, color: 'KAHVERENGI', name: 'Cik' }) },
      { title: 'Kedi', titleEn: 'Cat', f: F({ legs: 4, eyes: 2, ears: 2, tail: true, whiskers: true, color: 'TURUNCU', name: 'Mırmır' }) },
      { title: 'Örümcek', titleEn: 'Spider', f: F({ legs: 8, eyes: 2, color: 'GRI', name: 'Ağ' }) },
      { title: 'Ördek', titleEn: 'Duck', f: F({ legs: 2, wings: 2, eyes: 2, beak: true, color: 'SARI', name: 'Vak' }) },
      { title: 'Tavşan', titleEn: 'Rabbit', f: F({ legs: 4, eyes: 2, ears: 2, tail: true, color: 'BEYAZ', name: 'Pamuk' }) },
    ], true),
  },
]
