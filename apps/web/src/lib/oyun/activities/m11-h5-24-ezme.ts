// Ders 24 — Düşmanın üstüne zıpla: çarpışmada yönü ayırt et.
import { allow, type OyunActivity } from '../activity'
import { alt, and, b, bu, cmp, diger, ifThen, makeProject, mapFromRows, oku, sub, tiles, v, yeniSprite } from './m11-ortak'

const YOL = ['....................', '....................', '....................', '....................', '....................', '....................', 'GGGGGGGGGGGGGGGGGGGG', 'TTTTTTTTTTTTTTTTTTTT']
const harita = () => mapFromRows('yol', YOL, { G: 0, T: 1 })
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Ezme', tops, { bg: 10, tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true]), maps: [harita()] })
const bas = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [
  b('harita_yukle', { M: 'yol' }),
  ...yeniSprite('kahraman', 'oyuncu-kahraman', 'oyuncu', 40, 88),
  b('harita_konumla', { S: 'kahraman', C: 2, R: 5 }),
  b('sprite_bayrak', { S: 'kahraman', F: 'stay', ON: 'true' }),
  b('hareket_ivme', { S: 'kahraman', AX: 0, AY: 520 }),
  b('den_hareket', { S: 'kahraman', M: 'h', N: 70 }),
  b('kamera_takip', { S: 'kahraman' }),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
  // uzakta bir balçık
  ...yeniSprite('balcik', 'dusman-balcik', 'dusman', 280, 88),
  ...ek,
])
const balcikOlusunca = () => b('sprite_olusunca', { K: 'dusman' }, [
  b('hareket_ivme', { S: bu(), AX: 0, AY: 520 }),
  b('hareket_hiz', { S: bu(), VX: 25, VY: 0 }),
  b('sprite_bayrak', { S: bu(), F: 'stay', ON: 'true' }),
])
const devriye = () => b('oyun_her_kare', {}, b('sprite_her_biri', { K: 'dusman' }, [
  ifThen(b('sprite_dokunuyor', { S: bu(), D: 'right' }), b('hareket_hiz', { S: bu(), VX: -25, VY: oku(bu(), 'vy') })),
  ifThen(b('sprite_dokunuyor', { S: bu(), D: 'left' }), b('hareket_hiz', { S: bu(), VX: 25, VY: oku(bu(), 'vy') })),
]))
const ziplama = () => b('den_dugme', { B: 'a', E: 'press' }, ifThen(b('sprite_dokunuyor', { S: 'kahraman', D: 'down' }), b('hareket_hiz', { S: 'kahraman', VX: oku(v('kahraman'), 'vx'), VY: -250 })))
const ortak = () => [bas(), balcikOlusunca(), devriye(), ziplama()]

export const OA_24_EZME: OyunActivity = {
  id: 'ders-24-dusmanin-ustune-zipla',
  title: 'Balçığın üstüne zıpla',
  intro: 'Kahraman balçığa çarpınca iki şey olabilir: üstten düşerek çarparsa balçık patlasın ve skor 5 artsın; yandan çarparsa kahraman can kaybetsin ve başlangıç karosuna dönsün. Ayırt etmek için kahramanın y hızına (aşağı doğru ise pozitif) ve konumuna bak.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_kare', 'sprite_olusunca', 'sprite_her_biri', 'sprite_carpisinca', 'oyun_bu_sprite', 'oyun_diger_sprite', 'sprite_oku', 'sprite_dokunuyor', 'sprite_patlat', 'hareket_hiz', 'hareket_ivme', 'harita_konumla', 'oyun_skor_degistir', 'oyun_can_degistir', 'oyun_sarsinti', 'ses_melodi', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'den_hareket', 'den_dugme', 'kamera_takip', 'oyun_skor_ayarla', 'oyun_can_ayarla', 'mantik', 'matematik', 'degisken'),
  starter: () => proje(ortak()),
  scenario: [{ do: 'seconds', s: 1 }, { do: 'spawn', image: 'dusman-balcik', kind: 'dusman', x: 80, y: 88 }, { do: 'place', kind: 'oyuncu', x: 80, y: 62 }, { do: 'seconds', s: 1 }],
  goals: [
    { id: 'ezme', label: 'Üstten düşünce balçık patlıyor, skor 5 oluyor', hint: '"eğer kahraman y hızı > 10 ve kahramanın y\'si balçığın y\'sinden küçükse" kontrolünü kur.', kind: 'score', op: 'gte', value: 5 },
    { id: 'gitti', label: 'Ezilen balçık sahneden kalktı', kind: 'custom', hint: '"diğer sprite patlayıp yok olsun" bloğunu kullan.', test: (r) => !r.engine.spritesOfKind('dusman').some((s) => Math.abs(s.x - 80) < 40) },
    { id: 'cansiz', label: 'Ezerken can kaybedilmiyor', kind: 'life', op: 'gte', value: 3, hint: 'Can azaltma bloğu "değilse" kolunda olmalı.' },
    { id: 'yan', label: 'Yandan çarpınca can azalıyor', hint: '"değilse" kolunda canı -1 değiştir ve kahramanı başlangıca koy.', kind: 'custom', test: (r) => alt(r, [{ do: 'seconds', s: 0.3 }, { do: 'spawn', image: 'dusman-balcik', kind: 'dusman', x: 44, y: 88 }, { do: 'seconds', s: 0.5 }], (r2) => r2.minLife < r2.startLife) },
  ],
  solution: () => proje([
    ...ortak(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
      ifThen(
        and(cmp('GT', oku(bu(), 'vy'), 10), cmp('LT', oku(bu(), 'y'), sub(oku(diger(), 'y'), 4))),
        [b('sprite_patlat', { S: diger() }), b('oyun_skor_degistir', { N: 5 }), b('hareket_hiz', { S: bu(), VX: oku(bu(), 'vx'), VY: -150 }), b('ses_melodi', { M: 'patlama' })],
        [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('harita_konumla', { S: bu(), C: 2, R: 5 }), b('hareket_hiz', { S: bu(), VX: 0, VY: 0 })],
      ),
    ]),
  ]),
}
