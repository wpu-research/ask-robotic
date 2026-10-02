// Ders 23 (Hafta 5, ders 3): Gizli mesaj. Anahtar: mikro-kart:5:3
import type { MikroActivity } from '../activity'
import { radioSent, showsNumber, usesBlocks, variableIs } from '../goals'
import { arith, changeVar, getVar, onButton, onStart, project, setVar } from '../program'
import { onRadio, radioGroup, radioNum, radioRecv, showNum } from './h456-ortak'

export const ders23: MikroActivity = {
  intro: "A düğmesi gizli rakamı 1 artırıp ekranda göstersin. B düğmesi rakama anahtar (7) ekleyip radyoyla göndersin. Alan kart gelen sayıdan 7 çıkarıp gerçek rakamı göstersin.",
  cards: 2,
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_number', 'mk_radio_recv', 'mk_show_number', 'variables_set', 'variables_get', 'math_change', 'math_arithmetic'],
  starter: () => project('Şifreli mesaj', [onStart(), onButton('A', []), onButton('B', []), onRadio([])]),
  goals: [
    usesBlocks('matematik', 'Toplama ve çıkarma bloklarını kullan', ['math_arithmetic', 'math_change']),
    variableIs('gizli', "A'ya 3 kez basınca 'gizli' değişkeni 3 olsun", 'gizli', 3, { hint: "'gizli' değişkenini başlangıçta 0 yap; A'da 1 artır." }),
    radioSent('sifreli', 'Kart 1, 3 rakamını şifreleyip 10 olarak göndersin', { kind: 'num', card: 0, where: (m) => m.num === 10, hint: "Gönderilecek sayı: 'gizli + anahtar'." }),
    showsNumber('cozulen', 'Kart 2, 10 sayısını çözüp 3 göstersin', 3, { card: 1, hint: "'alınan sayı − anahtar' hesabını göster." }),
  ],
  solution: () => project('Şifreli mesaj', [
    onStart(radioGroup(1), setVar('gizli', 0), setVar('anahtar', 7)),
    onButton('A', [changeVar('gizli', 1), showNum(getVar('gizli'))]),
    onButton('B', [radioNum(arith('ADD', getVar('gizli'), getVar('anahtar')))]),
    onRadio([showNum(arith('MINUS', radioRecv('number'), getVar('anahtar')))]),
  ]),
  scenario: (s) => {
    for (let i = 0; i < 3; i++) { s.press('A', 100, 0); s.advance(1000) }
    s.press('B', 100, 0); s.advance(1500)
  },
}
