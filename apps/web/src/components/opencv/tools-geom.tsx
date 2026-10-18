'use client'
// OpenCV oyun alanları: afin dönüşüm, perspektif düzeltme, öznitelik eşleştirme, Haar kademesi, canlı yüz (MediaPipe) ve
// bitirme projesinin belge tarayıcı hattı.
import { useCallback, useMemo, useState } from 'react'
import { adaptiveThreshold, gaussianBlur, toGray, type Rgba } from '@/lib/opencv/ops'
import { findDocument, orderCorners, perspectiveTransform, quadSize, rotationMatrix, warpAffine, warpPerspective, type Interp, type Mat3 } from '@/lib/opencv/geom'
import type { P } from '@/lib/opencv/contours'
import { applyAffine } from '@/lib/opencv/geom'
import { detectAndCompute, harris, match, peaks, ransacH } from '@/lib/opencv/features'
import { detect, FEATURES, group, type HaarFeature } from '@/lib/opencv/haar'
import { CameraShell, useCameraGame } from '@/components/gozler/games'
import { Check, Img, Pair, Readout, Select, Slider, SourcePicker, Stage, tx, useSource, type L } from './cv-ui'

const f2 = (v: number) => v.toFixed(2)
const fmtM = (m: number[], cols: number) => Array.from({ length: m.length / cols }, (_, r) => m.slice(r * cols, r * cols + cols).map((v) => v.toFixed(3).padStart(9)).join('')).join('\n')

// ---------------------------------------------------------------- 9a. afin
export function WarpTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('blocks')
  const [ang, setAng] = useState(30), [sc, setSc] = useState(1), [txv, setTx] = useState(0), [tyv, setTy] = useState(0), [interp, setInterp] = useState<Interp>('linear')
  const M = useMemo(() => { const m = rotationMatrix(img.w / 2, img.h / 2, ang, sc); m[2] += txv; m[5] += tyv; return m }, [img, ang, sc, txv, tyv])
  const out = useMemo(() => warpAffine(img, M, img.w, img.h, interp, 0), [img, M, interp])
  const a = sc * Math.cos((ang * Math.PI) / 180), b = sc * Math.sin((ang * Math.PI) / 180)
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Slider label={tx(lang, 'Açı (°, + saat yönü tersi)', 'Angle (°, + counter-clockwise)')} value={ang} min={-180} max={180} onChange={setAng} />
      <Slider label={tx(lang, 'Ölçek', 'Scale')} value={sc} min={0.3} max={2.5} step={0.05} onChange={setSc} fmt={f2} />
      <Slider label="tx" value={txv} min={-120} max={120} onChange={setTx} />
      <Slider label="ty" value={tyv} min={-90} max={90} onChange={setTy} />
      <Select label={tx(lang, 'Ara değerleme', 'Interpolation')} value={interp} onChange={setInterp} options={[['nearest', 'INTER_NEAREST'], ['linear', 'INTER_LINEAR']]} />
      <Readout testId="cv-affine">{`M (2×3)\n${fmtM(M, 3)}\n\nα = s·cosθ = ${a.toFixed(3)}\nβ = s·sinθ = ${b.toFixed(3)}`}</Readout>
    </>}>
      <Pair>
        <Img img={img} label={tx(lang, 'Önce', 'Before')} />
        <Img img={out} label={tx(lang, 'Sonra: warpAffine', 'After: warpAffine')} testId="cv-out" />
      </Pair>
    </Stage>
  )
}

