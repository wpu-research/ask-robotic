import { abs, add, b, change, cmp, forRange, ifThen, mul, or, rnd, set, sub, v } from '../dsl'
import { bu, diger, makeProject, mapFromRows, oku, tiles, type OyunSample } from './kit'

// 5) Yılan ───────────────────────────────────────────────────
export const YILAN: OyunSample = {
  id: 'yilan', name: 'Yılan', level: 3, controls: 'Ok tuşlarıyla yönünü değiştir. Kendine ve duvara çarpma!',
  summary: 'Elmaları ye, uzadıkça uzan. Gövde parçaları belli bir süre sonra yok olur; uzunluk değişkeni bunu belirler.',
  project: () => makeProject('Yılan', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 15 }),
      set('bas', b('sprite_yeni', { IMG: 'oyuncu-yilan-bas', K: 'oyuncu' })),
      b('sprite_konum', { S: 'bas', X: 84, Y: 60 }),
      set('dx', 8),
      set('dy', 0),
      set('uzunluk', 3),
      set('yem', b('sprite_yeni', { IMG: 'yiyecek-mini-elma', K: 'yiyecek' })),
      b('sprite_konum', { S: 'yem', X: 124, Y: 60 }),
      b('oyun_skor_ayarla', { N: 0 }),
    ]),
    b('oyun_her_n_ms', { MS: 130 }, [
      set('parca', b('sprite_yeni', { IMG: 'nesne-yilan-govde', K: 'engel' })),
      b('sprite_konum', { S: 'parca', X: oku(v('bas'), 'x'), Y: oku(v('bas'), 'y') }),
      b('sprite_omur', { S: 'parca', N: mul(v('uzunluk'), 130) }),
      b('sprite_konum', { S: 'bas', X: add(oku(v('bas'), 'x'), v('dx')), Y: add(oku(v('bas'), 'y'), v('dy')) }),
      ifThen(
        or(or(cmp('LT', oku(v('bas'), 'x'), 0), cmp('GT', oku(v('bas'), 'x'), 160)), or(cmp('LT', oku(v('bas'), 'y'), 0), cmp('GT', oku(v('bas'), 'y'), 120))),
        b('oyun_bitir', { R: 'lose' }),
      ),
    ]),
    b('den_dugme', { B: 'up', E: 'press' }, ifThen(cmp('NEQ', v('dy'), 8), [set('dx', 0), set('dy', -8)])),
    b('den_dugme', { B: 'down', E: 'press' }, ifThen(cmp('NEQ', v('dy'), -8), [set('dx', 0), set('dy', 8)])),
    b('den_dugme', { B: 'left', E: 'press' }, ifThen(cmp('NEQ', v('dx'), 8), [set('dx', -8), set('dy', 0)])),
    b('den_dugme', { B: 'right', E: 'press' }, ifThen(cmp('NEQ', v('dx'), -8), [set('dx', 8), set('dy', 0)])),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
      b('oyun_skor_degistir', { N: 1 }),
      change('uzunluk', 1),
      b('ses_melodi', { M: 'puan' }),
      b('sprite_konum', { S: diger(), X: add(mul(rnd(0, 19), 8), 4), Y: add(mul(rnd(0, 14), 8), 4) }),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'engel' }, [
      b('oyun_sarsinti', { N: 300 }),
      b('oyun_bitir', { R: 'lose' }),
    ]),
  ]),
}

