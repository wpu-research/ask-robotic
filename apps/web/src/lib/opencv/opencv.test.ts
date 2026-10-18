import { describe, expect, it } from 'vitest'
import {
  adaptiveThreshold, canny, countNonZero, equalize, filter2D, gaussianKernel, gray, histogram, inRangeHsv, integral, medianBlur, meanStd,
  morphology, otsu, pointLut, psnr, rectSum, rgbToHsv, hsvToRgb, sobel, threshold, toGray, addNoise, reflect101, perChannel,
} from './ops'
import { approxPolyDP, contourArea, describe as describeContour, findContours, shapeName } from './contours'
import { applyH, findDocument, orderCorners, perspectiveTransform, rotationMatrix, applyAffine, warpPerspective, quadSize } from './geom'
import { detectAndCompute, hamming, harris, match, peaks, ransacH } from './features'
import { detect, FEATURES, group } from './haar'
import { ballFrame, coinsScene, DOC_CORNERS, documentScene, FACE_BOX, faceScene, fruitScene, pageScene, rng, sample, SAMPLE_IDS, shapesScene, trafficFrame, blocksScene, lowlightScene } from './samples'
import { warpAffine } from './geom'

const g = (w: number, h: number, f: (x: number, y: number) => number) => { const o = gray(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o.data[y * w + x] = f(x, y); return o }

describe('renk ve nokta işlemleri', () => {
  it('HSV OpenCV ölçeğinde (H 0–179) ve geri dönüşüm tutarlı', () => {
    expect(rgbToHsv(255, 0, 0)).toEqual([0, 255, 255])
    expect(rgbToHsv(0, 255, 0)).toEqual([60, 255, 255])
    expect(rgbToHsv(0, 0, 255)).toEqual([120, 255, 255])
    expect(rgbToHsv(128, 128, 128)).toEqual([0, 0, 128])
    const [h, s, v] = rgbToHsv(240, 140, 20)
    const back = hsvToRgb(h, s, v)
    back.forEach((c, i) => expect(Math.abs(c - [240, 140, 20][i])).toBeLessThanOrEqual(3))
  })
  it('gri dönüşüm 0,299R + 0,587G + 0,114B', () => {
    const img = sample('shapes', 4, 4)
    img.data.set([100, 200, 50, 255], 0)
    expect(toGray(img).data[0]).toBe(Math.round(0.299 * 100 + 0.587 * 200 + 0.114 * 50))
  })
  it('LUT: α, β doyurur; gama > 1 koyu tonları açar', () => {
    const l = pointLut(2, 10)
    expect(l[0]).toBe(10); expect(l[100]).toBe(210); expect(l[200]).toBe(255)
    expect(pointLut(1, 0, 2)[64]).toBeGreaterThan(64)
  })
  it('eşitleme dar histogramı yayar', () => {
    const lo = toGray(lowlightScene())
    const a = meanStd(lo), b = meanStd(equalize(lo))
    expect(b.std).toBeGreaterThan(a.std * 2)
    const h = histogram(equalize(lo))
    expect(h.slice(200).reduce((s, v) => s + v, 0)).toBeGreaterThan(0)
  })
  it('reflect101 kenar yansıması', () => {
    expect([-2, -1, 0, 4, 5, 6].map((i) => reflect101(i, 5))).toEqual([2, 1, 0, 4, 3, 2])
  })
})

describe('eşikleme', () => {
  it('Otsu iki tepeli histogramda tepelerin arasını seçer', () => {
    const im = g(40, 20, (x) => (x < 20 ? 50 : 200))
    const { t } = otsu(im)
    expect(t).toBeGreaterThanOrEqual(50); expect(t).toBeLessThan(200)
    expect(countNonZero(threshold(im, t))).toBe(400)
  })
  it('düzensiz ışıkta uyarlamalı eşik yazıyı sabit eşikten çok daha iyi korur', () => {
    const pg = toGray(pageScene())
    const ref = toGray(pageScene()) // yazı pikselleri: koyu öbekler; sağ yarıda ışık zayıf
    const fixed = threshold(pg, otsu(pg).t), ad = adaptiveThreshold(pg, 25, 10)
    // sağ çeyrekte: sabit eşik her şeyi siyah yapar, uyarlamalı zemini beyaz tutar
    const whiteRight = (m: typeof fixed) => { let n = 0, t = 0; for (let y = 0; y < m.h; y++) for (let x = 240; x < 320; x++) { t++; if (m.data[y * m.w + x]) n++ } return n / t }
    expect(whiteRight(fixed)).toBeLessThan(0.3)
    expect(whiteRight(ad)).toBeGreaterThan(0.6)
    expect(ref.w).toBe(320)
  })
})

describe('evrişim ve filtreler', () => {
  it('Gauss çekirdeği normalize ve simetrik; OpenCV σ formülü (σ ≤ 0)', () => {
    const k = gaussianKernel(5, 0)
    expect(k.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6)
    expect(k[0]).toBeCloseTo(k[4], 9)
    expect(k[2]).toBeGreaterThan(k[1])
  })
  it('filter2D elle hesapla aynı (korelasyon, yansıtmalı kenar)', () => {
    const im = g(3, 3, (x, y) => y * 3 + x)
    const f = filter2D(im, [0, 0, 0, 0, 0, 1, 0, 0, 0], 3, 3) // sağdaki komşu
    expect(Array.from(f.data)).toEqual([1, 2, 1, 4, 5, 4, 7, 8, 7])
  })
  it('medyan tuz-biberi Gauss bulanıklığından iyi temizler', () => {
    const clean = shapesScene(160, 120), noisy = addNoise(clean, 'saltpepper', 0.08, rng(1))
    const med = perChannel(noisy, (c) => medianBlur(c, 3))
    expect(psnr(clean, med)).toBeGreaterThan(psnr(clean, noisy) + 8)
  })
})

describe('kenarlar ve morfoloji', () => {
  it('Sobel dikey kenarda yatay türev verir', () => {
    const im = g(10, 10, (x) => (x < 5 ? 0 : 100))
    const { gx, gy } = sobel(im)
    expect(Math.abs(gx.data[5 * 10 + 5])).toBeGreaterThan(100)
    expect(gy.data[5 * 10 + 5]).toBe(0)
  })
  it('Canny ince (tek piksel) kenar verir ve histerezis zayıf kenarları bağlar', () => {
    const im = toGray(shapesScene())
    const c1 = canny(im, 200, 200), c2 = canny(im, 40, 200)
    expect(countNonZero(c2.edges)).toBeGreaterThanOrEqual(countNonZero(c1.edges))
    const sq = g(30, 30, (x, y) => (x >= 10 && x < 20 && y >= 10 && y < 20 ? 200 : 0))
    const e = canny(sq, 50, 100, 1).edges
    // karenin bir satırında yalnız iki kenar pikseli (sol ve sağ)
    let row = 0; for (let x = 0; x < 30; x++) if (e.data[15 * 30 + x]) row++
    expect(row).toBe(2)
  })
  it('açma tuz gürültüsünü siler, kapama delikleri doldurur', () => {
    const bin = threshold(toGray(coinsScene()), 128)
    const opened = morphology(bin, 'open', 'ellipse', 3)
    expect(findContours(opened, 0).length).toBeLessThan(findContours(bin, 0).length)
    const closed = morphology(bin, 'close', 'ellipse', 5)
    expect(countNonZero(closed)).toBeGreaterThan(countNonZero(bin))
  })
})

describe('konturlar', () => {
  it('altı şeklin adını köşe sayısı ve daireselliğe göre bulur', () => {
    const m = threshold(toGray(shapesScene()), 200, true)
    const cs = findContours(m, 200).map((c) => describeContour(c))
    expect(cs.length).toBe(6)
    const names = cs.sort((a, b) => a.cy - b.cy || a.cx - b.cx).map(shapeName)
    expect(new Set(names)).toEqual(new Set(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle']))
  })
  it('alan ve Douglas-Peucker', () => {
    const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }]
    expect(Math.abs(contourArea(sq))).toBe(100)
    const noisy = [...sq.flatMap((p, i) => { const q = sq[(i + 1) % 4]; return [p, { x: (p.x + q.x) / 2 + 0.2, y: (p.y + q.y) / 2 + 0.2 }] })]
    expect(approxPolyDP(noisy, 1).length).toBe(4)
  })
})

describe('geometri', () => {
  it('perspectiveTransform dört noktayı tam eşler', () => {
    const src = [{ x: 10, y: 10 }, { x: 100, y: 20 }, { x: 110, y: 90 }, { x: 5, y: 80 }]
    const dst = [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 150 }, { x: 0, y: 150 }]
    const H = perspectiveTransform(src, dst)!
    src.forEach((p, i) => { const q = applyH(H, p); expect(q.x).toBeCloseTo(dst[i].x, 6); expect(q.y).toBeCloseTo(dst[i].y, 6) })
  })
  it('getRotationMatrix2D merkezi sabit tutar', () => {
    const M = rotationMatrix(50, 40, 33, 1.5)
    const c = applyAffine(M, { x: 50, y: 40 })
    expect(c.x).toBeCloseTo(50, 9); expect(c.y).toBeCloseTo(40, 9)
  })
  it('belge köşelerini 6 px içinde bulur ve düzler', () => {
    const doc = documentScene()
    const r = findDocument(doc)
    expect(r.quad).not.toBeNull()
    orderCorners(DOC_CORNERS).forEach((p, i) => expect(Math.hypot(p.x - r.quad![i].x, p.y - r.quad![i].y)).toBeLessThan(6))
    const { w, h } = quadSize(r.quad!)
    const H = perspectiveTransform(r.quad!, [{ x: 0, y: 0 }, { x: w - 1, y: 0 }, { x: w - 1, y: h - 1 }, { x: 0, y: h - 1 }])!
    const flat = toGray(warpPerspective(doc, H, w, h))
    expect(meanStd(flat).mean).toBeGreaterThan(200) // çoğu beyaz kâğıt
  })
})

