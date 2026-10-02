'use client'
// Sahne: 160x120 tuval (keskin piksel), ▶ ■ ↺, hız, ses, tam ekran ve ekrandaki oyun tuşları.
import { useEffect, useRef, useState } from 'react'
import type { Button } from '@/lib/oyun/types'
import type { Player } from './use-player'

function PadButton({ b, label, onDown, onUp, className }: { b: Button; label: string; onDown: (b: Button) => void; onUp: (b: Button) => void; className?: string }) {
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      className={`oy-pad ${className ?? ''}`}
      data-on={on}
      aria-label={b === 'a' || b === 'b' ? `${b.toUpperCase()} düğmesi` : `${label} tuşu`}
      onPointerDown={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); setOn(true); onDown(b) }}
      onPointerUp={() => { setOn(false); onUp(b) }}
      onPointerCancel={() => { setOn(false); onUp(b) }}
      onLostPointerCapture={() => { setOn(false); onUp(b) }}
      onContextMenu={(e) => e.preventDefault()}
    >{label}</button>
  )
}

export function OyunStage({ player, changed }: { player: Player; changed?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [fs, setFs] = useState<'off' | 'native' | 'css'>('off')
  const { status } = player

  useEffect(() => {
    const h = () => setFs((f) => (document.fullscreenElement === wrap.current ? 'native' : f === 'native' ? 'off' : f))
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])
  useEffect(() => {
    if (fs !== 'css') return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setFs('off') }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [fs])

  const toggleFs = async () => {
    const el = wrap.current
    if (!el) return
    if (fs === 'css') { setFs('off'); return }
    if (document.fullscreenElement) { await document.exitFullscreen().catch(() => undefined); return }
    try {
      if (el.requestFullscreen) { await el.requestFullscreen(); setFs('native') } else setFs('css')
    } catch { setFs('css') }
  }

  const running = status === 'running'
  const playLabel = running ? 'Duraklat' : status === 'paused' ? 'Devam et' : status === 'over' || status === 'error' ? 'Yeniden oyna' : 'Başlat'
  const down = (b: Button) => player.press(b)
  const up = (b: Button) => player.release(b)

  return (
    <div ref={wrap} className="oy-stage" data-status={status} data-fs={fs} data-testid="oyun-stage">
      <div className="oy-screen">
        <canvas ref={player.canvasRef} width={160} height={120} className="oy-canvas" aria-label="Oyun ekranı (160 x 120 piksel)" data-testid="oyun-canvas" />
        {status === 'idle' && (
          <button type="button" className="oy-bigplay" onClick={player.toggle} aria-label="Oyunu başlat"><span aria-hidden="true">▶</span></button>
        )}
      </div>
      <div className="oy-controls" role="toolbar" aria-label="Oyun denetimleri">
        <button type="button" className="oy-ctl oy-ctl-play" onClick={player.toggle} title={`${playLabel} (▶)`} aria-label={playLabel} data-testid="oyun-play">
          <span aria-hidden="true">{running ? '⏸' : '▶'}</span>
        </button>
        <button type="button" className="oy-ctl oy-ctl-stop" onClick={player.stop} disabled={status === 'idle'} title="Durdur (■)" aria-label="Durdur" data-testid="oyun-stop"><span aria-hidden="true">■</span></button>
        <button type="button" className="oy-ctl" onClick={player.restart} title="Baştan başlat (↺)" aria-label="Baştan başlat" data-testid="oyun-restart"><span aria-hidden="true">↺</span></button>
        <button type="button" className="oy-ctl oy-ctl-speed" onClick={() => player.setSpeed(player.speed === 1 ? 2 : 1)} aria-pressed={player.speed === 2} title="Oyun hızı" aria-label={`Hız ${player.speed} kat`} data-testid="oyun-speed">{player.speed}x</button>
        <button type="button" className="oy-ctl" onClick={() => player.setMuted(!player.muted)} aria-pressed={player.muted} title={player.muted ? 'Sesi aç' : 'Sesi kapat'} aria-label={player.muted ? 'Sesi aç' : 'Sesi kapat'}><span aria-hidden="true">{player.muted ? '🔇' : '🔊'}</span></button>
        <button type="button" className="oy-ctl" onClick={toggleFs} title={fs === 'off' ? 'Tam ekran önizleme' : 'Tam ekrandan çık'} aria-label={fs === 'off' ? 'Tam ekran' : 'Tam ekrandan çık'} data-testid="oyun-fullscreen"><span aria-hidden="true">{fs === 'off' ? '⛶' : '✕'}</span></button>
      </div>
      {changed && (status === 'running' || status === 'paused') && <p className="oy-changed" role="status">Bloklarını değiştirdin. Yeni halini görmek için ↺ bas.</p>}
      <div className="oy-gamepad" aria-label="Ekrandaki oyun tuşları">
        <div className="oy-dpad">
          <PadButton b="up" label="▲" onDown={down} onUp={up} className="oy-pad-up" />
          <PadButton b="left" label="◀" onDown={down} onUp={up} className="oy-pad-left" />
          <PadButton b="right" label="▶" onDown={down} onUp={up} className="oy-pad-right" />
          <PadButton b="down" label="▼" onDown={down} onUp={up} className="oy-pad-down" />
        </div>
        <div className="oy-ab">
          <PadButton b="b" label="B" onDown={down} onUp={up} className="oy-pad-b" />
          <PadButton b="a" label="A" onDown={down} onUp={up} className="oy-pad-a" />
        </div>
      </div>
    </div>
  )
}
