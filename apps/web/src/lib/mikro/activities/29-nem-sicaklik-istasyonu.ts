// Ders 29 (Hafta 6, ders 4): Nem ve sıcaklık istasyonu. Anahtar: mikro-kart:6:4
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { custom, ledPattern, playsSound, serialHas, showsNumber, usesBlocks } from '../goals'
import { b, cmp, getVar, ifThen, onButton, onStart, project, setVar } from '../program'
import { every, icon, mapBlock, melody, showNum } from './h456-ortak'

const nemOku = () => mapBlock(b('mk_pin_aread', { f: { PIN: 'P1' } }), 0, 1023, 0, 100)

export const ders29: MikroActivity = {
  intro: "Küçük hava ve saksı istasyonu. P1 pinine sanal bir toprak nemi sensörü bağlı (Pinler bölümündeki Giriş kaydırıcısı, 0 kuru - 1023 ıslak). A sıcaklığı, B nemi (% olarak), A+B nemi çubuk grafikle göstersin. Her 2 saniyede nemi konsola yaz; nem 30'un altındaysa üzgün yüz ve üzgün ezgi çalsın.",
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_every', 'mk_temperature', 'mk_light', 'logic_operation', 'mk_pin_aread', 'mk_map', 'mk_show_number', 'mk_show_bar', 'mk_show_icon', 'mk_play_melody', 'mk_serial', 'variables_set', 'variables_get', 'controls_if', 'logic_compare'],
  starter: () => project('İstasyon', [onStart(), onButton('A', []), onButton('B', []), onButton('AB', []), every(2000, [])]),
  goals: [
    usesBlocks('bloklar', "'P1 analog oku', 'eşle' ve 'çubuk grafik' bloklarını kullan", ['mk_pin_aread', 'mk_map', 'mk_show_bar']),
    showsNumber('sicak', "Sıcaklık 27 iken A'ya basınca 27 görünsün", 27, { hint: "'sayıyı göster' bloğuna Giriş kategorisinden 'sıcaklık (°C)' sürükle." }),
    showsNumber('nem', "P1 girişi 512 iken B'ye basınca nem 50 (%) görünsün", 50, { hint: "'P1 analog oku' değerini 0-1023 aralığından 0-100 aralığına eşle." }),
    custom('cubuk', "P1 girişi 512 iken A+B'ye basınca çubuk grafik 13 LED yaksın", (c) => !!c.sim && c.sim.cards[0].device.frames.some((f) => [...f.s].filter((ch) => ch === '1').length === 13), { hint: "'çubuk grafik nem / en çok 100'." }),
    serialHas('konsol', 'Nemi konsola yaz', /^\d+$/, { hint: "'her 2000 ms'de' içinde 'konsola yaz' kullan." }),
    ledPattern('uzgun', 'Nem 30 altındayken üzgün yüz görünsün', ICON_BY_ID.sad.rows),
    playsSound('ezgi', 'Nem 30 altındayken üzgün ezgi çalsın', { melody: 'sad' }),
  ],
  solution: () => project('İstasyon', [
    onStart(setVar('nem', 0)),
    onButton('A', [showNum(b('mk_temperature'))]),
    onButton('B', [showNum(nemOku())]),
    onButton('AB', [b('mk_show_bar', { i: { V: nemOku(), MAX: 100 } })]),
    every(2000, [setVar('nem', nemOku()), b('mk_serial', { i: { TEXT: getVar('nem') } }), ifThen(cmp('LT', getVar('nem'), 30), [icon('sad'), melody('sad')])]),
  ]),
  scenario: (s) => {
    s.setPinInput('P1', 512); s.setSensor('temperature', 27)
    s.advance(100); s.press('A'); s.advance(2500)
    s.press('B'); s.advance(2500)
    s.press('AB'); s.advance(300)
    s.setPinInput('P1', 100); s.advance(4500)
  },
}
