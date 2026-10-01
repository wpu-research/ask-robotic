import { describe, expect, it } from 'vitest'
import {
  allBlocks, blocksInsideLoops, countBlocks, evaluateGoals, hasRunnableScript, maxNesting, pageCount, runnableScripts,
  scriptTypes, simulate, trail,
} from './analysis'
import { blk, flagProject, page, proj, script, sprite } from './testkit'
import { STEP_UNITS } from './types'

const sample = () =>
  proj(
    page(
      'p1',
      sprite(
        'a', 100, 100,
        script('s1', blk('flag'), blk('forward', 2), blk('repeat', 3, [blk('hop', 1), blk('repeat', 2, [blk('grow')])])),
        script('s2', blk('forward', 1), blk('flag')),
        script('s3', blk('tap'), blk('say')),
      ),
    ),
    page('p2', sprite('b', 50, 50, script('s4', blk('flag'), blk('forever', undefined, [blk('back', 1)])))),
  )

describe('sayım ve yapı analizi', () => {
  it('allBlocks çocuklar dahil düz liste; countBlocks tipe göre sayar', () => {
    const p = sample()
    expect(allBlocks(p)).toHaveLength(13)
    expect(countBlocks(p)).toBe(13)
    expect(countBlocks(p, 'repeat')).toBe(2)
    expect(countBlocks(p, 'flag')).toBe(3)
    expect(countBlocks(p, 'goPage')).toBe(0)
  })

  it('runnableScripts / hasRunnableScript', () => {
    const p = sample()
    expect(runnableScripts(p).map((s) => s.id)).toEqual(['s1', 's3', 's4'])
    expect(hasRunnableScript(p)).toBe(true)
    expect(hasRunnableScript(p, 'tap')).toBe(true)
    expect(hasRunnableScript(proj(page('x', sprite('a', 1, 1, script('s', blk('forward', 1))))))).toBe(false)
    expect(hasRunnableScript(flagProject(blk('forward', 1)), 'tap')).toBe(false)
    expect(hasRunnableScript(flagProject(), 'flag')).toBe(true)
  })

  it('maxNesting container iç içeliğini sayar', () => {
    expect(maxNesting(sample())).toBe(2)
    expect(maxNesting(flagProject(blk('forward', 1)))).toBe(0)
    expect(maxNesting(flagProject(blk('repeat', 2, [blk('forward', 1)])))).toBe(1)
    expect(maxNesting(proj(page('p')))).toBe(0)
  })

  it('blocksInsideLoops döngü içi blokları verir (her blok bir kez)', () => {
    const p = sample()
    expect(blocksInsideLoops(p).map((b) => b.type).sort()).toEqual(['back', 'grow', 'hop', 'repeat'])
    expect(blocksInsideLoops(p, 'repeat').map((b) => b.type).sort()).toEqual(['grow', 'hop', 'repeat'])
    expect(blocksInsideLoops(p, 'forever').map((b) => b.type)).toEqual(['back'])
    expect(blocksInsideLoops(flagProject(blk('forward', 1)))).toEqual([])
  })

  it('scriptTypes ve pageCount', () => {
    const p = sample()
    expect(scriptTypes(p.pages[0].sprites[0].scripts[0])).toEqual(['flag', 'forward', 'repeat'])
    expect(pageCount(p)).toBe(2)
  })
})

describe('simulate ve trail', () => {
  it('simulate varsayılan olarak bayrağa basar ve süre kadar koşturur', () => {
    const r = simulate(flagProject(blk('forward', 2), blk('say', undefined, undefined, 'hey')), { ms: 400 })
    expect(r.snapshot.sprites[0].x).toBeCloseTo(100 + 2 * STEP_UNITS, 4)
    expect(r.snapshot.time).toBe(400)
    expect(r.events).toEqual([{ t: 400, kind: 'say', spriteId: 'a', text: 'hey' }])
    const pts = r.positions.a
    expect(pts[0]).toEqual({ t: 0, x: 100, y: 100 })
    expect(pts.at(-1)!.t).toBe(400)
    expect(pts).toHaveLength(9)
  })

  it('simulate tap ve onPage', () => {
    const p = sample()
    const t = simulate(p, { press: { tap: 'a' }, ms: 100 })
    expect(t.events.map((e) => e.kind)).toEqual(['say'])
    const b = simulate(p, { ms: 400, onPage: 1 })
    expect(b.snapshot.pageIndex).toBe(1)
    expect(b.snapshot.sprites[0].x).toBeCloseTo(50 - 2 * STEP_UNITS, 4)
  })

  it('simulate girdi projesini değiştirmez ve deterministiktir', () => {
    const p = sample()
    const copy = JSON.parse(JSON.stringify(p))
    const a = simulate(p, { ms: 3000 })
    const b = simulate(p, { ms: 3000 })
    expect(a).toEqual(b)
    expect(p).toEqual(copy)
  })

  it('trail 50 ms örnekler; sprite yoksa boş', () => {
    const tr = trail(flagProject(blk('forward', 5)), 'a', 1000)
    expect(tr).toHaveLength(21)
    expect(tr[1].x).toBeCloseTo(100 + 0.25 * STEP_UNITS, 4)
    expect(tr.at(-1)!.x).toBeCloseTo(100 + 5 * STEP_UNITS, 4)
    expect(trail(flagProject(), 'yok', 500)).toEqual([])
    // başka sayfadaki sprite için de çalışır
    expect(trail(sample(), 'b', 200).at(-1)!.x).toBeLessThan(50)
  })
})

describe('evaluateGoals', () => {
  it('hedefleri değerlendirir, ipucunu iletir, hata veren check done=false olur', () => {
    const goals = [
      { id: 'g1', text: 'İleri bloğu kullan', check: (p: ReturnType<typeof sample>) => countBlocks(p, 'forward') > 0, hint: 'Mavi bloklara bak' },
      { id: 'g2', text: 'Ses çal', check: (p: ReturnType<typeof sample>) => countBlocks(p, 'pop') > 0 },
      { id: 'g3', text: 'Patlayan', check: () => { throw new Error('x') } },
    ]
    expect(evaluateGoals(sample(), goals)).toEqual([
      { id: 'g1', text: 'İleri bloğu kullan', done: true, hint: 'Mavi bloklara bak' },
      { id: 'g2', text: 'Ses çal', done: false, hint: undefined },
      { id: 'g3', text: 'Patlayan', done: false, hint: undefined },
    ])
    expect(evaluateGoals(sample(), [])).toEqual([])
  })

  it('simulate tabanlı hedef', () => {
    const goal = { id: 'm', text: 'Kedi sağa gitsin', check: (p: ReturnType<typeof sample>) => simulate(p, { ms: 2000 }).snapshot.sprites[0].x > 120 }
    expect(evaluateGoals(flagProject(blk('forward', 3)), [goal])[0].done).toBe(true)
    expect(evaluateGoals(flagProject(), [goal])[0].done).toBe(false)
  })
})
