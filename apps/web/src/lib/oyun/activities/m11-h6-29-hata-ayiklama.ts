// Ders 29 — Cila ve hata ayıklama: bozuk bir oyunu düzelt, sonra ses/sarsıntı ekle.
import { allow, type OyunActivity } from '../activity'
import { alt, b, bu, cmp, diger, ifThen, makeProject, oku, rnd, set, yeniSprite } from './m11-ortak'

const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  ...yeniSprite('sepet', 'oyuncu-kedi', 'oyuncu', 80, 104),
  b('den_hareket', { S: 'sepet', M: 'h', N: 90 }),
  b('sprite_bayrak', { S: 'sepet', F: 'stay', ON: 'true' }),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
])
const uret = () => b('oyun_her_n_ms', { MS: 700 }, [
  set('meyve', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })),
  b('sprite_konum', { S: 'meyve', X: rnd(10, 150), Y: -8 }),
  b('hareket_hiz', { S: 'meyve', VX: 0, VY: rnd(35, 70) }),
])
const kacirma = (duzgun: boolean) => b('oyun_her_kare', {}, b('sprite_her_biri', { K: 'yiyecek' }, ifThen(cmp('GT', oku(bu(), 'y'), 116), duzgun
  ? [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 200 }), b('sprite_sil', { S: bu() })]
  : [b('oyun_can_degistir', { N: -1 })])))

export const OA_29_HATA_AYIKLAMA: OyunActivity = {
  id: 'ders-29-cila-ve-hata-ayiklama',
  title: 'Bozuk oyunu onar',
  intro: 'Bu meyve yakalama oyununda üç hata var. (1) Meyveyi yakalayınca skor azalıyor. (2) Yakalanan meyve ekranda kalıyor. (3) Kaçan meyve, aşağıda durduğu sürece her karede bir can götürüyor. Hataları bul ve düzelt; sonra yakalayınca puan sesi çal, can kaybedince ekranı salla.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_n_ms', 'oyun_her_kare', 'sprite_carpisinca', 'sprite_her_biri', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'sprite_oku', 'sprite_bayrak', 'hareket_hiz', 'sprite_sil', 'oyun_bu_sprite', 'oyun_diger_sprite', 'den_hareket', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_sarsinti', 'ses_melodi', 'oyun_patlama', 'oyun_bitir', 'oyun_skor', 'oyun_mesaj', 'metin', 'mantik', 'matematik', 'degisken'),
  starter: () => makeProject('Bozuk oyun', [
    baslangic(), uret(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: -1 })]),
    kacirma(false),
  ]),
  scenario: [{ do: 'seconds', s: 1.2 }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'wait', frames: 10 }],
  goals: [
    { id: 'skor', label: 'Meyveyi yakalayınca skor artıyor', hint: 'Hata 1: "skoru -1 değiştir" bloğundaki sayıyı düzelt.', kind: 'score', op: 'increased' },
    { id: 'silindi', label: 'Yakalanan meyve ekrandan kalkıyor', hint: 'Hata 2: çarpışma olayına "diğer sprite\'ını sil" ekle.', kind: 'custom', test: (r) => { const k = r.engine.spritesOfKind('oyuncu')[0]; return !!k && !r.engine.spritesOfKind('yiyecek').some((m) => Math.hypot(m.x - k.x, m.y - k.y) < 12) } },
    { id: 'kacirma', label: 'Kaçan meyve yalnız bir can götürüyor', hint: 'Hata 3: kaçan meyveyi, canı azalttıktan sonra sil.', kind: 'custom', test: (r) => alt(r, [{ do: 'spawn', image: 'yiyecek-elma', kind: 'yiyecek', x: 20, y: 118 }, { do: 'seconds', s: 1 }], (r2) => r2.engine.life === r2.startLife - 1 && r2.engine.state === 'running') },
    { id: 'ses', label: 'Yakalayınca ses çalıyor', hint: 'Ses kategorisinden "puan melodisini çal".', kind: 'event', name: 'sound' },
    { id: 'sallanti', label: 'Can kaybedince ekran sallanıyor', hint: '"ekranı 200 ms salla" bloğunu ekle.', kind: 'custom', test: (r) => alt(r, [{ do: 'spawn', image: 'yiyecek-elma', kind: 'yiyecek', x: 20, y: 118 }, { do: 'seconds', s: 1 }], (r2) => r2.engine.stats.shakes >= 1) },
  ],
  solution: () => makeProject('Onarılmış oyun', [
    baslangic(), uret(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() })]),
    kacirma(true),
  ]),
}
