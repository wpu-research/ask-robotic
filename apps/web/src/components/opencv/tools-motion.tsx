'use client'
// OpenCV oyun alanları: HSV renk takibi (hareketli top, örnek görüntü ya da canlı kamera) ve arka plan çıkarma ile trafik sayımı.
// Arka plan çıkarma, Gerçek Hayat Demoları'ndaki trafik sayacının fonksiyonlarını (lib/cv-demo-logic) yeniden kullanır.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Track } from '@/lib/cv-demo-logic'
import { counterInit, counterStep, type CounterState } from '@/lib/opencv/traffic'
import { inRangeHsv, morphology, type Gray, type Rgba } from '@/lib/opencv/ops'
import { findContours, describe as describeContour } from '@/lib/opencv/contours'
import { ballFrame, sample, trafficFrame, SAMPLE_TEXT, type SampleId } from '@/lib/opencv/samples'
import { Check, Img, Pair, Readout, Select, Slider, Stage, toRgba, tx, useAnim, type L } from './cv-ui'

// ---------------------------------------------------------------- 8. renk takibi
type CSrc = 'ball' | 'fruit' | 'shapes' | 'camera'
export function ColorTool({ lang }: { lang: L }) {
  const [srcK, setSrcK] = useState<CSrc>('ball')
  const [hLo, setHLo] = useState(5), [hHi, setHHi] = useState(22), [sLo, setSLo] = useState(120), [vLo, setVLo] = useState(80), [light, setLight] = useState(1), [clean, setClean] = useState(true)
  const [play, setPlay] = useState(true)
  const [frame, setFrame] = useState<Rgba>(() => ballFrame(0).img)
  const [camErr, setCamErr] = useState('')
  const trail = useRef<Array<{ x: number; y: number }>>([])
  const tRef = useRef(0)
  const video = useRef<HTMLVideoElement | null>(null)
  const stream = useRef<MediaStream | null>(null)

  useEffect(() => { trail.current = [] }, [srcK])
  useEffect(() => {
    if (srcK === 'fruit' || srcK === 'shapes') setFrame(sample(srcK as SampleId))
    if (srcK === 'ball') setFrame(ballFrame(tRef.current, light).img)
  }, [srcK, light])
  useEffect(() => {
    if (srcK !== 'camera') return
    let alive = true
    ;(async () => {
      try {
        const st = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
        if (!alive) { st.getTracks().forEach((t) => t.stop()); return }
        const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.srcObject = st; await v.play()
        video.current = v; stream.current = st; setCamErr('')
      } catch { setCamErr(tx(lang, 'Kameraya erişilemedi.', 'Camera not available.')) }
    })()
    return () => { alive = false; stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; video.current = null }
  }, [srcK, lang])
  useAnim(play && (srcK === 'ball' || srcK === 'camera'), (_t, dt) => {
    if (srcK === 'ball') { tRef.current += dt; setFrame(ballFrame(tRef.current, light).img) }
    else if (video.current && video.current.videoWidth) setFrame(toRgba(video.current, video.current.videoWidth, video.current.videoHeight))
  })
  const mask = useMemo(() => { const m = inRangeHsv(frame, [hLo, sLo, vLo], [hHi, 255, 255]); return clean ? morphology(morphology(m, 'open', 'ellipse', 3), 'close', 'ellipse', 5) : m }, [frame, hLo, hHi, sLo, vLo, clean])
  const best = useMemo(() => { const cs = findContours(mask, 30).map((c) => describeContour(c)); return cs.sort((a, b) => b.area - a.area)[0] ?? null }, [mask])
  useEffect(() => { if (best) { trail.current.push({ x: best.cx, y: best.cy }); if (trail.current.length > 40) trail.current.shift() } }, [best])
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const tr = trail.current
    ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 2; ctx.beginPath(); tr.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke()
    if (best) { ctx.strokeStyle = '#00e676'; ctx.lineWidth = 2; ctx.strokeRect(best.box.x, best.box.y, best.box.w, best.box.h); ctx.fillStyle = '#00e676'; ctx.beginPath(); ctx.arc(best.cx, best.cy, 3, 0, 7); ctx.fill() }
  }, [best])
  const ratio = (() => { let n = 0; for (const v of mask.data) if (v) n++; return n / mask.data.length })()
  return (
    <Stage side={<>
      <Select label={tx(lang, 'Kaynak', 'Source')} value={srcK} onChange={setSrcK} options={[['ball', tx(lang, 'Hareketli top', 'Moving ball')], ['fruit', SAMPLE_TEXT.fruit[lang]], ['shapes', SAMPLE_TEXT.shapes[lang]], ['camera', tx(lang, 'Canlı kamera', 'Live camera')]]} />
      {(srcK === 'ball' || srcK === 'camera') && <button type="button" className="sbtn ghost" onClick={() => setPlay((p) => !p)}>{play ? tx(lang, 'Duraklat', 'Pause') : tx(lang, 'Oynat', 'Play')}</button>}
      {srcK === 'ball' && <Slider label={tx(lang, 'Sahne ışığı', 'Scene light')} value={light} min={0.3} max={1.2} step={0.05} onChange={setLight} fmt={(v) => v.toFixed(2)} />}
      <Slider label="H min" value={hLo} min={0} max={179} onChange={setHLo} />
      <Slider label="H max" value={hHi} min={0} max={179} onChange={setHHi} />
      <Slider label="S min" value={sLo} min={0} max={255} onChange={setSLo} />
      <Slider label="V min" value={vLo} min={0} max={255} onChange={setVLo} />
      <Check label={tx(lang, 'Maskeyi temizle (açma + kapama)', 'Clean the mask (open + close)')} value={clean} onChange={setClean} />
      {camErr && <p className="cv-err" role="alert">{camErr}</p>}
      <Readout testId="cv-color">{`${tx(lang, 'maske oranı', 'mask ratio')}: ${ratio.toFixed(3)}\n${best ? `${tx(lang, 'merkez', 'centre')}: (${Math.round(best.cx)}, ${Math.round(best.cy)})\n${tx(lang, 'alan', 'area')}: ${Math.round(best.area)}` : tx(lang, 'leke yok', 'no blob')}${hLo > hHi ? `\n${tx(lang, 'sarmalı aralık: H ≥ min ya da H ≤ max', 'wrap-around range: H ≥ min or H ≤ max')}` : ''}`}</Readout>
    </>}>
      <Pair>
        <Img img={frame} draw={draw} label={tx(lang, 'Kare, en büyük leke ve iz', 'Frame, largest blob and trail')} testId="cv-out" />
        <Img img={mask} label={tx(lang, 'inRange maskesi (HSV)', 'inRange mask (HSV)')} />
      </Pair>
    </Stage>
  )
}

