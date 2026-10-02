// Ders 19 (Hafta 4, ders 4): Enstrüman yap. Anahtar: mikro-kart:4:4
import type { MikroActivity } from '../activity'
import { custom, usesBlocks } from '../goals'
import { b, ifThen, onButton, project } from '../program'
import { every, hz, mapBlock, note, onLogo } from './h456-ortak'

const ringFromLight = () => b('mk_ring', { i: { FREQ: mapBlock(b('mk_light'), 0, 255, 200, 1000) } })

export const ders19: MikroActivity = {
  intro: "A, B ve A+B düğmeleri Do, Re, Mi çalsın. Logoya dokunduğun sürece ışık seviyesine göre çınlayan bir 'ışıklı tel' yap; logoyu bırakınca ses dursun.",
  allowedBlocks: ['mk_on_button', 'mk_every', 'mk_on_logo', 'mk_logo_is', 'mk_play_note', 'mk_ring', 'mk_stop_sound', 'mk_light', 'mk_sound', 'mk_set_volume', 'mk_map', 'controls_if'],
  starter: () => project('Enstrüman', [onButton('A', []), onButton('B', []), onButton('AB', []), every(100, []), onLogo([], 'release')]),
  goals: [
    custom('dore', 'A Do (262 Hz), B Re (294 Hz), A+B Mi (330 Hz) çalsın', (c) => !!c.sim && [hz('Do'), hz('Re'), hz('Mi')].every((f) => c.sim!.allEvents().some(({ e }) => e.kind === 'tone' && e.freq === f && e.ms > 0)), { hint: "Her düğme başlığının içine bir '… notasını çal' bloğu koy." }),
    usesBlocks('tel', "Logoya dokunulunca ışık seviyesini 'eşle' ile frekansa çevirip sürekli çal", ['mk_every', 'mk_logo_is', 'mk_ring', 'mk_map', 'mk_light'], { hint: "Müzik'ten 'Hz sesi sürekli çal', Matematik'ten 'eşle', Giriş'ten 'ışık seviyesi' ve 'logoya dokunuluyor mu?'." }),
    custom('karanlik', 'Karanlıkta (ışık 0) alçak, aydınlıkta (ışık 255) tiz ses çınlasın', (c) => {
      if (!c.sim) return false
      const rings = c.sim.allEvents().filter(({ e }) => e.kind === 'tone' && e.ms === 0).map(({ e }) => (e as { freq: number }).freq)
      return rings.some((f) => f <= 250) && rings.some((f) => f >= 950)
    }, { hint: 'Işık 0 iken 200 Hz, 255 iken 1000 Hz çıkmalı.' }),
    usesBlocks('dur', "Logo bırakılınca 'sesi durdur' bloğu çalışsın", ['mk_on_logo', 'mk_stop_sound'], { hint: "'logoya bırakılınca' başlığını kullan." }),
  ],
  solution: () => project('Enstrüman', [
    onButton('A', [note('Do')]),
    onButton('B', [note('Re')]),
    onButton('AB', [note('Mi')]),
    every(100, [ifThen(b('mk_logo_is'), [ringFromLight()])]),
    onLogo([b('mk_stop_sound')], 'release'),
  ]),
  scenario: (s) => {
    s.press('A'); s.press('B'); s.press('AB', 100); s.advance(300)
    s.setSensor('light', 0); s.touchLogo(300)
    s.setSensor('light', 255); s.touchLogo(300)
    s.advance(200)
  },
}
