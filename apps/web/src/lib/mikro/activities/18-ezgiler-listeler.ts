// Ders 18 (Hafta 4, ders 3): Ezgiler ve listeler. Anahtar: mikro-kart:4:3
import type { MikroActivity } from '../activity'
import { usesBlocks, playsSound } from '../goals'
import { b, forEach, getVar, listOf, onButton, onStart, project, setVar } from '../program'
import { hz, melody, tonesInOrder, tone, beats } from './h456-ortak'

const notaListesi = () => listOf(b('mk_note', { f: { NOTE: 'Do' } }), b('mk_note', { f: { NOTE: 'Mi' } }), b('mk_note', { f: { NOTE: 'Sol' } }), b('mk_note', { f: { NOTE: 'Tiz Do' } }))

export const ders18: MikroActivity = {
  intro: "A düğmesine basınca hazır 'Yıldız ezgisi' çalsın. B düğmesine basınca kendi 4 notalık ezgin (Do, Mi, Sol, Tiz Do) bir listeden çalsın.",
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_play_melody', 'mk_play_tone', 'mk_note', 'mk_set_tempo', 'mk_list_length', 'mk_show_number', 'lists_create_with', 'controls_forEach', 'variables_set', 'variables_get'],
  starter: () => project('Ezgi', [onStart(), onButton('A', []), onButton('B', [])]),
  goals: [
    playsSound('hazir', "A'ya basınca 'Yıldız ezgisi' çalsın", { melody: 'twinkle', hint: "'ezgiyi çal' bloğunda 'Yıldız ezgisi'ni seç." }),
    usesBlocks('liste', "'liste oluştur' ve 'her öğesi için' bloklarını kullan", ['lists_create_with', 'controls_forEach'], { hint: 'Liste kategorisinde liste, Döngü kategorisinde her öğe için döngüsü var.' }),
    tonesInOrder('kendi', "B'ye basınca Do, Mi, Sol, Tiz Do çalsın", [hz('Do'), hz('Mi'), hz('Sol'), hz('Tiz Do')], { hint: "Liste değişkenini 'başlangıçta' oluştur; B'de her öğe için 'Hz sesini çal' kullan." }),
  ],
  solution: () => project('Ezgi', [
    onStart(setVar('ezgi', notaListesi())),
    onButton('A', [melody('twinkle')]),
    onButton('B', [forEach('öğe', getVar('ezgi'), [tone(getVar('öğe'), beats.dortte)])]),
  ]),
  scenario: (s) => { s.press('A'); s.advance(9000); s.press('B'); s.advance(3000) },
}
