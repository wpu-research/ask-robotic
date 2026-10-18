import type { Metadata } from 'next'
import Link from 'next/link'
import { LLM_SIM_META, type LlmSimId } from '@/components/llm/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { LLM_COURSE, UNITS } from '@/lib/llm/course'
import { CAPSTONE } from '@/lib/llm/project'

export const metadata: Metadata = {
  title: 'Büyük Dil Modeli Uygulamaları',
  description: 'Büyükler için LLM dersi: tokenlar, gömmeler, prompt kalıpları, JSON şemalı çıktı, RAG, ajanlar, değerlendirme, güvenlik ve KVKK, maliyet, akışlı sohbet arayüzü. 10 ünite, tarayıcıda 10 simülasyon.',
}

export default async function LlmDersi() {
  const lang = await getLocale()
  const en = lang === 'en'
  const c = LLM_COURSE[lang]
  const sims = Object.keys(LLM_SIM_META) as LlmSimId[]
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
          <div><dt>{en ? 'Hours' : 'Saat'}</dt><dd>{LLM_COURSE.hours}</dd></div>
        </dl>
        <p className="rb-actions">
          <Link className="btn btn-primary" href="/muhendislik/llm/unite/1" data-testid="llm-start">{en ? 'Start with unit 1' : '1. üniteyle başla'}</Link>
          <Link className="btn btn-ghost" href="/muhendislik/llm/simulasyon">{en ? 'All simulations' : 'Tüm simülasyonlar'}</Link>
        </p>
        <p className="lm-teach">{c.teaching}</p>
      </header>

      <section aria-labelledby="lm-out">
        <h2 id="lm-out">{en ? 'What you will be able to do' : 'Kazanımlar'}</h2>
        <ul className="eng-list">{c.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
      </section>

      <section aria-labelledby="lm-plan">
        <h2 id="lm-plan">{en ? 'Units' : 'Üniteler'}</h2>
        <div className="rb-scroll">
          <table className="rb-table dr-units">
            <thead><tr><th>{en ? 'Unit' : 'Ünite'}</th><th>{en ? 'Topic' : 'Konu'}</th><th>{en ? 'Hours' : 'Saat'}</th><th>{en ? 'Simulation' : 'Simülasyon'}</th></tr></thead>
            <tbody>
              {UNITS.map((u) => (
                <tr key={u.n}>
                  <td className="n">{u.n}</td>
                  <td><Link href={`/muhendislik/llm/unite/${u.n}`} data-testid={`llm-unit-${u.n}`}>{u[lang].title}</Link><br /><span className="rb-tcell">{u[lang].summary}</span></td>
                  <td className="rb-tcell">{LLM_COURSE.hours / UNITS.length}</td>
                  <td className="rb-tcell">{u.sims.map((s) => LLM_SIM_META[s][lang].title).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rb-two">
        <section className="panel" aria-labelledby="lm-cap">
          <h2 id="lm-cap" className="panel-title">{en ? 'Capstone project' : 'Bitirme projesi'}</h2>
          <p>{CAPSTONE[lang].summary}</p>
          <Link className="btn btn-primary" href="/muhendislik/llm/proje" data-testid="llm-capstone">{en ? 'Project and deliverables' : 'Proje ve teslimler'} <Icon name="arrowRight" size={16} /></Link>
        </section>
        <section className="panel" aria-labelledby="lm-tools">
          <h2 id="lm-tools" className="panel-title">{en ? 'Tools' : 'Araçlar'}</h2>
          <ul className="eng-list">
            <li>{en ? 'This platform: ten teaching simulations in the browser; the site never calls an external LLM service' : 'Bu platform: tarayıcıda on öğretim simülasyonu; site hiçbir dış LLM servisine istek göndermez'}</li>
            <li>{en ? 'Your computer: Python 3.10+ with the anthropic package, Node.js 20+ with @anthropic-ai/sdk' : 'Kendi bilgisayarın: anthropic paketiyle Python 3.10+, @anthropic-ai/sdk ile Node.js 20+'}</li>
            <li>{en ? 'An API key in the ANTHROPIC_API_KEY environment variable; never in code or in the browser' : 'ANTHROPIC_API_KEY ortam değişkeninde bir API anahtarı; asla kodda ya da tarayıcıda değil'}</li>
          </ul>
          <p className="muted rb-small">{c.cert}</p>
        </section>
      </div>

      <section className="panel" aria-labelledby="lm-rel">
        <h2 id="lm-rel" className="panel-title">{en ? 'Related' : 'İlgili'}</h2>
        <ul className="eng-list">
          <li><Link href="/ai-atolyesi">{en ? 'AI workshop: token, prompt, RAG and agent tools' : 'AI atölyesi: token, prompt, RAG ve ajan araçları'}</Link></li>
          <li><Link href="/makine-ogrenmesi/kelime-vektorleri">{en ? 'Machine learning: word vectors' : 'Makine öğrenmesi: kelime vektörleri'}</Link></li>
          <li><Link href="/makine-ogrenmesi/dikkat-mekanizmasi">{en ? 'Machine learning: the attention mechanism' : 'Makine öğrenmesi: dikkat mekanizması'}</Link></li>
          <li><Link href="/makine-ogrenmesi/mini-dil-modeli">{en ? 'Machine learning: mini language model' : 'Makine öğrenmesi: mini dil modeli'}</Link></li>
          <li><Link href="/makine-ogrenmesi/rag">{en ? 'Machine learning: RAG' : 'Makine öğrenmesi: RAG'}</Link></li>
          <li><Link href="/programlar">{en ? 'Programmes: AI application development track' : 'Programlar: Yapay Zekâ Uygulama Geliştirme yolu'}</Link></li>
        </ul>
      </section>
    </div>
  )
}
