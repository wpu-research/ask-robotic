'use client'
// Örnek oyun galerisi (8 oyun): kartlarda oyunun ilk karesi görünür.
import { useEffect, useRef } from 'react'
import { renderFrame } from '@/lib/oyun/render'
import { SAMPLES, type OyunSample } from '@/lib/oyun/samples'
import { OyunSession } from '@/lib/oyun/session'

function Preview({ sample }: { sample: OyunSample }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    try {
      const s = new OyunSession(sample.project(), { seed: 5 })
      s.start().tick(45)
      const ctx = cv.getContext('2d')
      if (!ctx) return
      const img = ctx.createImageData(160, 120)
      renderFrame(s.engine, img.data)
      ctx.putImageData(img, 0, 0)
    } catch { /* önizleme çizilemedi */ }
  }, [sample])
  return <canvas ref={ref} width={160} height={120} className="oy-sample-art" aria-hidden="true" />
}

const LEVELS = ['', 'Kolay', 'Orta', 'Zor']

export function SamplesDialog({ onPick, onClose }: { onPick: (s: OyunSample) => void; onClose: () => void }) {
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    first.current?.focus()
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="oy-modal" role="dialog" aria-modal="true" aria-label="Örnek oyunlar" onClick={(e) => { if (e.target === e.currentTarget) onClose() }} data-testid="oyun-samples">
      <div className="oy-modal-card">
        <div className="oy-modal-head">
          <h2>Örnek oyunlar</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Kapat">✕</button>
        </div>
        <p className="muted oy-modal-sub">Birini aç, çalıştır, sonra bloklarını değiştirip kendi oyununa dönüştür. Şu anki çalışmanın üzerine yazılır; istersen önce &quot;Kaydet&quot; ile dışa aktar.</p>
        <ul className="oy-samples">
          {SAMPLES.map((s, i) => (
            <li key={s.id}>
              <button type="button" ref={i === 0 ? first : undefined} className="oy-sample" onClick={() => onPick(s)}>
                <Preview sample={s} />
                <span className="oy-sample-name">{s.name} <span className="chip" data-level={s.level}>{LEVELS[s.level]}</span></span>
                <span className="oy-sample-sum">{s.summary}</span>
                <span className="oy-sample-ctl">🎮 {s.controls}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
