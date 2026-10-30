'use client'
// "Yapay zekâyla devre kur": isteği yaz, LLM bağlantı listesi üretir (sunucuda doğrulanıp yerleştirilir), editöre uygulanır; Geri al ile eski devre döner.
import { useEffect, useState } from 'react'
import { useMemberGate } from '@/components/paywall/member-gate'
import { useLocale } from '@/i18n/client'
import { EXAMPLE_PROMPTS, MAX_PROMPT } from '@/lib/lab/ai-circuit'
import type { Circuit } from '@/lib/lab/contract'

export interface AiResult { circuit: Circuit; code?: string; note?: string; warnings: string[]; remaining?: number }

const ERR = {
  tr: {
    ai_disabled: 'Yapay zekâ şu an kapalı.', daily_limit: 'Bugünlük yapay zekâ hakkın doldu. Yarın tekrar dene.', too_fast: 'Biraz yavaş: bir dakika sonra tekrar dene.',
    bad_output: 'Devre kurulamadı. İsteği biraz farklı yazıp tekrar dene.', ai_busy: 'Yapay zekâ şu an yoğun, birazdan tekrar dene.', bad_prompt: 'İsteği 1-500 karakter yaz.',
    net: 'Bağlantı kurulamadı.', other: 'Bir şey ters gitti, tekrar dene.',
  },
  en: {
    ai_disabled: 'AI is currently turned off.', daily_limit: 'You have used your AI requests for today. Try again tomorrow.', too_fast: 'Slow down a little: try again in a minute.',
    bad_output: 'Could not build the circuit. Try phrasing the request differently.', ai_busy: 'AI is busy right now, try again shortly.', bad_prompt: 'Write a request of 1-500 characters.',
    net: 'Could not connect.', other: 'Something went wrong, try again.',
  },
} as const

export function LabAiPanel({ circuit, onApply, onUndo, canUndo, disabled }: { circuit: Circuit; onApply: (r: AiResult) => void; onUndo: () => void; canUndo: boolean; disabled?: boolean }) {
  const en = useLocale() === 'en'
  const L = (tr: string, e: string) => (en ? e : tr)
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<AiResult | null>(null)
  const [guest, setGuest] = useState<boolean | null>(null)
  const gate = useMemberGate(guest === true, '/laboratuvar')

  // Giriş durumu panel açılınca bir kez öğrenilir (misafir istek yapamaz: üye ol penceresi çıkar)
  useEffect(() => {
    if (!open || guest !== null) return
    fetch('/api/me', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j: { user?: unknown } | null) => setGuest(j ? !j.user : true)).catch(() => setGuest(true))
  }, [open, guest])

  const build = async () => {
    const text = prompt.trim()
    if (!text || busy) return
    if (guest === true) { gate.ask(); return }
    setBusy(true); setError(''); setDone(null)
    try {
      const res = await fetch('/api/lab/ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: text, locale: en ? 'en' : 'tr', current: circuit }) })
      const j = await res.json().catch(() => ({})) as Partial<AiResult> & { error?: string; detail?: string }
      if (res.status === 401) { setGuest(true); gate.ask(); return }
      if (!res.ok || j.error) {
        const e = ERR[en ? 'en' : 'tr']
        setError(j.error === 'empty' && j.detail ? j.detail : (e as Record<string, string>)[j.error ?? 'other'] ?? e.other)
        return
      }
      if (!j.circuit) { setError(L('Devre kurulamadı.', 'Could not build the circuit.')); return }
      const r = j as AiResult
      onApply(r); setDone(r)
    } catch { setError(ERR[en ? 'en' : 'tr'].net) } finally { setBusy(false) }
  }

  return (
    <section className="lab-ai" data-testid="lab-ai">
      <button type="button" className="lab-ai-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)} data-testid="lab-ai-toggle">
        🤖 {L('Yapay zekâyla devre kur', 'Build a circuit with AI')} <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="lab-ai-body">
          <label className="lab-ai-field">
            <span>{L('Ne yapmak istiyorsun? Türkçe ya da İngilizce yaz.', 'What do you want to build? Write in plain words.')}</span>
            <textarea value={prompt} maxLength={MAX_PROMPT} rows={2} disabled={disabled || busy} onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void build() } }}
              placeholder={L('Örnek: Butona basınca LED yansın', 'Example: Turn an LED on while a button is pressed')} data-testid="lab-ai-prompt" />
          </label>
          <div className="lab-ai-chips" role="group" aria-label={L('Örnek istekler', 'Example requests')}>
            {EXAMPLE_PROMPTS.map((p) => <button key={p.tr} type="button" className="lab-ai-chip" disabled={busy} onClick={() => setPrompt(en ? p.en : p.tr)}>{en ? p.en : p.tr}</button>)}
          </div>
          <div className="lab-ai-bar">
            <button type="button" className="lab-ai-go" onClick={() => void build()} disabled={disabled || busy || !prompt.trim()} data-testid="lab-ai-build">
              {busy ? L('Kuruluyor…', 'Building…') : `✨ ${L('Devreyi kur', 'Build the circuit')}`}
            </button>
            {canUndo && <button type="button" className="lab-ai-undo" onClick={() => { onUndo(); setDone(null) }} data-testid="lab-ai-undo">↶ {L('Geri al', 'Undo')}</button>}
            <span className="lab-ai-hint">{L('Mevcut devren yeni istekle birlikte değerlendirilir.', 'Your current circuit is taken into account.')}</span>
          </div>
          {error && <p className="lab-ai-err" role="alert" data-testid="lab-ai-error">{error}</p>}
          {done && (
            <div className="lab-ai-done" role="status" data-testid="lab-ai-done">
              <p>✅ {L('Devre kuruldu. Kodu da yazdım: ▶ düğmesiyle çalıştır.', 'Circuit built, and I wrote the code too: press ▶ to run it.')}</p>
              {done.note && <p className="lab-ai-note">{done.note}</p>}
              {done.warnings.length > 0 && (
                <details><summary>{L(`${done.warnings.length} uyarı`, `${done.warnings.length} notes`)}</summary><ul>{done.warnings.map((w) => <li key={w}>{w}</li>)}</ul></details>
              )}
            </div>
          )}
        </div>
      )}
      {gate.dialog}
    </section>
  )
}
