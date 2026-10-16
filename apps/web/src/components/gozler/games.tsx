'use client'
// "Robotun Gözleri" kamera oyunları: yüz ifadesi (FaceLandmarker + blendshapes), taş-kâğıt-makas (GestureRecognizer),
// balon patlatma (PoseLandmarker). Modeller ve wasm /mediapipe altından; görüntü cihazda işlenir, hiçbir yere gönderilmez.
import { useCallback, useEffect, useRef, useState } from 'react'

type L = 'tr' | 'en'
const T = (l: L, tr: string, en: string) => (l === 'en' ? en : tr)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

let filesetP: Promise<{ v: Any; fs: Any }> | null = null
function fileset() {
  filesetP ??= (async () => { const v = await import('@mediapipe/tasks-vision'); const fs = await v.FilesetResolver.forVisionTasks('/mediapipe/wasm'); return { v, fs } })()
  return filesetP
}
async function withDelegate<R>(make: (d: 'GPU' | 'CPU') => Promise<R>): Promise<R> { try { return await make('GPU') } catch { return make('CPU') } }
export async function createModel(kind: 'face' | 'gesture' | 'pose'): Promise<Any> {
  const { v, fs } = await fileset()
  if (kind === 'face') return withDelegate((d) => v.FaceLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: '/mediapipe/face_landmarker.task', delegate: d }, runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true }))
  if (kind === 'gesture') return withDelegate((d) => v.GestureRecognizer.createFromOptions(fs, { baseOptions: { modelAssetPath: '/mediapipe/gesture_recognizer.task', delegate: d }, runningMode: 'VIDEO', numHands: 1 }))
  return withDelegate((d) => v.PoseLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: '/mediapipe/pose_landmarker_lite.task', delegate: d }, runningMode: 'VIDEO', numPoses: 1 }))
}

type Phase = 'idle' | 'loading' | 'on' | 'denied' | 'error'

/** Kamera + model + çizim döngüsü. `frame(ctx, W, H, result, t)` her karede çağrılır (görüntü aynalanmış çizilir). */
function useCameraGame(kind: 'face' | 'gesture' | 'pose', frame: (ctx: CanvasRenderingContext2D, W: number, H: number, res: Any, t: number) => void) {
  const video = useRef<HTMLVideoElement>(null), canvas = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const frameRef = useRef(frame); frameRef.current = frame
  const stopRef = useRef<() => void>(() => undefined)
  const start = useCallback(async () => {
    setPhase('loading')
    let stream: MediaStream
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }) } catch { setPhase('denied'); return }
    try {
      const v = video.current!; v.srcObject = stream; await v.play()
      const model = await createModel(kind)
      setPhase('on')
      const c = canvas.current!, ctx = c.getContext('2d')!
      let raf = 0, lastT = -1
      const tick = () => {
        const W = (c.width = v.videoWidth || 640), H = (c.height = v.videoHeight || 480)
        const now = performance.now()
        let res: Any = null
        if (v.currentTime !== lastT) {
          lastT = v.currentTime
          res = kind === 'gesture' ? model.recognizeForVideo(v, now) : model.detectForVideo(v, now)
        }
        ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0, W, H); ctx.restore()
        frameRef.current(ctx, W, H, res, now / 1000)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      stopRef.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((tr) => tr.stop()); model.close?.() }
    } catch { stream.getTracks().forEach((tr) => tr.stop()); setPhase('error') }
  }, [kind])
  useEffect(() => () => stopRef.current(), [])
  return { video, canvas, phase, start }
}

