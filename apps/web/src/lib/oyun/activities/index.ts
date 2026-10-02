// Örnek ders etkinlikleri. Ders yazarları bunları kopyalayıp değiştirir (bkz. ../README.md "Etkinlik yazımı").
import { allow, type OyunActivity } from '../activity'
import { b, cmp, ifThen, set } from '../dsl'
import { diger, makeProject, mapFromRows, olayKaro, tiles } from '../samples/kit'

const kediOlustur = () => set('kedi', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' }))

// 1) İlk sprite ───────────────────────────────────────────────
const ILK_SPRITE: OyunActivity = {
  id: 'ilk-sprite',
  title: 'Kedini sahneye getir',
  intro: 'Oyun başlayınca ekranda bir kedi sprite\'ı oluştur ve onu ekranın SAĞ yarısına koy (x değeri 100\'den büyük olsun).',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'degisken', 'math_number'),
  starter: () => makeProject('İlk sprite', [b('oyun_baslangic', {}, [b('sahne_renk', { C: 10 })])]),
  goals: [
    { id: 'kedi', label: 'Bir kedi sprite\'ı oluşturdun', hint: '"yeni sprite" bloğunu bir değişkene koy.', kind: 'sprites', of: 'oyuncu', image: 'oyuncu-kedi', min: 1 },
    { id: 'sag', label: 'Kedi ekranın sağ yarısında (x > 100)', hint: '"konumu x y" bloğunda x\'i büyüt.', kind: 'spriteProp', of: 'oyuncu', prop: 'x', op: 'gt', value: 100 },
  ],
  solution: () => makeProject('İlk sprite', [b('oyun_baslangic', {}, [b('sahne_renk', { C: 10 }), kediOlustur(), b('sprite_konum', { S: 'kedi', X: 120, Y: 60 })])]),
}

// 2) Tuşlarla hareket ─────────────────────────────────────────
const TUSLARLA_HAREKET: OyunActivity = {
  id: 'tuslarla-hareket',
  title: 'Ok tuşlarıyla yürüt',
  intro: 'Kediyi ok tuşlarıyla her yöne hareket ettir. İpucu: Denetleyici kategorisinde "oyuncu tuşlarıyla hareket etsin" bloğu var.',
  allowedBlocks: allow('oyun_baslangic', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'den_dugme', 'hareket_hiz', 'degisken', 'math_number'),
  starter: () => makeProject('Tuşlarla hareket', [b('oyun_baslangic', {}, [kediOlustur(), b('sprite_konum', { S: 'kedi', X: 80, Y: 60 })])]),
  scenario: [{ do: 'press', button: 'right', frames: 30 }, { do: 'press', button: 'down', frames: 30 }],
  goals: [
    { id: 'yatay', label: 'Sağ tuşuna basınca kedi sağa gidiyor', kind: 'moved', of: 'oyuncu', axis: 'x', min: 15 },
    { id: 'dikey', label: 'Aşağı tuşuna basınca kedi aşağı gidiyor', kind: 'moved', of: 'oyuncu', axis: 'y', min: 15 },
  ],
  solution: () => makeProject('Tuşlarla hareket', [b('oyun_baslangic', {}, [kediOlustur(), b('sprite_konum', { S: 'kedi', X: 80, Y: 60 }), b('den_hareket', { S: 'kedi', M: 'four', N: 60 })])]),
}

