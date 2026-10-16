import Link from 'next/link'
import type { ReactNode } from 'react'
import { Mascot, type Mood } from '@/components/lesson-v2/mascot'
import { getT } from '@/i18n/server'
import './auth.css'

/** Giriş/kayıt ekranı: onboarding gibi tam ekran, ortada tek kart, Mac konuşur. */
export async function AuthScreen({ title, lead, mood = 'happy', children }: { title: string; lead?: ReactNode; mood?: Mood; children: ReactNode }) {
  const t = await getT()
  return (
    <section className="ob" aria-label={title}>
      <header className="ob-top">
        <Link href="/" className="v2-icon-btn" aria-label={t('auth.close')}>✕</Link>
      </header>
      <div className="ob-body">
        <div className="au-card">
          <div className="au-head">
            <Mascot size={88} mood={mood} />
            <h1>{title}</h1>
            {lead && <p>{lead}</p>}
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}

/** Yalnız site içi göreli adres (açık yönlendirme olmasın). */
export function safeNext(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v
  return s && s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\') ? s : '/'
}
