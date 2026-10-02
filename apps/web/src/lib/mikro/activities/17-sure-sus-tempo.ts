// Ders 17 (Hafta 4, ders 2): Süre, sus ve tempo. Anahtar: mikro-kart:4:2
import type { MikroActivity } from '../activity'
import { usesBlocks } from '../goals'
import { onButton, project } from '../program'
import { hz, note, rest, tempo, toneLasted } from './h456-ortak'

export const ders17: MikroActivity = {
  intro: 'A düğmesine basınca önce yavaş (tempo 60), sonra hızlı (tempo 240) bir "ta ta" ritmi çal. Aradaki susmayı unutma.',
  allowedBlocks: ['mk_on_button', 'mk_play_note', 'mk_rest', 'mk_set_tempo', 'mk_tempo', 'mk_pause', 'mk_show_number'],
  starter: () => project('Ritim', [onButton('A', [])]),
  goals: [
    usesBlocks('bloklar', "'tempoyu … yap' ve '… vuruş sus' bloklarını kullan", ['mk_set_tempo', 'mk_rest'], { hint: 'İkisi de Müzik kategorisinde.' }),
    toneLasted('yavas', 'Tempo 60 iken 1/4 vuruşluk bir Sol notası çal (1000 ms sürer)', hz('Sol'), 1000, { hint: "'tempoyu 60 yap' bloğunu notadan önce koy." }),
    toneLasted('hizli', 'Tempo 240 iken 1/4 vuruşluk bir Sol notası çal (250 ms sürer)', hz('Sol'), 250, { hint: 'Tempoyu ortada 240 yap, sonra yine Sol çal.' }),
  ],
  solution: () => project('Ritim', [onButton('A', [tempo(60), note('Sol'), rest(), tempo(240), note('Sol'), rest(), note('Sol')])]),
  scenario: (s) => { s.press('A'); s.advance(4000) },
}
