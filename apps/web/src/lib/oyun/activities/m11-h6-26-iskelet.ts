// Ders 26 — Oyun tasarımı ve iskelet: oyuncu + hedef + skor + can + bitiş.
import { allow, type OyunActivity } from '../activity'
import { b, cmp, diger, ifThen, makeProject, set } from './m11-ortak'

const kur = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  set('kedi', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })),
  b('sprite_konum', { S: 'kedi', X: 20, Y: 100 }),
  b('sprite_bayrak', { S: 'kedi', F: 'stay', ON: 'true' }),
  set('elma1', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })), b('sprite_konum', { S: 'elma1', X: 60, Y: 60 }),
  set('elma2', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })), b('sprite_konum', { S: 'elma2', X: 100, Y: 40 }),
  set('elma3', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })), b('sprite_konum', { S: 'elma3', X: 130, Y: 90 }),
  ...ek,
])

export const OA_26_ISKELET: OyunActivity = {
  id: 'ders-26-oyun-iskeleti',
  title: 'Oyun iskeletini kur',
  intro: 'Her oyunun bir iskeleti vardır: oyuncu, hedef, skor, can ve bir bitiş. Sahnede kedi ve üç elma hazır. Tamamla: kedi ok tuşlarıyla yürüsün; skor 0\'dan, can 3\'ten başlasın; elmaya değince skor 1 artsın ve elma silinsin; skor 3 olunca "Kazandın!" yazıp oyunu kazan.',
  allowedBlocks: allow('oyun_baslangic', 'sprite_carpisinca', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'den_hareket', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_sarsinti', 'sprite_sil', 'oyun_bu_sprite', 'oyun_diger_sprite', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'mantik', 'metin', 'degisken', 'math_number'),
  starter: () => makeProject('İskelet', [kur()]),
  scenario: [{ do: 'press', button: 'right', frames: 20 }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }],
  goals: [
    { id: 'yuru', label: 'Kedi ok tuşlarıyla yürüyor', hint: '"oyuncu tuşlarıyla … hareket etsin" bloğunu "oyun başlayınca" içine koy.', kind: 'moved', of: 'oyuncu', axis: 'x', min: 10 },
    { id: 'ayar', label: 'Skor ve can başlangıçta ayarlanıyor', hint: '"skoru 0 yap" ve "canı 3 yap" bloklarını ekle.', kind: 'usesBlocks', types: ['oyun_skor_ayarla', 'oyun_can_ayarla'] },
    { id: 'skor', label: 'Üç elma yenince skor 3 oluyor', hint: '"bir oyuncu sprite\'ı bir yiyecek sprite\'ına çarpınca" olayında skoru 1 değiştir.', kind: 'score', op: 'gte', value: 3 },
    { id: 'sil', label: 'Yenen elmalar sahneden kalkıyor', hint: '"diğer sprite\'ını sil".', kind: 'custom', test: (r) => r.engine.spritesOfKind('yiyecek').length === 0 },
    { id: 'kazan', label: 'Skor 3 olunca oyun kazanılıyor', hint: 'Çarpışma olayının içinde "eğer skor ≥ 3 ise oyunu bitir: kazandın" kur.', kind: 'gameOver', result: 'win' },
  ],
  solution: () => makeProject('İskelet', [
    kur([b('den_hareket', { S: 'kedi', M: 'four', N: 60 }), b('oyun_skor_ayarla', { N: 0 }), b('oyun_can_ayarla', { N: 3 })]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
      b('sprite_sil', { S: diger() }),
      ifThen(cmp('GTE', b('oyun_skor'), 3), [b('oyun_mesaj', { T: 'Kazandın!', N: 2 }), b('oyun_bitir', { R: 'win' })]),
    ]),
  ]),
}
