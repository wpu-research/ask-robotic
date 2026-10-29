import type { Metadata } from 'next'
import Link from 'next/link'
import { YuzStudio } from '@/components/yuz/yuz-studio'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import './yuz.css'

export const metadata: Metadata = { title: 'Konuşan Yüz' }

export default async function YuzPage() {
  const en = (await getLocale()) === 'en'
  const L = (tr: string, e: string) => (en ? e : tr)
  return (
    <div className="page page-tool">
      <nav aria-label={L('Konum', 'Breadcrumb')} className="crumbs">
        <Link href="/robot-atolyesi">{L('Robot atölyesi', 'Robot workshop')}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{L('Konuşan Yüz', 'Talking Face')}</span>
      </nav>
      <header className="page-title">
        <p className="eyebrow">{L('Çocuklar için', 'For kids')}</p>
        <h1>{L('Konuşan Yüz', 'Talking Face')}</h1>
        <p className="muted">{L(
          'Robotun yüzü 3B: göz kırpar, seni izler, duygu gösterir. Yaz, konuştur; dudakları söylediğine göre oynar. Ya da Mac\'e bir soru sor, yüz cevabı söylesin.',
          'A 3D robot face: it blinks, follows you and shows feelings. Type and make it speak; its lips move with the words. Or ask Mac a question and let the face answer.')}</p>
      </header>
      <div className="tool-body"><YuzStudio /></div>
    </div>
  )
}
