'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeToggle } from '../theme-toggle'
import { CommandPalette } from './command-palette'
import { Icon } from './icons'
import { isActive, NAV } from './nav-items'
import { TopNav, StreakPill } from './top-nav'
import { UserMenu } from '../auth/user-menu'
import { SessionSync } from '../auth/session-sync'
import { LocaleSwitcher } from './locale-switcher'
import { useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'

/** Alt sekme çubuğunda kısa adlar. */
const TAB_KEY: Record<string, MessageKey> = { '/laboratuvar': 'shell.tab.lab', '/arena': 'shell.tab.arena', '/atolye': 'shell.tab.blocks' }

function Brand({ compact = false }: { compact?: boolean }) {
  const t = useT()
  return (
    <Link href="/" className="brand" aria-label={t('shell.brandAria')}>
      <span className="brand-mark" aria-hidden="true"><Icon name="arena" size={22} /></span>
      {!compact && <span className="brand-text">ASK <b>Robotic</b></span>}
    </Link>
  )
}

export function AppShell({ children, authOn }: { children: ReactNode; authOn: boolean }) {
  const pathname = usePathname()
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [palette, setPalette] = useState(false)
  const [mac, setMac] = useState(false)

  useEffect(() => {
    setCollapsed(document.documentElement.dataset.sb === '1')
    setMac(/Mac|iPhone|iPad/.test(navigator.platform))
  }, [])
  useEffect(() => { setDrawer(false) }, [pathname])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    if (next) document.documentElement.dataset.sb = '1'
    else delete document.documentElement.dataset.sb
    try { localStorage.setItem('ask:sidebar', next ? '1' : '0') } catch { /* yoksay */ }
  }

  const openPalette = useCallback(() => { setDrawer(false); setPalette(true) }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); return }
      const t = e.target as HTMLElement | null
      const typing = !!t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable)
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setPalette(true) }
      if (e.key === 'Escape') setDrawer(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const navList = (
    <nav aria-label={t('shell.mainMenu')} className="sb-nav">
      {NAV.map((g) => (
        <div key={g.title} className="sb-group">
          <div className="sb-group-title">{t(g.key)}</div>
          <ul>
            {g.items.map((it) => {
              const active = !it.soon && isActive(it.href, pathname)
              const label = t(it.key)
              return (
                <li key={it.label}>
                  {it.soon ? (
                    <span className="sb-link" role="link" aria-disabled="true" title={t('shell.soonSuffix', { label })}>
                      <Icon name={it.icon} /><span className="sb-label">{label}</span><span className="badge-soon">{t('common.soon')}</span>
                    </span>
                  ) : (
                    <Link href={it.href} className="sb-link" aria-current={active ? 'page' : undefined} aria-label={label} title={label}>
                      <Icon name={it.icon} /><span className="sb-label">{label}</span>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="shell shell-top">
      <a className="skip-link" href="#icerik">{t('shell.skipToContent')}</a>
      <div className="scrim" data-open={drawer} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside className="sidebar" id="kenar-cubugu" data-open={drawer} aria-label={t('shell.sidebar')}>
        <div className="sb-top">
          <Brand compact={collapsed} />
          <button type="button" className="icon-btn sb-close" onClick={() => setDrawer(false)} aria-label={t('shell.closeMenu')}><Icon name="close" /></button>
        </div>
        {navList}
        <div className="sb-bottom">
          <button type="button" className="sb-link sb-collapse" onClick={toggleCollapsed} aria-pressed={collapsed} aria-label={collapsed ? t('shell.expandSidebar') : t('shell.collapseSidebar')} title={collapsed ? t('shell.expand') : t('shell.collapse')}>
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} /><span className="sb-label">{t('shell.collapse')}</span>
          </button>
        </div>
      </aside>

      <div className="shell-body">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setDrawer(true)} aria-label={t('shell.openMenu')} aria-expanded={drawer} aria-controls="kenar-cubugu"><Icon name="menu" /></button>
          <div className="topbar-brand"><Brand /></div>
          <TopNav pathname={pathname} />
          <div className="topbar-actions">
            <button type="button" className="search-trigger compact" onClick={openPalette} aria-label={t('shell.searchAria')} aria-haspopup="dialog" title={t('shell.searchTitle', { kbd: mac ? '⌘K' : 'Ctrl K' })}>
              <Icon name="search" size={18} />
              <span className="search-text">{t('shell.search')}</span>
              <kbd className="search-kbd">{mac ? '⌘K' : 'Ctrl K'}</kbd>
            </button>
            <StreakPill />
            <LocaleSwitcher />
            <ThemeToggle />
            {authOn ? <UserMenu /> : (
              <div className="user-chip" title={t('shell.guestTitle')}>
                <span className="avatar" aria-hidden="true">M</span><span className="user-name">{t('shell.guest')}</span>
              </div>
            )}
          </div>
        </header>
        <main id="icerik" tabIndex={-1}>{children}</main>
        <footer className="shell-footer">
          <span>{t('shell.footerTagline')}</span>
          <span><Link href="/fiyatlar">{t('shell.footerPricing')}</Link> · <Link href="/okullar">{t('shell.footerSchools')}</Link> · <Link href="/yasal/kvkk-aydinlatma">{t('shell.footerKvkk')}</Link></span>
        </footer>
      </div>

      <nav className="tabbar" aria-label={t('shell.quickMenu')}>
        {NAV.flatMap((g) => g.items).filter((i) => i.tab).map((it) => (
          <Link key={it.href} href={it.href} className="tab" aria-current={isActive(it.href, pathname) ? 'page' : undefined}>
            <Icon name={it.icon} size={22} /><span>{t(TAB_KEY[it.href] ?? it.key)}</span>
          </Link>
        ))}
      </nav>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      {authOn && <SessionSync />}
    </div>
  )
}
