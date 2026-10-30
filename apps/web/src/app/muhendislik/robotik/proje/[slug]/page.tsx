import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/robotik/code-block'
import { CODE_DICT_EN } from '@/lib/code-dict'
import { localizeCode } from '@/lib/code-i18n'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { partBySlug, partText, type EngPart } from '@/lib/muhendislik/catalog'
import { COURSE, weekOf } from '@/lib/robotik/course'
import { PROJECTS, projectOf } from '@/lib/robotik/projects'

export const generateStaticParams = () => PROJECTS.map((p) => ({ slug: p.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = projectOf((await params).slug)
  return { title: p ? `${COURSE.code} · ${p.tr.title}` : COURSE.code }
}

export default async function Proje({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectOf((await params).slug)
  if (!p) notFound()
  const lang = await getLocale()
  const en = lang === 'en'
  const t = p[lang]
  const bom = p.bom.map(partBySlug).filter((x): x is EngPart => !!x)
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik/robotik">{COURSE.code}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{t.title}</span>
      </nav>
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{p.simulator}</span><span className="eng-tag">{en ? 'Term project' : 'Dönem projesi'}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="pj-sc"><h2 id="pj-sc">{en ? 'Scenario' : 'Senaryo'}</h2><p>{t.scenario}</p></section>
          <section aria-labelledby="pj-ac"><h2 id="pj-ac">{en ? 'Acceptance criteria' : 'Kabul ölçütleri'}</h2><ul className="eng-list">{t.acceptance.map((a) => <li key={a}>{a}</li>)}</ul></section>
          <section aria-labelledby="pj-su"><h2 id="pj-su">{en ? 'Setting up the simulation' : 'Simülasyonu kurmak'}</h2><ol className="rb-steps">{t.setup.map((s) => <li key={s}>{s}</li>)}</ol></section>
          <section aria-labelledby="pj-st"><h2 id="pj-st">{en ? 'Starter code' : 'Başlangıç kodu'}</h2><CodeBlock title={en ? p.starter.titleEn : p.starter.title} src={en ? localizeCode(p.starter.src, CODE_DICT_EN, 'py') : p.starter.src} lang={lang} /></section>
          <section aria-labelledby="pj-ms">
            <h2 id="pj-ms">{en ? 'Milestones' : 'Ara teslimler'}</h2>
            <ol className="rb-milestones">
              {p.milestones.map((m) => (
                <li key={m.week}>
                  <Link href={`/muhendislik/robotik/hafta/${m.week}`} className="rb-ms-week">{en ? `Week ${m.week}` : `${m.week}. hafta`}</Link>
                  <div><b>{m[lang].title}</b><p>{m[lang].deliver}</p><small className="muted">{weekOf(m.week)?.[lang].title}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="pj-bom">
            <h2 id="pj-bom" className="panel-title">{en ? 'A real build would use (Hyvex)' : 'Gerçek yapımda (Hyvex)'}</h2>
            <p className="muted rb-small">{en ? 'Everything runs in simulation; this list maps each simulated component to a real part.' : 'Her şey simülasyonda; bu liste simüle edilen her bileşenin gerçek parça karşılığıdır.'}</p>
            <ul className="eng-sib">{bom.map((b) => <li key={b.slug}><Link href={`/muhendislik/parca/${b.slug}`}>{partText(b, lang).name}</Link><small>{en ? 'L' : 'S'}{b.level}</small></li>)}</ul>
          </section>
          <section className="panel" aria-labelledby="pj-gr">
            <h2 id="pj-gr" className="panel-title">{en ? 'Grading (15% of the course)' : 'Notlandırma (dersin %15\'i)'}</h2>
            <dl className="value-list">
              {(en ? [['Proposal and requirements', '15%'], ['Progress check', '15%'], ['Working system', '30%'], ['Software quality, tests, CI', '20%'], ['Report and presentation', '20%']]
                : [['Öneri ve gereksinimler', '%15'], ['Ara kontrol', '%15'], ['Çalışan sistem', '%30'], ['Yazılım kalitesi, testler, CI', '%20'], ['Rapor ve sunum', '%20']]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd><b>{v}</b></dd></div>)}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
