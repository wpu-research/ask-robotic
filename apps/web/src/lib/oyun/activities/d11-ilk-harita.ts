import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject, mapFromRows, tiles } from '../samples/kit'
import { dikdortgen, izgara, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'karo-tas', 'karo-cimen', 'karo-tugla', 'karo-su')
const TILESET = () => tiles(['karo-tas', true], ['karo-cimen', false], ['karo-su', true])
const LEGEND = { '#': 0, c: 1, s: 2 }
/** Boş oda: kenarsız 10 x 7 harita (öğrenci duvarları Harita sekmesinde çizer). */
export const BOS_ODA = () => mapFromRows('oda', izgara(10, 7, [], false), LEGEND)
/** Çözüm: kenarları taş duvar, ortası çimen. */
export const DOLU_ODA = () => mapFromRows('oda', izgara(10, 7, dikdortgen(1, 1, 8, 5, 'c')), LEGEND)

const kur = (govde: ReturnType<typeof b>[], harita = BOS_ODA()) => makeProject('İlk harita', [b('oyun_baslangic', {}, govde)], { bg: 15, images: IMAGES, tileset: TILESET(), maps: [harita] })
const ortak = () => [b('harita_yukle', { M: 'oda' }), yeni('kedi', 'oyuncu-kedi', 'oyuncu'), b('harita_konumla', { S: 'kedi', C: 5, R: 3 })]

export const DERS_11: OyunActivity = {
  id: 'ders-11-ilk-harita',
  title: 'İlk odan: duvarlı bir harita',
  intro: 'Harita sekmesindeki "oda" haritası boş. Kenarlarına "Taş duvar" karolarını boya (duvar işaretli olsun). Sonra bloklarda kediyi tuşlarla yürüt. Kedi duvarları aşıp odadan çıkamamalı.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'harita_konumla', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'degisken', 'math_number'),
  starter: () => kur(ortak()),
  scenario: [{ do: 'press', button: 'left', frames: 200 }, { do: 'press', button: 'up', frames: 200 }, { do: 'press', button: 'right', frames: 400 }, { do: 'press', button: 'down', frames: 300 }],
  goals: [
    { id: 'harita', label: 'Oda haritası oyuna yüklendi', kind: 'map', minCols: 10, minRows: 7 },
    { id: 'duvar', label: 'Haritada en az 20 taş duvar karosu var', hint: 'Harita sekmesinde "Taş duvar" karosunu seçip kenarları boya.', kind: 'tileCount', image: 'karo-tas', min: 20 },
    { id: 'yuru', label: 'Kedi tuşlarla yürüyor', hint: '"oyuncu tuşlarıyla … hareket etsin" bloğunu ekle.', kind: 'moved', of: 'oyuncu', axis: 'x', min: 15 },
    { id: 'oda', label: 'Kedi dört yöne yürüdükten sonra da odanın içinde', hint: 'Duvarlar eksiksiz kapalıysa kedi çıkamaz.', kind: 'custom', test: (r) => { const s = r.engine.spritesOfKind('oyuncu')[0]; return !!s && s.x > 16 && s.x < 144 && s.y > 16 && s.y < 96 && (r.moved.oyuncu?.any ?? 0) >= 15 } },
  ],
  solution: () => kur([...ortak(), b('den_hareket', { S: 'kedi', M: 'four', N: 60 })], DOLU_ODA()),
}
