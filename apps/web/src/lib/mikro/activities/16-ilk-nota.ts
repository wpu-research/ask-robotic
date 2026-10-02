// Ders 16 (Hafta 4, ders 1): İlk nota. Anahtar: mikro-kart:4:1
import type { MikroActivity } from '../activity'
import { ICON_BY_ID } from '../icons'
import { afterInputPattern, usesBlocks } from '../goals'
import { onButton, project } from '../program'
import { hz, icon, note, tonesInOrder } from './h456-ortak'

export const ders16: MikroActivity = {
  intro: 'A düğmesine basınca kart Do, Re, Mi notalarını sırayla çalsın; çalarken ekranda nota simgesi görünsün.',
  allowedBlocks: ['mk_on_start', 'mk_on_button', 'mk_play_note', 'mk_show_icon', 'mk_clear'],
  starter: () => project('İlk nota', [onButton('A', [])]),
  goals: [
    usesBlocks('blok', "'… notasını … vuruş çal' bloğunu kullan", ['mk_play_note'], { hint: 'Müzik kategorisinde.' }),
    tonesInOrder('sira', 'A\'ya basınca Do, Re, Mi sırayla çalsın', [hz('Do'), hz('Re'), hz('Mi')], { hint: 'Üç nota bloğunu alt alta ekle; ilkini Do, ikincisini Re, üçüncüsünü Mi yap.' }),
    afterInputPattern('simge', 'Nota çalarken ekranda nota simgesi görünsün', 'button:A:press', ICON_BY_ID.note.rows, { hint: "'simgeyi göster' bloğunu notalardan önce koy ve 'nota'yı seç." }),
  ],
  solution: () => project('İlk nota', [onButton('A', [icon('note'), note('Do'), note('Re'), note('Mi')])]),
  scenario: (s) => { s.press('A'); s.advance(2000) },
}
