// Kullanım: node tools/content/build.mjs modul-3
// content-src/<modül>/ altındaki dersleri ayrıştırıp packages/db/src/content/<slug>.generated.ts dosyasına yazar.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, SRC, loadWeek } from '../sim/lessons.mjs'
import { loadLessonExtras, loadParts, loadWeekGuide } from './ek.mjs'

const moduleDir = process.argv[2]
if (!moduleDir) { console.error('Kullanım: node tools/content/build.mjs modul-3 | parcalar'); process.exit(2) }

// Parça ansiklopedisi: content-src/parcalar/*.md -> packages/db/src/content/parcalar.generated.ts
if (moduleDir === 'parcalar') {
  const parts = loadParts()
  const slugs = new Set()
  for (const p of parts) { if (slugs.has(p.slug)) throw new Error(`slug tekrar: ${p.slug}`); slugs.add(p.slug) }
  const out = `// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/parcalar/ · Komut: node tools/content/build.mjs parcalar
import type { ComponentGuide } from './types'

export const parcalar: ComponentGuide[] = ${JSON.stringify(parts, null, 2)}
`
  const target = join(ROOT, 'packages', 'db', 'src', 'content', 'parcalar.generated.ts')
  writeFileSync(target, out)
  console.log(`${target}\n${parts.length} parça`)
  process.exit(0)
}
// Beceri kimlikleri apps/web/src/lib/skills.ts'ten okunur (tek kaynak): SKILLS = [{ id: '...' }, ...]
const skillIds = new Set([...readFileSync(join(ROOT, 'apps', 'web', 'src', 'lib', 'skills.ts'), 'utf8').matchAll(/\bid:\s*'([\w-]+)'/g)].map((m) => m[1]))
const meta = JSON.parse(readFileSync(join(SRC, moduleDir, 'module.json'), 'utf8'))

const weeks = meta.weeks.map((w) => {
  const lessons = loadWeek(moduleDir, w.dir)
  if (lessons.length !== w.lessons) throw new Error(`${w.dir}: ${w.lessons} ders bekleniyordu, ${lessons.length} var`)
  const guideMd = loadWeekGuide(moduleDir, w.dir)
  return {
    title: w.title,
    project: w.project,
    ...(guideMd ? { guideMd } : {}),
    lessons: lessons.map(({ title, durationMin, problem, contentMd, question, number }) => ({
      title, durationMin, problem, contentMd, question, ...loadLessonExtras(moduleDir, w.dir, number, skillIds),
    })),
  }
})
const mod = { slug: meta.slug, title: meta.title, track: meta.track, position: meta.position, minAge: meta.minAge, weeks }
const exportName = `modul${meta.position}`
const out = `// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: content-src/${moduleDir}/ · Komut: node tools/content/build.mjs ${moduleDir}
import type { ModuleContent } from './types'

export const ${exportName}: ModuleContent = ${JSON.stringify(mod, null, 2)}
`
const target = join(ROOT, 'packages', 'db', 'src', 'content', `${meta.slug}.generated.ts`)
writeFileSync(target, out)
console.log(`${target}\n${weeks.length} hafta, ${weeks.reduce((n, w) => n + w.lessons.length, 0)} ders`)
