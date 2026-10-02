import { allow, type OyunActivity } from '../activity'
import { b } from '../dsl'
import { makeProject } from '../samples/kit'
import { konum, resimler, yeni } from './ders-kit'

const IMAGES = resimler('nesne-top', 'nesne-yildiz', 'karo-cimen', 'karo-zemin', 'karo-kum', 'karo-su')
const proje = (ek: ReturnType<typeof b>[]) => makeProject('Hız ve sekme', [b('oyun_baslangic', {}, [yeni('top', 'nesne-top', 'nesne'), konum('top', 80, 60), ...ek])], { bg: 8, images: IMAGES })

export const DERS_04: OyunActivity = {
  id: 'ders-04-hiz-yon-sekme',
  title: 'Sekip duran top',
  intro: 'Topu kendiliğinden hareket ettir. Ekranın kenarına çarpınca sekip devam etsin. Arka planı da bir resimle döşe.',
  allowedBlocks: allow('oyun_baslangic', 'sahne_renk', 'sahne_dosemesi', 'sprite_yeni', 'sprite_konum', 'hareket_hiz', 'hareket_yone', 'hareket_dur', 'sprite_bayrak', 'degisken', 'math_number'),
  starter: () => proje([]),
  scenario: [{ do: 'seconds', s: 10 }],
  goals: [
    { id: 'gider', label: 'Top kendiliğinden hareket ediyor', hint: '"hızı x y" bloğunda sıfırdan farklı sayılar yaz.', kind: 'moved', of: 'nesne', axis: 'any', min: 20 },
    { id: 'sek', label: 'Top 10 saniye sonra hâlâ ekranın içinde', hint: '"duvar/kenara çarpınca sekmeli: evet" ayarını aç.', kind: 'custom', test: (r) => { const s = r.engine.spritesOfKind('nesne')[0]; return !!s && s.x >= 0 && s.x <= 160 && s.y >= 0 && s.y <= 120 && (r.moved.nesne?.any ?? 0) >= 20 } },
    { id: 'doseme', label: 'Arka plan bir resimle döşendi', hint: 'Sahne / Harita kategorisinde "arka planı … resmiyle döşe" bloğu var.', kind: 'custom', test: (r) => r.engine.bgTile !== null },
  ],
  solution: () => proje([
    b('sahne_dosemesi', { IMG: 'karo-cimen' }),
    b('hareket_hiz', { S: 'top', VX: 50, VY: 35 }),
    b('sprite_bayrak', { S: 'top', F: 'bounce', ON: 'true' }),
  ]),
}
