import type { Concept } from '@ask/db'

/** Kavram kartları: terim, tanım, tek cümlelik örnek ve sık yapılan yanlış. */
export function ConceptCards({ concepts }: { concepts: Concept[] }) {
  return (
    <section className="concepts" aria-labelledby="kavramlar-b">
      <h2 id="kavramlar-b" className="concepts-title">Kavram kartları</h2>
      <ul className="concept-grid">
        {concepts.map((c) => (
          <li key={c.term} className="concept-card">
            <h3>{c.term}</h3>
            <p className="concept-def">{c.definition}</p>
            <p className="concept-ex"><b>Örnek:</b> {c.example}</p>
            <p className="concept-pit"><b>Sık yapılan yanlış:</b> {c.pitfall}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
