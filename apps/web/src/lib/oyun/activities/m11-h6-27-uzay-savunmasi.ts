// Ders 27 (tam oyun 1) — Uzay savunması: ateş + skor + can + süre + zorluk.
import { allow, type OyunActivity } from '../activity'
import { add, alt, b, bu, change, diger, makeProject, oku, rnd, set, sub, v, yeniSprite } from './m11-ortak'

const baslangic = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 0 }),
  ...yeniSprite('gemi', 'oyuncu-gemi', 'oyuncu', 80, 104),
  b('den_hareket', { S: 'gemi', M: 'h', N: 80 }),
  b('sprite_bayrak', { S: 'gemi', F: 'stay', ON: 'true' }),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
  set('hiz', 0),
  ...ek,
])
const ates = () => b('den_dugme', { B: 'a', E: 'press' }, [
  set('lazer', b('sprite_yeni', { IMG: 'nesne-lazer', K: 'mermi' })),
  b('sprite_konum', { S: 'lazer', X: oku(v('gemi'), 'x'), Y: sub(oku(v('gemi'), 'y'), 12) }),
  b('hareket_hiz', { S: 'lazer', VX: 0, VY: -140 }),
  b('sprite_bayrak', { S: 'lazer', F: 'autoDestroy', ON: 'true' }),
  b('ses_melodi', { M: 'lazer' }),
])
const uret = (hizli: boolean) => b('oyun_her_n_ms', { MS: 800 }, [
  set('ufo', b('sprite_yeni', { IMG: 'dusman-uzayli', K: 'dusman' })),
  b('sprite_konum', { S: 'ufo', X: rnd(10, 150), Y: -8 }),
  b('hareket_hiz', { S: 'ufo', VX: 0, VY: hizli ? add(rnd(20, 45), v('hiz')) : rnd(20, 45) }),
  b('sprite_bayrak', { S: 'ufo', F: 'autoDestroy', ON: 'true' }),
])
const SC = [{ do: 'seconds', s: 3 }, { do: 'tap', button: 'a' }, { do: 'collide', a: 'mermi', b: 'dusman' }, { do: 'seconds', s: 0.5 }, { do: 'collide', a: 'oyuncu', b: 'dusman' }] as const

export const OA_27_UZAY_SAVUNMASI: OyunActivity = {
  id: 'ders-27-tam-oyun-uzay-savunmasi',
  title: 'Tam oyun: Uzay savunması',
  intro: 'Gemi, lazer ve uzaylı yağmuru hazır. Oyunu tamamla: (1) lazer uzaylıyı vurunca patlasın, skor 10 artsın; (2) uzaylı gemiye değince can azalsın, uzaylı yok olsun; (3) oyun 30 saniye sürsün, süre bitince "Dünya kurtuldu!" yazıp kazan; (4) zorluk: her 4 saniyede "hiz" değişkenini 5 artır ve yeni uzaylıların hızına ekle.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_n_ms', 'oyun_sure_bitince', 'den_dugme', 'sprite_carpisinca', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'sprite_oku', 'sprite_bayrak', 'hareket_hiz', 'sprite_patlat', 'sprite_sil', 'oyun_bu_sprite', 'oyun_diger_sprite', 'den_hareket', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_sure_baslat', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'mantik', 'matematik', 'metin', 'degisken'),
  starter: () => makeProject('Uzay savunması', [baslangic(), ates(), uret(false)]),
  scenario: SC,
  goals: [
    { id: 'vur', label: 'Lazer uzaylıyı vurunca skor artıyor', hint: '"bir mermi sprite\'ı bir düşman sprite\'ına çarpınca": skor +10, uzaylıyı patlat, lazeri sil.', kind: 'score', op: 'increased' },
    { id: 'can', label: 'Uzaylı gemiye değince can azalıyor', hint: '"bir oyuncu sprite\'ı bir düşman sprite\'ına çarpınca": canı -1 değiştir, uzaylıyı sil.', kind: 'life', op: 'decreased' },
    { id: 'sure', label: 'Oyun 30 saniye sonra bitiyor', hint: 'Başlangıçta "geri sayımı 30 saniyeden başlat"; "süre bitince" olayında oyunu kazan.', kind: 'custom', test: (r) => r.blocksUsed.has('oyun_sure_baslat') && alt(r, [{ do: 'seconds', s: 31 }], (r2) => r2.engine.state === 'over') },
    { id: 'zor', label: 'Zorluk zamanla artıyor ("hiz" değişkeni değişiyor ve uzaylıya ekleniyor)', hint: '"her 4000 ms\'de bir" olayında "hiz değişkenini 5 kadar değiştir"; uzaylının y hızına "+ hiz" ekle.', kind: 'usesBlocks', types: ['math_change', 'math_arithmetic'] },
    { id: 'kazan', label: 'Süre bitince kazanılıyor', hint: '"süre bitince" olayına "oyunu bitir: kazandın" koy.', kind: 'custom', test: (r) => r.blocksUsed.has('oyun_sure_bitince') && r.blocksUsed.has('oyun_bitir') },
  ],
  solution: () => makeProject('Uzay savunması', [
    baslangic([b('oyun_sure_baslat', { N: 30 })]), ates(), uret(true),
    b('oyun_her_n_ms', { MS: 4000 }, change('hiz', 5)),
    b('sprite_carpisinca', { KA: 'mermi', KB: 'dusman' }, [b('oyun_skor_degistir', { N: 10 }), b('ses_melodi', { M: 'patlama' }), b('sprite_patlat', { S: diger() }), b('sprite_sil', { S: bu() })]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('sprite_sil', { S: diger() })]),
    b('oyun_sure_bitince', {}, [b('oyun_mesaj', { T: 'Dünya kurtuldu!', N: 2 }), b('oyun_bitir', { R: 'win' })]),
  ]),
}
