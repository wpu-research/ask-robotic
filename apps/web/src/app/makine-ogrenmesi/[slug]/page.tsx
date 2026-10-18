import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale } from '@/i18n/server'
import { LESSONS, lessonBySlug } from '@/lib/ml/lessons'
import { PROJE_BOLUMU, SECTIONS } from '@/lib/ml/sections'
import { ML_TEXT } from '@/lib/ml/text'
import { PROJECTS, projectBySlug } from '@/lib/ml/projeler'
import type { ProjectDef } from '@/lib/ml/projeler/core'
import type { Lang } from '@/lib/ml/core'
import { MlPlayer, Py } from '@/components/ml/ml-player'
import { ProjectPlayer } from '@/components/ml/projeler/project-player'
import { Icon } from '@/components/shell/icons'
import '../ml.css'

export function generateStaticParams() { return [...LESSONS.map((l) => ({ slug: l.slug })), ...PROJECTS.map((p) => ({ slug: p.slug }))] }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug
  const l = lessonBySlug(slug) ?? projectBySlug(slug)
  const lang = await getLocale()
  return l ? { title: `${l.title[lang]} · ${ML_TEXT[lang].course}`, description: l.sub[lang] } : {}
}

/** Tek ders: hikâye, oynatıcı (sahne + kod), nasıl çalışır, neden önemli, önceki/sonraki. */
export default async function MlDers({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const l = lessonBySlug(slug)
  const lang = await getLocale()
  if (!l) {
    const pr = projectBySlug(slug)
    if (!pr) notFound()
    return <ProjeSayfasi p={pr} lang={lang} />
  }
  const T = ML_TEXT[lang]
  const i = LESSONS.indexOf(l)
  const prev = LESSONS[i - 1], next = LESSONS[i + 1]
  const k = SECTIONS.findIndex((s) => s.id === l.section), sec = SECTIONS[k]
  const unit = T.unit.replace('{n}', String(k + 1))
  return (
    <div className="page ml-page">
      <header className="page-title">
        <nav aria-label={lang === 'tr' ? 'Konum' : 'Breadcrumb'} className="crumbs">
          <Link href="/makine-ogrenmesi">{T.course}</Link><Icon name="chevronRight" size={14} />
          {sec && <><Link href={`/makine-ogrenmesi#bolum-${sec.id}`}>{sec.title[lang]}</Link><Icon name="chevronRight" size={14} /></>}
          <span aria-current="page">{T.part.replace('{n}', String(l.n))}</span>
        </nav>
        <p className="eyebrow">{sec ? `${unit} · ${sec.title[lang]}` : T.course} · {T.part.replace('{n}', String(l.n))}</p>
        <h1>{l.title[lang]}</h1>
        <p className="lead">{l.sub[lang]}</p>
      </header>
      <p className="ml-story"><b>{T.data}.</b> {l.story[lang]}</p>
      <MlPlayer slug={l.slug} />
      <p className="ml-note muted">{T.note}</p>
      <div className="ml-explain">
        <section aria-labelledby="ml-how">
          <h2 id="ml-how">{T.how2}</h2>
          <ol className="ml-how">{l.how.map((h) => <li key={h.tr}>{h[lang]}</li>)}</ol>
        </section>
        <section className="ml-why" aria-labelledby="ml-why">
          <h2 id="ml-why">{T.why}</h2>
          <p>{l.why[lang]}</p>
          <Link href="/muhendislik/robotik/hafta/11" className="mx-link">{T.related} →</Link>
        </section>
      </div>
      <nav className="ml-pager" aria-label={T.lessons}>
        {prev ? <Link href={`/makine-ogrenmesi/${prev.slug}`} className="btn btn-outline">← {prev.title[lang]}</Link> : <Link href="/makine-ogrenmesi" className="btn btn-outline">← {T.all}</Link>}
        {next ? <Link href={`/makine-ogrenmesi/${next.slug}`} className="btn btn-primary">{next.title[lang]} →</Link> : <Link href={`/makine-ogrenmesi/${PROJECTS[0].slug}`} className="btn btn-primary">{PROJECTS[0].title[lang]} →</Link>}
      </nav>
    </div>
  )
}

/** Tek proje: senaryo ve amaç, 3B oynatıcı (tarayıcıda eğitilen model), adımlar, model, kendin dene, Python karşılığı. */
function ProjeSayfasi({ p, lang }: { p: ProjectDef; lang: Lang }) {
  const T = ML_TEXT[lang]
  const i = PROJECTS.indexOf(p)
  const prev = PROJECTS[i - 1], next = PROJECTS[i + 1]
  const lastLesson = LESSONS[LESSONS.length - 1]
  const used = p.lessons.map((s) => LESSONS.find((l) => l.slug === s)).filter((l) => !!l)
  const pn = T.project.replace('{n}', String(i + 1))
  const col = Math.min(44, Math.max(...p.code.map(([c]) => c.length))) + 2
  return (
    <div className="page ml-page">
      <header className="page-title">
        <nav aria-label={lang === 'tr' ? 'Konum' : 'Breadcrumb'} className="crumbs">
          <Link href="/makine-ogrenmesi">{T.course}</Link><Icon name="chevronRight" size={14} />
          <Link href={`/makine-ogrenmesi#bolum-${PROJE_BOLUMU.id}`}>{PROJE_BOLUMU.title[lang]}</Link><Icon name="chevronRight" size={14} />
          <span aria-current="page">{pn}</span>
        </nav>
        <p className="eyebrow">{PROJE_BOLUMU.title[lang]} · {pn}</p>
        <h1>{p.title[lang]}</h1>
        <p className="lead">{p.sub[lang]}</p>
      </header>
      <div className="mp-brief">
        <p className="ml-story"><b>{T.story}.</b> {p.story[lang]}</p>
        <p className="ml-story mp-goal"><b>{T.goal}.</b> {p.goal[lang]}</p>
      </div>
      <ProjectPlayer slug={p.slug} />
      <p className="ml-note muted">{T.projectNote}</p>
      <div className="ml-explain">
        <section aria-labelledby="mp-steps">
          <h2 id="mp-steps">{T.steps}</h2>
          <ol className="ml-how">{p.steps.map((h) => <li key={h.tr}>{h[lang]}</li>)}</ol>
        </section>
        <section className="ml-why" aria-labelledby="mp-model">
          <h2 id="mp-model">{T.model}</h2>
          <p>{p.model[lang]}</p>
          {used.length > 0 && (
            <p className="mp-used"><b>{T.lessonsUsed}:</b>{' '}
              {used.map((l, k) => <span key={l.slug}>{k > 0 && ' · '}<Link href={`/makine-ogrenmesi/${l.slug}`}>{l.title[lang]}</Link></span>)}
            </p>
          )}
        </section>
      </div>
      <section className="mp-task" aria-labelledby="mp-task">
        <h2 id="mp-task">{T.task}</h2>
        <ol>{p.task.map((h) => <li key={h.tr}>{h[lang]}</li>)}</ol>
      </section>
      <section aria-labelledby="mp-py" className="mp-py">
        <h2 id="mp-py">{T.python}</h2>
        <div className="ml-code">
          <div className="ml-code-head"><span className="ml-dots" aria-hidden="true"><i /><i /><i /></span><b>{p.file}</b><small>python</small></div>
          <ol>
            {p.code.map(([code, tr, en], k) => {
              const c = lang === 'tr' ? tr : en
              const src = c ? `${code}${' '.repeat(Math.max(2, col - code.length))}# ${c}` : code
              return <li key={k}><code><Py src={src} /></code></li>
            })}
          </ol>
        </div>
      </section>
      <nav className="ml-pager" aria-label={T.projects}>
        {prev ? <Link href={`/makine-ogrenmesi/${prev.slug}`} className="btn btn-outline">← {prev.title[lang]}</Link> : <Link href={`/makine-ogrenmesi/${lastLesson.slug}`} className="btn btn-outline">← {lastLesson.title[lang]}</Link>}
        {next ? <Link href={`/makine-ogrenmesi/${next.slug}`} className="btn btn-primary">{next.title[lang]} →</Link> : <Link href="/makine-ogrenmesi" className="btn btn-primary">{T.all} →</Link>}
      </nav>
    </div>
  )
}
