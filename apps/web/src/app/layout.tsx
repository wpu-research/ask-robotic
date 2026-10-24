import type { ReactNode } from 'react'
import './globals.css'
import './platform.css'
import './learn-v2.css'
import './macademia.css'
import './playful.css'
import './brand-dilkur.css'
import { AppShell } from '@/components/shell/app-shell'
import { authEnabled } from '@/lib/flags'
import { tutorEnabled } from '@/lib/tutor/claude'
import { ttsEnabled } from '@/lib/tts/providers'
import { ConsentBanner } from '@/components/learn/consent-banner'
import { I18nProvider } from '@/i18n/client'
import { getLocale, getT } from '@/i18n/server'
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

import { getBrand } from '@/lib/brand-server'
import { BrandProvider } from '@/components/shell/brand-context'

// Macademia ile aynı yazı tipi; Türkçe karakterler için latin-ext.
const poppins = Poppins({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700', '800'], variable: '--font-sans', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const brand = await getBrand()
  const name = brand[await getLocale()].title
  return {
    metadataBase: new URL(brand.siteUrl),
    title: { default: name, template: `%s · ${name}` },
    description: brand.id === 'macademiax' ? t('common.metaDescription') : brand[await getLocale()].footDesc,
    openGraph: { type: 'website', siteName: name, url: brand.siteUrl, locale: 'tr_TR' },
    // Simgeler markaya göre (dosya tabanlı app/icon.* her markada aynısını basacağı için public/ altında)
    icons: brand.logo
      ? { icon: [{ url: brand.logo.icon, type: 'image/png' }], apple: brand.logo.icon }
      : { icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-icon.png' },
  }
}

// Tema ve kenar çubuğu tercihi boyamadan önce uygulanır (yanıp sönmeyi önler)
const bootScript = `try{var d=document.documentElement,t=localStorage.getItem('ask:theme');if(t==='dark'||t==='light')d.dataset.theme=t;if(localStorage.getItem('ask:sidebar')==='1')d.dataset.sb='1'}catch(e){}`

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const brand = await getBrand()
  return (
    <html lang={locale} className={poppins.variable} data-brand={brand.id} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: bootScript }} /></head>
      <body>
        <I18nProvider locale={locale}>
          <BrandProvider id={brand.id}>
          <AppShell authOn={authEnabled()} robiOn={tutorEnabled()} ttsOn={ttsEnabled()}>{children}</AppShell>
          <ConsentBanner />
          </BrandProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
