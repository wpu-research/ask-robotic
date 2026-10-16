// Kullanım: node tools/content/check-en.mjs modul-4 [h1 h2 …]
// Bir modülün (ya da verilen haftaların) İngilizce çevirilerini doğrular: ayna kuralları (tools/content/en.mjs) ve eksikler.
// Çıkış kodu: 0 her şey tamam, 1 hata ya da eksik var.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, SRC, loadWeek } from '../sim/lessons.mjs'
import { loadLessonExtras, loadWeekGuide } from './ek.mjs'
import { loadLessonEn, loadWeekGuideEn } from './en.mjs'

const [moduleDir, ...only] = process.argv.slice(2)
if (!moduleDir) { console.error('Kullanım: node tools/content/check-en.mjs modul-4 [h1 …]'); process.exit(2) }
const skillIds = new Set([...readFileSync(join(ROOT, 'apps', 'web', 'src', 'lib', 'skills.ts'), 'utf8').matchAll(/\bid:\s*'([\w-]+)'/g)].map((m) => m[1]))
const meta = JSON.parse(readFileSync(join(SRC, moduleDir, 'module.json'), 'utf8'))
let bad = 0, done = 0, missing = 0
for (const w of meta.weeks) {
  if (only.length && !only.includes(w.dir)) continue
  for (const l of loadWeek(moduleDir, w.dir)) {
    const tr = { ...l, ...loadLessonExtras(moduleDir, w.dir, l.number, skillIds) }
    try {
      const en = loadLessonEn(moduleDir, w.dir, l.number, tr, skillIds)
      if (en) done++; else { missing++; console.log(`EKSİK  ${moduleDir}/${w.dir}/en/${l.file}`) }
    } catch (e) { bad++; console.log(`HATA   ${e.message}`) }
  }
  try {
    const g = loadWeekGuide(moduleDir, w.dir)
    if (g && !loadWeekGuideEn(moduleDir, w.dir, g)) { missing++; console.log(`EKSİK  ${moduleDir}/${w.dir}/en/rehber.md`) }
  } catch (e) { bad++; console.log(`HATA   ${e.message}`) }
}
console.log(`${done} ders tamam · ${missing} eksik · ${bad} hata`)
process.exit(bad || missing ? 1 : 0)
