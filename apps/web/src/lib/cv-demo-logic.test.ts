import { describe, expect, it } from 'vitest'
import {
  blobHueCounts, blobs, countStep, debounce, deb, estimateBpm, faceEar, faceMar, fallInit, fallObs, fallStep, FATIGUE_DEFAULTS,
  fatigueInit, fatigueStep, fgMask, footPoint, handHazard, hazardNeed, hueClass, lineCross, nightVision, perclos, pointInPolygon,
  postureFeatures, postureStep, postureVerdict, pyFor, resample, rgbToHsv, ripeness, segmentFruit, speedKmh, trackStep, type FallState, type Track,
} from './cv-demo-logic'
import { foreheadRoi, makeFace, makeHand, makePose, makeUpper } from './cv-demo-scenes'

// basit tohumlu rastgele (testler her seferinde aynı)
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) }
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r())

/** 30 fps'de bir poz dizisini dedektörden geçirir, her karedeki evreyi döndürür. */
function runFall(frames: Array<Parameters<typeof makePose>[0]>) {
  let s: FallState = fallInit()
  return frames.map((f, i) => { s = fallStep(s, fallObs(makePose(f), i / 30)); return s.phase })
}
const stand = (n: number) => Array.from({ length: n }, () => ({ cx: 320, footY: 420, h: 300 }))

describe('düşme tespiti', () => {
  it('hızlı devrilme → fall (N kare sonra), sonra kalkınca ok', () => {
    const fall = Array.from({ length: 15 }, (_, i) => ({ cx: 320, footY: 420, h: 300, lean: (Math.PI / 2) * ((i + 1) / 15) }))
    const lie = Array.from({ length: 60 }, () => ({ cx: 320, footY: 420, h: 300, lean: Math.PI / 2 }))
    const ph = runFall([...stand(30), ...fall, ...lie, ...stand(30)])
    expect(ph.slice(0, 30).every((p) => p === 'ok')).toBe(true)
    const first = ph.indexOf('fall')
    expect(first).toBeGreaterThan(30)
    expect(first).toBeLessThan(30 + 15 + 12)
    expect(ph[ph.length - 1]).toBe('ok')
  })
  it('yavaşça uzanma → lying (alarm yok), hiç fall yok', () => {
    const slow = Array.from({ length: 150 }, (_, i) => ({ cx: 320, footY: 420, h: 300, lean: (Math.PI / 2) * Math.min(1, (i + 1) / 120) }))
    const ph = runFall([...stand(10), ...slow])
    expect(ph).not.toContain('fall')
    expect(ph[ph.length - 1]).toBe('lying')
  })
  it('hızlı çömelme (gövde dik) → drop olur ama pencere sonunda ok', () => {
    const squat = Array.from({ length: 8 }, (_, i) => ({ cx: 320, footY: 420, h: 300, crouch: (i + 1) / 8 }))
    const hold = Array.from({ length: 60 }, () => ({ cx: 320, footY: 420, h: 300, crouch: 1 }))
    const ph = runFall([...stand(10), ...squat, ...hold])
    expect(ph).toContain('drop')
    expect(ph).not.toContain('fall')
    expect(ph[ph.length - 1]).toBe('ok')
  })
  it('noktalar görünmüyorsa gözlem yok', () => {
    const lm = makePose({ cx: 0, footY: 0, h: 100 }).map((p) => ({ ...p, visibility: 0.1 }))
    expect(fallObs(lm, 0)).toBeNull()
  })
})

