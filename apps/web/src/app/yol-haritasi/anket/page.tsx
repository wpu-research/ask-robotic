import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/shell/icons'
import { CareerSurvey } from '@/components/kariyer/career-survey'
import { getLocale } from '@/i18n/server'
import { QUESTIONS } from '@/lib/kariyer-anket'

export const metadata: Metadata = {
  title: 'Kariyer anketi',
  description: 'Ne olmak istediğini bilmiyor musun? Dokuz kısa soruyu cevapla; robotik, gömülü, drone, IoT, görü, makine öğrenmesi ve yapay zekâ yollarından sana en uygun üçünü gösterelim.',
}

export default async function KariyerAnketi() {
  const en = (await getLocale()) === 'en'
  return (
    <div className="page eng ks-page">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/yol-haritasi">{en ? 'Roadmap' : 'Yol haritası'}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Career survey' : 'Kariyer anketi'}</span>
      </nav>
      <header className="eng-hero">
        <p className="eyebrow">{en ? `For adults · ${QUESTIONS.length} questions · about 2 minutes` : `Büyükler için · ${QUESTIONS.length} soru · yaklaşık 2 dakika`}</p>
        <h1>{en ? 'Not sure what you want to become?' : 'Ne olmak istediğini bilmiyor musun?'}</h1>
        <p className="lead">{en ? 'Answer a few short questions about what excites you and how you like to work. We will show the three paths that fit you best, with their courses in order.' : 'Seni neyin heyecanlandırdığına ve nasıl çalışmayı sevdiğine dair birkaç kısa soru. Sana en uygun üç yolu, dersleriyle birlikte sırayla gösterelim.'}</p>
      </header>
      <CareerSurvey />
    </div>
  )
}
