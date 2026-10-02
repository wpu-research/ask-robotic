// Ders 28 (tam oyun 2) — Labirent kaçışı: anahtar, kapı, takipçi hayalet.
import { allow, type OyunActivity } from '../activity'
import { alt, b, bu, cmp, diger, ifThen, makeProject, mapFromRows, olayKaro, set, tiles, v, yeniSprite } from './m11-ortak'

export const LABIRENT_28 = [
  '####################',
  '#.....#.....#....K.#',
  '#.###.#.###.#.###..#',
  '#.#...#.#...#...#..#',
  '#.#.###.#.#####.#.##',
  '#...#...#.....#.#..#',
  '###.#.#####.#.#.##.#',
  '#.....#.....#....D.#',
  '####################',
]
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Labirent kaçışı', tops, {
  bg: 15,
  tileset: tiles(['karo-tas', true], ['nesne-anahtar', false], ['nesne-kapi', false]),
  maps: [mapFromRows('labirent', LABIRENT_28, { '#': 0, K: 1, D: 2 })],
})
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_dosemesi', { IMG: 'karo-zemin' }),
  b('harita_yukle', { M: 'labirent' }),
  ...yeniSprite('kedi', 'oyuncu-mini-kedi', 'oyuncu', 24, 24),
  b('harita_konumla', { S: 'kedi', C: 1, R: 1 }),
  b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
  b('kamera_takip', { S: 'kedi' }),
  ...yeniSprite('hayalet', 'dusman-hayalet', 'dusman', 0, 0),
  b('harita_konumla', { S: 'hayalet', C: 10, R: 5 }),
  b('sprite_bayrak', { S: 'hayalet', F: 'ghost', ON: 'true' }),
  b('sprite_takip', { S: 'hayalet', O: v('kedi'), N: 14 }),
  set('anahtarVar', 0),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
])

export const OA_28_LABIRENT_KACIS: OyunActivity = {
  id: 'ders-28-tam-oyun-labirent-kacisi',
  title: 'Tam oyun: Labirent kaçışı',
  intro: 'Labirent, kedi ve seni duvarlardan geçerek kovalayan hayalet hazır. Oyunu tamamla: (1) anahtara dokununca anahtar kaybolsun ve "anahtarVar" değişkeni 1 olsun; (2) kapıya anahtarsız dokunursan "Kilitli!" yazsın (oyun bitmesin), anahtarlıysa "Kaçtın!" yazıp oyunu kazan; (3) hayalet kediye değince can 1 azalsın ve kedi başlangıca dönsün.',
  allowedBlocks: allow('oyun_baslangic', 'harita_karoya_dokununca', 'sprite_carpisinca', 'harita_olay_karo', 'harita_karo_sil', 'harita_konumla', 'harita_yukle', 'oyun_harita', 'sahne_dosemesi', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'sprite_takip', 'den_hareket', 'kamera_takip', 'oyun_bu_sprite', 'oyun_diger_sprite', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'oyun_can_bitince', 'ses_melodi', 'mantik', 'metin', 'matematik', 'degisken'),
  starter: () => proje([baslangic()]),
  scenario: [{ do: 'seconds', s: 1 }, { do: 'goto', kind: 'oyuncu', col: 17, row: 1 }, { do: 'goto', kind: 'oyuncu', col: 17, row: 7 }],
  goals: [
    { id: 'anahtar', label: 'Anahtara dokununca anahtar haritadan kayboluyor', hint: '"bir oyuncu sprite\'ı anahtar karosuna dokununca" olayında karoyu boşalt, "anahtarVar" değişkenini 1 yap.', kind: 'tileCount', image: 'nesne-anahtar', max: 0 },
    { id: 'kilitli', label: 'Anahtarsız kapıya dokununca "Kilitli!" yazıyor, oyun bitmiyor', hint: '"eğer anahtarVar = 1 ise kazan, değilse mesaj yaz" kur.', kind: 'custom', test: (r) => alt(r, [{ do: 'goto', kind: 'oyuncu', col: 17, row: 7 }], (r2) => r2.engine.state !== 'over' && r2.engine.stats.messages >= 1) },
    { id: 'kazan', label: 'Anahtarla kapıya dokununca oyun kazanılıyor', kind: 'gameOver', result: 'win', hint: 'Kapı karosunun olayında anahtar varsa "oyunu bitir: kazandın".' },
    { id: 'can', label: 'Hayalet kediye değince can azalıyor', hint: '"bir oyuncu sprite\'ı bir düşman sprite\'ına çarpınca": canı -1 değiştir, kediyi başlangıç karosuna koy.', kind: 'custom', test: (r) => alt(r, [{ do: 'collide', a: 'oyuncu', b: 'dusman' }], (r2) => r2.minLife < r2.startLife) },
    { id: 'takip', label: 'Hayalet kediyi kovalıyor', hint: 'Bu hedef başlangıçtaki takip bloğundan geliyor; silme.', kind: 'moved', of: 'dusman', axis: 'any', min: 8 },
  ],
  solution: () => proje([
    baslangic(),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-anahtar' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      set('anahtarVar', 1),
      b('oyun_skor_degistir', { N: 10 }),
      b('ses_melodi', { M: 'puan' }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-kapi' }, [
      ifThen(cmp('EQ', v('anahtarVar'), 1),
        [b('oyun_mesaj', { T: 'Kaçtın!', N: 2 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' })],
        b('oyun_mesaj', { T: 'Kilitli!', N: 1 })),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
      b('oyun_can_degistir', { N: -1 }),
      b('oyun_sarsinti', { N: 250 }),
      b('harita_konumla', { S: bu(), C: 1, R: 1 }),
      b('harita_konumla', { S: diger(), C: 10, R: 5 }),
    ]),
  ]),
}
