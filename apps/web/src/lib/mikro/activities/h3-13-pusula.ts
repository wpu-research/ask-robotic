// Ders 13: Pusula.
import type { MikroActivity } from '../activity'
import { ledPattern, showsNumber, usesBlocks } from '../goals'
import { ARROW_BY_ID } from '../icons'
import { arith, b, forever, ifThen, project } from '../program'
import { arrowDeg, num } from './mk-kit'

const ok = (id: string) => ARROW_BY_ID[id].rows

export const h3d3: MikroActivity = {
  intro: "Kuzey bulucu: ok her zaman kuzeyi göstersin. A düğmesine basılı tutarken ekranda pusulanın derecesi görünsün.",
  allowedBlocks: ['mk_forever', 'mk_compass', 'mk_show_arrow_deg', 'mk_show_number', 'mk_button_is', 'mk_show_text', 'mk_show_icon', 'controls_if', 'logic_compare', 'math_arithmetic', 'mk_pause'],
  starter: () => project('Kuzey bulucu', [forever()]),
  goals: [
    usesBlocks('pusula', "'pusula yönü' ve 'oku ... derece yönünde göster' bloklarını kullan", ['mk_compass', 'mk_show_arrow_deg']),
    ledPattern('kuzey', 'Pusula 0 iken ok yukarıyı (kuzey) göstersin', ok('N')),
    ledPattern('dogu', 'Pusulayı 90 derece (doğu) yap: ok sola baksın', ok('W'), { hint: "Ok açısı = 360 - pusula. Kart doğuya dönünce kuzey kartın solunda kalır." }),
    ledPattern('guney', 'Pusulayı 180 derece (güney) yap: ok aşağıyı göstersin', ok('S')),
    showsNumber('derece', "A'ya basılı tutarken pusulanın derecesi görünsün (pusulayı 135 yap, A'yı tut)", 135, { hint: "'eğer A düğmesi basılı mı? ise sayıyı göster pusula yönü değilse oku göster' kalıbını kur." }),
  ],
  solution: () => project('Kuzey bulucu', [
    forever(ifThen(b('mk_button_is', { f: { BTN: 'A' } }), [num(b('mk_compass'))], [arrowDeg(arith('MINUS', 360, b('mk_compass')))])),
  ]),
  scenario: (s) => {
    s.advance(300)
    s.setCompass(90); s.advance(300)
    s.setCompass(180); s.advance(300)
    s.setCompass(135); s.advance(200)
    s.press('A', 400); s.advance(3000)
  },
}
