'use client'
// Sahneyi tarayıcıda çalıştıran kanca: oturum, sabit adımlı döngü (30 kare/sn), klavye, fare, ses, hata durumu.
// Oturum Scratch gibi KALICIDIR: yeşil bayrağa art arda basınca sprite konumları ve değişkenler korunur; ↺ ile başa sarılır.
import { useCallback, useEffect, useRef, useState } from 'react'
import { SahneSession } from '@/lib/sahne/session'
import { SahneRenderer, onBitmapLoaded } from '@/lib/sahne/render'
import { SahneAudio } from '@/lib/sahne/sounds'
import { FRAME_MS, STAGE_H, STAGE_W, type SahneProject } from '@/lib/sahne/types'

export type PlayStatus = 'idle' | 'running' | 'stopped'
export interface PlayError { message: string; blockId?: string | null }

const CODE_KEYS: Record<string, string> = { Space: 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
export function keyId(e: KeyboardEvent): string | null {
  if (CODE_KEYS[e.code]) return CODE_KEYS[e.code]
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3).toLowerCase()
  if (/^Digit\d$/.test(e.code)) return e.code.slice(5)
  if (/^Numpad\d$/.test(e.code)) return e.code.slice(6)
  return null
}
const isTyping = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null
  if (!el || !el.tagName) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return !!el.closest?.('.blocklyWidgetDiv, .blocklyDropDownDiv, [role="dialog"]')
}

export interface SpritePatch { x?: number; y?: number; dir?: number; size?: number; visible?: boolean; costume?: number }

export interface Player {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  stageRef: React.RefObject<HTMLDivElement | null>
  status: PlayStatus
  error: PlayError | null
  /** Soru sorulduysa metni (cevap kutusu için). */
  asking: string | null
  muted: boolean
  setMuted: (m: boolean) => void
  /** Her ~100 ms artar; sprite bilgi paneli ve parıltılar yenilensin diye. */
  pulse: number
  /** Çalışan üst düzey blok kimlikleri (seçili hedef). */
  glow: string[]
  /** Çalışırken program değişti: yeni hali için bayrağa basmak gerekir. */
  stale: boolean
  flag: () => void
  stop: () => void
  /** Başa sar: oturumu projeden yeniden kurar. */
  reset: () => void
  answer: (text: string) => void
  runStack: (defId: string, topId: string) => void
  patchSprite: (id: string, patch: SpritePatch) => void
  readout: (id: string) => { x: number; y: number; dir: number; size: number; visible: boolean; costume: number } | null
  /** Sahnedeki sprite'ı sürükle/tıkla işlemleri için tuval olayları. */
  pointer: { onPointerDown: (e: React.PointerEvent) => void; onPointerMove: (e: React.PointerEvent) => void; onPointerUp: (e: React.PointerEvent) => void; onPointerCancel: () => void; onPointerLeave: () => void }
  /** Test/hata ayıklama: etkin oturum. */
  session: () => SahneSession | null
}

export interface PlayerOpts {
  progVer: number
  selectedId: string
  onSelectSprite: (id: string) => void
  onMoveSprite: (id: string, x: number, y: number) => void
}

