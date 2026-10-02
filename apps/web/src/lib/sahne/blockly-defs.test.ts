// Blok tanımları gerçek Blockly'de (başsız çalışma alanı) yüklenir, kaydedilir ve yeniden yorumlanır.
import * as Blockly from 'blockly'
import { beforeAll, describe, expect, it } from 'vitest'
import { ALL_BLOCK_TYPES, BLOCKS, BLOCK_BY_TYPE, toolboxJson } from './blocks'
import { defineProcBlocks, defineSahneBlocks, makeTheme, setOptionProviders } from './blockly-defs'
import { add, b, callProc, chg, defProc, flag, forever, ifElse, key, program, setv, v, wait } from './dsl'
import { makeProject } from './kit'
import { makeList, makeVar } from './project'
import { SahneSession } from './session'
import type { BlockState } from './types'

beforeAll(() => {
  setOptionProviders({
    costumes: () => ['kedi-a', 'kedi-b'], backdrops: () => ['beyaz', 'gece'], sounds: () => ['Miyav', 'Davul'],
    sprites: () => [{ id: 'b', name: 'Top' }], messages: () => ['sıra sende', 'mesaj1'],
  })
  defineSahneBlocks(Blockly)
  defineProcBlocks(Blockly, [{ id: 'p1', name: 'zıpla', params: ['yükseklik'] }])
})

const roundTrip = (state: BlockState): BlockState => {
  const ws = new Blockly.Workspace()
  Blockly.serialization.workspaces.load(state as never, ws)
  const out = Blockly.serialization.workspaces.save(ws) as unknown as BlockState
  ws.dispose()
  return out
}

describe('Blockly entegrasyonu (başsız)', () => {
  it('her blok tanımı oluşturulabilir ve şekli doğrudur', () => {
    const ws = new Blockly.Workspace()
    for (const def of BLOCKS) {
      const blk = ws.newBlock(def.type)
      expect(blk.type).toBe(def.type)
      const out = def.shape === 'val' || def.shape === 'bool'
      expect(!!blk.outputConnection, def.type).toBe(out)
      expect(!!blk.previousConnection, def.type).toBe(!out && def.shape !== 'hat')
      expect(!!blk.nextConnection, def.type).toBe(!out && def.shape !== 'cap' && def.shape !== 'ccap')
      if (def.shape === 'c' || def.shape === 'ccap' || def.shape === 'ifelse') expect(blk.getInput('DO'), def.type).toBeTruthy()
      if (def.shape === 'ifelse') expect(blk.getInput('ELSE')).toBeTruthy()
      for (const n of Object.keys(def.args)) expect(blk.getField(n) ?? blk.getInput(n), `${def.type}.${n}`).toBeTruthy()
    }
    ws.dispose()
  })

  it('araç kutusundaki her blok türü tanımlı; allowedBlocks süzer', () => {
    const types: string[] = []
    const walk = (c: unknown): void => { const x = c as { type?: string; contents?: unknown[] }; if (x.type) types.push(x.type); x.contents?.forEach(walk) }
    walk(toolboxJson())
    expect(types.length).toBeGreaterThan(80)
    for (const t of types) expect(BLOCK_BY_TYPE[t], t).toBeTruthy()
    const small = toolboxJson(['sh_move', 'sh_when_flag']) as unknown as { contents: { name: string; contents: unknown[] }[] }
    expect(small.contents.map((c) => c.name)).toEqual(['Hareket', 'Olaylar'])
    expect(ALL_BLOCK_TYPES.length).toBeGreaterThan(100)
  })

  it('tema ve zelos çizicisi kurulabilir', () => { expect(makeTheme(Blockly).name).toBe('sahne_atolyesi') })

  it('program kaydet/yükle: değişken kimlikleri, alanlar ve girişler korunur', () => {
    const state = program([
      flag([setv('skor', 0), b('sh_forever', {}, [
        ifElse(b('sh_touching', { T: 'b' }), [chg('skor', 1), b('sh_play', { S: 'Miyav' })], [b('sh_say', { M: 'Merhaba' }), b('sh_costume', { C: 'kedi-b' })]),
        b('sh_move', { N: add(v('skor'), 3) }), wait(0.2),
      ])]),
      key('space', [b('sh_broadcast', { M: 'sıra sende' })]),
      b('sh_when_msg', { M: 'sıra sende' }, [b('sh_list_add', { I: 'x', L: 'liste' })]),
    ])
    const out = roundTrip(state)
    const json = JSON.stringify(out)
    expect(json).toContain('"v:skor"')
    expect(json).toContain('"sh_if_else"')
    expect(out.variables?.find((x) => x.name === 'liste')?.type).toBe('List')
    // yeniden yüklenen program aynı davranır
    const p = makeProject('t', [{ id: 'a', sounds: ['miyav'], blocks: [] }], { vars: [makeVar('skor'), makeList('liste')] })
    p.sprites[0].blocks = out
    const s = new SahneSession(p); s.flag(); s.tick(10)
    expect(Number(s.variable('skor'))).toBe(0)
    expect(s.sprite('a')!.x).toBeGreaterThan(0)
    expect(s.sprite('a')!.bubble?.text).toBe('Merhaba')
  })

  it('kendi blok tanımı/çağrısı Blockly\'de yüklenir', () => {
    const out = roundTrip(program([defProc('p1', [b('sh_change_y', { N: { type: 'sh_arg', fields: { NAME: 'yükseklik' } } })]), flag([callProc('p1', [20])])]))
    const json = JSON.stringify(out)
    expect(json).toContain('sh_def_p1'); expect(json).toContain('sh_call_p1'); expect(json).toContain('sh_arg')
  })
})
