import { and, b, cmp, ifThen, rnd, set, sub, v } from '../dsl'
import { bu, diger, makeProject, mapFromRows, oku, olayKaro, tiles, type OyunSample } from './kit'

// 1) Yakalamaca ─────────────────────────────────────────────
export const YAKALAMACA: OyunSample = {
  id: 'yakalamaca', name: 'Yakalamaca', level: 1, controls: 'Sol/sağ tuşlarıyla kediyi hareket ettir.',
  summary: 'Gökten düşen meyveleri yakala. Kaçırdığın her meyve bir canını götürür.',
  en: { name: 'Catch!', summary: 'Catch the fruit falling from the sky. Every fruit you miss costs you a life.', controls: 'Move the cat with the left/right keys.' },
  project: () => makeProject('Yakalamaca', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 10 }),
      set('sepet', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })),
      b('sprite_konum', { S: 'sepet', X: 80, Y: 104 }),
      b('den_hareket', { S: 'sepet', M: 'h', N: 90 }),
      b('sprite_bayrak', { S: 'sepet', F: 'stay', ON: 'true' }),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 3 }),
    ]),
    b('oyun_her_n_ms', { MS: 700 }, [
      set('sans', rnd(1, 3)),
      set('meyve', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })),
      ifThen(cmp('EQ', v('sans'), 2), b('sprite_resim', { S: 'meyve', IMG: 'yiyecek-portakal' }), undefined, [[cmp('EQ', v('sans'), 3), b('sprite_resim', { S: 'meyve', IMG: 'yiyecek-kiraz' })]]),
      b('sprite_konum', { S: 'meyve', X: rnd(10, 150), Y: -8 }),
      b('hareket_hiz', { S: 'meyve', VX: 0, VY: rnd(35, 70) }),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
      b('sprite_sil', { S: diger() }),
    ]),
    b('oyun_her_kare', {}, [
      b('sprite_her_biri', { K: 'yiyecek' }, ifThen(cmp('GT', oku(bu(), 'y'), 116), [
        b('oyun_can_degistir', { N: -1 }),
        b('oyun_sarsinti', { N: 200 }),
        b('sprite_sil', { S: bu() }),
      ])),
    ]),
  ]),
}

// 2) Uzay gemisi ─────────────────────────────────────────────
export const UZAY_GEMISI: OyunSample = {
  id: 'uzay-gemisi', name: 'Uzay gemisi', level: 2, controls: 'Ok tuşlarıyla uç, A (boşluk) ile ateş et.',
  summary: 'Gelen uzaylıları lazerle vur. Gemine çarparlarsa can kaybedersin.',
  en: { name: 'Spaceship', summary: 'Zap the incoming aliens with your laser. If they crash into your ship, you lose a life.', controls: 'Fly with the arrow keys, shoot with A (space).' },
  project: () => makeProject('Uzay gemisi', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 0 }),
      set('gemi', b('sprite_yeni', { IMG: 'oyuncu-gemi', K: 'oyuncu' })),
      b('sprite_konum', { S: 'gemi', X: 80, Y: 100 }),
      b('den_hareket', { S: 'gemi', M: 'four', N: 80 }),
      b('sprite_bayrak', { S: 'gemi', F: 'stay', ON: 'true' }),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 3 }),
    ]),
    b('den_dugme', { B: 'a', E: 'press' }, [
      set('lazer', b('sprite_yeni', { IMG: 'nesne-lazer', K: 'mermi' })),
      b('sprite_konum', { S: 'lazer', X: oku(v('gemi'), 'x'), Y: sub(oku(v('gemi'), 'y'), 12) }),
      b('hareket_hiz', { S: 'lazer', VX: 0, VY: -140 }),
      b('sprite_bayrak', { S: 'lazer', F: 'autoDestroy', ON: 'true' }),
      b('ses_melodi', { M: 'lazer' }),
    ]),
    b('oyun_her_n_ms', { MS: 800 }, [
      set('ufo', b('sprite_yeni', { IMG: 'dusman-uzayli', K: 'dusman' })),
      b('sprite_konum', { S: 'ufo', X: rnd(10, 150), Y: -8 }),
      b('hareket_hiz', { S: 'ufo', VX: 0, VY: rnd(20, 45) }),
      b('sprite_bayrak', { S: 'ufo', F: 'autoDestroy', ON: 'true' }),
    ]),
    b('sprite_carpisinca', { KA: 'mermi', KB: 'dusman' }, [
      b('oyun_skor_degistir', { N: 10 }),
      b('ses_melodi', { M: 'patlama' }),
      b('sprite_patlat', { S: diger() }),
      b('sprite_sil', { S: bu() }),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
      b('oyun_can_degistir', { N: -1 }),
      b('oyun_sarsinti', { N: 250 }),
      b('sprite_patlat', { S: diger() }),
    ]),
  ]),
}

