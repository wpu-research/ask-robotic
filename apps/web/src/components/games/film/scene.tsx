'use client'
// Film sahnesi: solda hedef animasyon, sağda kullanıcının filmi. Altta oynatma çubuğu (kare kare gezinme).
import { useEffect, useRef, useState } from 'react'
import type { SceneProps } from '@/lib/games/types'
import { BG_DEFAULT, FRAME_COUNT, type Frame, type MovieSnap } from '@/lib/games/film/model'

const FPS = 24
const BLANK: Frame = { bg: BG_DEFAULT, shapes: [] }

function Canvas({ frame, label, note, tone }: { frame: Frame; label: string; note?: string; tone: 'target' | 'mine' }) {
  return (
    <figure style={{ margin: 0, flex: '1 1 0', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <figcaption style={{ fontSize: '.78rem', fontWeight: 800, color: tone === 'target' ? 'var(--muted, #667)' : 'var(--text, #222)', textAlign: 'center', letterSpacing: '.02em' }}>{label}</figcaption>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <svg viewBox="0 0 100 100" role="img" aria-label={`${label} sahnesi`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 8, border: '2px solid var(--border-strong, #bbb)', boxSizing: 'border-box', background: frame.bg }} preserveAspectRatio="xMidYMid meet" data-testid={`film-${tone}`}>
          <rect x="0" y="0" width="100" height="100" fill={frame.bg} />
          {frame.shapes.map((s, i) => {
            if (s.k === 'c') return <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.fill} />
            if (s.k === 'r') return <rect key={i} x={Math.min(s.x, s.x + s.w)} y={Math.min(s.y, s.y + s.h)} width={Math.abs(s.w)} height={Math.abs(s.h)} fill={s.fill} />
            return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={Math.max(s.w, 2)} strokeLinecap="round" />
          })}
          <g stroke="#000" strokeOpacity=".09" strokeWidth=".3" pointerEvents="none">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (<g key={v}><line x1={v} y1="0" x2={v} y2="100" /><line x1="0" y1={v} x2="100" y2={v} /></g>))}
          </g>
          <g fontSize="4" fontWeight="700" fill="#000" fillOpacity=".4" pointerEvents="none" fontFamily="system-ui, sans-serif">
            <text x="1.2" y="4.6">0</text><text x="98.8" y="4.6" textAnchor="end">100</text><text x="1.2" y="98.8">100</text>
          </g>
        </svg>
        {note && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 10, textAlign: 'center', fontSize: '.8rem', fontWeight: 700, color: '#555', pointerEvents: 'none' }}>{note}</div>}
      </div>
    </figure>
  )
}

export default function FilmScene({ frame, running, speed, outcome }: SceneProps<MovieSnap>) {
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(true)
  const posRef = useRef(0)
  const setPosBoth = (p: number) => { posRef.current = p; setPos(p) }
  const done = outcome !== null

  // Çalıştırma bitince filmi baştan oynat; sıfırlanınca hedef önizlemesi dönsün.
  useEffect(() => {
    if (running) return
    posRef.current = 0
    setPos(0)
    setPlaying(true)
  }, [outcome, running])

  useEffect(() => {
    if (!playing || running) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const tick = (now: number) => {
      acc += ((now - last) / 1000) * FPS * Math.max(0.1, speed)
      last = now
      if (acc >= 1) {
        const adv = Math.floor(acc)
        acc -= adv
        let n = posRef.current + adv
        if (n >= FRAME_COUNT) {
          if (done) { posRef.current = FRAME_COUNT - 1; setPos(FRAME_COUNT - 1); setPlaying(false); return }
          n %= FRAME_COUNT
        }
        posRef.current = n
        setPos(n)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, running, speed, done])

  const idx = running ? Math.min(FRAME_COUNT - 1, frame.t) : pos
  const target = frame.target[idx] ?? BLANK
  const hasRun = running || done
  const mine = running ? (frame.cur ?? frame.frames[frame.frames.length - 1] ?? BLANK) : done ? (frame.frames[idx] ?? BLANK) : BLANK
  const missing = done && !frame.frames[idx]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, boxSizing: 'border-box', background: 'var(--surface, #fff)' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 10 }}>
        <Canvas frame={target} label="Hedef" tone="target" />
        <Canvas frame={mine} label="Senin filmin" tone="mine" note={!hasRun ? 'Programını çalıştır, filmin burada oynasın.' : missing ? 'Bu kare çizilmedi.' : undefined} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => { if (!playing && posRef.current >= FRAME_COUNT - 1) setPosBoth(0); setPlaying((p) => !p) }}
          disabled={running}
          aria-label={playing ? 'Duraklat' : 'Oynat'}
          title={playing ? 'Duraklat' : 'Oynat'}
          style={{ width: 36, height: 36, flex: '0 0 auto', borderRadius: '50%', border: '1px solid var(--border-strong, #bbb)', background: 'var(--surface-2, #f3f3f3)', color: 'var(--text, #222)', cursor: running ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 800 }}
        >{playing && !running ? '❚❚' : '▶'}</button>
        <input
          type="range" min={0} max={FRAME_COUNT - 1} step={1} value={idx} disabled={running}
          onChange={(e) => { setPlaying(false); setPosBoth(Number(e.target.value)) }}
          aria-label="Kare (zaman)" style={{ flex: 1, minWidth: 0, accentColor: 'var(--primary, #4c97ff)' }}
        />
        <span style={{ flex: '0 0 auto', minWidth: 74, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: '.85rem', color: 'var(--text, #222)' }}>zaman: {idx}</span>
      </div>
    </div>
  )
}
