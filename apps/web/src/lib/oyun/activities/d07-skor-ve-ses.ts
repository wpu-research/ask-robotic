import { allow, type OyunActivity } from '../activity'
import { b, cmp, ifThen } from '../dsl'
import { diger, makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'yiyecek-elma', 'yiyecek-portakal', 'yiyecek-kiraz')
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_renk', { C: 10 }),
  yeni('kedi', 'oyuncu-kedi', 'oyuncu'), konum('kedi', 80, 60), ...yuruyen('kedi', 60),
  yeni('elma', 'yiyecek-elma', 'yiyecek'), konum('elma', 24, 24),
  yeni('portakal', 'yiyecek-portakal', 'yiyecek'), konum('portakal', 136, 24),
  yeni('kiraz', 'yiyecek-kiraz', 'yiyecek'), konum('kiraz', 80, 100),
  b('oyun_skor_ayarla', { N: 0 }),
])
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Skor ve ses', [baslangic(), ...ek], { bg: 8, images: IMAGES })

export const DERS_07: OyunActivity = {
  id: 'ders-07-skor-ve-ses',
  title: 'Üç meyveyi topla, oyunu kazan',
  intro: 'Her meyve topladığında skor 1 artsın ve "puan" melodisi çalsın. Skor 3 olunca ekrana bir mesaj yaz ve oyunu kazan.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'sprite_carpisinca', 'oyun_diger_sprite', 'sprite_sil', 'sprite_konus', 'oyun_skor_ayarla', 'oyun_skor_degistir', 'oyun_skor', 'oyun_mesaj', 'oyun_bitir', 'ses_melodi', 'ses_bip', 'mantik', 'metin', 'degisken', 'math_number'),
  starter: () => proje([]),
  scenario: [{ do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }, { do: 'collide', a: 'oyuncu', b: 'yiyecek' }],
  goals: [
    { id: 'skor', label: 'Üç meyve toplayınca skor 3 oldu', hint: '"skoru 1 değiştir" bloğunu çarpışma olayına koy.', kind: 'score', op: 'gte', value: 3 },
    { id: 'ses', label: 'Meyve toplayınca ses çalıyor', hint: 'Ses kategorisinden "puan" melodisini seç.', kind: 'event', name: 'sound' },
    { id: 'mesaj', label: 'Skor 3 olunca ekranda mesaj çıkıyor', hint: '"eğer skor = 3 ise" içine "ekranda … yaz" koy.', kind: 'event', name: 'message' },
    { id: 'kazan', label: 'Oyun kazanıldı', hint: '"oyunu bitir: kazandın" bloğunu kullan.', kind: 'gameOver', result: 'win' },
  ],
  solution: () => proje([
    b('sprite_carpisinca', { KA: 'oyuncu', KB: 'yiyecek' }, [
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
      b('sprite_sil', { S: diger() }),
      ifThen(cmp('EQ', b('oyun_skor'), 3), [b('oyun_mesaj', { T: 'Hepsini topladın!', N: 2 }), b('ses_melodi', { M: 'zafer' }), b('oyun_bitir', { R: 'win' })]),
    ]),
  ]),
}
