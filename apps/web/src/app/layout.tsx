import type { ReactNode } from 'react'
import './globals.css'
import './platform.css'
import { AppShell } from '@/components/shell/app-shell'
import { authEnabled } from '@/lib/flags'
import { ConsentBanner } from '@/components/learn/consent-banner'

export const metadata = {
  title: { default: 'ASK Robotic', template: '%s · ASK Robotic' },
  description: "0'dan AI robotik mühendisliğine: Scratch'ten Arduino'ya, sensörlerden robotlara adım adım dersler.",
}

// Tema ve kenar çubuğu tercihi boyamadan önce uygulanır (yanıp sönmeyi önler)
const bootScript = `try{var d=document.documentElement,t=localStorage.getItem('ask:theme');if(t==='dark'||t==='light')d.dataset.theme=t;if(localStorage.getItem('ask:sidebar')==='1')d.dataset.sb='1'}catch(e){}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: bootScript }} /></head>
      <body>
        <AppShell authOn={authEnabled()}>{children}</AppShell>
        <ConsentBanner />
      </body>
    </html>
  )
}
