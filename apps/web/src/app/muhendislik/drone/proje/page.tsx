import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock } from '@/components/robotik/code-block'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { missionFsmPy } from '@/lib/drone/code'
import { DRONE_COURSE, unitOf } from '@/lib/drone/course'
import { dronePartOf, type DronePart } from '@/lib/drone/parts'
import { CAPSTONE } from '@/lib/drone/project'
import { partBySlug, partText, type EngPart } from '@/lib/muhendislik/catalog'

export const metadata: Metadata = { title: 'Drone bitirme projesi', description: 'Simüle otonom görev: kalkış, ara noktalar, ArUco ile hassas iniş; gereksinimler, mimari, SIL testi ve sunum.' }

export default async function DroneProje() {
  const lang = await getLocale()
  const en = lang === 'en'
  const t = CAPSTONE[lang]
  const parts = CAPSTONE.parts.map(dronePartOf).filter((p): p is DronePart => !!p)
  const hyvex = CAPSTONE.hyvex.map(partBySlug).filter((p): p is EngPart => !!p)
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/drone">{DRONE_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Capstone project' : 'Bitirme projesi'}</span>
      </nav>
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{en ? 'Browser + PX4 SITL + Gazebo' : 'Tarayıcı + PX4 SITL + Gazebo'}</span><span className="eng-tag">{en ? 'Capstone' : 'Bitirme'}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="dp-sc"><h2 id="dp-sc">{en ? 'Scenario' : 'Senaryo'}</h2><p>{t.scenario}</p></section>
          <section aria-labelledby="dp-req"><h2 id="dp-req">{en ? 'Requirements (testable)' : 'Gereksinimler (test edilebilir)'}</h2><ul className="eng-list">{t.requirements.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="dp-arch"><h2 id="dp-arch">{en ? 'Architecture' : 'Mimari'}</h2><ul className="eng-list">{t.architecture.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="dp-test"><h2 id="dp-test">{en ? 'Verification: from unit tests to SIL' : 'Doğrulama: birim testinden SIL\'e'}</h2><ul className="eng-list">{t.tests.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="dp-code"><h2 id="dp-code">{en ? 'Starter code' : 'Başlangıç kodu'}</h2><CodeBlock {...missionFsmPy(lang)} lang={lang} /></section>
          <section aria-labelledby="dp-ms">
            <h2 id="dp-ms">{en ? 'Deliverables' : 'Teslimler'}</h2>
            <ol className="rb-milestones">
              {CAPSTONE.deliverables.map((d) => (
                <li key={d.afterUnit}>
                  <Link href={`/muhendislik/drone/unite/${d.afterUnit}`} className="rb-ms-week">{en ? `After unit ${d.afterUnit}` : `${d.afterUnit}. üniteden sonra`}</Link>
                  <div><b>{d[lang].title}</b><p>{d[lang].deliver}</p><small className="muted">{unitOf(d.afterUnit)?.[lang].title}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="dp-gr">
            <h2 id="dp-gr" className="panel-title">{en ? 'Grading' : 'Notlandırma'}</h2>
            <dl className="value-list">
              {(en ? [['Proposal and requirements', '15%'], ['Control and estimation', '15%'], ['Working mission and landing', '30%'], ['Software quality, tests, CI', '20%'], ['Report and presentation', '20%']]
                : [['Öneri ve gereksinimler', '%15'], ['Denetim ve kestirim', '%15'], ['Çalışan görev ve iniş', '%30'], ['Yazılım kalitesi, testler, CI', '%20'], ['Rapor ve sunum', '%20']]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd><b>{v}</b></dd></div>)}
            </dl>
          </section>
          <section className="panel" aria-labelledby="dp-parts">
            <h2 id="dp-parts" className="panel-title">{en ? 'Simulated components' : 'Simüle edilen bileşenler'}</h2>
            <ul className="eng-sib">{parts.map((p) => <li key={p.key}><Link href={`/muhendislik/drone/parcalar#${p.key}`}>{p[lang].name}</Link></li>)}</ul>
            <p className="muted rb-small">{en ? 'A real build would use (Hyvex):' : 'Gerçek yapımda (Hyvex):'}</p>
            <ul className="eng-sib">{hyvex.map((b) => <li key={b.slug}><Link href={`/muhendislik/parca/${b.slug}`}>{partText(b, lang).name}</Link><small>{en ? 'L' : 'S'}{b.level}</small></li>)}</ul>
          </section>
          <section className="panel" aria-labelledby="dp-esof">
            <h2 id="dp-esof" className="panel-title">ESOF 323</h2>
            <p className="rb-small">{en ? 'The same mission is the drone track of the ESOF 323 term project, with weekly milestones.' : 'Aynı görev, haftalık ara teslimleriyle ESOF 323 dönem projesinin drone koludur.'}</p>
            <Link href={`/muhendislik/robotik/proje/${CAPSTONE.esofProject}`}>{en ? 'Open the ESOF 323 drone track' : 'ESOF 323 drone kolunu aç'}</Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
