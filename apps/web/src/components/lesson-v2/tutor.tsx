'use client'
import '@/app/tutor.css'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getDeviceId } from '@/lib/events'
import { useProfile } from '@/lib/profile'
import { historyForRequest, tutorErrorText, type ChatMsg } from '@/lib/tutor/client'
import { useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'
import { MAX_CHARS, visibleText } from '@/lib/tutor/protocol'
import { InlineMd, plain } from './inline-md'
import { Mascot } from './mascot'

// Robi sohbet paneli: ders oynatıcısında alttan açılır. Sunucu: /api/tutor (düz metin akışı).

export type TutorStatus = 'idle' | 'wrong' | 'correct' | 'revealed'

export interface TutorPanelProps {
  open: boolean
  onClose: () => void
  lessonId: number
  stepIndex: number
  status: TutorStatus
  attempts: number
  /** Öğrencinin şu anki cevabı (adım görünümünün onSnapshot'ı). */
  snapshot: string
  interactive: boolean
  /** Sesli anlatım açıksa cevabı okur. */
  say: (text: string) => void
}

const CHIPS: MessageKey[] = ['lesson.tutor.chipHint', 'lesson.tutor.chipExplain', 'lesson.tutor.chipMistake']

// ---- Konuşma tanıma (Web Speech API); desteklenmiyorsa mikrofon gizlenir ----
interface SpeechRec { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; stop(): void; abort(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }
type SpeechRecCtor = new () => SpeechRec
const recCtor = (): SpeechRecCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
const noop = () => () => {}

export function TutorPanel(p: TutorPanelProps) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [offline, setOffline] = useState(false)
  const [listening, setListening] = useState(false)
  const profile = useProfile()
  const t = useT()
  const locale = useLocale()
  const micSupported = useSyncExternalStore(noop, () => !!recCtor(), () => false)
  const abort = useRef<AbortController | null>(null)
  const rec = useRef<SpeechRec | null>(null)
  const listEnd = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { listEnd.current?.scrollIntoView({ block: 'end' }) }, [msgs])
  useEffect(() => { if (p.open) inputRef.current?.focus({ preventScroll: true }) }, [p.open])
  useEffect(() => () => { abort.current?.abort(); rec.current?.abort() }, [])
  // Esc ile kapat
  useEffect(() => {
    if (!p.open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); p.onClose() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [p.open, p.onClose]) // eslint-disable-line react-hooks/exhaustive-deps

  const patchLast = (content: string, local = false) =>
    setMsgs((m) => (m.length ? [...m.slice(0, -1), { ...m[m.length - 1], content, local }] : m))

  async function send(raw: string) {
    const text = raw.trim().slice(0, MAX_CHARS)
    if (!text || busy || offline) return
    const next: ChatMsg[] = [...msgs, { role: 'user', content: text }]
    setMsgs([...next, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    const ctrl = new AbortController()
    abort.current = ctrl
    let shown = ''
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          lessonId: p.lessonId, stepIndex: p.stepIndex, status: p.status, attempts: p.attempts,
          answerSnapshot: p.snapshot.slice(0, MAX_CHARS), messages: historyForRequest(next),
          deviceId: getDeviceId(), locale, ...(profile?.age ? { age: profile.age } : {}),
        }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null) as { error?: string } | null
        if (err?.error === 'tutor_disabled') setOffline(true)
        patchLast(tutorErrorText(err?.error, locale), true)
        return
      }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        shown = visibleText(acc)
        patchLast(shown)
      }
      acc += dec.decode()
      shown = visibleText(acc)
      patchLast(shown)
      if (shown) p.say(plain(shown))
    } catch {
      if (!ctrl.signal.aborted) patchLast(shown || tutorErrorText(undefined, locale), !shown)
    } finally {
      setBusy(false)
      if (abort.current === ctrl) abort.current = null
    }
  }

  function toggleMic() {
    const Ctor = recCtor()
    if (!Ctor) return
    if (listening) { rec.current?.stop(); return }
    const r = new Ctor()
    r.lang = locale === 'en' ? 'en-US' : 'tr-TR'
    r.interimResults = true
    r.maxAlternatives = 1
    r.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0]?.transcript ?? ''
      setInput(t.slice(0, MAX_CHARS))
    }
    r.onend = () => { setListening(false); rec.current = null }
    r.onerror = () => { setListening(false); rec.current = null }
    rec.current = r
    setListening(true)
    try { r.start() } catch { setListening(false); rec.current = null }
  }

  if (!p.open) return null
  const chips = (p.interactive ? CHIPS : CHIPS.slice(0, 2)).map((c) => t(c))
  return (
    <section className="tutor-panel" role="dialog" aria-modal="false" aria-label={t('lesson.tutor.dialog')}>
      <header className="tutor-head">
        <Mascot mood={busy ? 'think' : 'idle'} size={34} />
        <div className="tutor-title"><b>Robi</b><span>{offline ? t('lesson.tutor.offline') : busy ? t('lesson.tutor.thinking') : t('lesson.tutor.ready')}</span></div>
        <button type="button" className="v2-icon-btn" onClick={p.onClose} aria-label={t('lesson.tutor.close')}>✕</button>
      </header>

      <div className="tutor-list" aria-live="polite">
        {msgs.length === 0 && (
          <p className="tutor-msg bot">{offline ? t('lesson.tutor.err.offline') : t('lesson.tutor.greeting')}</p>
        )}
        {msgs.map((m, i) => (
          <p key={i} className={`tutor-msg ${m.role === 'user' ? 'me' : 'bot'} ${m.local ? 'note' : ''}`}>
            {m.content ? <InlineMd text={m.content} /> : <span className="tutor-dots" aria-label={t('lesson.tutor.typing')}><i /><i /><i /></span>}
          </p>
        ))}
        <div ref={listEnd} />
      </div>

      {!offline && (
        <div className="tutor-chips" aria-label={t('lesson.tutor.quickQuestions')}>
          {chips.map((c) => <button key={c} type="button" className="tutor-chip" disabled={busy} onClick={() => void send(c)}>{c}</button>)}
        </div>
      )}

      <form className="tutor-form" onSubmit={(e) => { e.preventDefault(); void send(input) }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
          placeholder={offline ? t('lesson.tutor.placeholderOffline') : listening ? t('lesson.tutor.placeholderListening') : t('lesson.tutor.placeholder')}
          aria-label={t('lesson.tutor.inputLabel')}
          maxLength={MAX_CHARS}
          disabled={offline}
          enterKeyHint="send"
        />
        {micSupported && !offline && (
          <button type="button" className={`tutor-mic ${listening ? 'on' : ''}`} onClick={toggleMic} aria-pressed={listening} aria-label={listening ? t('lesson.tutor.micStop') : t('lesson.tutor.mic')} title={t('lesson.tutor.mic')}>🎤</button>
        )}
        <button type="submit" className="tutor-send" disabled={busy || offline || !input.trim()} aria-label={t('lesson.tutor.send')}>➤</button>
      </form>
    </section>
  )
}
