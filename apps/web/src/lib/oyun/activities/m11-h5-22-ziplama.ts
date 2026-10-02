// Ders 22 — Zıplama: A ile zıpla, yalnız yerdeyken.
import { allow, type OyunActivity } from '../activity'
import { alt, b, ifThen, makeProject, mapFromRows, oku, tiles, v, yeniSprite } from './m11-ortak'

const harita = () => mapFromRows('zemin', [
  '..........', '..........', '..........', '..........', '..........', '..........', 'GGGGGGGGGG', 'TTTTTTTTTT',
], { G: 0, T: 1 })
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Zıplama', tops, { bg: 10, tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true]), maps: [harita()] })
const baslangic = () => b('oyun_baslangic', {}, [
  b('harita_yukle', { M: 'zemin' }),
  ...yeniSprite('kahraman', 'oyuncu-kahraman', 'oyuncu', 80, 88),
  b('sprite_bayrak', { S: 'kahraman', F: 'stay', ON: 'true' }),
  b('hareket_ivme', { S: 'kahraman', AX: 0, AY: 520 }),
  b('den_hareket', { S: 'kahraman', M: 'h', N: 70 }),
])
const ziplaBlok = () => [b('hareket_hiz', { S: 'kahraman', VX: oku(v('kahraman'), 'vx'), VY: -250 }), b('ses_melodi', { M: 'ziplama' })]

export const OA_22_ZIPLAMA: OyunActivity = {
  id: 'ders-22-ziplama',
  title: 'A ile zıpla',
  intro: 'A düğmesine basınca kahraman yukarı fırlasın (y hızı -250). Ama havadayken A\'ya tekrar basarsa ikinci kez zıplamasın: "alttan bir duvara dokunuyor mu?" sorusunu kullan.',
  allowedBlocks: allow('oyun_baslangic', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'hareket_ivme', 'den_hareket', 'den_dugme', 'hareket_hiz', 'sprite_oku', 'sprite_dokunuyor', 'ses_melodi', 'sprite_konus', 'mantik', 'degisken', 'math_number'),
  starter: () => proje([baslangic()]),
  scenario: [{ do: 'seconds', s: 0.5 }, { do: 'tap', button: 'a' }, { do: 'seconds', s: 1 }],
  goals: [
    { id: 'ziplar', label: 'A\'ya basınca kahraman yukarı çıkıyor (en az 30 piksel)', hint: '"A düğmesine basılınca" olayında "hızı x … y -250" kullan; x yerine kahramanın kendi x hızını koy.', kind: 'moved', of: 'oyuncu', axis: 'y', min: 30 },
    { id: 'tek', label: 'Havada ikinci kez zıplamıyor (zıplama 70 pikseli geçmiyor)', hint: 'Zıplama bloklarını "eğer kahraman alttan bir duvara dokunuyor mu?" içine al.', kind: 'custom', test: (r) => alt(r, [{ do: 'seconds', s: 0.5 }, { do: 'tap', button: 'a' }, { do: 'wait', frames: 12 }, { do: 'tap', button: 'a' }, { do: 'seconds', s: 1 }], (r2) => (r2.moved.oyuncu?.y ?? 0) < 75 && (r2.moved.oyuncu?.y ?? 0) > 30) },
    { id: 'ses', label: 'Zıplayınca ses çalıyor', hint: 'Ses kategorisinden "zıplama melodisini çal" bloğunu ekle.', kind: 'event', name: 'sound' },
    { id: 'soru', label: 'Programın eğer bloğuyla "dokunuyor mu?" soruyor', hint: '"eğer" ve "dokunuyor mu?" bloklarını birleştir.', kind: 'usesBlocks', types: ['controls_if', 'sprite_dokunuyor'] },
  ],
  solution: () => proje([baslangic(), b('den_dugme', { B: 'a', E: 'press' }, ifThen(b('sprite_dokunuyor', { S: 'kahraman', D: 'down' }), ziplaBlok()))]),
}
