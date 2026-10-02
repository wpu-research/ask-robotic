// Ders 6: A, B ve A+B düğmeleri; olay bloğu.
import type { MikroActivity } from '../activity'
import { afterInputPattern, usesBlocks } from '../goals'
import { onButton, project } from '../program'
import { ICON_ROWS, icon } from './mk-kit'

export const h2d1: MikroActivity = {
  intro: 'Her düğmeye bir duygu ver: A mutlu, B üzgün, A+B kalp göstersin.',
  allowedBlocks: ['mk_on_button', 'mk_show_icon', 'mk_clear', 'mk_pause'],
  starter: () => project('Duygu düğmeleri', [onButton('A', []), onButton('B', []), onButton('AB', [])]),
  goals: [
    usesBlocks('bloklar', "'düğme ... basılınca' bloklarını kullan", ['mk_on_button', 'mk_show_icon']),
    afterInputPattern('a', "A'ya basınca mutlu yüz görünsün", 'button:A:press', ICON_ROWS('happy'), { hint: "Sanal kartta A düğmesine bir kez tıkla (kısa basış)." }),
    afterInputPattern('b', "B'ye basınca üzgün yüz görünsün", 'button:B:press', ICON_ROWS('sad'), { hint: "Sanal kartta B düğmesine bir kez tıkla (kısa basış)." }),
    afterInputPattern('ab', "A ve B'ye birlikte basınca kalp görünsün", 'button:AB:press', ICON_ROWS('heart'), { hint: "Üçüncü bloğun ilk açılır listesini 'A+B' yap. Sanal kartta A+B düğmesine tıklayabilirsin." }),
  ],
  solution: () => project('Duygu düğmeleri', [
    onButton('A', [icon('happy')]), onButton('B', [icon('sad')]), onButton('AB', [icon('heart')]),
  ]),
  scenario: (s) => { s.press('A'); s.advance(200); s.press('B'); s.advance(200); s.press('AB'); s.advance(200) },
}