// ---------------------------------------------------------------- 9b. perspektif
const A4 = 1.414
export function PerspectiveTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('document')
  const init = useCallback((im: Rgba): P[] => findDocument(im).quad ?? [{ x: im.w * 0.2, y: im.h * 0.2 }, { x: im.w * 0.8, y: im.h * 0.2 }, { x: im.w * 0.8, y: im.h * 0.8 }, { x: im.w * 0.2, y: im.h * 0.8 }], [])
  const [state, setState] = useState<{ for: Rgba; q: P[] } | null>(null)
  const q = state && state.for === img ? state.q : init(img)
  const [drag, setDrag] = useState(-1), [a4, setA4] = useState(false)
  const setQ = (nq: P[]) => setState({ for: img, q: nq })
  const { out, H } = useMemo(() => {
    const o = orderCorners(q), sz = quadSize(o)
    const w = Math.max(20, Math.min(400, sz.w)), h = a4 ? Math.round(w * A4) : Math.max(20, Math.min(400, sz.h))
    const H = perspectiveTransform(o, [{ x: 0, y: 0 }, { x: w - 1, y: 0 }, { x: w - 1, y: h - 1 }, { x: 0, y: h - 1 }])
    return { out: H ? warpPerspective(img, H, w, h) : img, H }
  }, [img, q, a4])
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const o = orderCorners(q)
    ctx.strokeStyle = '#00e676'; ctx.lineWidth = 2; ctx.beginPath(); o.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke()
    o.forEach((p, i) => { ctx.fillStyle = i === 0 ? '#ff1744' : '#00e676'; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 7); ctx.fill() })
  }, [q])
  const onPointer = (x: number, y: number, k: 'down' | 'move' | 'up' | 'leave') => {
    if (k === 'down') { let bi = -1, bd = 400; q.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; bi = i } }); setDrag(bi) }
    else if (k === 'move' && drag >= 0) setQ(q.map((p, i) => (i === drag ? { x: Math.max(0, Math.min(img.w - 1, x)), y: Math.max(0, Math.min(img.h - 1, y)) } : p)))
    else if (k === 'up' || k === 'leave') setDrag(-1)
  }
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <button type="button" className="sbtn" onClick={() => setQ(init(img))} data-testid="cv-find-corners">{tx(lang, 'Köşeleri bul', 'Find corners')}</button>
      <Check label={tx(lang, 'A4 oranı (1 : 1,414)', 'A4 proportions (1 : 1.414)')} value={a4} onChange={setA4} />
      <Readout testId="cv-homography">{H ? `H (3×3)\n${fmtM(H as unknown as number[], 3)}` : tx(lang, 'Köşeler dejenere: homografi çözülemedi.', 'Degenerate corners: homography could not be solved.')}</Readout>
      <p className="rb-small muted">{tx(lang, 'Köşeleri sürükle. Kırmızı nokta sol üst köşe olarak sıralandı.', 'Drag the corners. The red dot was ordered as the top-left corner.')}</p>
    </>}>
      <Pair>
        <Img img={img} draw={draw} onPointer={onPointer} label={tx(lang, 'Önce: köşeler (sürükle)', 'Before: corners (drag)')} />
        <Img img={out} label={tx(lang, 'Sonra: warpPerspective', 'After: warpPerspective')} testId="cv-out" />
      </Pair>
    </Stage>
  )
}

