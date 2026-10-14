import Link from 'next/link'
import { Mascot } from '@/components/lesson-v2/mascot'
import { paywallCopy, type LockReason } from '@/lib/paywall'
import { getT } from '@/i18n/server'
import type { MessageKey } from '@/i18n'
import { TrialButton } from './trial-button'
import '@/app/odeme.css'

/** Kilitli ders ekranı (Brilliant tarzı): Robi, neden kilitli, Premium faydaları, deneme / planlar, "yarın tekrar gel". */
export async function Paywall({ reason, loggedIn, trialAvailable, lessonTitle }: {
  reason: LockReason
  loggedIn: boolean
  trialAvailable: boolean
  lessonTitle?: string
}) {
  // Yapı (eylem, bağlantı) paywallCopy'den; metinler sözlükten (Türkçesi paywallCopy ile aynı).
  const c = paywallCopy(reason, { loggedIn, trialAvailable })
  const t = await getT()
  const label = (a: 'trial' | 'register' | 'plans') => t(a === 'plans' ? 'paywall.seePlans' : 'paywall.tryFree')
  const title = t(reason === 'daily_limit' ? 'paywall.dailyTitle' : 'paywall.premiumTitle')
  const lead = t(reason === 'daily_limit' ? 'paywall.dailyLead' : loggedIn ? 'paywall.premiumLeadLoggedIn' : 'paywall.premiumLeadGuest')
  const secondary = t(c.secondary.href === '/' ? 'paywall.backHome' : 'paywall.seePlans')
  const benefits: MessageKey[] = ['paywall.benefit1', 'paywall.benefit2', 'paywall.benefit3', 'paywall.benefit4']
  return (
    <div className="pw">
      <section className="pw-card" aria-labelledby="pw-title">
        <div className="pw-robi"><Mascot mood={reason === 'daily_limit' ? 'happy' : 'think'} size={88} /></div>
        {lessonTitle && <span className="pw-lesson">{lessonTitle}</span>}
        <h1 id="pw-title">{title}</h1>
        <p>{lead}</p>
        <ul className="pr-checks pw-benefits">{benefits.map((b) => <li key={b}>{t(b)}</li>)}</ul>
        <div className="pw-actions">
          {c.primary.action === 'trial' && <TrialButton label={label('trial')} />}
          {c.primary.action === 'register' && <Link className="v2-btn accent" href="/kayit">{label('register')}</Link>}
          {c.primary.action === 'plans' && <Link className="v2-btn accent" href="/fiyatlar">{label('plans')}</Link>}
          <Link className="v2-btn ghost" href={c.secondary.href}>{secondary}</Link>
        </div>
        {c.comeBack && <p className="pw-tomorrow"><span aria-hidden="true">🌙</span> {t('paywall.comeBack')}</p>}
        {!loggedIn && <p className="pw-free">{t('paywall.haveAccount')} <Link href="/giris">{t('paywall.login')}</Link></p>}
        <p className="pw-free">{t('paywall.noCard')}</p>
      </section>
    </div>
  )
}
