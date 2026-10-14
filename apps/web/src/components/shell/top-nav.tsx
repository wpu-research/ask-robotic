'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useGame } from '@/lib/gamification'
import { streak } from '@/lib/gamification-core'
import { Icon } from './icons'
import { useT } from '@/i18n/client'
import { isActive, NAV, TOP_NAV } from './nav-items'

/**
 * Üst menü (Brilliant'taki gibi yatay): Ana sayfa · Konular · Atölyeler ▾ · Okullar için.
 * Atölyeler açılır panelinde araçlar ve öğrenme sayfaları; dar ekranda gizlenir (çekmece + alt sekmeler devralır).
 */
export function TopNav({ pathname }: { pathname: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const groups = NAV.filter((g) => g.key !== 'shell.groups.learn')
  const toolActive = groups.some((g) => g.items.some((i) => isActive(i.href, pathname)))
  return (
    <nav className="tn" aria-label={t('shell.mainMenu')}>
      {TOP_NAV.map((it) => (
        <Link key={it.href} href={it.href} className="tn-link" aria-current={isActive(it.href, pathname) ? 'page' : undefined}>
          <Icon name={it.icon} size={18} />{t(it.key)}
        </Link>
      ))}
      <div className="tn-more" ref={ref}>
        <button type="button" className="tn-link" aria-expanded={open} aria-haspopup="true" aria-current={toolActive ? 'page' : undefined} onClick={() => setOpen((o) => !o)}>
          <Icon name="atolye" size={18} />{t('shell.workshops')}<Icon name="chevronDown" size={16} />
        </button>
        {open && (
          <div className="tn-panel" role="menu">
            {groups.map((g) => (
              <div key={g.title} className="tn-group">
                <div className="tn-group-title">{t(g.key)}</div>
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href} role="menuitem" className="tn-item" aria-current={isActive(it.href, pathname) ? 'page' : undefined}>
                    <span className="tn-icon" aria-hidden="true"><Icon name={it.icon} size={18} /></span>{t(it.key)}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

/** Üst çubuktaki seri göstergesi (⚡ gün sayısı); panele götürür. */
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
