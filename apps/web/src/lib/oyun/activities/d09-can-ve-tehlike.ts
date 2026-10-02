import { allow, type OyunActivity } from '../activity'
import { b, rnd, set } from '../dsl'
import { diger, makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'yiyecek-elma', 'nesne-bomba', 'dusman-hayalet')
const dusen = (resim: string, tur: string, ad: string) => [
  set(ad, b('sprite_yeni', { IMG: resim, K: tur })),
  konum(ad, rnd(10, 150), -8),
  b('hareket_hiz', { S: ad, VX: 0, VY: rnd(35, 65) }),
  b('sprite_bayrak', { S: ad, F: 'autoDestroy', ON: 'true' }),
]
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  yeni('sepet', 'oyuncu-kedi', 'oyuncu'), konum('sepet', 80, 104), ...yuruyen('sepet', 90, 'h'),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
])
const govde = (): ReturnType<typeof b>[] => [
  baslangic(),
  b('oyun_her_n_ms', { MS: 700 }, dusen('yiyecek-elma', 'yiyecek', 'meyve')),
  b('oyun_her_n_ms', { MS: 1500 }, dusen('nesne-bomba', 'dusman', 'bomba')),
  b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() })]),
]
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Can ve tehlike', [...govde(), ...ek], { bg: 8, images: IMAGES })

export const DERS_09: OyunActivity = {
  id: 'ders-09-can-ve-tehlike',
  title: 'Bombadan kaç, canını koru',
  intro: 'Meyvelerin arasından bomba da düşüyor. Sepet bombaya değince 1 can kaybet, ekran sallansın ve bomba yok olsun. Can bitince "Canların bitti!" yaz ve oyunu kaybet.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'oyun_her_n_ms', 'hareket_hiz', 'sprite_carpisinca', 'oyun_diger_sprite', 'sprite_sil', 'sprite_patlat', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_can_ayarla', 'oyun_can_degistir', 'oyun_can', 'oyun_can_bitince', 'oyun_sarsinti', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'mantik', 'matematik', 'metin', 'degisken'),
  starter: () => proje([]),
  scenario: [
    { do: 'seconds', s: 2 }, { do: 'collide', a: 'oyuncu', b: 'dusman' },
    { do: 'seconds', s: 2 }, { do: 'collide', a: 'oyuncu', b: 'dusman' },
    { do: 'seconds', s: 2 }, { do: 'collide', a: 'oyuncu', b: 'dusman' },
    { do: 'seconds', s: 1 },
  ],
  goals: [
    { id: 'can', label: 'Bombaya değince can azalıyor', hint: '"canı -1 değiştir" bloğunu kullan.', kind: 'life', op: 'decreased' },
    { id: 'sars', label: 'Bombaya değince ekran sallanıyor', hint: 'Oyun kategorisinde "ekranı … ms salla" bloğu var.', kind: 'event', name: 'shake' },
    { id: 'sifir', label: 'Üç bombadan sonra canın sıfıra düşüyor', kind: 'life', op: 'lte', value: 0 },
    { id: 'mesaj', label: 'Can bitince mesaj yazılıyor', hint: '"can bitince" bloğuna "ekranda … yaz" koy.', kind: 'event', name: 'message' },
    { id: 'bitti', label: 'Can bitince oyun kaybediliyor', hint: '"can bitince" kullanırsan oyunu kendin bitirmelisin: "oyunu bitir: kaybettin".', kind: 'gameOver', result: 'lose' },
  ],
  solution: () => proje([
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'dusman' }, [b('oyun_can_degistir', { N: -1 }), b('oyun_sarsinti', { N: 250 }), b('ses_melodi', { M: 'patlama' }), b('sprite_sil', { S: diger() })]),
    b('oyun_can_bitince', {}, [b('oyun_mesaj', { T: 'Canların bitti!', N: 2 }), b('ses_melodi', { M: 'kayip' }), b('oyun_bitir', { R: 'lose' })]),
  ]),
}
