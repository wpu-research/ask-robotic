'use client'
// Kariyer anketi: soru soru ilerler, sonra ad + e-posta + KVKK onayı ister, kaydedince en uygun üç hedefi gösterir.
// Sonuç sunucunun hesabıdır (/api/kariyer-anketi); istemci yalnız gösterir.
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/client'
import { careerHours, careerOf } from '@/lib/kariyer'
import { QUESTIONS, weeklyHours, type Answers, type Match } from '@/lib/kariyer-anket'

type Phase = { k: 'q'; i: number } | { k: 'form' } | { k: 'done'; result: Match[] }

export function CareerSurvey() {
  const lang = useLocale()
  const en = lang === 'en'
  const [phase, setPhase] = useState<Phase>({ k: 'q', i: 0 })
  const [answers, setAnswers] = useState<Answers>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [contact, setContact] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const resultHead = useRef<HTMLHeadingElement>(null)

  // Sonuç gelince odağı başlığa taşı (form kalkınca odak kaybolmasın, ekran okuyucu sonucu okusun)
  useEffect(() => { if (phase.k === 'done') { resultHead.current?.focus(); resultHead.current?.scrollIntoView({ block: 'start' }) } }, [phase.k])

  const total = QUESTIONS.length
  const step = phase.k === 'q' ? phase.i : total

  const choose = (qid: string, oid: string) => {
    setAnswers((a) => ({ ...a, [qid]: oid }))
    setPhase((p) => (p.k === 'q' && p.i + 1 < total ? { k: 'q', i: p.i + 1 } : { k: 'form' }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!kvkk) { setError(en ? 'Please accept the privacy notice to see your result.' : 'Sonucunu görmek için aydınlatma metnini onayla.'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/kariyer-anketi', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, email, answers, consentKvkk: kvkk, consentContact: contact, locale: lang }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(res.status === 400 ? (en ? 'Check your name and email.' : 'Adını ve e-postanı kontrol et.') : (data.error ?? (en ? 'Could not save, try again.' : 'Kaydedilemedi, tekrar dene.'))); return }
      setPhase({ k: 'done', result: data.result })
    } catch {
      setError(en ? 'No connection, try again.' : 'Bağlantı yok, tekrar dene.')
    } finally {
      setBusy(false)
    }
  }

  if (phase.k === 'done') {
    const weekly = weeklyHours(answers)
    return (
      <div className="ks-result" data-testid="survey-result">
        <h2 ref={resultHead} tabIndex={-1}>{en ? `${name.split(' ')[0]}, these paths suit you best` : `${name.split(' ')[0]}, sana en uygun yollar`}</h2>
        <p className="muted">{en ? `At about ${weekly} hours a week. Open a path to see its courses in order.` : `Haftada yaklaşık ${weekly} saatle. Bir yolu aç, derslerini sırayla gör.`}</p>
        <ol className="ks-top">
          {phase.result.map((m, i) => {
            const c = careerOf(m.slug)!
            const hours = careerHours(c)
            return (
              <li key={m.slug} className={i === 0 ? 'first' : ''}>
                <Link href={`/yol-haritasi#hedef-${m.slug}`}>
                  <span className="ks-pct">%{m.pct}</span>
                  <span className="ks-body">
                    <b>{c[lang].title}</b>
                    <small>{c[lang].summary}</small>
                    <span className="ks-meta">{en ? `${c.core.length} courses · ${hours} h · about ${Math.ceil(hours / weekly)} weeks` : `${c.core.length} ders · ${hours} saat · yaklaşık ${Math.ceil(hours / weekly)} hafta`}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
        <p className="muted ks-note">{contact ? (en ? 'Thanks! We will get in touch by email to help you start.' : 'Teşekkürler! Başlaman için e-postayla seninle iletişime geçeceğiz.') : (en ? 'Your answers are saved.' : 'Cevapların kaydedildi.')}</p>
        <button type="button" className="v2-btn ghost" onClick={() => { setAnswers({}); setPhase({ k: 'q', i: 0 }) }}>{en ? 'Take it again' : 'Baştan al'}</button>
      </div>
    )
  }

  return (
    <div className="ks">
      <div className="ks-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step} aria-label={en ? 'Progress' : 'İlerleme'}>
        <span style={{ width: `${(100 * step) / total}%` }} />
      </div>
      {phase.k === 'q' ? (
        <fieldset className="ks-q" key={phase.i}>
          <legend><span className="ks-n">{phase.i + 1} / {total}</span>{QUESTIONS[phase.i][lang]}</legend>
          <div className="ks-opts">
            {QUESTIONS[phase.i].opts.map((o) => (
              <button key={o.id} type="button" className="ks-opt" aria-pressed={answers[QUESTIONS[phase.i].id] === o.id} data-testid={`opt-${QUESTIONS[phase.i].id}-${o.id}`} onClick={() => choose(QUESTIONS[phase.i].id, o.id)}>{o[lang]}</button>
            ))}
          </div>
          {phase.i > 0 && <button type="button" className="ks-back" onClick={() => setPhase({ k: 'q', i: phase.i - 1 })}>← {en ? 'Back' : 'Geri'}</button>}
        </fieldset>
      ) : (
        <form className="ks-form" onSubmit={submit} noValidate>
          <h2>{en ? 'Last step: where should we send your result?' : 'Son adım: sonucunu kime gösterelim?'}</h2>
          <p className="muted">{en ? 'Enter your name and email to see your three best-fitting paths.' : 'Sana en uygun üç yolu görmek için adını ve e-postanı yaz.'}</p>
          <label>{en ? 'Full name' : 'Ad soyad'}<input name="name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} data-testid="survey-name" /></label>
          <label>{en ? 'Email' : 'E-posta'}<input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} data-testid="survey-email" /></label>
          <label className="ks-check"><input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} data-testid="survey-kvkk" />
            <span>{en ? 'I am 16 or older and I have read the ' : '16 yaşından büyüğüm; '}<Link href="/yasal/kvkk-aydinlatma" target="_blank">{en ? 'privacy notice' : 'KVKK aydınlatma metnini'}</Link>{en ? '. My name, email and answers may be stored to show and improve my result.' : ' okudum. Adım, e-postam ve cevaplarım sonucumu göstermek ve iyileştirmek için saklanabilir.'}</span></label>
          <label className="ks-check"><input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} data-testid="survey-contact" />
            <span>{en ? 'You may email me about courses and programmes (optional).' : 'Dersler ve programlar hakkında bana e-posta gönderebilirsiniz (isteğe bağlı).'}</span></label>
          {error && <p className="ks-error" role="alert">{error}</p>}
          <div className="ks-actions">
            <button type="button" className="ks-back" onClick={() => setPhase({ k: 'q', i: total - 1 })}>← {en ? 'Back' : 'Geri'}</button>
            <button type="submit" className="btn btn-primary" disabled={busy} data-testid="survey-submit">{busy ? (en ? 'Saving…' : 'Kaydediliyor…') : (en ? 'Show my result' : 'Sonucumu göster')}</button>
          </div>
        </form>
      )}
    </div>
  )
}
