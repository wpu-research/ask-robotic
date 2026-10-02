// Ders 19 — Ateş etme: A düğmesi mermi çıkarır, mermi düşmanı vurur.
import { allow, type OyunActivity } from '../activity'
import { b, bu, diger, makeProject, oku, set, sub, v, yeniSprite } from './m11-ortak'

const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 0 }),
  ...yeniSprite('gemi', 'oyuncu-gemi', 'oyuncu', 80, 100),
  b('den_hareket', { S: 'gemi', M: 'h', N: 80 }),
  b('sprite_bayrak', { S: 'gemi', F: 'stay', ON: 'true' }),
  ...yeniSprite('uzayli', 'dusman-uzayli', 'dusman', 80, 20),
  b('oyun_skor_ayarla', { N: 0 }),
])

export const OA_19_ATES: OyunActivity = {
  id: 'ders-19-ates-etme',
  title: 'Lazerle vur',
  intro: 'A düğmesine basınca geminin burnundan yukarı doğru bir lazer (tür: mermi) çıksın. Lazer uzaylıya değince uzaylı patlasın, lazer silinsin ve skor 10 artsın.',
  allowedBlocks: allow('oyun_baslangic', 'den_dugme', 'sprite_carpisinca', 'sprite_yeni', 'sprite_konum', 'sprite_oku', 'sprite_bayrak', 'hareket_hiz', 'sprite_patlat', 'sprite_sil', 'oyun_bu_sprite', 'oyun_diger_sprite', 'oyun_skor_degistir', 'oyun_skor_ayarla', 'ses_melodi', 'sahne_renk', 'den_hareket', 'degisken', 'matematik'),
  starter: () => makeProject('Ateş', [baslangic()]),
  scenario: [{ do: 'tap', button: 'a' }, { do: 'seconds', s: 1.5 }],
  goals: [
    { id: 'mermi', label: 'A düğmesine basınca bir mermi (lazer) oluşuyor', hint: '"A düğmesine basılınca" olayının içinde "yeni lazer sprite\'ı, türü mermi" bloğunu kullan.', kind: 'sprites', of: 'mermi', min: 1 },
    { id: 'yukari', label: 'Mermi yukarı doğru gidiyor (en az 30 piksel)', hint: 'Mermiye y hızı olarak eksi bir sayı ver (ör. -140).', kind: 'moved', of: 'mermi', axis: 'y', min: 30 },
    { id: 'vurdu', label: 'Uzaylı vuruldu ve sahneden kalktı', hint: '"bir mermi sprite\'ı bir düşman sprite\'ına çarpınca" olayını kullan.', kind: 'custom', test: (r) => r.engine.spritesOfKind('dusman').length === 0 },
    { id: 'skor', label: 'Vuruş skoru artırdı', hint: '"skoru 10 değiştir" bloğunu çarpışma olayına koy.', kind: 'score', op: 'gte', value: 10 },
    { id: 'ses', label: 'Atış ya da patlama sesi çalıyor', hint: 'Ses kategorisinden "lazer" ya da "patlama" melodisini çal.', kind: 'event', name: 'sound' },
  ],
  solution: () => makeProject('Ateş', [
    baslangic(),
    b('den_dugme', { B: 'a', E: 'press' }, [
      set('lazer', b('sprite_yeni', { IMG: 'nesne-lazer', K: 'mermi' })),
      b('sprite_konum', { S: 'lazer', X: oku(v('gemi'), 'x'), Y: sub(oku(v('gemi'), 'y'), 12) }),
      b('hareket_hiz', { S: 'lazer', VX: 0, VY: -140 }),
      b('sprite_bayrak', { S: 'lazer', F: 'autoDestroy', ON: 'true' }),
      b('ses_melodi', { M: 'lazer' }),
    ]),
    b('sprite_carpisinca', { KA: 'mermi', KB: 'dusman' }, [
      b('oyun_skor_degistir', { N: 10 }),
      b('ses_melodi', { M: 'patlama' }),
      b('sprite_patlat', { S: diger() }),
      b('sprite_sil', { S: bu() }),
    ]),
  ]),
}
