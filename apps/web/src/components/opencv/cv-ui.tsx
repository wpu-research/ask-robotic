'use client'
// OpenCV dersi oyun alanlarının ortak parçaları: görüntü tuvali, kaydırıcı/seçim denetimleri, histogram ve görüntü kaynağı
// (örnek sahne, yüklenen fotoğraf ya da kameradan alınan kare). Görüntü hiçbir yere gönderilmez; her şey tarayıcıda.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gray as mkGray, grayToRgba, rgba as mkRgba, type Field, type Gray, type Rgba } from '@/lib/opencv/ops'
import { sample, SAMPLE_IDS, SAMPLE_TEXT, type SampleId } from '@/lib/opencv/samples'

export type L = 'tr' | 'en'
export const tx = (l: L, tr: string, en: string) => (l === 'en' ? en : tr)
export const isGray = (im: Rgba | Gray | Field): im is Gray | Field => im.data.length === im.w * im.h

/** Görüntüyü tuvale çizer; `draw` üstüne kaplama çizmek için (aynı piksel koordinatlarında). */
export function Img({ img, label, draw, onPointer, testId }: {
  img: Rgba | Gray; label?: string; draw?: (ctx: CanvasRenderingContext2D) => void
  onPointer?: (x: number, y: number, kind: 'down' | 'move' | 'up' | 'leave') => void; testId?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width = img.w; c.height = img.h
    const ctx = c.getContext('2d')!
    const im = isGray(img) ? grayToRgba(img) : img
    ctx.putImageData(new ImageData(new Uint8ClampedArray(im.data), im.w, im.h), 0, 0)
    draw?.(ctx)
  }, [img, draw])
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * img.w, ((e.clientY - r.top) / r.height) * img.h] as const
  }
  return (
    <figure className="cv-img">
      <canvas
        ref={ref} className="sim-canvas" data-testid={testId} role="img" aria-label={label}
        onPointerDown={onPointer ? (e) => { e.currentTarget.setPointerCapture(e.pointerId); onPointer(...pos(e), 'down') } : undefined}
        onPointerMove={onPointer ? (e) => onPointer(...pos(e), 'move') : undefined}
        onPointerUp={onPointer ? (e) => onPointer(...pos(e), 'up') : undefined}
        onPointerLeave={onPointer ? (e) => onPointer(...pos(e), 'leave') : undefined}
      />
      {label && <figcaption>{label}</figcaption>}
    </figure>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <label className="sl">
      <span className="sl-h"><span>{label}</span><output>{fmt ? fmt(value) : value}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}
export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<[T, string]>; onChange: (v: T) => void }) {
  return (
    <label className="sl">
      <span className="sl-h"><span>{label}</span></span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
    </label>
  )
}
export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <label className="ck"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />{label}</label>
}
export const Readout = ({ children, testId }: { children: React.ReactNode; testId?: string }) => <div className="readout" data-testid={testId}>{children}</div>

/** Histogram çubukları; `after` verilirse üstüne renkli ikinci histogram; `mark` dikey çizgi (eşik), `curve` 0–1 eğri. */
export function Histogram({ before, after, mark, curve, label }: { before: number[]; after?: number[]; mark?: number; curve?: number[]; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const W = (c.width = 512), H = (c.height = 140), ctx = c.getContext('2d')!
    const css = getComputedStyle(c)
    ctx.clearRect(0, 0, W, H)
    const mx = Math.max(1, ...before, ...(after ?? []))
    const bars = (h: number[], col: string) => { ctx.fillStyle = col; h.forEach((v, i) => { const bh = (v / mx) * (H - 6); ctx.fillRect(i * 2, H - bh, 2, bh) }) }
    bars(before, css.getPropertyValue('--muted') || '#888')
    if (after) { ctx.globalAlpha = 0.75; bars(after, css.getPropertyValue('--primary') || '#36c'); ctx.globalAlpha = 1 }
    if (curve) {
      const m = Math.max(1e-9, ...curve)
      ctx.strokeStyle = '#d33682'; ctx.lineWidth = 2; ctx.beginPath()
      curve.forEach((v, i) => { const y = H - (v / m) * (H - 6); if (i) ctx.lineTo(i * 2, y); else ctx.moveTo(0, y) })
      ctx.stroke()
    }
    if (mark !== undefined) { ctx.strokeStyle = '#dc322f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mark * 2 + 1, 0); ctx.lineTo(mark * 2 + 1, H); ctx.stroke() }
  }, [before, after, mark, curve])
  return <figure className="cv-img cv-hist"><canvas ref={ref} className="sim-canvas" role="img" aria-label={label} /><figcaption>{label}</figcaption></figure>
}

