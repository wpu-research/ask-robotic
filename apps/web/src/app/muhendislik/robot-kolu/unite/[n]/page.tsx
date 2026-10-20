import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RobotSimBox } from '@/components/robot-kolu/robot-sim-box'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { SimBox } from '@/components/robotik/sim-box'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { ROBOT_COURSE, UNITS, unitOf } from '@/lib/robot-kolu/course'
import { CAPSTONE } from '@/lib/robot-kolu/project'

export const dynamicParams = false
export const generateStaticParams = () => UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = unitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${ROBOT_COURSE[lang].title} · ${u[lang].title}` : ROBOT_COURSE[lang].title }
}

export default async function Unite({ params }: { params: Promise<{ n: string }> }) {
  const u = unitOf(Number((await params).n))
  if (!u) notFound()
  const lang = await getLocale()
  const en = lang === 'en'
  const t = u[lang]
  const prev = unitOf(u.n - 1), next = unitOf(u.n + 1)
  const steps = CAPSTONE.deliverables.filter((d) => d.afterUnit === u.n)
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/robot-kolu">{ROBOT_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? `Unit ${u.n}` : `${u.n}. ünite`}</span>
      </nav>
      <div className="rb-week">
        <nav className="rb-side" aria-label={en ? 'Units' : 'Üniteler'}>
          <ol>
            {UNITS.map((x) => (
              <li key={x.n}>
                <Link href={`/muhendislik/robot-kolu/unite/${x.n}`} className={x.n === u.n ? 'on' : undefined} aria-current={x.n === u.n ? 'page' : undefined}>
                  <span className="k">{x.n}</span><span>{x[lang].title}</span>
                </Link>
              </li>
            ))}
            <li><Link href="/muhendislik/robot-kolu/proje"><span className="k">★</span><span>{en ? 'Capstone project' : 'Bitirme projesi'}</span></Link></li>
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{en ? `Unit ${u.n} of ${UNITS.length} · ${ROBOT_COURSE.hours / UNITS.length} hours` : `${u.n}. ünite / ${UNITS.length} · ${ROBOT_COURSE.hours / UNITS.length} saat`}</p>
          <h1>{t.title}</h1>
          <p className="lead">{t.summary}</p>

          <h2>{en ? 'By the end of this unit you can' : 'Bu ünitenin sonunda'}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h2>{en ? 'Notes' : 'Ders notları'}</h2>
          {/* İçerik ders notlarıdır (lib/robot-kolu, depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          <h2>{en ? (u.sims.length + (u.esofSims?.length ?? 0) > 1 ? 'Simulations' : 'Simulation') : (u.sims.length + (u.esofSims?.length ?? 0) > 1 ? 'Simülasyonlar' : 'Simülasyon')}</h2>
          <p className="lm-teach">{ROBOT_COURSE[lang].teaching}</p>
          <div className="rb-sims">
            {u.sims.map((id) => <RobotSimBox key={id} id={id} lang={lang} cfg={u.simCfg?.[id]} />)}
            {u.esofSims?.map((id) => <SimBox key={id} id={id} lang={lang} />)}
          </div>
          {u.esofSims && (
            <p className="rk-note">{en ? 'The two-link arm simulation above is the one from ESOF 323 week 7, reused as is.' : 'Yukarıdaki iki eklemli kol simülasyonu ESOF 323 7. haftadakinin aynısıdır, yeniden kullanıldı.'} <Link href="/muhendislik/robotik/hafta/7">{en ? 'Open week 7' : '7. haftayı aç'}</Link></p>
          )}
          <section className="rb-box">
            <h3>{en ? 'Try it yourself' : 'Kendin dene'}</h3>
            <p>{t.lab}</p>
          </section>

          <h2>{en ? 'Code' : 'Kod'}</h2>
          <p className="muted rb-small">{en ? 'ArmScript blocks can be pasted into the ArmScript simulation and run in your browser. Python blocks use only the standard library; run them on your own computer.' : 'ArmScript bloklarını ArmScript simülasyonuna yapıştırıp tarayıcında çalıştırabilirsin. Python blokları yalnızca standart kütüphane kullanır; kendi bilgisayarında çalıştır.'}</p>
          {t.code.map((c) => <CodeBlock key={c.title} title={c.title} src={c.src} lang={lang} />)}

          <section className="rb-pitfalls" aria-labelledby="rk-pit">
            <h2 id="rk-pit">{en ? 'Common mistakes' : 'Sık yapılan hatalar'}</h2>
            <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="rb-se" aria-labelledby="rk-se">
            <h2 id="rk-se">{en ? 'Software engineering connection' : 'Yazılım mühendisliği bağlantısı'}</h2>
            <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
          </section>

          <Quiz key={`robot-${u.n}-${lang}`} items={t.quiz} lang={lang} />

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="rk-ps">
              <h3 id="rk-ps">{en ? 'Capstone after this unit' : 'Bu üniteden sonra bitirme projesinde'}</h3>
              <ul>{steps.map((d) => <li key={d.afterUnit}><Link href="/muhendislik/robot-kolu/proje"><b>{d[lang].title}</b></Link>: {d[lang].deliver}</li>)}</ul>
            </section>
          )}

          {u.related.length > 0 && (
            <section className="rb-hw-box" aria-labelledby="rk-rel">
              <h2 id="rk-rel">{en ? 'Related on Macademia' : 'Macademia\'da ilgili'}</h2>
              <ul className="rb-links">{u.related.map((r) => <li key={r.href + r.tr}><Link href={r.href}>{r[lang]}</Link></li>)}</ul>
            </section>
          )}

          <nav className="rb-pager" aria-label={en ? 'Units' : 'Üniteler'}>
            {prev ? <Link href={`/muhendislik/robot-kolu/unite/${prev.n}`}><small>{en ? 'Previous unit' : 'Önceki ünite'}</small>{prev[lang].title}</Link> : <span />}
            {next
              ? <Link href={`/muhendislik/robot-kolu/unite/${next.n}`} className="r"><small>{en ? 'Next unit' : 'Sonraki ünite'}</small>{next[lang].title}</Link>
              : <Link href="/muhendislik/robot-kolu/proje" className="r"><small>{en ? 'Next' : 'Sıradaki'}</small>{CAPSTONE[lang].title}</Link>}
          </nav>
        </article>
      </div>
    </div>
  )
}
