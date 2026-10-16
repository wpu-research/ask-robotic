'use client'
import { useT } from '@/i18n/client'

export function GameCredit() {
  const t = useT()
  return <p className="gm-credit">{t('studios.games.credit')}</p>
}
