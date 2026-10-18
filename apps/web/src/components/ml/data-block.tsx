// Ders / proje sayfasında "Veri seti" kutusu: dersin kullandığı CSV'ler (satır, sütun, indir) ve tüm setler sayfasına bağlantı.
// Sunucu bileşeni; satır sayısı üreteçten hesaplanır.
import Link from 'next/link'
import type { Lang } from '@/lib/ml/core'
import { ML_TEXT } from '@/lib/ml/text'
import { VERI_DIZIN, datasetsFor } from '@/lib/ml/veri'

export function DataBlock({ slug, lang }: { slug: string; lang: Lang }) {
  const T = ML_TEXT[lang]
  const sets = datasetsFor(slug)
  return (
    <section className="ml-data" aria-labelledby={`ml-data-${slug}`} data-testid="ml-data">
      <div className="ml-data-head">
        <h2 id={`ml-data-${slug}`}>{T.dataTitle}</h2>
        <Link href="/makine-ogrenmesi/veri-setleri" className="mx-link">{T.dataAll} →</Link>
      </div>
      {sets.length === 0 ? <p className="ml-data-none">{T.dataNone}</p> : (
        <ul className="ml-data-list">
          {sets.map((d, i) => (
            <li key={d.id} className="ml-data-item">
              <div>
                <span><b>{d.title[lang]}</b>{i > 0 && <span className="ml-data-tag">{T.dataPractice}</span>}</span>
                <span className="ml-data-meta"><code>{d.file}</code> · {T.dataRows.replace('{r}', String(d.rows().length)).replace('{c}', String(d.cols.length))}</span>
              </div>
              <a className="btn btn-outline btn-small" href={`${VERI_DIZIN}/${d.file}`} download={d.file}>{T.dataDownload}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
