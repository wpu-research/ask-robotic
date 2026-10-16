// Kullanım: node muhendislik.mjs
// Mühendislik (büyükler için) parça başlangıç sketch'lerini (content-src/muhendislik/sketches/*.ino) arduino-cli ile derler ve
//  - packages/sim/src/circuit/lab-fixtures-d.ts  (laboratuvar testleri için gömülü hex'ler)
//  - apps/web/src/lib/muhendislik/sketches.ts    (laboratuvarda açılan başlangıç kodu)
// dosyalarını yeniden üretir. İkisi aynı kaynaktan gelir: testler sitede açılan kodun aynısını doğrular.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { compileSketch } from './harness.mjs'
import { SRC } from './lessons.mjs'

const ROOT = join(SRC, '..')
const DIR = join(SRC, 'muhendislik', 'sketches')
const names = readdirSync(DIR).filter((f) => f.endsWith('.ino')).map((f) => f.slice(0, -4)).sort()

const fixture = [
  '// Otomatik üretildi — ELLE DÜZENLEME (tools/sim/muhendislik.mjs). Aşama D (Hyvex elektronik serisi, büyükler için) başlangıç sketch\'leri.',
  '// Kaynak: content-src/muhendislik/sketches/*.ino; arduino-cli compile --fqbn arduino:avr:uno ile derlenmiş hex\'ler.',
  '// Bu dosya build\'e girmez (tsconfig.build.json exclude).',
  '',
]
const web = [
  '// Otomatik üretildi — ELLE DÜZENLEME (tools/sim/muhendislik.mjs). Kaynak: content-src/muhendislik/sketches/*.ino.',
  '// packages/sim/src/circuit/lab-fixtures-d.ts aynı metinlerin derlenmiş halidir; laboratuvar testleri bu kodu doğrular.',
  '',
  'export const SKETCHES = {',
]
for (const n of names) {
  const src = readFileSync(join(DIR, `${n}.ino`), 'utf8')
  const hex = compileSketch(src, { name: n })
  fixture.push(`// ${n}`, `export const ${n.toUpperCase()}_HEX = ${JSON.stringify(hex)}`)
  web.push(`  ${n}: ${JSON.stringify(src)},`)
  console.log(`✓ ${n}`)
}
web.push('} as const', '', 'export type SketchName = keyof typeof SKETCHES', '')
writeFileSync(join(ROOT, 'packages/sim/src/circuit/lab-fixtures-d.ts'), fixture.join('\n') + '\n')
writeFileSync(join(ROOT, 'apps/web/src/lib/muhendislik/sketches.ts'), web.join('\n'))
console.log(`${names.length} sketch yazıldı`)
