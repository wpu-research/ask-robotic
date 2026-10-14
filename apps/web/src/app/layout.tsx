import type { ReactNode } from 'react'
import './globals.css'
import './platform.css'
import './learn-v2.css'
import { AppShell } from '@/components/shell/app-shell'
import { authEnabled } from '@/lib/flags'
import { ConsentBanner } from '@/components/learn/consent-banner'
import { I18nProvider } from '@/i18n/client'
import { getLocale, getT } from '@/i18n/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: { default: 'ASK Robotic', template: '%s · ASK Robotic' },
    description: t('common.metaDescription'),
  }
}

// Tema ve kenar çubuğu tercihi boyamadan önce uygulanır (yanıp sönmeyi önler)
const bootScript = `try{var d=document.documentElement,t=localStorage.getItem('ask:theme');if(t==='dark'||t==='light')d.dataset.theme=t;if(localStorage.getItem('ask:sidebar')==='1')d.dataset.sb='1'}catch(e){}`

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: bootScript }} /></head>
      <body>
        <I18nProvider locale={locale}>
          <AppShell authOn={authEnabled()}>{children}</AppShell>
          <ConsentBanner />
        </I18nProvider>
      </body>
    </html>
  )
}