// ---------------------------------------------------------------- 12. arka plan çıkarma ve sayım
const W = 320, H = 240, LINE_X = 160
export function BgSubTool({ lang }: { lang: L }) {
  const [alpha, setAlpha] = useState(0.05), [th, setTh] = useState(25), [sel, setSel] = useState(true), [noise, setNoise] = useState(6), [open, setOpen] = useState(true)
  const [play, setPlay] = useState(true)
  const st = useRef<CounterState>(counterInit())
  const blank = (): Gray => ({ w: W, h: H, data: new Uint8ClampedArray(W * H) })
  const [view, setView] = useState<{ frame: Rgba; mask: Gray; bg: Gray; tracks: Track[] }>(() => ({ frame: trafficFrame(0), mask: blank(), bg: blank(), tracks: [] }))
  const reset = () => { st.current = counterInit() }
  const step = (dt: number) => {
    const s = st.current, t = s.t + dt
    const frame = trafficFrame(t, W, H, noise)
    const r = counterStep(s, frame, t, { alpha, th, selective: sel, clean: open, line: LINE_X })
    setView({ frame, mask: r.mask, bg: r.bg, tracks: s.tracks })
  }
  useAnim(play, (_t, dt) => step(dt))
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#ffeb3b'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(LINE_X, 50); ctx.lineTo(LINE_X, 190); ctx.stroke(); ctx.setLineDash([])
    for (const tr of view.tracks) {
      if (tr.miss) continue
      const b = tr.box
      ctx.strokeStyle = tr.counted ? '#00e676' : '#ff5252'; ctx.lineWidth = 2; ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui'; ctx.fillText(`#${tr.id}`, b.x0, b.y0 - 3)
    }
  }, [view])
  const s = st.current
  return (
    <Stage side={<>
      <div className="row">
        <button type="button" className="sbtn ghost" onClick={() => setPlay((p) => !p)}>{play ? tx(lang, 'Duraklat', 'Pause') : tx(lang, 'Oynat', 'Play')}</button>
        <button type="button" className="sbtn ghost" onClick={reset}>{tx(lang, 'Baştan', 'Restart')}</button>
      </div>
      <Slider label={tx(lang, 'Öğrenme oranı α', 'Learning rate α')} value={alpha} min={0.002} max={0.3} step={0.002} onChange={setAlpha} fmt={(v) => v.toFixed(3)} />
      <Slider label={tx(lang, 'Eşik |f − B|', 'Threshold |f − B|')} value={th} min={5} max={80} onChange={setTh} />
      <Slider label={tx(lang, 'Gürültü (σ)', 'Noise (σ)')} value={noise} min={0} max={20} onChange={setNoise} />
      <Check label={tx(lang, 'Seçici güncelleme (ön planda α küçük)', 'Selective update (small α on foreground)')} value={sel} onChange={setSel} />
      <Check label={tx(lang, 'Maskeyi temizle (açma + kapama)', 'Clean the mask (open + close)')} value={open} onChange={setOpen} />
      <Readout testId="cv-count">{`${tx(lang, 'sayım', 'count')} → ${s.lr}   ← ${s.rl}\n${tx(lang, 'gerçek', 'truth')}  → ${s.truthLr}   ← ${s.truthRl}\n${tx(lang, 'aktif iz', 'active tracks')}: ${view.tracks.filter((t) => !t.miss).length}\nt = ${s.t.toFixed(1)} s`}</Readout>
    </>}>
      <Img img={view.frame} draw={draw} label={tx(lang, 'Kare, izler ve sayım çizgisi', 'Frame, tracks and counting line')} testId="cv-out" />
      <Pair>
        <Img img={view.mask} label={tx(lang, 'Ön plan maskesi', 'Foreground mask')} />
        <Img img={view.bg} label={tx(lang, 'Öğrenilen arka plan B', 'Learned background B')} />
      </Pair>
    </Stage>
  )
}
