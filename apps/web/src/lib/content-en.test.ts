// Derslerin İngilizcesi (contentEn / guideMdEn): ayna kuralları. Dil etiketli kod blokları birebir aynı, test soruları aynı
// kimlik/tür/cevap/tolerans/seçenek sayısı/beceri, kavram sayısı aynı, kod dışında Türkçe harf yok.
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { codeBlocks, mirrorQuiz, turkishLeft } from '../../../../tools/content/en.mjs'

const tagged = (b: string) => /^```(?!(?:text|txt|md|markdown|plaintext)\b)[A-Za-z0-9+#-]+/.test(b)
const sameCode = (a: string, b: string) => {
  const x: string[] = codeBlocks(a), y: string[] = codeBlocks(b)
  return x.length === y.length && x.every((c, i) => tagged(c) === tagged(y[i]) && (!tagged(c) || c === y[i]))
}

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
      if (w.guideMdEn) it(`${m.slug} h${wi + 1} rehber`, () => { expect(turkishLeft(w.guideMdEn!)).toBeNull(); expect(sameCode(w.guideMd ?? '', w.guideMdEn!)).toBe(true) })
      w.lessons.forEach((l, li) => {
        const en = l.contentEn
        if (!en) return
        it(`${m.slug} h${wi + 1} d${li + 1}`, () => {
          for (const k of ['problem', 'contentMd', 'question'] as const) {
            expect(sameCode(l[k], en[k]), k).toBe(true)
            expect(turkishLeft(en[k]), k).toBeNull()
          }
          expect(turkishLeft(en.title)).toBeNull()
          if (l.explainerMd) { expect(en.explainerMd, 'explainerMd').toBeTruthy(); expect(sameCode(l.explainerMd, en.explainerMd!)).toBe(true); expect(turkishLeft(en.explainerMd!)).toBeNull() }
          if (l.concepts) { expect(en.concepts?.length).toBe(l.concepts.length); expect(turkishLeft(JSON.stringify(en.concepts))).toBeNull() }
          if (l.quiz) { expect(() => mirrorQuiz(l.quiz, en.quiz ?? [], 'quiz')).not.toThrow(); expect(turkishLeft(en.quiz!.map((q) => [q.prompt, ...(q.options ?? []), q.explanation].join('\n')).join('\n'))).toBeNull() }
        })
      })
    })
  }
})
