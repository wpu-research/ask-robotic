'use client'
import { useT } from '@/i18n/client'

export function PrintButton() {
  const t = useT()
  return <button type="button" className="v2-btn accent og-no-print" onClick={() => window.print()}>{t('teacher.cards.print')}</button>
}
