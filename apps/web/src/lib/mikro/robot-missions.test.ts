import { describe, expect, it } from 'vitest'
import { disallowedTypes } from './activity'
import { generate } from './codegen'
import { onStart, project } from './program'
import { MISSION_CHAPTERS, ROBOT_MISSIONS, chapterProgress, evaluateMission, freeScene, grip, move, runMission } from './robot-missions'
import { errorText } from './en'
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

describe('görev bölümleri', () => {
  it('her görev bir bölümde; bölümler sırayla, her bölümde en az iki görev; kimlikler tekil', () => {
    const order = MISSION_CHAPTERS.map((c) => c.id)
    expect(order).toEqual(['baslangic', 'sensorler', 'algoritmalar', 'yarisma'])
    expect(new Set(ROBOT_MISSIONS.map((m) => m.id)).size).toBe(ROBOT_MISSIONS.length)
    expect(ROBOT_MISSIONS.length).toBeGreaterThanOrEqual(17)
    const idx = ROBOT_MISSIONS.map((m) => order.indexOf(m.chapter))
    expect(idx.every((i) => i >= 0)).toBe(true)
    expect([...idx].sort((a, b) => a - b)).toEqual(idx)
    for (const c of MISSION_CHAPTERS) {
      expect(chapterProgress(c.id, new Set()).missions.length, c.id).toBeGreaterThanOrEqual(2)
      expect(c.note && c.concept && c.en.note && c.en.concept && c.en.title, c.id).toBeTruthy()
    }
  })
  it('her görevin en az bir ipucu var; kıskaçlı robotun iki görevi var', () => {
    for (const m of ROBOT_MISSIONS) expect(m.goals.some((g) => g.hint), m.id).toBe(true)
    expect(ROBOT_MISSIONS.filter((m) => m.profile === 'kiskac').map((m) => m.id)).toEqual(['nesne-tasi', 'renge-gore-ayir'])
  })
  it('bölüm ilerlemesi tamamlanan görevleri sayar', () => {
    const p = chapterProgress('baslangic', new Set(['ilk-surus', 'kare', 'sumo']))
    expect(p.done).toBe(2)
    expect(p.missions[0].id).toBe('ilk-surus')
  })
  it('aynı program aynı sahnede her seferinde aynı sonucu verir (belirlenimci)', () => {
    for (const id of ['slalom', 'sumo', 'renge-gore-ayir', 'sag-el']) {
      const m = ROBOT_MISSIONS.find((x) => x.id === id)!
      const snap = () => { const r = runMission(m, m.solution()).robot!; return { x: r.x, y: r.y, th: r.theta, o: r.objects, v: [...r.visitedAt], c: r.collisions } }
      expect(snap(), id).toEqual(snap())
    }
  })
  it('yanlış renge ayıran program "renge göre ayır" görevini geçemez', () => {
    const m = ROBOT_MISSIONS.find((x) => x.id === 'renge-gore-ayir')!
    const wrong = JSON.parse(JSON.stringify(m.solution()).replace('"C":"kirmizi"', '"C":"mavi"'))
    const r = evaluateMission(m, wrong)
    expect(r.status.find((s) => s.id === 'kirmizi')!.done).toBe(false)
  })
})

describe('robot blokları (yorumlayıcı)', () => {
  it('kıskaç bloğu kıskaçsız gövdede anlaşılır hata verir', () => {
    const sim = new Simulation(project('x', [onStart(grip('close'))]), { robot: { profile: 'blok', scene: freeScene() } })
    sim.start(); sim.advance(500)
    expect(sim.error?.message).toBe('Blok Robotu gövdesinde kıskaç yok.')
    expect(errorText(sim.error!.message, 'en')).toBe('The Block Robot has no gripper.')
  })

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
