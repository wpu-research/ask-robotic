// Ders 20 (Hafta 4, ders 5): Proje - Sanal piyano. Anahtar: mikro-kart:4:5
import type { MikroActivity } from '../activity'
import { custom, usesBlocks } from '../goals'
import { type In, b, forEach, getVar, listOf, onButton, onStart, project, setVar } from '../program'
import type { PBlock } from '../types'
import { beats, clear, hz, note, onLogo, onPin, pause, tone } from './h456-ortak'

const TUSLAR: { ad: string; x: number }[] = [
  { ad: 'Do', x: 0 }, { ad: 'Re', x: 1 }, { ad: 'Mi', x: 2 }, { ad: 'Sol', x: 3 }, { ad: 'La', x: 4 },
]
const NOTAS = TUSLAR.map((t) => t.ad)

/** Bir tuşun gövdesi: sütunu yak, notayı çal, kayda ekle, ekranı temizle. */
const tus = (ad: string, x: In): PBlock[] => [
  b('mk_plot', { i: { X: x, Y: 2 } }),
  note(ad, beats.sekizde),
  b('mk_list_add', { i: { LIST: getVar('kayit'), ITEM: b('mk_note', { f: { NOTE: ad } }) } }),
  clear(),
]

export const ders20: MikroActivity = {
  intro: 'Sanal piyano yap: A, B, A+B, P0 ve P1 beş notayı çalsın. Her tuş ekranda bir sütun yaksın ve notayı kayıt listesine eklesin. Logoya dokununca kayıt baştan çalınsın.',
  allowedBlocks: [
    'mk_on_start', 'mk_on_button', 'mk_on_pin', 'mk_on_logo', 'mk_play_note', 'mk_play_tone', 'mk_note', 'mk_set_tempo', 'mk_show_number', 'mk_plot', 'mk_clear', 'mk_pause',
    'mk_list_add', 'mk_list_length', 'lists_create_with', 'controls_forEach', 'variables_set', 'variables_get',
  ],
  starter: () => project('Sanal piyano', [onStart(), onButton('A', []), onButton('B', []), onButton('AB', []), onPin('P0', []), onPin('P1', []), onLogo([])]),
  goals: [
    custom('notalar', 'Beş tuş beş farklı nota çalsın: Do, Re, Mi, Sol, La', (c) => !!c.sim && NOTAS.every((n) => c.sim!.allEvents().some(({ e }) => e.kind === 'tone' && e.freq === hz(n))), { hint: 'A, B, A+B, P0 ve P1 başlıklarının her birine ayrı bir nota koy.' }),
    custom('ekran', 'Her tuş ekranda bir sütun yaksın (en az 3 farklı sütun görünsün)', (c) => !!c.sim && [0, 1, 2, 3, 4].filter((x) => c.sim!.cards[0].device.frames.some((f) => f.s[2 * 5 + x] === '1')).length >= 3, { hint: "'LED yak x … y 2' bloğunu kullan; x her tuşta farklı olsun." }),
    usesBlocks('kayit', "Notaları 'listesine ekle' ile bir kayıt listesine yaz", ['mk_list_add', 'lists_create_with'], { hint: "Başlangıçta 'kayit' değişkenini boş liste yap." }),
    custom('tekrar', 'Logoya dokununca kayıt baştan çalınsın', (c) => {
      if (!c.sim) return false
      const log = c.sim.cards[0].device.log
      const at = log.findIndex((e) => e.kind === 'input' && e.key === 'logo:touch')
      if (at < 0) return false
      const before = log.slice(0, at).filter((e) => e.kind === 'tone').length
      const after = log.slice(at).filter((e) => e.kind === 'tone').length
      return before >= 5 && after >= before
    }, { hint: "Logo başlığının içinde 'kayit' listesinin her öğesi için bir 'Hz sesini çal' kullan." }),
  ],
  solution: () => project('Sanal piyano', [
    onStart(setVar('kayit', listOf())),
    onButton('A', tus('Do', 0)),
    onButton('B', tus('Re', 1)),
    onButton('AB', tus('Mi', 2)),
    onPin('P0', tus('Sol', 3)),
    onPin('P1', tus('La', 4)),
    onLogo([forEach('öğe', getVar('kayit'), [tone(getVar('öğe'), beats.sekizde)]), pause(100)]),
  ]),
  scenario: (s) => {
    s.press('A'); s.advance(300); s.press('B'); s.advance(300); s.press('AB'); s.advance(300)
    s.touchPin('P0'); s.advance(300); s.touchPin('P1'); s.advance(300)
    s.touchLogo(); s.advance(2000)
  },
}
