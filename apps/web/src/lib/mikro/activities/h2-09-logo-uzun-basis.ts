// Ders 9: Logoya dokunma ve uzun basış.
import type { MikroActivity } from '../activity'
import { afterInputPattern, usesBlocks } from '../goals'
import { hatBlock, onButton, project } from '../program'
import { ICON_ROWS, clear, clearedAfter, icon } from './mk-kit'

export const h2d4: MikroActivity = {
  intro: 'Gizli düğmeler: logoya dokununca kalp görünsün, çekince ekran sönsün; A\'ya 1 saniye basılı tutunca uyuyan yüz gelsin.',
  allowedBlocks: ['mk_on_logo', 'mk_on_button', 'mk_show_icon', 'mk_clear', 'mk_pause'],
  starter: () => project('Gizli düğmeler', [hatBlock('mk_on_logo', [], { EV: 'touch' }), hatBlock('mk_on_logo', [], { EV: 'release' }), onButton('A', [], 'long')]),
  goals: [
    usesBlocks('logo', "'logoya ... ' bloklarını kullan", ['mk_on_logo']),
    afterInputPattern('dokun', 'Logoya dokununca kalp görünsün', 'logo:touch', ICON_ROWS('heart')),
    clearedAfter('birak', 'Logodan parmağını çekince ekran sönsün', 'logo:release', "İkinci logo bloğunun listesi 'bırakılınca' olsun; içine 'ekranı temizle' koy."),
    afterInputPattern('uzun', "A'ya uzun basınca uyuyan yüz görünsün", 'button:A:long', ICON_ROWS('asleep'), { hint: "'düğme A' bloğunun ikinci listesini 'uzun basılınca' yap. Sanal düğmeyi 1 saniye basılı tut." }),
  ],
  solution: () => project('Gizli düğmeler', [
    hatBlock('mk_on_logo', [icon('heart')], { EV: 'touch' }),
    hatBlock('mk_on_logo', [clear()], { EV: 'release' }),
    onButton('A', [icon('asleep')], 'long'),
  ]),
  scenario: (s) => { s.touchLogo(300); s.advance(200); s.press('A', 1200); s.advance(300) },
}
