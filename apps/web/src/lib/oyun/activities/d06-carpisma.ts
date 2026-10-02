import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { diger, makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'yiyecek-elma', 'dusman-hayalet', 'nesne-bomba')
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  yeni('kedi', 'oyuncu-kedi', 'oyuncu'), konum('kedi', 30, 30), ...yuruyen('kedi', 60),
  yeni('elma', 'yiyecek-elma', 'yiyecek'), konum('elma', 120, 30),
  yeni('hayalet', 'dusman-hayalet', 'dusman'), konum('hayalet', 120, 90),
])
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Çarpışma', [baslangic(), ...ek], { bg: 8, images: IMAGES })

export const DERS_06: OyunActivity = {
  id: 'ders-06-carpisma',
  title: 'Elmayı ye, hayaleti patlat',
  intro: 'Kedi elmaya değince elma yok olsun. Kedi hayalete değince hayalet patlayarak yok olsun. Çarpışma olaylarında "diğer sprite" çarpılan sprite\'tır.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'sprite_carpisinca', 'oyun_bu_sprite', 'oyun_diger_sprite', 'sprite_sil', 'sprite_patlat', 'ses_melodi', 'degisken', 'math_number'),
  starter: () => proje([]),
  scenario: [{ do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'place', kind: 'oyuncu', x: 30, y: 30 }, { do: 'collide', a: 'oyuncu', b: 'dusman' }],
  goals: [
    { id: 'olay', label: 'Çarpışma olayı çalışıyor (en az iki kez)', hint: 'Sprite kategorisinde "bir … sprite\'ı bir … sprite\'ına çarpınca" bloğu var.', kind: 'event', name: 'overlap', min: 2 },
    { id: 'elma', label: 'Kedi elmaya değince elma yok oluyor', hint: '"diğer sprite\'ı sil" kullan.', kind: 'custom', test: (r) => r.engine.spritesOfKind('yiyecek').length === 0 },
    { id: 'hayalet', label: 'Kedi hayalete değince hayalet yok oluyor', kind: 'custom', test: (r) => r.engine.spritesOfKind('dusman').length === 0 },
    { id: 'patla', label: 'Hayalet patlama efektiyle yok oluyor', hint: '"patlayıp yok olsun" bloğunu dene.', kind: 'event', name: 'particles' },
  ],
  solution: () => proje([
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('sprite_sil', { S: diger() }), b('ses_melodi', { M: 'puan' })]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, b('sprite_patlat', { S: diger() })),
  ]),
}
