import { describe, expect, it } from 'vitest'
import { scriptsToState, stateToScripts, estimateHeight, type BlocklyState } from './blockly-convert'
import type { Script } from './types'
import { blk, script } from './testkit'

const withPos = (s: Script, x: number, y: number): Script => ({ ...s, x, y })
const roundTrip = (scripts: Script[]) => stateToScripts(JSON.parse(JSON.stringify(scriptsToState(scripts))))

describe('blockly-convert yuvarlak-gezi', () => {
  it('boş liste', () => {
    expect(scriptsToState([])).toEqual({ blocks: { languageVersion: 0, blocks: [] } })
    expect(roundTrip([])).toEqual([])
  })

  it('basit yığın: sayı değerleri, kimlikler ve konum korunur', () => {
    const s = withPos(script('s1', blk('flag'), blk('forward', 5), blk('turnRight', 90), blk('wait', 0.5)), 40, 60)
    expect(roundTrip([s])).toEqual([s])
  })

  it('metin değeri (say) ve birden çok betik', () => {
    const a = withPos(script('sa', blk('tap'), blk('say', undefined, undefined, 'Kim o?'), blk('hop', 2)), 10, 20)
    const b = withPos(script('sb', blk('flag'), blk('pop', 3), blk('show')), 300, 400)
    expect(roundTrip([a, b])).toEqual([a, b])
  })

  it('iç içe tekrarlar (C blokları) ve zincir sırası', () => {
    const inner = blk('repeat', 4, [blk('forward', 1), blk('say', undefined, undefined, 'Hop')])
    const outer = blk('repeat', 2, [blk('hop', 1), inner, blk('turnLeft', 45)])
    const s = withPos(script('s', blk('flag'), blk('grow'), outer, blk('goPage', 2)), 0, 0)
    expect(roundTrip([s])).toEqual([s])
  })

  it('forever içinde repeat; kapak bloğu sonda', () => {
    const s = withPos(script('s', blk('tap'), blk('forever', undefined, [blk('repeat', 3, [blk('back', 2)]), blk('wait', 1)])), 5, 5)
    expect(roundTrip([s])).toEqual([s])
    const t = withPos(script('t', blk('flag'), blk('forward', 3), blk('stop')), 1, 2)
    expect(roundTrip([t])).toEqual([t])
  })

  it('başlıksız (yetim) yığın aynen korunur', () => {
    const s = withPos(script('o', blk('forward', 3), blk('turnRight', 90)), 12, 34)
    expect(roundTrip([s])).toEqual([s])
  })

  it('boş C bloğu children: [] olarak döner', () => {
    const s = withPos(script('s', blk('flag'), blk('repeat', 3, [])), 0, 0)
    expect(roundTrip([s])).toEqual([s])
  })
})

describe('blockly-convert kenar durumlar', () => {
  it('konumsuz betikler üst üste 24 px boşlukla yerleşir', () => {
    const a = script('a', blk('flag'), blk('forward', 3))
    const b = script('b', blk('tap'))
    const st = scriptsToState([a, b])
    const [ja, jb] = st.blocks.blocks
    expect(ja.x).toBe(24)
    expect(jb.y).toBe(ja.y! + estimateHeight(a.blocks) + 24)
    // kimlikler ve içerik yine korunur
    const back = stateToScripts(st)
    expect(back.map((s) => s.id)).toEqual(['a', 'b'])
    expect(back[0].blocks).toEqual(a.blocks)
  })

  it('bilinmeyen tür atılır, zincir sürer', () => {
    const state: BlocklyState = { blocks: { languageVersion: 0, blocks: [
      { type: 'jr_flag', id: 'f', x: 1, y: 2, next: { block: { type: 'bogus', id: 'x', next: { block: { type: 'jr_forward', id: 'g', fields: { VALUE: 4 } } } } } },
      { type: 'text', id: 'nope' },
    ] } }
    const sc = stateToScripts(state)
    expect(sc).toEqual([{ id: 'sc:f', x: 1, y: 2, blocks: [{ id: 'f', type: 'flag' }, { id: 'g', type: 'forward', value: 4 }] }])
  })

  it('çakışan betik kimlikleri (kopyala-yapıştır) ayrıştırılır', () => {
    const mk = (id: string) => ({ type: 'jr_flag', id, x: 0, y: 0, data: 'same' })
    const sc = stateToScripts({ blocks: { languageVersion: 0, blocks: [mk('b1'), mk('b2')] } })
    expect(new Set(sc.map((s) => s.id)).size).toBe(2)
  })

  it('bozuk girdi çökertmez', () => {
    expect(stateToScripts(null)).toEqual([])
    expect(stateToScripts({})).toEqual([])
    expect(stateToScripts({ blocks: { blocks: 'x' } })).toEqual([])
  })
})
