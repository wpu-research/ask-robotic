'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LessonStep } from '@ask/db'
import { LessonActivity } from '@/components/learn/lesson-activity'
import { parseNumber } from '@/lib/quiz'
import { BLANK, checkChoice, checkFill, checkNumeric, checkOrder, goalMet, seededShuffle, splitBlanks } from '@/lib/steps'
import { InlineMd, plain } from './inline-md'
import { Widget } from './widgets'
import { useT } from '@/i18n/client'

type Of<K extends LessonStep['kind']> = Extract<LessonStep, { kind: K }>

/**
 * Adım görünümü sözleşmesi: görünüm kendi cevap durumunu tutar ve hazır olunca oynatıcıya bir denetleyici verir
 * (null = "Kontrol et" pasif). `locked`: doğru cevaplandı ya da cevap gösterildi; `reveal`: doğru cevabı göster.
 */
export interface ViewProps<S> {
  step: S; seed: number; locked: boolean; reveal: boolean; onReady: (check: (() => boolean) | null) => void
  /** Öğrencinin şu anki cevabının kısa metni (Mac'e bağlam); boş = henüz cevap yok. */
  onSnapshot?: (text: string) => void
}

const LETTER = ['A', 'B', 'C', 'D', 'E']

export function CodeBlock({ code }: { code: string }) {
  return <pre className="v2-code"><code>{code}</code></pre>
}

