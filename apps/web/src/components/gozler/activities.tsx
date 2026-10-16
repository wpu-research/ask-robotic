'use client'
// "Robotun Gözleri" ders etkinlikleri (kamerasız): pikseller, RGB, maske, nesne bulma, kamerayla çizgi izleme, çiz-öğret.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type L = 'tr' | 'en'
const T = (l: L, tr: string, en: string) => (l === 'en' ? en : tr)

// ---------------------------------------------------------------- 1. Pikseller
const PAL = ['#ffffff', '#facc15', '#ef4444', '#3b82f6', '#1f2937']
const PAL_NAME: Record<L, string[]> = { tr: ['beyaz', 'sarı', 'kırmızı', 'mavi', 'siyah'], en: ['white', 'yellow', 'red', 'blue', 'black'] }
const TARGET = [
  '00111100', '01111110', '11411411', '11111111', '12111121', '11222211', '01111110', '00111100',
].map((r) => r.split('').map(Number))

export function Pixels({ lang }: { lang: L }) {
  const [grid, setGrid] = useState(() => TARGET.map((r) => r.map(() => 0)))
  const [pen, setPen] = useState(1)
  const [nums, setNums] = useState(false)
  const down = useRef(false)
  const ok = grid.flat().filter((v, i) => v === TARGET.flat()[i]).length
  const paint = (y: number, x: number) => setGrid((g) => g.map((r, j) => (j === y ? r.map((v, i) => (i === x ? pen : v)) : r)))
  useEffect(() => { const up = () => { down.current = false }; addEventListener('pointerup', up); return () => removeEventListener('pointerup', up) }, [])
  return (
    <div className="gz-act">
      <div className="gz-two">
        <figure className="gz-fig">
          <figcaption>{T(lang, 'Robotun gördüğü sayılar', 'Numbers the robot sees')}</figcaption>
          <div className="gz-grid">{TARGET.flat().map((v, i) => <span key={i} className="gz-cell num">{v}</span>)}</div>
        </figure>
        <figure className="gz-fig">
          <figcaption>{T(lang, 'Senin resmin: boya!', 'Your picture: paint it!')}</figcaption>
          <div className="gz-grid paint" onPointerLeave={() => { down.current = false }}>
            {grid.flatMap((r, y) => r.map((v, x) => (
              <button key={`${x}-${y}`} type="button" className="gz-cell" style={{ background: PAL[v] }} aria-label={`${x + 1},${y + 1}`}
                onPointerDown={(e) => { e.preventDefault(); down.current = true; paint(y, x) }} onPointerEnter={() => { if (down.current) paint(y, x) }}>
                {nums ? v : ''}
              </button>
            )))}
          </div>
        </figure>
      </div>
      <div className="gz-row">
        {PAL.map((c, i) => (
          <button key={c} type="button" className={`gz-swatch ${pen === i ? 'on' : ''}`} style={{ background: c }} onClick={() => setPen(i)} aria-pressed={pen === i}>
            <b>{i}</b><small>{PAL_NAME[lang][i]}</small>
          </button>
        ))}
        <label className="gz-check"><input type="checkbox" checked={nums} onChange={(e) => setNums(e.target.checked)} /> {T(lang, 'Sayıları göster', 'Show numbers')}</label>
        <button type="button" className="gz-btn ghost" onClick={() => setGrid(TARGET.map((r) => r.map(() => 0)))}>{T(lang, 'Temizle', 'Clear')}</button>
      </div>
      <p className={`gz-status ${ok === 64 ? 'win' : ''}`} role="status">{ok === 64 ? T(lang, '🎉 Harika! Robotun resmini sayılardan çizdin.', '🎉 Great! You drew the robot\'s picture from numbers.') : T(lang, `${ok} / 64 piksel doğru`, `${ok} / 64 pixels right`)}</p>
    </div>
  )
}

