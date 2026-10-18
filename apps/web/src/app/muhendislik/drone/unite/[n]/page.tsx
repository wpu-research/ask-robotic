import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DroneSimBox } from '@/components/drone/drone-sim-box'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { SimBox } from '@/components/robotik/sim-box'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { DRONE_COURSE, PILLAR_TEXT, UNITS, unitOf } from '@/lib/drone/course'
import { dronePartOf, type DronePart } from '@/lib/drone/parts'
import { CAPSTONE } from '@/lib/drone/project'
import { labHref, partBySlug, partText, type EngPart } from '@/lib/muhendislik/catalog'

export const dynamicParams = false
export const generateStaticParams = () => UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = unitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${DRONE_COURSE[lang].title} · ${u[lang].title}` : DRONE_COURSE[lang].title }
}

export default async function Unite({ params }: { params: Promise<{ n: string }> }) {
  const u = unitOf(Number((await params).n))
  if (!u) notFound()
  const lang = await getLocale()
  const en = lang === 'en'
  const t = u[lang]
  const prev = unitOf(u.n - 1), next = unitOf(u.n + 1)
  const parts = u.parts.map(dronePartOf).filter((p): p is DronePart => !!p)
  const hyvex = [...new Set(parts.flatMap((p) => p.hyvex))].map(partBySlug).filter((p): p is EngPart => !!p)
  const labs = hyvex.filter((p) => p.lab)
  const steps = CAPSTONE.deliverables.filter((d) => d.afterUnit === u.n)
  const simCount = u.sims.length + (u.esofSims?.length ?? 0)
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/drone">{DRONE_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? `Unit ${u.n}` : `${u.n}. ünite`}</span>
      </nav>
      <div className="rb-week">
        <nav className="rb-side" aria-label={en ? 'Units' : 'Üniteler'}>
          <ol>
            {UNITS.map((x) => (
              <li key={x.n}>
                <Link href={`/muhendislik/drone/unite/${x.n}`} className={x.n === u.n ? 'on' : undefined} aria-current={x.n === u.n ? 'page' : undefined}>
                  <span className="k">{x.n}</span><span>{x[lang].title}</span>
                </Link>
              </li>
            ))}
            <li><Link href="/muhendislik/drone/proje"><span className="k">★</span><span>{en ? 'Capstone project' : 'Bitirme projesi'}</span></Link></li>
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{en ? `Unit ${u.n} of ${UNITS.length}` : `${u.n}. ünite / ${UNITS.length}`}</p>
          <h1>{t.title}</h1>
          <p className="dr-tags">{u.pillars.map((p) => <span key={p} className="eng-tag eng-tag-lab">{PILLAR_TEXT[p][lang]}</span>)}</p>

          <h2>{en ? 'By the end of this unit you can' : 'Bu ünitenin sonunda'}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h2>{en ? 'Notes' : 'Ders notları'}</h2>
          {/* İçerik ders notlarıdır (lib/drone, depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          {simCount > 0 && (
            <>
              <h2>{en ? (simCount > 1 ? 'Simulations' : 'Simulation') : (simCount > 1 ? 'Simülasyonlar' : 'Simülasyon')}</h2>
              <div className="rb-sims">
                {u.sims.map((id) => <DroneSimBox key={id} id={id} lang={lang} cfg={u.simCfg?.[id]} />)}
                {u.esofSims?.map((id) => <SimBox key={id} id={id} lang={lang} />)}
              </div>
            </>
          )}
          <section className="rb-box">
            <h3>{en ? 'Simulation task' : 'Simülasyon görevi'}</h3>
            <p>{t.lab}</p>
          </section>

          {t.code.length > 0 && (
            <>
              <h2>{en ? 'Code' : 'Kod'}</h2>
              {t.code.map((c) => <CodeBlock key={c.title} title={c.title} src={c.src} lang={lang} />)}
            </>
          )}

          <section className="rb-pitfalls" aria-labelledby="dr-pit">
            <h2 id="dr-pit">{en ? 'Common mistakes' : 'Sık yapılan hatalar'}</h2>
            <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="rb-se" aria-labelledby="dr-se">
            <h2 id="dr-se">{en ? 'Software engineering connection' : 'Yazılım mühendisliği bağlantısı'}</h2>
            <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
          </section>

          <Quiz key={`drone-${u.n}-${lang}`} items={t.quiz} lang={lang} />

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="dr-ps">
              <h3 id="dr-ps">{en ? 'Capstone after this unit' : 'Bu üniteden sonra bitirme projesinde'}</h3>
              <ul>{steps.map((d) => <li key={d.afterUnit}><Link href="/muhendislik/drone/proje"><b>{d[lang].title}</b></Link>: {d[lang].deliver}</li>)}</ul>
            </section>
          )}

          {parts.length > 0 && (
            <section className="rb-hw-box" aria-labelledby="dr-hw">
              <h2 id="dr-hw">{en ? 'Parts in this unit' : 'Bu ünitenin parçaları'}</h2>
              <ul className="eng-chips">
                {parts.map((p) => <li key={p.key}><Link className="eng-chip" href={`/muhendislik/drone/parcalar#${p.key}`}>{p[lang].name}</Link></li>)}
              </ul>
              {hyvex.length > 0 && (
                <>
                  <p className="muted rb-small">{en ? 'Real Hyvex parts with 3D models:' : '3B modelli gerçek Hyvex parçaları:'}</p>
                  <ul className="eng-chips">
                    {hyvex.map((p) => <li key={p.slug}><Link className="eng-chip" href={`/muhendislik/parca/${p.slug}`}><span className="eng-chip-lv">{en ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>)}
                  </ul>
                </>
              )}
              {labs.length > 0 && (
                <ul className="rb-links">
                  {labs.map((p) => <li key={p.slug}><Link href={labHref(p)!}>{en ? 'Open in the lab' : 'Laboratuvarda aç'}: {partText(p, lang).name}</Link></li>)}
                </ul>
              )}
            </section>
          )}

          <nav className="rb-pager" aria-label={en ? 'Units' : 'Üniteler'}>
            {prev ? <Link href={`/muhendislik/drone/unite/${prev.n}`}><small>{en ? 'Previous unit' : 'Önceki ünite'}</small>{prev[lang].title}</Link> : <span />}
            {next
              ? <Link href={`/muhendislik/drone/unite/${next.n}`} className="r"><small>{en ? 'Next unit' : 'Sonraki ünite'}</small>{next[lang].title}</Link>
              : <Link href="/muhendislik/drone/proje" className="r"><small>{en ? 'Next' : 'Sıradaki'}</small>{CAPSTONE[lang].title}</Link>}
          </nav>
        </article>
      </div>
    </div>
  )
}