// ---------------------------------------------------------------- 10. öznitelikler
export function FeaturesTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('blocks')
  const [ang, setAng] = useState(20), [sc, setSc] = useState(0.9), [ratio, setRatio] = useState(0.8), [k, setK] = useState(0.04), [view, setView] = useState<'match' | 'harris'>('match')
  const M = useMemo(() => rotationMatrix(img.w / 2, img.h / 2, ang, sc), [img, ang, sc])
  const img2 = useMemo(() => warpAffine(img, M, img.w, img.h, 'linear', 200), [img, M])
  const fa = useMemo(() => detectAndCompute(toGray(img)), [img]), fb = useMemo(() => detectAndCompute(toGray(img2)), [img2])
  const ms = useMemo(() => match(fa.desc, fb.desc, ratio), [fa, fb, ratio])
  const rs = useMemo(() => ransacH(fa.kps, fb.kps, ms, 300, 3, 1), [fa, fb, ms])
  const truth = ms.filter((m) => { const p = applyAffine(M, fa.kps[m.i]); return Math.hypot(p.x - fb.kps[m.j].x, p.y - fb.kps[m.j].y) < 4 }).length
  const hk = useMemo(() => (view === 'harris' ? peaks(harris(toGray(img), k), 0.01, 4, 150, 3) : []), [img, k, view])
  // yan yana çizim: tek tuvalde iki görüntü
  const both = useMemo<Rgba>(() => {
    const o: Rgba = { w: img.w * 2, h: img.h, data: new Uint8ClampedArray(img.w * 2 * img.h * 4) }
    for (let y = 0; y < img.h; y++) { o.data.set(img.data.subarray(y * img.w * 4, (y + 1) * img.w * 4), y * img.w * 8); o.data.set(img2.data.subarray(y * img.w * 4, (y + 1) * img.w * 4), y * img.w * 8 + img.w * 4) }
    return o
  }, [img, img2])
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    if (view === 'harris') { ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 1.5; for (const p of hk) { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.stroke() } return }
    ctx.lineWidth = 1
    ms.forEach((m, i) => {
      const a = fa.kps[m.i], b = fb.kps[m.j]
      ctx.strokeStyle = rs.inliers[i] ? 'rgba(0,230,118,.9)' : 'rgba(255,23,68,.85)'
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + img.w, b.y); ctx.stroke()
    })
    ctx.strokeStyle = '#ffeb3b'
    for (const p of fa.kps) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 7); ctx.stroke() }
    for (const p of fb.kps) { ctx.beginPath(); ctx.arc(p.x + img.w, p.y, 2.5, 0, 7); ctx.stroke() }
  }, [view, hk, ms, rs, fa, fb, img.w])
  const inl = rs.inliers.filter(Boolean).length
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      <Select label={tx(lang, 'Görünüm', 'View')} value={view} onChange={setView} options={[['match', tx(lang, 'Eşleşmeler (ORB benzeri)', 'Matches (ORB-like)')], ['harris', tx(lang, 'Harris köşeleri', 'Harris corners')]]} />
      {view === 'harris'
        ? <Slider label="Harris k" value={k} min={0.02} max={0.2} step={0.01} onChange={setK} fmt={f2} />
        : <>
          <Slider label={tx(lang, 'İkinci görüntü: açı (°)', 'Second image: angle (°)')} value={ang} min={-90} max={90} onChange={setAng} />
          <Slider label={tx(lang, 'İkinci görüntü: ölçek', 'Second image: scale')} value={sc} min={0.6} max={1.4} step={0.05} onChange={setSc} fmt={f2} />
          <Slider label={tx(lang, 'Oran testi (d₁ < r·d₂)', 'Ratio test (d₁ < r·d₂)')} value={ratio} min={0.5} max={1} step={0.05} onChange={setRatio} fmt={f2} />
        </>}
      <Readout testId="cv-matches">{view === 'harris'
        ? `${tx(lang, 'köşe', 'corners')}: ${hk.length}`
        : `${tx(lang, 'anahtar nokta', 'keypoints')}: ${fa.kps.length} / ${fb.kps.length}\n${tx(lang, 'eşleşme', 'matches')}: ${ms.length}\nRANSAC ${tx(lang, 'iç nokta', 'inliers')}: ${inl} (${ms.length ? Math.round((100 * inl) / ms.length) : 0}%)\n${tx(lang, 'gerçekten doğru', 'actually correct')}: ${truth}`}</Readout>
    </>}>
      <Img img={view === 'harris' ? img : both} draw={draw} label={view === 'harris' ? tx(lang, 'Harris yanıtının yerel en büyükleri', 'Local maxima of the Harris response') : tx(lang, 'Sol: kaynak · Sağ: döndürülmüş kopya. Yeşil: RANSAC iç nokta, kırmızı: aykırı', 'Left: source · Right: rotated copy. Green: RANSAC inlier, red: outlier')} testId="cv-out" />
    </Stage>
  )
}