describe('öznitelikler', () => {
  it('Harris köşede büyük, düz bölgede ~0, kenarda negatif', () => {
    const im = g(40, 40, (x, y) => (x >= 20 && y >= 20 ? 200 : 0))
    const R = harris(im)
    expect(R.data[20 * 40 + 20]).toBeGreaterThan(0)
    expect(Math.abs(R.data[5 * 40 + 5])).toBeLessThan(1e-6)
    expect(R.data[30 * 40 + 20]).toBeLessThan(0)
    expect(peaks(R, 0.1, 3, 10, 2)[0]).toMatchObject({ x: expect.any(Number) })
  })
  it('döndürülmüş kopyada eşleşmelerin çoğu doğru (RANSAC iç noktaları)', () => {
    const a = blocksScene()
    const M = rotationMatrix(160, 120, 20, 0.9)
    const b = warpAffine(a, M, 320, 240, 'linear', 200)
    const fa = detectAndCompute(toGray(a)), fb = detectAndCompute(toGray(b))
    const ms = match(fa.desc, fb.desc, 0.85)
    expect(ms.length).toBeGreaterThan(8)
    const good = ms.filter((m) => { const q = applyAffine(M, fa.kps[m.i]); return Math.hypot(q.x - fb.kps[m.j].x, q.y - fb.kps[m.j].y) < 4 }).length
    expect(good / ms.length).toBeGreaterThan(0.6)
    const r = ransacH(fa.kps, fb.kps, ms)
    expect(r.inliers.filter(Boolean).length).toBeGreaterThanOrEqual(good * 0.8)
    expect(hamming(fa.desc[0], fa.desc[0])).toBe(0)
  })
})