function CameraShell({ lang, phase, start, video, canvas, children }: { lang: L; phase: Phase; start: () => void; video: React.RefObject<HTMLVideoElement | null>; canvas: React.RefObject<HTMLCanvasElement | null>; children?: React.ReactNode }) {
  return (
    <div className="gz-cam">
      <div className="gz-cam-stage">
        <video ref={video} playsInline muted className="gz-video" />
        <canvas ref={canvas} className="gz-cam-canvas" hidden={phase !== 'on'} />
        {phase !== 'on' && (
          <div className="gz-cam-cover">
            {phase === 'idle' && <><p>{T(lang, '📷 Bu oyun kamerayla oynanır. Görüntün bu cihazdan hiçbir yere gitmez.', '📷 This game uses the camera. Your picture never leaves this device.')}</p><button type="button" className="gz-btn big" onClick={start}>{T(lang, 'Kamerayı aç', 'Turn on camera')}</button></>}
            {phase === 'loading' && <p>{T(lang, 'Robotun gözleri açılıyor…', 'Opening the robot\'s eyes…')}</p>}
            {phase === 'denied' && <><p>{T(lang, 'Kamera izni verilmedi. Tarayıcının adres çubuğundaki kamera simgesinden izin verip yeniden dene.', 'Camera permission was not given. Allow it from the camera icon in the address bar and try again.')}</p><button type="button" className="gz-btn" onClick={start}>{T(lang, 'Yeniden dene', 'Try again')}</button></>}
            {phase === 'error' && <p>{T(lang, 'Kamera ya da model açılamadı. Başka bir tarayıcıyla (Chrome, Edge, Safari) dene.', 'The camera or model could not start. Try another browser (Chrome, Edge, Safari).')}</p>}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill() }

// ---------------------------------------------------------------- Yüz Aynası
const FACES = [
  { k: 'smile', emoji: '😄', tr: 'Gülümse', en: 'Smile' }, { k: 'surprise', emoji: '😮', tr: 'Şaşır', en: 'Look surprised' },
  { k: 'angry', emoji: '😠', tr: 'Kızgın ol', en: 'Look angry' }, { k: 'wink', emoji: '😉', tr: 'Göz kırp', en: 'Wink' },
] as const
type FaceK = (typeof FACES)[number]['k'] | 'neutral'
function readFace(bs: Array<{ categoryName: string; score: number }>): FaceK {
  const s = (n: string) => bs.find((b) => b.categoryName === n)?.score ?? 0
  const blinkL = s('eyeBlinkLeft'), blinkR = s('eyeBlinkRight')
  if ((blinkL > 0.55) !== (blinkR > 0.55) && Math.abs(blinkL - blinkR) > 0.35) return 'wink'
  if (s('jawOpen') > 0.35 && s('browInnerUp') > 0.25) return 'surprise'
  if ((s('mouthSmileLeft') + s('mouthSmileRight')) / 2 > 0.5) return 'smile'
  if ((s('browDownLeft') + s('browDownRight')) / 2 > 0.35) return 'angry'
  return 'neutral'
}
export function FaceMirror({ lang }: { lang: L }) {
  const [now, setNow] = useState<FaceK>('neutral')
  const [target, setTarget] = useState(0)
  const [score, setScore] = useState(0)
  const hold = useRef(0), lastK = useRef<FaceK>('neutral'), tPrev = useRef(0)
  const tgt = FACES[target % FACES.length]
  const g = useCameraGame('face', (ctx, W, H, res, t) => {
    const dt = tPrev.current ? t - tPrev.current : 0; tPrev.current = t
    const lm = res?.faceLandmarks?.[0]
    if (lm) {
      for (let i = 0; i < lm.length; i += 3) dot(ctx, (1 - lm[i].x) * W, lm[i].y * H, 1.6, 'rgba(94,234,212,.9)')
      for (const i of [33, 263, 1, 61, 291, 105, 334]) dot(ctx, (1 - lm[i].x) * W, lm[i].y * H, 4, '#f59e0b')
    }
    if (res) {
      const k = res.faceBlendshapes?.[0] ? readFace(res.faceBlendshapes[0].categories) : 'neutral'
      if (k !== lastK.current) { lastK.current = k; setNow(k) }
      if (k === FACES[target % FACES.length].k) { hold.current += dt; if (hold.current > 0.8) { hold.current = 0; setScore((s) => s + 1); setTarget((x) => x + 1 + Math.floor(Math.random() * 2)) } } else hold.current = Math.max(0, hold.current - dt)
    }
    ctx.fillStyle = 'rgba(15,118,110,.85)'; ctx.fillRect(0, H - 10, W * Math.min(1, hold.current / 0.8), 10)
  })
  const nowF = FACES.find((f) => f.k === now)
  return (
    <CameraShell lang={lang} {...g}>
      <div className="gz-hud">
        <div className="gz-hud-box"><small>{T(lang, 'Robot istiyor', 'Robot wants')}</small><b className="gz-emoji">{tgt.emoji}</b><span>{lang === 'en' ? tgt.en : tgt.tr}</span></div>
        <div className="gz-hud-box"><small>{T(lang, 'Robot görüyor', 'Robot sees')}</small><b className="gz-emoji">{nowF?.emoji ?? '😐'}</b><span>{nowF ? (lang === 'en' ? nowF.en : nowF.tr) : T(lang, 'Sakin', 'Calm')}</span></div>
        <div className="gz-hud-box"><small>{T(lang, 'Puan', 'Score')}</small><b className="gz-emoji">⭐ {score}</b></div>
      </div>
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Taş Kâğıt Makas
const RPS = { Closed_Fist: 0, Open_Palm: 1, Victory: 2 } as const
const RPS_E = ['✊', '✋', '✌️']
const RPS_N: Record<L, string[]> = { tr: ['Taş', 'Kâğıt', 'Makas'], en: ['Rock', 'Paper', 'Scissors'] }
const HAND = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]]
export function RockPaperScissors({ lang }: { lang: L }) {
  const [seen, setSeen] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [round, setRound] = useState<{ me: number | null; bot: number } | null>(null)
  const [score, setScore] = useState({ me: 0, bot: 0 })
  const seenRef = useRef<number | null>(null)
  const g = useCameraGame('gesture', (ctx, W, H, res) => {
    if (!res) return
    const lm = res.landmarks?.[0]
    if (lm) {
      ctx.strokeStyle = 'rgba(250,204,21,.9)'; ctx.lineWidth = 4
      for (const [a, b] of HAND) { ctx.beginPath(); ctx.moveTo((1 - lm[a].x) * W, lm[a].y * H); ctx.lineTo((1 - lm[b].x) * W, lm[b].y * H); ctx.stroke() }
      for (const p of lm) dot(ctx, (1 - p.x) * W, p.y * H, 5, '#0f766e')
    }
    const name = res.gestures?.[0]?.[0]?.categoryName as keyof typeof RPS | undefined
    const v = name && name in RPS ? RPS[name] : null
    if (v !== seenRef.current) { seenRef.current = v; setSeen(v) }
  })
  const play = () => {
    setRound(null); setCount(3)
    let n = 3
    const id = setInterval(() => {
      n--
      if (n > 0) { setCount(n); return }
      clearInterval(id); setCount(null)
      const me = seenRef.current, bot = Math.floor(Math.random() * 3)
      setRound({ me, bot })
      if (me !== null && me !== bot) setScore((s) => ((me - bot + 3) % 3 === 1 ? { ...s, me: s.me + 1 } : { ...s, bot: s.bot + 1 }))
    }, 800)
  }
  const result = round && (round.me === null ? T(lang, 'Elini göremedim 🙈', 'I could not see your hand 🙈') : round.me === round.bot ? T(lang, 'Berabere!', 'Draw!') : (round.me - round.bot + 3) % 3 === 1 ? T(lang, '🎉 Sen kazandın!', '🎉 You win!') : T(lang, '🤖 Robot kazandı!', '🤖 Robot wins!'))
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Senin elin', 'Your hand')}</small><b className="gz-emoji">{count !== null ? count : round ? (round.me !== null ? RPS_E[round.me] : '❓') : seen !== null ? RPS_E[seen] : '…'}</b><span>{seen !== null ? RPS_N[lang][seen] : T(lang, 'el yok', 'no hand')}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Robot', 'Robot')}</small><b className="gz-emoji">{round ? RPS_E[round.bot] : '🤖'}</b><span>{round ? RPS_N[lang][round.bot] : ''}</span></div>
          <div className="gz-hud-box"><small>{T(lang, 'Skor', 'Score')}</small><b className="gz-emoji">{score.me} : {score.bot}</b><span>{result ?? ''}</span></div>
          <button type="button" className="gz-btn big" onClick={play} disabled={count !== null}>{T(lang, 'Oyna', 'Play')}</button>
        </div>
      )}
    </CameraShell>
  )
}

