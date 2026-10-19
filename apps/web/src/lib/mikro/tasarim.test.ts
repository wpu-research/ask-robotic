import { describe, expect, it } from 'vitest'
import {
  CHASSIS, PARTS, TEMPLATES, canPlace, cardCells, convexHull, deriveDesign, emptyDesign, exportDesign, importDesign, placePart,
  polygonMargin, removePart, rotatePart, setChassis, type RobotDesign,
} from './tasarim'
import { DESIGN_CHALLENGES, runDesignChallenge, templateDesign } from './tasarim-gorevleri'
import { MISSION_BY_ID, ROBOT_MISSIONS, evaluateMission, move, turn } from './robot-missions'
import { ROBOT_PROFILES } from './robot'
import { onStart, project, repeat } from './program'
import { Simulation } from './sim'

const codes = (d: RobotDesign) => deriveDesign(d).issues.map((i) => i.code)
const errors = (d: RobotDesign) => deriveDesign(d).issues.filter((i) => i.level === 'hata').map((i) => i.code)
const blok = () => templateDesign('blok')

describe('Robotunu Tasarla: yerleştirme', () => {
  it('teker yalnız yan kenara, tampon ve kıskaç yalnız ön kenara, Mikro Kart hücresine hiçbir şey', () => {
    const d = emptyDesign()
    const ch = CHASSIS.orta
    expect(canPlace(d, 'teker-buyuk', 2, 0).ok).toBe(true)
    expect(canPlace(d, 'teker-buyuk', 2, 2).ok).toBe(false)
    expect(canPlace(d, 'tampon', ch.cols - 1, 2).ok).toBe(true)
    expect(canPlace(d, 'tampon', 2, 2).ok).toBe(false)
    expect(canPlace(d, 'kiskac', 0, 2).ok).toBe(false)
    const [c, r] = cardCells(ch)[0]
    expect(canPlace(d, 'renk', c, r).ok).toBe(false)
    expect(canPlace(d, 'renk', -1, 0).ok).toBe(false)
    const d2 = placePart(d, 'renk', 5, 2)
    expect(canPlace(d2, 'isik', 5, 2).ok).toBe(false)
  })
  it('basit kipte tekerin içine motor kendiliğinden eklenir; silme ve döndürme', () => {
    let d = placePart(emptyDesign(), 'teker-kucuk', 4, 0, { autoMotor: true })
    expect(d.parts.map((p) => p.type).sort()).toEqual(['motor-std', 'teker-kucuk'])
    expect(d.parts.find((p) => p.type === 'motor-std')).toMatchObject({ c: 4, r: 1 })
    d = placePart(d, 'mesafe-ir', 6, 1)
    const id = d.parts.find((p) => p.type === 'mesafe-ir')!.id
    d = rotatePart(rotatePart(d, id), id)
    expect(d.parts.find((p) => p.id === id)!.rot).toBe(2)
    expect(removePart(d, id).parts.length).toBe(2)
  })
  it('şasi değişince kenar parçaları yeni kenara taşınır', () => {
    const d = setChassis(blok(), 'buyuk')
    const ch = CHASSIS.buyuk
    expect(d.parts.filter((p) => PARTS[p.type].wheel).every((p) => p.r === 0 || p.r === ch.rows - 1)).toBe(true)
    expect(d.parts.find((p) => p.type === 'tampon')!.c).toBe(ch.cols - 1)
  })
})