// 6) Tuğla kırma ─────────────────────────────────────────────
export const TUGLA: OyunSample = {
  id: 'tugla-kirma', name: 'Tuğla kırma', level: 2, controls: 'Sol/sağ tuşlarıyla raketi hareket ettir.',
  summary: 'Topu raketle zıplat ve tüm tuğlaları kır. Top aşağı kaçarsa can gider.',
  project: () => makeProject('Tuğla kırma', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 15 }),
      set('raket', b('sprite_yeni', { IMG: 'nesne-raket', K: 'oyuncu' })),
      b('sprite_konum', { S: 'raket', X: 80, Y: 112 }),
      b('den_hareket', { S: 'raket', M: 'h', N: 120 }),
      b('sprite_bayrak', { S: 'raket', F: 'stay', ON: 'true' }),
      set('top', b('sprite_yeni', { IMG: 'nesne-top', K: 'mermi' })),
      b('sprite_konum', { S: 'top', X: 80, Y: 90 }),
      b('hareket_hiz', { S: 'top', VX: 40, VY: -75 }),
      forRange('sat', 0, 2, 1, [
        forRange('sut', 0, 9, 1, [
          set('tugla', b('sprite_yeni', { IMG: 'nesne-tugla', K: 'engel' })),
          ifThen(cmp('EQ', v('sat'), 1), b('sprite_resim', { S: 'tugla', IMG: 'nesne-tugla-sari' }), undefined, [[cmp('EQ', v('sat'), 2), b('sprite_resim', { S: 'tugla', IMG: 'nesne-tugla-mavi' })]]),
          b('sprite_konum', { S: 'tugla', X: add(mul(v('sut'), 16), 8), Y: add(mul(v('sat'), 8), 18) }),
        ]),
      ]),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 3 }),
    ]),
    b('oyun_her_kare', {}, [
      ifThen(cmp('LT', oku(v('top'), 'x'), 4), [
        b('sprite_konum', { S: 'top', X: 4, Y: oku(v('top'), 'y') }),
        b('hareket_hiz', { S: 'top', VX: abs(oku(v('top'), 'vx')), VY: oku(v('top'), 'vy') }),
      ]),
      ifThen(cmp('GT', oku(v('top'), 'x'), 156), [
        b('sprite_konum', { S: 'top', X: 156, Y: oku(v('top'), 'y') }),
        b('hareket_hiz', { S: 'top', VX: sub(0, abs(oku(v('top'), 'vx'))), VY: oku(v('top'), 'vy') }),
      ]),
      ifThen(cmp('LT', oku(v('top'), 'y'), 4), [
        b('sprite_konum', { S: 'top', X: oku(v('top'), 'x'), Y: 4 }),
        b('hareket_hiz', { S: 'top', VX: oku(v('top'), 'vx'), VY: abs(oku(v('top'), 'vy')) }),
      ]),
      ifThen(cmp('GT', oku(v('top'), 'y'), 124), [
        b('oyun_can_degistir', { N: -1 }),
        b('oyun_sarsinti', { N: 250 }),
        b('sprite_konum', { S: 'top', X: 80, Y: 90 }),
        b('hareket_hiz', { S: 'top', VX: 40, VY: -75 }),
      ]),
      ifThen(cmp('EQ', b('sprite_sayisi', { K: 'engel' }), 0), [
        b('oyun_mesaj', { T: 'Hepsini kırdın!', N: 2 }),
        b('oyun_bitir', { R: 'win' }),
      ]),
    ]),
    b('sprite_carpisinca', { KA: 'mermi', KB: 'engel' }, [
      b('oyun_skor_degistir', { N: 10 }),
      b('ses_bip', { F: 520, MS: 60 }),
      ifThen(
        cmp('GT', oku(bu(), 'y'), oku(diger(), 'y')),
        b('hareket_hiz', { S: bu(), VX: oku(bu(), 'vx'), VY: abs(oku(bu(), 'vy')) }),
        b('hareket_hiz', { S: bu(), VX: oku(bu(), 'vx'), VY: sub(0, abs(oku(bu(), 'vy'))) }),
      ),
      b('sprite_sil', { S: diger() }),
    ]),
    b('sprite_carpisinca', { KA: 'mermi', KB: 'oyuncu' }, [
      b('hareket_hiz', { S: bu(), VX: mul(sub(oku(bu(), 'x'), oku(diger(), 'x')), 4), VY: -75 }),
      b('sprite_konum', { S: bu(), X: oku(bu(), 'x'), Y: 100 }),
      b('ses_bip', { F: 330, MS: 60 }),
    ]),
  ]),
}

