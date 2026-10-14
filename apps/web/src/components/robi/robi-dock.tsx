'use client'
import '@/app/tutor.css'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Mascot } from '@/components/lesson-v2/mascot'
import { TutorPanel } from '@/components/lesson-v2/tutor'
import { useVoice } from '@/components/lesson-v2/voice'
import { useT } from '@/i18n/client'
import { robiHiddenOn } from '@/lib/tutor/page-context'
import { useRobiClaimed } from './presence'

/**
 * Her sayfada Robi: sağ altta düğme, açılınca sohbet paneli. Bağlam olarak yalnız sayfa yolu gider; içerik sunucuda
 * yüklenir (lib/tutor/page-context.ts). Ders oynatıcısı kendi Robi'sini açtığında (useClaimRobi) ve giriş/ödeme/öğretmen
 * sayfalarında gizlenir. `enabled`: sunucuda ANTHROPIC_API_KEY var mı.
 */
export function RobiDock({ enabled }: { enabled: boolean }) {
  const path = usePathname() || '/'
  const claimed = useRobiClaimed()
  const [open, setOpen] = useState(false)
  const voice = useVoice()
  const t = useT()
  const close = useCallback(() => setOpen(false), [])
  if (!enabled || claimed || robiHiddenOn(path)) return null
  const lesson = path.startsWith('/ders/')
  const chips = (lesson
    ? ['lesson.tutor.chipHint', 'lesson.tutor.chipExplain', 'lesson.tutor.chipQuizMe'] as const
    : ['lesson.tutor.chipWhatHere', 'lesson.tutor.chipSimple', 'lesson.tutor.chipQuizMe'] as const).map((k) => t(k))
  return (
    <>
      <button
        type="button" className="robi-fab" onClick={() => setOpen((o) => !o)}
        aria-expanded={open} aria-label={open ? t('lesson.tutor.close') : t('lesson.tutor.dock')} title={t('lesson.tutor.dock')}
      >
        <Mascot size={40} mood={open ? 'happy' : 'idle'} />
      </button>
      <TutorPanel
        open={open} onClose={close} context={{ page: path.slice(0, 200) }} chips={chips}
        greeting={t('lesson.tutor.pageGreeting')} resetKey={path} say={voice.say} voice={voice}
      />
    </>
  )
}
