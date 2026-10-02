// Seviye çözüm testi altyapısı. Oyun ajanı kendi test dosyasında çağırır:
//   import { assertLevelSolutions } from '../testing'
//   import { labirentGame } from './index'
//   assertLevelSolutions(labirentGame!)
// Her seviye için: çözüm hedefi sağlar · boş program sağlamaz · blok sınırı aşılmaz · yalnız izinli bloklar kullanılır ·
// çözümün JavaScript karşılığı üretilir. (Yalnız Vitest içinde import edilir.)
import { describe, expect, it } from 'vitest'
import { toJavaScript } from './codegen'
import { runProgramSync, type RunResult } from './interpreter'
import { blockTypes, emptyProgram, type ProgramState } from './program'
import { allowedTypes, blockCount } from './toolbox'
import { BUILTIN_BLOCKS } from './builtin-blocks'
import type { GameDef, LevelDef, RunOutcome } from './types'

export interface SolveResult { result: RunResult; outcome: RunOutcome; blocks: number }

/** Bir programı seviyede başsız çalıştırıp hedefi değerlendirir. */
export function solveLevel(game: GameDef, level: LevelDef, program: ProgramState, opts: { seed?: number } = {}): SolveResult {
  const run = game.engine.createRun(level, { seed: opts.seed ?? 1 })
  const result = runProgramSync(program, run.api, { maxSteps: level.maxSteps ?? game.maxSteps, seed: opts.seed ?? 1 })
  const outcome = run.evaluate(result)
  return { result, outcome, blocks: blockCount(game, program) }
}

export interface AssertOptions {
  /** Beklenen seviye sayısı (varsayılan 10). */
  levels?: number
  /** Boş programın başarısız olması denetimini atla (nadir: boş program zaten hedefse). */
  skipEmptyCheck?: boolean
}

export function assertLevelSolutions(game: GameDef, opts: AssertOptions = {}): void {
  const expected = opts.levels ?? 10
  describe(`${game.title}: seviye çözümleri`, () => {
    it(`${expected} seviye var ve kimlikler 1..${expected}`, () => {
      expect(game.levels.map((l) => l.id)).toEqual(Array.from({ length: expected }, (_, i) => i + 1))
    })
    it('özel blok türleri benzersiz, yerleşiklerle çakışmaz ve json.type içermez', () => {
      const seen = new Set<string>()
      for (const d of game.blocks) {
        expect(seen.has(d.type), `yinelenen blok: ${d.type}`).toBe(false)
        seen.add(d.type)
        expect(d.type in BUILTIN_BLOCKS, `yerleşikle çakışıyor: ${d.type}`).toBe(false)
        expect(d.json.type, `${d.type}: json.type verme, çerçeve ekler`).toBeUndefined()
      }
    })
    for (const level of game.levels) {
      describe(`seviye ${level.id}`, () => {
        it('metinler dolu', () => {
          expect(level.intro.trim().length).toBeGreaterThan(5)
          expect(level.toolbox.length).toBeGreaterThan(0)
        })
        it('çözüm hedefi sağlar', () => {
          const r = solveLevel(game, level, level.solution)
          expect(r.result.reason, `çalışma: ${r.result.reason} ${r.result.message ?? ''}`).not.toBe('error')
          expect(r.result.reason).not.toBe('limit')
          expect(r.outcome.ok, `hedef sağlanmadı: ${r.outcome.message ?? ''}`).toBe(true)
        })
        it('çözüm blok sınırını aşmaz ve yalnız izinli blokları kullanır', () => {
          const n = blockCount(game, level.solution)
          if (level.maxBlocks !== undefined) expect(n, `çözüm ${n} blok, sınır ${level.maxBlocks}`).toBeLessThanOrEqual(level.maxBlocks)
          const allowed = allowedTypes(game, level)
          for (const t of blockTypes(level.solution)) expect(allowed.has(t), `izinsiz blok: ${t}`).toBe(true)
        })
        it('çözümün JavaScript karşılığı üretilir', () => {
          const js = toJavaScript(level.solution, game.blocks)
          expect(js.trim().length).toBeGreaterThan(0)
          expect(js).not.toMatch(/undefined|\[object/)
        })
        if (!opts.skipEmptyCheck) {
          it('boş program hedefi sağlamaz', () => {
            expect(solveLevel(game, level, emptyProgram()).outcome.ok).toBe(false)
            if (level.startBlocks) expect(solveLevel(game, level, level.startBlocks).outcome.ok).toBe(false)
          })
        }
      })
    }
  })
}
