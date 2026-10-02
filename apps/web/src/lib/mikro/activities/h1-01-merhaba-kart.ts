// Ders 1: Merhaba, Mikro Kart. İlk program: başlangıçta yazı ve sayı göster.
import type { MikroActivity } from '../activity'
import { showsNumber, usesBlocks } from '../goals'
import { onStart, project } from '../program'
import { num, showedAnyText, text } from './mk-kit'

export const h1d1: MikroActivity = {
  intro: 'Kartın ilk programını yaz: açılınca ekranda bir yazı kayan, ardından bir sayı görünen bir program.',
  allowedBlocks: ['mk_on_start', 'mk_show_text', 'mk_show_number'],
  starter: () => project('Merhaba kart', [onStart()]),
  goals: [
    usesBlocks('baslangic', "'başlangıçta' bloğunun içine blok koy", ['mk_on_start', 'mk_show_text']),
    showedAnyText('yazi', 'Ekranda bir yazı kaysın', "'yazıyı göster' bloğunu 'başlangıçta' bloğunun içine sürükle, ▶ düğmesine bas."),
    showsNumber('sayi', 'Yazıdan sonra bir sayı göster', () => true, { hint: "'sayıyı göster' bloğunu yazı bloğunun altına tak." }),
  ],
  solution: () => project('Merhaba kart', [onStart(text('Merhaba'), num(7))]),
  scenario: (s) => { s.advance(7000) },
}
