import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { ENG_PARTS, LEVELS, labHref, levelText, partText, partsOfLevel } from '@/lib/muhendislik/catalog'

export const metadata: Metadata = {
  title: 'Mühendislik yolu',
  description: 'Büyükler için robotik: Hyvex Academy elektronik serisindeki 128 parça, temel bileşenden drone\'a 7 seviyede.',
}

const pad = (n: number) => String(n).padStart(2, '0')

export default async function Muhendislik() {
  const en = (await getLocale()) === 'en'
  const lang = en ? 'en' : 'tr'
  const withLab = ENG_PARTS.filter((p) => p.lab)
  return (
    <div className="page eng">
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'Robotics for adults' : 'Büyükler için robotik'}</p>
        <h1>{en ? 'Engineering path: from basic components to drones' : 'Mühendislik yolu: temel bileşenden drone\'a'}</h1>
        <p className="lead">
          {en
            ? 'The parts of the Hyvex Academy electronics series, in seven levels. Every part that can be simulated on the Uno opens in the circuit lab already connected: wires attached, starter code written, just compile and run.'
            : 'Hyvex Academy elektronik serisindeki parçalar yedi seviyede. Uno\'da benzetilebilen her parça devre laboratuvarında takılı açılır: kablolar bağlı, başlangıç kodu yazılı, derleyip çalıştırman yeterli.'}
        </p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Parts' : 'Parça'}</dt><dd>{ENG_PARTS.length}</dd></div>
          <div><dt>{en ? 'In the lab' : 'Laboratuvarda'}</dt><dd>{withLab.length}</dd></div>
          <div><dt>{en ? 'Levels' : 'Seviye'}</dt><dd>{LEVELS.length}</dd></div>
        </dl>
      </header>

      <Link href="/muhendislik/robotik" className="eng-course" data-testid="eng-course">
        <span className="eng-course-code">ESOF 323</span>
        <span className="eng-level-body">
          <b>{en ? 'University course: Robotics' : 'Üniversite dersi: Robotik'}</b>
          <span className="eng-level-text">{en ? '14 weeks: embedded programming, sensors and filters, PID, kinematics, planning, computer vision, deep learning, ROS 2 and drones. 15 in-browser simulations, Webots and Gazebo projects.' : '14 hafta: gömülü programlama, sensör ve filtreler, PID, kinematik, planlama, bilgisayarlı görü, derin öğrenme, ROS 2 ve drone\'lar. Tarayıcıda 15 simülasyon, Webots ve Gazebo projeleri.'}</span>
        </span>
        <Icon name="chevronRight" size={18} className="eng-level-go" />
      </Link>

      <section aria-labelledby="eng-levels">
        <h2 id="eng-levels" className="sr-only">{en ? 'Levels' : 'Seviyeler'}</h2>
        <ol className="eng-path">
          {LEVELS.map((l) => {
            const parts = partsOfLevel(l.n)
            const lab = parts.filter((p) => p.lab).length
            const lt = levelText(l, lang)
            return (
              <li key={l.n}>
                <Link href={`/muhendislik/seviye/${l.n}`} className="eng-level" data-testid={`eng-level-${l.n}`}>
                  <span className="eng-level-n" aria-hidden="true">{pad(l.n)}</span>
                  <span className="eng-level-body">
                    <b>{lt.title}</b>
                    <span className="eng-level-text">{lt.summary}</span>
                    <span className="eng-level-meta">{en ? `${parts.length} parts · ${lab > 0 ? `${lab} in the lab` : 'overview'}` : `${parts.length} parça · ${lab > 0 ? `${lab} laboratuvarda` : 'tanıtım'}`}</span>
                  </span>
                  <Icon name="chevronRight" size={18} className="eng-level-go" />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="panel" aria-labelledby="eng-lab">
        <h2 id="eng-lab" className="panel-title">{en ? 'Open in the lab right away' : 'Laboratuvarda hemen aç'}</h2>
        <p className="muted eng-note">{en ? 'Click a part: the lab opens with it wired to the Uno and with starter code.' : 'Parçaya tıkla: laboratuvar o parça Uno\'ya bağlı ve başlangıç koduyla açılır.'}</p>
        <ul className="eng-chips">
          {withLab.map((p) => (
            <li key={p.slug}><Link className="eng-chip" href={labHref(p)!}><span className="eng-chip-lv">{en ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>
          ))}
        </ul>
      </section>

      <p className="eng-source">{en ? 'Part information: Hyvex Academy electronics series (Asst. Prof. Dr. Murat Arslan · Hyvex Defense).' : 'Parça bilgileri: Hyvex Academy elektronik serisi (Dr. Öğr. Üyesi Murat Arslan · Hyvex Defense).'}</p>
    </div>
  )
}
