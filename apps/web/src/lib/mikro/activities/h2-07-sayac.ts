// Ders 7: Değişken ve sayaç.
import type { MikroActivity } from '../activity'
import { afterInput, showsNumber, usesBlocks } from '../goals'
import { changeVar, getVar, onButton, onStart, project, setVar } from '../program'
import { num, withVars } from './mk-kit'

export const h2d2: MikroActivity = {
  intro: 'Ziyaretçi sayacı: A bir artırsın, B bir azaltsın, A+B sıfırlasın. Sayıyı her seferinde ekranda göster.',
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_show_number', 'variables_get', 'variables_set', 'math_change'],
  starter: () => withVars(project('Sayaç', [onStart(), onButton('A', []), onButton('B', []), onButton('AB', [])]), ['sayi']),
  goals: [
    usesBlocks('degisken', "'sayi' değişkenini değiştir ve oku (değer yap, ekle, değişken bloğu)", ['variables_set', 'math_change', 'variables_get']),
    showsNumber('uc', "A'ya üç kez basınca ekranda 3 görünsün", 3, { hint: "A düğmesine kısa kısa üç kez bas. A bloğuna: 'sayi değerine 1 ekle', sonra 'sayıyı göster' ve içine 'sayi' bloğunu tak." }),
    afterInput('iki', "Ardından B'ye basınca 2 görünsün", 'button:B:press', (e) => e.kind === 'number' && e.value === 2, { hint: "B bloğunda 'sayi değerine -1 ekle' kullan." }),
    afterInput('sifir', "A+B'ye basınca sayaç 0'a dönsün ve 0 görünsün", 'button:AB:press', (e) => e.kind === 'number' && e.value === 0, { hint: "'sayi değerini 0 yap', sonra sayıyı göster." }),
  ],
  solution: () => withVars(project('Sayaç', [
    onStart(setVar('sayi', 0)),
    onButton('A', [changeVar('sayi', 1), num(getVar('sayi'))]),
    onButton('B', [changeVar('sayi', -1), num(getVar('sayi'))]),
    onButton('AB', [setVar('sayi', 0), num(getVar('sayi'))]),
  ]), ['sayi']),
  scenario: (s) => {
    for (let i = 0; i < 3; i++) { s.press('A'); s.advance(1000) }
    s.press('B'); s.advance(1000)
    s.press('AB'); s.advance(1000)
  },
}
