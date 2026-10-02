'use client'
// Sahne: 480x360 mantıksal tuval, yeşil bayrak / dur / başa sar, küçük-büyük-tam ekran, cevap kutusu ve sprite bilgi paneli.
import { useEffect, useRef, useState } from 'react'
import type { SahneProject, SpriteDef } from '@/lib/sahne/types'
import type { Player } from './use-player'

export type StageSize = 'small' | 'large'

export interface StageProps {
  player: Player
  size: StageSize
  onSize: (s: StageSize) => void
  project: SahneProject
  sprite: SpriteDef | null
  /** Etkinlik kipinde sprite adı değiştirilemez (hedefler adlara bağlıdır). */
  lockNames?: boolean
  onSpritePatch: (id: string, patch: { x?: number; y?: number; dir?: number; size?: number; visible?: boolean; name?: string }) => void
  onShowBlock?: (id: string | null | undefined) => void
}

function NumField({ label, value, onCommit, step = 1, min, max, testid }: { label: string; value: number; onCommit: (n: number) => void; step?: number; min?: number; max?: number; testid?: string }) {
  const [txt, setTxt] = useState<string | null>(null)
  const shown = txt ?? String(Math.round(value * 100) / 100)
  const commit = () => { if (txt === null) return; const n = parseFloat(txt.replace(',', '.')); setTxt(null); if (Number.isFinite(n)) onCommit(n) }
  return (
    <label className="sh-num">
      <span>{label}</span>
      <input type="number" inputMode="decimal" step={step} min={min} max={max} value={shown} data-testid={testid}
        onFocus={(e) => e.currentTarget.select()} onChange={(e) => setTxt(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { commit(); (e.target as HTMLElement).blur() } }} />
    </label>
  )
}

