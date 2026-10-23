import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/shell/icons'
import { CareerPicker } from '@/components/kariyer/career-picker'
import { getLocale } from '@/i18n/server'
import { CAREERS, COURSES, STAGES } from '@/lib/kariyer'

export const metadata: Metadata = {
  title: 'Yol haritası',
  description: 'Büyükler için bütün dersler dört aşamada ve "ne olmak istiyorsun?" seçimi: robotik yazılım, gömülü, drone, IoT, görü, makine öğrenmesi, yapay zekâ, endüstriyel robot, otonom araç ve robotik araştırma yolları.',
}

export default async function YolHaritasi() {
  const lang = await getLocale()
  const en = lang === 'en'
  const total = Object.values(COURSES).reduce((s, c) => s + c.hours, 0)
  return (
    <div className="page eng">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Roadmap' : 'Yol haritası'}</span>
      </nav>
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'For adults · age 16 and up' : 'Büyükler için · 16 yaş ve üstü'}</p>
        <h1>{en ? 'Roadmap: what do you want to become?' : 'Yol haritası: ne olmak istiyorsun?'}</h1>
        <p className="lead">{en ? 'All adult courses in four stages. Pick a goal below and see which courses to finish, in which order.' : 'Büyükler için bütün dersler dört aşamada. Aşağıdan bir hedef seç; hangi dersleri hangi sırayla bitireceğini gör.'}</p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Courses' : 'Ders'}</dt><dd>{Object.keys(COURSES).length}</dd></div>
          <div><dt>{en ? 'Goals' : 'Hedef'}</dt><dd>{CAREERS.length}</dd></div>
          <div><dt>{en ? 'Total' : 'Toplam'}</dt><dd>{total} {en ? 'h' : 'sa'}</dd></div>
        </dl>
      </header>

      <section aria-labelledby="yh-goal">
        <h2 id="yh-goal">{en ? 'Pick your goal' : 'Hedefini seç'}</h2>
        <div className="yh-survey-cta">
          <p>{en ? 'Not sure yet? Answer 9 short questions and we will suggest three paths.' : 'Henüz emin değil misin? 9 kısa soruyu cevapla, sana üç yol önerelim.'}</p>
          <Link href="/yol-haritasi/anket" className="btn btn-primary" data-testid="roadmap-survey">{en ? 'Take the career survey' : 'Kariyer anketini çöz'}</Link>
        </div>
        <CareerPicker />
      </section>

      <section aria-labelledby="yh-map" className="yh-map-sec">
        <h2 id="yh-map">{en ? 'All topics, in four stages' : 'Bütün konular, dört aşamada'}</h2>
        <ol className="yh-stages">
          {STAGES.map((s, i) => (
            <li key={s.key} className={`yh-stage s-${s.key}`}>
              <p className="yh-stage-n">{en ? 'Stage' : 'Aşama'} {i + 1}</p>
              <h3>{s[lang].title}</h3>
              <p className="muted">{s[lang].summary}</p>
              <ul className="yh-courses">
                {s.courses.map((h) => (
                  <li key={h}><Link href={h}><b>{COURSES[h][lang].title}</b><span className="h">{COURSES[h].hours} {en ? 'h' : 'sa'}</span><small>{COURSES[h][lang].topics}</small></Link></li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <p className="pg-note">{en ? 'Hours are guided study time, including simulations, code and quizzes. Looking for certificate tracks? See ' : 'Saatler simülasyon, kod ve testler dahil rehberli çalışma süresidir. Sertifikalı hatlar için '}<Link href="/programlar">{en ? 'Programmes' : 'Programlar'}</Link>{en ? '.' : ' sayfasına bak.'}</p>
    </div>
  )
}
