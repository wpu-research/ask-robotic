// Kullanım: node lab-e.mjs
// Aşama E (OLED, BME280, DS18B20, VL53L0X) için test sketch'lerini (tools/sim/lab-e/*.ino) arduino-cli ile derler ve
// packages/sim/src/circuit/lab-fixtures-e.ts dosyasını üretir. Başlangıç sketch'leri ayrıca muhendislik.mjs ile lab-fixtures-d.ts'e girer.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileSketch } from './harness.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIR = join(HERE, 'lab-e')
const names = readdirSync(DIR).filter((f) => f.endsWith('.ino')).map((f) => f.slice(0, -4)).sort()
const out = [
  '// Otomatik üretildi — ELLE DÜZENLEME (tools/sim/lab-e.mjs). Aşama E test sketch\'leri (tools/sim/lab-e/*.ino),',
  '// arduino-cli compile --fqbn arduino:avr:uno ile derlenmiş (Adafruit SSD1306 2.5.16, GFX 1.12.4, OneWire 2.3.8, Pololu VL53L0X 1.3.1).',
  '// Bu dosya build\'e girmez (tsconfig.build.json exclude).',
  '',
]
for (const n of names) {
  const hex = compileSketch(readFileSync(join(DIR, `${n}.ino`), 'utf8'), { name: n })
  out.push(`// ${n}`, `export const ${n.toUpperCase()}_HEX = ${JSON.stringify(hex)}`)
  console.log(`✓ ${n}`)
}
writeFileSync(join(HERE, '../../packages/sim/src/circuit/lab-fixtures-e.ts'), out.join('\n') + '\n')
