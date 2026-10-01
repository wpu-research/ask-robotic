// Tarayıcı uyumluluğu: devre çekirdeğinde Node'a özgü modül/API kullanılmamalı.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const DIR = dirname(fileURLToPath(import.meta.url))
const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))

describe('devre çekirdeği: tarayıcı uyumluluğu', () => {
  for (const f of files) {
    it(`${f}: node: import'u, require(, process, Buffer yok`, () => {
      const text = readFileSync(join(DIR, f), 'utf8')
      const code = text.replace(/\/\/.*$/gm, '')
      expect(code).not.toMatch(/from\s+['"]node:/)
      expect(code).not.toMatch(/\brequire\(/)
      expect(code).not.toMatch(/\bprocess\./)
      expect(code).not.toMatch(/\bBuffer\b/)
      for (const m of code.matchAll(/from\s+'([^']+)'/g)) expect(m[1].startsWith('.')).toBe(true)
    })
  }
})