export function ChoiceView({ step, locked, reveal, onReady, onSnapshot }: ViewProps<Of<'choice'>>) {
  const t = useT()
  const [picked, setPicked] = useState<number | null>(null)
  useEffect(() => { onReady(picked === null ? null : () => checkChoice(step, picked)) }, [picked, step, onReady])
  useEffect(() => { onSnapshot?.(picked === null ? '' : `Seçtiği: ${LETTER[picked]}) ${plain(step.options[picked] ?? '')}`) }, [picked, step, onSnapshot])
  return (
    <div className="v2-q">
      <p className="v2-prompt"><InlineMd text={step.prompt} /></p>
      {step.code && <CodeBlock code={step.code} />}
      <div className="v2-options" role="radiogroup" aria-label={t('lesson.steps.options')}>
        {step.options.map((o, i) => {
          const state = locked && i === step.answer ? 'right' : reveal && i === picked && i !== step.answer ? 'wrong' : picked === i ? 'picked' : ''
          return (
            <button key={i} type="button" role="radio" aria-checked={picked === i} className={`v2-option ${state}`} disabled={locked} onClick={() => setPicked(i)}>
              <span className="v2-letter" aria-hidden="true">{LETTER[i]}</span><span><InlineMd text={o} /></span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function NumericView({ step, locked, reveal, onReady, onSnapshot }: ViewProps<Of<'numeric'>>) {
  const t = useT()
  const [text, setText] = useState('')
  useEffect(() => {
    const n = parseNumber(text)
    onReady(n === null ? null : () => checkNumeric(step, n))
  }, [text, step, onReady])
  useEffect(() => { onSnapshot?.(text.trim() ? `Yazdığı: ${text.trim().slice(0, 40)}${step.unit ? ` ${step.unit}` : ''}` : '') }, [text, step.unit, onSnapshot])
  return (
    <div className="v2-q">
      <p className="v2-prompt"><InlineMd text={step.prompt} /></p>
      {step.code && <CodeBlock code={step.code} />}
      <label className="v2-number">
        <span className="sr-only">{t('lesson.steps.yourAnswer')}</span>
        <input inputMode="decimal" value={reveal ? String(step.answer) : text} disabled={locked} onChange={(e) => setText(e.target.value)} placeholder={t('lesson.steps.yourAnswer')} autoFocus />
        {step.unit && <span className="v2-unit">{step.unit}</span>}
      </label>
    </div>
  )
}

export function FillView({ step, seed, locked, reveal, onReady, onSnapshot }: ViewProps<Of<'fill'>>) {
  const t = useT()
  const parts = useMemo(() => splitBlanks(step.code), [step.code])
  const n = parts.length - 1
  const [filled, setFilled] = useState<(string | null)[]>(() => Array(n).fill(null))
  const [cursor, setCursor] = useState(0)
  const tokens = useMemo(() => seededShuffle(step.tokens, seed), [step.tokens, seed])
  useEffect(() => { onReady(filled.every((x) => x !== null) ? () => checkFill(step, filled) : null) }, [filled, step, onReady])
  useEffect(() => { onSnapshot?.(filled.some((x) => x !== null) ? `Boşluklar: ${filled.map((x, i) => `[${i + 1}] ${x ?? '(boş)'}`).join(', ')}` : '') }, [filled, onSnapshot])
  const shown = reveal ? step.answer : filled
  const put = (t: string) => {
    if (locked) return
    const at = filled[cursor] === null ? cursor : filled.findIndex((x) => x === null)
    if (at < 0) return
    const next = [...filled]; next[at] = t
    setFilled(next)
    const after = next.findIndex((x) => x === null)
    setCursor(after < 0 ? at : after)
  }
  const clear = (i: number) => { if (locked) return; const next = [...filled]; next[i] = null; setFilled(next); setCursor(i) }
  return (
    <div className="v2-q">
      <p className="v2-prompt"><InlineMd text={step.prompt} /></p>
      <pre className="v2-code v2-fill" aria-label={t('lesson.steps.blankCode')}>
        <code>
          {parts.map((p, i) => (
            <span key={i}>
              {p}
              {i < n && (
                <button type="button" className={`v2-slot ${shown[i] ? 'full' : ''} ${cursor === i && !locked ? 'cur' : ''}`} disabled={locked} onClick={() => (shown[i] ? clear(i) : setCursor(i))} aria-label={shown[i] ? t('lesson.steps.slotFilled', { n: i + 1, value: shown[i] ?? '' }) : t('lesson.steps.slot', { n: i + 1 })}>
                  {shown[i] ?? BLANK.replace(/_/g, ' ')}
                </button>
              )}
            </span>
          ))}
        </code>
      </pre>
      <div className="v2-tokens" aria-label={t('lesson.steps.codeParts')}>
        {tokens.map((t, i) => <button key={`${t}-${i}`} type="button" className="v2-token" disabled={locked} onClick={() => put(t)}>{t}</button>)}
        {!locked && <button type="button" className="v2-token ghost" onClick={() => { setFilled(Array(n).fill(null)); setCursor(0) }}>{t('lesson.steps.clear')}</button>}
      </div>
    </div>
  )
}

export function OrderView({ step, seed, locked, reveal, onReady, onSnapshot }: ViewProps<Of<'order'>>) {
  const t = useT()
  const pool0 = useMemo(() => seededShuffle(step.lines, seed), [step.lines, seed])
  const [chosen, setChosen] = useState<string[]>([])
  useEffect(() => { onReady(chosen.length === step.lines.length ? () => checkOrder(step, chosen) : null) }, [chosen, step, onReady])
  useEffect(() => {
    const rest = step.lines.length - chosen.length
    onSnapshot?.(chosen.length ? `Dizdiği sıra: ${chosen.map((l, i) => `${i + 1}) ${l}`).join(' | ')}${rest ? ` (${rest} satır daha yerleşmedi)` : ''}` : '')
  }, [chosen, step.lines.length, onSnapshot])
  const shown = reveal ? step.lines : chosen
  const pool = pool0.filter((l) => !chosen.includes(l))
  return (
    <div className="v2-q">
      <p className="v2-prompt"><InlineMd text={step.prompt} /></p>
      <ol className="v2-order" aria-label={t('lesson.steps.yourOrder')}>
        {shown.map((l, i) => (
          <li key={l}><button type="button" disabled={locked} onClick={() => setChosen(chosen.filter((x) => x !== l))}><span className="n">{i + 1}</span><code>{l}</code></button></li>
        ))}
        {!reveal && Array.from({ length: step.lines.length - shown.length }, (_, i) => <li key={`e${i}`} className="empty"><span className="n">{shown.length + i + 1}</span></li>)}
      </ol>
      {!locked && pool.length > 0 && (
        <div className="v2-tokens v2-pool" aria-label={t('lesson.steps.lines')}>
          {pool.map((l) => <button key={l} type="button" className="v2-token code" onClick={() => setChosen([...chosen, l])}>{l}</button>)}
        </div>
      )}
    </div>
  )
}

export function WidgetView({ step, locked, onReady, onSnapshot }: ViewProps<Of<'widget'>>) {
  const onMetrics = useCallback((m: Record<string, number>) => {
    onReady(() => step.goals.every((g) => goalMet(g, m)))
    onSnapshot?.(`Ayarlar: ${Object.entries(m).map(([k, v]) => `${k}=${v}`).join(', ')}. Hedefler: ${step.goals.map((g) => `${g.label} ${goalMet(g, m) ? '✓' : '✗'}`).join('; ')}`)
  }, [step.goals, onReady, onSnapshot])
  return (
    <div className="v2-q">
      <p className="v2-prompt"><InlineMd text={step.prompt} /></p>
      <Widget spec={step.widget} goals={step.goals} locked={locked} onMetrics={onMetrics} />
    </div>
  )
}

export function ActivityView({ step, activityKey, lessonId, onReady }: ViewProps<Of<'activity'>> & { activityKey: string | null; lessonId: number }) {
  const [done, setDone] = useState(false)
  useEffect(() => { onReady(() => done) }, [done, onReady])
  return (
    <div className="v2-q v2-activity">
      <p className="v2-prompt"><InlineMd text={step.prompt} /></p>
      <LessonActivity activityKey={activityKey} lessonId={lessonId} onGoals={() => setDone(true)} />
    </div>
  )
}
