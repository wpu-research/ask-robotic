'use client'
// Hafta sonu "Kendini sına": çoktan seçmeli sorular, anında geri bildirim ve açıklama. Sonuç saklanmaz.
import { useState } from 'react'
import type { QuizItem } from '@/lib/robotik/course'

export function Quiz({ items, lang }: { items: QuizItem[]; lang: 'tr' | 'en' }) {
  const [picked, setPicked] = useState<Array<number | null>>(() => items.map(() => null))
  const en = lang === 'en'
  const done = picked.filter((p) => p !== null).length
  const right = picked.filter((p, i) => p === items[i].answer).length
  return (
    <section className="rb-quiz" aria-labelledby="rb-quiz-h" data-testid="rb-quiz">
      <h2 id="rb-quiz-h">{en ? 'Check yourself' : 'Kendini sına'}</h2>
      <ol>
        {items.map((it, i) => {
          const p = picked[i]
          return (
            <li key={it.q}>
              <p className="rb-q">{it.q}</p>
              <div className="rb-opts" role="group" aria-label={it.q}>
                {it.options.map((o, k) => {
                  const state = p === null ? '' : k === it.answer ? 'ok' : k === p ? 'bad' : 'dim'
                  return (
                    <button key={o} type="button" className={`rb-opt ${state}`} disabled={p !== null} aria-pressed={p === k}
                      onClick={() => setPicked((a) => a.map((x, j) => (j === i ? k : x)))}>
                      <span className="rb-opt-k">{'ABCD'[k]}</span>{o}
                    </button>
                  )
                })}
              </div>
              {p !== null && <p className={`rb-why ${p === it.answer ? 'ok' : 'bad'}`} role="status">{p === it.answer ? (en ? 'Correct. ' : 'Doğru. ') : (en ? 'Not quite. ' : 'Tam değil. ')}{it.why}</p>}
            </li>
          )
        })}
      </ol>
      {done === items.length && (
        <p className="rb-score">{en ? `Score: ${right} / ${items.length}` : `Puan: ${right} / ${items.length}`}
          <button type="button" onClick={() => setPicked(items.map(() => null))}>{en ? 'Try again' : 'Yeniden dene'}</button></p>
      )}
    </section>
  )
}