// ---------------------------------------------------------------- 11a. Haar
export function HaarTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('face')
  const [ths, setThs] = useState(() => FEATURES.map((f) => f.th)), [minN, setMinN] = useState(2), [showAll, setShowAll] = useState(false)
  const feats = useMemo<HaarFeature[]>(() => FEATURES.map((f, i) => ({ ...f, th: ths[i] })), [ths])
  const d = useMemo(() => detect(img, [64, 80, 96, 112, 128], 0.05, feats), [img, feats])
  const gr = useMemo(() => group(d.wins, minN), [d, minN])
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    if (showAll) { ctx.strokeStyle = 'rgba(255,235,59,.45)'; ctx.lineWidth = 1; for (const w of d.wins) ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.s, w.s) }
    for (const w of gr) {
      ctx.strokeStyle = '#00e676'; ctx.lineWidth = 3; ctx.strokeRect(w.x, w.y, w.s, w.s)
      // özniteliklerin dikdörtgenleri: koyu (mavi) ve açık (beyaz)
      for (const f of feats) {
        for (const r of f.dark) { ctx.fillStyle = 'rgba(30,60,255,.25)'; ctx.fillRect(w.x + r[0] * w.s, w.y + r[1] * w.s, (r[2] - r[0]) * w.s, (r[3] - r[1]) * w.s) }
        for (const r of f.light) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(w.x + r[0] * w.s, w.y + r[1] * w.s, (r[2] - r[0]) * w.s, (r[3] - r[1]) * w.s) }
      }
      ctx.fillStyle = '#00e676'; ctx.font = 'bold 12px system-ui'; ctx.fillText(`n=${w.n}`, w.x + 3, w.y + 14)
    }
  }, [d, gr, feats, showAll])
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} />
      {FEATURES.map((f, i) => <Slider key={f.key} label={`${i + 1}. ${f[lang]}`} value={ths[i]} min={0} max={3} step={0.05} onChange={(v) => setThs((t) => t.map((x, j) => (j === i ? v : x)))} fmt={f2} />)}
      <Slider label="minNeighbors" value={minN} min={1} max={8} onChange={setMinN} />
      <Check label={tx(lang, 'Geçen tüm pencereleri göster', 'Show all passing windows')} value={showAll} onChange={setShowAll} />
      <Readout testId="cv-haar">{`${tx(lang, 'denenen pencere', 'windows tested')}: ${d.tested}\n${FEATURES.map((f, i) => `${tx(lang, 'aşama', 'stage')} ${i + 1}: ${d.reached[i]} → ${d.passed[i]}`).join('\n')}\n${tx(lang, 'bulgu (birleşik)', 'detections (merged)')}: ${gr.length}`}</Readout>
    </>}>
      <Img img={img} draw={draw} label={tx(lang, 'Yeşil: birleştirilmiş bulgu; mavi koyu, beyaz açık dikdörtgenler', 'Green: merged detection; blue dark, white light rectangles')} testId="cv-out" />
    </Stage>
  )
}

// ---------------------------------------------------------------- 11b. canlı yüz (MediaPipe, Robotun Gözleri'nden)
export function FaceCamTool({ lang }: { lang: L }) {
  const [info, setInfo] = useState('')
  const frame = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number, res: { faceLandmarks?: Array<Array<{ x: number; y: number }>> } | null) => {
    const lm = res?.faceLandmarks?.[0]
    if (!lm) return
    // görüntü aynalı çizildiği için x = 1 − x
    const xs = lm.map((p) => (1 - p.x) * W), ys = lm.map((p) => p.y * H)
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
    ctx.strokeStyle = '#00e676'; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
    const le = { x: (1 - lm[33].x) * W, y: lm[33].y * H }, re = { x: (1 - lm[263].x) * W, y: lm[263].y * H }
    ctx.fillStyle = '#ffeb3b'; for (const p of [le, re]) { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.fill() }
    const eye = Math.hypot(le.x - re.x, le.y - re.y)
    setInfo(`${tx(lang, 'kutu', 'box')}: ${Math.round(x1 - x0)}×${Math.round(y1 - y0)} px\n${tx(lang, 'göz arası', 'inter-eye')}: ${Math.round(eye)} px\n${tx(lang, 'yaklaşık uzaklık', 'approx. distance')}: ${Math.round((6.3 * 600) / Math.max(1, eye))} cm`)
  }, [lang])
  const { video, canvas, phase, start } = useCameraGame('face', frame)
  return (
    <div className="cv-facecam">
      <CameraShell lang={lang} phase={phase} start={start} video={video} canvas={canvas} />
      <Readout testId="cv-face">{info || tx(lang, 'Kamerayı başlat. Model ve görüntü cihazında kalır.', 'Start the camera. The model and the image stay on your device.')}</Readout>
      <p className="rb-small muted">{tx(lang, 'Uzaklık, ortalama 6,3 cm göz arası ve yaklaşık 600 px odak uzaklığı varsayımıyla kaba bir kestirimdir (iğne deliği kamera modeli).', 'The distance is a rough estimate assuming an average 6.3 cm inter-eye distance and a focal length of about 600 px (pinhole camera model).')}</p>
    </div>
  )
}

