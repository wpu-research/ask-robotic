import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LEGAL_LINKS } from '@/lib/legal-links'
import { LEGAL } from '../metinler'
import '../../odeme.css'

export const dynamicParams = false
export const generateStaticParams = () => Object.keys(LEGAL).map((slug) => ({ slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = LEGAL[(await params).slug]
  return { title: doc ? `${doc.title} (taslak)` : 'Yasal', robots: { index: false } }
}

export default async function Yasal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = LEGAL[slug]
  if (!doc) notFound()
  return (
    <div className="page lg">
      <nav className="lg-nav" aria-label="Yasal metinler">
        {LEGAL_LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={l.href === `/yasal/${slug}` ? 'page' : undefined}>{l.label}</Link>)}
      </nav>
      <article>
        <h1>{doc.title}</h1>
        <p className="lg-draft" role="note">TASLAK — hukukçu onayı gerekir. Bu metin bağlayıcı değildir; köşeli parantezli alanlar doldurulmadan ve hukuki inceleme yapılmadan yayımlanmamalıdır.</p>
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((t) => <p key={t}>{t}</p>)}
          </section>
        ))}
      </article>
    </div>
  )
}