export function useSahnePlayer(project: SahneProject, opts: PlayerOpts): Player {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const sessRef = useRef<SahneSession | null>(null)
  const sessVer = useRef(-1)
  const rendererRef = useRef<SahneRenderer | null>(null)
  const audioRef = useRef<SahneAudio | null>(null)
  const raf = useRef(0)
  const looping = useRef(false)
  const acc = useRef(0)
  const lastT = useRef(0)
  const idleFrames = useRef(0)
  const frames = useRef(0)
  const statusRef = useRef<PlayStatus>('idle')
  const projectRef = useRef(project); projectRef.current = project
  const optsRef = useRef(opts); optsRef.current = opts
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [error, setError] = useState<PlayError | null>(null)
  const [asking, setAsking] = useState<string | null>(null)
  const [muted, setMutedState] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [glow, setGlow] = useState<string[]>([])
  const [stale, setStale] = useState(false)
  const drag = useRef<{ id: string; ox: number; oy: number; sx: number; sy: number; moved: boolean; hit: string; hitUid: number } | null>(null)

  const setSt = (s: PlayStatus) => { statusRef.current = s; setStatus(s) }
  const audio = (): SahneAudio => (audioRef.current ??= new SahneAudio())
  const renderer = (): SahneRenderer | null => {
    if (!rendererRef.current && canvasRef.current) rendererRef.current = new SahneRenderer(canvasRef.current, 2)
    return rendererRef.current
  }

  const draw = useCallback(() => {
    const s = sessRef.current, r = renderer()
    if (s && r) r.render(s.engine, { highlightId: statusRef.current === 'running' ? null : optsRef.current.selectedId })
  }, [])

  const build = useCallback((): SahneSession => {
    const seed = (Math.random() * 2 ** 31) >>> 0
    const s = new SahneSession(projectRef.current, {
      seed,
      onSound: (p) => audioRef.current?.playSteps(p.steps, p.volume),
      onStopSounds: () => audioRef.current?.stopAll(),
    })
    s.wallMs = 14
    sessRef.current = s
    sessVer.current = optsRef.current.progVer
    rendererRef.current?.resetPen()
    setError(null)
    setAsking(null)
    setStale(false)
    return s
  }, [])

  const ensure = useCallback((): SahneSession => {
    const s = sessRef.current
    if (s && sessVer.current === optsRef.current.progVer && s.project !== undefined) return s
    return build()
  }, [build])

  /** Çalışırken (bayat da olsa) var olan oturumu kullanır: tuş ve fare olayları oturumu değiştirmesin. */
  const live = useCallback((): SahneSession => (sessRef.current && statusRef.current === 'running' ? sessRef.current : ensure()), [ensure])

  const syncUi = useCallback(() => {
    const s = sessRef.current
    if (!s) return
    setPulse((n) => n + 1)
    setAsking(s.engine.asking ? s.engine.asking.text : null)
    setGlow(s.interp.runningTopIds(optsRef.current.selectedId))
  }, [])

  const loop = useCallback(() => {
    if (looping.current) return
    looping.current = true
    lastT.current = performance.now()
    acc.current = 0
    const step = (t: number) => {
      const s = sessRef.current
      if (!s) { looping.current = false; return }
      acc.current += Math.min(100, t - lastT.current)
      lastT.current = t
      let n = 0
      while (acc.current >= FRAME_MS && n < 4) { s.tick(1); acc.current -= FRAME_MS; n++; if (s.error) break }
      if (n === 4) acc.current = 0
      draw()
      frames.current++
      if (frames.current % 3 === 0) syncUi()
      if (s.error) {
        setError({ message: s.error.message, blockId: s.error.blockId })
        s.stop()
        setSt('stopped'); syncUi(); looping.current = false
        return
      }
      if (!s.running && !s.engine.asking) {
        idleFrames.current++
        if (idleFrames.current > 4) { setSt('stopped'); syncUi(); looping.current = false; return }
      } else idleFrames.current = 0
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [draw, syncUi])

  const wake = useCallback(() => { idleFrames.current = 0; if (statusRef.current !== 'running') setSt('running'); loop() }, [loop])

  const flag = useCallback(() => {
    audio().unlock()
    const s = ensure()
    setError(null)
    s.flag()
    wake()
  }, [ensure, wake])

  const stop = useCallback(() => {
    const s = sessRef.current
    cancelAnimationFrame(raf.current); looping.current = false
    if (s) { s.stop(); draw(); syncUi() }
    audioRef.current?.stopAll()
    setSt(s ? 'stopped' : 'idle')
  }, [draw, syncUi])

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current); looping.current = false
    audioRef.current?.stopAll()
    build()
    setSt('idle')
    draw(); syncUi()
  }, [build, draw, syncUi])

  // ---- proje değişince önizleme / bayat işareti ----
  useEffect(() => {
    if (sessVer.current === opts.progVer && sessRef.current) return
    if (statusRef.current === 'running') { setStale(true); return }
    build()
    if (statusRef.current !== 'idle') setSt('idle')
    draw(); syncUi()
  }, [opts.progVer, build, draw, syncUi])
  // ilk kurulum + bitmap yüklenince yeniden çiz
  useEffect(() => {
    if (!sessRef.current) build()
    draw()
    return onBitmapLoaded(() => draw())
  }, [build, draw])
  // seçili hedef değişince çerçeve ve parıltı
  useEffect(() => { draw(); syncUi() }, [opts.selectedId, draw, syncUi])
  // ---- klavye ----
  useEffect(() => {
    const active = (): boolean => statusRef.current === 'running' || document.activeElement === stageRef.current || !!stageRef.current?.contains(document.activeElement)
    const down = (e: KeyboardEvent) => {
      const k = keyId(e)
      if (!k || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target) || !active()) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if ((e.code === 'Space' || e.code === 'Enter') && (tag === 'BUTTON' || tag === 'A')) return
      e.preventDefault()
      const s = live()
      s.press(k)
      wake()
    }
    const up = (e: KeyboardEvent) => { const k = keyId(e); if (k) sessRef.current?.release(k) }
    const blur = () => sessRef.current?.interp.releaseAllKeys()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [live, wake])
  useEffect(() => () => { cancelAnimationFrame(raf.current); looping.current = false; audioRef.current?.dispose() }, [])

  // ---- fare ----
  const toStage = (e: React.PointerEvent): { x: number; y: number } => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * STAGE_W - STAGE_W / 2, y: STAGE_H / 2 - ((e.clientY - r.top) / r.height) * STAGE_H }
  }
  const pointer: Player['pointer'] = {
    onPointerDown: (e) => {
      e.preventDefault()
      stageRef.current?.focus({ preventScroll: true })
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      const p = toStage(e)
      const s = live()
      s.moveMouse(p.x, p.y)
      s.mouseDown(true)
      const hit = s.engine.spriteAt(p.x, p.y)
      if (hit) {
        const base = s.engine.original(hit.defId)
        optsRef.current.onSelectSprite(hit.defId)
        drag.current = { id: hit.defId, ox: base ? p.x - base.x : 0, oy: base ? p.y - base.y : 0, sx: e.clientX, sy: e.clientY, moved: false, hit: hit.defId, hitUid: hit.uid }
      } else drag.current = null
      wake()
    },
    onPointerMove: (e) => {
      const s = sessRef.current
      if (!s) return
      const p = toStage(e)
      s.moveMouse(p.x, p.y)
      const d = drag.current
      if (d) {
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) d.moved = true
        const t = s.engine.original(d.id)
        if (d.moved && t && !s.engine.targets.find((x) => x.uid === d.hitUid)?.isClone) { s.engine.setXY(t, p.x - d.ox, p.y - d.oy); draw() }
      }
      if (statusRef.current !== 'running') draw()
    },
    onPointerUp: (e) => {
      const s = sessRef.current
      const d = drag.current
      drag.current = null
      if (!s) return
      s.mouseDown(false)
      if (d) {
        const t = s.engine.original(d.id)
        if (d.moved && t) optsRef.current.onMoveSprite(d.id, Math.round(t.x), Math.round(t.y))
        else {
          const target = s.engine.targets.find((x) => x.uid === d.hitUid) ?? t
          if (target) { s.interp.click(target); wake() }
        }
      }
      void e
    },
    onPointerCancel: () => { drag.current = null; sessRef.current?.mouseDown(false) },
    onPointerLeave: () => { /* fare sahne dışında: son konumu korunur */ },
  }

  return {
    canvasRef, stageRef, status, error, asking, muted, pulse, glow, stale,
    setMuted: (m) => { setMutedState(m); audio().muted = m; if (m) audioRef.current?.stopAll() },
    flag, stop, reset,
    answer: (text) => { sessRef.current?.answer(text); wake() },
    runStack: (defId, topId) => {
      const s = live()
      const t = s.engine.instances(defId)[0]
      if (t && s.interp.runStack(t, topId)) wake()
    },
    patchSprite: (id, patch) => {
      const s = sessRef.current
      const t = s?.engine.original(id)
      if (!s || !t) return
      if (patch.x !== undefined || patch.y !== undefined) s.engine.setXY(t, patch.x ?? t.x, patch.y ?? t.y)
      if (patch.dir !== undefined) s.engine.setDir(t, patch.dir)
      if (patch.size !== undefined) s.engine.setSize(t, patch.size)
      if (patch.visible !== undefined) t.visible = patch.visible
      if (patch.costume !== undefined) t.costume = Math.max(0, Math.min(t.costumes.length - 1, patch.costume))
      draw(); syncUi()
    },
    readout: (id) => {
      const t = sessRef.current?.engine.original(id)
      return t ? { x: t.x, y: t.y, dir: t.dir, size: t.size, visible: t.visible, costume: t.costume } : null
    },
    pointer,
    session: () => sessRef.current,
  }
}
