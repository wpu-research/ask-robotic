// Ders 17 — Takip: hayalet kediye yakınsa kovalar, uzaksa durur.
import { allow, type OyunActivity } from '../activity'
import { makeProject } from '../samples/kit'
import { alt, b, cmp, ifThen, yeniSprite } from './m11-ortak'

const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 0 }),
  ...yeniSprite('kedi', 'oyuncu-kedi', 'oyuncu', 30, 60),
  b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
  ...yeniSprite('hayalet', 'dusman-hayalet', 'dusman', 140, 100),
])

export const OA_17_TAKIP: OyunActivity = {
  id: 'ders-17-takip',
  title: 'Hayalet seni kovalıyor',
  intro: 'Hayalet kedi yakına gelince onu takip etsin (hız 25). Kedi 70 pikselden uzaktaysa hayalet dursun. Mesafeyi "arası mesafe" bloğu ölçer.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_kare', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_takip', 'sprite_takip_birak', 'hareket_dur', 'sprite_mesafe', 'mantik', 'degisken', 'math_number'),
  starter: () => makeProject('Takip', [baslangic(), b('oyun_her_kare', {}, [])]),
  scenario: [{ do: 'place', kind: 'oyuncu', x: 110, y: 100 }, { do: 'seconds', s: 2 }],
  goals: [
    { id: 'kovalar', label: 'Kedi yakındayken hayalet ona doğru gidiyor', hint: '"… sprite\'ını … hızıyla takip etsin" bloğunu kullan.', kind: 'moved', of: 'dusman', axis: 'x', min: 15 },
    { id: 'durur', label: 'Kedi uzaktayken hayalet yerinde duruyor', hint: '"eğer mesafe < 70 ise takip et, değilse dursun" kur.', kind: 'custom', test: (r) => alt(r, [{ do: 'place', kind: 'oyuncu', x: 10, y: 10 }, { do: 'seconds', s: 2 }], (r2) => (r2.moved.dusman?.any ?? 0) < 2) },
    { id: 'olcer', label: 'Programın mesafe ölçüyor ve eğer bloğu kullanıyor', hint: 'Mantık kategorisinden "eğer", Sprite kategorisinden "arası mesafe" bloğunu al.', kind: 'usesBlocks', types: ['sprite_mesafe', 'controls_if', 'sprite_takip'] },
  ],
  solution: () => makeProject('Takip', [
    baslangic(),
    b('oyun_her_kare', {}, [
      ifThen(cmp('LT', b('sprite_mesafe', { A: 'kedi', B: 'hayalet' }), 70), b('sprite_takip', { S: 'hayalet', O: 'kedi', N: 25 }), b('hareket_dur', { S: 'hayalet' })),
    ]),
  ]),
}
