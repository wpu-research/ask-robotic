// Film oyunu: 10 seviye. Çözümler `program(...)` ile kurulur; hedef animasyon çözümün çıktısıdır.
import { b, program, seq, varField, type ProgramBlock, type ProgramState } from '../program'
import type { LevelDef } from '../types'

const wrapper = (...body: ProgramBlock[]): ProgramBlock =>
  b('film_kare', undefined, body.length ? { DO: seq(...body) } : undefined, { deletable: false })
const sol = (...body: ProgramBlock[]): ProgramState => program(wrapper(...body))
/** Çalışma alanında hazır duran, boş "her karede" bloğu. */
const start: ProgramState = program(wrapper())

const zaman = () => b('film_zaman')
const renk = (r: string) => b('film_renk', { RENK: r })
const zemin = (r: string) => b('film_zemin', { RENK: r })
const daire = (x: ProgramBlock | number, y: ProgramBlock | number, r: ProgramBlock | number) => b('film_daire', undefined, { X: x, Y: y, R: r })
const dik = (x: ProgramBlock | number, y: ProgramBlock | number, w: ProgramBlock | number, h: ProgramBlock | number) =>
  b('film_dikdortgen', undefined, { X: x, Y: y, W: w, H: h })
const cizgi = (x1: number, y1: number, x2: number, y2: number) => b('film_cizgi', undefined, { X1: x1, Y1: y1, X2: x2, Y2: y2 })
const op = (o: 'ADD' | 'MINUS' | 'MULTIPLY', a: ProgramBlock | number, c: ProgramBlock | number) => b('math_arithmetic', { OP: o }, { A: a, B: c })
const get = (v: string) => b('variables_get', { VAR: varField(v) })
const set = (v: string, val: ProgramBlock | number) => b('variables_set', { VAR: varField(v) }, { VALUE: val })

const SHAPES1 = ['film_renk', 'film_daire']
const T3 = [...SHAPES1, 'film_cizgi', 'film_zaman']

