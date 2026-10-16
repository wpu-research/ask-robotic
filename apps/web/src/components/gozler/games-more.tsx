'use client'
// "Robotun Gözleri" kamera oyunları 4–10: Burun Avcısı, Ağzınla Yakala, Kafa Pinpon (yüz); Parmak Hesabı, Sihirli Fırça,
// Doğru mu Yanlış mı (el); Robotu Taklit Et (vücut). Aynı üç cihaz içi model (games.tsx); mantık lib/gozler-logic.ts'te.
import { useRef, useState } from 'react'
import { classifyPose, countFingers, hit, mathQuestion, mouthOpen, POSES, QUIZ, shuffle, type PoseK } from '@/lib/gozler-logic'
import { BODY, CameraShell, dot, HAND, T, useCameraGame, type Any, type L } from './games'

const ROUND = 45
/** Süreli oyunlar için ortak durum: kalan süre, başlat, her karede `tick(t)` (süre bitti mi). */
function useRound(len = ROUND) {
  const [left, setLeft] = useState(0)
  const r = useRef({ end: 0, running: false, prev: 0 })
  const begin = (t0 = performance.now() / 1000) => { r.current.end = t0 + len; r.current.running = true; setLeft(len) }
  const tick = (t: number) => {
    const s = r.current, dt = s.prev ? Math.min(0.05, t - s.prev) : 0; s.prev = t
    if (s.running) { const rem = Math.max(0, s.end - t); const c = Math.ceil(rem); setLeft((x) => (x === c ? x : c)); if (rem <= 0) s.running = false }
    return dt
  }
  return { left, running: () => r.current.running, begin, tick }
}
const emoji = (ctx: CanvasRenderingContext2D, e: string, x: number, y: number, size: number) => { ctx.font = `${size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y) }
const mx = (p: { x: number }, W: number) => (1 - p.x) * W
function StartBtn({ lang, round, onStart }: { lang: L; round: ReturnType<typeof useRound>; onStart: () => void }) {
  const on = round.running() && round.left > 0
  return <button type="button" className="gz-btn big" onClick={onStart} disabled={on}>{on ? T(lang, 'Oyun sürüyor', 'Playing') : T(lang, `Başla (${ROUND} sn)`, `Start (${ROUND} s)`)}</button>
}
function drawHand(ctx: CanvasRenderingContext2D, lm: Any[], W: number, H: number, c = 'rgba(250,204,21,.9)') {
  ctx.strokeStyle = c; ctx.lineWidth = 4
  for (const [a, b] of HAND) { ctx.beginPath(); ctx.moveTo(mx(lm[a], W), lm[a].y * H); ctx.lineTo(mx(lm[b], W), lm[b].y * H); ctx.stroke() }
  for (const p of lm) dot(ctx, mx(p, W), p.y * H, 5, '#0f766e')
}

// ---------------------------------------------------------------- Burun Avcısı (yüz)
export function NoseCatcher({ lang }: { lang: L }) {
  const [score, setScore] = useState(0)
  const round = useRound()
  const st = useRef({ stars: [] as Array<{ x: number; y: number; life: number; pop: number }>, spawn: 0, lm: null as Any })
  const g = useCameraGame('face', (ctx, W, H, res, t) => {
    const s = st.current, dt = round.tick(t)
    if (res) s.lm = res.faceLandmarks?.[0] ?? null
    const nose = s.lm ? { x: mx(s.lm[1], W), y: s.lm[1].y * H } : null
    if (round.running()) {
      s.spawn -= dt
      if (s.spawn <= 0 && s.stars.filter((x) => !x.pop).length < 3) { s.spawn = 0.9; s.stars.push({ x: 60 + Math.random() * (W - 120), y: 60 + Math.random() * (H - 120), life: 3.5, pop: 0 }) }
      for (const a of s.stars) {
        if (a.pop) { a.pop += dt; continue }
        a.life -= dt
        if (nose && hit(nose.x, nose.y, a.x, a.y, 50)) { a.pop = 0.001; setScore((v) => v + 1) }
      }
      s.stars = s.stars.filter((a) => a.life > 0 && a.pop < 0.4)
    }
    for (const a of s.stars) emoji(ctx, a.pop ? '✨' : '⭐', a.x, a.y, a.pop ? 70 + a.pop * 80 : 56 + Math.sin(t * 6) * 4)
    if (nose) { dot(ctx, nose.x, nose.y, 16, 'rgba(250,204,21,.95)'); dot(ctx, nose.x, nose.y, 6, '#7a4426') }
  })
  const start = () => { st.current.stars = []; st.current.spawn = 0; setScore(0); round.begin() }
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Toplanan yıldız', 'Stars caught')}</small><b className="gz-emoji">⭐ {score}</b></div>
          <div className="gz-hud-box"><small>{T(lang, 'Kalan süre', 'Time left')}</small><b className="gz-emoji">⏱ {round.left}</b></div>
          <StartBtn lang={lang} round={round} onStart={start} />
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Ağzınla Yakala (yüz)
const FRUITS = ['🍎', '🍌', '🍓', '🍇', '🍉', '🍒', '🍐', '🥕']
export function MouthCatch({ lang }: { lang: L }) {
  const [score, setScore] = useState(0)
  const [open, setOpen] = useState(false)
  const round = useRound()
  const st = useRef({ items: [] as Array<{ x: number; y: number; vy: number; e: string; eat: number }>, spawn: 0, lm: null as Any, open: false })
  const g = useCameraGame('face', (ctx, W, H, res, t) => {
    const s = st.current, dt = round.tick(t)
    if (res) {
      s.lm = res.faceLandmarks?.[0] ?? null
      const o = res.faceBlendshapes?.[0] ? mouthOpen(res.faceBlendshapes[0].categories) : false
      if (o !== s.open) { s.open = o; setOpen(o) }
    }
    const mouth = s.lm ? { x: (mx(s.lm[13], W) + mx(s.lm[14], W)) / 2, y: (s.lm[13].y + s.lm[14].y) / 2 * H } : null
    if (round.running()) {
      s.spawn -= dt
      if (s.spawn <= 0) { s.spawn = 0.85; s.items.push({ x: 60 + Math.random() * (W - 120), y: -30, vy: 120 + Math.random() * 90, e: FRUITS[Math.floor(Math.random() * FRUITS.length)], eat: 0 }) }
      for (const f of s.items) {
        if (f.eat) { f.eat += dt; continue }
        f.y += f.vy * dt
        if (mouth && s.open && hit(mouth.x, mouth.y, f.x, f.y, 62)) { f.eat = 0.001; setScore((v) => v + 1) }
      }
      s.items = s.items.filter((f) => f.y < H + 40 && f.eat < 0.35)
    }
    for (const f of s.items) emoji(ctx, f.eat ? '😋' : f.e, f.x, f.y, f.eat ? 64 : 52)
    if (mouth) { ctx.strokeStyle = s.open ? '#22c55e' : 'rgba(255,255,255,.8)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(mouth.x, mouth.y, s.open ? 44 : 30, 0, 7); ctx.stroke() }
  })
  const start = () => { st.current.items = []; st.current.spawn = 0; setScore(0); round.begin() }
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Yenen meyve', 'Fruit eaten')}</small><b className="gz-emoji">🍎 {score}</b></div>
          <div className="gz-hud-box"><small>{T(lang, 'Ağzın', 'Your mouth')}</small><b className="gz-emoji">{open ? '😮' : '🙂'}</b><span>{open ? T(lang, 'açık', 'open') : T(lang, 'kapalı', 'closed')}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Kalan süre', 'Time left')}</small><b className="gz-emoji">⏱ {round.left}</b></div>
          <StartBtn lang={lang} round={round} onStart={start} />
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Kafa Pinpon (yüz)
export function HeadPong({ lang }: { lang: L }) {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [running, setRunning] = useState(false)
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, px: 0.5, lm: null as Any, prev: 0, on: false, lives: 3, wait: 0 })
  const serve = (W: number, H: number) => { const s = st.current; s.x = W / 2; s.y = H * 0.3; const a = (Math.random() - 0.5) * 1.2; s.vx = Math.sin(a) * 260; s.vy = 240; s.wait = 0.8 }
  const g = useCameraGame('face', (ctx, W, H, res, t) => {
    const s = st.current, dt = s.prev ? Math.min(0.04, t - s.prev) : 0; s.prev = t
    if (res) s.lm = res.faceLandmarks?.[0] ?? null
    if (s.lm) s.px += (mx(s.lm[1], W) / W - s.px) * 0.5
    const pw = W * 0.24, py = H - 34, px = s.px * W
    if (s.on) {
      if (!s.x) serve(W, H)
      if (s.wait > 0) s.wait -= dt
      else {
        s.x += s.vx * dt; s.y += s.vy * dt
        if (s.x < 14 || s.x > W - 14) { s.vx = -s.vx; s.x = Math.max(14, Math.min(W - 14, s.x)) }
        if (s.y < 14) { s.vy = Math.abs(s.vy); s.y = 14 }
        if (s.vy > 0 && s.y + 14 >= py - 10 && s.y < py + 10 && Math.abs(s.x - px) < pw / 2 + 10) {
          s.vy = -Math.abs(s.vy) * 1.05; s.vx += ((s.x - px) / pw) * 260; setScore((v) => v + 1)
        }
        if (s.y > H + 20) { s.lives -= 1; setLives(s.lives); if (s.lives <= 0) { s.on = false; setRunning(false) } else serve(W, H) }
      }
      dot(ctx, s.x, s.y, 14, '#f6b73c'); ctx.strokeStyle = '#7a4426'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(s.x, s.y, 14, 0, 7); ctx.stroke()
    }
    ctx.fillStyle = '#ef6f5b'; ctx.beginPath(); ctx.roundRect(px - pw / 2, py - 9, pw, 18, 9); ctx.fill()
    if (s.lm) dot(ctx, mx(s.lm[1], W), s.lm[1].y * H, 9, 'rgba(250,204,21,.95)')
  })
  const start = () => { const s = st.current; s.on = true; s.lives = 3; s.x = 0; setLives(3); setScore(0); setRunning(true) }
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Vuruş', 'Hits')}</small><b className="gz-emoji">🏓 {score}</b></div>
          <div className="gz-hud-box"><small>{T(lang, 'Can', 'Lives')}</small><b className="gz-emoji">{'❤️'.repeat(Math.max(0, lives)) || '💔'}</b></div>
          <button type="button" className="gz-btn big" onClick={start} disabled={running}>{running ? T(lang, 'Oyun sürüyor', 'Playing') : T(lang, 'Başla', 'Start')}</button>
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Parmak Hesabı (el)
export function FingerMath({ lang }: { lang: L }) {
  const [q, setQ] = useState(() => mathQuestion())
  const [seen, setSeen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [ok, setOk] = useState(false)
  const st = useRef({ hold: 0, prev: 0, seen: null as number | null, lm: null as Any, q, cool: 0 })
  st.current.q = q
  const g = useCameraGame('gesture', (ctx, W, H, res, t) => {
    const s = st.current, dt = s.prev ? Math.min(0.05, t - s.prev) : 0; s.prev = t
    if (res) s.lm = res.landmarks?.[0] ?? null
    const n = s.lm ? countFingers(s.lm) : null
    if (n !== s.seen) { s.seen = n; setSeen(n) }
    if (s.lm) drawHand(ctx, s.lm, W, H)
    if (s.cool > 0) { s.cool -= dt; if (s.cool <= 0) { setOk(false); setQ(mathQuestion()) } return }
    if (n !== null && n === s.q.answer) { s.hold += dt; if (s.hold > 1) { s.hold = 0; s.cool = 1.2; setOk(true); setScore((v) => v + 1) } } else s.hold = Math.max(0, s.hold - dt)
    ctx.fillStyle = 'rgba(63,157,90,.9)'; ctx.fillRect(0, H - 10, W * Math.min(1, s.hold), 10)
  })
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Soru', 'Question')}</small><b className="gz-emoji">{q.a} {q.op} {q.b} = {ok ? q.answer : '?'}</b><span>{ok ? T(lang, '🎉 Doğru!', '🎉 Correct!') : T(lang, 'Cevabı parmaklarınla göster', 'Show the answer with your fingers')}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Robot sayıyor', 'Robot counts')}</small><b className="gz-emoji">{seen === null ? '…' : `✋ ${seen}`}</b><span>{seen === null ? T(lang, 'el yok', 'no hand') : ''}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Puan', 'Score')}</small><b className="gz-emoji">⭐ {score}</b></div>
          <button type="button" className="gz-btn" onClick={() => setQ(mathQuestion())}>{T(lang, 'Başka soru', 'Another question')}</button>
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Sihirli Fırça (el)
const INKS = ['#ef6f5b', '#f6b73c', '#3f9d5a', '#4aa3df', '#8a6ad8', '#ffffff']
export function MagicBrush({ lang }: { lang: L }) {
  const [ink, setInk] = useState(0)
  const [mode, setMode] = useState<'draw' | 'move' | 'clear'>('move')
  const st = useRef({ layer: null as HTMLCanvasElement | null, last: null as [number, number] | null, ink: 0, gest: '', vHold: 0, pHold: 0, prev: 0, lm: null as Any, mode: 'move' })
  st.current.ink = ink
  const clear = () => { const l = st.current.layer; l?.getContext('2d')?.clearRect(0, 0, l.width, l.height) }
  const g = useCameraGame('gesture', (ctx, W, H, res, t) => {
    const s = st.current, dt = s.prev ? Math.min(0.05, t - s.prev) : 0; s.prev = t
    if (!s.layer || s.layer.width !== W || s.layer.height !== H) { const c = document.createElement('canvas'); c.width = W; c.height = H; if (s.layer) c.getContext('2d')!.drawImage(s.layer, 0, 0, W, H); s.layer = c }
    if (res) { s.lm = res.landmarks?.[0] ?? null; s.gest = res.gestures?.[0]?.[0]?.categoryName ?? '' }
    const L = s.layer.getContext('2d')!
    const tip = s.lm ? [mx(s.lm[8], W), s.lm[8].y * H] as [number, number] : null
    let m: 'draw' | 'move' | 'clear' = 'move'
    if (tip && s.gest === 'Pointing_Up') {
      m = 'draw'
      if (s.last) { L.strokeStyle = INKS[s.ink]; L.lineWidth = 12; L.lineCap = 'round'; L.beginPath(); L.moveTo(...s.last); L.lineTo(...tip); L.stroke() }
      s.last = tip
    } else s.last = null
    if (s.gest === 'Victory') { s.vHold += dt; if (s.vHold > 0.6) { s.vHold = -0.8; setInk((i) => (i + 1) % INKS.length) } } else if (s.vHold > 0) s.vHold = 0; else s.vHold = Math.min(0, s.vHold + dt)
    if (s.gest === 'Open_Palm') { s.pHold += dt; m = 'clear'; if (s.pHold > 1.2) { s.pHold = 0; L.clearRect(0, 0, W, H) } } else s.pHold = 0
    if (m !== s.mode) { s.mode = m; setMode(m) }
    ctx.drawImage(s.layer, 0, 0)
    if (tip) { dot(ctx, tip[0], tip[1], m === 'draw' ? 10 : 14, m === 'draw' ? INKS[s.ink] : 'rgba(255,255,255,.7)') }
    if (s.pHold > 0) { ctx.fillStyle = 'rgba(239,111,91,.9)'; ctx.fillRect(0, H - 10, W * Math.min(1, s.pHold / 1.2), 10) }
  })
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Fırça', 'Brush')}</small><b className="gz-emoji">{mode === 'draw' ? '☝️' : mode === 'clear' ? '✋' : '🤚'}</b><span>{mode === 'draw' ? T(lang, 'çiziyor', 'drawing') : mode === 'clear' ? T(lang, 'siliniyor…', 'clearing…') : T(lang, 'bekliyor', 'waiting')}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Renk (✌️ değiştirir)', 'Colour (✌️ changes)')}</small>
            <span className="gz-inks">{INKS.map((c, i) => <button key={c} type="button" aria-label={c} aria-pressed={i === ink} onClick={() => setInk(i)} style={{ background: c }} />)}</span>
          </div>
          <button type="button" className="gz-btn" onClick={clear}>{T(lang, 'Temizle', 'Clear')}</button>
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Doğru mu Yanlış mı (el)
export function TrueFalse({ lang }: { lang: L }) {
  const [order, setOrder] = useState(() => shuffle(QUIZ))
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [fb, setFb] = useState<null | boolean>(null)
  const [seen, setSeen] = useState<'up' | 'down' | null>(null)
  const st = useRef({ hold: 0, prev: 0, cool: 0, seen: null as 'up' | 'down' | null, lm: null as Any, i: 0, order })
  st.current.i = i; st.current.order = order
  const done = i >= order.length
  const g = useCameraGame('gesture', (ctx, W, H, res, t) => {
    const s = st.current, dt = s.prev ? Math.min(0.05, t - s.prev) : 0; s.prev = t
    if (res) s.lm = res.landmarks?.[0] ?? null
    const name = res?.gestures?.[0]?.[0]?.categoryName
    const v = res ? (name === 'Thumb_Up' ? 'up' : name === 'Thumb_Down' ? 'down' : null) : s.seen
    if (v !== s.seen) { s.seen = v; setSeen(v) }
    if (s.lm) drawHand(ctx, s.lm, W, H)
    if (s.i >= s.order.length) return
    if (s.cool > 0) { s.cool -= dt; if (s.cool <= 0) { setFb(null); setI((x) => x + 1) } return }
    if (v) {
      s.hold += dt
      if (s.hold > 0.8) { s.hold = 0; s.cool = 1.8; const right = (v === 'up') === s.order[s.i].ok; setFb(right); if (right) setScore((x) => x + 1) }
    } else s.hold = Math.max(0, s.hold - dt)
    ctx.fillStyle = 'rgba(74,163,223,.9)'; ctx.fillRect(0, H - 10, W * Math.min(1, s.hold / 0.8), 10)
  })
  const q = order[Math.min(i, order.length - 1)]
  const again = () => { setOrder(shuffle(QUIZ)); setI(0); setScore(0); setFb(null) }
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box wide">
            <small>{done ? T(lang, 'Bitti!', 'Done!') : T(lang, `Soru ${i + 1} / ${order.length}`, `Question ${i + 1} / ${order.length}`)}</small>
            <span className="gz-q">{done ? T(lang, `${order.length} sorudan ${score} doğru 🎉`, `${score} of ${order.length} correct 🎉`) : lang === 'en' ? q.en : q.tr}</span>
            {fb !== null && <span>{fb ? T(lang, '✔ Doğru bildin!', '✔ You got it!') : T(lang, `✘ Bu ifade ${q.ok ? 'doğru' : 'yanlış'}`, `✘ This one is ${q.ok ? 'true' : 'false'}`)}</span>}
          </div>
          <div className="gz-hud-box"><small>{T(lang, 'Cevabın', 'Your answer')}</small><b className="gz-emoji">{seen === 'up' ? '👍' : seen === 'down' ? '👎' : '…'}</b><span>{seen === 'up' ? T(lang, 'doğru', 'true') : seen === 'down' ? T(lang, 'yanlış', 'false') : ''}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Puan', 'Score')}</small><b className="gz-emoji">⭐ {score}</b></div>
          {done && <button type="button" className="gz-btn big" onClick={again}>{T(lang, 'Yeniden oyna', 'Play again')}</button>}
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Robotu Taklit Et (vücut)
const POSE_INFO: Record<Exclude<PoseK, 'none'>, { e: string; tr: string; en: string }> = {
  'both-up': { e: '🙌', tr: 'İki elini kaldır', en: 'Raise both hands' },
  't-pose': { e: '✈️', tr: 'Uçak ol: kollarını yana aç', en: 'Be a plane: arms out to the sides' },
  'right-up': { e: '🙋', tr: 'Sağ elini kaldır', en: 'Raise your right hand' },
  'left-up': { e: '🙋‍♀️', tr: 'Sol elini kaldır', en: 'Raise your left hand' },
}
export function CopyRobot({ lang }: { lang: L }) {
  const [target, setTarget] = useState<Exclude<PoseK, 'none'>>('both-up')
  const [now, setNow] = useState<PoseK>('none')
  const [score, setScore] = useState(0)
  const round = useRound()
  const st = useRef({ hold: 0, lm: null as Any, now: 'none' as PoseK, target })
  st.current.target = target
  const next = () => setTarget((cur) => { const opts = POSES.filter((p) => p !== cur) as Array<Exclude<PoseK, 'none'>>; return opts[Math.floor(Math.random() * opts.length)] })
  const g = useCameraGame('pose', (ctx, W, H, res, t) => {
    const s = st.current, dt = round.tick(t)
    if (res) s.lm = res.landmarks?.[0] ?? null
    const k = s.lm ? classifyPose(s.lm) : 'none'
    if (k !== s.now) { s.now = k; setNow(k) }
    if (s.lm) {
      ctx.strokeStyle = k === s.target ? '#22c55e' : 'rgba(94,234,212,.9)'; ctx.lineWidth = 7
      for (const [a, b] of BODY) { if ((s.lm[a].visibility ?? 1) < 0.4 || (s.lm[b].visibility ?? 1) < 0.4) continue; ctx.beginPath(); ctx.moveTo(mx(s.lm[a], W), s.lm[a].y * H); ctx.lineTo(mx(s.lm[b], W), s.lm[b].y * H); ctx.stroke() }
      for (const i of [0, 15, 16]) if ((s.lm[i].visibility ?? 1) > 0.4) dot(ctx, mx(s.lm[i], W), s.lm[i].y * H, 10, 'rgba(250,204,21,.95)')
    }
    if (!round.running()) return
    if (k === s.target) { s.hold += dt; if (s.hold > 1) { s.hold = 0; setScore((v) => v + 1); next() } } else s.hold = Math.max(0, s.hold - dt)
    ctx.fillStyle = 'rgba(63,157,90,.9)'; ctx.fillRect(0, H - 10, W * Math.min(1, s.hold), 10)
  })
  const start = () => { setScore(0); next(); round.begin() }
  const tg = POSE_INFO[target], nw = now === 'none' ? null : POSE_INFO[now]
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Robot yapıyor', 'Robot does')}</small><b className="gz-emoji">{tg.e}</b><span>{lang === 'en' ? tg.en : tg.tr}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Robot görüyor', 'Robot sees')}</small><b className="gz-emoji">{nw?.e ?? '🧍'}</b><span>{nw ? (lang === 'en' ? nw.en : nw.tr) : T(lang, 'bekliyor', 'waiting')}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Puan · süre', 'Score · time')}</small><b className="gz-emoji">⭐ {score} · ⏱ {round.left}</b></div>
          <StartBtn lang={lang} round={round} onStart={start} />
        </div>
      )}
    </CameraShell>
  )
}
