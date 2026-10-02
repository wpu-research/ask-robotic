import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject } from '../samples/kit'
import { konum, resimler, yeni, yuruyen } from './ders-kit'

const IMAGES = resimler('oyuncu-kedi', 'oyuncu-robot', 'oyuncu-astronot')
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Tuşlarla yürü', [b('oyun_baslangic', {}, [b('sahne_renk', { C: 10 }), yeni('kedi', 'oyuncu-kedi', 'oyuncu'), konum('kedi', 80, 60), ...ek])], { bg: 8, images: IMAGES })

export const DERS_02: OyunActivity = {
  id: 'ders-02-tuslarla-yuru',
  title: 'Kediyi ok tuşlarıyla yürüt',
  intro: 'Kedi şimdi duruyor. Ok tuşlarıyla her yöne yürümesini sağla. Sonra onun ekranın dışına çıkıp kaybolmasını engelle.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'den_hareket', 'den_hareket_birak', 'sprite_bayrak', 'degisken', 'math_number'),
  starter: () => proje([]),
  scenario: [{ do: 'press', button: 'right', frames: 30 }, { do: 'press', button: 'down', frames: 30 }, { do: 'press', button: 'left', frames: 700 }],
  goals: [
    { id: 'yatay', label: 'Sağ tuşuna basınca kedi sağa yürüyor', hint: '"oyuncu tuşlarıyla … hareket etsin" bloğunu kullan.', kind: 'moved', of: 'oyuncu', axis: 'x', min: 15 },
    { id: 'dikey', label: 'Aşağı tuşuna basınca kedi aşağı yürüyor', hint: 'Hareket biçimi "dört yöne" olsun.', kind: 'moved', of: 'oyuncu', axis: 'y', min: 15 },
    { id: 'kal', label: 'Sol tuşunu uzun süre basılı tutunca kedi ekranda kalıyor', hint: '"ekranda kalsın" ayarını aç.', kind: 'custom', test: (r) => { const s = r.engine.spritesOfKind('oyuncu')[0]; return !!s && s.x >= 0 && s.x <= 160 && s.y >= 0 && s.y <= 120 && r.moved.oyuncu?.x >= 15 } },
  ],
  solution: () => proje(yuruyen('kedi', 60)),
}