export function Stage({ player, size, onSize, sprite, lockNames, onSpritePatch, onShowBlock }: StageProps) {
  const [fs, setFs] = useState<'off' | 'native' | 'css'>('off')
  const [answer, setAnswer] = useState('')
  const wrap = useRef<HTMLDivElement>(null)
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
  useEffect(() => { if (!player.asking) setAnswer('') }, [player.asking])

  const toggleFs = async () => {
    const el = wrap.current
    if (!el) return
    if (fs === 'css') { setFs('off'); return }
    if (document.fullscreenElement) { await document.exitFullscreen().catch(() => undefined); return }
    try {
      if (el.requestFullscreen) { await el.requestFullscreen(); setFs('native') } else setFs('css')
    } catch { setFs('css') }
  }

  const info = sprite ? player.readout(sprite.id) ?? { x: sprite.x, y: sprite.y, dir: sprite.dir, size: sprite.size, visible: sprite.visible, costume: sprite.costume } : null
  const running = status === 'running'

  return (
    <div className="sh-stagebox" data-size={size} data-fs={fs} data-status={status}>
      <div ref={wrap} className="sh-stage" data-fs={fs}>
        <div className="sh-bar" role="toolbar" aria-label="Sahne denetimleri">
          <button type="button" className="sh-flag" onClick={player.flag} title="Yeşil bayrak: programı başlat" aria-label="Yeşil bayrak" data-testid="sahne-flag" data-running={running}><span aria-hidden="true">⚑</span></button>
          <button type="button" className="sh-stop" onClick={player.stop} title="Durdur" aria-label="Durdur" data-testid="sahne-stop" disabled={status === 'idle'}><span aria-hidden="true">⬣</span></button>
          <button type="button" className="sh-ctl" onClick={player.reset} title="Başa sar: sprite'ları ve değişkenleri ilk haline getir" aria-label="Başa sar" data-testid="sahne-reset"><span aria-hidden="true">↺</span></button>
          <span className="sh-spacer" />
          <button type="button" className="sh-ctl" onClick={() => player.setMuted(!player.muted)} aria-pressed={player.muted} title={player.muted ? 'Sesi aç' : 'Sesi kapat'} aria-label={player.muted ? 'Sesi aç' : 'Sesi kapat'}><span aria-hidden="true">{player.muted ? '🔇' : '🔊'}</span></button>
          <span className="sh-sizes" role="group" aria-label="Sahne boyutu">
            <button type="button" className="sh-ctl" aria-pressed={size === 'small'} onClick={() => onSize('small')} title="Küçük sahne" aria-label="Küçük sahne" data-testid="sahne-size-small"><span className="sh-ic-small" aria-hidden="true" /></button>
            <button type="button" className="sh-ctl" aria-pressed={size === 'large'} onClick={() => onSize('large')} title="Büyük sahne" aria-label="Büyük sahne" data-testid="sahne-size-large"><span className="sh-ic-large" aria-hidden="true" /></button>
          </span>
          <button type="button" className="sh-ctl" onClick={toggleFs} title={fs === 'off' ? 'Tam ekran' : 'Tam ekrandan çık'} aria-label={fs === 'off' ? 'Tam ekran' : 'Tam ekrandan çık'} data-testid="sahne-fullscreen"><span aria-hidden="true">{fs === 'off' ? '⛶' : '✕'}</span></button>
        </div>
        <div className="sh-screen" ref={player.stageRef} tabIndex={0} aria-label="Sahne. Tuşları kullanmak için buraya tıkla." data-testid="sahne-screen">
          <canvas ref={player.canvasRef} className="sh-canvas" width={960} height={720} aria-label="Sahne (480 x 360)" data-testid="sahne-canvas" {...player.pointer} />
          {player.asking !== null && (
            <form className="sh-ask" onSubmit={(e) => { e.preventDefault(); player.answer(answer); setAnswer('') }} data-testid="sahne-ask">
              <span className="sh-ask-q">{player.asking}</span>
              <input autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label="Cevabın" data-testid="sahne-answer" maxLength={200} />
              <button type="submit" aria-label="Gönder">✓</button>
            </form>
          )}
        </div>
        {player.stale && running && <p className="sh-note" role="status">Programı değiştirdin. Yeni halini görmek için bayrağa bas.</p>}
        {player.error && (
          <div className="sh-error" role="alert" data-testid="sahne-error">
            <b>Bir sorun var:</b> {player.error.message}
            {player.error.blockId && onShowBlock && <button type="button" className="sh-link" onClick={() => onShowBlock(player.error?.blockId)}>Bloğu göster</button>}
          </div>
        )}
      </div>
      {info && sprite ? (
        <div className="sh-info" data-testid="sahne-info" aria-label="Seçili sprite bilgisi">
          <label className="sh-num sh-num-name">
            <span>Sprite</span>
            <input type="text" value={sprite.name} maxLength={30} disabled={lockNames} onChange={(e) => onSpritePatch(sprite.id, { name: e.target.value })} aria-label="Sprite adı" data-testid="sahne-name" />
          </label>
          <NumField label="x" value={info.x} onCommit={(n) => onSpritePatch(sprite.id, { x: n })} testid="sahne-x" />
          <NumField label="y" value={info.y} onCommit={(n) => onSpritePatch(sprite.id, { y: n })} testid="sahne-y" />
          <span className="sh-vis" role="group" aria-label="Görünürlük">
            <button type="button" aria-pressed={info.visible} onClick={() => onSpritePatch(sprite.id, { visible: true })} title="Göster" aria-label="Göster">👁</button>
            <button type="button" aria-pressed={!info.visible} onClick={() => onSpritePatch(sprite.id, { visible: false })} title="Gizle" aria-label="Gizle">⊘</button>
          </span>
          <NumField label="boyut" value={info.size} onCommit={(n) => onSpritePatch(sprite.id, { size: n })} min={5} max={800} testid="sahne-size" />
          <NumField label="yön" value={info.dir} onCommit={(n) => onSpritePatch(sprite.id, { dir: n })} min={-180} max={180} testid="sahne-dir" />
        </div>
      ) : (
        <div className="sh-info sh-info-stage" data-testid="sahne-info"><b>Sahne</b><span className="muted">Arka plan seçmek için Arka planlar sekmesine bak.</span></div>
      )}
    </div>
  )
}
