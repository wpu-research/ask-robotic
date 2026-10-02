// Ders 11: İvmeölçer: sallama ve yatırma.
import type { MikroActivity } from '../activity'
import { afterInput, afterInputPattern, usesBlocks } from '../goals'
import { b, hatBlock, ifThen, project } from '../program'
import { ICON_ROWS, icon } from './mk-kit'

export const h3d1: MikroActivity = {
  intro: 'Sihirli top: kartı sallayınca rastgele "evet" ya da "hayır" çıksın; sola yatırınca sol ok, sağa yatırınca sağ ok görünsün.',
  allowedBlocks: ['mk_on_gesture', 'mk_show_icon', 'mk_clear', 'mk_pause', 'mk_random_bool', 'controls_if'],
  starter: () => project('Sihirli top', [
    hatBlock('mk_on_gesture', [], { G: 'shake' }),
    hatBlock('mk_on_gesture', [], { G: 'tiltLeft' }),
    hatBlock('mk_on_gesture', [], { G: 'tiltRight' }),
  ]),
  goals: [
    usesBlocks('hareket', "'kart ... ' hareket bloklarını kullan", ['mk_on_gesture']),
    usesBlocks('yazitura', "'yazı tura' bloğunu 'eğer' ile kullan", ['mk_random_bool', 'controls_if']),
    afterInput('salla', 'Kartı salla: ekranda "evet" ya da "hayır" simgesi çıksın', 'gesture:shake', (e) => e.kind === 'icon' && (e.icon === 'yes' || e.icon === 'no'), { hint: "'eğer yazı tura ise' kalıbında 'değilse' kolunu da aç: biri evet, biri hayır." }),
    afterInputPattern('sol', 'Sola yatırınca sol ok görünsün', 'gesture:tiltLeft', ICON_ROWS('arrowLeft'), { hint: "Sanal kartı sola yatır (eğim kaydırıcısı ya da 'sola yat' hareketi)." }),
    afterInputPattern('sag', 'Sağa yatırınca sağ ok görünsün', 'gesture:tiltRight', ICON_ROWS('arrowRight'), { hint: "Sanal kartı sağa yatır (eğim kaydırıcısı ya da 'sağa yat' hareketi)." }),
  ],
  solution: () => project('Sihirli top', [
    hatBlock('mk_on_gesture', [ifThen(b('mk_random_bool'), [icon('yes')], [icon('no')])], { G: 'shake' }),
    hatBlock('mk_on_gesture', [icon('arrowLeft')], { G: 'tiltLeft' }),
    hatBlock('mk_on_gesture', [icon('arrowRight')], { G: 'tiltRight' }),
  ]),
  scenario: (s) => { s.shake(); s.advance(600); s.gesture('tiltLeft'); s.advance(300); s.gesture('tiltRight'); s.advance(300) },
}
