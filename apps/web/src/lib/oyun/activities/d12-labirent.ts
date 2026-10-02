import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject, mapFromRows, tiles } from '../samples/kit'
import { resimler, yeni } from './ders-kit'

const IMAGES = resimler('oyuncu-mini-kedi', 'karo-tugla', 'karo-zemin', 'nesne-kapi')
export const LABIRENT_SATIRLAR = [
  '############',
  '#...#......#',
  '#.#.#.####.#',
  '#.#...#..#.#',
  '#.#####.##.#',
  '#.....#....#',
  '#####.####.#',
  '#.....#...D#',
  '############',
]
const LEGEND = { '#': 0, D: 1 }
const kur = (govde: ReturnType<typeof b>[], ek: ReturnType<typeof b>[] = []) => makeProject('Labirent', [b('oyun_baslangic', {}, govde), ...ek], {
  bg: 15, images: IMAGES, tileset: tiles(['karo-tugla', true], ['nesne-kapi', false]), maps: [mapFromRows('labirent', LABIRENT_SATIRLAR, LEGEND)],
})
const ortak = () => [b('sahne_dosemesi', { IMG: 'karo-zemin' }), b('harita_yukle', { M: 'labirent' }), yeni('kedi', 'oyuncu-mini-kedi', 'oyuncu'), b('harita_konumla', { S: 'kedi', C: 1, R: 1 }), b('den_hareket', { S: 'kedi', M: 'four', N: 60 })]

export const DERS_12: OyunActivity = {
  id: 'ders-12-labirent',
  title: 'Labirentten çık',
  intro: 'Labirent hazır ve kedi içeride yürüyor. Çıkış kapısı labirentin sağ alt köşesinde. Kedi kapı karosuna dokununca ekrana "Çıkışı buldun!" yaz, bir melodi çal ve oyunu kazan.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_dosemesi', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'harita_konumla', 'den_hareket', 'harita_karoya_dokununca', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'oyun_zaman', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'degisken', 'metin', 'math_number'),
  starter: () => kur(ortak()),
  scenario: [{ do: 'goto', kind: 'oyuncu', col: 10, row: 7 }, { do: 'seconds', s: 1 }],
  goals: [
    { id: 'dokun', label: 'Kedi kapı karosuna dokununca bir olay çalışıyor', hint: 'Sahne / Harita kategorisinde "bir … sprite\'ı … karosuna dokununca" bloğu var. Karo olarak kapıyı seç.', kind: 'event', name: 'tileTouch' },
    { id: 'mesaj', label: 'Ekranda "Çıkışı buldun!" gibi bir mesaj çıkıyor', kind: 'event', name: 'message' },
    { id: 'ses', label: 'Bir melodi çalıyor', kind: 'event', name: 'sound' },
    { id: 'kazan', label: 'Oyun kazanılıyor', kind: 'gameOver', result: 'win' },
  ],
  solution: () => kur(ortak(), [
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-kapi' }, [b('oyun_mesaj', { T: 'Çıkışı buldun!', N: 2 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' })]),
  ]),
}
