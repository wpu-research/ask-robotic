import type { Metadata } from 'next'
import Link from 'next/link'
import { ROBOT_SIM_META, type RobotSimId } from '@/components/robot-kolu/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { PREREQ, ROBOT_COURSE, UNITS } from '@/lib/robot-kolu/course'

export const metadata: Metadata = {
  title: 'Robot Kolu Mühendisliği',
  description: 'Büyükler için robot kolu dersi: sanal 6 eksenli kol, ileri ve ters kinematik, PTP ve LIN, tutucu, çarpışmasız planlama, hücre güvenliği ve platformun kendi dili ArmScript. 10 ünite, tarayıcıda 8 simülasyon.',
}

export default async function RobotKoluDersi() {
  const lang = await getLocale()
  const en = lang === 'en'
  const c = ROBOT_COURSE[lang]
  const sims = Object.keys(ROBOT_SIM_META) as RobotSimId[]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{c.title}</span>
      </nav>
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'For adults · course · 16+' : 'Büyükler için · ders · 16+'}</p>
        <h1>{c.title}</h1>
        <p className="lead">{c.lede}</p>
        <p className="dr-meta">{c.level}. {c.prereq}</p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Units' : 'Ünite'}</dt><dd>{UNITS.length}</dd></div>
          <div><dt>{en ? 'Simulations' : 'Simülasyon'}</dt><dd>{sims.length}</dd></div>
          <div><dt>{en ? 'Hours' : 'Saat'}</dt><dd>{ROBOT_COURSE.hours}</dd></div>
        </dl>
        <p className="rb-actions">
          <Link className="btn btn-primary" href="/muhendislik/robot-kolu/unite/1" data-testid="robot-start">{en ? 'Start with unit 1' : '1. üniteyle başla'}</Link>
          <Link className="btn btn-ghost" href="/muhendislik/robot-kolu/simulasyon">{en ? 'All simulations' : 'Tüm simülasyonlar'}</Link>
        </p>
        <p className="lm-teach">{c.teaching}</p>
      </header>

      <section aria-labelledby="rk-out">
        <h2 id="rk-out">{en ? 'What you will be able to do' : 'Kazanımlar'}</h2>
        <ul className="eng-list">{c.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
      </section>

      <section className="panel" aria-labelledby="rk-pre">
        <h2 id="rk-pre" className="panel-title">{en ? 'Prerequisite: the ESOF 323 content' : 'Ön koşul: ESOF 323 içeriği'}</h2>
        <p>{en ? 'The two-link arm kinematics already taught in the robotics course are not rewritten here; this course builds on them and reuses the same simulation in units 2 and 3.' : 'Robotik dersinde zaten anlatılan iki eklemli kol kinematiği burada yeniden yazılmadı; bu ders onun üstüne kurulur ve aynı simülasyonu 2. ve 3. ünitede yeniden kullanır.'}</p>
        <ul className="eng-list rk-prereq">
          <li><Link href={PREREQ.week} data-testid="robot-prereq-week">{en ? 'ESOF 323, week 7: mobile robot and manipulator kinematics' : 'ESOF 323, 7. hafta: mobil robot ve manipülatör kinematiği'}</Link></li>
          <li><Link href={PREREQ.project}>{en ? 'ESOF 323 term project: robot arm' : 'ESOF 323 dönem projesi: robot kol'}</Link></li>
        </ul>
      </section>

      <section aria-labelledby="rk-plan">
        <h2 id="rk-plan">{en ? 'Units' : 'Üniteler'}</h2>
        <div className="rb-scroll">
          <table className="rb-table dr-units">
            <thead><tr><th>{en ? 'Unit' : 'Ünite'}</th><th>{en ? 'Topic' : 'Konu'}</th><th>{en ? 'Hours' : 'Saat'}</th><th>{en ? 'Simulation' : 'Simülasyon'}</th></tr></thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.n}>
                  <td className="n">{u.n}</td>
                  <td><Link href={`/muhendislik/robot-kolu/unite/${u.n}`} data-testid={`robot-unit-${u.n}`}>{u[lang].title}</Link><br /><span className="rb-tcell">{u[lang].summary}</span></td>
                  <td className="rb-tcell">{ROBOT_COURSE.hours / UNITS.length}</td>
                  <td className="rb-tcell">{[...u.sims.map((s) => ROBOT_SIM_META[s][lang].title), ...(u.esofSims ?? []).map(() => (en ? 'ESOF 323 two-link arm' : 'ESOF 323 iki eklemli kol'))].join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="rk-cap">
          <h2 id="rk-cap" className="panel-title">{en ? 'Capstone project' : 'Bitirme projesi'}</h2>
          <p>{en ? 'A palletising cell: pick three parts, carry them over a wall and place them in a layout, with a collision-free, measured and tested ArmScript program.' : 'Paletleme hücresi: üç parçayı al, duvarın üstünden taşı ve bir düzene yerleştir; çarpışmasız, ölçülen ve test edilen bir ArmScript programıyla.'}</p>
          <Link className="btn btn-primary" href="/muhendislik/robot-kolu/proje" data-testid="robot-capstone">{en ? 'Project and deliverables' : 'Proje ve teslimler'} <Icon name="arrowRight" size={16} /></Link>
        </section>
        <section className="panel" aria-labelledby="rk-tools">
          <h2 id="rk-tools" className="panel-title">{en ? 'Tools (all in the browser)' : 'Araçlar (hepsi tarayıcıda)'}</h2>
          <ul className="eng-list">
            <li>{en ? 'A 3D virtual arm cell on this page; no install, no camera, no server' : 'Bu sayfada 3B sanal kol hücresi; kurulum, kamera ve sunucu yok'}</li>
            <li>{en ? 'ArmScript: the platform\'s own language, run by an isolated interpreter in your tab' : 'ArmScript: platformun kendi dili, sekmende yalıtılmış bir yorumlayıcıyla çalışır'}</li>
            <li>{en ? 'Python code blocks that need only the standard library' : 'Yalnızca standart kütüphane isteyen Python kod blokları'}</li>
          </ul>
        </section>
      </div>

      <section className="panel" aria-labelledby="rk-rel">
        <h2 id="rk-rel" className="panel-title">{en ? 'Related' : 'İlgili'}</h2>
        <ul className="eng-list">
          <li><Link href="/muhendislik/robotik">{en ? 'ESOF 323: the university robotics course' : 'ESOF 323: üniversite robotik dersi'}</Link></li>
          <li><Link href="/muhendislik/drone">{en ? 'Drone engineering: another course with the same layout' : 'Drone mühendisliği: aynı düzende başka bir ders'}</Link></li>
          <li><Link href="/programlar">{en ? 'Programmes: courses joined into a path' : 'Programlar: dersleri bir yola bağlayan hatlar'}</Link></li>
        </ul>
      </section>
    </div>
  )
}
