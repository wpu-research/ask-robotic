'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  lesson: { id: number; title: string; durationMin: number; problem: string; contentMd: string; question: string }
  moduleTitle: string
  moduleSlug: string
  weekLabel: string
  position: { index: number; total: number }
  nextLessonId: number | null
  alreadyDone: boolean
}

// Hyvex formatı: problem → kavram/etkinlik → soru → bitir
const STEPS = ['Merak', 'Etkinlik', 'Konuşalım', 'Bitti'] as const

export function LessonPlayer(p: Props) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(p.alreadyDone)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function finish() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lessonId: p.lesson.id }),
    })
    setBusy(false)
    if (res.ok) setDone(true)
    else setError('İlerleme kaydedilemedi, tekrar dene')
  }

  const btn = { padding: '10px 18px', fontSize: 16, cursor: 'pointer' } as const
  return (
    <main style={{ maxWidth: 720, margin: '6vh auto', padding: '0 16px' }}>
      <p style={{ color: '#666', margin: 0 }}>
        <a href={`/moduller/${p.moduleSlug}`}>{p.moduleTitle}</a> · {p.weekLabel} · Ders {p.position.index}/{p.position.total}
      </p>
      <h1 style={{ marginTop: 8 }}>{p.lesson.title}</h1>
      <p style={{ color: '#666' }}>Yaklaşık {p.lesson.durationMin} dakika</p>

      <ol aria-label="Ders adımları" style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0 }}>
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? 'step' : undefined}
            style={{ flex: 1, textAlign: 'center', padding: 6, borderBottom: `3px solid ${i <= step ? '#2563eb' : '#ddd'}`, fontWeight: i === step ? 700 : 400 }}
          >
            {s}
          </li>
        ))}
      </ol>

      <section style={{ minHeight: 200, fontSize: 18, lineHeight: 1.6 }}>
        {step === 0 && <p style={{ fontSize: 22 }}>{p.lesson.problem}</p>}
        {step === 1 && <ReactMarkdown>{p.lesson.contentMd}</ReactMarkdown>}
        {step === 2 && (
          <>
            <p style={{ color: '#666' }}>Birlikte konuşun:</p>
            <p style={{ fontSize: 22 }}>{p.lesson.question}</p>
          </>
        )}
        {step === 3 && (
          <>
            {done ? <p>Ders tamamlandı ✓</p> : <p>Etkinliği bitirdiniz mi?</p>}
            {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
            {!done && <button style={btn} disabled={busy} onClick={finish}>Dersi tamamladım</button>}
            {done && (
              <p>
                {p.nextLessonId ? <a href={`/ders/${p.nextLessonId}`}>Sonraki ders →</a> : <a href={`/moduller/${p.moduleSlug}`}>Modül sayfasına dön</a>}
              </p>
            )}
          </>
        )}
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>← Geri</button>
        <button style={btn} disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>İleri →</button>
      </div>
    </main>
  )
}
