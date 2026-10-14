'use client'
import { useCallback, useEffect, useState } from 'react'
import type { LessonStep } from '@ask/db'
import { InlineMd } from '@/components/lesson-v2/inline-md'
import { useLocale, useT } from '@/i18n/client'

const LETTERS = 'ABCDEFGH'

/** Projeksiyon modu: dersin adımları büyük yazıyla; cevap öğretmen "Cevabı göster" deyince. Ok tuşları gezinir. */
export function Presenter({ title, weekLabel, steps, backHref }: { title: string; weekLabel: string; steps: LessonStep[]; backHref: string }) {
  const t = useT()
  const [i, setI] = useState(0)
  const [reveal, setReveal] = useState(false)
  const go = useCallback((d: number) => { setI((x) => Math.max(0, Math.min(steps.length - 1, x + d))); setReveal(false) }, [steps.length])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1) }
      else if (e.key.toLowerCase() === 'c' || e.key === 'Enter') setReveal((r) => !r)
      else if (e.key.toLowerCase() === 'f') void toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [go])
  const s = steps[i]
  const answerable = s && 'why' in s
  return (
    <div className="og-stage" role="region" aria-label={t('teacher.present.region')}>
      <div className="og-stage-top">
        <span>{weekLabel} · {title}</span>
        <span style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void toggleFullscreen()}>{t('teacher.present.fullscreen')}</button>
          <a className="btn btn-ghost btn-sm" href={backHref}>{t('teacher.present.exit')}</a>
        </span>
      </div>
      <main className="og-stage-main" aria-live="polite">{s ? <StepView s={s} reveal={reveal} /> : <h1>{t('teacher.present.noSteps')}</h1>}</main>
      <div className="og-stage-foot">
        <button type="button" className="v2-btn ghost" onClick={() => go(-1)} disabled={i === 0}>{t('teacher.present.prev')}</button>
        <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          {answerable && <button type="button" className="v2-btn ok" onClick={() => setReveal((r) => !r)}>{reveal ? t('teacher.present.hideAnswer') : t('teacher.present.showAnswer')}</button>}
          <div className="og-stage-dots" aria-label={t('teacher.present.stepOf', { i: i + 1, n: steps.length })}>{steps.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
        </div>
        <button type="button" className="v2-btn" onClick={() => go(1)} disabled={i >= steps.length - 1}>{t('teacher.present.next')}</button>
      </div>
    </div>
  )
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch { /* tarayıcı izin vermedi */ }
}

function StepView({ s, reveal }: { s: LessonStep; reveal: boolean }) {
  const t = useT()
  const locale = useLocale()
  const why = 'why' in s && reveal ? <div className="og-stage-answer"><b>{t('teacher.present.why')}</b> <InlineMd text={s.why} /></div> : null
  const code = 'code' in s && s.code ? <pre><code>{s.code}</code></pre> : null
  switch (s.kind) {
    case 'intro': return <><span className="eyebrow">{t('teacher.present.curious')}</span><h1>{s.title}</h1><p className="lead"><InlineMd text={s.body} /></p></>
    case 'explain': return <><p className="lead"><InlineMd text={s.body} /></p>{code}</>
    case 'reflect': return <><span className="eyebrow">{t('teacher.present.discuss')}</span><h1><InlineMd text={s.prompt} /></h1></>
    case 'activity': return <><span className="eyebrow">{t('teacher.present.activity')}</span><p className="lead"><InlineMd text={s.prompt} /></p><p className="muted">{t('teacher.present.activityNote')}</p></>
    case 'choice': return (
      <>
        <p className="lead"><InlineMd text={s.prompt} /></p>{code}
        <ol className="og-stage-opts">
          {s.options.map((o, k) => <li key={k} className={reveal && k === s.answer ? 'right' : ''}><span className="letter">{LETTERS[k]}</span><InlineMd text={o} /></li>)}
        </ol>{why}
      </>
    )
    case 'numeric': return <><p className="lead"><InlineMd text={s.prompt} /></p>{code}{reveal && <div className="og-stage-answer"><b>{t('teacher.present.answer')}</b> {locale === 'tr' ? String(s.answer).replace('.', ',') : String(s.answer)}{s.unit ? ` ${s.unit}` : ''}</div>}{why}</>
    case 'fill': return (
      <>
        <p className="lead"><InlineMd text={s.prompt} /></p>
        <pre><code>{reveal ? fillCode(s.code, s.answer) : s.code}</code></pre>
        {!reveal && <ol className="og-stage-opts">{s.tokens.map((t, k) => <li key={k}><span className="letter">{LETTERS[k] ?? k + 1}</span><code>{t}</code></li>)}</ol>}{why}
      </>
    )
    case 'order': return (
      <>
        <p className="lead"><InlineMd text={s.prompt} /></p>
        <ol className="og-stage-opts" style={{ gridTemplateColumns: '1fr' }}>
          {(reveal ? s.lines : shuffled(s.lines)).map((l, k) => <li key={l + k} className={reveal ? 'right' : ''}><span className="letter">{k + 1}</span><code>{l}</code></li>)}
        </ol>{why}
      </>
    )
    case 'widget': return <><p className="lead"><InlineMd text={s.prompt} /></p><ul className="og-stage-opts">{s.goals.map((g, k) => <li key={k}>{g.label}</li>)}</ul>{why}</>
  }
}

function fillCode(code: string, answer: string[]) {
  let k = 0
  return code.replace(/___/g, () => answer[k++] ?? '___')
}

/** Sabit karıştırma (her çizimde aynı): satırları ters çevirip dönüşümlü dizer. */
function shuffled(lines: string[]) {
  const r = [...lines].reverse()
  return r.filter((_, k) => k % 2 === 0).concat(r.filter((_, k) => k % 2 === 1))
}
