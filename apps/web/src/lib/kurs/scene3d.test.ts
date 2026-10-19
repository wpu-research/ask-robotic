// 3B sahnelerin saf mantığı: sanal kamera (OpenCV), kayıp yüzeyi ve CNN katman yerleşimi (PyTorch).
import { describe, expect, it } from 'vitest'
import { backProject, CAM_DEFAULT, cameraPose, docCorners, frustum, project, renderPhoto } from '@/lib/opencv/camera3d'
import { findDocument, orderCorners } from '@/lib/opencv/geom'
import { optimize, surf } from '@/lib/pytorch/nets'
import { cnnLayout, surfaceGrid, toScene, trajectories } from '@/lib/pytorch/scene3d'
import { runCnn, type CnnWeights } from '@/lib/pytorch/cnn'

describe('sanal kamera (OpenCV 3B)', () => {
  it('izdüşüm ve geri izdüşüm tutarlı; masa merkezi görüntü merkezine düşer', () => {
    const p = CAM_DEFAULT, pose = cameraPose(p)
    const c = project(p, pose, [0, 0, 0])!
    expect(c.x).toBeCloseTo(p.w / 2, 6); expect(c.y).toBeCloseTo(p.h / 2, 6)
    for (const X of docCorners(p.docYaw)) {
      const q = project(p, pose, X)!, back = backProject(p, pose, q.x, q.y)!
      expect(back[0]).toBeCloseTo(X[0], 6); expect(back[1]).toBeCloseTo(X[1], 6)
    }
  })
  it('tam tepeden bakışta belge dikdörtgen görünür, eğik bakışta yamuk', () => {
    const top = { ...CAM_DEFAULT, elev: 90, docYaw: 0 }, pose = cameraPose(top)
    const q = docCorners(0).map((X) => project(top, pose, X)!)
    expect(Math.abs(q[0].y - q[1].y)).toBeLessThan(1e-6)
    expect(Math.abs((q[1].x - q[0].x) - (q[2].x - q[3].x))).toBeLessThan(1e-6)
    const tilt = { ...CAM_DEFAULT, elev: 40, azim: 0, docYaw: 0 }, pt = cameraPose(tilt)
    const r = docCorners(0).map((X) => project(tilt, pt, X)!)
    expect(r[1].x - r[0].x).toBeLessThan(r[2].x - r[3].x) // uzak kenar kısa
  })
  it('sanal kameranın ürettiği görüntüde 9. ünitenin köşe bulucusu gerçek köşeleri 6 px içinde bulur', () => {
    for (const p of [CAM_DEFAULT, { ...CAM_DEFAULT, elev: 70, azim: -25, docYaw: -15 }]) {
      const { img, corners } = renderPhoto(p)
      const r = findDocument(img)
      expect(r.quad).not.toBeNull()
      orderCorners(corners as Array<{ x: number; y: number }>).forEach((t, i) => expect(Math.hypot(t.x - r.quad![i].x, t.y - r.quad![i].y)).toBeLessThan(6))
    }
  })
  it('frustum köşeleri kameradan ileri yönde', () => {
    const pose = cameraPose(CAM_DEFAULT)
    for (const v of frustum(CAM_DEFAULT)) expect((v[0] - pose.C[0]) * pose.fwd[0] + (v[1] - pose.C[1]) * pose.fwd[1] + (v[2] - pose.C[2]) * pose.fwd[2]).toBeGreaterThan(0)
  })
})

describe('kayıp yüzeyi (PyTorch 3B)', () => {
  it('ızgara boyutu ve yükseklik monoton: minimum en alçak nokta', () => {
    const g = surfaceGrid('valley', 20)
    expect(g.pos.length).toBe(21 * 21 * 3)
    const min = toScene('valley', 0, 0, 0), far = toScene('valley', 9, 2.5, surf('valley', 9, 2.5).f)
    expect(min[1]).toBeLessThan(far[1])
    let lo = Infinity; for (let k = 1; k < g.pos.length; k += 3) lo = Math.min(lo, g.pos[k])
    expect(lo).toBeGreaterThanOrEqual(0)
  })
  it('yörünge noktaları optimize edicinin adımlarıyla birebir, yükseklik azalır (Adam, vadi)', () => {
    const t = trajectories('valley', { sgd: 0.05, momentum: 0.05, rmsprop: 0.3, adam: 0.3 }, 100, ['adam', 'sgd'])
    const raw = optimize('adam', 'valley', 0.3, 100)
    expect(t.adam.length).toBe(raw.length)
    expect(t.adam.at(-1)![1]).toBeLessThan(t.adam[0][1])
    expect(t.sgd.length).toBe(101)
  })
})

describe('CNN katman yerleşimi (PyTorch 3B)', () => {
  it('her kanal bir düzlem; katmanlar derinlikte sıralı', () => {
    const W: CnnWeights = { mean: 0, std: 1, conv1: { w: new Array(72).fill(0.1), b: new Array(8).fill(0) }, conv2: { w: new Array(1152).fill(0.01), b: new Array(16).fill(0) }, fc: { w: new Array(7840).fill(0), b: new Array(10).fill(0) } }
    const L = cnnLayout(runCnn(W, new Uint8Array(784).fill(100)))
    expect(L.length).toBe(1 + 8 + 8 + 16 + 16)
    const zs = [...new Set(L.map((p) => p.pos[2]))]
    expect(zs).toEqual([...zs].sort((a, b) => b - a))
    expect(L.filter((p) => p.key === 'conv2').every((p) => p.fm.w === 14)).toBe(true)
  })
})