// 7) Koşucu ──────────────────────────────────────────────────
export const KOSUCU: OyunSample = {
  id: 'kosucu', name: 'Koşucu', level: 2, controls: 'A (boşluk) ya da yukarı ile zıpla.',
  summary: 'Kaktüslerin üstünden zıpla, altınları topla. Zamanla oyun hızlanır.',
  project: () => makeProject('Koşucu', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 10 }),
      b('harita_yukle', { M: 'yol' }),
      set('kos', b('sprite_yeni', { IMG: 'oyuncu-kahraman', K: 'oyuncu' })),
      b('sprite_konum', { S: 'kos', X: 28, Y: 80 }),
      b('hareket_ivme', { S: 'kos', AX: 0, AY: 620 }),
      set('hiz', 80),
      b('oyun_skor_ayarla', { N: 0 }),
    ]),
    b('den_dugme', { B: 'a', E: 'press' }, ifThen(b('sprite_dokunuyor', { S: 'kos', D: 'down' }), [
      b('hareket_hiz', { S: 'kos', VX: 0, VY: -265 }),
      b('ses_melodi', { M: 'ziplama' }),
    ])),
    b('den_dugme', { B: 'up', E: 'press' }, ifThen(b('sprite_dokunuyor', { S: 'kos', D: 'down' }), [
      b('hareket_hiz', { S: 'kos', VX: 0, VY: -265 }),
      b('ses_melodi', { M: 'ziplama' }),
    ])),
    b('oyun_her_n_ms', { MS: 900 }, ifThen(cmp('NEQ', rnd(1, 3), 1), [
      set('engel', b('sprite_yeni', { IMG: 'dusman-kaktus', K: 'engel' })),
      b('sprite_konum', { S: 'engel', X: 176, Y: 88 }),
      b('hareket_hiz', { S: 'engel', VX: sub(0, v('hiz')), VY: 0 }),
      b('sprite_bayrak', { S: 'engel', F: 'autoDestroy', ON: 'true' }),
    ])),
    b('oyun_her_n_ms', { MS: 2600 }, [
      set('altin', b('sprite_yeni', { IMG: 'nesne-altin', K: 'bonus' })),
      b('sprite_konum', { S: 'altin', X: 176, Y: add(50, rnd(0, 25)) }),
      b('hareket_hiz', { S: 'altin', VX: sub(0, v('hiz')), VY: 0 }),
      b('sprite_bayrak', { S: 'altin', F: 'autoDestroy', ON: 'true' }),
    ]),
    b('oyun_her_n_ms', { MS: 1000 }, [
      b('oyun_skor_degistir', { N: 1 }),
      ifThen(cmp('LT', v('hiz'), 150), change('hiz', 3)),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'bonus' }, [
      b('oyun_skor_degistir', { N: 5 }),
      b('ses_melodi', { M: 'puan' }),
      b('sprite_sil', { S: diger() }),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'engel' }, [
      b('oyun_sarsinti', { N: 300 }),
      b('oyun_bitir', { R: 'lose' }),
    ]),
  ], {
    bg: 10,
    tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true]),
    maps: [mapFromRows('yol', ['..........', '..........', '..........', '..........', '..........', '..........', 'GGGGGGGGGG', 'TTTTTTTTTT'], { G: 0, T: 1 })],
  }),
}

// 8) Balon patlat ────────────────────────────────────────────
export const BALON: OyunSample = {
  id: 'balon-patlat', name: 'Balon patlat', level: 1, controls: 'Ok tuşlarıyla nişangâhı gezdir, A (boşluk) ile patlat.',
  summary: '40 saniyede olabildiğince çok balon patlat. Yukarı kaçan balon bir canını götürür.',
  project: () => makeProject('Balon patlat', [
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 10 }),
      set('nisan', b('sprite_yeni', { IMG: 'nesne-yildiz', K: 'oyuncu' })),
      b('sprite_konum', { S: 'nisan', X: 80, Y: 60 }),
      b('sprite_katman', { S: 'nisan', N: 5 }),
      b('den_hareket', { S: 'nisan', M: 'four', N: 80 }),
      b('sprite_bayrak', { S: 'nisan', F: 'stay', ON: 'true' }),
      b('oyun_skor_ayarla', { N: 0 }),
      b('oyun_can_ayarla', { N: 5 }),
      b('oyun_sure_baslat', { N: 40 }),
    ]),
    b('oyun_her_n_ms', { MS: 600 }, [
      set('balon', b('sprite_yeni', { IMG: 'nesne-balon', K: 'hedef' })),
      set('renk', rnd(1, 3)),
      ifThen(cmp('EQ', v('renk'), 2), b('sprite_resim', { S: 'balon', IMG: 'nesne-balon-mavi' }), undefined, [[cmp('EQ', v('renk'), 3), b('sprite_resim', { S: 'balon', IMG: 'nesne-balon-sari' })]]),
      b('sprite_konum', { S: 'balon', X: rnd(10, 150), Y: 132 }),
      b('hareket_hiz', { S: 'balon', VX: 0, VY: sub(0, rnd(20, 45)) }),
    ]),
    b('den_dugme', { B: 'a', E: 'press' }, [
      b('sprite_her_biri', { K: 'hedef' }, ifThen(b('sprite_cakisiyor', { A: bu(), B: v('nisan') }), [
        b('sprite_patlat', { S: bu() }),
        b('oyun_skor_degistir', { N: 1 }),
        b('ses_melodi', { M: 'patlama' }),
      ])),
    ]),
    b('oyun_her_kare', {}, [
      b('sprite_her_biri', { K: 'hedef' }, ifThen(cmp('LT', oku(bu(), 'y'), -10), [
        b('oyun_can_degistir', { N: -1 }),
        b('sprite_sil', { S: bu() }),
      ])),
    ]),
    b('oyun_sure_bitince', {}, [
      b('oyun_mesaj', { T: 'Süre doldu!', N: 2 }),
      b('oyun_bitir', { R: 'win' }),
    ]),
  ]),
}

