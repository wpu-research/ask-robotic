// Blok tanımları gerçek Blockly'de (başsız çalışma alanı) yüklenir, kaydedilir ve yeniden yorumlanır.
import * as Blockly from 'blockly'
import { beforeAll, describe, expect, it } from 'vitest'
import { ALL_BLOCK_TYPES, BLOCKS, STD_BLOCKS, toolboxJson } from './blocks'
import { defineOyunBlocks, setOptionProviders } from './blockly-defs'
import { OyunSession } from './session'
import { SAMPLES } from './samples'
import { toJavaScript } from './codegen'
import { GALLERY } from './assets'
import type { BlockState, OyunProject } from './types'

beforeAll(() => {
  setOptionProviders({ images: () => GALLERY.map((a) => ({ id: a.id, name: a.name, rows: a.rows })), maps: () => ['labirent', 'seviye1', 'yol'] })
  defineOyunBlocks(Blockly)
})

const roundTrip = (state: BlockState): BlockState => {
  const ws = new Blockly.Workspace()
  Blockly.serialization.workspaces.load(state as never, ws)
  const out = Blockly.serialization.workspaces.save(ws) as unknown as BlockState
  ws.dispose()
  return out
}

describe('Blockly entegrasyonu (başsız)', () => {
  it('her blok tanımı Blockly\'de oluşturulabilir', () => {
    const ws = new Blockly.Workspace()
    for (const def of BLOCKS) {
      const blk = ws.newBlock(def.type)
      expect(blk.type).toBe(def.type)
      expect(!!blk.outputConnection, def.type).toBe(def.shape === 'val')
      expect(!!blk.previousConnection, def.type).toBe(def.shape === 'stmt' || def.shape === 'cstmt')
      if (def.shape === 'hat' || def.shape === 'cstmt') expect(blk.getInput('DO'), def.type).toBeTruthy()
      // her giriş/alan adı gerçekten var
      for (const [name, a] of Object.entries(def.args)) {
        const isField = ['dd', 'kind', 'col', 'fnum', 'ftxt'].includes(a.t)
        expect(isField ? blk.getField(name) : blk.getInput(name), `${def.type}.${name}`).toBeTruthy()
      }
    }
    ws.dispose()
  })

  it('araç kutusundaki her blok türü tanımlı', () => {
    const tb = toolboxJson()
    const types: string[] = []
    const walk = (c: unknown): void => {
      const x = c as { type?: string; contents?: unknown[] }
      if (x.type) types.push(x.type)
      x.contents?.forEach(walk)
    }
    tb.contents.forEach(walk)
    expect(types.length).toBeGreaterThan(90)
    for (const t of types) expect(Blockly.Blocks[t], t).toBeTruthy()
    for (const t of ALL_BLOCK_TYPES) expect(Blockly.Blocks[t], t).toBeTruthy()
    expect(Object.keys(STD_BLOCKS).length).toBeGreaterThan(20)
  })

  it('izin listesi araç kutusunu daraltır', () => {
    const tb = toolboxJson(['oyun_baslangic', 'sprite_yeni', 'variables_set', 'variables_get'])
    const names = tb.contents.map((c) => (c as { name: string }).name)
    expect(names).toEqual(['Sprite', 'Oyun', 'Değişken'])
  })

  it('örnek oyunlar Blockly\'de yüklenir; kaydedilen program aynı davranır', () => {
    for (const smp of SAMPLES) {
      const p = smp.project()
      const saved = roundTrip(p.blocks)
      expect(saved.blocks?.blocks?.length, smp.id).toBe(p.blocks.blocks?.blocks?.length)
      // JavaScript çıktısı aynı kalır (blok yapısı korunur)
      expect(toJavaScript(saved), smp.id).toBe(toJavaScript(p.blocks))
      const q: OyunProject = { ...p, blocks: saved }
      const a = new OyunSession(p, { seed: 4 }).start().tick(60 * 5)
      const b = new OyunSession(q, { seed: 4 }).start().tick(60 * 5)
      expect(b.error, smp.id).toBeNull()
      expect(b.engine.snapshot(), smp.id).toEqual(a.engine.snapshot())
    }
  })
})
