import type { ReactNode } from 'react'
import './globals.css'
import { SiteFooter, SiteHeader } from '@/components/site-header'

export const metadata = {
  title: { default: 'ASK Robotic', template: '%s · ASK Robotic' },
  description: "0'dan AI robotik mühendisliğine: Scratch'ten Arduino'ya, sensörlerden robotlara adım adım dersler.",
}

// Tema tercihi boyamadan önce uygulanır (yanıp sönmeyi önler)
const themeScript = `try{var t=localStorage.getItem('ask:theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
