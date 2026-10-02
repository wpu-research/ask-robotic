'use client'
// Oyunu tarayıcıda çalıştıran kanca: oturum, sabit adımlı döngü, klavye, ses, hata durumu.
import { useCallback, useEffect, useRef, useState } from 'react'
import { DT_MS } from '@/lib/oyun/engine'
import { FRAME_BYTES, renderFrame } from '@/lib/oyun/render'
import { OyunSession } from '@/lib/oyun/session'
import { OyunAudio } from '@/lib/oyun/sound'
import { SCREEN_H, SCREEN_W, type Button, type OyunProject } from '@/lib/oyun/types'

export type PlayStatus = 'idle' | 'running' | 'paused' | 'over' | 'error'
export interface PlayError { message: string; blockId?: string | null }

const KEYMAP: Record<string, Button> = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  Space: 'a', KeyZ: 'a', KeyX: 'b', Enter: 'b', ShiftLeft: 'b',
}
const isTyping = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null
  if (!el || !el.tagName) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return !!el.closest?.('.blocklyWidgetDiv, .blocklyDropDownDiv, .oy-pixed, .oy-mapEd, [role="dialog"]')
}

export interface Player {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  status: PlayStatus
  error: PlayError | null
  speed: 1 | 2
  muted: boolean
  /** Çalışırken (oturum varken) hata ve durum güncellemeleri sürer; `frame` her kare artar. */
  setSpeed: (s: 1 | 2) => void
  setMuted: (m: boolean) => void
  /** ▶ / ⏸: boştayken başlatır, çalışırken duraklatır, duraklatılmışken sürdürür. */
  toggle: () => void
  stop: () => void
  restart: () => void
  press: (b: Button) => void
  release: (b: Button) => void
  /** Her (yeniden) başlatmada artar. */
  runId: number
  /** Sahnenin başlangıç görüntüsünü (oyun başlayınca) çizer; çalışmıyorsa. */
  refreshPreview: () => void
}

export function useOyunPlayer(project: OyunProject): Player {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sessionRef = useRef<OyunSession | null>(null)
  const imgRef = useRef<ImageData | null>(null)
  const audioRef = useRef<OyunAudio | null>(null)
  const projectRef = useRef(project)
  projectRef.current = project
  const [status, setStatus] = useState<PlayStatus>('idle')
  const statusRef = useRef<PlayStatus>('idle')
  const [error, setError] = useState<PlayError | null>(null)
  const [speed, setSpeedState] = useState<1 | 2>(1)
  const speedRef = useRef<1 | 2>(1)
  const [muted, setMutedState] = useState(false)
  const [runId, setRunId] = useState(0)

  const setSt = (s: PlayStatus) => { statusRef.current = s; setStatus(s) }
  const audio = (): OyunAudio => (audioRef.current ??= new OyunAudio())

  const draw = useCallback(() => {
    const cv = canvasRef.current
    const s = sessionRef.current
    if (!cv || !s) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    if (!imgRef.current) imgRef.current = ctx.createImageData(SCREEN_W, SCREEN_H)
    const img = imgRef.current
    if (img.data.length !== FRAME_BYTES) return
    renderFrame(s.engine, img.data)
    ctx.putImageData(img, 0, 0)
  }, [])

  const newSession = useCallback((): OyunSession => {
    const seed = (Math.random() * 2 ** 31) >>> 0
    const s = new OyunSession(projectRef.current, { seed, onSound: (e) => audioRef.current?.play(e) })
    sessionRef.current = s
    return s
  }, [])

  const syncError = (s: OyunSession): boolean => {
    if (s.engine.error) { setError({ message: s.engine.error.message, blockId: s.engine.error.blockId }); return true }
    return false
  }

  const refreshPreview = useCallback(() => {
    if (statusRef.current === 'running' || statusRef.current === 'paused') return
    try {
      const s = newSession()
      s.start()
      setError(s.engine.error ? { message: s.engine.error.message, blockId: s.engine.error.blockId } : null)
      draw()
    } catch { /* önizleme çizilemedi */ }
    // boştayken oturumu tutma: motor oyun oynatmak için ▶ ile yeniden kurulur
  }, [draw, newSession])

  const start = useCallback(() => {
    audio().unlock()
    const s = newSession()
    setRunId((n) => n + 1)
    setError(null)
    s.start()
    setSt(syncError(s) ? 'error' : 'running')
    draw()
  }, [draw, newSession])

  const stop = useCallback(() => {
    sessionRef.current?.engine.releaseAll()
    setSt('idle')
    setError(null)
    refreshPreview()
  }, [refreshPreview])

  const toggle = useCallback(() => {
    const st = statusRef.current
    if (st === 'running') { sessionRef.current?.engine.setPaused(true); sessionRef.current?.engine.releaseAll(); setSt('paused'); draw() }
    else if (st === 'paused') { sessionRef.current?.engine.setPaused(false); audio().unlock(); setSt('running') }
    else start()
  }, [draw, start])

  const restart = useCallback(() => { start() }, [start])

  // ---- döngü ----
  useEffect(() => {
    if (status !== 'running') return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const loop = (t: number) => {
      const s = sessionRef.current
      if (!s) return
      acc += Math.min(100, t - last) * speedRef.current
      last = t
      let n = 0
      while (acc >= DT_MS && n < 8) { s.engine.tick(); acc -= DT_MS; n++; if (s.engine.error || s.engine.isOver) break }
      if (n === 8) acc = 0
      draw()
      if (syncError(s)) { setSt('error'); return }
      if (s.engine.isOver) { setSt('over'); return }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [status, draw])

  // ---- klavye ----
  useEffect(() => {
    const active = status === 'running' || status === 'over' || status === 'paused'
    if (!active) return
    const down = (e: KeyboardEvent) => {
      const b = KEYMAP[e.code]
      if (!b || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if ((e.code === 'Space' || e.code === 'Enter') && (tag === 'BUTTON' || tag === 'A')) return
      if (statusRef.current === 'over') { if (b === 'a' && !e.repeat) { e.preventDefault(); start() } return }
      if (statusRef.current !== 'running') return
      e.preventDefault()
      sessionRef.current?.engine.press(b)
    }
    const up = (e: KeyboardEvent) => {
      const b = KEYMAP[e.code]
      if (b) sessionRef.current?.engine.release(b)
    }
    const blur = () => sessionRef.current?.engine.releaseAll()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [status, start])

  useEffect(() => () => { audioRef.current?.dispose() }, [])

  return {
    canvasRef, status, error, speed, muted, runId,
    setSpeed: (s) => { speedRef.current = s; setSpeedState(s) },
    setMuted: (m) => { setMutedState(m); audio().muted = m },
    toggle, stop, restart, refreshPreview,
    press: (b) => {
      if (statusRef.current === 'over') { if (b === 'a') start() } else if (statusRef.current === 'running') sessionRef.current?.engine.press(b)
    },
    release: (b) => sessionRef.current?.engine.release(b),
  }
}
