'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { signOut, useSession } from '@/lib/session'
import { useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'
import './auth.css'

export const ROLE_LABEL: Record<string, string> = { student: 'Öğrenci', parent: 'Veli', teacher: 'Öğretmen', admin: 'Yönetici' }

/**
 * Hesap düğmesi. Misafirde "Giriş yap" + "Ücretsiz başla"; `topbar` (espresso üst bant): misafirde yalnız "Öğrenci Girişi",
 * girişte küçük ad düğmesi.
 */
export function UserMenu({ variant = 'default' }: { variant?: 'default' | 'topbar' }) {
  const { status, user } = useSession()
  const t = useT()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (status === 'loading') return variant === 'topbar' ? <span className="um-tb" aria-hidden="true" /> : <div className="user-chip" aria-hidden="true"><span className="avatar" /></div>
  if (!user) {
    const next = pathname && pathname !== '/' && !pathname.startsWith('/giris') && !pathname.startsWith('/kayit') ? `?next=${encodeURIComponent(pathname)}` : ''
    if (variant === 'topbar') return <Link href={`/giris${next}`} className="um-tb">{t('shell.studentLogin')}</Link>
    return (
      <div className="um-guest">
        <Link href={`/giris${next}`} className="um-login">{t('shell.user.login')}</Link>
        <Link href="/basla" className="v2-btn um-start">{t('shell.user.startFree')}</Link>
      </div>
    )
  }

  const initial = (user.name.trim()[0] ?? '?').toLocaleUpperCase(locale)
  const role = user.role in ROLE_LABEL ? t(`shell.user.roles.${user.role}` as MessageKey) : user.role
  const teacher = user.role === 'teacher' || user.role === 'admin'
  return (
    <div className={`um${variant === 'topbar' ? ' um-topbar' : ''}`} ref={box}>
      <button type="button" className="user-chip um-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="avatar" aria-hidden="true">{initial}</span>
        <span className="um-who"><span className="user-name">{user.name}</span><span className="um-role">{role}</span></span>
      </button>
      {open && (
        <div className="um-menu" role="menu">
          <div className="um-head"><b>{user.name}</b><span className="muted">{user.username ? `@${user.username} · ` : ''}{role}</span></div>
          <hr />
          <Link href="/hesap" role="menuitem">{t('shell.user.account')}</Link>
          {teacher && <Link href="/ogretmen" role="menuitem">{t('shell.user.teacherPanel')}</Link>}
          <hr />
          <button type="button" role="menuitem" onClick={() => void signOut()}>{t('shell.user.logout')}</button>
        </div>
      )}
    </div>
  )
}
