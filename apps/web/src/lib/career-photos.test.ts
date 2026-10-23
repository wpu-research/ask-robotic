// Kariyer fotoğrafları: her hedefin fotoğrafı var, dosya diskte, künye ve açık lisans dolu.
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CAREER_PHOTOS } from './career-photos'
import { CAREERS } from './kariyer'

const PUBLIC = join(__dirname, '..', '..', 'public')

describe('kariyer fotoğrafları', () => {
  it('her hedefin fotoğrafı ve künyesi var; dosya 250 KB altında', () => {
    expect(Object.keys(CAREER_PHOTOS).sort()).toEqual(CAREERS.map((c) => c.slug).sort())
    for (const [slug, p] of Object.entries(CAREER_PHOTOS)) {
      const f = join(PUBLIC, p.file)
      expect(existsSync(f), slug).toBe(true)
      expect(statSync(f).size, slug).toBeLessThan(250_000)
      expect(p.license, slug).toMatch(/^(CC0|Public domain|CC BY(-SA)? [234]\.0)$/)
      expect(p.licenseUrl, slug).toMatch(/^https:\/\/creativecommons\.org\//)
      expect(p.source, slug).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
      expect(p.creator && p.alt.tr && p.alt.en, slug).toBeTruthy()
    }
  })
})
