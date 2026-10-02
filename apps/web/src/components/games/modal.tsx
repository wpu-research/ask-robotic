'use client'
import { useEffect, useRef, type ReactNode } from 'react'

/** Basit, erişilebilir pencere (yerel <dialog>): Esc ve dışarı tıklama ile kapanır. */
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])
  return (
    <dialog ref={ref} className="gm-modal" data-wide={wide} aria-label={title} onClose={() => { if (open) onClose() }} onClick={(e) => { if (e.target === ref.current) onClose() }}>
      {open && (
        <div className="gm-modal-box">
          <h2 className="gm-modal-title">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  )
}
