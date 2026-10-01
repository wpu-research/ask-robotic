import { Icon, type IconName } from './shell/icons'
import { KIND_LABEL, LESSON_KIND_LABEL, type LessonKind, type ModuleKind } from '@/lib/module-meta'
import type { LessonStatus } from '@/lib/dashboard'

const KIND_ICON: Record<ModuleKind, IconName> = { blok: 'atolye', devre: 'laboratuvar', robot: 'arena' }
const LESSON_ICON: Record<LessonKind, IconName> = { metin: 'text', blok: 'atolye', devre: 'laboratuvar', arena: 'arena' }

/** Modül türü rozeti: Blok / Devre / Robot. */
export function KindBadge({ kind }: { kind: ModuleKind }) {
  return <span className={`kind kind-${kind}`}><Icon name={KIND_ICON[kind]} size={14} />{KIND_LABEL[kind]}</span>
}

/** Ders türü rozeti: Metin / Blok / Devre / Arena. */
export function LessonKindBadge({ kind }: { kind: LessonKind }) {
  return <span className={`kind lkind-${kind}`}><Icon name={LESSON_ICON[kind]} size={14} />{LESSON_KIND_LABEL[kind]}</span>
}

const STATUS_TEXT: Record<LessonStatus, string> = { yok: 'Yapılmadı', suruyor: 'Sürüyor', bitti: 'Bitti' }

/** Durum yalnız renkle değil simge ve metinle de verilir. */
export function StatusPill({ status, short = false }: { status: LessonStatus; short?: boolean }) {
  return (
    <span className={`status status-${status}`}>
      <span className="status-dot" aria-hidden="true">{status === 'bitti' ? <Icon name="check" size={12} /> : null}</span>
      <span className={short ? 'sr-only' : undefined}>{STATUS_TEXT[status]}</span>
    </span>
  )
}
