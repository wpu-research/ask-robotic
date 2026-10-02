// Ders 22 (Hafta 5, ders 2): Yazı, ad = değer ve sinyal. Anahtar: mikro-kart:5:2
import type { MikroActivity } from '../activity'
import { radioSent, showsNumber, showsText, usesBlocks } from '../goals'
import { b, cmp, ifThen, onButton, onStart, project } from '../program'
import { onRadio, radioGroup, radioRecv, showNum, showText } from './h456-ortak'

export const ders22: MikroActivity = {
  intro: "A düğmesi 'selam' yazısını, B düğmesi 'sicak = sıcaklık' çiftini göndersin. Alan kart 'sicak' adını görürse değeri sayı olarak, yoksa yazıyı göstersin.",
  cards: 2,
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_number', 'mk_radio_signal', 'mk_radio_send_text', 'mk_radio_send_value', 'mk_radio_recv', 'mk_temperature', 'mk_light', 'mk_show_bar', 'mk_show_text', 'mk_show_number', 'controls_if', 'logic_compare'],
  starter: () => project('Yazı ve değer', [onStart(), onButton('A', []), onButton('B', []), onRadio([])]),
  goals: [
    usesBlocks('bloklar', "'radyoyla yazı gönder', 'radyoyla … = … gönder' ve 'alınan ad' bloklarını kullan", ['mk_radio_send_text', 'mk_radio_send_value', 'mk_radio_recv'], { hint: 'Hepsi Radyo kategorisinde.' }),
    radioSent('yazi', "Kart 1: A ile 'selam' yazısını gönder", { kind: 'str', card: 0, where: (m) => m.str === 'selam', hint: "Kart 1'de A düğmesine kısa bas." }),
    radioSent('cift', "Kart 1: B ile 'sicak' adıyla sıcaklığı gönder", { kind: 'kv', card: 0, where: (m) => m.name === 'sicak', hint: "Kart 1'de B düğmesine kısa bas." }),
    showsText('selam', "Kart 2 ekranında 'selam' yazısı kaysın", 'selam', { card: 1 }),
    showsNumber('sicak', 'Kart 2, gelen sıcaklığı (28) sayı olarak göstersin', 28, { card: 1, hint: "Karttaki 'Sıcaklık' kaydırıcısını 28 yapıp B'ye bas." }),
  ],
  solution: () => project('Yazı ve değer', [
    onStart(radioGroup(1)),
    onButton('A', [b('mk_radio_send_text', { i: { TEXT: 'selam' } })]),
    onButton('B', [b('mk_radio_send_value', { i: { NAME: 'sicak', VALUE: b('mk_temperature') } })]),
    onRadio([ifThen(cmp('EQ', radioRecv('name'), 'sicak'), [showNum(radioRecv('value'))], [showText(radioRecv('text'))])]),
  ]),
  scenario: (s) => {
    s.press('A', 100, 0); s.advance(4000)
    s.setSensor('temperature', 28, 0); s.press('B', 100, 0); s.advance(3000)
  },
}
