// Gömülü kursların (Raspberry Pi, ARM STM32) ortak sayfa gövdeleri: genel bakış, ünite, bitirme projesi, simülasyonlar.
// Sunucu bileşenleri; görünüm Drone dersi ve ESOF 323 ile aynı sınıflar (robotik.css, drone.css) + gomulu.css.
import Link from 'next/link'
import { PyRunner } from '@/components/ml/py-runner'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { Icon } from '@/components/shell/icons'
import type { CourseDef, Lang } from '@/lib/gomulu/types'
import { datasetById } from '@/lib/ml/veri'
import { labHref, partBySlug, partText, type EngPart } from '@/lib/muhendislik/catalog'
import { GomuluSim } from './gomulu-sim'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCourse = CourseDef<any>
const base = (c: AnyCourse) => `/muhendislik/${c.slug}`
const parts = (slugs: string[]) => slugs.map(partBySlug).filter((p): p is EngPart => !!p)

function Crumbs({ c, lang, here }: { c: AnyCourse; lang: Lang; here?: string }) {
  const en = lang === 'en'
  return (
    <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
      <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
      {here ? <><Link href={base(c)}>{c.text[lang].title}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{here}</span></> : <span aria-current="page">{c.text[lang].title}</span>}
    </nav>
  )
}

