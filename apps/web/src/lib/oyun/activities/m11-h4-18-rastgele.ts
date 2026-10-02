// Ders 18 — Rastgele hareket: her yarım saniyede rastgele yön.
import { allow, type OyunActivity } from '../activity'
import { runScenario } from '../activity'
import { makeProject } from '../samples/kit'
import { b, first, rnd, yeniSprite } from './m11-ortak'

const baslangic = (ek: ReturnType<typeof b>[] = []) => b('oyun_baslangic', {}, [b('sahne_renk', { C: 8 }), ...yeniSprite('yarasa', 'dusman-yarasa', 'dusman', 80, 60), b('sprite_bayrak', { S: 'yarasa', F: 'stay', ON: 'true' }), ...ek])
const SC = [{ do: 'seconds', s: 4 }] as const

export const OA_18_RASTGELE: OyunActivity = {
  id: 'ders-18-rastgele-hareket',
  title: 'Şaşkın yarasa',
  intro: 'Yarasa her 700 ms\'de bir rastgele bir yön seçip 40 hızla o yöne uçsun. Yön: 0 ile 359 derece arası rastgele sayı.',
  allowedBlocks: allow('oyun_baslangic', 'oyun_her_n_ms', 'sahne_renk', 'sprite_yeni', 'sprite_konum', 'sprite_bayrak', 'hareket_yone', 'matematik', 'degisken'),
  starter: () => makeProject('Rastgele', [baslangic(), b('oyun_her_n_ms', { MS: 700 }, [])]),
  scenario: SC,
  goals: [
    { id: 'ucar', label: 'Yarasa kıpırdıyor (en az 30 piksel yol alıyor)', hint: '"… derece yönünde … hızla gitsin" bloğunu "her 700 ms\'de bir" içine koy.', kind: 'moved', of: 'dusman', axis: 'any', min: 30 },
    { id: 'rastgele', label: 'Her çalıştırmada farklı bir yola gidiyor (rastgele)', hint: 'Yön için "… ile … arasında rastgele sayı" bloğunu kullan.', kind: 'custom', test: (r) => { const a = runScenario(r.project, SC, 3).engine.spritesOfKind('dusman')[0], c = runScenario(r.project, SC, 8).engine.spritesOfKind('dusman')[0]; return !!a && !!c && Math.hypot(a.x - c.x, a.y - c.y) > 3 } },
    { id: 'kalir', label: 'Yarasa ekrandan çıkmıyor', hint: '"ekranda kalsın: evet" ayarını başlangıçta açık bırak.', kind: 'custom', test: (r) => { const s = first(r, 'dusman'); return !!s && s.x >= 0 && s.x <= 160 && s.y >= 0 && s.y <= 120 } },
  ],
  solution: () => makeProject('Rastgele', [baslangic(), b('oyun_her_n_ms', { MS: 700 }, [b('hareket_yone', { S: 'yarasa', D: rnd(0, 359), N: 40 })])]),
}
