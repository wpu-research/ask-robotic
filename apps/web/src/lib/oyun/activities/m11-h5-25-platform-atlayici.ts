// Ders 25 (proje) — Platform atlayıcı: altın + diken + düşman + kapı.
import { allow, type OyunActivity } from '../activity'
import { and, b, bu, cmp, diger, ifThen, makeProject, mapFromRows, oku, olayKaro, sub, tiles, v, yeniSprite } from './m11-ortak'

const COLS = 24
function haritaSatirlari(): string[] {
  const g: string[][] = Array.from({ length: 8 }, () => Array(COLS).fill('.'))
  for (let c = 0; c < COLS; c++) { g[6][c] = 'G'; g[7][c] = 'T' }
  for (const c of [4, 5, 6, 14, 15, 16]) g[4][c] = 'P'
  for (const c of [5, 15]) g[3][c] = 'C'
  for (const c of [9, 19]) g[5][c] = 'S'
  g[5][13] = 'E'
  g[5][22] = 'D'
  return g.map((r) => r.join(''))
}
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Platform atlayıcı', tops, {
  bg: 10,
  tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true], ['karo-platform', true], ['nesne-altin', false], ['karo-diken', false], ['dusman-balcik', false], ['nesne-kapi', false]),
  maps: [mapFromRows('seviye', haritaSatirlari(), { G: 0, T: 1, P: 2, C: 3, S: 4, E: 5, D: 6 })],
})
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  b('harita_yukle', { M: 'seviye' }),
  ...yeniSprite('kahraman', 'oyuncu-kahraman', 'oyuncu', 40, 88),
  b('harita_konumla', { S: 'kahraman', C: 2, R: 5 }),
  b('sprite_bayrak', { S: 'kahraman', F: 'stay', ON: 'true' }),
  b('hareket_ivme', { S: 'kahraman', AX: 0, AY: 520 }),
  b('den_hareket', { S: 'kahraman', M: 'h', N: 70 }),
  b('kamera_takip', { S: 'kahraman' }),
  b('harita_sprite_yap', { IMG: 'dusman-balcik', K: 'dusman' }),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
])
const hazir = () => [
  baslangic(),
  b('sprite_olusunca', { K: 'dusman' }, [b('hareket_ivme', { S: bu(), AX: 0, AY: 520 }), b('hareket_hiz', { S: bu(), VX: 25, VY: 0 }), b('sprite_bayrak', { S: bu(), F: 'stay', ON: 'true' })]),
  b('oyun_her_kare', {}, b('sprite_her_biri', { K: 'dusman' }, [
    ifThen(b('sprite_dokunuyor', { S: bu(), D: 'right' }), b('hareket_hiz', { S: bu(), VX: -25, VY: oku(bu(), 'vy') })),
    ifThen(b('sprite_dokunuyor', { S: bu(), D: 'left' }), b('hareket_hiz', { S: bu(), VX: 25, VY: oku(bu(), 'vy') })),
  ])),
  b('den_dugme', { B: 'a', E: 'press' }, ifThen(b('sprite_dokunuyor', { S: 'kahraman', D: 'down' }), [b('hareket_hiz', { S: 'kahraman', VX: oku(v('kahraman'), 'vx'), VY: -250 }), b('ses_melodi', { M: 'ziplama' })])),
  b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [
    ifThen(
      and(cmp('GT', oku(bu(), 'vy'), 10), cmp('LT', oku(bu(), 'y'), sub(oku(diger(), 'y'), 4))),
      [b('sprite_patlat', { S: diger() }), b('oyun_skor_degistir', { N: 5 }), b('hareket_hiz', { S: bu(), VX: oku(bu(), 'vx'), VY: -150 })],
      [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('harita_konumla', { S: bu(), C: 2, R: 5 }), b('hareket_hiz', { S: bu(), VX: 0, VY: 0 })],
    ),
  ]),
]

export const OA_25_PLATFORM_ATLAYICI: OyunActivity = {
  id: 'ders-25-proje-platform-atlayici',
  title: 'Proje: Platform atlayıcı',
  intro: 'Kahraman yürüyor, zıplıyor ve balçıkları eziyor; bunlar hazır. Oyunu tamamla: (1) altına dokununca altın kaybolsun, skor artsın; (2) dikene dokununca can azalsın ve kahraman başa dönsün; (3) kapıya dokununca "Seviye bitti!" yazsın ve oyun kazanılsın.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_kare', 'sprite_olusunca', 'sprite_her_biri', 'sprite_carpisinca', 'harita_karoya_dokununca', 'harita_olay_karo', 'harita_karo_sil', 'harita_konumla', 'harita_yukle', 'oyun_harita', 'harita_sprite_yap', 'kamera_takip', 'oyun_bu_sprite', 'oyun_diger_sprite', 'sprite_oku', 'sprite_dokunuyor', 'sprite_patlat', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'hareket_hiz', 'hareket_ivme', 'den_hareket', 'den_dugme', 'oyun_skor_degistir', 'oyun_skor_ayarla', 'oyun_can_degistir', 'oyun_can_ayarla', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'sahne_renk', 'mantik', 'matematik', 'metin', 'degisken'),
  starter: () => proje(hazir()),
  scenario: [
    { do: 'seconds', s: 0.5 }, { do: 'goto', kind: 'oyuncu', col: 5, row: 3 }, { do: 'seconds', s: 0.3 },
    { do: 'goto', kind: 'oyuncu', col: 9, row: 5 }, { do: 'seconds', s: 0.3 },
    { do: 'goto', kind: 'oyuncu', col: 22, row: 5 }, { do: 'seconds', s: 0.3 },
  ],
  goals: [
    { id: 'altin', label: 'Altın toplanınca haritadan kayboluyor ve skor artıyor', hint: '"bir oyuncu sprite\'ı altın karosuna dokununca" olayını kur.', kind: 'tileCount', image: 'nesne-altin', max: 1 },
    { id: 'skor', label: 'Skor arttı', kind: 'score', op: 'gte', value: 1, hint: 'Altın olayına "skoru 1 değiştir" ekle.' },
    { id: 'diken', label: 'Dikene dokununca can azalıyor', kind: 'life', op: 'decreased', hint: 'Dikenli karo için ayrı bir "karosuna dokununca" olayı kur.' },
    { id: 'kapi', label: 'Kapıya dokununca oyun kazanılıyor', kind: 'gameOver', result: 'win', hint: 'Kapı karosuna dokununca "oyunu bitir: kazandın" bloğunu çalıştır.' },
    { id: 'mesaj', label: 'Kazanırken ekrana mesaj yazılıyor', kind: 'event', name: 'message', hint: '"ekranda … yaz, 2 saniye" bloğunu ekle.' },
  ],
  solution: () => proje([
    ...hazir(),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-altin' }, [b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }), b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' })]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'karo-diken' }, [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('harita_konumla', { S: bu(), C: 2, R: 5 }), b('hareket_hiz', { S: bu(), VX: 0, VY: 0 })]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-kapi' }, [b('oyun_mesaj', { T: 'Seviye bitti!', N: 2 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' })]),
  ]),
}
