// Ders 21 (Hafta 5, ders 1): Mesaj gönder, mesaj al. Anahtar: mikro-kart:5:1
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { ledPattern, radioReceived, radioSent, usesBlocks } from '../goals'
import { cmp, ifThen, onButton, onStart, project } from '../program'
import { icon, onRadio, radioGroup, radioNum, radioRecv } from './h456-ortak'

const HEART = ICON_BY_ID.heart.rows
const HAPPY = ICON_BY_ID.happy.rows

export const ders21: MikroActivity = {
  intro: "İki kart aynı radyo grubunda. A düğmesi 1, B düğmesi 2 göndersin. Mesajı alan kart 1'i görünce kalp, 2'yi görünce mutlu yüz göstersin.",
  cards: 2,
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_number', 'mk_radio_recv', 'mk_show_icon', 'controls_if', 'logic_compare'],
  starter: () => project('Radyo selam', [onStart(), onButton('A', []), onButton('B', []), onRadio([])]),
  goals: [
    usesBlocks('grup', "'radyo grubunu … yap' ve 'radyo mesajı alınınca' bloklarını kullan", ['mk_radio_group', 'mk_on_radio'], { hint: 'İkisi de Radyo kategorisinde.' }),
    radioSent('gonder', 'Kart 1: A ile 1, B ile 2 sayısını radyoyla gönder', { kind: 'num', card: 0 }),
    radioReceived('al', 'Kart 2 mesajı alsın', { card: 1 }),
    ledPattern('kalp', 'Kart 2 ekranında kalp (1 gelince) görünsün', HEART, { card: 1, hint: "'eğer alınan sayı = 1 ise kalp göster' kur." }),
    ledPattern('mutlu', 'Kart 2 ekranında mutlu yüz (2 gelince) görünsün', HAPPY, { card: 1, hint: "'değilse' kolunda mutlu yüzü göster." }),
  ],
  solution: () => project('Radyo selam', [
    onStart(radioGroup(1)),
    onButton('A', [radioNum(1)]),
    onButton('B', [radioNum(2)]),
    onRadio([ifThen(cmp('EQ', radioRecv('number'), 1), [icon('heart')], [icon('happy')])]),
  ]),
  scenario: (s) => { s.press('A', 100, 0); s.advance(500); s.press('B', 100, 0); s.advance(500) },
}
