// YALNIZ TEST: etkinlik çözümü/derleme yardımcıları (uygulama kodu bunu içe aktarmaz).
import { execFileSync } from 'node:child_process'
import { allModules } from '@ask/db'
import { ARENA_MODULE_SLUG } from './activity'
import type { ArenaActivity } from './types'

export const hasCli = (() => { try { execFileSync(process.env.ARDUINO_CLI ?? 'arduino-cli', ['version'], { stdio: 'ignore' }); return true } catch { return false } })()
const robotik = allModules.find((m) => m.slug === ARENA_MODULE_SLUG)!

export const lessonOf = (key: string) => {
  const [, w, l] = key.split(':')
  return robotik.weeks[Number(w) - 1]?.lessons[Number(l) - 1]
}

/** Dersin Etkinlik metnindeki `// sketch: ad` bloğunu döndürür. */
export const sketchOf = (key: string, name: string): string | null => {
  const md = lessonOf(key)?.contentMd ?? ''
  const re = /```cpp\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(md))) if (new RegExp(`^//\\s*sketch:\\s*${name}\\s*$`).test(m[1].split('\n')[0])) return m[1]
  return null
}

export const solutionOf = (key: string, a: ArenaActivity): string => {
  if (a.solution) return a.solution()
  const src = a.solutionSketch ? sketchOf(key, a.solutionSketch) : null
  if (!src) throw new Error(`${key}: çözüm yok (solution ya da geçerli solutionSketch gerekli)`)
  return src
}
