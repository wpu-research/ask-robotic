// Ders 24 (Hafta 5, ders 4): İki kartlı sohbet. Anahtar: mikro-kart:5:4
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { ledPattern, playsSound, radioReceived, radioSent, usesBlocks } from '../goals'
import { cmp, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import { icon, melody, onRadio, radioGroup, radioNum, radioRecv } from './h456-ortak'

export const ders24: MikroActivity = {
  intro: 'İki kart aynı programı çalıştırıyor ve birbirine sohbet simgesi gönderiyor. A düğmesi kalp (1), B düğmesi mutlu yüz (2), A+B üzgün yüz (3) göndersin. Mesaj gelince alan kart simgeyi göstersin ve kuş cıvıltısı çalsın.',
  cards: 2,
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_number', 'mk_radio_recv', 'mk_show_icon', 'mk_play_melody', 'variables_set', 'variables_get', 'controls_if', 'logic_compare'],
  starter: () => project('Sohbet', [onStart(), onButton('A', []), onButton('B', []), onButton('AB', []), onRadio([])]),
  goals: [
    usesBlocks('degisken', "Gelen sayıyı 'mesaj' değişkenine ata ve 'eğer … değilse' kullan", ['variables_set', 'controls_if']),
    radioSent('gonder', 'Kart 1, sayı mesajı göndersin', { kind: 'num', card: 0, hint: "Kart 1'de A düğmesine kısa bas." }),
    ledPattern('kalp', 'Kart 2 kalp göstersin (Kart 1, A\'ya basınca)', ICON_BY_ID.heart.rows, { card: 1, hint: "Kart 1'de A düğmesine kısa bas; kalp Kart 2'de görünür." }),
    radioReceived('cevap', 'Kart 1 de bir mesaj alsın (Kart 2 cevap versin)', { card: 0, hint: "Önce Kart 1'de A'ya, sonra Kart 2'de B'ye kısa bas." }),
    ledPattern('mutlu', 'Kart 1 mutlu yüz göstersin (Kart 2, B\'ye basınca)', ICON_BY_ID.happy.rows, { card: 0, hint: "Kart 2'de B düğmesine kısa bas; yüz Kart 1'de görünür." }),
    ledPattern('uzgun', 'Kart 2 üzgün yüz göstersin (Kart 1, A+B\'ye basınca)', ICON_BY_ID.sad.rows, { card: 1 }),
    playsSound('ses', 'Mesaj gelince kuş cıvıltısı çalsın', { melody: 'chirp' }),
  ],
  solution: () => project('Sohbet', [
    onStart(radioGroup(1)),
    onButton('A', [radioNum(1)]),
    onButton('B', [radioNum(2)]),
    onButton('AB', [radioNum(3)]),
    onRadio([
      setVar('mesaj', radioRecv('number')),
      ifThen(cmp('EQ', getVar('mesaj'), 1), [icon('heart')], [ifThen(cmp('EQ', getVar('mesaj'), 2), [icon('happy')], [icon('sad')])]),
      melody('chirp'),
    ]),
  ]),
  scenario: (s) => {
    s.press('A', 100, 0); s.advance(1500)
    s.press('B', 100, 1); s.advance(1500)
    s.press('AB', 100, 0); s.advance(1500)
  },
}
