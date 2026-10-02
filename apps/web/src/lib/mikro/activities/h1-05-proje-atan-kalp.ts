// Ders 5 (proje): Atan kalp.
import type { MikroActivity } from '../activity'
import { ledPattern, usesBlocks } from '../goals'
import { b, forever, onStart, project } from '../program'
import { ICON_ROWS, icon, pause, showedAnyText, text } from './mk-kit'

export const h1d5: MikroActivity = {
  intro: 'Atan kalp: kart açılınca kısa bir yazı kaysın, sonra kalp "tup-tup" diye sonsuza kadar atsın.',
  allowedBlocks: ['mk_on_start', 'mk_forever', 'mk_show_text', 'mk_show_icon', 'mk_pause', 'mk_set_brightness', 'mk_clear', 'controls_repeat_ext'],
  starter: () => project('Atan kalp', [onStart(), forever()]),
  goals: [
    usesBlocks('yapi', "'başlangıçta' ve 'sonsuza kadar' bloklarını birlikte kullan", ['mk_on_start', 'mk_forever']),
    showedAnyText('yazi', "Açılışta bir yazı kaysın ('yazıyı göster')"),
    usesBlocks('parlaklik', "'ekran parlaklığını ... yap' bloğunu kullan", ['mk_set_brightness']),
    ledPattern('buyuk', 'Büyük kalp görünsün', ICON_ROWS('heart')),
    ledPattern('kucuk', 'Küçük kalp görünsün', ICON_ROWS('smallHeart')),
  ],
  solution: () => project('Atan kalp', [
    onStart(b('mk_set_brightness', { i: { B: 200 } }), text('Sev')),
    forever(icon('heart'), pause(150), icon('smallHeart'), pause(100), icon('heart'), pause(150), icon('smallHeart'), pause(400)),
  ]),
  scenario: (s) => { s.advance(6000) },
}
