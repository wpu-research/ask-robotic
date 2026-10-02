'use client'
// Müzik sahnesi: hedef ve çalınan melodi nota çizgisinde, altta piyano tuşları. Ses WebAudio ile (Synth).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { statsOf, type CopyData, type FreeData, type LevelData } from '@/lib/games/muzik/engine'
import { BEAT_MS, INSTRUMENTS, solfegeOf, type Ev, type MusicState } from '@/lib/games/muzik/notes'
import type { SceneProps } from '@/lib/games/types'
import { Staff, CH_COLOURS } from './staff'
import { Synth } from './synth'

const W = 480, STAFF_H = 128
const KEYS = 21 // Do3 .. Si5 (diyatonik dizin)

function Keyboard({ active }: { active: ReadonlySet<number> }) {
  const kw = W / KEYS
  const keys = Array.from({ length: KEYS }, (_, k) => {
    const oct = 3 + Math.floor(k / 7), idx = k % 7
    const semi = [0, 2, 4, 5, 7, 9, 11][idx]
    return { x: k * kw, midi: 12 * (oct + 1) + semi, idx, oct, name: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'][idx] }
  })
  return (
    <svg viewBox={`0 0 ${W} 58`} role="img" aria-label="Piyano tuşları" style={{ display: 'block', width: '100%', height: 'auto' }}>
      {keys.map((k) => (
        <g key={k.midi}>
          <rect x={k.x + 0.5} y={1} width={kw - 1} height={56} rx={3} fill={active.has(k.midi) ? '#ffd23f' : '#fff'} stroke="#8f98ad" strokeWidth={1} />
          {k.idx === 0 && <text x={k.x + kw / 2} y={52} textAnchor="middle" fontSize={8} fill="#6b7385">Do{k.oct === 3 ? '▼' : k.oct === 5 ? '▲' : ''}</text>}
        </g>
      ))}
      {keys.map((k) => ([0, 1, 3, 4, 5].includes(k.idx) ? (
        <rect key={`b${k.midi}`} x={k.x + kw * 0.68} y={1} width={kw * 0.64} height={34} rx={2} fill="#2a2f3d" />
      ) : null))}
    </svg>
  )
}

export default function Scene({ level, frame, running, speed, outcome }: SceneProps<MusicState>) {
  const data = level.data as LevelData
  const synth = useRef<Synth | null>(null)
  if (!synth.current) synth.current = new Synth()
  const played = useRef(0)
  const base = useRef<number | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const speedRef = useRef(speed); speedRef.current = speed
  const [keys, setKeys] = useState<ReadonlySet<number>>(new Set())
  const [active, setActive] = useState(-1)
  const [tActive, setTActive] = useState(-1)
  const [listening, setListening] = useState(false)

  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = [] }, [])
  const stopAll = useCallback(() => {
    clearTimers(); synth.current?.stopAll()
    setKeys(new Set()); setActive(-1); setTActive(-1); setListening(false)
  }, [clearTimers])

  /** Olayı `startSec` (AudioContext saati) zamanında çalar ve tuş/nota vurgusunu zamanlar. */
  const schedule = useCallback((ev: Ev, idx: number, startSec: number, beatSec: number, who: 'p' | 't') => {
    const sy = synth.current!
    const dur = ev.d * beatSec
    if (ev.p !== null) sy.note(ev.p, startSec, dur * 0.96, ev.i)
    const wait = Math.max(0, (startSec - sy.now) * 1000)
    const on = setTimeout(() => {
      if (ev.p !== null) setKeys((s) => new Set(s).add(ev.p as number))
      who === 'p' ? setActive(idx) : setTActive(idx)
    }, wait)
    const off = setTimeout(() => {
      if (ev.p !== null) setKeys((s) => { const n = new Set(s); n.delete(ev.p as number); return n })
    }, wait + Math.max(60, dur * 1000 * 0.96))
    timers.current.push(on, off)
  }, [])

  // Çalıştırma: motor olayları eklendikçe sesi zamanında çal.
  useEffect(() => {
    const ev = frame.events
    if (ev.length < played.current || (ev.length === 0 && played.current > 0)) { stopAll(); played.current = 0; base.current = null }
    if (ev.length === 0) { base.current = null; return }
    if (ev.length > played.current) {
      const sy = synth.current!
      if (!sy.ensure()) { played.current = ev.length; return }
      const beatSec = BEAT_MS / 1000 / Math.max(0.1, speedRef.current)
      if (base.current === null) base.current = sy.now + 0.06 - ev[played.current].t * beatSec
      for (let i = played.current; i < ev.length; i++) schedule(ev[i], i, Math.max(sy.now + 0.01, base.current + ev[i].t * beatSec), beatSec, 'p')
      played.current = ev.length
      ;(window as unknown as { __musicDebug?: unknown }).__musicDebug = { scheduled: ev.length }
    }
  }, [frame, schedule, stopAll])

  useEffect(() => () => { clearTimers(); synth.current?.close() }, [clearTimers])
  // Seviye değişince sesi kes.
  useEffect(() => { played.current = 0; base.current = null; stopAll() }, [level.id, stopAll])

  const target = data.kind === 'copy' ? (data as CopyData).target : null
  const listen = useCallback(() => {
    if (!target) return
    stopAll()
    const sy = synth.current!
    if (!sy.ensure()) return
    const beatSec = BEAT_MS / 1000 / Math.max(0.1, speedRef.current)
    const t0 = sy.now + 0.08
    target.forEach((e, i) => schedule(e, i, t0 + e.t * beatSec, beatSec, 't'))
    const total = Math.max(...target.map((e) => e.t + e.d))
    setListening(true)
    timers.current.push(setTimeout(() => { setListening(false); setTActive(-1) }, (total * beatSec + 0.4) * 1000))
  }, [schedule, stopAll, target])

  const targetTotal = target ? Math.max(...target.map((e) => e.t + e.d)) : 0
  const beats = Math.max(4, Math.ceil(Math.max(targetTotal, frame.total) / 4) * 4)
  const chCount = useMemo(() => new Set([...(target ?? []), ...frame.events].filter((e) => e.p !== null).map((e) => e.ch)).size, [target, frame.events])
  const free = data.kind === 'free' ? (data as FreeData) : null
  const st = useMemo(() => statsOf(frame.events), [frame.events])
  const instNames = target && (data as CopyData).checkInst ? [...new Set(target.map((e) => e.i))].map((i) => INSTRUMENTS.find((x) => x.id === i)?.label ?? i).join(', ') : null
  const solName = (p: number | null) => (p === null ? '' : solfegeOf(p)?.name ?? '')

  return (
    <div className="mu-scene" data-running={running} data-ok={outcome?.ok ?? undefined} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px', background: 'var(--surface, #fff)', color: 'var(--text, #1d2233)', overflow: 'hidden' }}>
      {target ? (
        <section aria-label="Hedef melodi">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px', minHeight: 34 }}>
            <button type="button" onClick={listening ? stopAll : listen} data-testid="music-listen"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 34, padding: '2px 14px', borderRadius: 999, border: '2px solid #2f7de1', background: listening ? '#2f7de1' : 'transparent', color: listening ? '#fff' : '#2f7de1', font: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />{listening ? <rect x="11" y="5" width="3" height="6" fill="currentColor" /> : <path d="M11 5q2 3 0 6" stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" />}</svg>
              {listening ? 'Durdur' : 'Hedefi dinle'}
            </button>
            <span style={{ fontSize: 12, color: 'var(--muted, #6b7385)' }}>{instNames ? `Enstrüman: ${instNames}` : 'Hedef melodi'}</span>
            {chCount > 1 && <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, fontSize: 11, fontWeight: 700 }}>{Array.from({ length: Math.min(chCount, 4) }, (_, k) => <span key={k} style={{ color: CH_COLOURS[k] }}>● {k + 1}. kanal</span>)}</span>}
          </div>
          <Staff events={target} beats={beats} label="Hedef" activeIndex={tActive} width={W} height={STAFF_H} />
        </section>
      ) : (
        <section aria-label="Besteleme görevi" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted, #6b7385)' }}>Görev</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} data-testid="music-goals">
            {free && ([
              ['nota', st.notes, free.min.notes], ['farklı nota', st.pitches, free.min.pitches], ['kanal', st.channels, free.min.channels], ['enstrüman', st.instruments, free.min.instruments],
            ] as const).map(([lbl, v, need]) => (
              <span key={lbl} data-met={v >= need} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, border: '2px solid', borderColor: v >= need ? '#1fa855' : 'var(--border-strong, #9aa3b5)', color: v >= need ? '#1fa855' : 'var(--muted, #6b7385)' }}>{v >= need ? '✓ ' : ''}{Math.min(v, 99)} / {need} {lbl}</span>
            ))}
          </div>
        </section>
      )}
      <section aria-label="Çalınan melodi">
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted, #6b7385)', minHeight: 18 }}>
          Senin melodin{frame.events.length > 0 ? ` · ${frame.events.filter((e) => e.p !== null).length} nota${active >= 0 && frame.events[active]?.p != null ? ` · şimdi: ${solName(frame.events[active].p)}` : ''}` : ''}
        </div>
        <Staff events={frame.events} beats={beats} label="Çaldığın" activeIndex={running ? active : -1} width={W} height={STAFF_H} />
      </section>
      <Keyboard active={keys} />
    </div>
  )
}
