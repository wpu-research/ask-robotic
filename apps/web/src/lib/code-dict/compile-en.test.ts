// Çevrilmiş (İngilizce) kodun gerçekten DERLENDİĞİNİ ve davranışının değişmediğini doğrular. arduino-cli gerekir; yavaş olduğu için
// yalnız CODE_I18N_COMPILE=1 ile çalışır:  CODE_I18N_COMPILE=1 npx vitest run src/lib/code-dict/compile-en.test.ts
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { compileSketch } from '@/lib/compile/compile'
import { allArenaActivities } from '../arena/activity'
import { runHeadless } from '../arena/headless'
import { hasCli, solutionOf } from '../arena/test-support'
import { LAB_ACTIVITIES } from '../lab/activities'
import { canonicalCode, localizeCode } from '../code-i18n'
import { CODE_DICT_EN } from './index'

const on = hasCli && !!process.env.CODE_I18N_COMPILE
const T = 600_000

describe.skipIf(!on)('çevrilmiş kod derlenir ve aynı davranır', () => {
  describe('arena çözümleri', () => {
    for (const [k, a] of allArenaActivities()) {
      it(`${k}: İngilizce çözüm derlenir ve hedefler (kanonik kodla) sağlanır`, async () => {
        const en = localizeCode(solutionOf(k, a), CODE_DICT_EN)
        const r = await compileSketch(en)
        if (!r.ok) throw new Error('İngilizce çözüm derlenmedi: ' + JSON.stringify(r).slice(0, 400))
        const out = runHeadless(a, r.hex, canonicalCode(en, CODE_DICT_EN))
        expect(out.results.filter((x) => !x.done).map((x) => x.id)).toEqual([])
      }, T)
    }
  })

  describe('laboratuvar çözümleri', () => {
    for (const [k, a] of Object.entries(LAB_ACTIVITIES)) {
      const sol = a.solution?.()
      if (!sol?.code) continue
      it(`${k}: İngilizce çözüm derlenir`, async () => {
        const r = await compileSketch(localizeCode(sol.code, CODE_DICT_EN))
        if (!r.ok) throw new Error('İngilizce çözüm derlenmedi: ' + JSON.stringify(r).slice(0, 400))
      }, T)
    }
  })

  describe('ders içeriği (İngilizce) sketch blokları', () => {
    const blocks = allModules.flatMap((m) => m.weeks.flatMap((w, wi) => w.lessons.flatMap((l, li) => (l.contentEn ? [...(l.contentEn.contentMd.matchAll(/```cpp\n(\/\/\s*sketch:[^\n]*\n[\s\S]*?)```/g))].map((x, bi) => ({ id: `${m.slug} h${wi + 1} d${li + 1} #${bi + 1}`, code: x[1] })) : []))))
    it('bulundu', () => { expect(blocks.length).toBeGreaterThan(20) })
    for (const b of blocks) it(`${b.id} derlenir`, async () => {
      const r = await compileSketch(b.code)
      if (!r.ok) throw new Error('derlenmedi: ' + JSON.stringify(r).slice(0, 400))
    }, T)
  })
})
