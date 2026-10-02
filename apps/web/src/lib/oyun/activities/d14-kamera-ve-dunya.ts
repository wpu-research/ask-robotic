import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { diger, makeProject, mapFromRows, tiles } from '../samples/kit'
import { izgara, resimler, yeni } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'karo-tas', 'karo-agac', 'karo-cimen', 'yiyecek-elma')
export const OVA_ELMALAR: [number, number][] = [[6, 4], [11, 4], [17, 4], [22, 4], [26, 4], [9, 2], [20, 6]]
export const OVA_SATIRLAR = izgara(30, 8, [
  [3, 1, 'T'], [14, 1, 'T'], [25, 1, 'T'], [7, 6, 'T'], [15, 6, 'T'], [24, 2, 'T'], [12, 6, 'T'], [4, 3, 'T'], [19, 2, 'T'],
  ...OVA_ELMALAR.map(([c, r]) => [c, r, 'a'] as [number, number, string]),
])
const kur = (ek: ReturnType<typeof b>[], govdeEk: ReturnType<typeof b>[] = []) => makeProject('Büyük dünya', [
  b('oyun_baslangic', {}, [
    b('sahne_dosemesi', { IMG: 'karo-cimen' }), b('harita_yukle', { M: 'ova' }),
    yeni('kedi', 'oyuncu-kedi', 'oyuncu'), b('harita_konumla', { S: 'kedi', C: 1, R: 4 }), b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
    b('oyun_skor_ayarla', { N: 0 }),
    ...govdeEk,
  ]),
  b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() })]),
  ...ek,
], { bg: 15, images: IMAGES, tileset: tiles(['karo-tas', true], ['karo-agac', true], ['yiyecek-elma', false]), maps: [mapFromRows('ova', OVA_SATIRLAR, { '#': 0, T: 1, a: 2 })] })

export const DERS_14: OyunActivity = {
  id: 'ders-14-kamera-ve-dunya',
  title: 'Büyük bir dünya, kayan kamera',
  intro: 'Harita ekrandan çok daha geniş (30 karo). Kamera kediyi takip etsin. Haritadaki elma karolarını gerçek Yiyecek sprite\'larına çevir ki kedi onları toplayabilsin. Toplama kodu hazır.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_dosemesi', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'harita_konumla', 'den_hareket', 'kamera_takip', 'kamera_sabit', 'harita_sprite_yap', 'harita_boyut', 'sprite_olusunca', 'hareket_hiz', 'oyun_bu_sprite', 'sprite_carpisinca', 'oyun_diger_sprite', 'sprite_sil', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'ses_melodi', 'degisken', 'math_number'),
  starter: () => kur([]),
  scenario: [{ do: 'press', button: 'right', frames: 420 }],
  goals: [
    { id: 'kamera', label: 'Kamera kediyi takip ediyor', hint: 'Sahne / Harita kategorisinde "kamera … sprite\'ını takip etsin" bloğu var.', kind: 'custom', test: (r) => r.engine.cameraTarget !== null },
    { id: 'kayar', label: 'Kedi sağa yürüyünce görüntü kayıyor', kind: 'custom', test: (r) => r.engine.camera.x > 100 },
    { id: 'cevir', label: 'Bütün elma karoları sprite\'a çevrildi', hint: '"tüm … karolarını … sprite\'ına çevir": karo elma, tür Yiyecek.', kind: 'tileCount', image: 'yiyecek-elma', max: 0 },
    { id: 'sprite', label: 'Haritadan en az 5 Yiyecek sprite\'ı oluştu', kind: 'sprites', of: 'yiyecek', min: 5 },
    { id: 'skor', label: 'Kedi yolda elma toplayınca skor artıyor', kind: 'score', op: 'increased' },
  ],
  solution: () => kur([], [b('harita_sprite_yap', { IMG: 'yiyecek-elma', K: 'yiyecek' }), b('kamera_takip', { S: 'kedi' })]),
}
