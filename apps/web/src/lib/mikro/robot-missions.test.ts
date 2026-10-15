import { describe, expect, it } from 'vitest'
import { disallowedTypes } from './activity'
import { generate } from './codegen'
import { onStart, project } from './program'
import { ROBOT_MISSIONS, evaluateMission, freeScene, move, runMission } from './robot-missions'
import { Simulation } from './sim'
import { b } from './program'

describe('robot görevleri', () => {
  for (const m of ROBOT_MISSIONS) {
    describe(m.title, () => {
      it('örnek çözüm bütün hedefleri sağlar, hata vermez', () => {
        const r = evaluateMission(m, m.solution())
        expect(r.error).toBeNull()
        expect(r.status.filter((s) => !s.done).map((s) => s.id)).toEqual([])
      })
      it('başlangıç projesi hedefleri sağlamaz', () => {
        expect(evaluateMission(m, m.starter()).done).toBe(false)
      })
      it('çözüm yalnız izinli blokları kullanır; başlangıç robotu duvarda değil', () => {
        expect(disallowedTypes(m, m.solution())).toEqual([])
        const s = m.scene()
        const sim = new Simulation(project('x', []), { robot: { profile: m.profile, scene: s } })
        expect(sim.robot!.touching).toBe(false)
        expect(sim.robot!.distanceCm).toBeGreaterThan(10)
      })
    })
  }
})

describe('robot blokları (yorumlayıcı)', () => {
  const scene = freeScene()
  it('gövdede olmayan sensör anlaşılır hata verir; robotsuz kartta robot bloğu çalışmaz', () => {
    const p = project('x', [onStart(b('rb_line', { f: { SIDE: 'left' } }) && b('mk_show_number', { i: { VALUE: b('rb_reflect') } }))])
    const sim = new Simulation(p, { robot: { profile: 'gezgin', scene } })
    sim.start(); sim.advance(200)
    expect(sim.error?.message).toContain('renk sensörü yok')
    const plain = new Simulation(project('x', [onStart(move(10))]))
    plain.start(); plain.advance(200)
    expect(plain.error?.message).toContain('Robot Atölyesi')
  })

  it('sensör yoklayan döngü zaman ilerletir; sensörsüz boş döngü yine yakalanır', () => {
    const loop = (cond: ReturnType<typeof b>) => project('x', [onStart(b('controls_whileUntil', { f: { MODE: 'WHILE' }, i: { BOOL: cond } }))])
    const ok = new Simulation(loop(b('logic_compare', { f: { OP: 'GT' }, i: { A: { type: 'rb_distance' }, B: 0 } })), { robot: { profile: 'blok', scene } })
    ok.start(); ok.advance(1000)
    expect(ok.error).toBeNull()
    const bad = new Simulation(loop(b('logic_boolean', { f: { BOOL: 'TRUE' } })), { robot: { profile: 'blok', scene } })
    bad.start(); bad.advance(1000)
    expect(bad.error?.message).toContain('döngüde kaldı')
  })

  it('program durunca motorlar durur', () => {
    const sim = new Simulation(project('x', [onStart(b('rb_motors', { i: { L: 50, R: 50 } }))]), { robot: { profile: 'blok', scene } })
    sim.start(); sim.advance(500)
    expect(sim.robot!.moving).toBe(true)
    sim.stop(); sim.advance(100)
    expect(sim.robot!.stopped).toBe(true)
  })

  it('hız bloğu sürüşü yavaşlatır; görev çalıştırıcı program bitince erken bırakır', () => {
    const p = (speed: number) => project('x', [onStart(b('rb_speed', { i: { P: speed } }), move(30))])
    const m = { ...ROBOT_MISSIONS[0], runMs: 20000 }
    const fast = runMission(m, p(100)).now
    const slow = runMission(m, p(20)).now
    expect(slow).toBeGreaterThan(fast * 3)
  })

  it('JavaScript ve Python görünümü robot çağrılarını üretir', () => {
    const ws = ROBOT_MISSIONS.find((m) => m.id === 'cizgi-izle')!.solution().workspace
    expect(generate(ws, 'js')).toContain('robot.onLine("left")')
    expect(generate(ws, 'py')).toContain('robot.on_line("left")')
    expect(generate(ROBOT_MISSIONS[0].solution().workspace, 'js')).toContain('robot.move("forward", 60)')
  })
})