// ---------------------------------------------------------------- 2. RGB
const COLORS: Array<{ tr: string; en: string; rgb: [number, number, number] }> = [
  { tr: 'sarı', en: 'yellow', rgb: [255, 220, 0] }, { tr: 'mor', en: 'purple', rgb: [140, 40, 200] }, { tr: 'turuncu', en: 'orange', rgb: [255, 140, 0] },
  { tr: 'camgöbeği', en: 'cyan', rgb: [0, 220, 230] }, { tr: 'pembe', en: 'pink', rgb: [255, 105, 180] }, { tr: 'yeşil', en: 'green', rgb: [30, 200, 60] },
  { tr: 'kahverengi', en: 'brown', rgb: [130, 70, 20] }, { tr: 'lacivert', en: 'navy', rgb: [20, 30, 120] }, { tr: 'gri', en: 'grey', rgb: [128, 128, 128] },
]
export function ColorMix({ lang }: { lang: L }) {
  const [rgb, setRgb] = useState<[number, number, number]>([128, 128, 128])
  const [k, setK] = useState(0)
  const [score, setScore] = useState(0)
  const tgt = COLORS[k % COLORS.length]
  const dist = Math.hypot(rgb[0] - tgt.rgb[0], rgb[1] - tgt.rgb[1], rgb[2] - tgt.rgb[2])
  const close = dist < 55
  const hint = useMemo(() => {
    const d = rgb.map((v, i) => tgt.rgb[i] - v)
    const i = d.map(Math.abs).indexOf(Math.max(...d.map(Math.abs)))
    const ch = [T(lang, 'kırmızıyı', 'red'), T(lang, 'yeşili', 'green'), T(lang, 'maviyi', 'blue')][i]
    return d[i] > 0 ? T(lang, `İpucu: ${ch} artır`, `Hint: more ${ch}`) : T(lang, `İpucu: ${ch} azalt`, `Hint: less ${ch}`)
  }, [rgb, tgt, lang])
  return (
    <div className="gz-act">
      <div className="gz-two">
        <div className="gz-colorbox"><span style={{ background: `rgb(${tgt.rgb.join(',')})` }} /><b>{T(lang, `Robot ${tgt.tr} istiyor`, `The robot wants ${tgt.en}`)}</b></div>
        <div className="gz-colorbox"><span style={{ background: `rgb(${rgb.join(',')})` }} /><b>{T(lang, 'Senin rengin', 'Your colour')}: ({rgb.join(', ')})</b></div>
      </div>
      {(['R', 'G', 'B'] as const).map((c, i) => (
        <label key={c} className={`gz-slider ch-${c}`}>
          <span>{[T(lang, 'Kırmızı', 'Red'), T(lang, 'Yeşil', 'Green'), T(lang, 'Mavi', 'Blue')][i]}</span>
          <input type="range" min={0} max={255} value={rgb[i]} onChange={(e) => setRgb((v) => v.map((x, j) => (j === i ? Number(e.target.value) : x)) as [number, number, number])} />
          <output>{rgb[i]}</output>
        </label>
      ))}
      <div className="gz-row">
        <p className={`gz-status ${close ? 'win' : ''}`} role="status">{close ? T(lang, '🎉 Buldun! Robot bu rengi tanıdı.', '🎉 You got it! The robot recognised this colour.') : hint}</p>
        <button type="button" className="gz-btn" disabled={!close} onClick={() => { setScore((s) => s + 1); setK((x) => x + 1) }}>{T(lang, 'Sonraki renk', 'Next colour')} →</button>
        <span className="gz-score">⭐ {score}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- ortak: meyve sahnesi
const SW = 320, SH = 200
interface Obj { x: number; y: number; r: number; c: [number, number, number]; name: string }
function drawScene(ctx: CanvasRenderingContext2D, objs: Obj[], seed = 7) {
  const g = ctx.createLinearGradient(0, 0, SW, SH); g.addColorStop(0, '#d9b88f'); g.addColorStop(1, '#a9825a')
  ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH)
  for (let i = 0; i < 8; i++) { ctx.strokeStyle = 'rgba(90,60,30,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 18 + i * 24); ctx.bezierCurveTo(100, 10 + i * 24, 220, 30 + i * 24, SW, 16 + i * 24); ctx.stroke() }
  for (const o of objs) {
    const rg = ctx.createRadialGradient(o.x - o.r * 0.35, o.y - o.r * 0.35, o.r * 0.1, o.x, o.y, o.r)
    rg.addColorStop(0, `rgb(${o.c.map((v) => Math.min(255, v + 70)).join(',')})`); rg.addColorStop(1, `rgb(${o.c.map((v) => v * 0.7).join(',')})`)
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill()
  }
  // hafif gürültü (gerçek kamera gibi)
  const im = ctx.getImageData(0, 0, SW, SH); let s = seed
  for (let i = 0; i < im.data.length; i += 4) { s = (s * 16807) % 2147483647; const n = ((s % 21) - 10); im.data[i] += n; im.data[i + 1] += n; im.data[i + 2] += n }
  ctx.putImageData(im, 0, 0)
}
function maskOf(src: ImageData, ref: [number, number, number], tol: number): Uint8Array {
  const m = new Uint8Array(SW * SH)
  for (let i = 0; i < m.length; i++) { const d = Math.hypot(src.data[i * 4] - ref[0], src.data[i * 4 + 1] - ref[1], src.data[i * 4 + 2] - ref[2]); m[i] = d < tol ? 1 : 0 }
  return m
}
function drawMask(ctx: CanvasRenderingContext2D, m: Uint8Array) {
  const im = ctx.createImageData(SW, SH)
  for (let i = 0; i < m.length; i++) { const v = m[i] ? 255 : 18; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255 }
  ctx.putImageData(im, 0, 0)
}

// ---------------------------------------------------------------- 3. Eşikleme / maske
const FRUITS: Obj[] = [
  { x: 80, y: 110, r: 38, c: [205, 30, 35], name: 'elma' }, { x: 175, y: 80, r: 30, c: [240, 135, 20], name: 'portakal' },
  { x: 250, y: 130, r: 28, c: [120, 180, 40], name: 'limon' }, { x: 170, y: 160, r: 16, c: [190, 40, 90], name: 'çilek' },
]
export function Threshold({ lang }: { lang: L }) {
  const a = useRef<HTMLCanvasElement>(null), b = useRef<HTMLCanvasElement>(null)
  const [ref, setRef] = useState<[number, number, number] | null>(null)
  const [tol, setTol] = useState(60)
  const [res, setRes] = useState({ apple: 0, other: 0 })
  const img = useRef<ImageData | null>(null)
  useEffect(() => { const ctx = a.current!.getContext('2d', { willReadFrequently: true })!; drawScene(ctx, FRUITS); img.current = ctx.getImageData(0, 0, SW, SH) }, [])
  useEffect(() => {
    const ctx = b.current!.getContext('2d')!
    if (!img.current || !ref) { ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, SW, SH); return }
    const m = maskOf(img.current, ref, tol); drawMask(ctx, m)
    const ap = FRUITS[0]; let inA = 0, totA = 0, out = 0, totO = 0
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const inside = Math.hypot(x - ap.x, y - ap.y) < ap.r - 2; const v = m[y * SW + x]; if (inside) { totA++; inA += v } else { totO++; out += v } }
    setRes({ apple: inA / totA, other: out / totO })
  }, [ref, tol])
  const pick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(); const x = Math.round((e.clientX - r.left) * SW / r.width), y = Math.round((e.clientY - r.top) * SH / r.height)
    const d = img.current!.data, i = (y * SW + x) * 4; setRef([d[i], d[i + 1], d[i + 2]])
  }
  const win = res.apple > 0.85 && res.other < 0.03
  return (
    <div className="gz-act">
      <div className="gz-two">
        <figure className="gz-fig"><figcaption>{T(lang, '1) Bulmak istediğin renge tıkla', '1) Click the colour you want to find')}</figcaption><canvas ref={a} width={SW} height={SH} className="gz-canvas pick" onPointerDown={pick} /></figure>
        <figure className="gz-fig"><figcaption>{T(lang, 'Maske: beyaz = robot seçti', 'Mask: white = the robot picked it')}</figcaption><canvas ref={b} width={SW} height={SH} className="gz-canvas" /></figure>
      </div>
      <label className="gz-slider"><span>{T(lang, '2) Kural ne kadar gevşek?', '2) How loose is the rule?')}</span><input type="range" min={5} max={180} value={tol} onChange={(e) => setTol(Number(e.target.value))} /><output>{tol}</output></label>
      {ref && <div className="gz-row"><span className="gz-chip" style={{ background: `rgb(${ref.join(',')})` }} /><small>{T(lang, 'Seçilen renk', 'Picked colour')}: ({ref.join(', ')})</small></div>}
      <p className={`gz-status ${win ? 'win' : ''}`} role="status">
        {!ref ? T(lang, 'Elmanın üstüne tıklayarak başla.', 'Start by clicking on the apple.')
          : win ? T(lang, '🎉 Mükemmel! Yalnız elma beyaz.', '🎉 Perfect! Only the apple is white.')
            : T(lang, `Elmanın %${Math.round(res.apple * 100)}'i seçildi, başka yerlerin %${(res.other * 100).toFixed(1).replace('.', ',')}'i de seçildi.`, `${Math.round(res.apple * 100)}% of the apple picked, ${(res.other * 100).toFixed(1)}% of other places too.`)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- 4. Top nerede?
export function FindBall({ lang }: { lang: L }) {
  const a = useRef<HTMLCanvasElement>(null), b = useRef<HTMLCanvasElement>(null)
  const ball = useRef({ x: 90, y: 90, vx: 70 })
  const [auto, setAuto] = useState(true)
  const [info, setInfo] = useState({ err: 0, seen: true })
  const drag = useRef(false)
  useEffect(() => {
    let raf = 0, last = performance.now()
    const ca = a.current!.getContext('2d', { willReadFrequently: true })!, cb = b.current!.getContext('2d')!
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (auto && !drag.current) { ball.current.x += ball.current.vx * dt; if (ball.current.x < 30 || ball.current.x > SW - 30) ball.current.vx *= -1 }
      drawScene(ca, [{ x: ball.current.x, y: ball.current.y, r: 22, c: [200, 30, 40], name: 'top' }, { x: 260, y: 160, r: 18, c: [40, 120, 210], name: 'mavi' }], 3)
      const im = ca.getImageData(0, 0, SW, SH); const m = maskOf(im, [205, 50, 55], 70); drawMask(cb, m)
      let n = 0, sx = 0, sy = 0; for (let i = 0; i < m.length; i++) if (m[i]) { n++; sx += i % SW; sy += (i / SW) | 0 }
      if (n > 40) {
        const cx = sx / n, cy = sy / n
        for (const c of [ca, cb]) { c.strokeStyle = '#22c55e'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 10, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx - 16, cy); c.lineTo(cx + 16, cy); c.moveTo(cx, cy - 16); c.lineTo(cx, cy + 16); c.stroke() }
        setInfo({ err: (cx - SW / 2) / (SW / 2), seen: true })
      } else setInfo((s) => ({ ...s, seen: false }))
      cb.strokeStyle = 'rgba(250,204,21,.8)'; cb.setLineDash([4, 4]); cb.beginPath(); cb.moveTo(SW / 2, 0); cb.lineTo(SW / 2, SH); cb.stroke(); cb.setLineDash([])
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [auto])
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return; const r = e.currentTarget.getBoundingClientRect()
    ball.current.x = Math.max(22, Math.min(SW - 22, (e.clientX - r.left) * SW / r.width)); ball.current.y = Math.max(22, Math.min(SH - 22, (e.clientY - r.top) * SH / r.height))
  }
  const ang = info.err * 40
  const where = !info.seen ? T(lang, 'Top görünmüyor 🤔', 'Can\'t see the ball 🤔') : Math.abs(info.err) < 0.1 ? T(lang, 'Tam karşımda! 🎯', 'Right in front of me! 🎯') : info.err < 0 ? T(lang, 'Top solda, sola dönüyorum ⬅️', 'The ball is left, turning left ⬅️') : T(lang, 'Top sağda, sağa dönüyorum ➡️', 'The ball is right, turning right ➡️')
  return (
    <div className="gz-act">
      <div className="gz-two">
        <figure className="gz-fig"><figcaption>{T(lang, 'Kamera: topu sürükle', 'Camera: drag the ball')}</figcaption>
          <canvas ref={a} width={SW} height={SH} className="gz-canvas grab" onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e) }} onPointerMove={move} onPointerUp={() => { drag.current = false }} />
        </figure>
        <figure className="gz-fig"><figcaption>{T(lang, 'Maske ve ortası (yeşil artı)', 'Mask and its middle (green cross)')}</figcaption><canvas ref={b} width={SW} height={SH} className="gz-canvas" /></figure>
      </div>
      <div className="gz-robot-row">
        <svg viewBox="-60 -60 120 90" className="gz-robot-head" aria-hidden="true">
          <g transform={`rotate(${ang})`}>
            <rect x="-34" y="-30" width="68" height="52" rx="14" fill="#0f766e" /><circle cx="-13" cy="-6" r="10" fill="#fff" /><circle cx="13" cy="-6" r="10" fill="#fff" />
            <circle cx={-13 + info.err * 5} cy="-6" r="5" fill="#2a1a12" /><circle cx={13 + info.err * 5} cy="-6" r="5" fill="#2a1a12" /><path d="M-10 10 Q0 16 10 10" stroke="#fff" strokeWidth="3" fill="none" />
            <path d="M0 -30 V-42" stroke="#134e4a" strokeWidth="3" /><circle cy="-46" r="4" fill="#f43f5e" />
          </g>
        </svg>
        <p className="gz-status" role="status">{where}</p>
        <label className="gz-check"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> {T(lang, 'Top kendi gitsin', 'Ball moves by itself')}</label>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 5. Kamerayla çizgi izleme