// 3) Labirent ────────────────────────────────────────────────
export const LABIRENT_HARITA = [
  '####################',
  '#.o....#.....#....o#',
  '#.###.##.###.#.###.#',
  '#.#....#...#...#...#',
  '#.#.####.#.#####.###',
  '#...#....#.....#...#',
  '###.#.######.#.###.#',
  '#o..#......#.#.....#',
  '#.######.#.#.#####.#',
  '#........#...#...#.#',
  '#.######.#####.#.#.#',
  '#.#...o#.......#...#',
  '#.#.######.#########',
  '#...#...o..........#',
  '####################',
]
export const LABIRENT: OyunSample = {
  id: 'labirent', name: 'Labirent', level: 2, controls: 'Ok tuşlarıyla yürü. Hayalet seni kovalar!',
  summary: 'Labirentteki tüm altınları topla. Kamera seni takip eder; hayalet duvarlardan geçer.',
  en: { name: 'Maze', summary: 'Collect all the gold in the maze. The camera follows you; the ghost can go through walls.', controls: 'Walk with the arrow keys. The ghost chases you!' },
  project: () => makeProject('Labirent', [
    b('oyun_baslangic', {}, [
      b('sahne_dosemesi', { IMG: 'karo-zemin' }),
      b('harita_yukle', { M: 'labirent' }),
      set('kedi', b('sprite_yeni', { IMG: 'oyuncu-mini-kedi', K: 'oyuncu' })),
      b('harita_konumla', { S: 'kedi', C: 1, R: 1 }),
      b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
      b('kamera_takip', { S: 'kedi' }),
      set('hayalet', b('sprite_yeni', { IMG: 'dusman-hayalet', K: 'dusman' })),
      b('harita_konumla', { S: 'hayalet', C: 18, R: 13 }),
      b('sprite_bayrak', { S: 'hayalet', F: 'ghost', ON: 'true' }),
      b('sprite_takip', { S: 'hayalet', O: v('kedi'), N: 18 }),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 3 }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-altin' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
      ifThen(cmp('EQ', b('harita_say', { IMG: 'nesne-altin' }), 0), [
        b('oyun_mesaj', { T: 'Hepsini topladın!', N: 2 }),
        b('oyun_bitir', { R: 'win' }),
      ]),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
      b('oyun_can_degistir', { N: -1 }),
      b('oyun_sarsinti', { N: 250 }),
      b('ses_melodi', { M: 'patlama' }),
      b('harita_konumla', { S: diger(), C: 18, R: 13 }),
      b('harita_konumla', { S: bu(), C: 1, R: 1 }),
    ]),
  ], {
    bg: 15,
    tileset: tiles(['karo-tas', true], ['nesne-altin', false]),
    maps: [mapFromRows('labirent', LABIRENT_HARITA, { '#': 0, o: 1 })],
  }),
}