// ---------------------------------------------------------------- görüntü kaynağı
const MAX_W = 320, MAX_H = 240
/** Herhangi bir çizilebilir kaynağı en çok 320×240'a sığdırıp Rgba yapar. */
export function toRgba(srcEl: CanvasImageSource, w0: number, h0: number): Rgba {
  const k = Math.min(1, MAX_W / w0, MAX_H / h0), w = Math.max(8, Math.round(w0 * k)), h = Math.max(8, Math.round(h0 * k))
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(srcEl, 0, 0, w, h)
  const d = ctx.getImageData(0, 0, w, h)
  return { w, h, data: d.data }
}
export type Source = { kind: 'sample'; id: SampleId } | { kind: 'file' | 'camera'; img: Rgba; name: string }

export function useSource(def: SampleId) {
  const [src, setSrc] = useState<Source>({ kind: 'sample', id: def })
  const img = useMemo(() => (src.kind === 'sample' ? sample(src.id) : src.img), [src])
  return { src, setSrc, img }
}

/** Kaynak seçici: örnek sahneler, fotoğraf yükleme ve kameradan tek kare. */
export function SourcePicker({ lang, src, setSrc, samples = SAMPLE_IDS, camera = true }: { lang: L; src: Source; setSrc: (s: Source) => void; samples?: SampleId[]; camera?: boolean }) {
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const onFile = (f: File | undefined) => {
    if (!f) return
    const url = URL.createObjectURL(f), im = new Image()
    im.onload = () => { setSrc({ kind: 'file', img: toRgba(im, im.naturalWidth, im.naturalHeight), name: f.name }); URL.revokeObjectURL(url) }
    im.onerror = () => setErr(tx(lang, 'Görüntü okunamadı.', 'Could not read the image.'))
    im.src = url
  }
  const snap = useCallback(async () => {
    setErr('')
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.srcObject = st
      await v.play()
      await new Promise((r) => setTimeout(r, 600)) // pozlama otursun
      setSrc({ kind: 'camera', img: toRgba(v, v.videoWidth || 640, v.videoHeight || 480), name: tx(lang, 'kamera', 'camera') })
      st.getTracks().forEach((t) => t.stop())
    } catch { setErr(tx(lang, 'Kameraya erişilemedi.', 'Camera not available.')) }
  }, [lang, setSrc])
  const val = src.kind === 'sample' ? src.id : '__own'
  return (
    <div className="cv-src">
      <label className="sl">
        <span className="sl-h"><span>{tx(lang, 'Görüntü', 'Image')}</span></span>
        <select value={val} onChange={(e) => { if (e.target.value !== '__own') setSrc({ kind: 'sample', id: e.target.value as SampleId }) }}>
          {samples.map((id) => <option key={id} value={id}>{SAMPLE_TEXT[id][lang]}</option>)}
          {src.kind !== 'sample' && <option value="__own">{src.name}</option>}
        </select>
      </label>
      <div className="row">
        <button type="button" className="sbtn ghost" onClick={() => fileRef.current?.click()}>{tx(lang, 'Fotoğraf yükle', 'Upload photo')}</button>
        {camera && <button type="button" className="sbtn ghost" onClick={snap}>{tx(lang, 'Kameradan kare', 'Camera frame')}</button>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {err && <p className="cv-err" role="alert">{err}</p>}
    </div>
  )
}

/** Oyun alanı kabuğu: solda görseller, sağda denetimler (ESOF 323 .rb-sim görünümü). */
export function Stage({ children, side }: { children: React.ReactNode; side: React.ReactNode }) {
  return (
    <div className="rb-sim-body">
      <div className="rb-sim-stage">{children}</div>
      <div className="rb-sim-side"><div className="ctrl">{side}</div></div>
    </div>
  )
}
export const Pair = ({ children }: { children: React.ReactNode }) => <div className="cv-pair">{children}</div>

/** Boş gri görüntü (yer tutucu). */
export const blankGray = (w = 320, h = 240): Gray => mkGray(w, h)
export const blankRgba = (w = 320, h = 240): Rgba => mkRgba(w, h)

/** requestAnimationFrame döngüsü (çalışırken); `t` saniye. */
export function useAnim(on: boolean, step: (t: number, dt: number) => void) {
  const ref = useRef(step); ref.current = step
  useEffect(() => {
    if (!on) return
    let raf = 0, last = performance.now()
    const tick = (now: number) => { const dt = Math.min(0.1, (now - last) / 1000); last = now; ref.current(now / 1000, dt); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [on])
}
