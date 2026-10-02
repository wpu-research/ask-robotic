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

const serce: Card = { title: 'Serçe', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) }
const ordek: Card = { title: 'Ördek', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) }
const kedi: Card = { title: 'Kedi', f: F({ legs: 4, ears: 2, eyes: 2, tail: true, whiskers: true }) }
const orumcek: Card = { title: 'Örümcek', f: F({ legs: 8, eyes: 2 }) }
const tavsan: Card = { title: 'Tavşan', f: F({ legs: 4, ears: 2, eyes: 2, tail: true, color: 'BEYAZ', name: 'Pamuk' }) }
const ugurBocegi: Card = { title: 'Uğur böceği', f: F({ legs: 6, wings: 2, eyes: 2, color: 'KIRMIZI', name: 'Benekli' }) }

// Seviye 1'in başlangıç bloğu: gaga dışında her şey hazır.
const serceBasi = [b('bulmaca_bacak'), b('bulmaca_bacak'), b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_goz'), b('bulmaca_goz')]

// Seviye 7-10 başlangıç programı: başlık + "her kart için" (içi boş).
const loopStart = () => program(seq(HAT(), cardsLoop()))

export const levels: LevelDef[] = [
  {
    id: 1,
    intro: 'Bu serçenin gagası eksik! Soldaki kutudan "gaga ekle" bloğunu sürükleyip diğer blokların en altına tak. Sonra yeşil oynat düğmesine bas.',
    hint: 'Bloğu tutup altındaki bloğa yaklaştır; mıknatıs gibi yapışır. Yapışmazsa çalışmaz.',
    toolbox: ['bulmaca_gaga', 'bulmaca_bacak', 'bulmaca_kanat', 'bulmaca_goz'],
    startBlocks: withHat(...serceBasi),
    solution: withHat(...serceBasi, b('bulmaca_gaga')),
    data: data([serce]),
  },
  {
    id: 2,
    intro: 'Karttaki ördeği yap! Resme bak, parçaları say ve her parça için bir blok ekle. Blokları alt alta tak.',
    hint: 'İki bacak, iki kanat, iki göz ve bir gaga gerekiyor. Sıranın önemi yok.',
    toolbox: ['bulmaca_bacak', 'bulmaca_kanat', 'bulmaca_goz', 'bulmaca_gaga'],
    startBlocks: withHat(),
    solution: withHat(b('bulmaca_gaga'), b('bulmaca_bacak'), b('bulmaca_bacak'), b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_goz'), b('bulmaca_goz')),
    data: data([ordek]),
  },
  {
    id: 3,
    intro: 'Şimdi bir kedi yapalım. Kedinin kaç bacağı, kulağı ve gözü var? Sayarak ekle. Kedide gaga ve kanat yok!',
    hint: 'Dört bacak, iki kulak, iki göz, bir kuyruk ve bir bıyık gerekiyor.',
    toolbox: ['bulmaca_bacak', 'bulmaca_kulak', 'bulmaca_goz', 'bulmaca_kuyruk', 'bulmaca_biyik'],
    startBlocks: withHat(),
    solution: withHat(...Array.from({ length: 4 }, () => b('bulmaca_bacak')), b('bulmaca_kulak'), b('bulmaca_kulak'), b('bulmaca_goz'), b('bulmaca_goz'), b('bulmaca_kuyruk'), b('bulmaca_biyik')),
    data: data([kedi]),
  },
  {
    id: 4,
    intro: 'Örümceğin 8 bacağı var! Sekiz blok koymak yerine "tekrarla" bloğunu kullan. En fazla 4 blok kullanabilirsin.',
    hint: '"tekrarla 8 kere" bloğunun içine bir "bacak ekle" koy. Gözler için ikinci bir tekrarla bloğu al.',
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
      { title: 'Papağan', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) },
      { title: 'Maymun', f: F({ legs: 2, ears: 2, eyes: 2, tail: true }) },
      { title: 'Güvercin', f: F({ legs: 2, wings: 2, eyes: 2, beak: true }) },
    ], true),
  },
  {
    id: 8,
    intro: 'Bu kez kartlardaki bacak sayısı hep değişiyor: 2, 4, 6, 8! Sayıyı kendin yazma; "kartta kaç bacak var" bloğunu kullan. En fazla 5 blok.',
    hint: '"tekrarla" bloğunun sayı yerine "kartta kaç bacak var" bloğunu tak. İçine "bacak ekle" koy. Gözler hep 2.',
    maxBlocks: 5,
    toolbox: ['bulmaca_bacak', 'bulmaca_goz', 'bulmaca_kart_say', 'controls_repeat_ext'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(rep(say('BACAK'), b('bulmaca_bacak')), rep(2, b('bulmaca_goz')))),
    data: data([
      { title: 'Serçe', f: F({ legs: 2, eyes: 2 }) },
      { title: 'Köpek', f: F({ legs: 4, eyes: 2 }) },
      { title: 'Arı', f: F({ legs: 6, eyes: 2 }) },
      { title: 'Örümcek', f: F({ legs: 8, eyes: 2 }) },
    ], true),
  },
  {
    id: 9,
    intro: 'Her kartta farklı sayıda bacak, kanat, göz ve kulak var. Dört tekrarla bloğuyla hepsini kopyala. En fazla 12 blok.',
    hint: 'Her parça için aynı kalıp: "tekrarla (kartta kaç … var) → … ekle". Bacak, kanat, göz ve kulak için dört kez kur.',
    maxBlocks: 12,
    toolbox: ['bulmaca_bacak', 'bulmaca_kanat', 'bulmaca_goz', 'bulmaca_kulak', 'bulmaca_kart_say', 'controls_repeat_ext'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(
      rep(say('BACAK'), b('bulmaca_bacak')), rep(say('KANAT'), b('bulmaca_kanat')), rep(say('GOZ'), b('bulmaca_goz')), rep(say('KULAK'), b('bulmaca_kulak')),
    )),
    data: data([
      { title: 'Serçe', f: F({ legs: 2, wings: 2, eyes: 2 }) },
      { title: 'Kedi', f: F({ legs: 4, eyes: 2, ears: 2 }) },
      { title: 'Uğur böceği', f: F({ legs: 6, wings: 2, eyes: 2 }) },
      { title: 'Örümcek', f: F({ legs: 8, eyes: 2 }) },
      { title: 'Yarasa', f: F({ legs: 2, wings: 2, eyes: 2, ears: 2 }) },
    ], true),
  },
  {
    id: 10,
    intro: 'Son bulmaca! Kartlarda her şey var: bacak, kanat, göz, kulak, gaga, kuyruk, bıyık, renk ve ad. Tek tek yazmak yerine "her özellik için" bloğunu kullan. En fazla 6 blok!',
    hint: '"her özellik için" içine: tekrarla (kartta bu özellikten kaç var) → bu özelliği ekle. Rengi ve adı için "kartın rengine boya" ve "kartın adını yaz" blokları var.',
    maxBlocks: 6,
    toolbox: ['bulmaca_her_ozellik', 'bulmaca_ekle_bu', 'bulmaca_kart_say_bu', 'bulmaca_boya_kart', 'bulmaca_ad_kart', 'controls_repeat_ext'],
    startBlocks: loopStart(),
    solution: withHat(cardsLoop(
      b('bulmaca_boya_kart'), b('bulmaca_ad_kart'),
      b('bulmaca_her_ozellik', {}, { DO: rep(b('bulmaca_kart_say_bu'), b('bulmaca_ekle_bu')) }),
    )),
    data: data([
      { title: 'Serçe', f: F({ legs: 2, wings: 2, eyes: 2, beak: true, color: 'KAHVERENGI', name: 'Cik' }) },
      { title: 'Kedi', f: F({ legs: 4, eyes: 2, ears: 2, tail: true, whiskers: true, color: 'TURUNCU', name: 'Mırmır' }) },
      { title: 'Örümcek', f: F({ legs: 8, eyes: 2, color: 'GRI', name: 'Ağ' }) },
      { title: 'Ördek', f: F({ legs: 2, wings: 2, eyes: 2, beak: true, color: 'SARI', name: 'Vak' }) },
      { title: 'Tavşan', f: F({ legs: 4, eyes: 2, ears: 2, tail: true, color: 'BEYAZ', name: 'Pamuk' }) },
    ], true),
  },
]
