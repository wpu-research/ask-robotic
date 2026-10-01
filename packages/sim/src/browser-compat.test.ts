// Tarayıcı uyumluluğu: kaynakta Node'a özgü modül/API kullanılmamalı.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = dirname(fileURLToPath(import.meta.url))
const files = readdirSync(SRC).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))

describe('tarayıcı uyumluluğu', () => {
  it('kaynak dosyaları bulundu', () => {
    expect(files).toEqual(expect.arrayContaining(['sim.ts', 'devices.ts', 'robot.ts', 'index.ts']))
  })
  for (const f of files) {
    const text = readFileSync(join(SRC, f), 'utf8')
    it(`${f}: node: import'u ve require( yok`, () => {
      expect(text).not.toMatch(/from\s+['"]node:/)
      expect(text).not.toMatch(/\brequire\(/)
      expect(text).not.toMatch(/import\(\s*['"]node:/)
    })
    it(`${f}: Node global'leri yok`, () => {
      const code = text.replace(/\/\/.*$/gm, '')
      expect(code).not.toMatch(/\bprocess\./)
      expect(code).not.toMatch(/\bBuffer\b/)
      expect(code).not.toMatch(/from\s+['"](fs|path|child_process|crypto|os)['"]/)
    })
  }
  it('yalnızca avr8js dış bağımlılığı', () => {
    for (const f of files) {
      const text = readFileSync(join(SRC, f), 'utf8')
      for (const m of text.matchAll(/from\s+'([^']+)'/g)) expect(m[1].startsWith('.') || m[1] === 'avr8js').toBe(true)
    }
  })
})
