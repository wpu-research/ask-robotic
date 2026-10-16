'use client'
// Sesler sekmesi: hedefin sesleri, dinleme, ad, dalga biçimi ve basit efektler (hızlı, yavaş, yüksek, alçak, sessiz, ters).
import { useEffect, useRef } from 'react'
import { SahneAudio, envelope, soundDuration, soundSteps } from '@/lib/sahne/sounds'
import type { SoundRef } from '@/lib/sahne/types'
import { useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'

const FX: { id: string; label: MessageKey; apply: (s: SoundRef) => SoundRef }[] = [
  { id: 'hizli', label: 'studios.sahne.sound.fxFast', apply: (s) => ({ ...s, speed: Math.min(4, (s.speed ?? 1) * 1.5) }) },
  { id: 'yavas', label: 'studios.sahne.sound.fxSlow', apply: (s) => ({ ...s, speed: Math.max(0.25, (s.speed ?? 1) / 1.5) }) },
  { id: 'yuksek', label: 'studios.sahne.sound.fxHigh', apply: (s) => ({ ...s, pitch: Math.min(4, (s.pitch ?? 1) * 1.26) }) },
  { id: 'alcak', label: 'studios.sahne.sound.fxLow', apply: (s) => ({ ...s, pitch: Math.max(0.25, (s.pitch ?? 1) / 1.26) }) },
  { id: 'sessiz', label: 'studios.sahne.sound.fxQuiet', apply: (s) => ({ ...s, gain: Math.max(0.1, (s.gain ?? 1) * 0.6) }) },
  { id: 'ters', label: 'studios.sahne.sound.fxReverse', apply: (s) => ({ ...s, reverse: !s.reverse }) },
]

function Wave({ s }: { s: SoundRef }) {
  const t = useT()
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
  return <canvas ref={ref} className="sh-wave" width={280} height={64} aria-label={t('studios.sahne.sound.wave')} />
}

export interface SoundPanelProps {
  sounds: SoundRef[]
  onChange: (sounds: SoundRef[]) => void
  onRename: (from: string, to: string) => void
  onAdd: () => void
}

export function SoundPanel({ sounds, onChange, onRename, onAdd }: SoundPanelProps) {
  const t = useT()
  const en = useLocale() === 'en'
  const audio = useRef<SahneAudio | null>(null)
  useEffect(() => () => { audio.current?.dispose() }, [])
  const play = (s: SoundRef) => { audio.current ??= new SahneAudio(); audio.current.unlock(); audio.current.stopAll(); audio.current.playSteps(soundSteps(s), 1) }
  const set = (i: number, next: SoundRef) => onChange(sounds.map((s, k) => (k === i ? next : s)))
  const names = (i: number, want: string): string => {
    let n = want || (en ? t('studios.sahne.sound.defaultName') : 'ses'), k = 2
    while (sounds.some((s, j) => j !== i && s.name === n)) n = `${want}${k++}`
    return n
  }
  return (
    <div className="sh-snd" data-testid="sahne-sound-panel">
      <div className="sh-snd-head"><p className="muted">{t('studios.sahne.sound.intro')}</p><button type="button" className="btn btn-primary btn-sm" onClick={onAdd} data-testid="sahne-sound-add">＋ {t('studios.sahne.sound.add')}</button></div>
      {!sounds.length && <p className="sh-snd-empty">{t('studios.sahne.sound.emptyA')}<b>{t('studios.sahne.sound.emptyAdd')}</b>{t('studios.sahne.sound.emptyB')}</p>}
      <ol className="sh-snd-list">
        {sounds.map((s, i) => (
          <li key={`${s.name}-${i}`} className="sh-snd-item" data-testid={`sahne-sound-item-${i}`}>
            <span className="sh-snd-no">{i + 1}</span>
            <button type="button" className="sh-splay sh-splay-big" onClick={() => play(s)} aria-label={t('studios.sahne.sound.play', { name: s.name })} title={t('studios.sahne.sound.playTitle')}>▶</button>
            <div className="sh-snd-body">
              <div className="sh-snd-row">
                <input type="text" value={s.name} maxLength={30} aria-label={t('studios.sahne.sound.name')} onFocus={(e) => { e.currentTarget.dataset.was = s.name }}
                  onChange={(e) => set(i, { ...s, name: e.target.value })}
                  onBlur={(e) => { const from = e.currentTarget.dataset.was ?? s.name; const to = names(i, s.name.trim()); if (to !== s.name) set(i, { ...s, name: to }); if (to !== from) onRename(from, to) }} />
                <span className="muted">{t('studios.sahne.sound.seconds', { n: (soundDuration(s) / 1000).toFixed(2) })}</span>
                <button type="button" className="sh-ce-del" onClick={() => onChange(sounds.filter((_, k) => k !== i))} aria-label={t('studios.sahne.sound.remove', { name: s.name })} title={t('studios.sahne.sound.delete')}>✕</button>
              </div>
              <Wave s={s} />
              <div className="sh-snd-fx" role="group" aria-label={t('studios.sahne.sound.effects')}>
                {FX.map((f) => <button key={f.id} type="button" className="sh-chip" onClick={() => { const n = f.apply(s); set(i, n); play(n) }}>{t(f.label)}</button>)}
                <button type="button" className="sh-chip sh-chip-reset" onClick={() => set(i, { name: s.name, gid: s.gid })}>{t('studios.sahne.sound.reset')}</button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