describe('bölge ihlali', () => {
  const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
  const concave = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 5, y: 4 }, { x: 0, y: 10 }]
  it('nokta-çokgen (ışın atma), içbükey çokgen dahil', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, sq)).toBe(true)
    expect(pointInPolygon({ x: 11, y: 5 }, sq)).toBe(false)
    expect(pointInPolygon({ x: 5, y: 8 }, concave)).toBe(false)
    expect(pointInPolygon({ x: 5, y: 2 }, concave)).toBe(true)
  })
  it('ayak noktası bileklerin ortası', () => {
    const lm = makePose({ cx: 200, footY: 400, h: 300 })
    const f = footPoint(lm)!
    expect(f.x).toBeCloseTo(200, 0); expect(f.y).toBeCloseTo(400, 0)
  })
  it('kararlılık: giriş 3 kare, çıkış 8 kare', () => {
    const need = (_: boolean, to: boolean) => (to ? 3 : 8)
    let s = deb(false)
    for (let i = 0; i < 2; i++) s = debounce(s, true, need)
    expect(s.value).toBe(false)
    s = debounce(s, true, need); expect(s.value).toBe(true)
    for (let i = 0; i < 7; i++) s = debounce(s, false, need)
    expect(s.value).toBe(true)
    s = debounce(s, false, need); expect(s.value).toBe(false)
  })
  it('gece modu karanlık görüntüyü aydınlatır ve gri yapar', () => {
    const d = new Uint8ClampedArray([20, 30, 40, 255, 10, 10, 10, 255])
    const r = nightVision(d, 3)
    expect(r.after).toBeGreaterThan(r.before * 2)
    expect(d[0]).toBeLessThan(d[1]) // yeşilimsi ton
  })
})

describe('el yasak bölgede', () => {
  const zone = { x: 100, y: 100, w: 100, h: 60 }
  it('uzak → safe, yakın → warn, içeride → danger', () => {
    expect(handHazard(makeHand(400, 400, 60), zone, 40).level).toBe('safe')
    expect(handHazard(makeHand(150, 260, 60), zone, 40).level).toBe('warn') // orta parmak ucu 260 − 73 = 187 → 27 px
    expect(handHazard(makeHand(150, 200, 60), zone, 40).level).toBe('danger')
  })
  it('alarm hızlı yükselir, yavaş iner', () => {
    expect(hazardNeed('safe', 'danger')).toBe(2)
    expect(hazardNeed('danger', 'safe')).toBe(6)
  })
})

describe('duruş', () => {
  it('dik duruş temiz, eğik omuz ve düşen baş yakalanır', () => {
    const good = postureFeatures(makeUpper({ cx: 320, cy: 300, sw: 160 }))!
    expect(good.tilt).toBeLessThan(1); expect(good.neck).toBeLessThan(1)
    expect(postureVerdict(good, good.ratio)).toEqual([])
    const bad = postureFeatures(makeUpper({ cx: 320, cy: 300, sw: 160, tilt: 12, neck: 25, drop: 0.8 }))!
    expect(postureVerdict(bad, good.ratio).sort()).toEqual(['drop', 'neck', 'tilt'])
  })
  it('hatırlatma ancak hold sn sonra', () => {
    let s = { badSince: null as number | null, alert: false }
    s = postureStep(s, true, 0, 3); expect(s.alert).toBe(false)
    s = postureStep(s, true, 2.9, 3); expect(s.alert).toBe(false)
    s = postureStep(s, true, 3.1, 3); expect(s.alert).toBe(true)
    s = postureStep(s, false, 3.2, 3); expect(s.alert).toBe(false)
  })
})

