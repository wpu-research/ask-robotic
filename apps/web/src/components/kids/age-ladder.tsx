'use client'
// Yaş merdiveni: hangi yaşta nereden başlanır, bir sonraki basamak ne. Bantlar lib/learning-paths.ts'ten; bağlantılar atölye/ders sayfalarına.
import Link from 'next/link'
import { useLocale } from '@/i18n/client'
import { BANDS, type BandKey } from '@/lib/learning-paths'

const STEPS: Record<BandKey, { icon: string; links: { href: string; tr: string; en: string }[] }> = {
  minikler: { icon: '🧩', links: [{ href: '/atolye', tr: 'Blok atölyesi', en: 'Block workshop' }, { href: '/oyunlar', tr: 'Oyunlar', en: 'Games' }] },
  kasifler: { icon: '🤖', links: [{ href: '/robot-atolyesi', tr: 'Robot atölyesi', en: 'Robot workshop' }, { href: '/robot-atolyesi/yuz', tr: 'Konuşan Yüz', en: 'Talking Face' }, { href: '/mikro-kart', tr: 'Mikro Kart', en: 'Micro Card' }] },
  yapicilar: { icon: '🛠️', links: [{ href: '/robot-atolyesi/tasarla', tr: 'Robotunu Tasarla', en: 'Design your robot' }, { href: '/oyun-atolyesi', tr: 'Oyun atölyesi', en: 'Game studio' }] },
  'muhendis-adaylari': { icon: '🔌', links: [{ href: '/laboratuvar', tr: 'Devre laboratuvarı', en: 'Circuit lab' }, { href: '/arena', tr: 'Robot arenası', en: 'Robot arena' }] },
  muhendisler: { icon: '🚀', links: [{ href: '/muhendislik/mujoco', tr: 'MuRoKo fizik', en: 'MuRoKo physics' }, { href: '/muhendislik/robotik', tr: 'Robotik dersi', en: 'Robotics course' }, { href: '/makine-ogrenmesi', tr: 'Makine öğrenmesi', en: 'Machine learning' }] },
}

export function AgeLadder() {
  const en = useLocale() === 'en'
  return (
    <ol className="al" data-testid="age-ladder" aria-label={en ? 'Where to start by age' : 'Yaşa göre nereden başlanır'}>
      {BANDS.map((b, i) => {
        const s = STEPS[b.key]
        const t = en ? b.en : b
        return (
          <li key={b.key} className="al-step" style={{ ['--al-i' as string]: i }}>
            <span className="al-icon" aria-hidden="true">{s.icon}</span>
            <span className="al-age">{t.ages}</span>
            <b className="al-title">{t.title}</b>
            <span className="al-blurb">{t.blurb}</span>
            <span className="al-links">
              {s.links.map((l) => <Link key={l.href} href={l.href} className="al-link">{en ? l.en : l.tr}</Link>)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
