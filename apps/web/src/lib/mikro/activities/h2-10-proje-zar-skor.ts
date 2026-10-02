// Ders 10 (proje): Zar oyunu skor panosu.
import type { MikroActivity } from '../activity'
import { afterInput, playsSound, showsNumber, usesBlocks } from '../goals'
import { b, changeVar, cmp, getVar, ifThen, onButton, onStart, project, randomInt, setVar } from '../program'
import { num, withVars } from './mk-kit'

export const h2d5: MikroActivity = {
  intro: 'Zar oyunu skor panosu: A zar atıp toplama eklesin (6 gelince zafer ezgisi), B toplamı göstersin, A+B oyunu sıfırlasın.',
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_show_number', 'mk_play_melody', 'mk_show_icon', 'mk_pause', 'math_random_int', 'variables_get', 'variables_set', 'math_change', 'controls_if', 'logic_compare'],
  starter: () => withVars(project('Zar skor panosu', [onStart(setVar('toplam', 0)), onButton('A', []), onButton('B', []), onButton('AB', [])]), ['zar', 'toplam']),
  goals: [
    usesBlocks('bloklar', "Rastgele sayı ve 'ekle' bloklarını kullan", ['math_random_int', 'math_change']),
    showsNumber('zar', "A'ya basınca 1-6 arası bir zar sayısı görünsün", (n) => n >= 1 && n <= 6),
    playsSound('zafer', '6 gelince zafer ezgisi çalsın (6 gelene kadar bas)', { melody: 'fanfare' }),
    afterInput('goster', "A'ya beş kez ya da fazla bas; B'ye basınca toplam (en az 5) görünsün", 'button:B:press', (e) => e.kind === 'number' && e.value >= 5, { hint: "'toplam değerine zar ekle' bloğunu A'nın içine, 'sayıyı göster toplam' bloğunu B'nin içine koy." }),
    afterInput('sifirla', "A+B'ye basınca toplam sıfırlansın ve 0 görünsün", 'button:AB:press', (e) => e.kind === 'number' && e.value === 0),
  ],
  solution: () => withVars(project('Zar skor panosu', [
    onStart(setVar('toplam', 0)),
    onButton('A', [
      setVar('zar', randomInt(1, 6)),
      changeVar('toplam', getVar('zar')),
      num(getVar('zar')),
      ifThen(cmp('EQ', getVar('zar'), 6), [b('mk_play_melody', { f: { MEL: 'fanfare' } })]),
    ]),
    onButton('B', [num(getVar('toplam'))]),
    onButton('AB', [setVar('toplam', 0), num(getVar('toplam'))]),
  ]), ['zar', 'toplam']),
  scenario: (s) => {
    const played = () => s.device(0).log.some((e) => e.kind === 'melody' && e.name === 'fanfare')
    for (let i = 0; i < 80 && (i < 6 || !played()); i++) { s.press('A'); s.advance(900) }
    s.advance(4000)
    s.press('B'); s.advance(3000)
    s.press('AB'); s.advance(1500)
  },
}
