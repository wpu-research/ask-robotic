import type { Metadata } from 'next'
import Link from 'next/link'
import { RobotSimBox } from '@/components/robot-kolu/robot-sim-box'
import { CodeBlock } from '@/components/robotik/code-block'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { armscriptBlock } from '@/lib/robot-kolu/code'
import { ROBOT_COURSE, unitOf } from '@/lib/robot-kolu/course'
import { CAPSTONE } from '@/lib/robot-kolu/project'

export const metadata: Metadata = { title: 'Robot kolu bitirme projesi', description: 'Paletleme hücresi: duvarlı sanal hücrede üç parçayı alıp bir düzene yerleştiren, çarpışmasız, ölçülen ve test edilen ArmScript programı; gereksinimler, mimari, test ve sunum.' }

export default async function RobotKoluProje() {
  const lang = await getLocale()
  const en = lang === 'en'
  const t = CAPSTONE[lang]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/robot-kolu">{ROBOT_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Capstone project' : 'Bitirme projesi'}</span>
      </nav>
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{en ? 'Browser + ArmScript' : 'Tarayıcı + ArmScript'}</span><span className="eng-tag">{en ? 'Capstone' : 'Bitirme'}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="rp-sc"><h2 id="rp-sc">{en ? 'Scenario' : 'Senaryo'}</h2><p>{t.scenario}</p></section>
          <section aria-labelledby="rp-req"><h2 id="rp-req">{en ? 'Requirements (testable)' : 'Gereksinimler (test edilebilir)'}</h2><ul className="eng-list">{t.requirements.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="rp-arch"><h2 id="rp-arch">{en ? 'Architecture' : 'Mimari'}</h2><ul className="eng-list">{t.architecture.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="rp-test"><h2 id="rp-test">{en ? 'Verification: from unit tests to measurements' : 'Doğrulama: birim testinden ölçüme'}</h2><ul className="eng-list">{t.tests.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="rp-try">
            <h2 id="rp-try">{en ? 'Starter program, runnable here' : 'Başlangıç programı, burada çalışır'}</h2>
            <div className="rb-sims"><RobotSimBox id="script" lang={lang} cfg={{ sample: 'bitirme' }} /></div>
            <CodeBlock {...armscriptBlock('bitirme', lang, 'paletleme: üç parçayı 2x2 düzene yerleştirmek', 'palletising: place three parts into a 2x2 layout')} lang={lang} />
          </section>
          <section aria-labelledby="rp-ms">
            <h2 id="rp-ms">{en ? 'Deliverables' : 'Teslimler'}</h2>
            <ol className="rb-milestones">
              {CAPSTONE.deliverables.map((d) => (
                <li key={d.afterUnit}>
                  <Link href={`/muhendislik/robot-kolu/unite/${d.afterUnit}`} className="rb-ms-week">{en ? `After unit ${d.afterUnit}` : `${d.afterUnit}. üniteden sonra`}</Link>
                  <div><b>{d[lang].title}</b><p>{d[lang].deliver}</p><small className="muted">{unitOf(d.afterUnit)?.[lang].title}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="rp-gr">
            <h2 id="rp-gr" className="panel-title">{en ? 'Grading' : 'Notlandırma'}</h2>
            <dl className="value-list">
              {(en ? [['Proposal and requirements', '15%'], ['ArmScript program quality', '25%'], ['Collision-free planning', '20%'], ['Safety note and limits', '15%'], ['Measurements, report, presentation', '25%']]
                : [['Öneri ve gereksinimler', '%15'], ['ArmScript program kalitesi', '%25'], ['Çarpışmasız planlama', '%20'], ['Güvenlik notu ve sınırlar', '%15'], ['Ölçümler, rapor, sunum', '%25']]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd><b>{v}</b></dd></div>)}
            </dl>
          </section>
          <section className="panel" aria-labelledby="rp-try2">
            <h2 id="rp-try2" className="panel-title">{en ? 'Practise first' : 'Önce dene'}</h2>
            <ul className="eng-sib">
              <li><Link href="/muhendislik/robot-kolu/unite/5">{en ? 'Pick-and-place and the grasp rule' : 'Al-bırak ve tutma kuralı'}</Link></li>
              <li><Link href="/muhendislik/robot-kolu/unite/7">{en ? 'Procedures and sensors in ArmScript' : 'ArmScript\'te yordam ve sensör'}</Link></li>
              <li><Link href="/muhendislik/robot-kolu/unite/8">{en ? 'Planning around the wall' : 'Duvarın etrafında planlama'}</Link></li>
              <li><Link href="/muhendislik/robot-kolu/unite/9">{en ? 'Cell safety' : 'Hücre güvenliği'}</Link></li>
            </ul>
            <p className="muted rb-small">{ROBOT_COURSE[lang].cert}</p>
          </section>
          <section className="panel" aria-labelledby="rp-esof">
            <h2 id="rp-esof" className="panel-title">ESOF 323</h2>
            <p className="rb-small">{en ? 'The robot arm term project of the robotics course covers a similar task in Webots.' : 'Robotik dersinin robot kol dönem projesi, Webots\'ta benzer bir görevi kapsar.'}</p>
            <Link href="/muhendislik/robotik/proje/robot-kol">{en ? 'Open the ESOF 323 robot arm project' : 'ESOF 323 robot kol projesini aç'}</Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
