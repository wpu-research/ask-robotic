import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RegisterForm } from '@/components/auth/auth-forms'
import { AuthScreen, safeNext } from '@/components/auth/auth-screen'
import { WelcomeOffer } from '@/components/pricing/welcome-offer'
import { authEnabled } from '@/lib/flags'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('auth.register.metaTitle') }
}

export default async function Sayfa({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!authEnabled()) notFound()
  const sp = await searchParams
  const t = await getT()
  const fromOnboarding = sp.from === 'basla'
  return (
    <AuthScreen title={t(fromOnboarding ? 'auth.register.titleFromOnboarding' : 'auth.register.title')} lead={t('auth.register.lead')}>
      <WelcomeOffer className="au-note" />
      <RegisterForm next={safeNext(sp.next)} fromOnboarding={fromOnboarding} />
    </AuthScreen>
  )
}
