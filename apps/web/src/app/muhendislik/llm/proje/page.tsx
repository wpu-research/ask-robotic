import type { Metadata } from 'next'
import Link from 'next/link'
import { CodeBlock } from '@/components/robotik/code-block'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { ragPy } from '@/lib/llm/code-a'
import { streamServerJs } from '@/lib/llm/code-b'
import { LLM_COURSE, unitOf } from '@/lib/llm/course'
import { CAPSTONE } from '@/lib/llm/project'

export const metadata: Metadata = { title: 'LLM bitirme projesi', description: 'Ders notlarından soru-cevap asistanı: RAG, şemalı çıktı, değerlendirme, güvenlik ve akışlı arayüz; gereksinimler, mimari, test ve demo.' }

export default async function LlmProje() {
  const lang = await getLocale()
  const en = lang === 'en'
  const t = CAPSTONE[lang]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/llm">{LLM_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Capstone project' : 'Bitirme projesi'}</span>
      </nav>
      <header className="page-title eng-part-head">
        <p className="eng-card-top"><span className="eng-tag eng-tag-lab">{en ? 'Python or Node.js + Anthropic API' : 'Python ya da Node.js + Anthropic API'}</span><span className="eng-tag">{en ? 'Capstone' : 'Bitirme'}</span></p>
        <h1>{t.title}</h1>
        <p className="lead">{t.summary}</p>
      </header>
      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="lp-sc"><h2 id="lp-sc">{en ? 'Scenario' : 'Senaryo'}</h2><p>{t.scenario}</p></section>
          <section aria-labelledby="lp-req"><h2 id="lp-req">{en ? 'Requirements (testable)' : 'Gereksinimler (test edilebilir)'}</h2><ul className="eng-list">{t.requirements.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="lp-arch"><h2 id="lp-arch">{en ? 'Architecture' : 'Mimari'}</h2><ul className="eng-list">{t.architecture.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="lp-test"><h2 id="lp-test">{en ? 'Verification: from unit tests to the evaluation set' : 'Doğrulama: birim testinden değerlendirme kümesine'}</h2><ul className="eng-list">{t.tests.map((r) => <li key={r}>{r}</li>)}</ul></section>
          <section aria-labelledby="lp-code">
            <h2 id="lp-code">{en ? 'Starter code' : 'Başlangıç kodu'}</h2>
            <CodeBlock {...ragPy(lang)} lang={lang} />
            <CodeBlock {...streamServerJs(lang)} lang={lang} />
          </section>
          <section aria-labelledby="lp-ms">
            <h2 id="lp-ms">{en ? 'Deliverables' : 'Teslimler'}</h2>
            <ol className="rb-milestones">
              {CAPSTONE.deliverables.map((d) => (
                <li key={d.afterUnit}>
                  <Link href={`/muhendislik/llm/unite/${d.afterUnit}`} className="rb-ms-week">{en ? `After unit ${d.afterUnit}` : `${d.afterUnit}. üniteden sonra`}</Link>
                  <div><b>{d[lang].title}</b><p>{d[lang].deliver}</p><small className="muted">{unitOf(d.afterUnit)?.[lang].title}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="lp-gr">
            <h2 id="lp-gr" className="panel-title">{en ? 'Grading' : 'Notlandırma'}</h2>
            <dl className="value-list">
              {(en ? [['Proposal and requirements', '10%'], ['RAG pipeline and schema output', '25%'], ['Evaluation and error analysis', '20%'], ['Security and privacy', '15%'], ['Demo, cost report, presentation', '30%']]
                : [['Öneri ve gereksinimler', '%10'], ['RAG hattı ve şemalı çıktı', '%25'], ['Değerlendirme ve hata analizi', '%20'], ['Güvenlik ve gizlilik', '%15'], ['Demo, maliyet raporu, sunum', '%30']]).map(([k, v]) => <div key={k}><dt>{k}</dt><dd><b>{v}</b></dd></div>)}
            </dl>
          </section>
          <section className="panel" aria-labelledby="lp-try">
            <h2 id="lp-try" className="panel-title">{en ? 'Practise first' : 'Önce dene'}</h2>
            <ul className="eng-sib">
              <li><Link href="/muhendislik/llm/unite/5">{en ? 'Mini RAG over the course notes' : 'Ders notları üzerinde mini RAG'}</Link></li>
              <li><Link href="/muhendislik/llm/unite/7">{en ? 'Evaluation bench' : 'Değerlendirme tezgâhı'}</Link></li>
              <li><Link href="/muhendislik/llm/unite/8">{en ? 'Privacy and safety filter' : 'Gizlilik ve güvenlik süzgeci'}</Link></li>
              <li><Link href="/muhendislik/llm/unite/10">{en ? 'Streaming chat front-end' : 'Akışlı sohbet arayüzü'}</Link></li>
            </ul>
            <p className="muted rb-small">{LLM_COURSE[lang].cert}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
