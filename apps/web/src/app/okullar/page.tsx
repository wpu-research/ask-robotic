import type { Metadata } from 'next'
import Link from 'next/link'
import { BANDS, TOPICS, bandText, topicText } from '@/lib/learning-paths'
import { getLocale, getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('schools.metaTitle'), description: t('schools.metaDescription') }
}

// Okul tanıtım sayfası. Strateji: docs/strateji-okul-platformu.tr.md. Öğretmen paneli ve lisanslar: docs/altyapi-okul-uyelik.md.
// Metinler: i18n/{tr,en}/schools.ts.
const WHY = [
  { key: 'hardware', icon: '🧰' }, { key: 'ladder', icon: '🪜' }, { key: 'doing', icon: '✦' },
  { key: 'ready', icon: '📋' }, { key: 'measurable', icon: '📊' }, { key: 'privacy', icon: '🔒' },
] as const
const TEACHER = ['classes', 'qr', 'assign', 'stuck', 'present', 'league'] as const
const MEB = ['bt', 'ai', 'robotics', 'tech'] as const

// İletişim adresi ortamdan gelir (NEXT_PUBLIC_CONTACT_EMAIL); yoksa düğme pilot bölümüne iner.
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL
export default async function Okullar() {
  const t = await getT()
  const locale = await getLocale()
  const contactHref = CONTACT ? `mailto:${CONTACT}?subject=${encodeURIComponent(t('schools.mailSubject'))}` : '#pilot'
  return (
    <div className="page schools">
      <section className="sc-hero">
        <p className="v2-eyebrow">{t('schools.eyebrow')}</p>
        <h1>{t('schools.title')}</h1>
        <p className="sc-lead">{t('schools.lead')}</p>
        <div className="sc-cta">
          <a className="v2-btn accent" href={contactHref}>{t('schools.ctaPilot')}</a>
          <Link className="v2-btn ghost" href="/basla">{t('schools.ctaTry')}</Link>
        </div>
      </section>

      <section className="sc-why" aria-labelledby="neden">
        <h2 id="neden" className="sr-only">{t('schools.whyTitle')}</h2>
        {WHY.map((w) => <div key={w.key} className="sc-card"><span aria-hidden="true">{w.icon}</span><b>{t(`schools.why.${w.key}.title`)}</b><p>{t(`schools.why.${w.key}.text`)}</p></div>)}
      </section>

      <section aria-labelledby="bantlar">
        <h2 id="bantlar" className="tp-section">{t('schools.bandsTitle')}</h2>
        <div className="sc-bands">
          {BANDS.map((band) => { const b = bandText(band, locale); return (
            <div key={band.key} className="sc-band">
              <small>{b.grades} · {b.ages}</small>
              <b>{b.title}</b>
              <p>{b.blurb}</p>
              <ul>{TOPICS.filter((x) => x.bands.includes(band.key)).map((x) => <li key={x.key}>{topicText(x, locale).title}</li>)}</ul>
            </div>
          ) })}
        </div>
      </section>

      <section className="sc-two">
        <div className="sc-card wide">
          <h2>{t('schools.teacherTitle')}</h2>
          <ul className="sc-checks">{TEACHER.map((x) => <li key={x}>{t(`schools.teacher.${x}`)}</li>)}</ul>
          <p className="muted">{t('schools.teacherNote')}</p>
        </div>
        <div className="sc-card wide">
          <h2>{t('schools.flowTitle')}</h2>
          <ol className="sc-flow">
            <li><b>{t('schools.flow.m5')}</b><span>{t('schools.flow.curious')}</span></li>
            <li><b>{t('schools.flow.m25')}</b><span>{t('schools.flow.lesson')}</span></li>
            <li><b>{t('schools.flow.m10')}</b><span>{t('schools.flow.discuss')}</span></li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="meb">
        <h2 id="meb" className="tp-section">{t('schools.mebTitle')}</h2>
        <div className="sc-table" role="table" aria-label={t('schools.mebLabel')}>
          <div role="row" className="head"><span role="columnheader">{t('schools.mebCols.course')}</span><span role="columnheader">{t('schools.mebCols.grade')}</span><span role="columnheader">{t('schools.mebCols.match')}</span></div>
          {MEB.map((r) => <div role="row" key={r}><span role="cell">{t(`schools.meb.${r}.course`)}</span><span role="cell">{t(`schools.meb.${r}.grade`)}</span><span role="cell">{t(`schools.meb.${r}.match`)}</span></div>)}
        </div>
        <p className="muted sc-note">{t('schools.mebNote')}</p>
      </section>

      <section className="sc-hero sc-end" id="pilot">
        <h2>{t('schools.pilotTitle')}</h2>
        <p className="sc-lead">{t('schools.pilotLead')}</p>
        <a className="v2-btn accent" href={contactHref}>{t('schools.pilotCta')}</a>
      </section>
    </div>
  )
}
