// Veri setleri: public/veri/ml altındaki CSV'ler üreteçlerle birebir aynı, başlıklar beklenen sütunlar, her ders ve projenin
// veri eşlemesi var ve geçerli, her set en az bir yerde kullanılıyor. ML_VERI_YAZ=1 ile dosyaları yeniden yazar.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LESSONS } from './lessons'
import { PROJECTS } from './projeler'
import { DATASETS, LESSON_DATA, csvOf, datasetsFor, usersOf } from './veri'

const DIR = join(__dirname, '../../../public/veri/ml')

describe('ML veri setleri', () => {
  if (process.env.ML_VERI_YAZ) {
    mkdirSync(DIR, { recursive: true })
    for (const d of DATASETS) writeFileSync(join(DIR, d.file), csvOf(d))
  }
  it('her set için CSV var, içerik üreteçle aynı, başlık sütunlarla eşleşiyor', () => {
    for (const d of DATASETS) {
      const p = join(DIR, d.file)
      expect(existsSync(p), d.file).toBe(true)
      const txt = readFileSync(p, 'utf8')
      expect(txt, d.file).toBe(csvOf(d))
      const lines = txt.trimEnd().split('\n')
      expect(lines[0].split(','), d.file).toEqual(d.cols.map((c) => c.name))
      expect(lines.length - 1, d.file).toBe(d.rows().length)
      expect(lines.length, d.file).toBeGreaterThan(20)
      for (const c of d.cols) { expect(c.desc.tr.length).toBeGreaterThan(0); expect(c.desc.en.length).toBeGreaterThan(0) }
      expect(d.title.tr && d.title.en && d.desc.tr && d.desc.en, d.id).toBeTruthy()
    }
    expect(new Set(DATASETS.map((d) => d.file)).size).toBe(DATASETS.length)
  })
  it('ders ve proje → veri eşlemesi tam: her slug’ın kaydı var, kimlikler geçerli', () => {
    const slugs = [...LESSONS.map((l) => l.slug), ...PROJECTS.map((p) => p.slug)]
    expect(Object.keys(LESSON_DATA).sort()).toEqual([...slugs].sort())
    for (const s of slugs) expect(datasetsFor(s).length, s).toBe(LESSON_DATA[s].length)
    // ML dersinde ya da başka bir kursta (courses) en az bir kullanıcı
    for (const d of DATASETS) expect(usersOf(d.id).length + (d.courses?.length ?? 0), d.id).toBeGreaterThan(0)
  })
  it('CSV açan her kod, eşlemedeki ilk seti açıyor; kurgusal veri modülü kalmadı', () => {
    let opened = 0
    for (const l of [...LESSONS, ...PROJECTS]) {
      const src = l.code.map(([c]) => c).join('\n')
      // egitim_gecmisi.csv kodun yazdığı eğitim geçmişidir, açtığı veri seti değil
      const files = [...src.matchAll(/'([\w-]+\.csv)'/g)].map((m) => m[1]).filter((f) => f !== 'egitim_gecmisi.csv')
      if (files.length) { opened++; expect(files[0], l.slug).toBe(datasetsFor(l.slug)[0]?.file) }
      expect(src, l.slug).not.toMatch(/^from (sharp|cizgi|surus|renk|pist|robot|lidar|imu|motor|posta|depo) import/m)
    }
    expect(opened).toBe(13)
  })
})
