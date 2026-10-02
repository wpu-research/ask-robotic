// Ders 25 (Hafta 5, ders 5): Proje - Uzaktan kumanda. Anahtar: mikro-kart:5:5
import type { MikroActivity } from '../activity'
import { ARROW_BY_ID, ICON_BY_ID } from '../icons'
import { custom, ledPattern, pinWritten, radioReceived, usesBlocks } from '../goals'
import { b, cmp, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import type { PBlock } from '../types'
import { icon, onGesture, onRadio, radioGroup, radioNum, radioRecv } from './h456-ortak'

const ARROW = (id: string) => ARROW_BY_ID[id].rows
const arrow = (d: string): PBlock => b('mk_show_arrow', { f: { DIR: d } })
const servo = (a: number): PBlock => b('mk_pin_servo', { f: { PIN: 'P0' }, i: { ANGLE: a } })

/** komut 1..4 -> ok yönü + servo; 0 -> dur. Zincirleme eğer/değilse. */
const komutZinciri = (): PBlock => {
  const k = getVar('komut')
  return ifThen(cmp('EQ', k, 1), [arrow('W'), servo(45)], [
    ifThen(cmp('EQ', k, 2), [arrow('E'), servo(135)], [
      ifThen(cmp('EQ', k, 3), [arrow('N'), servo(90)], [
        ifThen(cmp('EQ', k, 4), [arrow('S'), servo(90)], [icon('no'), servo(90)]),
      ]),
    ]),
  ])
}

export const ders25: MikroActivity = {
  intro: 'Kart 1 kumanda, Kart 2 araç olsun. Kumandayı sola/sağa/öne/arkaya yatır; her yön bir komut sayısı göndersin (1-4). Alan kart yön okunu göstersin ve P0 servosunu çevirsin. A düğmesi "dur" (0) göndersin.',
  cards: 2,
  allowedBlocks: [
    'mk_on_start', 'mk_on_button', 'mk_on_gesture', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_number', 'mk_radio_recv',
    'mk_show_arrow', 'mk_show_icon', 'mk_pin_servo', 'mk_clear', 'mk_play_note', 'mk_tilt', 'mk_radio_send_value', 'variables_set', 'variables_get', 'controls_if', 'logic_compare',
  ],
  starter: () => project('Uzaktan kumanda', [
    onStart(), onGesture('tiltLeft', []), onGesture('tiltRight', []), onGesture('tiltForward', []), onGesture('tiltBack', []), onButton('A', []), onRadio([]),
  ]),
  goals: [
    usesBlocks('bloklar', "'kart sola yatınca' gibi başlıkları, radyo gönderimini ve 'oku göster' bloğunu kullan", ['mk_on_gesture', 'mk_radio_send_number', 'mk_show_arrow', 'mk_on_radio']),
    custom('komutlar', 'Kart 1, 1, 2, 3 ve 4 komutlarını göndersin', (c) => !!c.sim && [1, 2, 3, 4].every((n) => c.sim!.cards[0].device.log.some((e) => e.kind === 'radioSend' && e.msg.num === n)), { hint: 'Her yatış başlığına farklı bir sayı koy: sola 1, sağa 2, öne 3, arkaya 4.' }),
    radioReceived('al', 'Kart 2 komutları alsın', { card: 1 }),
    ledPattern('sol', 'Kart 2: sola yatınca sol ok', ARROW('W'), { card: 1 }),
    ledPattern('sag', 'Kart 2: sağa yatınca sağ ok', ARROW('E'), { card: 1 }),
    ledPattern('on', 'Kart 2: öne yatınca yukarı ok', ARROW('N'), { card: 1 }),
    ledPattern('arka', 'Kart 2: arkaya yatınca aşağı ok', ARROW('S'), { card: 1 }),
    pinWritten('servo', 'Kart 2: sola yatınca P0 servosu 45 derece, sağa yatınca 135 derece olsun', 'P0', 'servo', (v) => v === 45 || v === 135, { hint: "'P0 servo açısı' bloğunu oklarla birlikte kullan." }),
    ledPattern('dur', 'A düğmesi gönderince Kart 2 "hayır" simgesi (dur) göstersin', ICON_BY_ID.no.rows, { card: 1 }),
  ],
  solution: () => project('Uzaktan kumanda', [
    onStart(radioGroup(1)),
    onGesture('tiltLeft', [radioNum(1)]),
    onGesture('tiltRight', [radioNum(2)]),
    onGesture('tiltForward', [radioNum(3)]),
    onGesture('tiltBack', [radioNum(4)]),
    onButton('A', [radioNum(0)]),
    onRadio([setVar('komut', radioRecv('number')), komutZinciri()]),
  ]),
  scenario: (s) => {
    s.gesture('tiltLeft', 0); s.advance(500)
    s.gesture('tiltRight', 0); s.advance(500)
    s.gesture('tiltForward', 0); s.advance(500)
    s.gesture('tiltBack', 0); s.advance(500)
    s.press('A', 100, 0); s.advance(500)
  },
}
