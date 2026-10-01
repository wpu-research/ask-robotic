'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ThemeToggle } from '../theme-toggle'
import { CommandPalette } from './command-palette'
import { Icon } from './icons'
import { isActive, NAV } from './nav-items'

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="ASK Robotic, panele git">
      <span className="brand-mark" aria-hidden="true"><Icon name="arena" size={22} /></span>
      {!compact && <span className="brand-text">ASK <b>Robotic</b></span>}
    </Link>
  )
}

export function AppShell({ children, authOn }: { children: ReactNode; authOn: boolean }) {
  const pathname = usePathname()
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
    <nav aria-label="Ana menü" className="sb-nav">
      {NAV.map((g) => (
        <div key={g.title} className="sb-group">
          <div className="sb-group-title">{g.title}</div>
          <ul>
            {g.items.map((it) => {
              const active = !it.soon && isActive(it.href, pathname)
              return (
                <li key={it.label}>
                  {it.soon ? (
                    <span className="sb-link" role="link" aria-disabled="true" title={`${it.label} (yakında)`}>
                      <Icon name={it.icon} /><span className="sb-label">{it.label}</span><span className="badge-soon">Yakında</span>
                    </span>
                  ) : (
                    <Link href={it.href} className="sb-link" aria-current={active ? 'page' : undefined} aria-label={it.label} title={it.label}>
                      <Icon name={it.icon} /><span className="sb-label">{it.label}</span>
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
    <div className="shell">
      <a className="skip-link" href="#icerik">İçeriğe geç</a>
      <div className="scrim" data-open={drawer} onClick={() => setDrawer(false)} aria-hidden="true" />
      <aside className="sidebar" id="kenar-cubugu" data-open={drawer} aria-label="Kenar çubuğu">
        <div className="sb-top">
          <Brand compact={collapsed} />
          <button type="button" className="icon-btn sb-close" onClick={() => setDrawer(false)} aria-label="Menüyü kapat"><Icon name="close" /></button>
        </div>
        {navList}
        <div className="sb-bottom">
          <button type="button" className="sb-link sb-collapse" onClick={toggleCollapsed} aria-pressed={collapsed} aria-label={collapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'} title={collapsed ? 'Genişlet' : 'Daralt'}>
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} /><span className="sb-label">Daralt</span>
          </button>
        </div>
      </aside>

      <div className="shell-body">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setDrawer(true)} aria-label="Menüyü aç" aria-expanded={drawer} aria-controls="kenar-cubugu"><Icon name="menu" /></button>
          <div className="topbar-brand"><Brand /></div>
          <button type="button" className="search-trigger" onClick={openPalette} aria-label="Ara (komut paleti)" aria-haspopup="dialog">
            <Icon name="search" size={18} />
            <span className="search-text">Modül, ders veya parça ara…</span>
            <kbd className="search-kbd">{mac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <div className="topbar-actions">
            <ThemeToggle />
            {authOn ? (
              <Link href="/giris" className="user-chip"><span className="avatar" aria-hidden="true"><Icon name="user" size={18} /></span><span className="user-name">Giriş</span></Link>
            ) : (
              <div className="user-chip" title="Giriş şimdilik kapalı; ilerlemen bu tarayıcıda saklanır">
                <span className="avatar" aria-hidden="true">M</span><span className="user-name">Misafir</span>
              </div>
            )}
          </div>
        </header>
        <main id="icerik" tabIndex={-1}>{children}</main>
        <footer className="shell-footer">
          <span>ASK Robotic · 0&apos;dan AI robotik mühendisliğine</span>
          <span>Önizleme sürümü: ilerlemen bu tarayıcıda saklanır.</span>
        </footer>
      </div>

      <nav className="tabbar" aria-label="Hızlı menü">
        {NAV.flatMap((g) => g.items).filter((i) => i.tab).map((it) => (
          <Link key={it.href} href={it.href} className="tab" aria-current={isActive(it.href, pathname) ? 'page' : undefined}>
            <Icon name={it.icon} size={22} /><span>{it.label.replace('Devre laboratuvarı', 'Laboratuvar').replace('Robot arenası', 'Arena').replace('Blok atölyesi', 'Atölye')}</span>
          </Link>
        ))}
      </nav>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  )
}