// 4) Platform atlayıcı ───────────────────────────────────────
export const PLATFORM_COLS = 30
export const PLATFORM_ROWS = 15
function platformRows(): string[] {
  const g: string[][] = Array.from({ length: PLATFORM_ROWS }, () => Array(PLATFORM_COLS).fill('.'))
  for (let c = 0; c < PLATFORM_COLS; c++) { g[13][c] = 'G'; g[14][c] = 'T' }
  const plat = (r: number, from: number, to: number) => { for (let c = from; c <= to; c++) g[r][c] = 'P' }
  const put = (r: number, c: number, ch: string) => { g[r][c] = ch }
  plat(10, 3, 6); plat(10, 25, 27)
  ;[[9, 4], [9, 5], [12, 8], [12, 9], [11, 17], [11, 20], [9, 26], [9, 27]].forEach(([r, c]) => put(r, c, 'C'))
  put(12, 10, 'T'); put(12, 24, 'T')
  put(12, 15, 'S'); put(12, 21, 'S')
  put(12, 18, 'E'); put(12, 23, 'E')
  put(12, 28, 'D')
  return g.map((r) => r.join(''))
}
export const PLATFORM: OyunSample = {
  id: 'platform-atlayici', name: 'Platform atlayıcı', level: 3, controls: 'Sağ/sol ile yürü, A (boşluk) ya da yukarı ile zıpla. Düşmanın üstüne atla!',
  summary: 'Altınları topla, dikenlerden kaç, düşmanların üstüne atlayarak onları yen ve kapıya ulaş.',
  en: { name: 'Platform jumper', summary: 'Collect the gold, dodge the spikes, beat enemies by jumping on them and reach the door.', controls: 'Walk with right/left, jump with A (space) or up. Jump on the enemies!' },
  project: () => makeProject('Platform atlayıcı', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 10 }),
      b('harita_yukle', { M: 'seviye1' }),
      set('kahraman', b('sprite_yeni', { IMG: 'oyuncu-kahraman', K: 'oyuncu' })),
      b('harita_konumla', { S: 'kahraman', C: 2, R: 12 }),
      b('hareket_ivme', { S: 'kahraman', AX: 0, AY: 520 }),
      b('den_hareket', { S: 'kahraman', M: 'h', N: 70 }),
      b('sprite_bayrak', { S: 'kahraman', F: 'stay', ON: 'true' }),
      b('kamera_takip', { S: 'kahraman' }),
      b('harita_sprite_yap', { IMG: 'dusman-balcik', K: 'dusman' }),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 3 }),
    ]),
    b('sprite_olusunca', { K: 'dusman' }, [
      b('hareket_hiz', { S: bu(), VX: 25, VY: 0 }),
      b('hareket_ivme', { S: bu(), AX: 0, AY: 520 }),
      b('sprite_bayrak', { S: bu(), F: 'stay', ON: 'true' }),
    ]),
    b('oyun_her_kare', {}, [
      b('sprite_her_biri', { K: 'dusman' }, [
        ifThen(b('sprite_dokunuyor', { S: bu(), D: 'right' }), b('hareket_hiz', { S: bu(), VX: -25, VY: oku(bu(), 'vy') })),
        ifThen(b('sprite_dokunuyor', { S: bu(), D: 'left' }), b('hareket_hiz', { S: bu(), VX: 25, VY: oku(bu(), 'vy') })),
      ]),
    ]),
    b('den_dugme', { B: 'a', E: 'press' }, [
      ifThen(b('sprite_dokunuyor', { S: 'kahraman', D: 'down' }), [
        b('hareket_hiz', { S: 'kahraman', VX: oku(v('kahraman'), 'vx'), VY: -250 }),
        b('ses_melodi', { M: 'ziplama' }),
      ]),
    ]),
    b('den_dugme', { B: 'up', E: 'press' }, [
      ifThen(b('sprite_dokunuyor', { S: 'kahraman', D: 'down' }), [
        b('hareket_hiz', { S: 'kahraman', VX: oku(v('kahraman'), 'vx'), VY: -250 }),
        b('ses_melodi', { M: 'ziplama' }),
      ]),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-altin' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'karo-diken' }, [
      b('oyun_can_degistir', { N: -1 }),
      b('oyun_sarsinti', { N: 250 }),
      b('harita_konumla', { S: bu(), C: 2, R: 12 }),
      b('hareket_hiz', { S: bu(), VX: 0, VY: 0 }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-kapi' }, [
      b('oyun_mesaj', { T: 'Seviye bitti!', N: 2 }),
      b('oyun_bitir', { R: 'win' }),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
      ifThen(
        and(cmp('GT', oku(bu(), 'vy'), 10), cmp('LT', oku(bu(), 'y'), sub(oku(diger(), 'y'), 4))),
        [
          b('sprite_patlat', { S: diger() }),
          b('oyun_skor_degistir', { N: 5 }),
          b('hareket_hiz', { S: bu(), VX: oku(bu(), 'vx'), VY: -150 }),
          b('ses_melodi', { M: 'patlama' }),
        ],
        [
          b('oyun_can_degistir', { N: -1 }),
          b('oyun_sarsinti', { N: 250 }),
          b('harita_konumla', { S: bu(), C: 2, R: 12 }),
          b('hareket_hiz', { S: bu(), VX: 0, VY: 0 }),
        ],
      ),
    ]),
  ], {
    bg: 10,
    tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true], ['karo-platform', true], ['nesne-altin', false], ['karo-diken', false], ['dusman-balcik', false], ['nesne-kapi', false]),
    maps: [mapFromRows('seviye1', platformRows(), { G: 0, T: 1, P: 2, C: 3, S: 4, E: 5, D: 6 })],
  }),
}
