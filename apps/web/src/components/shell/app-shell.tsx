'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeToggle } from '../theme-toggle'
import { CommandPalette } from './command-palette'
import { Icon } from './icons'
import { MACADEMIA_URL, NAV } from './nav-items'
import { MainNav, StreakPill } from './top-nav'
import { Brand, NutLogo, Wordmark } from './brand'
import { Mascot } from '../lesson-v2/mascot'
import { UserMenu } from '../auth/user-menu'
import { SessionSync } from '../auth/session-sync'
import { LocaleSwitcher } from './locale-switcher'
import { useT } from '@/i18n/client'
import { RobiDock } from '../robi/robi-dock'
import { VoiceProvider } from '../lesson-v2/voice'

/**
 * Site kabuğu, macademia.online düzeniyle: espresso üst bant (kısa bağlantılar, dil, tema, hesap), beyaz yapışkan başlık
 * (fındık logosu + MacademiaX, ana menü, Eğitimler mega menüsü, arama, "Ücretsiz Seviye Tespit"), koyu dört sütunlu alt bilgi.
 */
export function AppShell({ children, authOn, robiOn = false, ttsOn = false }: { children: ReactNode; authOn: boolean; robiOn?: boolean; ttsOn?: boolean }) {
  const pathname = usePathname()
  const t = useT()
  const [menu, setMenu] = useState(false)
  const [palette, setPalette] = useState(false)
  const [mac, setMac] = useState(false)

  useEffect(() => { setMac(/Mac|iPhone|iPad/.test(navigator.platform)) }, [])
  useEffect(() => { setMenu(false) }, [pathname])

  const openPalette = useCallback(() => { setMenu(false); setPalette(true) }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); return }
      const el = e.target as HTMLElement | null
      const typing = !!el && (/INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.isContentEditable)
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setPalette(true) }
      if (e.key === 'Escape') setMenu(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const kids = NAV.find((g) => g.tone === 'kids')?.items ?? []
  const adults = NAV.find((g) => g.tone === 'adults')?.items ?? []

  return (
    <VoiceProvider natural={ttsOn}>
    <div className="mx-shell">
      <a className="skip-link" href="#icerik">{t('shell.skipToContent')}</a>
      <div className="topbar">
        <div className="wrap">
          <span className="topbar-text">{t('shell.topbarText')}</span>
          <nav className="topbar-links" aria-label={t('shell.shortLinks')}>
            <a href={`${MACADEMIA_URL}#iletisim`} className="tb-hide-sm">{t('shell.contactUs')}</a>
            <StreakPill />
            <LocaleSwitcher />
            <ThemeToggle />
            {authOn ? <UserMenu variant="topbar" /> : <span className="tb-guest" title={t('shell.guestTitle')}>{t('shell.guest')}</span>}
          </nav>
        </div>
      </div>

      <header className="site-header">
        <div className="wrap">
          <Brand label={t('shell.brandAria')} />
          <button type="button" className="menu-toggle" aria-label={menu ? t('shell.closeMenu') : t('shell.openMenu')} aria-expanded={menu} aria-controls="main-nav" onClick={() => setMenu((m) => !m)}>
            <span /><span /><span />
          </button>
          <MainNav
            pathname={pathname} open={menu}
            actions={(
              <span className="nav-tools">
                <button type="button" className="nav-icon" onClick={openPalette} aria-label={t('shell.searchAria')} aria-haspopup="dialog" title={t('shell.searchTitle', { kbd: mac ? '⌘K' : 'Ctrl K' })}>
                  <Icon name="search" size={18} />
                </button>
              </span>
            )}
          />
        </div>
      </header>

      <main id="icerik" tabIndex={-1}>{children}</main>

      <footer className="site-footer">
        <span className="foot-mac" aria-hidden="true"><Mascot size={84} mood="happy" /></span>
        <div className="wrap">
          <div className="cols">
            <div>
              <h4 className="foot-brand"><NutLogo size={34} /><Wordmark /></h4>
              <p>{t('shell.foot.desc')}</p>
            </div>
            <div>
              <h4>{t('shell.groups.kids')}</h4>
              {kids.map((i) => <Link key={i.href} href={i.href}>{t(i.key)}</Link>)}
            </div>
            <div>
              <h4>{t('shell.groups.adults')}</h4>
              {adults.map((i) => <Link key={i.href} href={i.href}>{t(i.key)}</Link>)}
              <Link href="/konular">{t('shell.nav.topics')}</Link>
            </div>
            <div>
              <h4>{t('shell.foot.support')}</h4>
              <a href={`${MACADEMIA_URL}#hakkimizda`}>{t('shell.mnav.about')}</a>
              <a href={`${MACADEMIA_URL}#yontem`}>{t('shell.mnav.method')}</a>
              <Link href="/okullar">{t('shell.foot.corporate')}</Link>
              <a href={`${MACADEMIA_URL}#iletisim`}>{t('shell.mnav.contact')}</a>
              <Link href="/basla">{t('shell.foot.level')}</Link>
              <Link href="/fiyatlar">{t('shell.footerPricing')}</Link>
              <Link href="/yasal/kvkk-aydinlatma">{t('shell.footerKvkk')}</Link>
            </div>
          </div>
          <div className="bottom">
            <span>{t('shell.foot.copy')}</span>
            <a href={MACADEMIA_URL}>macademia.com.tr</a>
          </div>
        </div>
      </footer>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      {authOn && <SessionSync />}
      <RobiDock enabled={robiOn} />
    </div>
    </VoiceProvider>
  )
}
