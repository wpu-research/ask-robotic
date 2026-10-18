import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InstructorPhoto } from '@/components/egitmen/instructor-card'
import { Icon } from '@/components/shell/icons'
import { getLocale, getT } from '@/i18n/server'
import { INSTRUCTORS, instructorBySlug, instructorHref, jsonLdString, personJsonLd } from '@/lib/egitmen/egitmenler'
import { SITE_URL } from '@/lib/site'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => INSTRUCTORS.map((i) => ({ slug: i.slug }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const ins = instructorBySlug((await params).slug)
  if (!ins) return {}
  const lang = await getLocale()
  const t = ins[lang]
  const url = `${SITE_URL}${instructorHref(ins)}`
  return {
    title: ins.name,
    description: t.role,
    alternates: { canonical: url },
    openGraph: {
      type: 'profile', siteName: 'MacademiaX', url, locale: lang === 'en' ? 'en_US' : 'tr_TR',
      title: `${ins.name} · MacademiaX`, description: t.role,
      firstName: ins.given, lastName: ins.family,
      images: [{ url: ins.photo.jpg480, width: 480, height: 480, alt: ins.name }],
    },
    twitter: { card: 'summary', title: ins.name, description: t.role, images: [ins.photo.jpg480] },
  }
}

/** Eğitmen profili: fotoğraf, görev, biyografi, uzmanlık, sitedeki dersleri, yayınlar ve tezler. */
export default async function EgitmenProfil({ params }: Params) {
  const ins = instructorBySlug((await params).slug)
  if (!ins) notFound()
  const lang = await getLocale()
  const T = await getT()
  const c = ins[lang]
  return (
    <div className="page ins">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(personJsonLd(ins, lang)) }} />
      <nav aria-label={T('instructor.crumbs')} className="crumbs">
        <Link href="/">{T('instructor.home')}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{ins.name}</span>
      </nav>

      <header className="ins-hero">
        <InstructorPhoto instructor={ins} size={480} alt={T('instructor.photoAlt', { name: ins.name })} />
        <div>
          <p className="eyebrow">{T('instructor.eyebrow')}</p>
          <h1>{ins.name}</h1>
          <p className="lead">{c.role}</p>
          <ul className="ins-tags" aria-label={T('instructor.expertise')}>
            {c.expertise.map((e) => <li key={e} className="chip chip-brand">{e}</li>)}
          </ul>
        </div>
      </header>

      <div className="ins-grid">
        <section className="ins-sec ins-bio" aria-labelledby="ins-about">
          <h2 id="ins-about">{T('instructor.about')}</h2>
          {c.bio.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </section>

        <aside className="ins-side">
          <section className="ins-sec" aria-labelledby="ins-courses">
            <h2 id="ins-courses">{T('instructor.courses')}</h2>
            <ul className="ins-courses">
              {ins.courses.map((k) => (
                <li key={k.href}>
                  <Link href={k.href} data-testid={`ins-course-${k.href.slice(1).replace(/\//g, '-')}`}>
                    <span>{k.code && <span className="code">{k.code}</span>}{k[lang]}</span>
                    <Icon name="chevronRight" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <div className="ins-yt">
            <span className="ins-yt-icon"><Icon name="play" size={18} /></span>
            <div>
              <b>{T('instructor.youtube')} <span className="chip chip-soon">{T('common.soon')}</span></b>
              <p>{T('instructor.youtubeSoon')}</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="ins-sec" aria-labelledby="ins-pubs">
        <h2 id="ins-pubs">{T('instructor.publications')}</h2>
        <p className="ins-note">{T('instructor.publicationsNote')}</p>
        <ul className="ins-pubs">
          {ins.publications.map((p) => (
            <li key={p.title}>
              <span className="ins-pub-year">{p.year}</span>
              <span className="ins-pub-title"><b lang="en">{p.title}</b><span lang="en">{p.venue}</span></span>
              <span className="chip chip-line">{T(p.kind === 'journal' ? 'instructor.journal' : 'instructor.conference')}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ins-sec" aria-labelledby="ins-theses">
        <h2 id="ins-theses">{T('instructor.theses')}</h2>
        <ul className="ins-theses">
          {c.theses.map((th) => (
            <li key={th.year}><b>{th.title}</b><span>{th.degree} · {ins.alumni[lang]} · {th.year}</span></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
