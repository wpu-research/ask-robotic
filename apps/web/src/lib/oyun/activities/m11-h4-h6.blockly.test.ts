// Hafta 4-6 çözümleri gerçek Blockly'de (başsız) yüklenip kaydedildikten sonra da hedefleri sağlar.
import * as Blockly from 'blockly'
import { beforeAll, describe, expect, it } from 'vitest'
import { M11_H4_H6 } from './m11-h4-h6'
import { evaluateGoals } from '../activity'
import { defineOyunBlocks, setOptionProviders } from '../blockly-defs'
import { GALLERY } from '../assets'
import type { BlockState } from '../types'

beforeAll(() => {
  setOptionProviders({ images: () => GALLERY.map((a) => ({ id: a.id, name: a.name, rows: a.rows })), maps: () => ['zemin', 'yol', 'seviye', 'labirent'] })
  defineOyunBlocks(Blockly)
})

const roundTrip = (state: BlockState): BlockState => {
  const ws = new Blockly.Workspace()
  Blockly.serialization.workspaces.load(state as never, ws)
  const out = Blockly.serialization.workspaces.save(ws) as unknown as BlockState
  ws.dispose()
  return out
}

describe('hafta 4-6 çözümleri Blockly gidiş-dönüşünden sonra da çalışır', () => {
  for (const { activity: a } of M11_H4_H6) {
    it(a.id, () => {
      const sol = a.solution()
      const ev = evaluateGoals(a, { ...sol, blocks: roundTrip(sol.blocks) })
      expect(ev.error).toBeNull()
      expect(ev.results.filter((r) => !r.ok).map((r) => r.id)).toEqual([])
      const st = a.starter()
      expect(evaluateGoals(a, { ...st, blocks: roundTrip(st.blocks) }).error).toBeNull()
    })
  }
})