describe('Robotunu Tasarla: doğrulama', () => {
  it('hazır üç tasarım hatasız; boş tasarım teker, motor ve pil ister', () => {
    for (const t of TEMPLATES) expect(errors(t.design), t.id).toEqual([])
    expect(errors(emptyDesign())).toEqual(expect.arrayContaining(['teker', 'pil']))
    const noMotor: RobotDesign = { ...blok(), parts: blok().parts.filter((p) => !p.type.startsWith('motor')) }
    expect(errors(noMotor)).toContain('motor')
  })
  it('sarhoş teker olmadan iki tekerli robot devrilir; palet tek başına durur', () => {
    const d = { ...blok(), parts: blok().parts.filter((p) => p.type !== 'sarhos') }
    expect(errors(d)).toContain('devrilir')
    const tracks = { ...d, parts: d.parts.map((p) => (p.type === 'teker-buyuk' ? { ...p, type: 'palet' as const } : p)) }
    expect(errors(tracks)).not.toContain('devrilir')
    expect(codes(tracks)).toContain('kayma')
  })
  it('ağırlık merkezi destek alanının dışına çıkınca hata: pil önde, sarhoş teker arkada', () => {
    const d: RobotDesign = { v: 1, name: 'x', chassis: 'buyuk', parts: [
      { id: 'a', type: 'teker-kucuk', c: 0, r: 0 }, { id: 'b', type: 'teker-kucuk', c: 0, r: 5 }, { id: 'c', type: 'motor-guclu', c: 0, r: 1 }, { id: 'd', type: 'motor-guclu', c: 0, r: 4 },
      { id: 'e', type: 'pil-6aa', c: 8, r: 2 }, { id: 'f', type: 'pil-6aa', c: 8, r: 3 }, { id: 'g', type: 'sarhos', c: 1, r: 2 },
    ] }
    const x = deriveDesign(d)
    expect(x.stabilityMargin).toBeLessThan(0)
    expect(errors(d)).toContain('devrilir')
  })
  it('port sınırı: 5 sensör ya da 5 motor portu hata verir', () => {
    let d = blok()
    d = placePart(d, 'jiroskop', 1, 1)
    expect(errors(d)).not.toContain('port-sensor')
    d = placePart(d, 'isik', 1, 3)
    expect(deriveDesign(d).sensorPortsUsed).toBe(5)
    expect(errors(d)).toContain('port-sensor')
    let m = templateDesign('kiskac')
    m = placePart(m, 'motor-mini', 0, 1)
    m = placePart(m, 'motor-mini', 0, 3)
    expect(deriveDesign(m).motorPortsUsed).toBe(5)
    expect(errors(m)).toContain('port-motor')
  })
  it('güç bütçesi: tek hücreli pil güçlü motorların akımını veremez; tek motor ortak aks', () => {
    const d = { ...blok(), parts: blok().parts.map((p) => (p.type === 'motor-std' ? { ...p, type: 'motor-guclu' as const } : p.type === 'pil-4aa' ? { ...p, type: 'lipo-1s' as const } : p)) }
    const x = deriveDesign(d)
    expect(x.peakMA).toBeGreaterThan(3000)
    expect(errors(d)).toContain('akim')
    const one = { ...blok(), parts: blok().parts.filter((p) => !(p.type === 'motor-std' && p.r === 3)) }
    const o = deriveDesign(one)
    expect(o.coupled).toBe(true)
    expect(o.driveMotors).toBe(1)
    expect(o.turnDegS).toBe(0)
    expect(o.ok).toBe(true)
  })
  it('çok ağır robot kıpırdayamaz', () => {
    let d: RobotDesign = { v: 1, name: 'ağır', chassis: 'buyuk', parts: [
      { id: 'a', type: 'teker-buyuk', c: 4, r: 0 }, { id: 'b', type: 'teker-buyuk', c: 4, r: 5 }, { id: 'c', type: 'motor-mini', c: 4, r: 1 }, { id: 'd', type: 'motor-mini', c: 4, r: 4 },
      { id: 'li', type: 'lipo-1s', c: 3, r: 1 }, { id: 's', type: 'sarhos', c: 0, r: 2 }, { id: 's2', type: 'sarhos', c: 8, r: 3 },
    ] }
    let i = 0
    for (const [c, r] of [[1, 1], [1, 4], [2, 1], [2, 4], [1, 2], [1, 3], [5, 1], [5, 4], [6, 1], [6, 4], [7, 1], [7, 4], [6, 2], [6, 3], [7, 2], [7, 3]]) d = placePart(d, 'pil-6aa', c, r, { id: `p${i++}` })
    const x = deriveDesign(d)
    expect(x.massG).toBeGreaterThan(2500)
    expect(errors(d)).toContain('agir')
  })
})

