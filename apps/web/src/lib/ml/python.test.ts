// Derslerin ve projelerin Python kodu gerçekten çalışıyor mu: her kod, veri setleri yanında, yerel python3 + NumPy ile baştan sona
// çalıştırılır (tarayıcıdaki Pyodide de aynı NumPy'yi kullanır). python3 ya da NumPy yoksa test atlanır.
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LESSONS } from './lessons'
import { PROJECTS } from './projeler'

const hasNumpy = spawnSync('python3', ['-c', 'import numpy'], { encoding: 'utf8' }).status === 0
const yasak = /\b(sklearn|scipy|pandas|torch|tensorflow|matplotlib)\b/

describe('ML Python kodları', () => {
  it('yalnız NumPy ve standart kütüphane kullanılıyor', () => {
    for (const l of [...LESSONS, ...PROJECTS]) expect(l.code.map(([c]) => c).join('\n'), l.slug).not.toMatch(yasak)
  })
  it.skipIf(!hasNumpy)('her kod veri setleriyle hatasız çalışıyor', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ml-py-'))
    const veri = join(__dirname, '../../../public/veri/ml')
    for (const f of readdirSync(veri)) copyFileSync(join(veri, f), join(dir, f))
    const bad: string[] = []
    for (const l of [...LESSONS, ...PROJECTS]) {
      const src = l.code.map(([c, tr]) => (tr ? `${c}  # ${tr}` : c)).join('\n') + '\n'
      writeFileSync(join(dir, `${l.slug}.py`), src)
      const r = spawnSync('python3', ['-I', `${l.slug}.py`], { cwd: dir, encoding: 'utf8', timeout: 120_000 })
      if (r.status !== 0) bad.push(`${l.slug}: ${(r.stderr || r.error?.message || '').trim().split('\n').slice(-1)[0]}`)
    }
    expect(bad).toEqual([])
  }, 900_000)
})
