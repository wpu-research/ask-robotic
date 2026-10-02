import { allow, type OyunActivity } from '../activity'
import { b, join } from '../dsl'
import { bu, makeProject, mapFromRows, olayKaro, tiles } from '../samples/kit'
import { dikdortgen, izgara, resimler, yeni } from './ders-kit'

const IMAGES = resimler('oyuncu-kahraman', 'karo-tas', 'karo-zemin', 'karo-su', 'karo-lav', 'nesne-anahtar', 'nesne-kapi', 'nesne-sandik', 'nesne-elmas')
// 20 x 10 harita. K: anahtar, D: kapı (duvar), C: sandık, L: lav, W: su, o: elmas. Başlangıç (1,1).
export const ADA_KAPI: [number, number] = [10, 5]
export const ADA_ANAHTAR: [number, number] = [2, 7]
export const ADA_SANDIK: [number, number] = [17, 5]
export const ADA_LAV: [number, number] = [4, 3]
export const ADA_ELMAS: [number, number][] = [[7, 1], [13, 2], [16, 8]]
export const ADA_SATIRLAR = izgara(20, 10, [
  ...dikdortgen(10, 1, 10, 8, '#'), [10, 5, 'D'],
  [4, 3, 'L'], [6, 6, 'L'], [8, 2, 'L'],
  ...dikdortgen(13, 4, 13, 6, 'W'),
  [2, 7, 'K'], [17, 5, 'C'],
  ...ADA_ELMAS.map(([c, r]) => [c, r, 'o'] as [number, number, string]),
])
export const ADA_DUVARLAR = new Set(['#', 'D', 'W'])

const kur = (ek: ReturnType<typeof b>[] = []) => makeProject('Hazine adası', [
  b('oyun_baslangic', {}, [
    b('sahne_dosemesi', { IMG: 'karo-zemin' }), b('harita_yukle', { M: 'ada' }),
    yeni('kahraman', 'oyuncu-kahraman', 'oyuncu'), b('harita_konumla', { S: 'kahraman', C: 1, R: 1 }),
    b('den_hareket', { S: 'kahraman', M: 'four', N: 60 }), b('kamera_takip', { S: 'kahraman' }),
    b('oyun_skor_ayarla', { N: 0 }), b('oyun_can_ayarla', { N: 3 }),
  ]),
  ...ek,
], {
  bg: 15, images: IMAGES,
  tileset: tiles(['karo-tas', true], ['nesne-kapi', true], ['karo-su', true], ['karo-lav', false], ['nesne-anahtar', false], ['nesne-sandik', false], ['nesne-elmas', false]),
  maps: [mapFromRows('ada', ADA_SATIRLAR, { '#': 0, D: 1, W: 2, L: 3, K: 4, C: 5, o: 6 })],
})

export const DERS_15: OyunActivity = {
  id: 'ders-15-proje-hazine-adasi',
  title: 'Proje: Hazine adası',
  intro: 'Adanın haritası hazır. Kahraman yürüyor, kamera onu izliyor. Sen kuralları yaz: anahtara dokununca kapı açılsın (kapı: sütun 10, satır 5), elmaslar skor kazandırsın, lav can götürüp başa göndersin, sandığa dokununca oyunu kazan.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_dosemesi', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'harita_konumla', 'den_hareket', 'kamera_takip', 'harita_karoya_dokununca', 'harita_olay_karo', 'harita_karo_sil', 'harita_karo_koy', 'harita_say', 'oyun_bu_sprite', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_can', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'mantik', 'metin', 'degisken', 'math_number'),
  starter: () => kur(),
  scenario: [
    { do: 'goto', kind: 'oyuncu', col: ADA_LAV[0], row: ADA_LAV[1] },
    { do: 'goto', kind: 'oyuncu', col: ADA_ANAHTAR[0], row: ADA_ANAHTAR[1] },
    ...ADA_ELMAS.map(([col, row]) => ({ do: 'goto', kind: 'oyuncu', col, row }) as const),
    { do: 'goto', kind: 'oyuncu', col: ADA_SANDIK[0], row: ADA_SANDIK[1] },
    { do: 'seconds', s: 1 },
  ],
  goals: [
    { id: 'lav', label: 'Lava dokununca can azalıyor', kind: 'life', op: 'decreased' },
    { id: 'anahtar', label: 'Anahtar toplanınca haritadan siliniyor', kind: 'tileCount', image: 'nesne-anahtar', max: 0 },
    { id: 'kapi', label: 'Anahtarı alınca kapı açılıyor (kapı karosu siliniyor)', hint: '"sütun 10 satır 5 karosunu boşalt" bloğunu anahtar olayına koy.', kind: 'tileCount', image: 'nesne-kapi', max: 0 },
    { id: 'elmas', label: 'Üç elmas toplanınca skor 3', kind: 'score', op: 'gte', value: 3 },
    { id: 'kamera', label: 'Kamera kahramanı takip ediyor', kind: 'custom', test: (r) => r.engine.cameraTarget !== null },
    { id: 'kazan', label: 'Sandığa dokununca oyun kazanılıyor', hint: 'Sandık karosu için "karosuna dokununca" bloğu ekle.', kind: 'gameOver', result: 'win' },
  ],
  solution: () => kur([
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-anahtar' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      b('harita_karo_sil', { C: ADA_KAPI[0], R: ADA_KAPI[1] }),
      b('oyun_mesaj', { T: 'Kapı açıldı!', N: 2 }), b('ses_melodi', { M: 'guc' }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-elmas' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }), b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'karo-lav' }, [
      b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('ses_melodi', { M: 'patlama' }), b('harita_konumla', { S: bu(), C: 1, R: 1 }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-sandik' }, [
      b('oyun_mesaj', { T: join('Hazineyi buldun! Skor: ', b('oyun_skor')), N: 3 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' }),
    ]),
  ]),
}
