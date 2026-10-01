import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { idleSnapshot } from '@/lib/arena/goals'
import { bumpWall, easyLine, flatRoad, obstacleField, roverScene } from '@/lib/arena/scenes'
import type { ArenaGoalResult, ArmScene, ArmSnapshot, BalancerScene, BalancerSnapshot, RoverSnapshot } from '@/lib/arena/types'
import { ArenaGoals, SensorPanel } from './arena-panels'

const R = (scene: ReturnType<typeof easyLine>, patch: Partial<RoverSnapshot> = {}) =>
  renderToStaticMarkup(<SensorPanel scene={scene} snap={{ ...(idleSnapshot(scene) as RoverSnapshot), ...patch }} onNudge={() => {}} />)

describe('SensorPanel', () => {
  it('robot ölçümleri: konum, yön, hız, yol, çarpma', () => {
    const h = R(easyLine(), { x: 1.234, y: 0.5, thetaDeg: 45, v: 0.2, distanceM: 1.5, collisions: 2 })
    expect(h).toContain('1,23 m, 0,50 m'); expect(h).toContain('45°'); expect(h).toContain('20 cm/s'); expect(h).toContain('1,50 m')
    expect(h).toMatch(/data-k="collisions"><dt>Çarpma<\/dt><dd>2</)
  })
  it('çizgi sensörü çubukları değerleriyle gösterilir', () => {
    const sc = easyLine()
    const base = idleSnapshot(sc) as RoverSnapshot
    const h = R(sc, { line: base.line.map((l, i) => ({ ...l, on: i === 3, adc: i === 3 ? 860 : 164 })), lineExits: 3 })
    expect(h).toContain('data-testid="arena-linebars"')
    expect(h).toContain('<i>860</i>'); expect(h.match(/<i>164<\/i>/g)).toHaveLength(4)
    expect(h).toMatch(/data-on="true" title="A3: 860"/)
    expect(h).toContain('3 kez')
  })
  it('enkoder ve odometri yalnız enkoderli sahnede görünür; sapma gerçek ile tahmin farkıdır', () => {
    expect(R(easyLine())).not.toContain('Enkoder ve odometri')
    const h = R(flatRoad(), { x: 1, y: 0.5, ticksL: 10, ticksR: 12, odo: { x: 0.9, y: 0.5, theta: 0, distanceM: 0.9 } })
    expect(h).toContain('Enkoder ve odometri'); expect(h).toContain('10 / 12'); expect(h).toContain('10,0 cm')
  })
  it('mesafe sensörü ve tampon panelleri yalnız ilgili sahnede görünür', () => {
    expect(R(easyLine())).not.toContain('Mesafe sensörü'); expect(R(easyLine())).not.toContain('Tamponlar')
    const h = R(obstacleField(), { frontCm: 37.4, bumperR: true })
    expect(h).toContain('37 cm'); expect(h).toContain('BASILI')
    expect(R(obstacleField(), { frontCm: 400 })).toContain('&gt; 400 cm')
  })
  it('düğmeler ve robotu kaydırma yalnız ilgili sahnede görünür', () => {
    expect(R(bumpWall())).not.toContain('arena-nudge')
    const sc = roverScene({ id: 'x', title: 'x', movable: true, buttons: [{ pin: 2, label: 'Düğme (D2)' }] })
    const h = R(sc as never)
    expect(h).toContain('arena-nudge'); expect(h).toContain('data-testid="arena-btn-2"'); expect(h).toContain('Düğme (D2)')
  })
})

describe('SensorPanel (kol)', () => {
  const arm: ArmScene = { kind: 'arm', id: 'k', title: 'k', l1: 10, l2: 10, gripClosedBelowDeg: 90, objects: [], zones: [], view: { xMin: 0, xMax: 20, yMin: 0, yMax: 20 } }
  it('eklem açıları, uç noktası ve tutucu durumu', () => {
    const snap = { ...(idleSnapshot(arm) as ArmSnapshot), q1: 45, q2: 90, grip: 60, gripClosed: true, tipX: 7.07, tipY: 17.07, held: 'nesne', maxJumpDeg: 1.5 }
    const h = renderToStaticMarkup(<SensorPanel scene={arm} snap={snap} />)
    expect(h).toContain('45,0°'); expect(h).toContain('90,0°'); expect(h).toContain('60° (kapalı)'); expect(h).toContain('7,1, 17,1 cm'); expect(h).toContain('nesne')
  })
})

describe('ArenaGoals', () => {
  const g = (id: string, done: boolean, hint?: string): ArenaGoalResult => ({ id, text: `hedef ${id}`, done, hint })
  it('boşken hiçbir şey çizmez', () => expect(renderToStaticMarkup(<ArenaGoals status={[]} />)).toBe(''))
  it('tamamlanan sayısını, ipucunu ve tamamlanmış işaretini gösterir', () => {
    const h = renderToStaticMarkup(<ArenaGoals status={[g('a', true), g('b', false, 'ipucu b')]} />)
    expect(h).toContain('1 / 2'); expect(h).toContain('data-goal="a" data-done="true"'); expect(h).toContain('ipucu b'); expect(h).not.toContain('Tüm hedefler tamam')
  })
  it('hepsi bitince tebrik gösterir ve ipuçlarını gizler', () => {
    const h = renderToStaticMarkup(<ArenaGoals status={[g('a', true, 'x'), g('b', true)]} />)
    expect(h).toContain('Tüm hedefler tamam'); expect(h).not.toContain('<small>')
  })
})

describe('SensorPanel (denge)', () => {
  const bal: BalancerScene = { kind: 'balancer', id: 'd', title: 'd', theta0Deg: 3 }
  it('eğim, eğim hızı, durum ve ayakta kalma süresi', () => {
    const snap: BalancerSnapshot = { ...(idleSnapshot(bal) as BalancerSnapshot), thetaDeg: -4.5, rateDps: 20, uprightS: 6.25, maxAbsDeg: 9 }
    const h = renderToStaticMarkup(<SensorPanel scene={bal} snap={snap} />)
    expect(h).toContain('-4,5°'); expect(h).toContain('20 °/s'); expect(h).toContain('ayakta'); expect(h).toContain('6,3 sn')
    expect(renderToStaticMarkup(<SensorPanel scene={bal} snap={{ ...snap, fell: true }} />)).toContain('DÜŞTÜ')
  })
})
