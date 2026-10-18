import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/i18n/server'
import { LESSONS } from '@/lib/ml/lessons'
import { PROJECTS } from '@/lib/ml/projeler'
import { ML_TEXT } from '@/lib/ml/text'
import { DATASETS, VERI_DIZIN, usersOf } from '@/lib/ml/veri'
import { Icon } from '@/components/shell/icons'
import '../ml.css'

export async function generateMetadata(): Promise<Metadata> {
  const T = ML_TEXT[await getLocale()]
  return { title: `${T.dataSetsTitle} · ${T.course}`, description: T.dataSetsLead }
}

/** Kursun bütün veri setleri: açıklama, dosya, satır sayısı, sütunlar, indirme bağlantısı ve kullanıldığı dersler. */
export default async function VeriSetleri() {
  const lang = await getLocale()
  const T = ML_TEXT[lang]
  const titleOf = (slug: string) => (LESSONS.find((l) => l.slug === slug) ?? PROJECTS.find((p) => p.slug === slug))?.title[lang] ?? slug
  return (
    <div className="page ml-page">
      <header className="page-title">
        <nav aria-label={lang === 'tr' ? 'Konum' : 'Breadcrumb'} className="crumbs">
          <Link href="/makine-ogrenmesi">{T.course}</Link><Icon name="chevronRight" size={14} />
          <span aria-current="page">{T.dataSetsTitle}</span>
        </nav>
        <p className="eyebrow">{T.course} · {DATASETS.length} CSV</p>
        <h1>{T.dataSetsTitle}</h1>
        <p className="lead">{T.dataSetsLead}</p>
      </header>
      <ol className="vs-list">
        {DATASETS.map((d) => {
          const rows = d.rows().length
          const text = d.rows().some((r) => r.some((v) => typeof v === 'string'))
          const load = `veri = np.genfromtxt('${d.file}', delimiter=',', names=True${text ? ", dtype=None, encoding='utf-8'" : ''})`
          return (
            <li key={d.id} id={d.id} className="vs-item" data-testid={`vs-${d.id}`}>
              <div className="vs-head">
                <div>
                  <h2>{d.title[lang]}</h2>
                  <p className="vs-meta"><code>{d.file}</code> · {T.dataRows.replace('{r}', String(rows)).replace('{c}', String(d.cols.length))}</p>
                </div>
                <a className="btn btn-primary btn-small" href={`${VERI_DIZIN}/${d.file}`} download={d.file}>{T.dataDownload}</a>
              </div>
              <p className="vs-desc">{d.desc[lang]}</p>
              <div className="vs-table-wrap">
                <table className="vs-table">
                  <thead><tr><th scope="col">{T.dataColName}</th><th scope="col">{T.dataColDesc}</th></tr></thead>
                  <tbody>{d.cols.map((c) => <tr key={c.name}><th scope="row"><code>{c.name}</code></th><td>{c.desc[lang]}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="vs-load"><b>{T.dataLoad}:</b> <code>{load}</code></p>
              <p className="vs-used"><b>{T.dataUsed}:</b>{' '}
                {usersOf(d.id).map((s, k) => <span key={s}>{k > 0 && ' · '}<Link href={`/makine-ogrenmesi/${s}`}>{titleOf(s)}</Link></span>)}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
