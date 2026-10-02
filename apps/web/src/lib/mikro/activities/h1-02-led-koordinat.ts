// Ders 2: LED koordinatları (x soldan sağa, y yukarıdan aşağı).
import type { MikroActivity } from '../activity'
import { ledPattern, usesBlocks } from '../goals'
import { onStart, project } from '../program'
import { clear, pause, plot } from './mk-kit'

const CAPRAZ = ['10000', '01000', '00100', '00010', '00001']
const KOSELER = ['10001', '00000', '00000', '00000', '10001']

export const h1d2: MikroActivity = {
  intro: 'LED yak bloğuyla önce bir çapraz çizgi çiz, sonra ekranı temizleyip dört köşeyi yak.',
  allowedBlocks: ['mk_on_start', 'mk_plot', 'mk_unplot', 'mk_clear', 'mk_pause'],
  starter: () => project('LED çizimi', [onStart()]),
  goals: [
    usesBlocks('bloklar', "'LED yak' ve 'ekranı temizle' bloklarını kullan", ['mk_plot', 'mk_clear']),
    ledPattern('capraz', 'Sol üstten sağ alta çapraz bir çizgi yak (5 LED)', CAPRAZ, { hint: 'x ve y değerleri 0, 0 - 1, 1 - 2, 2 - 3, 3 - 4, 4 olsun.' }),
    ledPattern('koseler', 'Ekranı temizle, sonra dört köşeyi yak', KOSELER, { hint: 'Köşeler: (0,0) (4,0) (0,4) (4,4).' }),
  ],
  solution: () => project('LED çizimi', [onStart(
    plot(0, 0), plot(1, 1), plot(2, 2), plot(3, 3), plot(4, 4),
    pause(1000), clear(),
    plot(0, 0), plot(4, 0), plot(0, 4), plot(4, 4),
  )]),
  scenario: (s) => { s.advance(2500) },
}