export function LineCam({ lang }: { lang: L }) {
  const cv = useRef<HTMLCanvasElement>(null), strip = useRef<HTMLCanvasElement>(null)
  const [run, setRun] = useState(false)
  const [power, setPower] = useState(1.6)
  const [speed, setSpeed] = useState(60)
  const [msg, setMsg] = useState('')
  const R = useRef({ x: 0, y: 0, th: 0, laps: 0, dist: 0, lastErr: 0, lost: 0 })
  const W = 480, H = 300
  const track = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#f5efe6'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath()
    for (let i = 0; i <= 200; i++) { const t = (i / 200) * Math.PI * 2; const x = W / 2 + 180 * Math.cos(t) + 25 * Math.cos(3 * t), y = H / 2 + 100 * Math.sin(t) + 20 * Math.sin(2 * t); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }
    ctx.closePath(); ctx.stroke()
  }, [])
  const reset = useCallback(() => { R.current = { x: W / 2 + 205, y: H / 2, th: Math.PI / 2, laps: 0, dist: 0, lastErr: 0, lost: 0 }; setMsg('') }, [])
  useEffect(() => { reset() }, [reset])
  useEffect(() => {
    const ctx = cv.current!.getContext('2d', { willReadFrequently: true })!, sc = strip.current!.getContext('2d')!
    const off = document.createElement('canvas'); off.width = W; off.height = H; const oc = off.getContext('2d', { willReadFrequently: true })!; track(oc)
    const bg = oc.getImageData(0, 0, W, H)
    let raf = 0, last = performance.now()
    const N = 13
    const tick = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000); last = t
      const r = R.current
      // kamera: robotun 22 px önünde, yönüne dik 13 piksellik satır (5 px aralık)
      const fx = Math.cos(r.th), fy = Math.sin(r.th), lx = -fy, ly = fx
      const vals: number[] = []
      for (let i = 0; i < N; i++) { const o = (i - (N - 1) / 2) * 5; const x = Math.round(r.x + fx * 22 + lx * o), y = Math.round(r.y + fy * 22 + ly * o); const k = (Math.max(0, Math.min(H - 1, y)) * W + Math.max(0, Math.min(W - 1, x))) * 4; vals.push(bg.data[k] < 100 ? 1 : 0) }
      const n = vals.reduce((a, b) => a + b, 0)
      const err = n ? vals.reduce((a, v, i) => a + v * (i - (N - 1) / 2), 0) / n / ((N - 1) / 2) : 0
      if (run) {
        // çizgi kaybolursa kısa süre son bildiği yöne dönmeye devam eder (kurtarma); 0,8 sn'de bulamazsa durur
        if (!n) r.lost += dt; else { r.lost = 0; r.lastErr = err }
        if (r.lost > 0.8) { setRun(false); setMsg(T(lang, 'Robot çizgiyi kaybetti! Dönüş gücünü ya da hızı değiştirip yeniden dene.', 'The robot lost the line! Change the turning power or speed and try again.')) }
        else { const e = n ? err : (r.lastErr >= 0 ? 1 : -1); r.th += power * e * dt * 2.5; r.x += fx * speed * dt; r.y += fy * speed * dt; r.dist += speed * dt; if (r.dist > 1050) { r.laps++; r.dist = 0; setMsg(T(lang, `🎉 ${r.laps}. tur tamam!`, `🎉 Lap ${r.laps} done!`)) } }
      }
      ctx.putImageData(bg, 0, 0)
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.th)
      ctx.fillStyle = 'rgba(250,204,21,.35)'; ctx.fillRect(24, -22, 8, 44)
      ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.roundRect(-16, -13, 32, 26, 6); ctx.fill(); ctx.fillStyle = '#2a1a12'; ctx.fillRect(-10, -17, 14, 4); ctx.fillRect(-10, 13, 14, 4)
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(14, 0, 4, 0, 7); ctx.fill(); ctx.restore()
      sc.clearRect(0, 0, 390, 40); vals.forEach((v, i) => { sc.fillStyle = v ? '#1f1f1f' : '#f5efe6'; sc.fillRect(i * 30, 0, 28, 28) })
      sc.fillStyle = '#ef4444'; sc.fillRect(((err + 1) / 2) * (N - 1) * 30 + 12, 30, 6, 10)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, power, speed, track, lang])
  return (
    <div className="gz-act">
      <canvas ref={cv} width={W} height={H} className="gz-canvas wide" />
      <figure className="gz-fig"><figcaption>{T(lang, 'Robotun kamerası (13 piksel): kırmızı = çizginin ortası', 'Robot camera (13 pixels): red = middle of the line')}</figcaption><canvas ref={strip} width={390} height={40} className="gz-strip" /></figure>
      <label className="gz-slider"><span>{T(lang, 'Dönüş gücü', 'Turning power')}</span><input type="range" min={0} max={4} step={0.1} value={power} onChange={(e) => setPower(Number(e.target.value))} /><output>{power.toFixed(1)}</output></label>
      <label className="gz-slider"><span>{T(lang, 'Hız', 'Speed')}</span><input type="range" min={20} max={140} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /><output>{speed}</output></label>
      <div className="gz-row">
        <button type="button" className="gz-btn" onClick={() => { setMsg(''); setRun((r) => !r) }}>{run ? T(lang, 'Dur', 'Stop') : T(lang, '▶ Başlat', '▶ Start')}</button>
        <button type="button" className="gz-btn ghost" onClick={() => { setRun(false); reset() }}>{T(lang, 'Başa al', 'Reset')}</button>
        <p className={`gz-status ${msg.startsWith('🎉') ? 'win' : ''}`} role="status">{msg}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 6. Robot öğreniyor (k-en yakın komşu)
const S16 = 16
function features(c: HTMLCanvasElement): Float32Array | null {
  const ctx = c.getContext('2d', { willReadFrequently: true })!; const d = ctx.getImageData(0, 0, c.width, c.height).data
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 0) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  if (x1 <= x0 || y1 <= y0) return null
  const s = Math.max(x1 - x0, y1 - y0) + 10, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  const t = document.createElement('canvas'); t.width = t.height = S16
  const tc = t.getContext('2d', { willReadFrequently: true })!; tc.drawImage(c, cx - s / 2, cy - s / 2, s, s, 0, 0, S16, S16)
  const td = tc.getImageData(0, 0, S16, S16).data; const f = new Float32Array(S16 * S16)
  for (let i = 0; i < f.length; i++) f[i] = td[i * 4 + 3] / 255
  return f
}
export function Teach({ lang }: { lang: L }) {
  const pad = useRef<HTMLCanvasElement>(null)
  const [names, setNames] = useState<[string, string]>(lang === 'en' ? ['Circle ⭕', 'Cross ❌'] : ['Daire ⭕', 'Çarpı ❌'])
  const [ex, setEx] = useState<Array<{ f: Float32Array; y: 0 | 1; img: string }>>([])
  const [guess, setGuess] = useState<{ y: 0 | 1; votes: number } | null>(null)
  const drawing = useRef(false)
  const clear = () => { const c = pad.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setGuess(null) }
  const predict = useCallback(() => {
    const f = features(pad.current!); if (!f || !ex.some((e) => e.y === 0) || !ex.some((e) => e.y === 1)) { setGuess(null); return }
    const k = Math.min(3, ex.length)
    const near = ex.map((e) => ({ y: e.y, d: e.f.reduce((a, v, i) => a + (v - f[i]) ** 2, 0) })).sort((a, b) => a.d - b.d).slice(0, k)
    const v1 = near.filter((n) => n.y === 1).length
    setGuess(v1 * 2 > k ? { y: 1, votes: v1 / k } : { y: 0, votes: (k - v1) / k })
  }, [ex])
  const teach = (y: 0 | 1) => { const c = pad.current!; const f = features(c); if (!f) return; setEx((a) => [...a, { f, y, img: c.toDataURL() }]); clear() }
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); return [(e.clientX - r.left) * 220 / r.width, (e.clientY - r.top) * 220 / r.height] as const }
  return (
    <div className="gz-act">
      <div className="gz-two">
        <figure className="gz-fig">
          <figcaption>{T(lang, 'Buraya çiz', 'Draw here')}</figcaption>
          <canvas ref={pad} width={220} height={220} className="gz-canvas pad"
            onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const c = e.currentTarget.getContext('2d')!; const [x, y] = pos(e); c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#7a4426'; c.beginPath(); c.moveTo(x, y) }}
            onPointerMove={(e) => { if (!drawing.current) return; const c = e.currentTarget.getContext('2d')!; const [x, y] = pos(e); c.lineTo(x, y); c.stroke() }}
            onPointerUp={() => { drawing.current = false; predict() }} />
          <div className="gz-row">
            <button type="button" className="gz-btn" onClick={() => teach(0)}>{T(lang, `“${names[0]}” diye öğret`, `Teach as “${names[0]}”`)}</button>
            <button type="button" className="gz-btn" onClick={() => teach(1)}>{T(lang, `“${names[1]}” diye öğret`, `Teach as “${names[1]}”`)}</button>
            <button type="button" className="gz-btn ghost" onClick={clear}>{T(lang, 'Sil', 'Erase')}</button>
          </div>
        </figure>
        <div className="gz-learn">
          {([0, 1] as const).map((y) => (
            <div key={y} className="gz-class">
              <input value={names[y]} onChange={(e) => setNames((n) => (y ? [n[0], e.target.value] : [e.target.value, n[1]]))} aria-label={T(lang, 'Sınıf adı', 'Class name')} />
              <div className="gz-thumbs">{ex.filter((e) => e.y === y).map((e, i) => <img key={i} src={e.img} alt="" />)}</div>
              <small>{T(lang, `${ex.filter((e) => e.y === y).length} örnek`, `${ex.filter((e) => e.y === y).length} examples`)}</small>
            </div>
          ))}
          <p className="gz-status big" role="status">
            {guess ? T(lang, `🤖 Bence bu bir ${names[guess.y]} (%${Math.round(guess.votes * 100)} emin)`, `🤖 I think this is a ${names[guess.y]} (${Math.round(guess.votes * 100)}% sure)`)
              : T(lang, 'Önce her iki türden en az bir örnek öğret, sonra yeni bir çizim yap.', 'First teach at least one example of each, then make a new drawing.')}
          </p>
          {ex.length > 0 && <button type="button" className="gz-btn ghost" onClick={() => { setEx([]); setGuess(null) }}>{T(lang, 'Robotun hafızasını sil', 'Wipe the robot\'s memory')}</button>}
        </div>
      </div>
    </div>
  )
}

export const ACTIVITIES = [Pixels, ColorMix, Threshold, FindBall, LineCam, Teach]
