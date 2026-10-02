// Ders 3: Hazır simgeler ve kendi çizdiğin desen (LED'leri göster).
import type { MikroActivity } from '../activity'
import { ledPattern, usesBlocks } from '../goals'
import { onStart, project } from '../program'
import { ICON_ROWS, icon, leds, pause } from './mk-kit'

export const ROBOT_BASI = ['00100', '01110', '10101', '11111', '10101']

export const h1d3: MikroActivity = {
  intro: 'Sırayla mutlu yüz, üzgün yüz ve kendi çizdiğin robot başını göster.',
  allowedBlocks: ['mk_on_start', 'mk_show_icon', 'mk_show_leds', 'mk_pause', 'mk_clear'],
  starter: () => project('Yüzler', [onStart()]),
  goals: [
    usesBlocks('desen', "'LED'leri göster' bloğunu kullan", ['mk_show_leds']),
    ledPattern('mutlu', 'Mutlu yüzü göster', ICON_ROWS('happy'), { hint: "'simgeyi göster' bloğunda 'mutlu yüz' seçili olsun." }),
    ledPattern('uzgun', 'Üzgün yüzü göster', ICON_ROWS('sad')),
    ledPattern('robot', 'Kendi çizdiğin robot başını göster (derste çizimi var)', ROBOT_BASI, { hint: "Kutulara tıkla: 1. satırda ortadaki; 2. satırda ortadaki üç; 3. satırda 1., 3., 5.; 4. satırda hepsi; 5. satırda 1., 3., 5." }),
  ],
  solution: () => project('Yüzler', [onStart(icon('happy'), pause(1000), icon('sad'), pause(1000), leds(ROBOT_BASI))]),
  scenario: (s) => { s.advance(3000) },
}