function HyvexChips({ slugs, lang }: { slugs: string[]; lang: Lang }) {
  const ps = parts(slugs)
  if (!ps.length) return null
  return <ul className="eng-chips">{ps.map((p) => <li key={p.slug}><Link className="eng-chip" href={`/muhendislik/parca/${p.slug}`}><span className="eng-chip-lv">{lang === 'en' ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>)}</ul>
}

export function CourseOverview({ c, lang }: { c: AnyCourse; lang: Lang }) {
  const en = lang === 'en'
  const t = c.text[lang]
  const hours = c.units.reduce((s, u) => s + u.hours, 0)
  return (
    <div className="page eng rb">
      <Crumbs c={c} lang={lang} />
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'For adults · 16+ · simulation + code + quiz' : 'Büyükler için · 16+ · simülasyon + kod + test'}</p>
        <h1>{t.title}</h1>
        <p className="lead">{t.lede}</p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Units' : 'Ünite'}</dt><dd>{c.units.length}</dd></div>
          <div><dt>{en ? 'Simulations' : 'Simülasyon'}</dt><dd>{Object.keys(c.sims).length}</dd></div>
          <div><dt>{en ? 'Hours' : 'Saat'}</dt><dd>{hours}</dd></div>
        </dl>
        <p className="rb-actions">
          <Link className="btn btn-primary" href={`${base(c)}/unite/1`} data-testid={`${c.kit}-start`}>{en ? 'Start with unit 1' : '1. üniteyle başla'}</Link>
          <Link className="btn btn-ghost" href={`${base(c)}/simulasyon`}>{en ? 'All simulations' : 'Tüm simülasyonlar'}</Link>
          <Link className="btn btn-ghost" href={`${base(c)}/proje`}>{en ? 'Capstone project' : 'Bitirme projesi'}</Link>
        </p>
      </header>

      <div className="rb-two">
        <section className="panel" aria-labelledby="gm-who">
          <h2 id="gm-who" className="panel-title">{en ? 'Who is it for' : 'Kimler için'}</h2>
          <dl className="value-list gm-facts">
            <div><dt>{en ? 'Audience' : 'Hedef kitle'}</dt><dd>{t.audience}</dd></div>
            <div><dt>{en ? 'Duration' : 'Süre'}</dt><dd>{t.duration}</dd></div>
            <div><dt>{en ? 'Prerequisites' : 'Ön koşul'}</dt><dd>{t.prereq}</dd></div>
            <div><dt>{en ? 'Certificate' : 'Belge'}</dt><dd>{t.certificate}</dd></div>
          </dl>
        </section>
        <section className="panel" aria-labelledby="gm-out">
          <h2 id="gm-out" className="panel-title">{en ? 'Learning outcomes' : 'Kazanımlar'}</h2>
          <ul className="eng-list">{t.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
        </section>
      </div>

      <section aria-labelledby="gm-plan">
        <h2 id="gm-plan">{en ? 'Units' : 'Üniteler'}</h2>
        <div className="rb-scroll">
          <table className="rb-table dr-units">
            <thead><tr><th>{en ? 'Unit' : 'Ünite'}</th><th>{en ? 'Topic' : 'Konu'}</th><th>{en ? 'Hours' : 'Saat'}</th><th>{en ? 'Simulations' : 'Simülasyonlar'}</th></tr></thead>
            <tbody>
              {c.units.map((u) => (
                <tr key={u.n}>
                  <td className="n">{u.n}</td>
                  <td><Link href={`${base(c)}/unite/${u.n}`} data-testid={`${c.kit}-unit-${u.n}`}>{u[lang].title}</Link><br /><span className="rb-tcell">{u[lang].summary}</span></td>
                  <td className="rb-tcell">{u.hours}</td>
                  <td className="rb-tcell">{u.sims.map((s) => c.sims[s][lang].title).join(', ')}{u.py ? (en ? ', Python in the browser' : ', tarayıcıda Python') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="gm-cap">
          <h2 id="gm-cap" className="panel-title">{en ? 'Capstone project' : 'Bitirme projesi'}</h2>
          <p><b>{c.capstone[lang].title}</b></p>
          <p>{c.capstone[lang].summary}</p>
          <Link className="btn btn-primary" href={`${base(c)}/proje`} data-testid={`${c.kit}-capstone`}>{en ? 'Project and deliverables' : 'Proje ve teslimler'} <Icon name="arrowRight" size={16} /></Link>
        </section>
        <section className="panel" aria-labelledby="gm-tools">
          <h2 id="gm-tools" className="panel-title">{en ? 'Tools' : 'Araçlar'}</h2>
          <ul className="eng-list">{t.tools.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      </div>

      <section className="panel" aria-labelledby="gm-rel">
        <h2 id="gm-rel" className="panel-title">{en ? 'Related' : 'İlgili'}</h2>
        <ul className="eng-list">{c.related.map((r) => <li key={r.href}><Link href={r.href}>{r[lang]}</Link></li>)}</ul>
      </section>
    </div>
  )
}

export function UnitView({ c, n, lang }: { c: AnyCourse; n: number; lang: Lang }) {
  const en = lang === 'en'
  const u = c.units.find((x) => x.n === n)!
  const t = u[lang]
  const prev = c.units.find((x) => x.n === n - 1), next = c.units.find((x) => x.n === n + 1)
  const steps = c.capstone.deliverables.filter((d) => d.afterUnit === n)
  const labs = parts(u.hyvex).filter((p) => p.lab)
  const datasets = (u.py?.datasets ?? []).map(datasetById).filter((d): d is NonNullable<typeof d> => !!d).map((d) => ({ file: d.file, title: d.title }))
  return (
    <div className="page eng rb">
      <Crumbs c={c} lang={lang} here={en ? `Unit ${n}` : `${n}. ünite`} />
      <div className="rb-week">
        <nav className="rb-side" aria-label={en ? 'Units' : 'Üniteler'}>
          <ol>
            {c.units.map((x) => (
              <li key={x.n}><Link href={`${base(c)}/unite/${x.n}`} className={x.n === n ? 'on' : undefined} aria-current={x.n === n ? 'page' : undefined}><span className="k">{x.n}</span><span>{x[lang].title}</span></Link></li>
            ))}
            <li><Link href={`${base(c)}/proje`}><span className="k">★</span><span>{en ? 'Capstone project' : 'Bitirme projesi'}</span></Link></li>
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{en ? `Unit ${n} of ${c.units.length} · about ${u.hours} h` : `${n}. ünite / ${c.units.length} · yaklaşık ${u.hours} saat`}</p>
          <h1>{t.title}</h1>
          <p className="lead gm-sum">{t.summary}</p>

          <h2>{en ? 'By the end of this unit you can' : 'Bu ünitenin sonunda'}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h2>{en ? 'Notes' : 'Ders notları'}</h2>
          {/* İçerik ders notlarıdır (lib/rpi, lib/stm32; depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          <h2>{en ? (u.sims.length > 1 ? 'Simulations' : 'Simulation') : (u.sims.length > 1 ? 'Simülasyonlar' : 'Simülasyon')}</h2>
          <div className="rb-sims">
            {u.sims.map((id: string) => <GomuluSim key={id} kit={c.kit} id={id} lang={lang} cfg={u.simCfg?.[id]} title={c.sims[id][lang].title} desc={c.sims[id][lang].desc} />)}
          </div>

          <section className="rb-box" aria-labelledby="gm-try">
            <h3 id="gm-try">{en ? 'Try it yourself' : 'Kendin dene'}</h3>
            <p>{t.tryIt}</p>
          </section>

          {u.py && (
            <section aria-labelledby="gm-py">
              <h2 id="gm-py">{en ? 'Python in the browser' : 'Tarayıcıda Python'}</h2>
              <PyRunner code={u.py.code} file={u.py.file} datasets={datasets} />
            </section>
          )}

          {u.wokwi && (
            <section className="rb-box gm-wokwi" aria-labelledby="gm-wk">
              <h3 id="gm-wk">{en ? 'On Wokwi' : 'Wokwi\'de'}</h3>
              <ul>{u.wokwi[lang].map((s) => <li key={s}>{s}</li>)}</ul>
              <a href={u.wokwi.url} target="_blank" rel="noopener noreferrer">{en ? 'Open Wokwi (new tab)' : 'Wokwi\'yi aç (yeni sekme)'}</a>
            </section>
          )}

          <h2>{en ? 'Code' : 'Kod'}</h2>
          {t.code.map((b) => <CodeBlock key={b.title} title={b.title} src={b.src} lang={lang} />)}

          <section className="rb-pitfalls" aria-labelledby="gm-pit">
            <h2 id="gm-pit">{en ? 'Common mistakes' : 'Sık yapılan hatalar'}</h2>
            <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="rb-se" aria-labelledby="gm-se">
            <h2 id="gm-se">{en ? 'Software engineering connection' : 'Yazılım mühendisliği bağlantısı'}</h2>
            <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
          </section>

          <Quiz key={`${c.slug}-${n}-${lang}`} items={t.quiz} lang={lang} />

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="gm-ps">
              <h3 id="gm-ps">{en ? 'Capstone after this unit' : 'Bu üniteden sonra bitirme projesinde'}</h3>
              <ul>{steps.map((d) => <li key={d.afterUnit}><Link href={`${base(c)}/proje`}><b>{d[lang].title}</b></Link>: {d[lang].deliver}</li>)}</ul>
            </section>
          )}

          {u.hyvex.length > 0 && (
            <section className="rb-hw-box" aria-labelledby="gm-hw">
              <h2 id="gm-hw">{en ? 'Real parts (Hyvex, with 3D models)' : 'Gerçek parçalar (Hyvex, 3B modelli)'}</h2>
              <HyvexChips slugs={u.hyvex} lang={lang} />
              {labs.length > 0 && <ul className="rb-links">{labs.map((p) => <li key={p.slug}><Link href={labHref(p)!}>{en ? 'Open in the lab' : 'Laboratuvarda aç'}: {partText(p, lang).name}</Link></li>)}</ul>}
              {u.esofWeek && <p className="rb-small"><Link href={`/muhendislik/robotik/hafta/${u.esofWeek}`}>{en ? `ESOF 323, week ${u.esofWeek}` : `ESOF 323, ${u.esofWeek}. hafta`}</Link></p>}
            </section>
          )}

          <nav className="rb-pager" aria-label={en ? 'Units' : 'Üniteler'}>
            {prev ? <Link href={`${base(c)}/unite/${prev.n}`}><small>{en ? 'Previous unit' : 'Önceki ünite'}</small>{prev[lang].title}</Link> : <span />}
            {next
              ? <Link href={`${base(c)}/unite/${next.n}`} className="r"><small>{en ? 'Next unit' : 'Sonraki ünite'}</small>{next[lang].title}</Link>
              : <Link href={`${base(c)}/proje`} className="r"><small>{en ? 'Next' : 'Sıradaki'}</small>{c.capstone[lang].title}</Link>}
          </nav>
        </article>
      </div>
    </div>
  )
}

export function ProjectView({ c, lang }: { c: AnyCourse; lang: Lang }) {
  const en = lang === 'en'
  const t = c.capstone[lang]
  return (
    <div className="page eng rb">
      <Crumbs c={c} lang={lang} here={en ? 'Capstone project' : 'Bitirme projesi'} />
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{en ? 'Simulation + real board' : 'Simülasyon + gerçek kart'}</span><span className="eng-tag">{en ? 'Capstone' : 'Bitirme'}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="gp-sc"><h2 id="gp-sc">{en ? 'Scenario' : 'Senaryo'}</h2><p>{t.scenario}</p></section>
          <section aria-labelledby="gp-req"><h2 id="gp-req">{en ? 'Requirements (testable)' : 'Gereksinimler (test edilebilir)'}</h2><ul className="eng-list">{t.requirements.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="gp-arch"><h2 id="gp-arch">{en ? 'Architecture' : 'Mimari'}</h2><ul className="eng-list">{t.architecture.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="gp-test"><h2 id="gp-test">{en ? 'Verification' : 'Doğrulama'}</h2><ul className="eng-list">{t.tests.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="gp-demo"><h2 id="gp-demo">{en ? 'Demo script' : 'Demo akışı'}</h2><ol className="eng-list">{t.demo.map((r) => <li key={r}>{r}</li>)}</ol></section>
          <section aria-labelledby="gp-code"><h2 id="gp-code">{en ? 'Starter code' : 'Başlangıç kodu'}</h2>{c.starter(lang).map((b) => <CodeBlock key={b.title} title={b.title} src={b.src} lang={lang} />)}</section>
          <section aria-labelledby="gp-ms">
            <h2 id="gp-ms">{en ? 'Deliverables' : 'Teslimler'}</h2>
            <ol className="rb-milestones">
              {c.capstone.deliverables.map((d) => (
                <li key={d.afterUnit}>
                  <Link href={`${base(c)}/unite/${d.afterUnit}`} className="rb-ms-week">{en ? `After unit ${d.afterUnit}` : `${d.afterUnit}. üniteden sonra`}</Link>
                  <div><b>{d[lang].title}</b><p>{d[lang].deliver}</p><small className="muted">{c.units.find((u) => u.n === d.afterUnit)?.[lang].title}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="gp-gr">
            <h2 id="gp-gr" className="panel-title">{en ? 'Grading' : 'Notlandırma'}</h2>
            <dl className="value-list">{c.capstone.grading[lang].map(([k, v]) => <div key={k}><dt>{k}</dt><dd><b>{v}</b></dd></div>)}</dl>
          </section>
          <section className="panel" aria-labelledby="gp-parts">
            <h2 id="gp-parts" className="panel-title">{en ? 'Parts for a real build' : 'Gerçek yapım için parçalar'}</h2>
            <ul className="eng-sib">{parts(c.capstone.hyvex).map((b) => <li key={b.slug}><Link href={`/muhendislik/parca/${b.slug}`}>{partText(b, lang).name}</Link><small>{en ? 'L' : 'S'}{b.level}</small></li>)}</ul>
          </section>
          <section className="panel" aria-labelledby="gp-cert">
            <h2 id="gp-cert" className="panel-title">{en ? 'Certificate' : 'Belge'}</h2>
            <p className="rb-small">{c.text[lang].certificate}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export function SimsView({ c, lang }: { c: AnyCourse; lang: Lang }) {
  const en = lang === 'en'
  const ids = Object.keys(c.sims)
  const unitOf = (id: string) => c.units.find((u) => (u.sims as string[]).includes(id))
  return (
    <div className="page eng rb">
      <Crumbs c={c} lang={lang} here={en ? 'Simulations' : 'Simülasyonlar'} />
      <header className="page-title"><h1>{en ? 'All simulations' : 'Tüm simülasyonlar'}</h1><p className="lead">{en ? 'Every simulation of the course on one page; each also appears in its unit.' : 'Dersin tüm simülasyonları tek sayfada; her biri kendi ünitesinde de var.'}</p></header>
      <div className="rb-sims">
        {ids.map((id) => {
          const u = unitOf(id)
          return (
            <div key={id}>
              {u && <p className="rb-small"><Link href={`${base(c)}/unite/${u.n}`}>{en ? `Unit ${u.n}` : `${u.n}. ünite`}: {u[lang].title}</Link></p>}
              <GomuluSim kit={c.kit} id={id} lang={lang} cfg={u?.simCfg?.[id]} title={c.sims[id][lang].title} desc={c.sims[id][lang].desc} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
