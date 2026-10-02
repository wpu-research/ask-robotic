// Ders 26 (Hafta 6, ders 1): Nabız ölçer. Anahtar: mikro-kart:6:1
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { ledPattern, showsNumber, usesBlocks, variableIs } from '../goals'
import { arith, changeVar, cmp, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import { clear, icon, pause, showNum } from './h456-ortak'

export const ders26: MikroActivity = {
  intro: "Sanal nabız ölçer: B düğmesi 10 saniyelik ölçümü başlatsın. Ölçüm sürerken her kalp atışında A'ya bas; kalp yanıp sönsün. Süre bitince atış sayısı × 6 ile dakikadaki atışı göster.",
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_show_icon', 'mk_show_number', 'mk_clear', 'mk_pause', 'variables_set', 'variables_get', 'math_change', 'math_arithmetic', 'controls_if', 'logic_compare'],
  starter: () => project('Nabız ölçer', [onStart(), onButton('A', []), onButton('B', [])]),
  goals: [
    usesBlocks('bloklar', "'bekle', 'eğer' ve çarpma bloğunu kullan", ['mk_pause', 'controls_if', 'math_arithmetic']),
    ledPattern('kalp', "Ölçüm sürerken A'ya basınca kalp göster", ICON_BY_ID.heart.rows),
    variableIs('sayac', "12 atış say ('sayac' değişkeni 12 olsun)", 'sayac', 12, { hint: "A'da 'sayac değerine 1 ekle' kullan; yalnız 'olcum' 1 iken say." }),
    showsNumber('bpm', '12 atış × 6 = 72: ölçüm sonunda 72 görünsün', 72, { hint: "10000 ms bekledikten sonra 'sayac × 6' hesabını göster." }),
  ],
  solution: () => project('Nabız ölçer', [
    onStart(setVar('sayac', 0), setVar('olcum', 0)),
    onButton('A', [ifThen(cmp('EQ', getVar('olcum'), 1), [changeVar('sayac', 1), icon('heart'), pause(100), clear()])]),
    onButton('B', [setVar('sayac', 0), setVar('olcum', 1), icon('smallHeart'), pause(10000), setVar('olcum', 0), showNum(arith('MULTIPLY', getVar('sayac'), 6))]),
  ]),
  scenario: (s) => {
    s.press('B'); s.advance(100)
    for (let i = 0; i < 12; i++) { s.press('A'); s.advance(650) }
    s.advance(2500)
  },
}
