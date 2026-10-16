import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/shell/icons'
import { ENG_PARTS, LEVELS, labHref, partsOfLevel } from '@/lib/muhendislik/catalog'

export const metadata: Metadata = {
  title: 'Mühendislik yolu',
  description: 'Büyükler için robotik: Hyvex Academy elektronik serisindeki 128 parça, temel bileşenden drone\'a 7 seviyede.',
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function Muhendislik() {
  const withLab = ENG_PARTS.filter((p) => p.lab)
  return (
    <div className="page eng">
      <header className="eng-hero">
        <p className="eyebrow">Büyükler için robotik</p>
        <h1>Mühendislik yolu: temel bileşenden drone&apos;a</h1>
        <p className="lead">
          Hyvex Academy elektronik serisindeki parçalar yedi seviyede. Uno&apos;da benzetilebilen her parça devre laboratuvarında
          takılı açılır: kablolar bağlı, başlangıç kodu yazılı, derleyip çalıştırman yeterli.
        </p>
        <dl className="eng-stats">
          <div><dt>Parça</dt><dd>{ENG_PARTS.length}</dd></div>
          <div><dt>Laboratuvarda</dt><dd>{withLab.length}</dd></div>
          <div><dt>Seviye</dt><dd>{LEVELS.length}</dd></div>
        </dl>
      </header>

      <section aria-labelledby="eng-levels">
        <h2 id="eng-levels" className="sr-only">Seviyeler</h2>
        <ol className="eng-path">
          {LEVELS.map((l) => {
            const parts = partsOfLevel(l.n)
            const lab = parts.filter((p) => p.lab).length
            return (
              <li key={l.n}>
                <Link href={`/muhendislik/seviye/${l.n}`} className="eng-level" data-testid={`eng-level-${l.n}`}>
                  <span className="eng-level-n" aria-hidden="true">{pad(l.n)}</span>
                  <span className="eng-level-body">
                    <b>{l.title}</b>
                    <span className="eng-level-text">{l.summary}</span>
                    <span className="eng-level-meta">{parts.length} parça · {lab > 0 ? `${lab} laboratuvarda` : 'tanıtım'}</span>
                  </span>
                  <Icon name="chevronRight" size={18} className="eng-level-go" />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="panel" aria-labelledby="eng-lab">
        <h2 id="eng-lab" className="panel-title">Laboratuvarda hemen aç</h2>
        <p className="muted eng-note">Parçaya tıkla: laboratuvar o parça Uno&apos;ya bağlı ve başlangıç koduyla açılır.</p>
        <ul className="eng-chips">
          {withLab.map((p) => (
            <li key={p.slug}><Link className="eng-chip" href={labHref(p)!}><span className="eng-chip-lv">S{p.level}</span>{p.name}</Link></li>
          ))}
        </ul>
      </section>

      <p className="eng-source">Parça bilgileri: Hyvex Academy elektronik serisi (Dr. Öğr. Üyesi Murat Arslan · Hyvex Defense).</p>
    </div>
  )
}
