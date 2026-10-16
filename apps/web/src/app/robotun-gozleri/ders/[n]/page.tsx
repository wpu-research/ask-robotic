import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonActivity } from '@/components/gozler/lesson-activity'
import { getLocale } from '@/i18n/server'
import { LESSONS, lessonOf } from '@/lib/robotun-gozleri'

export const dynamicParams = false
export const generateStaticParams = () => LESSONS.map((l) => ({ n: String(l.n) }))
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const l = lessonOf(Number((await params).n)); return { title: l ? `Robotun Gözleri · ${l.tr.title}` : 'Robotun Gözleri' }
}

export default async function Ders({ params }: { params: Promise<{ n: string }> }) {
  const l = lessonOf(Number((await params).n))
  if (!l) notFound()
  const lang = await getLocale(), en = lang === 'en', t = l[lang]
  const prev = lessonOf(l.n - 1), next = lessonOf(l.n + 1)
  return (
    <div className="page gz">
      <nav className="gz-steps" aria-label={en ? 'Lessons' : 'Dersler'}>
        <Link href="/robotun-gozleri" className="gz-home">{en ? '← Robot Eyes' : '← Robotun Gözleri'}</Link>
        <ol>{LESSONS.map((x) => <li key={x.n}><Link href={`/robotun-gozleri/ders/${x.n}`} aria-current={x.n === l.n ? 'page' : undefined} style={{ background: x.n === l.n ? x.color : undefined }}>{x.emoji}<span>{x.n}</span></Link></li>)}</ol>
      </nav>
      <header className="gz-lesson-head" style={{ background: l.color }}>
        <span className="gz-big-emoji" aria-hidden="true">{l.emoji}</span>
        <div><p className="eyebrow">{en ? `Lesson ${l.n} of ${LESSONS.length}` : `${l.n}. ders / ${LESSONS.length}`}</p><h1>{t.title}</h1><p className="gz-story">{t.story}</p></div>
      </header>
      <LessonActivity n={l.n} lang={lang} />
      <section className="gz-learned" aria-labelledby="gz-ln">
        <h2 id="gz-ln">{en ? 'What did we learn?' : 'Ne öğrendik?'}</h2>
        <ul>{t.learned.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>
      <nav className="gz-pager">
        {prev ? <Link className="gz-btn ghost" href={`/robotun-gozleri/ders/${prev.n}`}>← {prev[lang].title}</Link> : <span />}
        {next ? <Link className="gz-btn" href={`/robotun-gozleri/ders/${next.n}`}>{next[lang].title} →</Link> : <Link className="gz-btn" href="/robotun-gozleri#gz-g">{en ? 'Camera games' : 'Kamera oyunları'} →</Link>}
      </nav>
    </div>
  )
}
