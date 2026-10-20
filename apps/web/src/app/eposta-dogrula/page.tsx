import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VerifyEmail } from '@/components/auth/recovery-forms'
import { AuthScreen } from '@/components/auth/auth-screen'
import { authEnabled } from '@/lib/flags'
import { mailEnabled } from '@/lib/mail/config'
import { getT } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('auth.verify.metaTitle'), robots: { index: false }, referrer: 'no-referrer' }
}

export default async function Sayfa({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!authEnabled() || !mailEnabled()) notFound()
  const sp = await searchParams
  const token = typeof sp.token === 'string' ? sp.token : ''
  const t = await getT()
  return (
    <AuthScreen title={t('auth.verify.title')}>
      <VerifyEmail token={token} />
    </AuthScreen>
  )
}
