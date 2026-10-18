// Derslerin ve projelerin Python kodu gerçekten çalışıyor mu: her kod, veri setleri yanında, yerel python3 + NumPy ile baştan sona
// çalıştırılır (tarayıcıdaki Pyodide de aynı NumPy'yi kullanır). python3 ya da NumPy yoksa test atlanır.
// Eğitim paneli olan her ders egitim_gecmisi.csv yazmalı: başlık, panelin geçmiş sütunlarıyla aynı, satır sayısı aynı. Projeler
// de geçmiş dosyası yazar. matplotlib yalnız `except ImportError` korumasıyla kullanılabilir (yoksa grafik atlanır, kod çalışır).
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LESSONS } from './lessons'
import { PROJECTS } from './projeler'

const hasNumpy = spawnSync('python3', ['-c', 'import numpy'], { encoding: 'utf8' }).status === 0
const yasak = /\b(sklearn|scipy|pandas|torch|tensorflow)\b/

describe('ML Python kodları', () => {
  it('yalnız NumPy ve standart kütüphane kullanılıyor', () => {
    for (const l of [...LESSONS, ...PROJECTS]) {
      const src = l.code.map(([c]) => c).join('\n')
      expect(src, l.slug).not.toMatch(yasak)
      if (/matplotlib/.test(src)) expect(src, `${l.slug}: matplotlib korumasız`).toMatch(/except ImportError/)
    }
  })
  it.skipIf(!hasNumpy)('her kod veri setleriyle hatasız çalışıyor', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ml-py-'))
    const veri = join(__dirname, '../../../public/veri/ml')
    for (const f of readdirSync(veri)) copyFileSync(join(veri, f), join(dir, f))
    const bad: string[] = []
    for (const l of [...LESSONS, ...PROJECTS]) {
      const src = l.code.map(([c, tr]) => (tr ? `${c}  # ${tr}` : c)).join('\n') + '\n'
      writeFileSync(join(dir, `${l.slug}.py`), src)
      const hist = join(dir, 'egitim_gecmisi.csv')
      rmSync(hist, { force: true })
      const r = spawnSync('python3', ['-I', `${l.slug}.py`], { cwd: dir, encoding: 'utf8', timeout: 120_000, env: { ...process.env, MPLBACKEND: 'Agg' } })
      if (r.status !== 0) { bad.push(`${l.slug}: ${(r.stderr || r.error?.message || '').trim().split('\n').slice(-1)[0]}`); continue }
      const rep = 'report' in l && typeof l.report === 'function' ? l.report(Object.fromEntries(l.params.map((p) => [p.key, p.value]))) : null
      const isProject = PROJECTS.includes(l as (typeof PROJECTS)[number])
      if (!rep && !isProject) continue
      if (!existsSync(hist)) { bad.push(`${l.slug}: egitim_gecmisi.csv yazılmadı`); continue }
      const rows = readFileSync(hist, 'utf8').trim().split(/\r?\n/)
      if (rows.length < 3) bad.push(`${l.slug}: geçmiş çok kısa (${rows.length - 1} satır)`)
      if (rep) {
        const keys = [rep.history.x, ...Object.keys(rep.history.cols).filter((k) => k !== rep.history.x)]
        if (rows[0] !== keys.join(',')) bad.push(`${l.slug}: başlık ${rows[0]} ≠ panel ${keys.join(',')}`)
        const n = rep.history.cols[rep.history.x].length
        if (rows.length - 1 !== n) bad.push(`${l.slug}: ${rows.length - 1} satır ≠ panel ${n}`)
      }
    }
    expect(bad).toEqual([])
  }, 900_000)
})
