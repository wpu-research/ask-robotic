'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useGame } from '@/lib/gamification'
import { streak } from '@/lib/gamification-core'
import { useT } from '@/i18n/client'
import { isActive, MACADEMIA_PROGRAMS, MAIN_NAV, NAV } from './nav-items'

const Chevron = () => <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>

/**
 * Ana menü (macademia.online ile birebir): Anasayfa · Hakkımızda · Yöntemimiz · Eğitimler ▾ · Kurumsal Eğitimler · İletişim
 * + "Ücretsiz Seviye Tespit". Eğitimler mega menüsü: Çocuklar için, Büyükler için, Öğrenme ve Macademia'nın diğer programları.
 * Geniş ekranda üzerine gelince, dar ekranda dokununca açılır. `open`: dar ekranda menünün açık olup olmadığı (hamburger).
 */
export function MainNav({ pathname, open, actions }: { pathname: string; open: boolean; actions?: React.ReactNode }) {
  const t = useT()
  const [mega, setMega] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { setMega(false) }, [pathname])
  useEffect(() => {
    if (!mega) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMega(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMega(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [mega])
  const wide = () => typeof window !== 'undefined' && window.innerWidth > 960
  const groups = NAV.filter((g) => g.key !== 'shell.groups.learn')
  const programsActive = groups.some((g) => g.items.some((i) => isActive(i.href, pathname))) || isActive('/konular', pathname)
  return (
    <nav className={`main-nav${open ? ' open' : ''}`} id="main-nav" aria-label={t('shell.mainMenu')}>
      {MAIN_NAV.map((it) => {
        if (it.drop) {
          return (
            <div key={it.key} className="nav-drop" ref={ref} onMouseEnter={() => wide() && setMega(true)} onMouseLeave={() => wide() && setMega(false)}>
              <button type="button" aria-expanded={mega} aria-controls="mega" className={programsActive ? 'active' : undefined} onClick={() => setMega((m) => !m)}>
                {t(it.key)} <Chevron />
              </button>
              <div className="mega" id="mega" hidden={!mega}>
                <div>
                  <h4>{t('shell.groups.learn')}</h4>
                  <Link href="/konular" aria-current={isActive('/konular', pathname) ? 'page' : undefined}>{t('shell.nav.topics')}</Link>
                  <Link href="/panel" aria-current={pathname === '/panel' ? 'page' : undefined}>{t('shell.nav.dashboard')}</Link>
                  {groups.filter((g) => g.tone === 'learning').flatMap((g) => g.items).map((i) => (
                    <Link key={i.href} href={i.href} aria-current={isActive(i.href, pathname) ? 'page' : undefined}>{t(i.key)}</Link>
                  ))}
                </div>
                {groups.filter((g) => g.tone !== 'learning').map((g) => (
                  <div key={g.key}>
                    <h4>{t(g.key)}</h4>
                    {g.items.map((i) => <Link key={i.href} href={i.href} aria-current={isActive(i.href, pathname) ? 'page' : undefined}>{t(i.key)}</Link>)}
                  </div>
                ))}
                <div>
                  <h4>{t('shell.groups.macademia')}</h4>
                  {MACADEMIA_PROGRAMS.map((p) => <a key={p.href} href={p.href}>{t(p.key)}</a>)}
                </div>
              </div>
            </div>
          )
        }
        const active = !it.external && (it.href === '/' ? pathname === '/' : isActive(it.href, pathname))
        return it.external
          ? <a key={it.key} href={it.href}>{t(it.key)}</a>
          : <Link key={it.key} href={it.href} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>{t(it.key)}</Link>
      })}
      {actions}
      <Link className="btn btn-primary btn-small nav-cta" href="/basla">{t('shell.mnav.cta')}</Link>
    </nav>
  )
}

/** Seri göstergesi (⚡ gün sayısı); panele götürür. */
export function StreakPill() {
  const t = useT()
  const { state, today } = useGame()
  const n = today ? streak(state, today) : 0
  return (
    <Link href="/panel" className="streak-pill" aria-label={t('shell.streakAria', { n })} title={t('shell.streakTitle')}>
      <span aria-hidden="true">⚡</span><b>{n}</b>
    </Link>
  )
}
