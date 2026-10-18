'use client'
// Gerçek Hayat Demoları: ortak sahne. İki mod: örnek sahne (sentetik, kamerasız) ve canlı kamera (MediaPipe, cihaz içi).
// Döngü requestAnimationFrame'de; çizim her karede, çıkarım (model + karar) en çok INFER_HZ ile ve yavaş cihazda daha seyrek
// (kare atlama). Tuval 640×480 ile sınırlı. Sekme gizlenince ya da sayfadan çıkınca kamera kapanır. Hareket azaltma tercihinde
// örnek sahne kendiliğinden oynamaz ve uyarılar yanıp sönmez.
import { useCallback, useEffect, useRef, useState } from 'react'
import { createModel, type Any } from '@/components/gozler/games'
import type { Pt } from '@/lib/cv-demo-logic'
import { DEMO_TEXT, paramDefaults, type Demo } from '@/lib/cv-demolar'
import { COL, MONO } from './overlay'

export type L = 'tr' | 'en'
export const W = 640, H = 480
const INFER_HZ = 15

export interface Ctx { W: number; H: number; t: number; dt: number; params: Record<string, number>; mode: 'sample' | 'camera'; lang: L; reduced: boolean }
export type Level = 'ok' | 'warn' | 'alert' | 'idle'
export interface Hud { level: Level; label: string; metrics: Array<[string, string]> }
export interface DemoImpl<S> {
  init(): S
  /** Örnek mod: sahneyi çiz, sentetik model çıktısı (noktalar) döndür; piksel demolarında null. */
  scene(ctx: CanvasRenderingContext2D, c: Ctx, s: S): Pt[] | null
  /** Her karede, kaynak (video/sahne) çizildikten sonra (ör. gece modu, rPPG piksel okuma). */
  pre?(ctx: CanvasRenderingContext2D, c: Ctx, s: S): void
  /** Çıkarım adımı: noktalar ya da pikseller → özellikler → kural. */
  infer(ctx: CanvasRenderingContext2D, c: Ctx, s: S, lm: Pt[] | null): void
  /** Her karede kaplama (kutular, bölgeler, sayaçlar). */
  overlay(ctx: CanvasRenderingContext2D, c: Ctx, s: S): void
  hud(s: S, c: Ctx): Hud
  click?(s: S, x: number, y: number, c: Ctx): void
  /** Ek düğmeler (bölge çiz, gece modu, kalibre et…). */
  Controls?: (p: { s: S; lang: L; mode: Ctx['mode']; bump: () => void }) => React.ReactNode
}

type Phase = 'idle' | 'loading' | 'on' | 'denied' | 'error' | 'paused'

/** MediaPipe sonucunu piksel koordinatlı noktalara çevirir (ön kamerada aynalı). */
function toPts(model: Demo['model'], res: Any, mirror: boolean, vw: number, vh: number, fit: { sx: number; sy: number; ox: number; oy: number }): Pt[] | null {
  const raw: Any[] | undefined = model === 'pose' ? res?.landmarks?.[0] : model === 'face' ? res?.faceLandmarks?.[0] : model === 'hand' ? res?.landmarks?.flat() : undefined
  if (!raw?.length) return null
  return raw.map((p: Any) => {
    const x = p.x * vw * fit.sx + fit.ox, y = p.y * vh * fit.sy + fit.oy
    return { x: mirror ? W - x : x, y, visibility: p.visibility ?? 1 }
  })
}

