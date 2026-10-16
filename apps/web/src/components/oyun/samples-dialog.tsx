'use client'
// Örnek oyun galerisi (8 oyun): kartlarda oyunun ilk karesi görünür.
import { useEffect, useRef } from 'react'
import { useLocale, useT } from '@/i18n/client'
import { renderFrame } from '@/lib/oyun/render'
import { SAMPLES, type OyunSample } from '@/lib/oyun/samples'
import { OyunSession } from '@/lib/oyun/session'

function Preview({ sample }: { sample: OyunSample }) {
  const locale = useLocale()
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
      renderFrame(s.engine, img.data, locale)
      ctx.putImageData(img, 0, 0)
    } catch { /* önizleme çizilemedi */ }
  }, [sample, locale])
  return <canvas ref={ref} width={160} height={120} className="oy-sample-art" aria-hidden="true" />
}

const LEVEL_KEYS = ['', 'studios.oyun.samples.level1', 'studios.oyun.samples.level2', 'studios.oyun.samples.level3'] as const

export function SamplesDialog({ onPick, onClose }: { onPick: (s: OyunSample) => void; onClose: () => void }) {
  const t = useT()
  const locale = useLocale()
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    first.current?.focus()
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="oy-modal" role="dialog" aria-modal="true" aria-label={t('studios.oyun.samples.title')} onClick={(e) => { if (e.target === e.currentTarget) onClose() }} data-testid="oyun-samples">
      <div className="oy-modal-card">
        <div className="oy-modal-head">
          <h2>{t('studios.oyun.samples.title')}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('studios.oyun.samples.close')}>✕</button>
        </div>
        <p className="muted oy-modal-sub">{t('studios.oyun.samples.intro')}</p>
        <ul className="oy-samples">
          {SAMPLES.map((s, i) => {
            const txt = locale === 'en' && s.en ? s.en : s
            return (
            <li key={s.id}>
              <button type="button" ref={i === 0 ? first : undefined} className="oy-sample" onClick={() => onPick(s)}>
                <Preview sample={s} />
                <span className="oy-sample-name">{txt.name} <span className="chip" data-level={s.level}>{t(LEVEL_KEYS[s.level])}</span></span>
                <span className="oy-sample-sum">{txt.summary}</span>
                <span className="oy-sample-ctl">🎮 {txt.controls}</span>
              </button>
            </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