// ---------------------------------------------------------------- bitirme: belge tarayıcı hattı
type Stg = 'gray' | 'edges' | 'closed' | 'quad' | 'flat' | 'scan'
export function ScannerTool({ lang }: { lang: L }) {
  const { src, setSrc, img } = useSource('document')
  const [lo, setLo] = useState(50), [hi, setHi] = useState(150), [block, setBlock] = useState(21), [C, setC] = useState(10), [stage, setStage] = useState<Stg>('scan')
  const doc = useMemo(() => findDocument(img, lo, hi), [img, lo, hi])
  const flat = useMemo(() => {
    if (!doc.quad) return null
    const w = 220, h = Math.round(w * A4)
    const H = perspectiveTransform(doc.quad, [{ x: 0, y: 0 }, { x: w - 1, y: 0 }, { x: w - 1, y: h - 1 }, { x: 0, y: h - 1 }]) as Mat3 | null
    return H ? warpPerspective(img, H, w, h) : null
  }, [img, doc])
  const scan = useMemo(() => (flat ? adaptiveThreshold(gaussianBlur(toGray(flat), 3, 0), block, C) : null), [flat, block, C])
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!doc.quad) return
    ctx.strokeStyle = '#00e676'; ctx.lineWidth = 3; ctx.beginPath(); doc.quad.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke()
  }, [doc])
  const stages: Array<[Stg, string]> = [['gray', tx(lang, '1. Gri', '1. Gray')], ['edges', '2. Canny'], ['closed', tx(lang, '3. Genişletme', '3. Dilation')], ['quad', tx(lang, '4. En büyük dörtgen', '4. Largest quadrilateral')], ['flat', tx(lang, '5. Perspektif', '5. Perspective')], ['scan', tx(lang, '6. Uyarlamalı eşik', '6. Adaptive threshold')]]
  const shown = stage === 'gray' ? doc.gray : stage === 'edges' ? doc.edges : stage === 'closed' ? doc.closed : stage === 'quad' ? img : stage === 'flat' ? flat ?? img : scan ?? img
  return (
    <Stage side={<>
      <SourcePicker lang={lang} src={src} setSrc={setSrc} samples={['document', 'page', 'shapes']} />
      <Select label={tx(lang, 'Aşama', 'Stage')} value={stage} onChange={setStage} options={stages} />
      <Slider label={tx(lang, 'Canny alt', 'Canny low')} value={lo} min={10} max={200} step={5} onChange={setLo} />
      <Slider label={tx(lang, 'Canny üst', 'Canny high')} value={hi} min={30} max={400} step={5} onChange={setHi} />
      <Slider label={tx(lang, 'Eşik bloğu', 'Threshold block')} value={block} min={3} max={51} step={2} onChange={setBlock} />
      <Slider label="C" value={C} min={0} max={30} onChange={setC} />
      <Readout testId="cv-scanner">{doc.quad ? `${tx(lang, 'köşeler', 'corners')}:\n${doc.quad.map((p) => `(${Math.round(p.x)}, ${Math.round(p.y)})`).join(' ')}` : tx(lang, 'Dörtgen bulunamadı: eşikleri değiştir ya da köşeleri 9. ünitedeki araçla elle ver.', 'No quadrilateral found: change the thresholds or give the corners by hand with the unit 9 tool.')}</Readout>
    </>}>
      <Pair>
        <Img img={img} draw={draw} label={tx(lang, 'Girdi ve bulunan belge', 'Input and the detected document')} />
        <Img img={shown} label={stages.find((s) => s[0] === stage)![1]} testId="cv-out" />
      </Pair>
    </Stage>
  )
}

