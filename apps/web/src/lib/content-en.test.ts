// Derslerin İngilizcesi (contentEn / guideMdEn): ayna kuralları. Dil etiketli kod blokları birebir aynı, test soruları aynı
// kimlik/tür/cevap/tolerans/seçenek sayısı/beceri, kavram sayısı aynı, kod dışında Türkçe harf yok.
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { codeBlocks, mirrorQuiz, sameOrLocalized, turkishLeft } from '../../../../tools/content/en.mjs'
import { segments } from '../../../../tools/content/code-i18n.mjs'

const tagged = (b: string) => /^```(?!(?:text|txt|md|markdown|plaintext)\b)[A-Za-z0-9+#-]+/.test(b)
// İngilizce kod bloğu = Türkçe kodun yerelleştirilmiş hâli (adlar + yorumlar çevrilir; çakışmada adlar korunur): tools/content/en.mjs sameOrLocalized
const langOf = (block: string) => (/^```(?:python|py)\b/.test(block) ? 'py' : 'c')
const sameCode = (a: string, b: string) => {
  const x: string[] = codeBlocks(a), y: string[] = codeBlocks(b)
  return x.length === y.length && x.every((c, i) => tagged(c) === tagged(y[i]) && (!tagged(c) || sameOrLocalized(c, y[i])))
}
/** Dil etiketli kod bloklarında (tırnak içi alıntılar hariç) Türkçe harf kalan ilk parça. */
const turkishInCode = (md: string): string | undefined => codeBlocks(md).filter(tagged).flatMap((b: string) => segments(b, langOf(b)).filter((g: { t: string }) => g.t !== 'str').map((g: { s: string }) => g.s.replace(/"[^"\n]*"/g, '""'))).find((t: string) => /[çğıöşüÇĞİÖŞÜ]/.test(t))

describe('ders İngilizceleri', () => {
  it('her dersin ve rehberin İngilizcesi var', () => {
    const missing = allModules.flatMap((m) => m.weeks.flatMap((w, wi) => [
      ...(w.guideMd && !w.guideMdEn ? [`${m.slug} h${wi + 1} rehber`] : []),
      ...w.lessons.flatMap((l, li) => (l.contentEn ? [] : [`${m.slug} h${wi + 1} d${li + 1}`])),
    ]))
    expect(missing).toEqual([])
  })
  for (const m of allModules) {
    m.weeks.forEach((w, wi) => {
      if (w.guideMdEn) it(`${m.slug} h${wi + 1} rehber`, () => { expect(turkishLeft(w.guideMdEn!)).toBeNull(); expect(sameCode(w.guideMd ?? '', w.guideMdEn!)).toBe(true); expect(turkishInCode(w.guideMdEn!), 'rehber kodu').toBeUndefined() })
      w.lessons.forEach((l, li) => {
        const en = l.contentEn
        if (!en) return
        const stepsEn = (l as { stepsEn?: { code?: string }[] }).stepsEn
        if (stepsEn) it(`${m.slug} h${wi + 1} d${li + 1} adımlar (kod)`, () => {
          const left = stepsEn.flatMap((st, i) => (st.code && /void setup|#include|;\s*$|^\s*(def |import |from \w+ import)/m.test(st.code) ? [segments(st.code, /void setup|#include|;\s*$/m.test(st.code) ? 'c' : 'py').filter((g: { t: string }) => g.t !== 'str').map((g: { s: string }) => g.s.replace(/"[^"\n]*"/g, '""')).find((t: string) => /[çğıöşüÇĞİÖŞÜ]/.test(t))].filter(Boolean).map((t) => `[${i}] ${String(t).slice(0, 60)}`) : []))
          expect(left).toEqual([])
        })
        it(`${m.slug} h${wi + 1} d${li + 1}`, () => {
          for (const k of ['problem', 'contentMd', 'question'] as const) {
            expect(sameCode(l[k], en[k]), k).toBe(true)
            expect(turkishLeft(en[k]), k).toBeNull()
          }
          expect(turkishLeft(en.title)).toBeNull()
          for (const k of ['problem', 'contentMd', 'question'] as const) expect(turkishInCode(en[k]), `${k}: koddaki Türkçe`).toBeUndefined()
          if (l.explainerMd) { expect(turkishInCode(en.explainerMd ?? ''), 'anlatım kodu').toBeUndefined(); expect(en.explainerMd, 'explainerMd').toBeTruthy(); expect(sameCode(l.explainerMd, en.explainerMd!)).toBe(true); expect(turkishLeft(en.explainerMd!)).toBeNull() }
          if (l.concepts) { expect(en.concepts?.length).toBe(l.concepts.length); expect(turkishLeft(JSON.stringify(en.concepts))).toBeNull() }
          if (l.quiz) { for (const q of en.quiz ?? []) expect(turkishInCode(q.prompt), `quiz ${q.id} kodu`).toBeUndefined()
           expect(() => mirrorQuiz(l.quiz, en.quiz ?? [], 'quiz')).not.toThrow(); expect(turkishLeft(en.quiz!.map((q) => [q.prompt, ...(q.options ?? []), q.explanation].join('\n')).join('\n'))).toBeNull() }
        })
      })
    })
  }
})