// 3) Yakala ve say ────────────────────────────────────────────
const yakalaBaslangic = () => b('oyun_baslangic', {}, [
  kediOlustur(), b('sprite_konum', { S: 'kedi', X: 40, Y: 60 }),
  set('elma', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })), b('sprite_konum', { S: 'elma', X: 120, Y: 60 }),
  b('oyun_skor_ayarla', { N: 0 }),
])
const YAKALA_VE_SAY: OyunActivity = {
  id: 'yakala-ve-say',
  title: 'Elmayı yakala, puan kazan',
  intro: 'Kedi elmaya değince skor 1 artsın ve elma ortadan kaybolsun. Sprite menüsündeki "çarpınca" olayını kullan.',
  allowedBlocks: allow('oyun_baslangic', 'sprite_carpisinca', 'oyun_skor_degistir', 'oyun_skor_ayarla', 'sprite_sil', 'oyun_diger_sprite', 'oyun_bu_sprite', 'ses_melodi', 'degisken', 'sprite_yeni', 'sprite_konum', 'math_number'),
  starter: () => makeProject('Yakala ve say', [yakalaBaslangic()]),
  scenario: [{ do: 'collide', a: 'oyuncu', b: 'yiyecek' }],
  goals: [
    { id: 'olay', label: 'Kedi elmaya çarpınca bir olay çalışıyor', kind: 'event', name: 'overlap' },
    { id: 'skor', label: 'Çarpınca skor arttı', hint: '"skoru 1 değiştir" bloğunu ekle.', kind: 'score', op: 'increased' },
    { id: 'sil', label: 'Elma silindi', hint: '"diğer sprite"ı sil.', kind: 'custom', test: (r) => r.engine.spritesOfKind('yiyecek').length === 0 },
  ],
  solution: () => makeProject('Yakala ve say', [
    yakalaBaslangic(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() })]),
  ]),
}

// 4) Can kaybı ────────────────────────────────────────────────
const canBaslangic = () => b('oyun_baslangic', {}, [
  kediOlustur(), b('sprite_konum', { S: 'kedi', X: 30, Y: 30 }),
  set('hayalet', b('sprite_yeni', { IMG: 'dusman-hayalet', K: 'dusman' })), b('sprite_konum', { S: 'hayalet', X: 120, Y: 90 }),
  b('oyun_can_ayarla', { N: 3 }),
])
const CAN_KAYBI: OyunActivity = {
  id: 'can-kaybi',
  title: 'Hayalet canını götürür',
  intro: 'Hayalete her çarpışta 1 can kaybet. Can 0 olunca oyun kendiliğinden biter.',
  allowedBlocks: allow('oyun_baslangic', 'sprite_carpisinca', 'oyun_can_degistir', 'oyun_can_ayarla', 'oyun_sarsinti', 'ses_melodi', 'degisken', 'sprite_yeni', 'sprite_konum', 'math_number', 'controls_if', 'logic_compare', 'oyun_can', 'oyun_bitir'),
  starter: () => makeProject('Can kaybı', [canBaslangic()]),
  scenario: [
    { do: 'collide', a: 'oyuncu', b: 'dusman' }, { do: 'place', kind: 'oyuncu', x: 30, y: 30 },
    { do: 'collide', a: 'oyuncu', b: 'dusman' }, { do: 'place', kind: 'oyuncu', x: 30, y: 30 },
    { do: 'collide', a: 'oyuncu', b: 'dusman' },
  ],
  goals: [
    { id: 'can', label: 'Çarpışınca can azalıyor', kind: 'life', op: 'decreased' },
    { id: 'bitti', label: 'Can bitince oyun bitiyor', kind: 'gameOver', result: 'lose' },
  ],
  solution: () => makeProject('Can kaybı', [
    canBaslangic(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 200 })]),
  ]),
}

