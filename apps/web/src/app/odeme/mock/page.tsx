import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { loadPaymentByRef } from '@/lib/billing'
import { activeProviderId } from '@/lib/payments'
import { formatPrice, isPaidPlan, isPeriod } from '@/lib/pricing'
import { getLocale, getT } from '@/i18n/server'
import { MockPay } from '@/components/pricing/mock-pay'
import '../../odeme.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('pricing.mock.metaTitle'), robots: { index: false } }
}
export const dynamic = 'force-dynamic'

/** Sağlayıcının barındırılan ödeme sayfasını taklit eder. Yalnız PAYMENTS_PROVIDER=mock (geliştirmede varsayılan). */
export default async function MockOdeme({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  if (activeProviderId() !== 'mock') notFound()
  const ref = (await searchParams).ref ?? ''
  const user = await getCurrentUser()
  const p = ref && user ? await loadPaymentByRef(getDb(), 'mock', ref) : null
  if (!p || p.userId !== user?.id) notFound()
  const t = await getT()
  const locale = await getLocale()

  return (
    <div className="page co">
      <section className="co-card co-mock" aria-labelledby="mock-title">
        <span className="co-mock-tag">{t('pricing.mock.tag')}</span>
        <h1 id="mock-title">{t('pricing.mock.title')}</h1>
        <div className="co-row"><span>{t('pricing.checkout.plan')}</span><b>{isPaidPlan(p.planId) ? t(`pricing.plans.${p.planId}.title`) : p.planId}</b></div>
        <div className="co-row"><span>{t('pricing.checkout.period')}</span><b>{isPeriod(p.period) ? t(`pricing.period.${p.period}`) : p.period}</b></div>
        <div className="co-row total"><span>{t('pricing.mock.amount')}</span><b>{formatPrice(p.amount, locale)}</b></div>
        {p.status === 'pending'
          ? <MockPay refId={ref} />
          : <p className="pr-msg ok">{t('pricing.mock.settled', { status: p.status })}</p>}
      </section>
    </div>
  )
}
