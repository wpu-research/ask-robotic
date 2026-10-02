import { allow, type OyunActivity } from '../activity'
import { b, rnd, set } from '../dsl'
import { diger, makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'yiyecek-elma', 'yiyecek-portakal', 'yiyecek-kiraz', 'nesne-sandik')
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  yeni('sepet', 'oyuncu-kedi', 'oyuncu'), konum('sepet', 80, 104), ...yuruyen('sepet', 90, 'h'),
  b('oyun_skor_ayarla', { N: 0 }),
])
const yakala = () => b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [b('oyun_skor_degistir', { N: 1 }), b('ses_melodi', { M: 'puan' }), b('sprite_sil', { S: diger() })])
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Düşen meyveler', [baslangic(), yakala(), ...ek], { bg: 8, images: IMAGES })

export const DERS_08: OyunActivity = {
  id: 'ders-08-dusen-meyveler',
  title: 'Gökten meyve yağsın',
  intro: 'Sepet (kedi) sağa sola gidiyor ve meyve yakalayınca skor artıyor. Ama gökten hiç meyve düşmüyor! Her 800 ms\'de bir rastgele bir yerde meyve oluştur ve aşağı düşür. Ekrandan çıkan meyveler kendiliğinden silinsin.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'oyun_her_n_ms', 'hareket_hiz', 'sprite_resim', 'sprite_carpisinca', 'oyun_diger_sprite', 'sprite_sil', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'ses_melodi', 'mantik', 'matematik', 'degisken'),
  starter: () => proje([]),
  scenario: [{ do: 'seconds', s: 3 }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'seconds', s: 5 }],
  goals: [
    { id: 'uret', label: 'Gökte en az 3 meyve aynı anda görünüyor', hint: '"her 800 ms\'de bir" bloğunun içinde "yeni sprite" oluştur.', kind: 'sprites', of: 'yiyecek', min: 3 },
    { id: 'dus', label: 'Meyveler aşağı düşüyor', hint: '"hızı x y" bloğunda y değerini pozitif yap.', kind: 'moved', of: 'yiyecek', axis: 'y', min: 40 },
    { id: 'rastgele', label: 'Meyveler farklı yerlerden düşüyor', hint: 'x için "… ile … arasında rastgele sayı" kullan.', kind: 'custom', test: (r) => new Set(r.engine.spritesOfKind('yiyecek').map((s) => Math.round(s.x / 8))).size >= 2 },
    { id: 'temiz', label: 'Ekrandan çıkan meyveler siliniyor (aynı anda en çok 8 meyve)', hint: '"dünyadan çıkınca silinsin: evet" ayarını aç.', kind: 'sprites', of: 'yiyecek', max: 8 },
    { id: 'skor', label: 'Düşen meyveyi yakalayınca skor artıyor', kind: 'score', op: 'increased' },
  ],
  solution: () => proje([
    b('oyun_her_n_ms', { MS: 800 }, [
      set('meyve', b('sprite_yeni', { IMG: 'yiyecek-elma', K: 'yiyecek' })),
      konum('meyve', rnd(10, 150), -8),
      b('hareket_hiz', { S: 'meyve', VX: 0, VY: rnd(35, 70) }),
      b('sprite_bayrak', { S: 'meyve', F: 'autoDestroy', ON: 'true' }),
    ]),
  ]),
}
