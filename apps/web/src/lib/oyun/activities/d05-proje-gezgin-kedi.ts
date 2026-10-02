import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'oyuncu-robot', 'oyuncu-astronot', 'nesne-yildiz', 'nesne-balon', 'karo-cimen', 'karo-kum', 'karo-zemin')
const baslangic = () => b('oyun_baslangic', {}, [
  b('sahne_dosemesi', { IMG: 'karo-cimen' }),
  yeni('kedi', 'oyuncu-kedi', 'oyuncu'), konum('kedi', 80, 60), ...yuruyen('kedi', 60),
  yeni('yildiz', 'nesne-yildiz', 'nesne'), konum('yildiz', 30, 30),
  b('hareket_hiz', { S: 'yildiz', VX: 45, VY: 30 }),
  b('sprite_bayrak', { S: 'yildiz', F: 'bounce', ON: 'true' }),
])
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Gezgin kedi', [baslangic(), ...ek], { bg: 8, images: IMAGES })

export const DERS_05: OyunActivity = {
  id: 'ders-05-proje-gezgin-kedi',
  title: 'Proje: Gezgin kedi',
  intro: 'Kedin yürüyor, yıldız sekip duruyor. Şimdi kediye iki yetenek ver: A düğmesine basınca konuşsun ve bir melodi çalsın; B düğmesine basınca ekranda patlama olsun.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sahne_dosemesi', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'sprite_bayrak', 'den_dugme', 'sprite_resim', 'sprite_konus', 'sprite_bak', 'hareket_hiz', 'hareket_yone', 'ses_bip', 'ses_nota', 'ses_melodi', 'oyun_mesaj', 'oyun_patlama', 'oyun_sarsinti', 'metin', 'degisken', 'math_number'),
  starter: () => proje([]),
  scenario: [{ do: 'press', button: 'right', frames: 30 }, { do: 'press', button: 'down', frames: 30 }, { do: 'press', button: 'left', frames: 700 }, { do: 'seconds', s: 3 }, { do: 'tap', button: 'b' }, { do: 'tap', button: 'a' }],
  goals: [
    { id: 'yuru', label: 'Kedi ok tuşlarıyla yürüyor', kind: 'moved', of: 'oyuncu', axis: 'x', min: 15 },
    { id: 'kal', label: 'Kedi ekranda kalıyor', kind: 'custom', test: (r) => { const s = r.engine.spritesOfKind('oyuncu')[0]; return !!s && s.x >= 0 && s.x <= 160 && s.y >= 0 && s.y <= 120 } },
    { id: 'yildiz', label: 'Yıldız sekip duruyor', kind: 'custom', test: (r) => { const s = r.engine.spritesOfKind('nesne')[0]; return !!s && s.x >= 0 && s.x <= 160 && s.y >= 0 && s.y <= 120 && (r.moved.nesne?.any ?? 0) >= 40 } },
    { id: 'doseme', label: 'Arka plan resimle döşenmiş', kind: 'custom', test: (r) => r.engine.bgTile !== null },
    { id: 'konus', label: 'A düğmesi: kedi konuşuyor', hint: '"A düğmesine basılınca" içine "… desin" ekle.', kind: 'custom', test: (r) => !!r.engine.spritesOfKind('oyuncu')[0]?.speech },
    { id: 'ses', label: 'A düğmesi: ses çalıyor', hint: 'Ses kategorisinden bir melodi ya da nota seç.', kind: 'event', name: 'sound' },
    { id: 'patlama', label: 'B düğmesi: ekranda patlama oluyor', hint: 'Oyun kategorisinde "… noktasında … patlama" bloğu var.', kind: 'event', name: 'particles' },
  ],
  solution: () => proje([
    b('den_dugme', { B: 'a', E: 'press' }, [b('sprite_konus', { S: 'kedi', T: 'Merhaba!', N: 2 }), b('ses_melodi', { M: 'baslangic' })]),
    b('den_dugme', { B: 'b', E: 'press' }, [b('oyun_patlama', { X: 80, Y: 60, C: 4 }), b('ses_bip', { F: 300, MS: 120 })]),
  ]),
}
