// Ders 30 (Hafta 6, ders 5): Final - Akıllı saksı. Anahtar: mikro-kart:6:5
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { custom, ledPattern, playsSound, radioSent, showsNumber, usesBlocks } from '../goals'
import { b, cmp, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import { every, icon, mapBlock, melody, onRadio, radioGroup, radioRecv, showNum } from './h456-ortak'

const nemOku = () => mapBlock(b('mk_pin_aread', { f: { PIN: 'P1' } }), 0, 1023, 0, 100)

export const ders30: MikroActivity = {
  intro: "Akıllı saksı: iki kart birbirinin saksısını izler. Her kart 2 saniyede bir kendi nemini (P1) radyoyla 'nem' adıyla göndersin. Mesajı alan kart nem 30'un altındaysa üzgün yüz ve üzgün ezgi, değilse nemi çubuk grafikle göstersin. A düğmesi kendi nemini göstersin.",
  cards: 2,
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_every', 'mk_on_radio', 'mk_radio_group', 'mk_radio_send_value', 'mk_radio_recv', 'mk_pin_aread', 'mk_map', 'mk_temperature', 'mk_light', 'mk_clear', 'mk_pause', 'logic_operation', 'mk_show_number', 'mk_show_bar', 'mk_show_icon', 'mk_play_melody', 'variables_set', 'variables_get', 'controls_if', 'logic_compare'],
  starter: () => project('Akıllı saksı', [onStart(), every(2000, []), onButton('A', []), onRadio([])]),
  goals: [
    usesBlocks('bloklar', "'her … ms'de', radyo 'ad = değer' gönderimi, 'eşle' ve 'çubuk grafik' bloklarını kullan", ['mk_every', 'mk_radio_send_value', 'mk_on_radio', 'mk_map', 'mk_show_bar', 'mk_pin_aread']),
    radioSent('gonder', "Kart 1 nemini 'nem' adıyla radyoyla göndersin", { kind: 'kv', card: 0, where: (m) => m.name === 'nem' && m.value === 50 }),
    custom('cubuk', 'Kart 2, nem 50 gelince 13 LED yanan çubuk grafik göstersin', (c) => !!c.sim && c.sim.cards[1].device.frames.some((f) => [...f.s].filter((ch) => ch === '1').length === 13), { hint: "'çubuk grafik alınan değer / en çok 100'." }),
    ledPattern('uzgun', "Kart 1, nem 10 olan komşusunu görünce üzgün yüz göstersin", ICON_BY_ID.sad.rows, { card: 0 }),
    playsSound('ezgi', 'Üzgün ezgi çalsın', { melody: 'sad' }),
    showsNumber('kendi', "A'ya basınca Kart 1 kendi nemini (50) göstersin", 50, { card: 0 }),
  ],
  solution: () => project('Akıllı saksı', [
    onStart(radioGroup(7), setVar('nem', 0)),
    every(2000, [setVar('nem', nemOku()), b('mk_radio_send_value', { i: { NAME: 'nem', VALUE: getVar('nem') } })]),
    onButton('A', [setVar('nem', nemOku()), showNum(getVar('nem'))]),
    onRadio([ifThen(cmp('EQ', radioRecv('name'), 'nem'), [
      setVar('uzak', radioRecv('value')),
      ifThen(cmp('LT', getVar('uzak'), 30), [icon('sad'), melody('sad')], [b('mk_show_bar', { i: { V: getVar('uzak'), MAX: 100 } })]),
    ])]),
  ]),
  scenario: (s) => {
    s.setPinInput('P1', 512, 0); s.setPinInput('P1', 100, 1)
    s.advance(5000)
    s.press('A', 100, 0); s.advance(2500)
  },
}
