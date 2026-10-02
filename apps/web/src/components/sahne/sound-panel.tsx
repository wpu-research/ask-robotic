'use client'
// Sesler sekmesi: hedefin sesleri, dinleme, ad, dalga biçimi ve basit efektler (hızlı, yavaş, yüksek, alçak, sessiz, ters).
import { useEffect, useRef } from 'react'
import { SahneAudio, envelope, soundDuration, soundSteps } from '@/lib/sahne/sounds'
import type { SoundRef } from '@/lib/sahne/types'

const FX: { id: string; label: string; apply: (s: SoundRef) => SoundRef }[] = [
  { id: 'hizli', label: 'Hızlı', apply: (s) => ({ ...s, speed: Math.min(4, (s.speed ?? 1) * 1.5) }) },
  { id: 'yavas', label: 'Yavaş', apply: (s) => ({ ...s, speed: Math.max(0.25, (s.speed ?? 1) / 1.5) }) },
  { id: 'yuksek', label: 'Yüksek (tiz)', apply: (s) => ({ ...s, pitch: Math.min(4, (s.pitch ?? 1) * 1.26) }) },
  { id: 'alcak', label: 'Alçak (pes)', apply: (s) => ({ ...s, pitch: Math.max(0.25, (s.pitch ?? 1) / 1.26) }) },
  { id: 'sessiz', label: 'Daha sessiz', apply: (s) => ({ ...s, gain: Math.max(0.1, (s.gain ?? 1) * 0.6) }) },
  { id: 'ters', label: 'Ters çevir', apply: (s) => ({ ...s, reverse: !s.reverse }) },
]

function Wave({ s }: { s: SoundRef }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    const env = envelope(soundSteps(s), 56)
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.fillStyle = '#c85bc8'
    const bw = cv.width / env.length
    env.forEach((v, i) => { const hh = Math.max(2, v * (cv.height - 8)); ctx.fillRect(i * bw + 1, (cv.height - hh) / 2, Math.max(1, bw - 2), hh) })
  }, [s])
  return <canvas ref={ref} className="sh-wave" width={280} height={64} aria-label="Dalga biçimi" />
}

export interface SoundPanelProps {
  sounds: SoundRef[]
  onChange: (sounds: SoundRef[]) => void
  onRename: (from: string, to: string) => void
  onAdd: () => void
}

export function SoundPanel({ sounds, onChange, onRename, onAdd }: SoundPanelProps) {
  const audio = useRef<SahneAudio | null>(null)
  useEffect(() => () => { audio.current?.dispose() }, [])
  const play = (s: SoundRef) => { audio.current ??= new SahneAudio(); audio.current.unlock(); audio.current.stopAll(); audio.current.playSteps(soundSteps(s), 1) }
  const set = (i: number, next: SoundRef) => onChange(sounds.map((s, k) => (k === i ? next : s)))
  const names = (i: number, want: string): string => {
    let n = want || 'ses', k = 2
    while (sounds.some((s, j) => j !== i && s.name === n)) n = `${want}${k++}`
    return n
  }
  return (
    <div className="sh-snd" data-testid="sahne-sound-panel">
      <div className="sh-snd-head"><p className="muted">Hazır sesler tarayıcıda sentezlenir. Kayıt yok: istediğin sesi galeriden ekle, efektlerle değiştir.</p><button type="button" className="btn btn-primary btn-sm" onClick={onAdd} data-testid="sahne-sound-add">＋ Ses ekle</button></div>
      {!sounds.length && <p className="sh-snd-empty">Henüz ses yok. <b>Ses ekle</b> ile galeriden seç.</p>}
      <ol className="sh-snd-list">
        {sounds.map((s, i) => (
          <li key={`${s.name}-${i}`} className="sh-snd-item" data-testid={`sahne-sound-item-${i}`}>
            <span className="sh-snd-no">{i + 1}</span>
            <button type="button" className="sh-splay sh-splay-big" onClick={() => play(s)} aria-label={`${s.name} sesini çal`} title="Çal">▶</button>
            <div className="sh-snd-body">
              <div className="sh-snd-row">
                <input type="text" value={s.name} maxLength={30} aria-label="Ses adı" onFocus={(e) => { e.currentTarget.dataset.was = s.name }}
                  onChange={(e) => set(i, { ...s, name: e.target.value })}
                  onBlur={(e) => { const from = e.currentTarget.dataset.was ?? s.name; const to = names(i, s.name.trim()); if (to !== s.name) set(i, { ...s, name: to }); if (to !== from) onRename(from, to) }} />
                <span className="muted">{(soundDuration(s) / 1000).toFixed(2)} sn</span>
                <button type="button" className="sh-ce-del" onClick={() => onChange(sounds.filter((_, k) => k !== i))} aria-label={`${s.name} sesini sil`} title="Sil">✕</button>
              </div>
              <Wave s={s} />
              <div className="sh-snd-fx" role="group" aria-label="Efektler">
                {FX.map((f) => <button key={f.id} type="button" className="sh-chip" onClick={() => { const n = f.apply(s); set(i, n); play(n) }}>{f.label}</button>)}
                <button type="button" className="sh-chip sh-chip-reset" onClick={() => set(i, { name: s.name, gid: s.gid })}>Sıfırla</button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
