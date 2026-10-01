// Kullanım: node check.mjs modul-3 [h1 h2 ...]
// Her haftanın derslerini ayrıştırır, işaretli sketch'leri derler, checks.mjs'teki davranış kontrollerini çalıştırır.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createSim } from './harness.mjs'
import { SRC, loadWeek } from './lessons.mjs'

const [moduleDir, ...weekArgs] = process.argv.slice(2)
if (!moduleDir) { console.error('Kullanım: node check.mjs modul-3 [h1 h2 ...]'); process.exit(2) }
const meta = JSON.parse(readFileSync(join(SRC, moduleDir, 'module.json'), 'utf8'))
const weeks = meta.weeks.filter((w) => !weekArgs.length || weekArgs.includes(w.dir))

let failed = 0, compiled = 0, behaved = 0
for (const w of weeks) {
  let lessons
  try { lessons = loadWeek(moduleDir, w.dir) } catch (e) { console.log(`✗ ${w.dir}: ${e.message}`); failed++; continue }
  if (lessons.length !== w.lessons) { console.log(`✗ ${w.dir}: ${w.lessons} ders bekleniyordu, ${lessons.length} var`); failed++ }
  const checksPath = join(SRC, moduleDir, w.dir, 'checks.mjs')
  const checks = existsSync(checksPath) ? (await import(pathToFileURL(checksPath))).default : {}
  const names = new Set()
  for (const l of lessons) {
    if (l.durationMin < 15 || l.durationMin > 40) { console.log(`✗ ${l.file}: süre 15-40 dk olmalı (${l.durationMin})`); failed++ }
    for (const s of l.sketches) {
      if (names.has(s.name)) { console.log(`✗ ${l.file}: sketch adı yinelendi: ${s.name}`); failed++; continue }
      names.add(s.name)
      try {
        const sim = createSim(s.source, { name: s.name })
        compiled++
        if (checks[s.name]) { await checks[s.name](sim, s.source); behaved++; console.log(`✓ ${l.file} · ${s.name} (derlendi + davranış)`) }
        else console.log(`• ${l.file} · ${s.name} (yalnız derlendi)`)
      } catch (e) { failed++; console.log(`✗ ${l.file} · ${s.name}\n    ${String(e.message).split('\n').join('\n    ')}`) }
    }
  }
  for (const k of Object.keys(checks)) if (!names.has(k)) { failed++; console.log(`✗ ${w.dir}: checks.mjs'te "${k}" var ama derste böyle bir sketch yok`) }
}
console.log(`\n${compiled} sketch derlendi, ${behaved} davranış kontrolü geçti, ${failed} hata`)
process.exit(failed ? 1 : 0)
