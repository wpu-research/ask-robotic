// Ders 8: Elektronik zar (rastgele sayı).
import type { MikroActivity } from '../activity'
import { ledPattern, showsNumber, usesBlocks } from '../goals'
import { cmp, getVar, ifThen, onButton, project, randomInt, setVar } from '../program'
import { ICON_ROWS, icon, num } from './mk-kit'

export const h2d3: MikroActivity = {
  intro: "Elektronik zar: A'ya basınca 1 ile 6 arasında rastgele bir sayı çıksın; 6 gelirse ekranda kalp görünsün.",
  allowedBlocks: ['mk_on_button', 'mk_show_number', 'mk_show_icon', 'mk_pause', 'math_random_int', 'variables_get', 'variables_set', 'controls_if', 'logic_compare'],
  starter: () => project('Zar', [onButton('A', [])]),
  goals: [
    usesBlocks('rastgele', "'rastgele sayı' bloğunu kullan", ['math_random_int']),
    usesBlocks('degisken', "Zar sonucunu bir değişkene koy ('zar')", ['variables_set', 'variables_get']),
    showsNumber('sayi', "A'ya basınca 1 ile 6 arasında bir sayı görünsün", (n) => n >= 1 && n <= 6, { hint: "'zar değerini ... yap' bloğuna '1 ile 6 arasında rastgele sayı' tak, sonra 'sayıyı göster' içine 'zar' koy." }),
    ledPattern('alti', '6 gelince kalp görünsün (6 gelene kadar A\'ya bas)', ICON_ROWS('heart'), { hint: "'eğer zar = 6 ise' bloğunun içine 'simgeyi göster kalp' koy." }),
  ],
  solution: () => project('Zar', [
    onButton('A', [setVar('zar', randomInt(1, 6)), num(getVar('zar')), ifThen(cmp('EQ', getVar('zar'), 6), [icon('heart')])]),
  ]),
  scenario: (s) => {
    const seen = () => s.device(0).frames.some((f) => f.s === ICON_ROWS('heart').join(''))
    for (let i = 0; i < 80 && !seen(); i++) { s.press('A'); s.advance(900) }
    s.advance(500)
  },
}
