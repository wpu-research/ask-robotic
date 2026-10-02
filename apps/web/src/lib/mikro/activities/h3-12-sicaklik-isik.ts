// Ders 12: Sıcaklık ve ışık sensörü.
import type { MikroActivity } from '../activity'
import { afterInput, afterInputPattern, usesBlocks } from '../goals'
import { b, cmp, ifThen, onButton, project } from '../program'
import { ICON_ROWS, bar, icon, num } from './mk-kit'

const DOLU = ['11111', '11111', '11111', '11111', '11111']

export const h3d2: MikroActivity = {
  intro: "Mini hava istasyonu: A sıcaklığı göstersin (30 dereceden sıcaksa üzgün yüz de gelsin), B ışık seviyesini çubuk grafikle göstersin.",
  allowedBlocks: ['mk_on_button', 'mk_temperature', 'mk_light', 'mk_show_number', 'mk_show_icon', 'mk_show_bar', 'mk_pause', 'controls_if', 'logic_compare'],
  starter: () => project('Hava istasyonu', [onButton('A', []), onButton('B', [])]),
  goals: [
    usesBlocks('sensorler', "'sıcaklık' ve 'ışık seviyesi' bloklarını kullan", ['mk_temperature', 'mk_light']),
    afterInput('sicaklik', "A'ya basınca sıcaklık sayısı görünsün", 'button:A:press', (e) => e.kind === 'number', { hint: "'sayıyı göster' içine 'sıcaklık (°C)' bloğunu tak." }),
    afterInputPattern('sicak', "Sıcaklığı 30'un üstüne çıkar, A'ya bas: üzgün yüz görünsün", 'button:A:press', ICON_ROWS('sad'), { hint: "'eğer sıcaklık > 30 ise simgeyi göster üzgün yüz' bloğunu ekle. Sıcaklık kaydırıcısını sağa çek." }),
    afterInputPattern('isik', "Işık kaydırıcısını sonuna çek, B'ye bas: bütün LED'ler yansın", 'button:B:press', DOLU, { hint: "'çubuk grafik ışık seviyesi / en çok 255' bloğunu B'ye koy." }),
  ],
  solution: () => project('Hava istasyonu', [
    onButton('A', [num(b('mk_temperature')), ifThen(cmp('GT', b('mk_temperature'), 30), [icon('sad')])]),
    onButton('B', [bar(b('mk_light'), 255)]),
  ]),
  scenario: (s) => {
    s.press('A'); s.advance(3000)
    s.setSensor('temperature', 35)
    s.press('A'); s.advance(4000)
    s.setSensor('light', 255)
    s.press('B'); s.advance(500)
  },
}