describe('nabız (rPPG)', () => {
  it('gürültülü sinüsten BPM\'i ±2 içinde bulur', () => {
    const r = rng(7), fs = 30
    for (const bpm of [58, 72, 95, 130]) {
      const x = Array.from({ length: fs * 12 }, (_, i) => {
        const t = i / fs
        return 120 + 0.6 * Math.sin(2 * Math.PI * (bpm / 60) * t) + 0.5 * gauss(r) + 3 * Math.sin(2 * Math.PI * 0.08 * t) // nabız + gürültü + ışık kayması
      })
      const e = estimateBpm(x, fs)!
      expect(Math.abs(e.bpm - bpm), `${bpm}`).toBeLessThan(2)
      expect(e.snr).toBeGreaterThan(0.3)
    }
  })
  it('4 sn\'den kısa veriyle tahmin yok; düzensiz zamanlar eşit aralığa çevrilir', () => {
    expect(estimateBpm([1, 2, 3], 30)).toBeNull()
    const ts = [0, 0.03, 0.07, 0.1], vs = [0, 3, 7, 10]
    const u = resample(ts, vs, 50)
    expect(u.length).toBe(6)
    expect(u[2]).toBeCloseTo(4, 5)
  })
  it('alın bölgesi yüz genişliğiyle ölçeklenir', () => {
    const roi = foreheadRoi(makeFace({ cx: 300, cy: 240, fw: 200 }))
    expect(roi.w).toBeCloseTo(72, 0); expect(roi.y).toBeLessThan(240 - 60)
  })
})

describe('trafik sayacı', () => {
  it('lekeler: iki ayrı dikdörtgen, küçük gürültü elenir', () => {
    const w = 20, h = 10, m = new Uint8Array(w * h)
    const fill = (x0: number, y0: number, x1: number, y1: number) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y * w + x] = 1 }
    fill(1, 1, 4, 3); fill(10, 5, 15, 8); m[19] = 1
    const { blobs: bs, labels } = blobs(m, w, h, 3)
    expect(bs).toHaveLength(2)
    expect(bs[0].area).toBe(12); expect(bs[1].cx).toBeCloseTo(12.5)
    expect(labels[19]).toBe(0)
  })
  it('ön plan maskesi eşikle', () => {
    const g = new Float32Array([10, 100, 50]), bg = new Float32Array([10, 10, 40]), o = new Uint8Array(3)
    expect(fgMask(g, bg, 25, o)).toBe(1); expect([...o]).toEqual([0, 1, 0])
  })
  it('izleme + çizgi geçişi + hız', () => {
    // 0,1 m/piksel, aşağı 200 px/s → 20 m/s = 72 km/sa; yukarı 100 px/s → 36 km/sa
    let tracks: Track[] = [], id = 1
    let down = 0, up = 0
    const speeds: number[] = []
    for (let i = 0; i < 60; i++) {
      const t = i / 30
      const bs = [{ id: 1, x0: 0, y0: 0, x1: 0, y1: 0, cx: 100, cy: 20 + 200 * t, area: 50 }, { id: 2, x0: 0, y0: 0, x1: 0, y1: 0, cx: 300, cy: 400 - 100 * t, area: 50 }]
      ;({ tracks, nextId: id } = trackStep(tracks, bs, t, 30, 5, id))
      for (const e of countStep(tracks, 240, 0.1)) { if (e.dir === 1) down++; else up++; if (e.kmh) speeds.push(e.kmh) }
    }
    expect(down).toBe(1); expect(up).toBe(1)
    expect(tracks).toHaveLength(2)
    expect(speeds.sort((a, b) => a - b)[0]).toBeCloseTo(36, 0)
    expect(speeds[1]).toBeCloseTo(72, 0)
  })
  it('çizgi geçişi yönü ve kısa geçmişte hız yok', () => {
    expect(lineCross(9, 11, 10)).toBe(1); expect(lineCross(11, 9, 10)).toBe(-1); expect(lineCross(3, 4, 10)).toBe(0)
    expect(speedKmh([{ t: 0, x: 0, y: 0 }, { t: 0.1, x: 0, y: 10 }], 0.1)).toBeNull()
  })
})

