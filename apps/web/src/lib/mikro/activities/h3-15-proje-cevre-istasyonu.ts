// Ders 15 (proje): Çevre istasyonu.
import type { MikroActivity } from '../activity'
import { afterInput, custom, ledCount, usesBlocks } from '../goals'
import { usedTypes } from '../program'
import { arith, b, cmp, forever, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import { bar, num, withVars } from './mk-kit'

export const h3d5: MikroActivity = {
  intro: "Çevre istasyonu: A düğmesi modu değiştirsin (sıcaklık, ışık, ses). Ekran seçili sensörü çubukla göstersin; B'ye basılı tutunca sayı görünsün.",
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_forever', 'mk_temperature', 'mk_light', 'mk_sound', 'mk_compass', 'mk_show_icon', 'mk_show_bar', 'mk_show_number', 'mk_button_is', 'mk_pause', 'controls_if', 'logic_compare', 'math_modulo', 'math_arithmetic', 'variables_get', 'variables_set', 'math_change'],
  starter: () => withVars(project('Çevre istasyonu', [onStart(setVar('mod', 0)), onButton('A', []), forever()]), ['mod', 'okuma', 'enCok']),
  goals: [
    usesBlocks('sensorler', "Üç sensörü de kullan: sıcaklık, ışık, ses", ['mk_temperature', 'mk_light', 'mk_sound']),
    usesBlocks('cubuk', "'çubuk grafik' ve 'kalanı' bloklarını kullan", ['mk_show_bar', 'math_modulo']),
    ledCount('sicak', "Sıcaklığı 30 yap: çubuk en az 15 LED yaksın (mod 0)", 15, { hint: "mod 0 için 'okuma = sıcaklık', 'enCok = 40' yap; çubuk: okuma / enCok." }),
    afterInput('sayi', "B'ye basılı tutunca okunan değer sayı olarak görünsün", 'button:B:press', (e) => e.kind === 'number', { hint: "forever içinde: 'eğer B düğmesi basılı mı? ise sayıyı göster okuma değilse çubuk grafik'." }),
    custom('mod', "A'ya üç kez basınca mod başa dönsün (0, 1, 2, sonra yine 0)", (c) => {
      const d = c.sim?.cards[0]
      if (!d) return false
      const a = d.device.log.filter((e) => e.kind === 'input' && e.key === 'button:A:press').length
      return a >= 3 && d.runtime.vars.get('mod') === 0 && usedTypes(c.ws).has('math_modulo')
    }, { hint: "Sanal kartta A düğmesine üç kez kısa bas. A bloğu: 'mod değerini (mod + 1) ÷ 3 işleminin kalanı yap'." }),
  ],
  solution: () => withVars(project('Çevre istasyonu', [
    onStart(setVar('mod', 0)),
    onButton('A', [setVar('mod', b('math_modulo', { i: { DIVIDEND: arith('ADD', getVar('mod'), 1), DIVISOR: 3 } }))]),
    forever(
      ifThen(cmp('EQ', getVar('mod'), 0),
        [setVar('okuma', b('mk_temperature')), setVar('enCok', 40)],
        [ifThen(cmp('EQ', getVar('mod'), 1),
          [setVar('okuma', b('mk_light')), setVar('enCok', 255)],
          [setVar('okuma', b('mk_sound')), setVar('enCok', 255)])]),
      ifThen(b('mk_button_is', { f: { BTN: 'B' } }), [num(getVar('okuma'))], [bar(getVar('okuma'), getVar('enCok'))]),
    ),
  ]), ['mod', 'okuma', 'enCok']),
  scenario: (s) => {
    s.setSensor('temperature', 30); s.advance(400)
    s.press('B', 400); s.advance(2500)
    s.press('A'); s.advance(300)
    s.press('A'); s.advance(300)
    s.setSensor('sound', 200); s.advance(300)
    s.press('A'); s.advance(300)
  },
}