// ---------------------------------------------------------------- Balon Patlat
interface Balloon { x: number; y: number; r: number; c: string; vy: number; pop: number }
const BCOL = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
const BODY = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [11, 23], [12, 24], [23, 24]]
export function BalloonPop({ lang }: { lang: L }) {
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(0)
  const st = useRef({ balloons: [] as Balloon[], spawn: 0, end: 0, prev: 0, running: false, lastLm: null as Any })
  const g = useCameraGame('pose', (ctx, W, H, res, t) => {
    const s = st.current, dt = s.prev ? Math.min(0.05, t - s.prev) : 0; s.prev = t
    if (res) s.lastLm = res.landmarks?.[0] ?? null
    const lm = s.lastLm
    const hands: Array<[number, number]> = []
    if (lm) {
      ctx.strokeStyle = 'rgba(94,234,212,.9)'; ctx.lineWidth = 6
      for (const [a, b] of BODY) { if ((lm[a].visibility ?? 1) < 0.4 || (lm[b].visibility ?? 1) < 0.4) continue; ctx.beginPath(); ctx.moveTo((1 - lm[a].x) * W, lm[a].y * H); ctx.lineTo((1 - lm[b].x) * W, lm[b].y * H); ctx.stroke() }
      for (const i of [15, 16, 19, 20]) { if ((lm[i].visibility ?? 1) < 0.4) continue; const x = (1 - lm[i].x) * W, y = lm[i].y * H; hands.push([x, y]); dot(ctx, x, y, 12, 'rgba(250,204,21,.9)') }
    }
    if (s.running) {
      s.spawn -= dt
      if (s.spawn <= 0) { s.spawn = 0.7; s.balloons.push({ x: 40 + Math.random() * (W - 80), y: H + 40, r: 26 + Math.random() * 14, c: BCOL[Math.floor(Math.random() * BCOL.length)], vy: 70 + Math.random() * 60, pop: 0 }) }
      for (const b of s.balloons) {
        if (b.pop) { b.pop += dt; continue }
        b.y -= b.vy * dt
        if (hands.some(([x, y]) => Math.hypot(x - b.x, y - b.y) < b.r + 14)) { b.pop = 0.001; setScore((v) => v + 1) }
      }
      s.balloons = s.balloons.filter((b) => b.y > -60 && b.pop < 0.35)
      const rem = Math.max(0, s.end - t); setLeft(Math.ceil(rem)); if (rem <= 0) s.running = false
    }
    for (const b of s.balloons) {
      if (b.pop) { ctx.strokeStyle = b.c; ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, r1 = b.r * (0.6 + b.pop * 4); ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * r1 * 0.6, b.y + Math.sin(a) * r1 * 0.6); ctx.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1); ctx.stroke() } continue }
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(b.x, b.y + b.r); ctx.quadraticCurveTo(b.x + 8, b.y + b.r + 25, b.x, b.y + b.r + 45); ctx.stroke()
      const gr = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.4, 2, b.x, b.y, b.r); gr.addColorStop(0, '#ffffffcc'); gr.addColorStop(0.25, b.c); gr.addColorStop(1, b.c)
      ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 0.86, b.r, 0, 0, 7); ctx.fill()
    }
  })
  const begin = () => { const s = st.current; s.balloons = []; s.spawn = 0; s.end = performance.now() / 1000 + 45; s.running = true; setScore(0); setLeft(45) }
  return (
    <CameraShell lang={lang} {...g}>
      {g.phase === 'on' && (
        <div className="gz-hud">
          <div className="gz-hud-box"><small>{T(lang, 'Patlayan balon', 'Balloons popped')}</small><b className="gz-emoji">🎈 {score}</b></div>
          <div className="gz-hud-box"><small>{T(lang, 'Kalan süre', 'Time left')}</small><b className="gz-emoji">⏱ {left}</b></div>
          <button type="button" className="gz-btn big" onClick={begin} disabled={left > 0 && st.current.running}>{left > 0 && st.current.running ? T(lang, 'Oyun sürüyor', 'Playing') : T(lang, 'Başla (45 sn)', 'Start (45 s)')}</button>
        </div>
      )}
    </CameraShell>
  )
}

export const GAME_COMPONENTS = { 'yuz-aynasi': FaceMirror, 'tas-kagit-makas': RockPaperScissors, 'balon-patlat': BalloonPop } as const