describe('Robotunu Tasarla: türetilen fizik', () => {
  it('hazır tasarımların ölçüleri var olan gövdelere yakın', () => {
    for (const t of TEMPLATES) {
      const p = deriveDesign(t.design).profile
      const q = ROBOT_PROFILES[t.id]
      expect(p.wheelDiameter).toBeCloseTo(q.wheelDiameter, 3)
      expect(Math.abs(p.wheelBase - q.wheelBase)).toBeLessThan(0.01)
      expect(Math.abs(p.maxDegPerS - q.maxDegPerS) / q.maxDegPerS).toBeLessThan(0.2)
      expect([...p.sensors].sort()).toEqual([...q.sensors].sort())
    }
  })
  it('kütle parçaların toplamı; ağır pil ağırlık merkezini kendine çeker', () => {
    const d = blok()
    const x = deriveDesign(d)
    expect(x.massG).toBe(CHASSIS.orta.massG + 15 + d.parts.reduce((s, p) => s + PARTS[p.type].massG, 0))
    const back = deriveDesign({ ...d, parts: d.parts.map((p) => (p.type === 'pil-4aa' ? { ...p, c: 0, r: 1 } : p)) })
    expect(back.com.x).toBeLessThan(x.com.x)
  })
  it('büyük teker daha hızlı, ağır robot daha geç hızlanır, palet dönüşte kayar', () => {
    const d = blok()
    const small = deriveDesign({ ...d, parts: d.parts.map((p) => (p.type === 'teker-buyuk' ? { ...p, type: 'teker-kucuk' as const } : p)) })
    const big = deriveDesign(d)
    expect(big.speedCmS).toBeGreaterThan(small.speedCmS)
    const heavy = deriveDesign(placePart(placePart(d, 'pil-6aa', 1, 1), 'pil-6aa', 1, 3))
    expect(heavy.tauS).toBeGreaterThan(big.tauS)
    expect(heavy.maxDegPerS).toBeLessThan(big.maxDegPerS)
    const tr = deriveDesign({ ...d, parts: d.parts.map((p) => (p.type === 'teker-buyuk' ? { ...p, type: 'palet' as const } : p)) })
    expect(tr.turnSlip).toBeLessThan(1)
  })
  it('dışbükey zarf ve çokgen payı', () => {
    const hull = convexHull([[0, 0], [1, 0], [1, 1], [0, 1], [0.5, 0.5]])
    expect(hull.length).toBe(4)
    expect(polygonMargin(hull, 0.5, 0.5)).toBeCloseTo(0.5)
    expect(polygonMargin(hull, 2, 0.5)).toBeCloseTo(-1)
  })
})

describe('Robotunu Tasarla: benzetimde çalışma', () => {
  it('hazır tasarımlar kendi gövdelerinin bütün görevlerini örnek çözümle bitirir', () => {
    for (const t of TEMPLATES) {
      const prof = deriveDesign(t.design).profile
      for (const m of ROBOT_MISSIONS.filter((x) => x.profile === t.id)) {
        const r = evaluateMission(m, m.solution(), prof)
        expect(r.error, `${t.id}/${m.id}`).toBeNull()
        expect(r.status.filter((s) => !s.done).map((s) => s.id), `${t.id}/${m.id}`).toEqual([])
      }
    }
  }, 120_000)
  it('özgün bir tasarım (büyük şasi, güçlü motor, ultrasonik) "Duvarda dur" ve "İlk sürüş" görevlerini aynı programla bitirir', () => {
    let d: RobotDesign = emptyDesign('Kaplan', 'buyuk')
    d = placePart(d, 'teker-buyuk', 5, 0, { id: 'tl' }); d = placePart(d, 'teker-buyuk', 5, 5, { id: 'tr' })
    d = placePart(d, 'motor-guclu', 5, 1, { id: 'ml' }); d = placePart(d, 'motor-guclu', 5, 4, { id: 'mr' })
    d = placePart(d, 'sarhos', 0, 2, { id: 'sh' }); d = placePart(d, 'lipo-2s', 1, 3, { id: 'pl' })
    d = placePart(d, 'ultrasonik', 8, 2, { id: 'us' }); d = placePart(d, 'renk', 7, 3, { id: 'rk' }); d = placePart(d, 'tampon', 8, 3, { id: 'tp' })
    const x = deriveDesign(d)
    expect(x.issues.filter((i) => i.level === 'hata')).toEqual([])
    for (const id of ['duvarda-dur', 'ilk-surus', 'renkte-dur']) {
      const m = MISSION_BY_ID[id]
      const r = evaluateMission(m, m.solution(), x.profile)
      expect(r.status.filter((s) => !s.done).map((s) => s.id), id).toEqual([])
    }
  })
  it('sensörü olmayan tasarımda sensör bloğu çalışma hatası verir', () => {
    const d = { ...blok(), parts: blok().parts.filter((p) => p.type !== 'renk') }
    const m = MISSION_BY_ID['renkte-dur']
    const r = evaluateMission(m, m.solution(), deriveDesign(d).profile)
    expect(r.error).toMatch(/renk sensörü yok/)
  })
  it('paletli robot jiroskopsuz eksik döner, jiroskopla tam döner', () => {
    const tracks = { ...blok(), parts: blok().parts.filter((p) => p.type !== 'sarhos').map((p) => (p.type === 'teker-buyuk' ? { ...p, type: 'palet' as const } : p)) }
    const run = (d: RobotDesign) => {
      const sim = new Simulation(project('dön', [onStart(turn(90))]), { robot: { profile: deriveDesign(d).profile, scene: MISSION_BY_ID.kare.scene() } })
      sim.start(); sim.advance(3000)
      return sim.robot!.headingDeg
    }
    expect(run(tracks)).toBeLessThan(75)
    expect(Math.abs(run(placePart(tracks, 'jiroskop', 1, 1)) - 90)).toBeLessThanOrEqual(3)
  })
  it('tek motorlu robot dönemez: "dön" bloğu yönü değiştirmez', () => {
    const one = { ...blok(), parts: blok().parts.filter((p) => !(p.type === 'motor-std' && p.r === 3)) }
    const sim = new Simulation(project('kare', [onStart(repeat(2, [move(10), turn(90)]))]), { robot: { profile: deriveDesign(one).profile, scene: MISSION_BY_ID.kare.scene() } })
    sim.start(); sim.advance(3000)
    expect(sim.robot!.headingDeg).toBe(0)
  })
})

