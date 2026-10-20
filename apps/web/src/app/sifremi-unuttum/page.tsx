import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ForgotForm } from '@/components/auth/recovery-forms'
import { AuthScreen } from '@/components/auth/auth-screen'
import { authEnabled } from '@/lib/flags'
import { mailEnabled } from '@/lib/mail/config'
import { getT } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('auth.forgot.metaTitle'), robots: { index: false } }
}

export default async function Sayfa() {
  if (!authEnabled() || !mailEnabled()) notFound()
  const t = await getT()
  return (
    <AuthScreen title={t('auth.forgot.title')} lead={t('auth.forgot.lead')}>
      <ForgotForm />
    </AuthScreen>
  )
}
