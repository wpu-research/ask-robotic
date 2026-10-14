import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { QrLogin } from '@/components/auth/auth-forms'
import { AuthScreen } from '@/components/auth/auth-screen'
import { authEnabled } from '@/lib/flags'
import { getT } from '@/i18n/server'

// Adreste gizli kod var: başka siteye Referer ile gitmesin, dizine girmesin
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('auth.qr.metaTitle'), referrer: 'no-referrer', robots: { index: false, follow: false } }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export default async function Sayfa({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!authEnabled()) notFound()
  const sp = await searchParams
  const t = await getT()
  return (
    <AuthScreen title={t('auth.qr.title')} mood="think">
      <QrLogin u={one(sp.u)} k={one(sp.k)} />
    </AuthScreen>
  )
}
