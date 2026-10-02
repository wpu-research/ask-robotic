// Ders 4: Sıra ve tekrar. 'tekrarla' döngüsü.
import type { MikroActivity } from '../activity'
import { ledPattern, usesBlocks } from '../goals'
import { onStart, project, repeat } from '../program'
import { ICON_ROWS, clear, icon, patternSeenTimes, pause } from './mk-kit'

export const h1d4: MikroActivity = {
  intro: 'Kareyi üç kez yanıp söndür, sonra "evet" simgesini göster. Aynı blokları üç kez yazma: tekrarla bloğunu kullan.',
  allowedBlocks: ['mk_on_start', 'mk_show_icon', 'mk_clear', 'mk_pause', 'controls_repeat_ext'],
  starter: () => project('Üç yanıp sönme', [onStart()]),
  goals: [
    usesBlocks('dongu', "'kez tekrarla' bloğunu kullan", ['controls_repeat_ext']),
    patternSeenTimes('uc', 'Kare ekranda tam üç kez yanıp sönsün (en az 3 kez görünsün)', ICON_ROWS('square'), 3, "Tekrarla bloğuna 3 yaz; içine: kare göster, bekle, temizle, bekle."),
    ledPattern('evet', 'Tekrar bitince "evet" simgesini göster', ICON_ROWS('yes'), { hint: "'evet' simgesi tekrarla bloğunun DIŞINDA, altında olmalı." }),
  ],
  solution: () => project('Üç yanıp sönme', [onStart(
    repeat(3, [icon('square'), pause(300), clear(), pause(300)]),
    icon('yes'),
  )]),
  scenario: (s) => { s.advance(3000) },
}
