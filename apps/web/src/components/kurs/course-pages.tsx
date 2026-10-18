// Ünite tabanlı derslerin (IoT, Sensör verisinden ML) ortak sunucu sayfaları: genel bakış, ünite, bitirme projesi ve tüm
// simülasyonlar. Drone dersi sayfalarıyla aynı düzen ve sınıflar (robotik.css); simülasyon kutusu derse özgü istemci
// bileşenidir ve `sim` ile verilir. Python çalıştırıcı ML dersinin PyRunner'ıdır (aynı /veri/ml veri setleri).
import Link from 'next/link'
import type { ReactNode } from 'react'
import { PyRunner } from '@/components/ml/py-runner'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { Icon } from '@/components/shell/icons'
import type { Capstone, CodeBlock as Code, CourseMeta, CourseUnit, Lang } from '@/lib/kurs/types'
import { labHref, partBySlug, partText, type EngPart } from '@/lib/muhendislik/catalog'
import { datasetById, type DataSet } from '@/lib/ml/veri'

export interface CourseView<S extends string> {
  meta: CourseMeta
  units: readonly CourseUnit<S>[]
  capstone: Capstone
  simMeta: Record<S, { tr: { title: string; desc: string }; en: { title: string; desc: string } }>
  sim: (id: S, lang: Lang) => ReactNode
  starter?: (lang: Lang) => Code
  related: Array<{ href: string; tr: string; en: string }>
}

const WOKWI_ESP32 = 'https://wokwi.com/projects/new/esp32'
const base = (m: CourseMeta) => `/muhendislik/${m.slug}`

function Crumbs({ v, lang, here }: { v: { meta: CourseMeta }; lang: Lang; here?: string }) {
  const en = lang === 'en'
  return (
    <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
      <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
      {here ? <><Link href={base(v.meta)}>{v.meta[lang].title}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{here}</span></>
        : <span aria-current="page">{v.meta[lang].title}</span>}
    </nav>
  )
}

