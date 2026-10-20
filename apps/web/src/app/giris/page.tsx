import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LoginForm } from '@/components/auth/auth-forms'
import { AuthScreen, safeNext } from '@/components/auth/auth-screen'
import { authEnabled } from '@/lib/flags'
import { mailEnabled } from '@/lib/mail/config'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('auth.login.metaTitle') }
}

export default async function Sayfa({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!authEnabled()) notFound()
  const sp = await searchParams
  const t = await getT()
  return (
    <AuthScreen title={t('auth.login.title')} lead={t('auth.login.lead')}>
      <LoginForm next={safeNext(sp.next)} resetEnabled={mailEnabled()} />
    </AuthScreen>
  )
}
