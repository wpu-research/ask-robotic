// Kullanım: node tools/content/build.mjs modul-3
// content-src/<modül>/ altındaki dersleri ayrıştırıp packages/db/src/content/<slug>.generated.ts dosyasına yazar.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, SRC, loadWeek } from '../sim/lessons.mjs'

const moduleDir = process.argv[2]
if (!moduleDir) { console.error('Kullanım: node tools/content/build.mjs modul-3'); process.exit(2) }
const meta = JSON.parse(readFileSync(join(SRC, moduleDir, 'module.json'), 'utf8'))

const weeks = meta.weeks.map((w) => {
  const lessons = loadWeek(moduleDir, w.dir)
  if (lessons.length !== w.lessons) throw new Error(`${w.dir}: ${w.lessons} ders bekleniyordu, ${lessons.length} var`)
  return {
    title: w.title,
    project: w.project,
    lessons: lessons.map(({ title, durationMin, problem, contentMd, question }) => ({ title, durationMin, problem, contentMd, question })),
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
