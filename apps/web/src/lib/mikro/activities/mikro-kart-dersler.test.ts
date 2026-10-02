// Mikro Kart modülü (content-src/modul-10) ders dosyaları ile etkinlik kaydı tutarlılığı. Yalnız 1-3. haftalar bu dosyada denetlenir.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BLOCK_BY_TYPE } from '../blocks'
import { usedTypes } from '../program'
import { MIKRO_KART_H1_H3 } from './mikro-kart-h1-h3'

const ROOT = join(process.cwd(), '..', '..', 'content-src', 'modul-10')
const available = existsSync(join(ROOT, 'module.json'))
const meta = available ? (JSON.parse(readFileSync(join(ROOT, 'module.json'), 'utf8')) as { slug: string; weeks: { dir: string; lessons: number }[] }) : null

describe.skipIf(!available)('modul-10 h1-h3 dersleri', () => {
  const cases: { key: string; file: string; text: string }[] = []
  for (const [wi, w] of (meta?.weeks ?? []).slice(0, 3).entries()) {
    const files = readdirSync(join(ROOT, w.dir)).filter((f) => /^\d{2}-.+\.md$/.test(f)).sort()
    it(`${w.dir}: ${w.lessons} ders dosyası var`, () => expect(files.length).toBe(w.lessons))
    files.forEach((f, li) => cases.push({ key: `${meta!.slug}:${wi + 1}:${li + 1}`, file: `${w.dir}/${f}`, text: readFileSync(join(ROOT, w.dir, f), 'utf8') }))
  }

  it.each(cases.map((c) => [c.file, c] as const))('%s: biçim', (_n, c) => {
    expect(c.text).toMatch(/^# .+/m)
    const dur = c.text.match(/^süre:\s*(\d+)\s*$/m)
    expect(dur).not.toBeNull()
    expect(Number(dur![1])).toBeGreaterThanOrEqual(15)
    expect(Number(dur![1])).toBeLessThanOrEqual(40)
    for (const h of ['Merak', 'Etkinlik', 'Konuşalım']) {
      const m = c.text.split(new RegExp(`^## ${h}\\s*$`, 'm'))[1] ?? ''
      expect(m.split(/^## /m)[0].trim().length, `${h} boş`).toBeGreaterThan(40)
    }
    expect(c.text).not.toMatch(/micro:bit|makecode|arcade/i)
  })

  it.each(cases.map((c) => [c.file, c] as const))('%s: etkinliği kayıtlı ve çözümdeki özel blok adları derste geçiyor', (_n, c) => {
    const act = MIKRO_KART_H1_H3[c.key]
    expect(act, c.key).toBeTruthy()
    const lower = c.text.toLocaleLowerCase('tr')
    for (const type of usedTypes(act.solution().workspace)) {
      const spec = BLOCK_BY_TYPE[type]
      if (!spec) continue
      const frag = spec.label.split(/\{[A-Z]+\}/).map((s) => s.replace(/['’]de$/, '').trim()).sort((a, b) => b.length - a.length)[0]
      if (frag.length < 3) continue
      expect(lower, `${c.file}: '${frag}' (${type}) derste geçmiyor`).toContain(frag.toLocaleLowerCase('tr'))
    }
  })
})
