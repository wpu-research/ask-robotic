// Ders 20 (proje) — Hayalet avcısı: devriye + takip + ateş + skor/can birleşir.
import { allow, type OyunActivity } from '../activity'
import { alt, b, bu, cmp, diger, ifThen, makeProject, oku, rnd, set, sub, v, yeniSprite } from './m11-ortak'

const baslangic = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 0 }),
  ...yeniSprite('avci', 'oyuncu-astronot', 'oyuncu', 80, 104),
  b('den_hareket', { S: 'avci', M: 'h', N: 80 }),
  b('sprite_bayrak', { S: 'avci', F: 'stay', ON: 'true' }),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
  ...ek,
])
const yarasaKur = () => [
  ...yeniSprite('yarasa', 'dusman-yarasa', 'dusman', 20, 30),
  b('hareket_hiz', { S: 'yarasa', VX: 40, VY: 0 }),
  b('sprite_bayrak', { S: 'yarasa', F: 'bounce', ON: 'true' }),
]
const hayaletUret = () => b('oyun_her_n_ms', { MS: 900 }, [
  set('hayalet', b('sprite_yeni', { IMG: 'dusman-hayalet', K: 'dusman' })),
  b('sprite_konum', { S: 'hayalet', X: rnd(10, 150), Y: -8 }),
  b('sprite_takip', { S: 'hayalet', O: v('avci'), N: 15 }),
])
const ates = () => b('den_dugme', { B: 'a', E: 'press' }, [
  set('lazer', b('sprite_yeni', { IMG: 'nesne-lazer', K: 'mermi' })),
  b('sprite_konum', { S: 'lazer', X: oku(v('avci'), 'x'), Y: sub(oku(v('avci'), 'y'), 12) }),
  b('hareket_hiz', { S: 'lazer', VX: 0, VY: -140 }),
  b('sprite_bayrak', { S: 'lazer', F: 'autoDestroy', ON: 'true' }),
  b('ses_melodi', { M: 'lazer' }),
])
const vurus = () => b('sprite_carpisinca', { KA: 'mermi', KB: 'dusman' }, [
  b('oyun_skor_degistir', { N: 1 }),
  b('ses_melodi', { M: 'patlama' }),
  b('sprite_patlat', { S: diger() }),
  b('sprite_sil', { S: bu() }),
  ifThen(cmp('GTE', b('oyun_skor'), 5), [b('oyun_mesaj', { T: 'Avcı kazandı!', N: 2 }), b('oyun_bitir', { R: 'win' })]),
])
const yakalanma = () => b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
  b('oyun_can_degistir', { N: -1 }),
  b('oyun_sarsinti', { N: 250 }),
  b('sprite_sil', { S: diger() }),
])

const SC = [
  { do: 'seconds', s: 0.5 }, { do: 'collide', a: 'oyuncu', b: 'dusman' }, { do: 'place', kind: 'oyuncu', x: 80, y: 104 }, { do: 'seconds', s: 4.5 },
  ...Array.from({ length: 5 }, () => [{ do: 'tap', button: 'a' }, { do: 'collide', a: 'mermi', b: 'dusman' }] as const).flat(),
] as const

export const OA_20_HAYALET_AVCISI: OyunActivity = {
  id: 'ders-20-proje-hayalet-avcisi',
  title: 'Proje: Hayalet avcısı',
  intro: 'Hazır: avcı, skor ve can. Eksik olanları ekle: (1) devriye gezen bir yarasa, (2) avcıyı kovalayan hayaletler, (3) A ile lazer atışı, (4) lazer vurunca skor, 5 puanda kazanma, (5) düşman avcıya değince can kaybı.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_n_ms', 'den_dugme', 'sprite_carpisinca', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'sprite_oku', 'sprite_bayrak', 'sprite_takip', 'sprite_patlat', 'sprite_sil', 'oyun_bu_sprite', 'oyun_diger_sprite', 'hareket_hiz', 'den_hareket', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'oyun_can_bitince', 'ses_melodi', 'mantik', 'matematik', 'metin', 'degisken'),
  starter: () => makeProject('Hayalet avcısı', [baslangic()]),
  scenario: SC,
  goals: [
    { id: 'devriye', label: 'Bir düşman sekerek devriye geziyor', hint: '"… duvar/kenara çarpınca sekmeli: evet" bloğunu yarasaya uygula.', kind: 'custom', test: (r) => alt(r, [{ do: 'seconds', s: 1 }], (r2) => r2.engine.spritesOfKind('dusman').some((s) => s.bounce)) },
    { id: 'takip', label: 'Hayaletler avcıyı takip ediyor', hint: '"her 900 ms\'de bir" içinde hayalet oluştur ve takip ettir.', kind: 'custom', test: (r) => alt(r, [{ do: 'seconds', s: 3 }], (r2) => r2.engine.spritesOfKind('dusman').some((s) => s.follow !== null)) },
    { id: 'ates', label: 'A düğmesi lazer çıkarıyor', hint: '"A düğmesine basılınca" olayında lazer sprite\'ı oluştur, yukarı doğru hız ver.', kind: 'sprites', of: 'mermi', min: 1 },
    { id: 'can', label: 'Düşman avcıya değince can azalıyor', hint: '"bir oyuncu sprite\'ı bir düşman sprite\'ına çarpınca" olayında canı -1 değiştir.', kind: 'life', op: 'decreased' },
    { id: 'skor', label: 'Vurulan düşman skor kazandırıyor (5 puan)', hint: 'Mermi-düşman çarpışmasında skoru 1 değiştir.', kind: 'score', op: 'gte', value: 5 },
    { id: 'kazan', label: 'Skor 5 olunca oyun kazanılıyor', hint: '"eğer skor ≥ 5 ise oyunu bitir: kazandın".', kind: 'gameOver', result: 'win' },
  ],
  solution: () => makeProject('Hayalet avcısı', [baslangic(yarasaKur()), hayaletUret(), ates(), vurus(), yakalanma()]),
}
