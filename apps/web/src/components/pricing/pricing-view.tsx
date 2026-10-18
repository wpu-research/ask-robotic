'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TrialButton } from '@/components/paywall/trial-button'
import {
  FAMILY_SIZE, PAID_PLANS, PERIOD_SLUG, formatPrice, monthlyEquivalent, priceOf,
  yearlySavingsPercent, type BillingPeriod, type PaidPlanId,
} from '@/lib/pricing'
import { useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'

// Karşılaştırma tablosu: lib/pricing.ts FEATURE_TABLE ile aynı satırlar; hücre metinleri sözlükten.
/** true ✓, false —, sözlük anahtarı ya da düz metin ('1'). */
type Cell = boolean | MessageKey | `=${string}`
const ROWS: { label: MessageKey; free: Cell; premium: Cell; family: Cell }[] = [
  { label: 'pricing.features.firstWeek', free: true, premium: true, family: true },
  { label: 'pricing.features.newLesson', free: 'pricing.features.perDay', premium: 'pricing.features.unlimited', family: 'pricing.features.unlimited' },
  { label: 'pricing.features.simulators', free: true, premium: true, family: true },
  { label: 'pricing.features.tutor', free: false, premium: true, family: true },
  { label: 'pricing.features.practice', free: false, premium: true, family: true },
  { label: 'pricing.features.skipAhead', free: false, premium: true, family: true },
  { label: 'pricing.features.adFree', free: false, premium: true, family: true },
  { label: 'pricing.features.accounts', free: '=1', premium: '=1', family: 'pricing.features.upToPeople' },
]
const cellClass = (c: Cell) => (c === true ? 'yes' : c === false ? 'no' : '')

const BENEFITS: MessageKey[] = ['pricing.benefits.unlimited', 'pricing.benefits.tutor', 'pricing.benefits.practice', 'pricing.benefits.adFree']
const FAMILY_EXTRA: MessageKey[] = ['pricing.familyExtra.all', 'pricing.familyExtra.onePayment', 'pricing.familyExtra.manage']

/** Aylık/yıllık geçişli plan kartları. Yıllık varsayılan (Brilliant'taki gibi). */
/** welcomeMonths: kayıt kampanyası açıkken (misafir) 7 günlük deneme yerine kampanya gösterilir; kayıt zaten o kadar Premium verir. */
export function PricingView({ loggedIn, trialAvailable, currentPlan, welcomeMonths }: { loggedIn: boolean; trialAvailable: boolean; currentPlan: 'free' | 'premium' | 'family' | null; welcomeMonths?: number }) {
  const [period, setPeriod] = useState<BillingPeriod>('yearly')
  const t = useT()
  const locale = useLocale()
  const money = (k: number) => formatPrice(k, locale)
  const cell = (c: Cell) => (c === true ? '✓' : c === false ? '—' : c.startsWith('=') ? c.slice(1) : t(c as MessageKey, { n: FAMILY_SIZE }))
  const save = Math.min(...PAID_PLANS.map(yearlySavingsPercent))

  const buyHref = (plan: PaidPlanId) => {
    const target = `/odeme?plan=${plan}&donem=${PERIOD_SLUG[period]}`
    return loggedIn ? target : '/kayit'
  }

  return (
    <>
      <div className="pr-hero">
        <div className="pr-toggle" role="group" aria-label={t('pricing.view.periodGroup')}>
          <button type="button" aria-pressed={period === 'yearly'} onClick={() => setPeriod('yearly')}>
            {t('pricing.period.yearly')}{save > 0 && <span className="pr-badge">{t('pricing.view.savePercent', { n: save })}</span>}
          </button>
          <button type="button" aria-pressed={period === 'monthly'} onClick={() => setPeriod('monthly')}>{t('pricing.period.monthly')}</button>
        </div>
      </div>

      <div className="pr-cards">
        {PAID_PLANS.map((plan) => {
          const title = t(`pricing.plans.${plan}.title`)
          const featured = plan === 'premium'
          const mine = currentPlan === plan
          return (
            <section key={plan} className={`pr-card${featured ? ' featured' : ''}`} aria-labelledby={`plan-${plan}`}>
              <h2 id={`plan-${plan}`}>
                {title}
                {featured && <span className="pr-badge">{welcomeMonths ? t('pricing.view.welcomeBadge', { n: welcomeMonths }) : t('pricing.view.trialBadge')}</span>}
              </h2>
              <p>{t(`pricing.plans.${plan}.tagline`, { n: FAMILY_SIZE })}</p>
              <div className="pr-price">
                <b>{money(monthlyEquivalent(plan, period))}</b><span>{t('pricing.view.perMonth')}</span>
              </div>
              <p className="pr-sub">
                {period === 'yearly' ? t('pricing.view.yearlyOnce', { price: money(priceOf(plan, 'yearly')) }) : t('pricing.view.monthlyNote')}
              </p>
              <div className="pr-actions">
                {mine ? (
                  <Link className="v2-btn ghost" href="/hesap">{t('pricing.view.yourPlan')}</Link>
                ) : featured && welcomeMonths ? (
                  <Link className="v2-btn accent" href="/kayit">{t('pricing.view.welcomeCta', { n: welcomeMonths })}</Link>
                ) : featured && trialAvailable ? (
                  <TrialButton next="/hesap?deneme=basladi" />
                ) : null}
                {!mine && <Link className={`v2-btn${featured && (trialAvailable || welcomeMonths) ? ' ghost' : ' accent'}`} href={buyHref(plan)}>{t('pricing.view.buy', { plan: title })}</Link>}
                {mine && <Link className="v2-btn accent" href={buyHref(plan)}>{t('pricing.view.add', { months: t(period === 'yearly' ? 'pricing.period.months12' : 'pricing.period.months1') })}</Link>}
              </div>
              <ul className="pr-checks">{(plan === 'family' ? FAMILY_EXTRA : BENEFITS).map((b) => <li key={b}>{t(b)}</li>)}</ul>
            </section>
          )
        })}
      </div>

      <div className="pr-free">
        <div>
          <b>{t('pricing.view.freeTitle')}</b>
          <p>{t('pricing.view.freeBody')}</p>
        </div>
        <Link className="v2-btn ghost" href="/konular">{t('pricing.view.freeCta')}</Link>
      </div>

      <section aria-labelledby="karsilastir">
        <h2 id="karsilastir" className="pr-section">{t('pricing.view.compare')}</h2>
        <div className="ac-table-wrap">
          <table className="pr-table">
            <thead>
              <tr><th scope="col"><span className="sr-only">{t('pricing.view.feature')}</span></th><th scope="col">{t('pricing.view.colFree')}</th><th scope="col" className="col-premium">{t('pricing.view.colPremium')}</th><th scope="col">{t('pricing.view.colFamily')}</th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{t(r.label)}</th>
                  <td className={cellClass(r.free)}>{cell(r.free)}</td>
                  <td className={`col-premium ${cellClass(r.premium)}`}>{cell(r.premium)}</td>
                  <td className={cellClass(r.family)}>{cell(r.family)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