describe('meyve olgunluğu (HSV)', () => {
  it('RGB → HSV', () => {
    expect(rgbToHsv(255, 0, 0)).toEqual([0, 1, 1])
    const [h] = rgbToHsv(0, 255, 0); expect(h).toBe(120)
    expect(rgbToHsv(128, 128, 128)[1]).toBe(0)
  })
  it('renk sınıfları ve gri arka plan', () => {
    expect(hueClass(5, 0.8, 0.7)).toBe(1); expect(hueClass(350, 0.8, 0.7)).toBe(1)
    expect(hueClass(45, 0.8, 0.7)).toBe(2); expect(hueClass(110, 0.8, 0.7)).toBe(3)
    expect(hueClass(110, 0.1, 0.7)).toBe(0); expect(hueClass(110, 0.8, 0.1)).toBe(0)
  })
  it('görüntüden oran: %75 kırmızı → olgun, %40 → yarı, %0 → ham', () => {
    const img = (red: number, green: number, grey: number) => {
      const px = [...Array(red).fill([220, 30, 30]), ...Array(green).fill([60, 180, 50]), ...Array(grey).fill([120, 120, 120])]
      return new Uint8ClampedArray(px.flatMap((p) => [...p, 255]))
    }
    const one = (red: number, green: number) => {
      const w = red + green + 4, { cls, mask } = segmentFruit(img(red, green, 4), w, 1)
      const { labels } = blobs(mask, w, 1, 1)
      const c = [...blobHueCounts(cls, labels).values()][0]
      return ripeness(c)
    }
    expect(one(75, 25)).toEqual({ ratio: 0.75, label: 'ripe' })
    expect(one(40, 60).label).toBe('half')
    expect(ripeness({ red: 0, yellow: 3, green: 10 }).label).toBe('unripe')
    expect(ripeness({ red: 0, yellow: 0, green: 0 }).ratio).toBe(0)
  })
})

describe('yorgunluk / esneme', () => {
  it('EAR açık ≈ 0,30, kapalı < 0,21; MAR ağızla artar', () => {
    expect(faceEar(makeFace({ cx: 0, cy: 0, fw: 200, eye: 1 }))).toBeCloseTo(0.3, 2)
    expect(faceEar(makeFace({ cx: 0, cy: 0, fw: 200, eye: 0.3 }))).toBeLessThan(FATIGUE_DEFAULTS.ear)
    expect(faceMar(makeFace({ cx: 0, cy: 0, fw: 200, mouth: 0 }))).toBeLessThan(0.1)
    expect(faceMar(makeFace({ cx: 0, cy: 0, fw: 200, mouth: 1 }))).toBeGreaterThan(0.8)
  })
  it('kısa kapanma göz kırpma, uzun kapanma uyuklama alarmı, uzun ağız açma tek esneme', () => {
    let s = fatigueInit()
    const feed = (sec: number, ear: number, mar: number, t0: number) => { for (let i = 0; i < sec * 30; i++) s = fatigueStep(s, { t: t0 + i / 30, ear, mar }) }
    feed(1, 0.3, 0.05, 0); feed(0.2, 0.1, 0.05, 1); feed(1, 0.3, 0.05, 1.2)
    expect(s.blinks).toHaveLength(1); expect(s.alert).toBe('none')
    feed(1.0, 0.1, 0.05, 2.2)
    expect(s.alert).toBe('drowsy')
    feed(0.5, 0.3, 0.05, 3.2)
    expect(s.blinks).toHaveLength(1) // uzun kapanma göz kırpma sayılmaz
    feed(2, 0.3, 0.8, 3.7)
    expect(s.alert).toBe('yawn'); expect(s.yawns).toBe(1)
    feed(1, 0.3, 0.05, 5.7)
    expect(s.alert).toBe('none'); expect(s.yawns).toBe(1)
    expect(perclos(s)).toBeGreaterThan(0.1)
  })
})

describe('Python yorumları', () => {
  it('"# tr || en" yorumundan dili seçer', () => {
    const src = 'x = 1  # bir || one\ny = 2'
    expect(pyFor(src, 'tr')).toBe('x = 1  # bir\ny = 2')
    expect(pyFor(src, 'en')).toBe('x = 1  # one\ny = 2')
  })
})
