import Link from 'next/link'
import { authEnabled } from '@/lib/flags'
import { ThemeToggle } from './theme-toggle'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="ASK Robotic ana sayfa">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 8V4M9 13h.01M15 13h.01M9.5 16.5h5" /><circle cx="12" cy="3.5" r="1" />
            </svg>
          </span>
          <span>ASK <b>Robotic</b></span>
        </Link>
        <nav className="nav" aria-label="Ana menü">
          <Link href="/moduller">Modüller</Link>
          <Link href="/atolye">Blok atölyesi</Link>
          <Link href="/laboratuvar">Devre laboratuvarı</Link>
          <Link href="/arena">Robot arenası</Link>
          {authEnabled() && <Link href="/giris">Giriş</Link>}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span>ASK Robotic · 0&apos;dan AI robotik mühendisliğine</span>
        <span className="muted">Önizleme sürümü: ilerlemen bu tarayıcıda saklanır.</span>
      </div>
    </footer>
  )
}
