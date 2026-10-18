// Büyükler için ünite tabanlı derslerin (OpenCV, PyTorch) ortak sayfa iskeleti: genel bakış, ünite ve bitirme projesi.
// Drone dersi ve ESOF 323 ile aynı görünüm (robotik.css sınıfları); dersin kendi aracı, kodu ve defter bağlantısı fonksiyon
// olarak verilir. Sunucu bileşenleri; araçlar istemci bileşenidir ve render fonksiyonlarından döner.
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { Icon } from '@/components/shell/icons'
import { CERT_NOTE, type KursCapstone, type KursCode, type KursMeta, type KursUnit, type Lang } from '@/lib/kurs/types'

export interface KursConfig<T extends string> {
  base: string
  meta: KursMeta
  units: readonly KursUnit<T>[]
  capstone: KursCapstone
  /** Kart üstü küçük etiket (ör. "Tarayıcıda görüntü işleme"). */
  eyebrow: Record<Lang, string>
  toolTitle: (id: T, lang: Lang) => string
  renderTool: (id: T, lang: Lang, cfg?: Record<string, string>) => ReactNode
  renderCode?: (c: KursCode, lang: Lang, u: KursUnit<T>) => ReactNode
  /** Defter bağlantısı (yalnız defteri olan derslerde). */
  notebookHref?: (name: string, lang: Lang) => string
  /** Ünite sayfasında araç başlığı: "Oyun alanı" / "Görselleştirici". */
  toolsHeading: Record<Lang, [string, string]>
  /** Genel bakışta ek bölümler (araçlar, ilgili dersler…). */
  extra?: (lang: Lang) => ReactNode
  /** Bitirme sayfasının başlangıç aracı ve kodu. */
  capstoneTool?: (lang: Lang) => ReactNode
  capstoneCode?: (lang: Lang) => KursCode[]
  testId: string
}

const T = (l: Lang, tr: string, en: string) => (l === 'en' ? en : tr)

function Crumbs({ c, lang, here }: { c: KursConfig<string>; lang: Lang; here?: string }) {
  return (
    <nav aria-label={T(lang, 'Konum', 'Breadcrumb')} className="crumbs">
      <Link href="/muhendislik">{T(lang, 'Mühendislik yolu', 'Engineering path')}</Link><Icon name="chevronRight" size={14} />
      {here ? <><Link href={c.base}>{c.meta[lang].title}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{here}</span></> : <span aria-current="page">{c.meta[lang].title}</span>}
    </nav>
  )
}

function NotebookPanel({ href, lang, name }: { href: string; lang: Lang; name: string }) {
  return (
    <section className="rb-box kurs-nb" aria-labelledby={`nb-${name}`}>
      <h3 id={`nb-${name}`}>{T(lang, 'Colab defteri', 'Colab notebook')}</h3>
      <p>{T(lang, 'PyTorch tarayıcıda çalışmaz; gerçek kodu Google Colab\'da (ücretsiz GPU ile) çalıştır. Defteri indir, colab.research.google.com adresinde "Dosya → Not defteri yükle" ile aç, "Çalışma zamanı → Çalışma zamanı türünü değiştir → T4 GPU" seç ve hücreleri sırayla çalıştır.', 'PyTorch does not run in the browser; run the real code in Google Colab (with a free GPU). Download the notebook, open it at colab.research.google.com with "File → Upload notebook", choose "Runtime → Change runtime type → T4 GPU" and run the cells in order.')}</p>
      <a className="btn btn-primary" href={href} download data-testid="kurs-notebook">{T(lang, 'Defteri indir (.ipynb)', 'Download the notebook (.ipynb)')}</a>
    </section>
  )
}

