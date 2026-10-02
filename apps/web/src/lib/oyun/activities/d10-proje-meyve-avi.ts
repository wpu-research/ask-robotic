import { allow, type OyunActivity } from '../activity'
import { b, cmp, ifThen, rnd, set } from '../dsl'
import { diger, makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'yiyecek-elma', 'yiyecek-portakal', 'yiyecek-kiraz', 'nesne-bomba', 'dusman-hayalet')
const dusen = (resim: string, tur: string, ad: string) => [
  set(ad, b('sprite_yeni', { IMG: resim, K: tur })),
  konum(ad, rnd(10, 150), -8),
  b('hareket_hiz', { S: ad, VX: 0, VY: rnd(35, 70) }),
  b('sprite_bayrak', { S: ad, F: 'autoDestroy', ON: 'true' }),
]
const baslangic = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  yeni('sepet', 'oyuncu-kedi', 'oyuncu'), konum('sepet', 80, 104), ...yuruyen('sepet', 90, 'h'),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 5 }),
  ...ek,
])
const ortak = (): ReturnType<typeof b>[] => [
  b('oyun_her_n_ms', { MS: 700 }, dusen('yiyecek-elma', 'yiyecek', 'meyve')),
  b('oyun_her_n_ms', { MS: 1600 }, dusen('nesne-bomba', 'dusman', 'bomba')),
]
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Meyve avı', tops, { bg: 8, images: IMAGES })

export const DERS_10: OyunActivity = {
  id: 'ders-10-proje-meyve-avi',
  title: 'Proje: Meyve avı',
  intro: 'Oyunun yarısı hazır: meyve ve bomba düşüyor, meyve yakalayınca skor artıyor. Eksikleri tamamla: bomba can götürsün (can 5), 45 saniyelik geri sayım başlasın, skor 8 olunca kazan, can ya da süre bitince kaybet.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'oyun_her_n_ms', 'hareket_hiz', 'sprite_resim', 'sprite_carpisinca', 'oyun_diger_sprite', 'sprite_sil', 'sprite_patlat', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_can', 'oyun_can_bitince', 'oyun_sure_baslat', 'oyun_sure', 'oyun_sure_bitince', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'oyun_patlama', 'ses_bip', 'ses_nota', 'ses_melodi', 'mantik', 'matematik', 'metin', 'degisken'),
  starter: () => proje([
    baslangic(), ...ortak(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() })]),
  ]),
  scenario: [
    { do: 'seconds', s: 2 }, { do: 'collide', a: 'oyuncu', b: 'dusman' }, { do: 'place', kind: 'oyuncu', x: 8, y: 104 },
    ...Array.from({ length: 9 }, () => [{ do: 'seconds', s: 0.9 } as const, { do: 'collide', a: 'oyuncu', b: 'yiyecek' } as const, { do: 'place', kind: 'oyuncu', x: 8, y: 104 } as const]).flat(),
    { do: 'seconds', s: 1 },
  ],
  goals: [
    { id: 'bomba', label: 'Bombaya değince can azalıyor', kind: 'life', op: 'decreased' },
    { id: 'sars', label: 'Bombaya değince ekran sallanıyor', kind: 'event', name: 'shake' },
    { id: 'sayac', label: '45 saniyelik geri sayım başlıyor', hint: 'Oyun kategorisinde "geri sayımı … saniyeden başlat" bloğu var.', kind: 'custom', test: (r) => r.engine.countdownMs !== null },
    { id: 'sure', label: '"süre bitince" bloğunu kullandın', kind: 'usesBlocks', types: ['oyun_sure_bitince'] },
    { id: 'canbitince', label: '"can bitince" bloğunu kullandın', kind: 'usesBlocks', types: ['oyun_can_bitince'] },
    { id: 'skor', label: 'Skor 8\'e ulaştı', kind: 'score', op: 'gte', value: 8 },
    { id: 'kazan', label: 'Skor 8 olunca oyun kazanılıyor', hint: 'Meyve çarpışmasının içinde "eğer skor ≥ 8 ise … oyunu bitir: kazandın".', kind: 'gameOver', result: 'win' },
  ],
  solution: () => proje([
    baslangic([b('oyun_sure_baslat', { N: 45 })]), ...ortak(),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
      b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() }),
      ifThen(cmp('GTE', b('oyun_skor'), 8), [b('oyun_mesaj', { T: 'Kazandın!', N: 2 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' })]),
    ]),
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('ses_melodi', { M: 'patlama' }), b('sprite_sil', { S: diger() })]),
    b('oyun_can_bitince', {}, [b('oyun_mesaj', { T: 'Canların bitti!', N: 2 }), b('ses_melodi', { M: 'kayip' }), b('oyun_bitir', { R: 'lose' })]),
    b('oyun_sure_bitince', {}, [b('oyun_mesaj', { T: 'Süre doldu!', N: 2 }), b('ses_melodi', { M: 'kayip' }), b('oyun_bitir', { R: 'lose' })]),
  ]),
}