describe('Haar benzeri kademe', () => {
  it('çizgi yüzü bulur, boş sahnede bulmaz; aşamalar pencereleri eler', () => {
    const d = detect(faceScene())
    const gr = group(d.wins, 2)
    expect(gr.length).toBeGreaterThanOrEqual(1)
    const best = gr.sort((a, b) => b.n - a.n)[0]
    const cx = best.x + best.s / 2, cy = best.y + best.s / 2
    expect(Math.abs(cx - (FACE_BOX.x + FACE_BOX.w / 2))).toBeLessThan(20)
    expect(Math.abs(cy - (FACE_BOX.y + FACE_BOX.h / 2))).toBeLessThan(25)
    expect(d.reached[1]).toBeLessThan(d.reached[0] * 0.5)
    expect(group(detect(fruitScene()).wins, 2).length).toBe(0)
    expect(group(detect(shapesScene()).wins, 2).length).toBe(0)
    expect(FEATURES.length).toBe(3)
  })
  it('integral görüntü ile dikdörtgen toplamı dört okuma', () => {
    const im = g(5, 4, (x, y) => x + y)
    const I = integral(im)
    let s = 0; for (let y = 1; y < 3; y++) for (let x = 2; x < 5; x++) s += x + y
    expect(rectSum(I, 5, 2, 1, 5, 3)).toBe(s)
  })
})

describe('örnek sahneler', () => {
  it('hepsi deterministik ve doğru boyutta', () => {
    for (const id of SAMPLE_IDS) { const a = sample(id), b = sample(id); expect(a.w * a.h * 4).toBe(a.data.length); expect(psnr(a, b)).toBe(Infinity) }
  })
  it('top turuncu: HSV maskesinin merkezi topun merkezinde; ışık yarıya inse de', () => {
    for (const light of [1, 0.55]) {
      const { img, ball } = ballFrame(1.3, light)
      const m = inRangeHsv(img, [5, 120, 60], [22, 255, 255])
      let sx = 0, sy = 0, n = 0
      for (let i = 0; i < m.data.length; i++) if (m.data[i]) { sx += i % m.w; sy += Math.floor(i / m.w); n++ }
      expect(n).toBeGreaterThan(400)
      expect(Math.hypot(sx / n - ball.x, sy / n - ball.y)).toBeLessThan(3)
    }
  })
  it('trafik kareleri arasında yalnız araçlar değişir', () => {
    const a = toGray(trafficFrame(0, 320, 240, 0)), b = toGray(trafficFrame(0.5, 320, 240, 0))
    let diff = 0; for (let i = 0; i < a.data.length; i++) if (Math.abs(a.data[i] - b.data[i]) > 20) diff++
    expect(diff).toBeGreaterThan(500); expect(diff).toBeLessThan(0.25 * a.data.length)
  })
})
