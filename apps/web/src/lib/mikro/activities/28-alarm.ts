// Ders 28 (Hafta 6, ders 3): Alarm. Anahtar: mikro-kart:6:3
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { custom, ledPattern, playsSound, usesBlocks } from '../goals'
import { b, cmp, forever, getVar, hatBlock, ifThen, onButton, onStart, project, setVar } from '../program'
import { clear, icon, melody, onGesture, pause } from './h456-ortak'

export const ders28: MikroActivity = {
  intro: "Çanta alarmı: A düğmesi alarmı kursun (ekranda 'evet' işareti). Kurulu kart sallanırsa alarm çalsın (kuru kafa + alarm ezgisi). A+B'ye uzun basınca alarm kapansın: ezgi bitince bir daha başlamasın ve mutlu yüz görünsün.",
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_on_gesture', 'mk_forever', 'mk_show_icon', 'mk_play_melody', 'mk_stop_sound', 'mk_clear', 'mk_pause', 'mk_light', 'variables_set', 'variables_get', 'controls_if', 'logic_compare'],
  starter: () => project('Alarm', [onStart(), onButton('A', []), onGesture('shake', []), forever(), hatBlock('mk_on_button', [], { BTN: 'AB', EV: 'long' })]),
  goals: [
    usesBlocks('bloklar', "'sonsuza kadar', 'eğer' ve 'uzun basılınca' başlığını kullan", ['mk_forever', 'controls_if', 'mk_on_button']),
    ledPattern('kuruldu', "A'ya basınca 'evet' işareti görünsün (alarm kuruldu)", ICON_BY_ID.yes.rows),
    ledPattern('alarm', 'Kurulu kart sallanınca kuru kafa görünsün', ICON_BY_ID.skull.rows),
    playsSound('ezgi', 'Alarm ezgisi çalsın', { melody: 'alarm' }),
    custom('kapat', "A+B'ye uzun basınca alarm ezgisi tekrar başlamasın", (c) => {
      if (!c.sim) return false
      const log = c.sim.cards[0].device.log
      const at = log.findIndex((e) => e.kind === 'input' && e.key === 'button:AB:long')
      if (at < 0) return false
      const t = log[at].t
      return log.slice(0, at).some((e) => e.kind === 'melody') && !log.slice(at + 1).some((e) => e.kind === 'melody' && e.t > t + 50)
    }, { hint: "Sanal kartta A+B düğmesini yaklaşık 1 saniye basılı tut (uzun basış). 'kurulu' ve 'alarm' değişkenlerini 0 yap." }),
    ledPattern('mutlu', "Alarm kapanınca mutlu yüz görünsün", ICON_BY_ID.happy.rows),
  ],
  solution: () => project('Alarm', [
    onStart(setVar('kurulu', 0), setVar('alarm', 0)),
    onButton('A', [setVar('kurulu', 1), icon('yes')]),
    onGesture('shake', [ifThen(cmp('EQ', getVar('kurulu'), 1), [setVar('alarm', 1)])]),
    forever(ifThen(cmp('EQ', getVar('alarm'), 1), [icon('skull'), melody('alarm'), clear(), pause(200)])),
    hatBlock('mk_on_button', [setVar('kurulu', 0), setVar('alarm', 0), b('mk_stop_sound'), icon('happy')], { BTN: 'AB', EV: 'long' }),
  ]),
  scenario: (s) => {
    s.press('A'); s.advance(500)
    s.shake(); s.advance(4500)
    s.press('AB', 1200); s.advance(3500)
  },
}
