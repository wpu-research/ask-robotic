// Ders 23 — Platformlar, altınlar ve dikenler: karoya dokununca olayı.
import { allow, type OyunActivity } from '../activity'
import { b, first, ifThen, makeProject, mapFromRows, oku, olayKaro, tiles, v, yeniSprite } from './m11-ortak'

export const PLATFORM_HARITA_23 = [
  '....................',
  '....................',
  '....................',
  '.....C.......C......',
  '....PPP.....PPP.....',
  '........S.S.........',
  'GGGGGGGGGGGGGGGGGGGG',
  'TTTTTTTTTTTTTTTTTTTT',
]
const proje = (tops: ReturnType<typeof b>[]) => makeProject('Dikenli yol', tops, {
  bg: 10,
  tileset: tiles(['karo-cimenli-toprak', true], ['karo-toprak', true], ['karo-platform', true], ['nesne-altin', false], ['karo-diken', false]),
  maps: [mapFromRows('yol', PLATFORM_HARITA_23, { G: 0, T: 1, P: 2, C: 3, S: 4 })],
})
const baslangic = () => b('oyun_baslangic', {}, [
  b('harita_yukle', { M: 'yol' }),
  ...yeniSprite('kahraman', 'oyuncu-kahraman', 'oyuncu', 40, 88),
  b('harita_konumla', { S: 'kahraman', C: 2, R: 5 }),
  b('sprite_bayrak', { S: 'kahraman', F: 'stay', ON: 'true' }),
  b('hareket_ivme', { S: 'kahraman', AX: 0, AY: 520 }),
  b('den_hareket', { S: 'kahraman', M: 'h', N: 70 }),
  b('kamera_takip', { S: 'kahraman' }),
  b('oyun_skor_ayarla', { N: 0 }),
  b('oyun_can_ayarla', { N: 3 }),
])
const ziplama = () => b('den_dugme', { B: 'a', E: 'press' }, ifThen(b('sprite_dokunuyor', { S: 'kahraman', D: 'down' }), b('hareket_hiz', { S: 'kahraman', VX: oku(v('kahraman'), 'vx'), VY: -250 })))
const bu = () => b('oyun_bu_sprite')

export const OA_23_DIKEN_PLATFORM: OyunActivity = {
  id: 'ders-23-platform-ve-diken',
  title: 'Altın topla, dikenden kaç',
  intro: 'Harita hazır: platformlar, altınlar ve dikenler var. (1) Altına dokununca altın kaybolsun ve skor 1 artsın. (2) Dikene dokununca can 1 azalsın, ekran sallansın ve kahraman başlangıç karosuna (sütun 2, satır 5) dönsün.',
  allowedBlocks: allow('oyun_baslangic', 'harita_karoya_dokununca', 'harita_olay_karo', 'harita_karo_sil', 'harita_konumla', 'oyun_skor_degistir', 'oyun_skor_ayarla', 'oyun_can_degistir', 'oyun_can_ayarla', 'oyun_sarsinti', 'oyun_bitir', 'oyun_skor', 'oyun_mesaj', 'metin', 'ses_melodi', 'oyun_bu_sprite', 'hareket_hiz', 'harita_yukle', 'oyun_harita', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'hareket_ivme', 'den_hareket', 'den_dugme', 'sprite_oku', 'sprite_dokunuyor', 'kamera_takip', 'mantik', 'degisken', 'math_number'),
  starter: () => proje([baslangic(), ziplama()]),
  scenario: [
    { do: 'seconds', s: 0.5 }, { do: 'goto', kind: 'oyuncu', col: 5, row: 3 }, { do: 'seconds', s: 0.3 },
    { do: 'goto', kind: 'oyuncu', col: 8, row: 5 }, { do: 'seconds', s: 0.5 },
  ],
  goals: [
    { id: 'altin', label: 'Altına dokununca altın haritadan kayboluyor', hint: '"bir oyuncu sprite\'ı altın karosuna dokununca" olayında "sütun … satır … karosunu boşalt" kullan; sütun ve satır için "olay karosunun" bloklarını al.', kind: 'tileCount', image: 'nesne-altin', max: 1 },
    { id: 'skor', label: 'Altın skoru artırıyor', kind: 'score', op: 'gte', value: 1, hint: '"skoru 1 değiştir" bloğunu aynı olaya ekle.' },
    { id: 'can', label: 'Dikene dokununca can azalıyor', hint: 'Aynı türden bir olay kur: karo olarak diken\'i seç, içine "canı -1 değiştir" koy.', kind: 'life', op: 'decreased' },
    { id: 'geri', label: 'Dikenden sonra kahraman başlangıca dönüyor', hint: '"bu sprite\'ını sütun 2 satır 5 karosuna koy".', kind: 'custom', test: (r) => { const s = first(r, 'oyuncu'); return !!s && s.x < 60 } },
    { id: 'sarsinti', label: 'Dikende ekran sallanıyor', kind: 'event', name: 'shake', hint: '"ekranı 250 ms salla" bloğunu ekle.' },
  ],
  solution: () => proje([
    baslangic(), ziplama(),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'nesne-altin' }, [
      b('harita_karo_sil', { C: olayKaro('col'), R: olayKaro('row') }),
      b('oyun_skor_degistir', { N: 1 }),
      b('ses_melodi', { M: 'puan' }),
    ]),
    b('harita_karoya_dokununca', { K: 'oyuncu', IMG: 'karo-diken' }, [
      b('oyun_can_degistir', { N: -1 }),
      b('oyun_sarsinti', { N: 250 }),
      b('harita_konumla', { S: bu(), C: 2, R: 5 }),
      b('hareket_hiz', { S: bu(), VX: 0, VY: 0 }),
    ]),
  ]),
}
