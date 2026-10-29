'use client'
// Misafir kapısı: misafir ders içeriğini görür ama bir şey yapmaya kalkınca (yanıt, kontrol, Mac, test…) "üye ol" penceresi çıkar.
// `useMemberGate(guest, next)`: `capture` etkileşim alanına yayılır, `guard(fn)` düğme eylemlerini sarar, `dialog` bir yere çizilir.
// Ücretsiz üyelik duyurusu ("İlk 1000 üye ücretsiz") FreeBadge ile her yerde aynı metni gösterir.
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type SyntheticEvent } from 'react'
import { Mascot } from '@/components/lesson-v2/mascot'
import { useT } from '@/i18n/client'

/** Kayıt kampanyası rozeti. Metin sunucuda hazırlanır (lib/membership.ts welcomeNoticeText: "İlk 1000 kayda 6 ay Premium ücretsiz — kalan: N"); kontenjan dolunca `text` boştur ve rozet çizilmez. */
export function FreeBadge({ text, className = '' }: { text?: string | null; className?: string }) {
  if (!text) return null
  return <span className={`free-badge ${className}`.trim()} data-testid="free-badge"><span aria-hidden="true">🎁</span> {text}</span>
}

const safeNext = (n: string) => (n.startsWith('/') && !n.startsWith('//') ? n : '/')

function MemberDialog({ next, promo, onClose }: { next: string; promo?: string | null; onClose: () => void }) {
  const t = useT()
  const primary = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    primary.current?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const q = encodeURIComponent(safeNext(next))
  return (
    <div className="mg-back" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="mg-card" role="dialog" aria-modal="true" aria-labelledby="mg-title" data-testid="member-gate">
        <div className="mg-robi"><Mascot mood="think" size={72} /></div>
        <FreeBadge text={promo} />
        <h2 id="mg-title">{t('paywall.memberTitle')}</h2>
        <p>{t('paywall.memberLead')}</p>
        <div className="mg-actions">
          <Link ref={primary} className="v2-btn accent" href={`/kayit?next=${q}`} data-testid="member-gate-register">{t('paywall.memberCta')}</Link>
          <Link className="v2-btn ghost" href={`/giris?next=${q}`}>{t('paywall.memberLogin')}</Link>
          <button type="button" className="mg-later" onClick={onClose}>{t('paywall.memberLater')}</button>
        </div>
        <p className="mg-note">{t('paywall.noCard')}</p>
      </section>
    </div>
  )
}

export interface MemberGate {
  /** Etkileşim alanının kapsayıcısına yayılır: misafirin her dokunuşu/tuşu pencereyi açar, eylem çalışmaz. */
  capture: { onPointerDownCapture?: (e: PointerEvent) => void; onKeyDownCapture?: (e: KeyboardEvent) => void }
  /** Düğme eylemini sarar: misafirse pencere açılır, üyeyse eylem çalışır. */
  guard: <A extends unknown[]>(fn: (...a: A) => void) => (...a: A) => void
  ask: () => void
  dialog: ReactNode
}

export function useMemberGate(guest: boolean, next: string, promo?: string | null): MemberGate {
  const [open, setOpen] = useState(false)
  const ask = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const block = (e: SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }
  const capture: MemberGate['capture'] = guest ? {
    onPointerDownCapture: block,
    // Gezinme (Tab, Esc, ok tuşları, Shift) serbest; yazma, Enter, Boşluk gibi eylem tuşları pencereyi açar
    onKeyDownCapture: (e) => { if (['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key) || e.key.startsWith('Arrow')) return; block(e) },
  } : {}
  const guard = useCallback(<A extends unknown[]>(fn: (...a: A) => void) => (...a: A) => { if (guest) setOpen(true); else fn(...a) }, [guest])
  return { capture, guard, ask, dialog: guest && open ? <MemberDialog next={next} promo={promo} onClose={close} /> : null }
}

/** Dersin üstünde ince şerit: misafir olduğunu ve ücretsiz üyelik duyurusunu söyler. */
export function GuestBar({ next, promo }: { next: string; promo?: string | null }) {
  const t = useT()
  return (
    <p className="guest-bar" role="note" data-testid="guest-bar">
      <span>{t('paywall.guestBar')}</span> <FreeBadge text={promo} />
      <Link href={`/kayit?next=${encodeURIComponent(safeNext(next))}`}>{t('paywall.guestBarCta')}</Link>
    </p>
  )
}
