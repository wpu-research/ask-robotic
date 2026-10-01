// Arduino sketch'lerini derleyip avr8js ile başsız (headless) çalıştıran test düzeneği.
// Hedef kart: Arduino Uno (ATmega328P, 16 MHz). Benzetim çekirdeği (Sim, cihazlar, robot) @ask/sim paketindedir;
// burada yalnızca Node'a özgü derleme (arduino-cli + önbellek) bulunur.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Sim } from '@ask/sim'

const HERE = dirname(fileURLToPath(import.meta.url))
const CACHE = join(HERE, '.cache')

/** Sketch kaynağını derler, .hex içeriğini döndürür. Aynı kaynak için önbellek kullanır. */
export function compileSketch(source, { fqbn = 'arduino:avr:uno', name = 'sketch' } = {}) {
  const key = createHash('sha1').update(fqbn + source).digest('hex').slice(0, 16)
  const finalDir = join(CACHE, key)
  const hexPath = join(finalDir, name, 'build', `${name}.ino.hex`)
  if (existsSync(hexPath)) return readFileSync(hexPath, 'utf8')
  // Eşzamanlı süreçler aynı çıktıyı bozmasın: süreç-özel geçici dizinde derle, sonra atomik taşı.
  const tmpDir = join(CACHE, `${key}.tmp-${process.pid}-${Date.now()}`)
  const dir = join(tmpDir, name)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${name}.ino`), source)
  try {
    execFileSync('arduino-cli', ['compile', '--fqbn', fqbn, '--output-dir', join(dir, 'build'), dir], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120_000,
    })
  } catch (err) {
    rmSync(tmpDir, { recursive: true, force: true })
    const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim()
    throw new Error(`Derleme hatası (${name}):\n${out.split('\n').slice(0, 25).join('\n')}`)
  }
  const hex = readFileSync(join(dir, 'build', `${name}.ino.hex`), 'utf8')
  try { renameSync(tmpDir, finalDir) } catch { rmSync(tmpDir, { recursive: true, force: true }) } // başka süreç önce bitirdiyse onunki kalır
  return hex
}

/** Kaynak kodu derleyip bir Sim döndürür. */
export function createSim(source, opts) { return new Sim(compileSketch(source, opts)) }

/** Yalnızca derleme denemesi (davranış kontrolü yok). */
export function assertCompiles(source, opts) { compileSketch(source, opts); return true }

export { Arena, Sim, pinInfo } from '@ask/sim'
