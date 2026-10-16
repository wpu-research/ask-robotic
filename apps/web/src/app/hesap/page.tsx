import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { loadAccountSummary, type AccountSummary } from '@/lib/billing'
import { DELETE_CONFIRM_PHRASE } from '@/lib/account-data'
import { formatPrice, isPaidPlan, isPeriod } from '@/lib/pricing'
import { getLocale, getT } from '@/i18n/server'
import { formatDate } from '@/i18n/format'
import type { MessageKey, TFunction } from '@/i18n'
import { TrialButton } from '@/components/paywall/trial-button'
import { FamilyMembers } from '@/components/account/family-members'
import { DataRights } from '@/components/account/data-rights'
import { LegalLinks } from '@/components/pricing/legal-links'
import '../odeme.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('account.metaTitle'), robots: { index: false } }
}
export const dynamic = 'force-dynamic'

const BANNER: Record<string, { ok: boolean; key: MessageKey }> = {
  basarili: { ok: true, key: 'account.banner.paid' },
  hata: { ok: false, key: 'account.banner.failed' },
  bekliyor: { ok: false, key: 'account.banner.pending' },
}

const PAY_STATUS: Record<string, MessageKey> = { pending: 'account.payStatus.pending', succeeded: 'account.payStatus.succeeded', failed: 'account.payStatus.failed', refunded: 'account.payStatus.refunded' }

function planLine(s: AccountSummary, t: TFunction) {
  if (s.plan === 'free') return { name: t('account.plan.free'), pill: s.status === 'expired' ? { cls: 'warn', text: t('account.plan.expired') } : null }
  const name = t(s.plan === 'family' ? 'account.plan.family' : 'account.plan.premium')
  if (s.status === 'trialing') return { name, pill: { cls: 'trial', text: t('account.plan.trial') } }
  return { name, pill: { cls: 'ok', text: t(s.source === 'family_member' ? 'account.plan.familyMember' : 'account.plan.active') } }
}

export default async function Hesap({ searchParams }: { searchParams: Promise<{ odeme?: string; deneme?: string }> }) {
  const q = await searchParams
  const user = await getCurrentUser()
  const t = await getT()
  const locale = await getLocale()
  const date = (d: Date) => formatDate(locale, d)
  if (!user) {
    return (
      <div className="page ac">
        <div className="ac-card">
          <h1>{t('account.title')}</h1>
          <p className="muted">{t('account.guestBody')}</p>
          <div className="ac-row"><Link className="v2-btn accent" href="/giris">{t('account.login')}</Link><Link className="v2-btn ghost" href="/kayit">{t('account.register')}</Link></div>
        </div>
      </div>
    )
  }
  const s = await loadAccountSummary(getDb(), user.id)
  if (!s) return null
  const line = planLine(s, t)
  const b = q.odeme ? BANNER[q.odeme] : q.deneme === 'basladi' ? { ok: true, key: 'account.banner.trialStarted' as MessageKey } : null
  const banner = b ? { ok: b.ok, text: t(b.key) } : null

  return (
    <div className="page ac">
      <header className="page-title">
        <p className="eyebrow">{t('shell.user.account')}</p>
        <h1>{t('account.title')}</h1>
        <p className="muted">{t('account.lead')}</p>
      </header>
      {banner && <p role="status" className={`pr-msg${banner.ok ? ' ok' : ''}`}>{banner.text}</p>}

      <div className="ac-grid">
        <section className="ac-card" aria-labelledby="ac-profil">
          <h2 id="ac-profil">{t('account.profile.title')}</h2>
          <dl className="ac-dl">
            <dt>{t('account.profile.name')}</dt><dd>{s.user.name}</dd>
            {s.user.email && <><dt>{t('account.profile.email')}</dt><dd>{s.user.email}</dd></>}
            {s.user.username && <><dt>{t('account.profile.username')}</dt><dd>{s.user.username}</dd></>}
          </dl>
        </section>

        <section className="ac-card" aria-labelledby="ac-plan">
          <h2 id="ac-plan">{t('account.planCard.title')}</h2>
          <div className="ac-plan">
            <b>{line.name}</b>
            {line.pill && <span className={`ac-pill ${line.pill.cls}`}>{line.pill.text}</span>}
          </div>
          {s.periodEnd && <p>{t(s.status === 'trialing' ? 'account.planCard.trialEnd' : 'account.planCard.premiumEnd')}: <b>{date(s.periodEnd)}</b></p>}
          {s.source === 'family_member' && <p className="muted">{t('account.planCard.memberOf')}</p>}
          {s.renewalReminder && (
            <p className="pr-msg" role="status">
              {t(s.status === 'trialing' ? 'account.planCard.trialEnding' : 'account.planCard.premiumEnding')}
            </p>
          )}
          <p className="muted">{t('account.planCard.noAutoRenew')}</p>
          <div className="ac-row">
            {s.trialAvailable && <TrialButton next="/hesap?deneme=basladi" />}
            {s.plan === 'free'
              ? <Link className={`v2-btn${s.trialAvailable ? ' ghost' : ' accent'}`} href="/fiyatlar">{t('account.planCard.goPremium')}</Link>
              : s.source === 'own'
                ? <Link className="v2-btn accent" href={`/odeme?plan=${s.plan}&donem=yillik`}>{t('account.planCard.extend')}</Link>
                : null}
            {s.plan === 'premium' && <Link className="v2-btn ghost" href="/odeme?plan=family&donem=yillik">{t('account.planCard.toFamily')}</Link>}
            <Link className="ac-link" href="/fiyatlar">{t('account.planCard.seePlans')}</Link>
          </div>
        </section>

        {s.family && (
          <section className="ac-card" aria-labelledby="ac-aile">
            <h2 id="ac-aile">{t('account.family.title')}</h2>
            <FamilyMembers initial={s.family.members} limit={s.family.limit} />
          </section>
        )}

        <section className="ac-card" aria-labelledby="ac-odeme">
          <h2 id="ac-odeme">{t('account.payments.title')}</h2>
          {s.payments.length === 0 ? <p className="muted">{t('account.payments.none')}</p> : (
            <div className="ac-table-wrap">
              <table className="ac-table">
                <thead><tr><th>{t('account.payments.date')}</th><th>{t('account.payments.plan')}</th><th>{t('account.payments.amount')}</th><th>{t('account.payments.status')}</th></tr></thead>
                <tbody>
                  {s.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{date(p.createdAt)}</td>
                      <td>{isPaidPlan(p.planId) ? t(`pricing.plans.${p.planId}.title`) : p.planId} · {isPeriod(p.period) ? t(`pricing.period.${p.period}`) : p.period}{p.provider === 'mock' && t('account.payments.test')}</td>
                      <td>{formatPrice(p.amount, locale)}</td>
                      <td>{PAY_STATUS[p.status] ? t(PAY_STATUS[p.status]) : p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="ac-card" aria-labelledby="ac-veri">
          <h2 id="ac-veri">{t('account.data.title')}</h2>
          <p className="muted">{t('account.data.body')} <Link href="/yasal/kvkk-aydinlatma" hrefLang="tr">{t('account.data.kvkk')}</Link>.</p>
          <DataRights phrase={DELETE_CONFIRM_PHRASE} />
        </section>
      </div>
      <LegalLinks />
    </div>
  )
}
