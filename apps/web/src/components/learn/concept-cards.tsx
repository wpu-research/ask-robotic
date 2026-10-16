'use client'
import type { Concept } from '@ask/db'
import { useLocale } from '@/i18n/client'
import { InlineMd } from '../lesson-v2/inline-md'

/** Kavram kartları: terim, tanım, tek cümlelik örnek ve sık yapılan yanlış. */
export function ConceptCards({ concepts }: { concepts: Concept[] }) {
  const en = useLocale() === 'en'
  return (
    <section className="concepts" aria-labelledby="kavramlar-b">
      <h2 id="kavramlar-b" className="concepts-title">{en ? 'Concept cards' : 'Kavram kartları'}</h2>
      <ul className="concept-grid">
        {concepts.map((c) => (
          <li key={c.term} className="concept-card">
            <h3>{c.term}</h3>
            <p className="concept-def"><InlineMd text={c.definition} /></p>
            <p className="concept-ex"><b>{en ? 'Example:' : 'Örnek:'}</b> <InlineMd text={c.example} /></p>
            <p className="concept-pit"><b>{en ? 'Common mistake:' : 'Sık yapılan yanlış:'}</b> <InlineMd text={c.pitfall} /></p>
          </li>
        ))}
      </ul>
    </section>
  )
}