export function DemoHost<S>({ demo, impl, lang }: { demo: Demo; impl: DemoImpl<S>; lang: L }) {
  const T = DEMO_TEXT[lang]
  const canvas = useRef<HTMLCanvasElement>(null), video = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<'sample' | 'camera'>('sample')
  const [phase, setPhase] = useState<Phase>('idle')
  const [params, setParams] = useState<Record<string, number>>(() => paramDefaults(demo))
  const [hud, setHud] = useState<Hud>({ level: 'idle', label: '…', metrics: [] })
  const [playing, setPlaying] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [, setTick] = useState(0)
  const bump = useCallback(() => setTick((x) => x + 1), [])
  const st = useRef<S>(impl.init())
  const live = useRef({ params, mode, playing, reduced, lang })
  live.current = { params, mode, playing, reduced, lang }
  const cam = useRef<{ stream: MediaStream | null; model: Any }>({ stream: null, model: null })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) { setReduced(true); setPlaying(false) }
  }, [])

  const stopCamera = useCallback(() => {
    cam.current.stream?.getTracks().forEach((t) => t.stop())
    cam.current.model?.close?.()
    cam.current = { stream: null, model: null }
    if (video.current) video.current.srcObject = null
  }, [])

  const startCamera = useCallback(async () => {
    setPhase('loading')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: demo.model === 'pixel' ? 'environment' : 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
    } catch { setPhase('denied'); return }
    try {
      const v = video.current!; v.srcObject = stream; await v.play()
      const model = demo.model === 'pixel' ? null : await createModel(demo.model === 'hand' ? 'gesture' : demo.model)
      cam.current = { stream, model }
      st.current = impl.init()
      setPhase('on')
    } catch { stream.getTracks().forEach((t) => t.stop()); setPhase('error') }
  }, [demo.model, impl])

  const switchMode = (m: 'sample' | 'camera') => {
    if (m === mode) return
    stopCamera(); setPhase('idle'); st.current = impl.init(); setMode(m)
  }

  // Sekme gizlenince kamerayı kapat; sayfadan çıkınca da.
  useEffect(() => {
    const onVis = () => { if (document.hidden && cam.current.stream) { stopCamera(); setPhase('paused') } }
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); stopCamera() }
  }, [stopCamera])

  // Ana döngü
  useEffect(() => {
    const c = canvas.current!; const ctx = c.getContext('2d', { willReadFrequently: true })!
    c.width = W; c.height = H
    let raf = 0, prev = performance.now(), sceneT = 0, lastInfer = -1, inferEvery = 1 / INFER_HZ, lastHud = 0
    let frames = 0, infers = 0, fpsT = prev, fps = 0, ihz = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const L = live.current, dtReal = Math.min(0.1, (now - prev) / 1000); prev = now
      const camOn = L.mode === 'camera' && !!cam.current.stream
      const adv = L.mode === 'sample' ? (L.playing ? dtReal : 0) : dtReal
      sceneT += adv
      const t = L.mode === 'sample' ? sceneT : now / 1000
      const cx: Ctx = { W, H, t, dt: adv, params: L.params, mode: L.mode, lang: L.lang, reduced: L.reduced }
      let synth: Pt[] | null = null
      if (L.mode === 'sample') synth = impl.scene(ctx, cx, st.current)
      else if (camOn) {
        const v = video.current!, vw = v.videoWidth || W, vh = v.videoHeight || H
        const k = Math.max(W / vw, H / vh), dw = vw * k, dh = vh * k
        ctx.save()
        if (demo.model !== 'pixel') { ctx.translate(W, 0); ctx.scale(-1, 1) }
        ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh); ctx.restore()
      } else { ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H); return }
      impl.pre?.(ctx, cx, st.current)
      const due = t - lastInfer >= inferEvery || t < lastInfer
      if (due && adv > 0) {
        lastInfer = t
        const t0 = performance.now()
        let lm: Pt[] | null = synth
        if (camOn && cam.current.model) {
          const v = video.current!, vw = v.videoWidth || W, vh = v.videoHeight || H
          const k = Math.max(W / vw, H / vh)
          const res = demo.model === 'hand' ? cam.current.model.recognizeForVideo(v, now) : cam.current.model.detectForVideo(v, now)
          lm = toPts(demo.model, res, true, vw, vh, { sx: k, sy: k, ox: (W - vw * k) / 2, oy: (H - vh * k) / 2 })
        }
        impl.infer(ctx, cx, st.current, lm)
        infers++
        const cost = (performance.now() - t0) / 1000
        // kare atlama: çıkarım pahalıysa daha seyrek çalıştır (en az 4 Hz)
        inferEvery = Math.min(0.25, Math.max(1 / INFER_HZ, cost * 2.5))
      }
      impl.overlay(ctx, cx, st.current)
      frames++
      if (now - fpsT >= 1000) { fps = (frames * 1000) / (now - fpsT); ihz = (infers * 1000) / (now - fpsT); frames = 0; infers = 0; fpsT = now }
      ctx.save(); ctx.font = MONO
      const txt = `${L.mode === 'sample' ? 'SAMPLE' : 'LIVE'} ${W}×${H}  FPS ${fps.toFixed(0)}  INF ${ihz.toFixed(0)} Hz`
      const tw = ctx.measureText(txt).width + 12
      ctx.fillStyle = COL.panel; ctx.fillRect(W - tw - 8, H - 26, tw, 20)
      ctx.fillStyle = L.mode === 'sample' ? '#fbbf24' : '#4ade80'; ctx.textBaseline = 'middle'; ctx.fillText(txt, W - tw - 2, H - 15)
      ctx.restore()
      if (now - lastHud > 250) { lastHud = now; setHud(impl.hud(st.current, cx)) }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [impl, demo.model])

  const onClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!impl.click) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H
    impl.click(st.current, x, y, { W, H, t: 0, dt: 0, params, mode, lang, reduced })
    bump()
  }

  const showCover = mode === 'camera' && phase !== 'on'
  const Controls = impl.Controls
  return (
    <div className="cvd-host">
      <div className="cvd-bar" role="group" aria-label={T.sample + ' / ' + T.camera}>
        <div className="cvd-seg">
          <button type="button" aria-pressed={mode === 'sample'} onClick={() => switchMode('sample')} data-testid="cvd-sample">{T.sample}</button>
          <button type="button" aria-pressed={mode === 'camera'} onClick={() => switchMode('camera')} data-testid="cvd-camera">{T.camera}</button>
        </div>
        {mode === 'sample' && <button type="button" className="btn btn-outline btn-sm" onClick={() => setPlaying((p) => !p)}>{playing ? T.pause : T.play}</button>}
        {mode === 'camera' && phase === 'on' && <button type="button" className="btn btn-outline btn-sm" onClick={() => { stopCamera(); setPhase('idle') }}>{T.stop}</button>}
        {Controls && <Controls s={st.current} lang={lang} mode={mode} bump={bump} />}
      </div>
      <div className="cvd-stage">
        <canvas ref={canvas} className="cvd-canvas" width={W} height={H} onPointerDown={onClick} role="img" aria-label={`${demo[lang].title}: ${hud.label}`} />
        <video ref={video} playsInline muted className="cvd-video" />
        {showCover && (
          <div className="cvd-cover">
            {(phase === 'idle' || phase === 'paused') && <>
              <p>{phase === 'paused' ? T.paused : T.privacy}</p>
              <button type="button" className="btn btn-primary" onClick={startCamera} data-testid="cvd-start">{T.start}</button>
            </>}
            {phase === 'loading' && <p>{T.loading}</p>}
            {phase === 'denied' && <><p>{T.denied}</p><button type="button" className="btn btn-primary" onClick={startCamera}>{T.start}</button></>}
            {phase === 'error' && <p>{T.error}</p>}
          </div>
        )}
      </div>
      {mode === 'sample' && reduced && !playing && <p className="cvd-hint">{T.reduced}</p>}
      <div className="cvd-hud">
        <p className={`cvd-status ${hud.level}`} aria-live="polite"><span className="cvd-dot" aria-hidden="true" />{T.status}: <b>{hud.label}</b></p>
        <dl className="cvd-metrics">{hud.metrics.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </div>
      {demo.params.length > 0 && (
        <fieldset className="cvd-params">
          <legend>{T.params}</legend>
          {demo.params.map((p) => (
            <label key={p.key} className="cvd-param">
              <span>{p[lang]}<b>{params[p.key]}{p.unit ? ` ${lang === 'en' ? unitEn(p.unit) : p.unit}` : ''}</b></span>
              <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key]} onChange={(e) => setParams((x) => ({ ...x, [p.key]: Number(e.target.value) }))} />
            </label>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setParams(paramDefaults(demo))}>{T.reset}</button>
        </fieldset>
      )}
    </div>
  )
}

const unitEn = (u: string) => ({ 'gövde/sn': 'torsos/s', sn: 's', 'km/sa': 'km/h' } as Record<string, string>)[u] ?? u
