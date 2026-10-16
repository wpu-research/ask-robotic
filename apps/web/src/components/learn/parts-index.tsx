'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { searchGuides } from '@/lib/parca-rehberi'
import type { ComponentGuide } from '@ask/db'
import { useT } from '@/i18n/client'

/** Parça ansiklopedisi dizini: arama kutusu + kategoriye göre kartlar. Liste sunucuda dile göre hazırlanır (parca-rehberi-i18n). */
export function PartsIndex({ guides }: { guides: ComponentGuide[] }) {
  const t = useT()
  const [q, setQ] = useState('')
  const found = useMemo(() => searchGuides(guides, q), [guides, q])
  const cats = useMemo(() => [...new Set(found.map((g) => g.category))], [found])
  return (
    <>
      <div className="parts-search">
        <label htmlFor="parca-ara" className="sr-only">{t('content.parts.searchLabel')}</label>
        <input id="parca-ara" type="search" className="quiz-input" placeholder={t('content.parts.searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        <span className="muted" aria-live="polite">{t('content.parts.count', { n: found.length })}</span>
      </div>
      {found.length === 0 && <p className="muted">{t('content.parts.none', { q })}</p>}
      {cats.map((c) => (
        <section key={c} aria-label={c} className="parts-cat">
          <h2>{c}</h2>
          <ul className="parts-grid">
            {found.filter((g) => g.category === c).map((g) => (
              <li key={g.slug}>
                <Link href={`/parcalar/${g.slug}`} className="part-card">
                  <h3>{g.title}</h3>
                  <p>{g.summary}</p>
                  <span className="part-pins">{g.pins.length > 8 ? t('content.parts.pinCount', { n: g.pins.length }) : g.pins.map((p) => p.name).join(' · ')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
