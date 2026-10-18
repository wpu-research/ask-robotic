'use client'
// Makine öğrenmesi oynatıcısı: üstte canlı sahne, altında o anki adımın yazısı, yanında Python kodu ve çalışan satır vurgulu.
// İz (kareler) parametrelerden tarayıcıda hesaplanır; aynı tohum hep aynı sonucu verir.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '@/i18n/client'
import type { Lang } from '@/lib/ml/core'
import { LESSONS } from '@/lib/ml/lessons'
import { DRAW, readPal } from './draw'
import { SCENES } from './scenes'

const W = 720, H = 460
const BASE_MS = 700
const SPEEDS = [0.5, 1, 2, 4]

/** Çok küçük Python renklendirici: yorum, metin, sayı, anahtar sözcük. */
function Py({ src }: { src: string }) {
  const hash = src.indexOf('#')
  const code = hash >= 0 ? src.slice(0, hash) : src
  const comment = hash >= 0 ? src.slice(hash) : ''
  const parts: React.ReactNode[] = []
  const re = /('[^']*'|"[^"]*")|(\b\d+(?:\.\d+)?\b)|\b(import|from|as|for|in|while|True|False|None|if|else|elif|break|return|def|and|or|not|lambda)\b|\b(print|len|range|np)\b/g
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(code))) {
    if (m.index > last) parts.push(code.slice(last, m.index))
    const cls = m[1] ? 'py-s' : m[2] ? 'py-n' : m[3] ? 'py-k' : 'py-b'
    parts.push(<span key={i++} className={cls}>{m[0]}</span>)
    last = m.index + m[0].length
  }
  if (last < code.length) parts.push(code.slice(last))
  if (comment) parts.push(<span key="c" className="py-c">{comment}</span>)
  return <>{parts}</>
}

export function MlPlayer({ slug }: { slug: string }) {
  const lesson = LESSONS.find((l) => l.slug === slug)!
  const lang = useLocale() as Lang
  const [params, setParams] = useState<Record<string, number>>(() => Object.fromEntries(lesson.params.map((p) => [p.key, p.value])))
  const frames = useMemo(() => lesson.run(params), [lesson, params])
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const cv = useRef<HTMLCanvasElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const codeBox = useRef<HTMLOListElement>(null)
  const f = frames[Math.min(idx, frames.length - 1)]

  useEffect(() => { setIdx(0) }, [frames])
  // otomatik oynatma
  useEffect(() => {
    if (!playing) return
    if (idx >= frames.length - 1) { setPlaying(false); return }
    const id = setTimeout(() => setIdx((i) => Math.min(frames.length - 1, i + 1)), (BASE_MS * (f.hold ?? 1)) / speed)
    return () => clearTimeout(id)
  }, [playing, idx, frames, speed, f])
  // çizim
  useEffect(() => {
    const c = cv.current
    if (!c || !host.current) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    if (c.width !== W * dpr) { c.width = W * dpr; c.height = H * dpr }
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const draw = DRAW[lesson.slug] ?? SCENES[lesson.slug]
    draw?.(ctx, W, H, f, readPal(host.current), lang)
  }, [f, lesson, lang])
  // vurgulanan satırı görünür tut (yalnız kod kutusunun içinde kaydır)
  useEffect(() => {
    const box = codeBox.current, li = box?.children[f.line] as HTMLElement | undefined
    if (box && li && (li.offsetTop < box.scrollTop || li.offsetTop + li.offsetHeight > box.scrollTop + box.clientHeight)) box.scrollTop = li.offsetTop - box.clientHeight / 2
  }, [f.line])

  const L = lang === 'tr' ? 0 : 1
  // yorumlar aynı sütundan başlar: en uzun kod satırının iki boşluk sağı (çok uzun satırlar kendi sonundan)
  const col = Math.min(44, Math.max(...lesson.code.map(([c]) => c.length))) + 2
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)
  return (
    <section className="ml-player" ref={host} aria-label={lesson.title[lang]} data-testid="ml-player">
      <div className="ml-stage">
        <canvas ref={cv} className="ml-canvas" style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label={`${f.cap[L]} · ${f.stat?.[L] ?? ''}`} />
        <div className="ml-cap" aria-live="polite"><b data-testid="ml-cap">{f.cap[L]}</b>{f.stat && <span>{f.stat[L]}</span>}</div>
        <div className="ml-ctl">
          <button type="button" className="btn btn-primary btn-small" onClick={() => { if (idx >= frames.length - 1) setIdx(0); setPlaying((x) => !x) }} data-testid="ml-play">
            {playing ? t('Duraklat', 'Pause') : idx >= frames.length - 1 ? t('Baştan oynat', 'Play again') : t('Oynat', 'Play')}
          </button>
          <button type="button" className="btn btn-outline btn-small" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)) }} aria-label={t('Önceki adım', 'Previous step')}>‹</button>
          <button type="button" className="btn btn-outline btn-small" onClick={() => { setPlaying(false); setIdx((i) => Math.min(frames.length - 1, i + 1)) }} aria-label={t('Sonraki adım', 'Next step')} data-testid="ml-step">›</button>
          <input
            type="range" className="ml-scrub" min={0} max={frames.length - 1} value={idx} aria-label={t('Adım', 'Step')}
            onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)) }}
          />
          <span className="ml-count">{idx + 1} / {frames.length}</span>
          <div className="ml-speed" role="group" aria-label={t('Hız', 'Speed')}>
            {SPEEDS.map((s) => <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}×</button>)}
          </div>
        </div>
        {lesson.params.length > 0 && (
          <div className="ml-params">
            {lesson.params.map((p) => (
              <label key={p.key} className="ml-param">
                <span>{p.label[lang]} <b>{params[p.key]}</b></span>
                <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key]} onChange={(e) => { setPlaying(false); setParams((o) => ({ ...o, [p.key]: Number(e.target.value) })) }} />
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="ml-code">
        <div className="ml-code-head"><span className="ml-dots" aria-hidden="true"><i /><i /><i /></span><b>{lesson.file}</b><small>python</small></div>
        <ol ref={codeBox} data-testid="ml-code">
          {lesson.code.map(([code, tr, en], i) => {
            const c = lang === 'tr' ? tr : en
            const src = c ? `${code}${' '.repeat(Math.max(2, col - code.length))}# ${c}` : code
            return <li key={i} className={i === f.line ? 'on' : undefined} aria-current={i === f.line ? 'step' : undefined}><code><Py src={src} /></code></li>
          })}
        </ol>
      </div>
    </section>
  )
}