export const filmLevels: LevelDef[] = [
  {
    id: 1,
    intro: 'Bir film, art arda gösterilen resimlerden (karelerden) oluşur. Sahne 100 birim genişliğinde ve yüksekliğindedir. Rengi sarı yap ve ortaya, yani (50, 50) noktasına yarıçapı 25 olan bir daire çiz.',
    hint: '"rengi … yap" bloğu, ondan sonra çizilen şekillerin rengini belirler. Daireyi "her karede" bloğunun içine koy.',
    maxBlocks: 3, toolbox: SHAPES1, startBlocks: start,
    solution: sol(renk('SARI'), daire(50, 50, 25)),
  },
  {
    id: 2,
    intro: 'Bir yüz çizelim. Sarı yüz: merkez (50, 50), yarıçap 40. Siyah gözler: (35, 40) ve (65, 40), yarıçap 5. Siyah ağız: (35, 65) noktasından (65, 65) noktasına bir çizgi.',
    hint: 'Önce sarıyı seç ve yüzü çiz, sonra rengi siyah yapıp gözleri ve ağzı çiz. Sıra önemli: sonra çizilen üstte kalır.',
    maxBlocks: 7, toolbox: [...SHAPES1, 'film_cizgi'], startBlocks: start,
    solution: sol(renk('SARI'), daire(50, 50, 40), renk('SIYAH'), daire(35, 40, 5), daire(65, 40, 5), cizgi(35, 65, 65, 65)),
  },
  {
    id: 3,
    intro: 'Resimleri hareket ettirelim! "zaman" bloğu her karede 0, 1, 2 … 99 olur. Kırmızı bir top (yarıçap 8) soldan sağa yürüsün: x değeri zaman olsun, y hep 50.',
    hint: '"daire çiz" bloğunun x yuvasına "zaman" bloğunu sürükle.',
    maxBlocks: 4, toolbox: T3, startBlocks: start,
    solution: sol(renk('KIRMIZI'), daire(zaman(), 50, 8)),
  },
  {
    id: 4,
    intro: 'Matematik blokları zamanı değiştirebilir. Mavi top (yarıçap 8) sol alttan sağ üste çapraz gitsin: x = zaman, y = 100 − zaman. (y büyüdükçe top aşağı iner.)',
    hint: 'y yuvasına bir çıkarma bloğu koy: soldaki sayı 100, sağdaki zaman.',
    maxBlocks: 6, toolbox: [...T3, 'math_arithmetic'], startBlocks: start,
    solution: sol(renk('MAVI'), daire(zaman(), op('MINUS', 100, zaman()), 8)),
  },
  {
    id: 5,
    intro: 'Yükleniyor çubuğu yapalım. Önce siyah bir dikdörtgen: x 10, y 80, genişlik 80, yükseklik 10. Üstüne yeşil bir dikdörtgen: aynı yerde, aynı yükseklikte ama genişliği zaman × 0,8 olsun; çubuk dolsun.',
    hint: 'Genişlik yuvasına çarpma bloğu koy: zaman × 0.8. Yeşili siyahtan SONRA çiz.',
    maxBlocks: 7, toolbox: [...T3, 'math_arithmetic', 'film_dikdortgen'], startBlocks: start,
    solution: sol(renk('SIYAH'), dik(10, 80, 80, 10), renk('YESIL'), dik(10, 80, op('MULTIPLY', zaman(), 0.8), 10)),
  },
  {
    id: 6,
    intro: 'Trafik ışığı: siyah kutu (x 35, y 15, genişlik 30, yükseklik 70) ve ortasında (50, 50) yarıçap 14 bir ışık. Zaman 50\'den küçükken ışık kırmızı, değilse yeşil yanmalı.',
    hint: '"eğer" bloğunun dişlisinden "değilse" ekleyebilirsin (araç kutusundaki blokta hazır). Koşul: zaman < 50. Işığı rengi seçtikten SONRA çiz.',
    maxBlocks: 9, toolbox: [...T3, 'math_arithmetic', 'film_dikdortgen', 'controls_if', 'logic_compare'], startBlocks: start,
    solution: program(wrapper(
      renk('SIYAH'), dik(35, 15, 30, 70),
      b('controls_if', undefined, { IF0: b('logic_compare', { OP: 'LT' }, { A: zaman(), B: 50 }), DO0: renk('KIRMIZI'), ELSE: renk('YESIL') }, { extraState: { hasElse: true } }),
      daire(50, 50, 14),
    )),
  },
  {
    id: 7,
    intro: 'Değişkenler bir değeri saklar. "fark" adlı bir değişken oluştur ve zaman − 50 sayısının mutlak değerini ("|x|", yani eksi işaretsiz hali) ona ver. Turuncu top (yarıçap 6): x = 10 + fark × 1,6, y = 35. Mor top (yarıçap 6): x = 90 − fark × 1,6, y = 65. İki top birbirine doğru gelip uzaklaşır.',
    hint: 'Önce "fark" değişkenini oluştur. Mutlak değer için "kare kök" bloğundaki listeden "mutlak" seç. Sonra iki topta da aynı "fark" değişkenini kullan.',
    maxBlocks: 15, toolbox: [...T3, 'math_arithmetic', 'math_single', 'variables_set', 'variables_get'], startBlocks: start,
    solution: sol(
      set('fark', b('math_single', { OP: 'ABS' }, { NUM: op('MINUS', zaman(), 50) })),
      renk('TURUNCU'), daire(op('ADD', 10, op('MULTIPLY', get('fark'), 1.6)), 35, 6),
      renk('MOR'), daire(op('MINUS', 90, op('MULTIPLY', get('fark'), 1.6)), 65, 6),
    ),
  },
  {
    id: 8,
    intro: 'Bir döngü ile beş top yağdıralım. i sayısı 1\'den 5\'e kadar gitsin. Her top için rengi ton (i × 60) yap ve (i × 18, zaman) noktasına yarıçap 7 daire çiz. Toplar yan yana, farklı renklerde aşağı düşsün.',
    hint: '"say" döngüsünün değişkeni i her turda 1, 2, 3 … olur. "ton" bloğu gökkuşağı renkleri verir.',
    maxBlocks: 9, toolbox: [...T3, 'math_arithmetic', 'controls_for', 'variables_get', 'film_renk_ton', 'film_renk_rgb'], startBlocks: start,
    solution: sol(b('controls_for', { VAR: varField('i') }, {
      FROM: 1, TO: 5, BY: 1,
      DO: seq(b('film_renk_ton', undefined, { HUE: op('MULTIPLY', get('i'), 60) }), daire(op('MULTIPLY', get('i'), 18), zaman(), 7)),
    })),
  },
  {
    id: 9,
    intro: 'Gece gökyüzü: arka planı siyah yap, ortaya (50, 50) yarıçap 10 sarı bir güneş çiz. Beyaz bir ay (yarıçap 8) güneşin etrafında dönsün: açı = zaman × 3,6; x = 50 + 30 × cos(açı), y = 50 + 30 × sin(açı).',
    hint: '"açı" adlı bir değişken kullanırsan formülü iki kere yazmazsın. cos ve sin blokları Matematik kategorisinde.',
    maxBlocks: 16, toolbox: [...T3, 'math_arithmetic', 'variables_set', 'variables_get', 'film_zemin', 'film_sin', 'film_cos'], startBlocks: start,
    solution: sol(
      zemin('SIYAH'), renk('SARI'), daire(50, 50, 10),
      set('aci', op('MULTIPLY', zaman(), 3.6)),
      renk('BEYAZ'),
      daire(op('ADD', 50, op('MULTIPLY', 30, b('film_cos', undefined, { A: get('aci') }))), op('ADD', 50, op('MULTIPLY', 30, b('film_sin', undefined, { A: get('aci') }))), 8),
    ),
  },
  {
    id: 10,
    intro: 'Büyük final! Mavi gökyüzü, kahverengi zemin (x 0, y 80, genişlik 100, yükseklik 20). Sarı güneş (yarıçap 8) x = 85 yerinde yavaşça alçalsın: y = 10 + zaman × 0,5. Kırmızı araba (dikdörtgen 18 × 8, y = 68) x = zaman × 0,8 ile soldan sağa gitsin; siyah tekerlekleri (yarıçap 3) y = 78 yerinde, x + 4 ve x + 14 noktalarında olsun.',
    hint: 'Arabanın konumu için "konum" değişkenini kullan. Çizim sırası: gökyüzü, zemin, güneş, araba, tekerlekler. Güneşin rengini seçmeyi unutma.',
    maxBlocks: 23, toolbox: [...T3, 'math_arithmetic', 'film_dikdortgen', 'variables_set', 'variables_get', 'film_zemin', 'controls_if', 'logic_compare'], startBlocks: start,
    solution: sol(
      zemin('MAVI'), renk('KAHVE'), dik(0, 80, 100, 20),
      renk('SARI'), daire(85, op('ADD', 10, op('MULTIPLY', zaman(), 0.5)), 8),
      set('konum', op('MULTIPLY', zaman(), 0.8)),
      renk('KIRMIZI'), dik(get('konum'), 68, 18, 8),
      renk('SIYAH'), daire(op('ADD', get('konum'), 4), 78, 3), daire(op('ADD', get('konum'), 14), 78, 3),
    ),
  },
]
