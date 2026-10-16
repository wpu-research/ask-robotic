import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PartThumb } from '@/components/parts3d/part-thumb'
import { Icon } from '@/components/shell/icons'
import { GROUP_NAME, LEVELS, levelOf, partsOfLevel } from '@/lib/muhendislik/catalog'

export const dynamicParams = false
export const generateStaticParams = () => LEVELS.map((l) => ({ n: String(l.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const l = levelOf(Number((await params).n))
  return { title: l ? `Seviye ${l.n}: ${l.title}` : 'Seviye' }
}

export default async function Seviye({ params }: { params: Promise<{ n: string }> }) {
  const l = levelOf(Number((await params).n))
  if (!l) notFound()
  const parts = partsOfLevel(l.n)
  const prev = levelOf(l.n - 1), next = levelOf(l.n + 1)
  return (
    <div className="page eng">
      <nav aria-label="Konum" className="crumbs">
        <Link href="/muhendislik">Mühendislik yolu</Link><Icon name="chevronRight" size={14} /><span aria-current="page">Seviye {l.n}</span>
      </nav>
      <header className="eng-lv-head">
        <span className="eng-level-n" aria-hidden="true">{String(l.n).padStart(2, '0')}</span>
        <div>
          <p className="eyebrow">Seviye {l.n} / {LEVELS.length}</p>
          <h1>{l.title}</h1>
          <p className="lead">{l.summary}</p>
        </div>
      </header>

      <div className="eng-lv-grid">
        <section className="panel" aria-labelledby="lv-skills">
          <h2 id="lv-skills" className="panel-title">Bu seviyede</h2>
          <ul className="eng-list">{l.skills.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section className="panel eng-bridge" aria-labelledby="lv-bridge">
          <h2 id="lv-bridge" className="panel-title">Drone&apos;a giden köprü</h2>
          <p>{l.bridge}</p>
        </section>
      </div>

      <section aria-labelledby="lv-parts">
        <h2 id="lv-parts">Parçalar <span className="muted eng-count">{parts.length}</span></h2>
        <ul className="eng-grid">
          {parts.map((p) => (
            <li key={p.slug}>
              <Link href={`/muhendislik/parca/${p.slug}`} className="eng-card" data-testid={`eng-part-${p.slug}`}>
                <PartThumb slug={p.slug} group={p.group} />
                <span className="eng-card-top">
                  <span className="eng-tag">{GROUP_NAME[p.group] ?? p.group}</span>
                  {p.lab ? <span className="eng-tag eng-tag-lab">Laboratuvar</span> : <span className="eng-tag eng-tag-off">Tanıtım</span>}
                </span>
                <b>{p.name}</b>
                {(p.interface || p.voltage) && (
                  <span className="eng-card-spec">{[p.interface, p.voltage].filter(Boolean).join(' · ')}</span>
                )}
                {p.uses[0] && <span className="eng-card-use">{p.uses[0]}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav className="eng-pager" aria-label="Seviyeler">
        {prev ? <Link href={`/muhendislik/seviye/${prev.n}`}><Icon name="chevronLeft" size={16} /> Seviye {prev.n}: {prev.title}</Link> : <span />}
        {next && <Link href={`/muhendislik/seviye/${next.n}`}>Seviye {next.n}: {next.title} <Icon name="chevronRight" size={16} /></Link>}
      </nav>
    </div>
  )
}
