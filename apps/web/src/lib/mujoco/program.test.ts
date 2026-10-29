import { describe, expect, it } from 'vitest'
import { compileWorkspace, Runner, MAX_REPEAT, type Op } from './program'

const state = (...blocks: unknown[]) => ({ blocks: { languageVersion: 0, blocks } })
const set = (U: string, V: number, next?: unknown) => ({ type: 'muroko_set', fields: { U, V }, ...(next ? { next: { block: next } } : {}) })

describe('compileWorkspace', () => {
  it('zincir, tekrar ve bekleme sade ağaca çevrilir', () => {
    const wait = { type: 'muroko_wait', fields: { S: 2 } }
    const rep = { type: 'muroko_repeat', fields: { N: 3 }, inputs: { DO: { block: set('a', 1, wait) } } }
    expect(compileWorkspace(state(set('omuz', 0.5, rep)))).toEqual([[
      { op: 'set', name: 'omuz', value: 0.5 },
      { op: 'repeat', times: 3, body: [{ op: 'set', name: 'a', value: 1 }, { op: 'wait', seconds: 2 }] },
    ]])
  })
  it('boş ya da tanınmayan yığınlar atılır, tekrar sayısı sınırlanır', () => {
    expect(compileWorkspace(state({ type: 'bilinmeyen' }, { type: 'muroko_set', fields: { U: '' } }))).toEqual([])
    const r = compileWorkspace(state({ type: 'muroko_repeat', fields: { N: 99999 }, inputs: { DO: { block: set('a', 1) } } }))
    expect((r[0][0] as Extract<Op, { op: 'repeat' }>).times).toBe(MAX_REPEAT)
    expect(compileWorkspace(null)).toEqual([])
  })
})

describe('Runner', () => {
  const run = (prog: Op[], times: number[]) => {
    const log: string[] = []
    const r = new Runner(prog, (n, v) => log.push(`${n}=${v}`))
    const at: string[][] = []
    for (const t of times) { r.tick(t); at.push([...log]) }
    return { at, r }
  }
  it('bekleme benzetim saatine göre ilerler', () => {
    const { at, r } = run([{ op: 'set', name: 'a', value: 1 }, { op: 'wait', seconds: 1 }, { op: 'set', name: 'a', value: 2 }], [0, 0.5, 1.01])
    expect(at[0]).toEqual(['a=1']); expect(at[1]).toEqual(['a=1']); expect(at[2]).toEqual(['a=1', 'a=2'])
    expect(r.done).toBe(true)
  })
  it('tekrar gövdeyi sırayla çalıştırır', () => {
    const { at } = run([{ op: 'repeat', times: 2, body: [{ op: 'set', name: 'x', value: 1 }, { op: 'wait', seconds: 1 }] }], [0, 1.01, 2.02])
    expect(at[2]).toEqual(['x=1', 'x=1'])
  })
  it('beklemesiz sonsuz döngü tarayıcıyı kilitlemez', () => {
    const { r } = run([{ op: 'forever', body: [{ op: 'set', name: 'x', value: 1 }] }], [0, 5])
    expect(r.done).toBe(false)
  })
})
