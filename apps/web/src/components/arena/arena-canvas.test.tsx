import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { idleSnapshot } from '@/lib/arena/goals'
import { bumpWall, easyLine, flatRoad, hardLine, maze, obstacleField, roverScene } from '@/lib/arena/scenes'
import type { ArmScene, ArmSnapshot, BalancerScene, BalancerSnapshot, RoverSnapshot } from '@/lib/arena/types'
import { ArenaCanvas } from './arena-canvas'

const render = (scene: Parameters<typeof idleSnapshot>[0], patch: Partial<RoverSnapshot> = {}, trail?: Array<[number, number, number]>) =>
  renderToStaticMarkup(<ArenaCanvas scene={scene} snap={{ ...(idleSnapshot(scene) as RoverSnapshot), ...patch }} trail={trail} />)

describe('ArenaCanvas (robot sahnesi)', () => {
  it('her hazır sahne çizilir: duvarlar, bölgeler, robot', () => {
    for (const sc of [easyLine(), hardLine(), obstacleField(), bumpWall(), maze(), flatRoad()]) {
      const h = render(sc)
      expect(h, sc.id).toContain('data-testid="arena-robot"')
      expect(h, sc.id).toContain(`data-scene="${sc.id}"`)
      expect((h.match(/class="arena-wall"/g) ?? []).length, sc.id).toBe(sc.walls.length)
      for (const z of sc.zones) expect(h, `${sc.id}/${z.id}`).toContain(`data-zone="${z.id}"`)
    }
  })

  it('çizgi pisti çizgileri polyline olarak çizilir; çizgisiz sahnede yoktur', () => {
    expect(render(easyLine())).toContain('class="arena-line"')
    expect(render(bumpWall())).not.toContain('class="arena-line"')
  })

  it('robot konumu ve yönü dönüşüme yansır (y ekseni aşağı, dönüş saat yönünün tersi)', () => {
    const sc = roverScene({ id: 't', title: 't', width: 2, height: 2 })
    const h = render(sc, { x: 0.5, y: 1.5, theta: Math.PI / 2 })
    expect(h).toContain('translate(50.00 50.00) rotate(-90.00)')
  })

  it('beş çizgi sensörü noktası değerleriyle işaretlenir (çizgi üstündekiler "on")', () => {
    const sc = easyLine()
    const base = idleSnapshot(sc) as RoverSnapshot
    const line = base.line.map((l, i) => ({ ...l, on: i === 2, adc: i === 2 ? 860 : 164 }))
    const h = render(sc, { line })
    expect(h.match(/data-sensor="\d"/g)).toHaveLength(5)
    expect(h).toContain('data-sensor="2" data-on="true"')
    expect(h).toContain('data-sensor="0" data-on="false"')
  })

  it('ultrasonik konisi yalnız mesafe sensörü olan sahnede çizilir ve uzunluğu ölçüme bağlıdır', () => {
    expect(render(easyLine())).not.toContain('arena-cone')
    const near = render(obstacleField(), { frontCm: 20 }), far = render(obstacleField(), { frontCm: 150 })
    expect(near).toContain('data-testid="arena-cone"')
    expect(near).not.toBe(far)
  })

  it('tampon basılınca ilgili yay işaretlenir; çarpışınca gövde kırmızıya döner', () => {
    const h = render(bumpWall(), { bumperL: true, collided: true })
    expect(h).toMatch(/arena-bump on" d="[^"]+" fill="none" data-bumper="L"/)
    expect(h).toMatch(/arena-bump" d="[^"]+" fill="none" data-bumper="R"/)
    expect(h).toContain('arena-body hit')
    expect(h).toContain('data-collided="true"')
  })

  it('iz (trail) verilince yol çizilir, verilmezse çizilmez', () => {
    expect(render(easyLine())).not.toContain('arena-trail')
    expect(render(easyLine(), {}, [[0.5, 0.5, 0], [0.6, 0.5, 0], [0.7, 0.55, 0.1]])).toContain('data-testid="arena-trail"')
  })

  it('ziyaret edilen bölge daha koyu doldurulur', () => {
    const sc = flatRoad()
    const a = render(sc), b = render(sc, { visited: new Set(['m1']) })
    expect(a).toContain('fill-opacity="0.12"')
    expect(b).toContain('fill-opacity="0.28"')
  })

  it('robot yalnız movable sahnede sürüklenebilir işaretlenir', () => {
    const mv = roverScene({ id: 'm', title: 'm', movable: true })
    const html = renderToStaticMarkup(<ArenaCanvas scene={mv} snap={idleSnapshot(mv)} onDrag={() => {}} />)
    expect(html).toContain('data-movable="true"')
    expect(render(roverScene({ id: 'n', title: 'n' }))).not.toContain('data-movable')
  })
})

describe('ArenaCanvas (kol sahnesi)', () => {
  const arm: ArmScene = {
    kind: 'arm', id: 'kol', title: 'Kol', l1: 10, l2: 10, gripClosedBelowDeg: 90,
    objects: [{ id: 'nesne', x: 16, y: 2 }], zones: [{ id: 'hedef', x: 7, y: 5, r: 2, label: 'Hedef' }], view: { xMin: -5, xMax: 25, yMin: -2, yMax: 22 },
  }
  const snap = (patch: Partial<ArmSnapshot> = {}): ArmSnapshot => ({ ...(idleSnapshot(arm) as ArmSnapshot), ...patch })
  it('kol, nesne, bölge ve tutucu çizilir', () => {
    const h = renderToStaticMarkup(<ArenaCanvas scene={arm} snap={snap()} />)
    expect(h).toContain('data-object="nesne"'); expect(h).toContain('data-zone="hedef"'); expect(h).toContain('data-testid="arena-gripper"')
  })
  it('tutucu açık/kapalı durumu ve tutulan nesne işaretlenir', () => {
    expect(renderToStaticMarkup(<ArenaCanvas scene={arm} snap={snap({ gripClosed: false })} />)).toContain('data-open="true"')
    const closed = renderToStaticMarkup(<ArenaCanvas scene={arm} snap={snap({ gripClosed: true, held: 'nesne' })} />)
    expect(closed).toContain('data-open="false"'); expect(closed).toContain('arena-obj held')
  })
})

describe('ArenaCanvas (hareketli duvar ve denge)', () => {
  it('hareketli duvar anlık konumuyla çizilir', () => {
    const sc = roverScene({ id: 'm', title: 'm', movers: [{ id: 'hedef', wall: [1, 0.3, 1, 1.7], keys: [] }] })
    const h = render(sc, { movers: [{ id: 'hedef', wall: [1.4, 0.3, 1.4, 1.7] }] })
    expect(h).toContain('data-mover="hedef"'); expect(h).toContain('x1="140"')
  })
  const bal: BalancerScene = { kind: 'balancer', id: 'd', title: 'Denge', theta0Deg: 3 }
  const bsnap = (patch: Partial<BalancerSnapshot> = {}): BalancerSnapshot => ({ ...(idleSnapshot(bal) as BalancerSnapshot), ...patch })
  it('denge sahnesi eğimi gövde dönüşüne yansıtır; düşünce DÜŞTÜ yazar', () => {
    const up = renderToStaticMarkup(<ArenaCanvas scene={bal} snap={bsnap({ thetaDeg: 12 })} />)
    expect(up).toContain('rotate(12.00)'); expect(up).toContain('AYAKTA'); expect(up).toContain('data-fell="false"')
    const down = renderToStaticMarkup(<ArenaCanvas scene={bal} snap={bsnap({ thetaDeg: 60, fell: true })} />)
    expect(down).toContain('DÜŞTÜ'); expect(down).toContain('data-fell="true"')
  })
})
