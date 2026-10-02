// Ders 14: Ses seviyesi: ses ölçer ve alkış sayacı.
import type { MikroActivity } from '../activity'
import { ledCount, showsNumber, usesBlocks, variableIs } from '../goals'
import { changeVar, cmp, forever, getVar, ifThen, onStart, project, setVar, b } from '../program'
import { bar, num, withVars } from './mk-kit'

export const h3d4: MikroActivity = {
  intro: 'Alkış sayacı: ses 150\'yi geçince sayaç bir artsın ve ekranda görünsün; sessizken ekran ses seviyesini çubukla göstersin.',
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_forever', 'mk_sound', 'mk_show_icon', 'mk_show_number', 'mk_show_bar', 'mk_pause', 'controls_if', 'logic_compare', 'variables_get', 'variables_set', 'math_change'],
  starter: () => withVars(project('Alkış sayacı', [onStart(setVar('alkis', 0)), forever()]), ['alkis']),
  goals: [
    usesBlocks('ses', "'ses seviyesi' bloğunu kullan", ['mk_sound']),
    ledCount('cubuk', "Sessizken ses seviyesi çubukla görünsün (ses kaydırıcısını 130'a çek: en az 10 LED yansın)", 10, { hint: "'çubuk grafik ses seviyesi / en çok 255'. Bu blok 'değilse' kolunda olsun." }),
    showsNumber('uc', 'Üç kez yüksek ses çıkar (150 üstü, sonra tekrar sessiz): ekranda 3 görünsün', 3, { hint: "'eğer ses seviyesi > 150 ise alkis değerine 1 ekle, sayıyı göster alkis'." }),
    variableIs('alkis', "'alkis' değişkeni 3 olsun", 'alkis', 3),
  ],
  solution: () => withVars(project('Alkış sayacı', [
    onStart(setVar('alkis', 0)),
    forever(ifThen(cmp('GT', b('mk_sound'), 150), [changeVar('alkis', 1), num(getVar('alkis'))], [bar(b('mk_sound'), 255)])),
  ]), ['alkis']),
  scenario: (s) => {
    s.advance(300)
    s.setSensor('sound', 130); s.advance(300)
    for (const v of [200, 220, 240]) {
      s.setSensor('sound', v); s.advance(100)
      s.setSensor('sound', 20); s.advance(900)
    }
  },
}