export function CourseOverview<S extends string>({ v, lang }: { v: CourseView<S>; lang: Lang }) {
  const en = lang === 'en'
  const m = v.meta[lang]
  const sims = Object.keys(v.simMeta) as S[]
  const b = base(v.meta)
  return (
    <div className="page eng rb">
      <Crumbs v={v} lang={lang} />
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'For adults · 16+ · vocational' : 'Büyükler için · 16+ · mesleki'}</p>
        <h1>{m.title}</h1>
        <p className="lead">{m.lede}</p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Units' : 'Ünite'}</dt><dd>{v.units.length}</dd></div>
          <div><dt>{en ? 'Simulations' : 'Simülasyon'}</dt><dd>{sims.length}</dd></div>
          <div><dt>{en ? 'Hours' : 'Saat'}</dt><dd>{v.meta.hours}</dd></div>
        </dl>
        <dl className="ks-facts">
          <div><dt>{en ? 'Audience' : 'Hedef kitle'}</dt><dd>{m.audience}</dd></div>
          <div><dt>{en ? 'Duration' : 'Süre'}</dt><dd>{m.duration}</dd></div>
          <div><dt>{en ? 'Prerequisites' : 'Ön koşul'}</dt><dd>{m.prereq}</dd></div>
        </dl>
        <p className="ks-cert">{m.certificate}</p>
        <p className="rb-actions">
          <Link className="btn btn-primary" href={`${b}/unite/1`} data-testid={`${v.meta.slug}-start`}>{en ? 'Start with unit 1' : '1. üniteyle başla'}</Link>
          <Link className="btn btn-ghost" href={`${b}/simulasyon`}>{en ? 'All simulations' : 'Tüm simülasyonlar'}</Link>
          <Link className="btn btn-ghost" href={`${b}/proje`}>{en ? 'Capstone project' : 'Bitirme projesi'}</Link>
        </p>
      </header>

      <section aria-labelledby="ks-out">
        <h2 id="ks-out">{en ? 'Learning outcomes' : 'Kazanımlar'}</h2>
        <ul className="eng-list">{m.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
      </section>

      <section aria-labelledby="ks-plan">
        <h2 id="ks-plan">{en ? 'Units' : 'Üniteler'}</h2>
        <div className="rb-scroll">
          <table className="rb-table ks-units">
            <thead><tr><th>{en ? 'Unit' : 'Ünite'}</th><th>{en ? 'Topic' : 'Konu'}</th><th>{en ? 'Simulations' : 'Simülasyonlar'}</th></tr></thead>
            <tbody>
              {v.units.map((u) => (
                <tr key={u.n}>
                  <td className="n">{u.n}</td>
                  <td><Link href={`${b}/unite/${u.n}`} data-testid={`${v.meta.slug}-unit-${u.n}`}>{u[lang].title}</Link><br /><span className="rb-tcell">{u[lang].summary}</span></td>
                  <td className="rb-tcell">{u.sims.map((s) => v.simMeta[s][lang].title).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="ks-cap">
          <h2 id="ks-cap" className="panel-title">{en ? 'Capstone project' : 'Bitirme projesi'}</h2>
          <p>{v.capstone[lang].summary}</p>
          <Link className="btn btn-primary" href={`${b}/proje`} data-testid={`${v.meta.slug}-capstone`}>{en ? 'Project and deliverables' : 'Proje ve teslimler'} <Icon name="arrowRight" size={16} /></Link>
        </section>
        <section className="panel" aria-labelledby="ks-rel">
          <h2 id="ks-rel" className="panel-title">{en ? 'Related' : 'İlgili'}</h2>
          <ul className="eng-list">{v.related.map((r) => <li key={r.href}><Link href={r.href}>{r[lang]}</Link></li>)}</ul>
        </section>
      </div>
    </div>
  )
}

export function CourseUnitPage<S extends string>({ v, u, lang }: { v: CourseView<S>; u: CourseUnit<S>; lang: Lang }) {
  const en = lang === 'en'
  const t = u[lang]
  const b = base(v.meta)
  const prev = v.units.find((x) => x.n === u.n - 1), next = v.units.find((x) => x.n === u.n + 1)
  const parts = u.parts.map(partBySlug).filter((p): p is EngPart => !!p)
  const labs = parts.filter((p) => p.lab)
  const steps = v.capstone.deliverables.filter((d) => d.afterUnit === u.n)
  const pyData = (u.py?.data ?? []).map(datasetById).filter((d): d is DataSet => !!d)
  return (
    <div className="page eng rb">
      <Crumbs v={v} lang={lang} here={en ? `Unit ${u.n}` : `${u.n}. ünite`} />
      <div className="rb-week">
        <nav className="rb-side" aria-label={en ? 'Units' : 'Üniteler'}>
          <ol>
            {v.units.map((x) => (
              <li key={x.n}>
                <Link href={`${b}/unite/${x.n}`} className={x.n === u.n ? 'on' : undefined} aria-current={x.n === u.n ? 'page' : undefined}>
                  <span className="k">{x.n}</span><span>{x[lang].title}</span>
                </Link>
              </li>
            ))}
            <li><Link href={`${b}/proje`}><span className="k">★</span><span>{en ? 'Capstone project' : 'Bitirme projesi'}</span></Link></li>
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{en ? `Unit ${u.n} of ${v.units.length}` : `${u.n}. ünite / ${v.units.length}`}</p>
          <h1>{t.title}</h1>
          <p className="lead">{t.summary}</p>

          <h2>{en ? 'By the end of this unit you can' : 'Bu ünitenin sonunda'}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h2>{en ? 'Notes' : 'Ders notları'}</h2>
          {/* İçerik ders notlarıdır (lib/<ders>, depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          <h2>{en ? (u.sims.length > 1 ? 'Simulations' : 'Simulation') : (u.sims.length > 1 ? 'Simülasyonlar' : 'Simülasyon')}</h2>
          <div className="rb-sims">{u.sims.map((id) => <div key={id}>{v.sim(id, lang)}</div>)}</div>

          {t.code.length > 0 && (
            <>
              <h2>{en ? 'Code' : 'Kod'}</h2>
              {t.code.map((c) => <CodeBlock key={c.title} title={c.title} src={c.src} lang={lang} />)}
            </>
          )}
          {u.py && <PyRunner code={u.py.code} file={u.py.file} datasets={pyData.map((d) => ({ file: d.file, title: d.title }))} />}

          <section className="rb-box" aria-labelledby="ks-try">
            <h3 id="ks-try">{en ? 'Try it yourself' : 'Kendin dene'}</h3>
            <p>{t.lab}</p>
            {(u.wokwi || labs.length > 0) && (
              <ul className="rb-links">
                {u.wokwi && <li><a href={WOKWI_ESP32} target="_blank" rel="noopener noreferrer">{en ? 'New ESP32 project in Wokwi' : 'Wokwi\'de yeni ESP32 projesi'} ↗</a></li>}
                {labs.map((p) => <li key={p.slug}><Link href={labHref(p)!}>{en ? 'Open in the lab' : 'Laboratuvarda aç'}: {partText(p, lang).name}</Link></li>)}
              </ul>
            )}
          </section>

          <section className="rb-pitfalls" aria-labelledby="ks-pit">
            <h2 id="ks-pit">{en ? 'Common mistakes' : 'Sık yapılan hatalar'}</h2>
            <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="rb-se" aria-labelledby="ks-se">
            <h2 id="ks-se">{en ? 'Software engineering connection' : 'Yazılım mühendisliği bağlantısı'}</h2>
            <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
          </section>

          <Quiz key={`${v.meta.slug}-${u.n}-${lang}`} items={t.quiz} lang={lang} />

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="ks-ps">
              <h3 id="ks-ps">{en ? 'Capstone after this unit' : 'Bu üniteden sonra bitirme projesinde'}</h3>
              <ul>{steps.map((d) => <li key={d.afterUnit}><Link href={`${b}/proje`}><b>{d[lang].title}</b></Link>: {d[lang].deliver}</li>)}</ul>
            </section>
          )}

          {(parts.length > 0 || (u.related?.length ?? 0) > 0) && (
            <section className="rb-hw-box" aria-labelledby="ks-hw">
              <h2 id="ks-hw">{en ? 'Parts and related pages' : 'Parçalar ve ilgili sayfalar'}</h2>
              {parts.length > 0 && (
                <ul className="eng-chips">
                  {parts.map((p) => <li key={p.slug}><Link className="eng-chip" href={`/muhendislik/parca/${p.slug}`}><span className="eng-chip-lv">{en ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>)}
                </ul>
              )}
              {u.related && u.related.length > 0 && (
                <ul className="rb-links">{u.related.map((r) => <li key={r.href}><Link href={r.href}>{r[lang]}</Link></li>)}</ul>
              )}
            </section>
          )}

          <nav className="rb-pager" aria-label={en ? 'Units' : 'Üniteler'}>
            {prev ? <Link href={`${b}/unite/${prev.n}`}><small>{en ? 'Previous unit' : 'Önceki ünite'}</small>{prev[lang].title}</Link> : <span />}
            {next
              ? <Link href={`${b}/unite/${next.n}`} className="r"><small>{en ? 'Next unit' : 'Sonraki ünite'}</small>{next[lang].title}</Link>
              : <Link href={`${b}/proje`} className="r"><small>{en ? 'Next' : 'Sıradaki'}</small>{v.capstone[lang].title}</Link>}
          </nav>
        </article>
      </div>
    </div>
  )
}

export function CourseProject<S extends string>({ v, lang, sims = [] }: { v: CourseView<S>; lang: Lang; sims?: S[] }) {
  const en = lang === 'en'
  const t = v.capstone[lang]
  const b = base(v.meta)
  const parts = v.capstone.parts.map(partBySlug).filter((p): p is EngPart => !!p)
  const sec = (id: string, title: string, items: string[]) => (
    <section aria-labelledby={id}><h2 id={id}>{title}</h2><ul className="eng-list">{items.map((r) => <li key={r}>{r}</li>)}</ul></section>
  )
  return (
    <div className="page eng rb">
      <Crumbs v={v} lang={lang} here={en ? 'Capstone project' : 'Bitirme projesi'} />
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{en ? 'Browser simulation + real hardware option' : 'Tarayıcı simülasyonu + gerçek donanım seçeneği'}</span><span className="eng-tag">{en ? 'Capstone' : 'Bitirme'}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="kp-sc"><h2 id="kp-sc">{en ? 'Scenario' : 'Senaryo'}</h2><p>{t.scenario}</p></section>
          {sec('kp-req', en ? 'Requirements (testable)' : 'Gereksinimler (test edilebilir)', t.requirements)}
          {sec('kp-arch', en ? 'Architecture' : 'Mimari', t.architecture)}
          {sec('kp-test', en ? 'Tests' : 'Testler', t.tests)}
          {sec('kp-demo', en ? 'Demo' : 'Demo', t.demo)}
          {sims.length > 0 && (
            <section aria-labelledby="kp-sim"><h2 id="kp-sim">{en ? 'Work in the simulation' : 'Simülasyonda çalış'}</h2><div className="rb-sims">{sims.map((id) => <div key={id}>{v.sim(id, lang)}</div>)}</div></section>
          )}
          {v.starter && <section aria-labelledby="kp-code"><h2 id="kp-code">{en ? 'Starter code' : 'Başlangıç kodu'}</h2><CodeBlock {...v.starter(lang)} lang={lang} /></section>}
          <section aria-labelledby="kp-ms">
            <h2 id="kp-ms">{en ? 'Deliverables' : 'Teslimler'}</h2>
            <ol className="rb-milestones">
              {v.capstone.deliverables.map((d) => (
                <li key={d.afterUnit}>
                  <Link href={`${b}/unite/${d.afterUnit}`} className="rb-ms-week">{en ? `After unit ${d.afterUnit}` : `${d.afterUnit}. üniteden sonra`}</Link>
                  <div><b>{d[lang].title}</b><p>{d[lang].deliver}</p><small className="muted">{v.units.find((x) => x.n === d.afterUnit)?.[lang].title}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="kp-gr">
            <h2 id="kp-gr" className="panel-title">{en ? 'Grading' : 'Notlandırma'}</h2>
            <dl className="value-list">{v.capstone.grading.map((g) => <div key={g.tr}><dt>{g[lang]}</dt><dd><b>{en ? `${g.pct}%` : `%${g.pct}`}</b></dd></div>)}</dl>
          </section>
          {parts.length > 0 && (
            <section className="panel" aria-labelledby="kp-parts">
              <h2 id="kp-parts" className="panel-title">{en ? 'Parts (Hyvex)' : 'Parçalar (Hyvex)'}</h2>
              <ul className="eng-sib">{parts.map((p) => <li key={p.slug}><Link href={labHref(p) ?? `/muhendislik/parca/${p.slug}`}>{partText(p, lang).name}</Link><small>{p.lab ? (en ? 'lab' : 'lab') : `${en ? 'L' : 'S'}${p.level}`}</small></li>)}</ul>
            </section>
          )}
          <section className="panel" aria-labelledby="kp-cert">
            <h2 id="kp-cert" className="panel-title">{en ? 'Certificate' : 'Belge'}</h2>
            <p className="rb-small">{v.meta[lang].certificate}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export function CourseSims<S extends string>({ v, lang }: { v: CourseView<S>; lang: Lang }) {
  const en = lang === 'en'
  const ids = Object.keys(v.simMeta) as S[]
  const unitOfSim = (s: S) => v.units.find((u) => u.sims.includes(s))
  return (
    <div className="page eng rb">
      <Crumbs v={v} lang={lang} here={en ? 'Simulations' : 'Simülasyonlar'} />
      <header className="page-title">
        <h1>{en ? `${v.meta.en.title}: all simulations` : `${v.meta.tr.title}: tüm simülasyonlar`}</h1>
        <p className="lead">{en ? 'Every simulation runs in your browser, deterministically, with no account and no hardware. Each one belongs to a unit; open the unit for the notes, code and quiz.' : 'Her simülasyon tarayıcında, deterministik olarak, hesap ve donanım gerekmeden çalışır. Her biri bir üniteye bağlı; notlar, kod ve quiz için üniteyi aç.'}</p>
      </header>
      <div className="rb-sims">
        {ids.map((id) => {
          const u = unitOfSim(id)
          return (
            <div key={id}>
              {v.sim(id, lang)}
              {u && <p className="rb-small"><Link href={`${base(v.meta)}/unite/${u.n}`}>{en ? `Unit ${u.n}` : `${u.n}. ünite`}: {u[lang].title}</Link></p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
