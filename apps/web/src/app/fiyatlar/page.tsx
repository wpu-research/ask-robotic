import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { loadAccountSummary } from '@/lib/billing'
import { FAMILY_SIZE, TRIAL_DAYS, TRIAL_REMINDER_DAY, trialTimeline } from '@/lib/pricing'
import { getLocale, getT } from '@/i18n/server'
import { formatDate } from '@/i18n/format'
import { PricingView } from '@/components/pricing/pricing-view'
import { LegalLinks } from '@/components/pricing/legal-links'
import '../odeme.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('pricing.page.title'), description: t('pricing.page.description') }
}
export const dynamic = 'force-dynamic'

const FAQ = ['card', 'renew', 'early', 'family', 'refund', 'school'] as const

export default async function Fiyatlar({ searchParams }: { searchParams: Promise<{ odeme?: string }> }) {
  const q = await searchParams
  const user = await getCurrentUser().catch(() => null)
  const summary = user ? await loadAccountSummary(getDb(), user.id).catch(() => null) : null
  const tl = trialTimeline(new Date())
  const t = await getT()
  const locale = await getLocale()
  const date = (d: Date) => formatDate(locale, d)

  return (
    <div className="page pr">
      <header className="pr-hero">
        <p className="v2-eyebrow">{t('pricing.page.eyebrow')}</p>
        <h1>{t('pricing.page.heading')}</h1>
        <p>{t('pricing.page.lead', { days: TRIAL_DAYS })}</p>
        {q.odeme === 'iptal' && <p className="pr-msg" role="status">{t('pricing.page.canceled')}</p>}
      </header>

      <PricingView
        loggedIn={!!user}
        trialAvailable={!user || !!summary?.trialAvailable}
        currentPlan={summary ? summary.plan : null}
      />

      <section aria-labelledby="deneme">
        <h2 id="deneme" className="pr-section">{t('pricing.page.trialHow')}</h2>
        <ol className="pr-timeline">
          <li><b>{t('pricing.page.today')}</b><span>{t('pricing.page.todayBody')}</span></li>
          <li><b>{t('pricing.page.dayN', { n: TRIAL_REMINDER_DAY, date: date(tl.reminder) })}</b><span>{t('pricing.page.reminderBody')}</span></li>
          <li><b>{t('pricing.page.dayN', { n: TRIAL_DAYS, date: date(tl.end) })}</b><span>{t('pricing.page.endBody')}</span></li>
        </ol>
      </section>

      <section aria-labelledby="sss">
        <h2 id="sss" className="pr-section">{t('pricing.page.faq')}</h2>
        <div className="pr-faq">
          {FAQ.map((f) => (
            <details key={f}>
              <summary>{t(`pricing.faq.${f}Q`)}</summary>
              <p>{t(`pricing.faq.${f}A`, { days: TRIAL_DAYS, n: FAMILY_SIZE })}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pr-school">
        <div>
          <b>{t('pricing.page.schoolTitle')}</b>
          <p>{t('pricing.page.schoolBody')}</p>
        </div>
        <Link className="v2-btn ghost" href="/okullar">{t('pricing.page.schoolCta')}</Link>
      </section>

      <p className="pr-note">{t('pricing.page.vatNote')}</p>
      <LegalLinks />
    </div>
  )
}
