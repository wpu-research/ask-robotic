// Ders 27 (Hafta 6, ders 2): Adımsayar. Anahtar: mikro-kart:6:2
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { ledPattern, playsSound, showsNumber, usesBlocks, variableIs } from '../goals'
import { changeVar, cmp, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import { clear, icon, melody, onGesture, showNum } from './h456-ortak'

export const ders27: MikroActivity = {
  intro: 'Sanal adımsayar: kartı her salladığında bir adım say. A düğmesi adım sayısını göstersin, B düğmesi sıfırlasın. 10. adımda zafer ezgisi çalsın ve mutlu yüz görünsün.',
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_gesture', 'mk_show_number', 'mk_show_icon', 'mk_play_melody', 'mk_clear', 'variables_set', 'variables_get', 'math_change', 'math_modulo', 'math_arithmetic', 'controls_if', 'logic_compare'],
  starter: () => project('Adımsayar', [onStart(), onGesture('shake', []), onButton('A', []), onButton('B', [])]),
  goals: [
    usesBlocks('hareket', "'kart sallandığında' başlığını ve 'eğer' bloğunu kullan", ['mk_on_gesture', 'controls_if']),
    showsNumber('uc', "3 kez salla, A'ya bas: ekranda 3 görünsün", 3, { hint: "'adim değerine 1 ekle' bloğunu salla başlığına koy; A'da 'sayıyı göster adim'." }),
    showsNumber('on', "Toplam 10 adım atınca A'ya bas: ekranda 10 görünsün", 10),
    playsSound('zafer', '10. adımda zafer ezgisi çalsın', { melody: 'fanfare', hint: "'eğer adim = 10 ise' kolunda 'ezgiyi çal Zafer'." }),
    ledPattern('mutlu', '10. adımda mutlu yüz görünsün', ICON_BY_ID.happy.rows),
    variableIs('sifir', "B'ye basınca adim 0 olsun", 'adim', 0),
  ],
  solution: () => project('Adımsayar', [
    onStart(setVar('adim', 0)),
    onGesture('shake', [changeVar('adim', 1), ifThen(cmp('EQ', getVar('adim'), 10), [icon('happy'), melody('fanfare')])]),
    onButton('A', [showNum(getVar('adim'))]),
    onButton('B', [setVar('adim', 0), clear()]),
  ]),
  scenario: (s) => {
    for (let i = 0; i < 3; i++) { s.shake(); s.advance(300) }
    s.press('A'); s.advance(1500)
    for (let i = 0; i < 7; i++) { s.shake(); s.advance(300) }
    s.advance(3500)
    s.press('A'); s.advance(1500)
    s.press('B'); s.advance(300)
  },
}