// 5) Harita ve kamera ─────────────────────────────────────────
const geniHarita = () => mapFromRows('seviye', [
  '########################',
  '#......................#',
  '#..####.......####.....#',
  '#......................#',
  '#.....###.........###..#',
  '#......................#',
  '########################',
], { '#': 0 })
const haritaProje = (tops: ReturnType<typeof b>[]) => makeProject('Harita', tops, { tileset: tiles(['karo-tas', true]), maps: [geniHarita()], bg: 15 })
const HARITA_KAMERA: OyunActivity = {
  id: 'harita-ve-kamera',
  title: 'Haritaya gir, kamera seni izlesin',
  intro: 'Harita sekmesinde "seviye" adlı bir harita hazır. Oyun başlayınca haritayı yükle, bir sprite oluştur ve kameranın onu takip etmesini sağla. Sprite duvarlardan geçememeli!',
  allowedBlocks: allow('oyun_baslangic', 'sahne_dosemesi', 'sahne_renk', 'harita_yukle', 'oyun_harita', 'kamera_takip', 'harita_konumla', 'den_hareket', 'sprite_yeni', 'sprite_konum', 'degisken', 'math_number'),
  starter: () => haritaProje([b('oyun_baslangic', {}, [])]),
  scenario: [{ do: 'press', button: 'right', frames: 90 }],
  goals: [
    { id: 'harita', label: 'Harita yüklendi', kind: 'map', minCols: 20 },
    { id: 'kamera', label: 'Kamera sprite\'ı takip ediyor', kind: 'custom', test: (r) => r.engine.cameraTarget !== null },
    { id: 'duvar', label: 'Sprite 1. satırın dışına çıkmadan duvarda duruyor', kind: 'custom', test: (r) => { const s = r.engine.spritesOfKind('oyuncu')[0]; return !!s && s.x > 16 && s.x < 23 * 16 } },
  ],
  solution: () => haritaProje([b('oyun_baslangic', {}, [
    b('harita_yukle', { M: 'seviye' }),
    kediOlustur(),
    b('harita_konumla', { S: 'kedi', C: 2, R: 3 }),
    b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
    b('kamera_takip', { S: 'kedi' }),
  ])]),
}

// 6) Altın topla ──────────────────────────────────────────────
const altinHarita = () => mapFromRows('hazine', [
  '##########',
  '#........#',
  '#.o....o.#',
  '#........#',
  '#...o....#',
  '#........#',
  '#........#',
  '##########',
], { '#': 0, o: 1 })
const altinBaslangic = (extra: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [
  b('harita_yukle', { M: 'hazine' }), kediOlustur(), b('harita_konumla', { S: 'kedi', C: 1, R: 1 }), b('oyun_skor_ayarla', { N: 0 }), ...extra,
])
const ALTIN_TOPLA: OyunActivity = {
  id: 'altin-topla',
  title: 'Hazine avı',
  intro: 'Haritadaki 3 altına dokunarak topla: her altın kaybolsun ve skor artsın. Hepsi toplanınca oyunu kazan!',
  allowedBlocks: allow('oyun_baslangic', 'harita_karoya_dokununca', 'harita_olay_karo', 'harita_karo_sil', 'harita_say', 'oyun_skor_degistir', 'oyun_skor_ayarla', 'oyun_bitir', 'controls_if', 'logic_compare', 'math_number', 'oyun_mesaj', 'ses_melodi', 'harita_yukle', 'oyun_harita', 'harita_konumla', 'sprite_yeni', 'degisken', 'den_hareket'),
  starter: () => makeProject('Hazine avı', [altinBaslangic()], { tileset: tiles(['karo-tas', true], ['nesne-altin', false]), maps: [altinHarita()], bg: 15 }),
  scenario: [{ do: 'goto', kind: 'oyuncu', col: 2, row: 2 }, { do: 'goto', kind: 'oyuncu', col: 7, row: 2 }, { do: 'goto', kind: 'oyuncu', col: 4, row: 4 }],
  goals: [
    { id: 'toplandi', label: 'Dokunulan altınlar haritadan kayboldu', kind: 'tileCount', image: 'nesne-altin', max: 0 },
    { id: 'skor', label: 'Skor 3 oldu', kind: 'score', op: 'gte', value: 3 },
    { id: 'kazan', label: 'Hepsi toplanınca oyun kazanıldı', kind: 'gameOver', result: 'win' },
  ],
  solution: () => makeProject('Hazine avı', [
    altinBaslangic(),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-altin' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      b('oyun_skor_degistir', { N: 1 }),
      ifThen(cmp('EQ', b('harita_say', { IMG: 'nesne-altin' }), 0), b('oyun_bitir', { R: 'win' })),
    ]),
  ], { tileset: tiles(['karo-tas', true], ['nesne-altin', false]), maps: [altinHarita()], bg: 15 }),
}

export const ACTIVITIES: readonly OyunActivity[] = [ILK_SPRITE, TUSLARLA_HAREKET, YAKALA_VE_SAY, CAN_KAYBI, HARITA_KAMERA, ALTIN_TOPLA]
export const ACTIVITY_BY_ID: Readonly<Record<string, OyunActivity>> = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]))

