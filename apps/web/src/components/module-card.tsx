import Link from 'next/link'
import { MODULE_META, TRACKS } from '@/lib/module-meta'
import { hours, type ModuleSummary } from '@/lib/summaries'
import { ProgressBar } from './progress'

export function ModuleCard({ m }: { m: ModuleSummary }) {
  const meta = MODULE_META[m.slug]
  return (
    <Link href={`/moduller/${m.slug}`} className={`card card-link track-${m.track}`}>
      <div className="card-top">
        <span className="step-no">MODÜL {m.position}</span>
        <span className="chip chip-track">{TRACKS[m.track].label}</span>
      </div>
      <h3>{m.title}</h3>
      <p>{meta?.tagline}</p>
      <div className="meta">
        <span>{m.lessons} ders</span><span>{m.weeks} hafta</span><span>~{hours(m.minutes)}</span>
        {m.minAge ? <span>{m.minAge}+ yaş</span> : null}
      </div>
      <div className="card-foot"><ProgressBar ids={m.lessonIds} /></div>
    </Link>
  )
}
