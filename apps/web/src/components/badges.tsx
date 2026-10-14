'use client'
import { Icon, type IconName } from './shell/icons'
import type { LessonKind, ModuleKind } from '@/lib/module-meta'
import { useT } from '@/i18n/client'
import type { LessonStatus } from '@/lib/dashboard'

const KIND_ICON: Record<ModuleKind, IconName> = { blok: 'atolye', devre: 'laboratuvar', robot: 'arena', oyun: 'oyun', ai: 'ai' }
const LESSON_ICON: Record<LessonKind, IconName> = { metin: 'text', blok: 'atolye', devre: 'laboratuvar', arena: 'arena', oyun: 'oyun', ai: 'ai' }

/** Modül türü rozeti: Blok / Devre / Robot / Oyun. */
export function KindBadge({ kind }: { kind: ModuleKind }) {
  const t = useT()
  return <span className={`kind kind-${kind}`}><Icon name={KIND_ICON[kind]} size={14} />{t(`common.badges.kind.${kind}`)}</span>
}

/** Ders türü rozeti: Metin / Blok / Devre / Arena. */
export function LessonKindBadge({ kind }: { kind: LessonKind }) {
  const t = useT()
  return <span className={`kind lkind-${kind}`}><Icon name={LESSON_ICON[kind]} size={14} />{t(`common.badges.lessonKind.${kind}`)}</span>
}

/** Durum yalnız renkle değil simge ve metinle de verilir. */
export function StatusPill({ status, short = false }: { status: LessonStatus; short?: boolean }) {
  const t = useT()
  return (
    <span className={`status status-${status}`}>
      <span className="status-dot" aria-hidden="true">{status === 'bitti' ? <Icon name="check" size={12} /> : null}</span>
      <span className={short ? 'sr-only' : undefined}>{t(`common.badges.status.${status}`)}</span>
    </span>
  )
}
