import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { loadAccountSummary } from '@/lib/billing'
import { extendPeriod, formatPrice, isPaidPlan, periodFromSlug, priceOf } from '@/lib/pricing'
import { getLocale, getT } from '@/i18n/server'
import { formatDate } from '@/i18n/format'
import { activeProviderId } from '@/lib/payments'
import { CheckoutForm } from '@/components/pricing/checkout-form'
import { LegalLinks } from '@/components/pricing/legal-links'
import '../odeme.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('pricing.checkout.title'), robots: { index: false } }
}
export const dynamic = 'force-dynamic'

export default async function Odeme({ searchParams }: { searchParams: Promise<{ plan?: string; donem?: string }> }) {
  const q = await searchParams
  const planId = isPaidPlan(q.plan) ? q.plan : 'premium'
  const period = periodFromSlug(q.donem) ?? 'yearly'
  const user = await getCurrentUser().catch(() => null)
  const provider = activeProviderId()
  const t = await getT()
  const locale = await getLocale()

  if (!user) {
    return (
      <div className="page co">
        <div className="co-card">
          <h1>{t('pricing.checkout.loginTitle')}</h1>
          <p className="muted">{t('pricing.checkout.loginBody')}</p>
          <div className="co-btns"><Link className="v2-btn accent" href="/giris">{t('pricing.checkout.login')}</Link><Link className="v2-btn ghost" href="/kayit">{t('pricing.checkout.register')}</Link></div>
        </div>
      </div>
    )
  }

  const summary = await loadAccountSummary(getDb(), user.id)
  const now = new Date()
  // Aynı plan etkinse yeni dönem mevcut bitişe eklenir (ön ödemeli; gün yanmaz)
  const base = summary?.plan === planId && summary.source === 'own' ? summary.periodEnd : null
  const newEnd = extendPeriod(base, period, now)
  const total = priceOf(planId, period)
  const periodName = t(`pricing.period.${period}`)

  return (
    <div className="page co">
      <header className="page-title">
        <h1>{t('pricing.checkout.title')}</h1>
        <p className="muted">{t('pricing.checkout.lead')}</p>
      </header>
      <section className="co-card" aria-label={t('pricing.checkout.summary')}>
        <div className="co-row"><span>{t('pricing.checkout.plan')}</span><b>ASK Robotic {t(`pricing.plans.${planId}.title`)}</b></div>
        <div className="co-row"><span>{t('pricing.checkout.period')}</span><b>{periodName} ({t(period === 'yearly' ? 'pricing.period.months12' : 'pricing.period.months1')})</b></div>
        <div className="co-row"><span>{t('pricing.checkout.premiumEnd')}</span><b>{formatDate(locale, newEnd)}</b></div>
        <div className="co-row"><span>{t('pricing.checkout.account')}</span><span>{user.email ?? user.name}</span></div>
        <div className="co-row total"><span>{t('pricing.checkout.total')}</span><b>{formatPrice(total, locale)}</b></div>
        <p className="co-note">
          {t('pricing.checkout.otherPlan')} <Link href="/fiyatlar">{t('pricing.checkout.seePlans')}</Link>
          {' · '}<Link href={`/odeme?plan=${planId}&donem=${period === 'yearly' ? 'aylik' : 'yillik'}`}>{t('pricing.checkout.payWith', { period: t(period === 'yearly' ? 'pricing.period.monthly' : 'pricing.period.yearly') })}</Link>
        </p>
        {provider
          ? <CheckoutForm planId={planId} period={period} totalLabel={formatPrice(total, locale)} />
          : <p className="pr-msg">{t('pricing.checkout.closed')}</p>}
        {provider === 'mock' && <p className="co-note"><span className="co-mock-tag">TEST</span> {t('pricing.checkout.mockActive')}</p>}
      </section>
      <LegalLinks />
    </div>
  )
}
