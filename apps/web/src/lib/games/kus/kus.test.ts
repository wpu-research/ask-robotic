import { describe, expect, it } from 'vitest'
import { b, emptyProgram, program, seq } from '../program'
import { assertLevelSolutions, solveLevel } from '../testing'
import { atan2Deg, createBirdRun, fly, initialState, resolveLayout, type BirdLevelData } from './engine'
import { kusGame } from './index'

assertLevelSolutions(kusGame)

const L = (n: number) => kusGame.levels[n - 1]
const h = (a: number) => b('bird_heading', { ANGLE: a })
const hat = () => b('bird_basla')

describe('kuş: motor', () => {
  it('atan2 derece ve 0..360 aralığı', () => {
    expect(atan2Deg(0, 1)).toBe(0)
    expect(atan2Deg(1, 0)).toBe(90)
    expect(atan2Deg(0, -1)).toBe(180)
    expect(atan2Deg(-1, 0)).toBe(270)
    expect(atan2Deg(1, 1)).toBe(45)
  })
  it('kuş en çok 100 adım uçar', () => {
    const st = initialState({ start: [50, 50], worm: [350, 350], nest: [350, 50] })
    fly(st, 0)
    expect(st.x).toBe(150); expect(st.y).toBe(50)
    fly(st, 90)
    expect(st.x).toBeCloseTo(150, 3); expect(st.y).toBe(150)
  })
  it('solucanı alır ve oraya yerleşir', () => {
    const st = initialState({ start: [50, 50], worm: [130, 50], nest: [350, 350] })
    fly(st, 0)
    expect(st.hasWorm).toBe(true)
    expect([st.x, st.y]).toEqual([130, 50])
  })
  it('dünyanın kenarı ve duvar çarpmadır', () => {
    const edge = initialState({ start: [350, 50], worm: [50, 350], nest: [350, 350] })
    expect(() => { fly(edge, 0); fly(edge, 0) }).toThrow()
    expect(edge.status).toBe('edge')
    const wall = initialState({ start: [50, 50], worm: [50, 350], nest: [350, 350], walls: [{ x: 120, y: 0, w: 10, h: 200 }] })
    expect(() => fly(wall, 0)).toThrow()
    expect(wall.status).toBe('wall')
  })
  it('rastgele yerleşim tohuma bağlı, deterministik ve ayrık', () => {
    const d = L(10).data as BirdLevelData
    expect(resolveLayout(d, 5)).toEqual(resolveLayout(d, 5))
    expect(resolveLayout(d, 5)).not.toEqual(resolveLayout(d, 6))
  })
})

describe('kuş: seviye davranışları', () => {
  it('yanlış program başarısız: önce yuvaya gitmek', () => {
    const r = solveLevel(kusGame, L(1), program(seq(hat(), h(90), h(0))))
    expect(r.outcome.ok).toBe(false)
    const r2 = solveLevel(kusGame, L(1), program(seq(hat(), h(0), h(0), h(0))))
    expect(r2.outcome.ok).toBe(false)
  })
  it('başlık bloğu olmayan (serseri) bloklar çalışmaz', () => {
    expect(solveLevel(kusGame, L(1), program(seq(h(0), h(90)))).outcome.ok).toBe(false)
  })
  it('seviye 4: duvara çarpmak başarısız ve mesajlı', () => {
    const r = solveLevel(kusGame, L(4), program(seq(hat(), h(90))))
    expect(r.result.reason).toBe('halted')
    expect(r.outcome).toMatchObject({ ok: false })
    expect(r.outcome.message).toMatch(/duvar/i)
  })
  it('seviye 5: boş döngü sonsuz sayılır', () => {
    const r = solveLevel(kusGame, L(5), program(seq(hat(), b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true }))))
    expect(r.result.reason).toBe('limit')
    expect(r.outcome.ok).toBe(false)
  })
  it('seviye 7: tek yönlü uçuş duvara çarpar', () => {
    expect(solveLevel(kusGame, L(7), program(seq(hat(), h(0)))).outcome.ok).toBe(false)
  })
  it('seviye 8: çapraz uçuş taş kutuya çarpar', () => {
    const r = solveLevel(kusGame, L(8), program(seq(hat(), h(45))))
    expect(r.outcome.ok).toBe(false)
  })
  it('yuvaya solucansız varmak başarısız', () => {
    const r = solveLevel(kusGame, L(3), program(seq(hat(), h(90), h(90), h(90))))
    expect(r.outcome.ok).toBe(false)
  })
  it('seviye 9 ve 10 çözümleri her tohumda çalışır', () => {
    for (const n of [9, 10]) {
      for (let seed = 1; seed <= 40; seed++) {
        const r = solveLevel(kusGame, L(n), L(n).solution, { seed })
        expect(r.outcome.ok, `seviye ${n} tohum ${seed}: ${r.outcome.message}`).toBe(true)
      }
    }
  })
  it('seviye 10 çözümü seviye 9 araç kutusu dışı (atan2) ve blok sınırı içinde', () => {
    expect(solveLevel(kusGame, L(10), L(10).solution).blocks).toBeLessThanOrEqual(L(10).maxBlocks!)
  })
  it('boş program: hiçbir seviye başarılı değil', () => {
    for (const lv of kusGame.levels) expect(solveLevel(kusGame, lv, emptyProgram()).outcome.ok).toBe(false)
  })
  it('createRun anlık görüntü değişmez kopyadır', () => {
    const run = createBirdRun(L(1), 1)
    const a = run.snapshot()
    a.x = 999
    expect(run.snapshot().x).toBe(60)
  })
})