describe('Robotunu Tasarla: dışa ve içe aktarma', () => {
  it('JSON gidiş-dönüş aynı tasarımı ve aynı fiziği verir', () => {
    for (const t of TEMPLATES) {
      const d = rotatePart(t.design, t.design.parts[0].id)
      const r = importDesign(exportDesign(d))
      expect(r.ok).toBe(true)
      if (!r.ok) continue
      expect(r.design).toEqual(d)
      expect(deriveDesign(r.design).profile.maxDegPerS).toBe(deriveDesign(d).profile.maxDegPerS)
    }
  })
  it('bozuk dosyalar anlaşılır hatayla reddedilir', () => {
    expect(importDesign('{bozuk').ok).toBe(false)
    expect(importDesign({ chassis: 'dev', parts: [] }).ok).toBe(false)
    expect(importDesign({ chassis: 'orta', parts: [{ type: 'roket', c: 0, r: 0 }] }).ok).toBe(false)
    expect(importDesign({ chassis: 'orta', parts: [{ type: 'teker-kucuk', c: 3, r: 2 }] }).ok).toBe(false)
    expect(importDesign({ format: 'baska', chassis: 'orta', parts: [] }).ok).toBe(false)
    const big = { chassis: 'orta', parts: Array.from({ length: 200 }, () => ({ type: 'renk', c: 0, r: 0 })) }
    expect(importDesign(big).ok).toBe(false)
  })
})

describe('tasarım yarışmaları (sunucu puanı)', () => {
  for (const ch of DESIGN_CHALLENGES) {
    it(`${ch.title}: örnek tasarım ve program bitirir, puan belirlenimci`, () => {
      const s = ch.sample()
      const a = runDesignChallenge(ch, s.design, s.project)
      expect(a.error).toBeNull()
      expect(a.finishMs).not.toBeNull()
      expect(a.score).toBeGreaterThanOrEqual(60)
      expect(runDesignChallenge(ch, s.design, s.project)).toEqual(a)
    }, 60_000)
  }
  it('hafif robot slalomda ağır robottan çok puan alır', () => {
    const ch = DESIGN_CHALLENGES.find((c) => c.id === 'hafif-slalom')!
    const p = ch.sample().project
    const light = runDesignChallenge(ch, ch.sample().design, p)
    const heavy = runDesignChallenge(ch, templateDesign('blok'), p)
    expect(heavy.finishMs).not.toBeNull()
    expect(light.score).toBeGreaterThan(heavy.score)
  })
  it('kurala uymayan ya da hatalı tasarım 0 puan', () => {
    const ch = DESIGN_CHALLENGES.find((c) => c.id === 'tek-motor-park')!
    const two = runDesignChallenge(ch, templateDesign('blok'), ch.sample().project)
    expect(two.score).toBe(0)
    expect(two.error).toMatch(/tam bir sürüş motoru/)
    const bad = runDesignChallenge(ch, emptyDesign(), ch.sample().project)
    expect(bad.score).toBe(0)
    expect(bad.error).toMatch(/Tasarımda hata/)
  })
})
