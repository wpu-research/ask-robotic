// Kullanım: npx tsx tools/content/check-en-ts.ts modul-1|modul-2
// Elle yazılmış modüllerin İngilizcesini (packages/db/src/content/en/<modül>.en.ts) ayna kurallarıyla doğrular.
import { withExtras } from '../../packages/db/src/content/extras'
import { withEnglish, type ModuleEn } from '../../packages/db/src/content/en'
// @ts-expect-error: tipsiz .mjs
import { codeBlocks, mirrorQuiz, turkishLeft } from './en.mjs'

const which = process.argv[2]
const tagged = (b: string) => /^```(?!(?:text|txt|md|markdown|plaintext)\b)[A-Za-z0-9+#-]+/.test(b)
const sameCode = (a: string, b: string) => {
  const x: string[] = codeBlocks(a), y: string[] = codeBlocks(b)
  return x.length === y.length && x.every((c, i) => tagged(c) === tagged(y[i]) && (!tagged(c) || c === y[i]))
}
async function main() {
  const base = which === 'modul-1' ? (await import('../../packages/db/src/content/modul-1-scratchjr')).modul1 : (await import('../../packages/db/src/content/modul-2-scratch')).modul2
  const extras = which === 'modul-1' ? (await import('../../packages/db/src/content/extras/modul-1')).modul1Extras : (await import('../../packages/db/src/content/extras/modul-2')).modul2Extras
  const en: ModuleEn = which === 'modul-1' ? (await import('../../packages/db/src/content/en/modul-1.en')).modul1En : (await import('../../packages/db/src/content/en/modul-2.en')).modul2En
  const m = withEnglish(withExtras(base, extras), en)
  let bad = 0
  const err = (w: string, msg: string) => { bad++; console.log(`HATA ${w}: ${msg}`) }
  m.weeks.forEach((w, wi) => {
    if (w.guideMd && !w.guideMdEn) err(`h${wi + 1}`, 'rehber İngilizcesi yok')
    if (w.guideMdEn) { const t = turkishLeft(w.guideMdEn); if (t) err(`h${wi + 1} rehber`, `Türkçe kalmış: "${t}"`); if (!sameCode(w.guideMd ?? '', w.guideMdEn)) err(`h${wi + 1} rehber`, 'kod blokları farklı') }
    w.lessons.forEach((l, li) => {
      const at = `h${wi + 1} d${li + 1}`, e = l.contentEn!
      for (const k of ['title', 'problem', 'contentMd', 'question'] as const) { if (!e[k]?.trim()) err(at, `${k} boş`); const t = turkishLeft(e[k] ?? ''); if (t) err(`${at} ${k}`, `Türkçe kalmış: "${t}"`) }
      for (const k of ['problem', 'contentMd', 'question'] as const) if (!sameCode(l[k], e[k] ?? '')) err(`${at} ${k}`, 'kod blokları farklı (dil etiketli bloklar birebir aynı olmalı)')
      if (l.explainerMd) { if (!e.explainerMd) err(at, 'explainerMd eksik'); else { if (!sameCode(l.explainerMd, e.explainerMd)) err(`${at} explainerMd`, 'kod blokları farklı'); const t = turkishLeft(e.explainerMd); if (t) err(`${at} explainerMd`, `Türkçe kalmış: "${t}"`) } }
      if (l.concepts) { if (e.concepts?.length !== l.concepts.length) err(at, `${l.concepts.length} kavram olmalı`); const t = turkishLeft(JSON.stringify(e.concepts ?? [])); if (t) err(`${at} concepts`, `Türkçe kalmış: "${t}"`) }
      if (l.quiz) { try { mirrorQuiz(l.quiz, e.quiz ?? [], `${at} quiz`) } catch (x) { err(at, (x as Error).message) } const t = turkishLeft((e.quiz ?? []).map((q) => [q.prompt, ...(q.options ?? []), q.explanation].join('\n')).join('\n')); if (t) err(`${at} quiz`, `Türkçe kalmış: "${t}"`) }
    })
  })
  console.log(`${bad} hata`)
  process.exit(bad ? 1 : 0)
}
main().catch((e) => { console.log('HATA', e.message); process.exit(1) })