export function KursOverview<T extends string>({ c, lang }: { c: KursConfig<T>; lang: Lang }) {
  const m = c.meta[lang]
  const tools = [...new Set(c.units.flatMap((u) => u.tools))]
  return (
    <div className="page eng rb kurs">
      <Crumbs c={c as unknown as KursConfig<string>} lang={lang} />
      <header className="eng-hero">
        <p className="eyebrow">{c.eyebrow[lang]}</p>
        <h1>{m.title}</h1>
        <p className="lead">{m.lede}</p>
        <dl className="eng-stats">
          <div><dt>{T(lang, 'Ünite', 'Units')}</dt><dd>{c.units.length}</dd></div>
          <div><dt>{c.toolsHeading[lang][1]}</dt><dd>{tools.length}</dd></div>
          <div><dt>{T(lang, 'Saat', 'Hours')}</dt><dd>{c.meta.hours}</dd></div>
        </dl>
        <p className="rb-actions">
          <Link className="btn btn-primary" href={`${c.base}/unite/1`} data-testid={`${c.testId}-start`}>{T(lang, '1. üniteyle başla', 'Start with unit 1')}</Link>
          <Link className="btn btn-ghost" href={`${c.base}/proje`}>{T(lang, 'Bitirme projesi', 'Capstone project')}</Link>
        </p>
      </header>

      <div className="rb-two">
        <section className="panel" aria-labelledby="k-who">
          <h2 id="k-who" className="panel-title">{T(lang, 'Kimin için', 'Who it is for')}</h2>
          <dl className="value-list kurs-facts">
            <div><dt>{T(lang, 'Hedef kitle', 'Audience')}</dt><dd>{m.audience}</dd></div>
            <div><dt>{T(lang, 'Süre', 'Duration')}</dt><dd>{T(lang, `${c.meta.hours} saat · ${c.units.length} ünite + bitirme projesi`, `${c.meta.hours} hours · ${c.units.length} units + capstone`)}</dd></div>
            <div><dt>{T(lang, 'Ön koşul', 'Prerequisites')}</dt><dd>{m.prereq}</dd></div>
            <div><dt>{T(lang, 'Belge', 'Certificate')}</dt><dd>{CERT_NOTE[lang]}</dd></div>
          </dl>
        </section>
        <section className="panel" aria-labelledby="k-out">
          <h2 id="k-out" className="panel-title">{T(lang, 'Kazanımlar', 'Learning outcomes')}</h2>
          <ul className="eng-list">{m.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
        </section>
      </div>

      <section aria-labelledby="k-plan">
        <h2 id="k-plan">{T(lang, 'Üniteler', 'Units')}</h2>
        <div className="rb-scroll">
          <table className="rb-table dr-units">
            <thead><tr><th>{T(lang, 'Ünite', 'Unit')}</th><th>{T(lang, 'Konu', 'Topic')}</th><th>{c.toolsHeading[lang][1]}</th></tr></thead>
            <tbody>
              {c.units.map((u) => (
                <tr key={u.n}>
                  <td className="n">{u.n}</td>
                  <td><Link href={`${c.base}/unite/${u.n}`} data-testid={`${c.testId}-unit-${u.n}`}>{u[lang].title}</Link><br /><span className="rb-tcell">{u[lang].summary}</span></td>
                  <td className="rb-tcell">{u.tools.map((t) => c.toolTitle(t, lang)).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="k-cap">
          <h2 id="k-cap" className="panel-title">{T(lang, 'Bitirme projesi', 'Capstone project')}</h2>
          <p><b>{c.capstone[lang].title}</b></p>
          <p>{c.capstone[lang].summary}</p>
          <Link className="btn btn-primary" href={`${c.base}/proje`} data-testid={`${c.testId}-capstone`}>{T(lang, 'Proje ve teslimler', 'Project and deliverables')} <Icon name="arrowRight" size={16} /></Link>
        </section>
        {c.extra?.(lang)}
      </div>
    </div>
  )
}

export function KursUnitPage<T extends string>({ c, u, lang }: { c: KursConfig<T>; u: KursUnit<T>; lang: Lang }) {
  const t = u[lang]
  const idx = c.units.findIndex((x) => x.n === u.n)
  const prev = c.units[idx - 1], next = c.units[idx + 1]
  const steps = c.capstone.deliverables.filter((d) => d.afterUnit === u.n)
  const [one, many] = c.toolsHeading[lang]
  return (
    <div className="page eng rb kurs">
      <Crumbs c={c as unknown as KursConfig<string>} lang={lang} here={T(lang, `${u.n}. ünite`, `Unit ${u.n}`)} />
      <div className="rb-week">
        <nav className="rb-side" aria-label={T(lang, 'Üniteler', 'Units')}>
          <ol>
            {c.units.map((x) => (
              <li key={x.n}>
                <Link href={`${c.base}/unite/${x.n}`} className={x.n === u.n ? 'on' : undefined} aria-current={x.n === u.n ? 'page' : undefined}>
                  <span className="k">{x.n}</span><span>{x[lang].title}</span>
                </Link>
              </li>
            ))}
            <li><Link href={`${c.base}/proje`}><span className="k">★</span><span>{T(lang, 'Bitirme projesi', 'Capstone project')}</span></Link></li>
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{T(lang, `${u.n}. ünite / ${c.units.length}`, `Unit ${u.n} of ${c.units.length}`)}</p>
          <h1>{t.title}</h1>
          <p className="lead kurs-sum">{t.summary}</p>

          <h2>{T(lang, 'Bu ünitenin sonunda', 'By the end of this unit you can')}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h2>{T(lang, 'Ders notları', 'Notes')}</h2>
          {/* İçerik ders notlarıdır (lib/opencv, lib/pytorch; depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          <h2>{u.tools.length > 1 ? many : one}</h2>
          <div className="rb-sims">{u.tools.map((id) => <div key={id}>{c.renderTool(id, lang, u.toolCfg?.[id])}</div>)}</div>
          <section className="rb-box">
            <h3>{T(lang, 'Kendin dene', 'Try it yourself')}</h3>
            {/* "Kendin dene" metninde yalnız basit biçim etiketleri (sub, sup) var. */}
            <p dangerouslySetInnerHTML={{ __html: t.lab }} />
          </section>

          <h2>{T(lang, 'Kod', 'Code')}</h2>
          {t.code.map((k) => <div key={k.title}>{c.renderCode ? c.renderCode(k, lang, u) : <CodeBlock title={k.title} src={k.src} lang={lang} />}</div>)}
          {u.notebook && c.notebookHref && <NotebookPanel href={c.notebookHref(u.notebook, lang)} lang={lang} name={u.notebook} />}

          <section className="rb-pitfalls" aria-labelledby="k-pit">
            <h2 id="k-pit">{T(lang, 'Sık yapılan hatalar', 'Common mistakes')}</h2>
            <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="rb-se" aria-labelledby="k-se">
            <h2 id="k-se">{T(lang, 'Yazılım mühendisliği bağlantısı', 'Software engineering connection')}</h2>
            <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
          </section>

          <Quiz key={`${c.testId}-${u.n}-${lang}`} items={t.quiz} lang={lang} />

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="k-ps">
              <h3 id="k-ps">{T(lang, 'Bu üniteden sonra bitirme projesinde', 'Capstone after this unit')}</h3>
              <ul>{steps.map((d) => <li key={d.afterUnit}><Link href={`${c.base}/proje`}><b>{d[lang].title}</b></Link>: {d[lang].deliver}</li>)}</ul>
            </section>
          )}

          <nav className="rb-pager" aria-label={T(lang, 'Üniteler', 'Units')}>
            {prev ? <Link href={`${c.base}/unite/${prev.n}`}><small>{T(lang, 'Önceki ünite', 'Previous unit')}</small>{prev[lang].title}</Link> : <span />}
            {next
              ? <Link href={`${c.base}/unite/${next.n}`} className="r"><small>{T(lang, 'Sonraki ünite', 'Next unit')}</small>{next[lang].title}</Link>
              : <Link href={`${c.base}/proje`} className="r"><small>{T(lang, 'Sıradaki', 'Next')}</small>{c.capstone[lang].title}</Link>}
          </nav>
        </article>
      </div>
    </div>
  )
}

export function KursCapstonePage<T extends string>({ c, lang }: { c: KursConfig<T>; lang: Lang }) {
  const t = c.capstone[lang]
  const unitTitle = (n: number) => c.units.find((u) => u.n === n)?.[lang].title
  return (
    <div className="page eng rb kurs">
      <Crumbs c={c as unknown as KursConfig<string>} lang={lang} here={T(lang, 'Bitirme projesi', 'Capstone project')} />
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{c.eyebrow[lang]}</span><span className="eng-tag">{T(lang, 'Bitirme', 'Capstone')}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      {c.capstoneTool && <section className="kurs-cap-tool" aria-label={T(lang, 'Tarayıcıda dene', 'Try in the browser')}>{c.capstoneTool(lang)}</section>}
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="kp-sc"><h2 id="kp-sc">{T(lang, 'Senaryo', 'Scenario')}</h2><p>{t.scenario}</p></section>
          <section aria-labelledby="kp-req"><h2 id="kp-req">{T(lang, 'Gereksinimler (test edilebilir)', 'Requirements (testable)')}</h2><ul className="eng-list">{t.requirements.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="kp-arch"><h2 id="kp-arch">{T(lang, 'Mimari', 'Architecture')}</h2><ul className="eng-list">{t.architecture.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="kp-test"><h2 id="kp-test">{T(lang, 'Test planı', 'Test plan')}</h2><ul className="eng-list">{t.tests.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="kp-demo"><h2 id="kp-demo">{T(lang, 'Demo ve sunum', 'Demo and presentation')}</h2><ul className="eng-list">{t.demo.map((r) => <li key={r}>{r}</li>)}</ul></section>
          {c.capstoneCode && <section aria-labelledby="kp-code"><h2 id="kp-code">{T(lang, 'Başlangıç kodu', 'Starter code')}</h2>{c.capstoneCode(lang).map((k) => <CodeBlock key={k.title} title={k.title} src={k.src} lang={lang} />)}</section>}
          {c.capstone.notebook && c.notebookHref && <NotebookPanel href={c.notebookHref(c.capstone.notebook, lang)} lang={lang} name={c.capstone.notebook} />}
          <section aria-labelledby="kp-ms">
            <h2 id="kp-ms">{T(lang, 'Teslimler', 'Deliverables')}</h2>
            <ol className="rb-milestones">
              {c.capstone.deliverables.map((d) => (
                <li key={d.afterUnit}>
                  <Link href={`${c.base}/unite/${d.afterUnit}`} className="rb-ms-week">{T(lang, `${d.afterUnit}. üniteden sonra`, `After unit ${d.afterUnit}`)}</Link>
                  <div><b>{d[lang].title}</b><p>{d[lang].deliver}</p><small className="muted">{unitTitle(d.afterUnit)}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="kp-gr">
            <h2 id="kp-gr" className="panel-title">{T(lang, 'Notlandırma', 'Grading')}</h2>
            <dl className="value-list">
              {(lang === 'en' ? [['Proposal and requirements', '15%'], ['Intermediate deliverables', '25%'], ['Working demo', '25%'], ['Tests and software quality', '20%'], ['Report and presentation', '15%']]
                : [['Öneri ve gereksinimler', '%15'], ['Ara teslimler', '%25'], ['Çalışan demo', '%25'], ['Testler ve yazılım kalitesi', '%20'], ['Rapor ve sunum', '%15']]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd><b>{v}</b></dd></div>)}
            </dl>
          </section>
          <section className="panel" aria-labelledby="kp-cert">
            <h2 id="kp-cert" className="panel-title">{T(lang, 'Belge', 'Certificate')}</h2>
            <p className="rb-small">{CERT_NOTE[lang]}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
