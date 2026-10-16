'use client'
// Atölye kartları (Macademia program kartı düzeni): üstte illüstrasyon, altta başlık, yaş satırı ve tek cümle.
import Link from 'next/link'
import { useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'
import { Art } from './art'
import { WORKSHOPS, type Workshop } from './workshops'

export function WorkshopCards({ items = WORKSHOPS }: { items?: Workshop[] }) {
  const t = useT()
  return (
    <ul className="kc-grid">
      {items.map((w) => (
        <li key={w.href}>
          <Link href={w.href} className="kc-card" data-testid={`kc-${w.k}`}>
            <Art kind={w.art} className="kc-art" />
            <span className="kc-body">
              <b>{t(`home.tools.${w.k}` as MessageKey)}</b>
              <span className="kc-meta">{w.age}</span>
              <span className="kc-text">{t(`home.tools.${w.k}Text` as MessageKey)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
