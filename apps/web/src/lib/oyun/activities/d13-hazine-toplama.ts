import { allow, type OyunActivity } from '../activity'
import { b, cmp, ifThen } from '../dsl'
import { bu, makeProject, mapFromRows, olayKaro, tiles } from '../samples/kit'
import { izgara, resimler, yeni } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'karo-tas', 'karo-zemin', 'nesne-elmas', 'karo-lav')
export const MAGARA_SATIRLAR = izgara(12, 8, [
  [5, 2, 'L'], [3, 5, 'L'], [9, 5, 'L'],
  [2, 3, 'o'], [8, 1, 'o'], [10, 4, 'o'], [4, 6, 'o'],
  [3, 2, '#'], [3, 3, '#'], [8, 3, '#'], [8, 4, '#'],
])
export const MAGARA_LAV: [number, number] = [5, 2]
export const MAGARA_ELMAS: [number, number][] = [[2, 3], [8, 1], [10, 4], [4, 6]]
const kur = (ek: ReturnType<typeof b>[] = []) => makeProject('Hazine avı', [
  b('oyun_baslangic', {}, [
    b('sahne_dosemesi', { IMG: 'karo-zemin' }), b('harita_yukle', { M: 'magara' }),
    yeni('kedi', 'oyuncu-kedi', 'oyuncu'), b('harita_konumla', { S: 'kedi', C: 1, R: 1 }), b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
    b('oyun_skor_ayarla', { N: 0 }), b('oyun_can_ayarla', { N: 3 }),
  ]),
  ...ek,
], { bg: 15, images: IMAGES, tileset: tiles(['karo-tas', true], ['nesne-elmas', false], ['karo-lav', false]), maps: [mapFromRows('magara', MAGARA_SATIRLAR, { '#': 0, o: 1, L: 2 })] })

export const DERS_13: OyunActivity = {
  id: 'ders-13-hazine-toplama',
  title: 'Mağarada elmas avı',
  intro: 'Mağarada 4 elmas ve kırmızı lav karoları var. Kedi bir elmasa dokununca elmas haritadan silinsin ve skor 1 artsın. Hepsi toplanınca oyunu kazan. Lava dokunursa 1 can kaybetsin ve başlangıca dönsün.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_dosemesi', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'harita_konumla', 'den_hareket', 'harita_karoya_dokununca', 'harita_olay_karo', 'harita_karo_sil', 'harita_say', 'oyun_bu_sprite', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'mantik', 'metin', 'degisken', 'math_number'),
  starter: () => kur(),
  scenario: [{ do: 'goto', kind: 'oyuncu', col: MAGARA_LAV[0], row: MAGARA_LAV[1] }, ...MAGARA_ELMAS.map(([col, row]) => ({ do: 'goto', kind: 'oyuncu', col, row }) as const), { do: 'seconds', s: 1 }],
  goals: [
    { id: 'sil', label: 'Dokunulan elmaslar haritadan siliniyor', hint: '"sütun … satır … karosunu boşalt" bloğuna "olay karosunun sütunu / satırı" değerlerini koy.', kind: 'tileCount', image: 'nesne-elmas', max: 0 },
    { id: 'skor', label: 'Skor 4 oldu', kind: 'score', op: 'gte', value: 4 },
    { id: 'lav', label: 'Lava dokununca can azalıyor', hint: 'Bir de "lav" karosu için "karosuna dokununca" bloğu ekle.', kind: 'life', op: 'decreased' },
    { id: 'kazan', label: 'Hepsi toplanınca oyun kazanılıyor', hint: '"eğer haritadaki elmas karo sayısı = 0 ise" kullan.', kind: 'gameOver', result: 'win' },
  ],
  solution: () => kur([
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-elmas' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
      ifThen(cmp('EQ', b('harita_say', { IMG: 'nesne-elmas' }), 0), [b('oyun_mesaj', { T: 'Bütün elmaslar sende!', N: 2 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' })]),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'karo-lav' }, [
      b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('ses_melodi', { M: 'patlama' }),
      b('harita_konumla', { S: bu(), C: 1, R: 1 }),
    ]),
  ]),
}
