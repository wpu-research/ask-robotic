import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PartViewer } from '@/components/parts3d/part-viewer'
import { Icon } from '@/components/shell/icons'
import { ENG_PARTS, GROUP_NAME, OFFLINE_TEXT, kitOf, labHref, levelOf, partBySlug, partsOfLevel } from '@/lib/muhendislik/catalog'
import { wiringRows } from '@/lib/muhendislik/wiring'

export const dynamicParams = false
export const generateStaticParams = () => ENG_PARTS.map((p) => ({ slug: p.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = partBySlug((await params).slug)
  return { title: p ? `${p.name} · Mühendislik yolu` : 'Parça' }
}

export default async function MuhendislikParca({ params }: { params: Promise<{ slug: string }> }) {
  const p = partBySlug((await params).slug)
  if (!p) notFound()
  const level = levelOf(p.level)!
  const kit = kitOf(p)
  const href = labHref(p)
  const rows = kit ? wiringRows(kit.circuit(p.lab!.model)) : []
  const siblings = partsOfLevel(p.level).filter((x) => x.slug !== p.slug && x.group === p.group).slice(0, 8)
  return (
    <div className="page eng part-page">
      <nav aria-label="Konum" className="crumbs">
        <Link href="/muhendislik">Mühendislik yolu</Link><Icon name="chevronRight" size={14} />
        <Link href={`/muhendislik/seviye/${p.level}`}>Seviye {p.level}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{p.name}</span>
      </nav>
      <div className="eng-part-top">
      <header className="page-title eng-part-head">
        <p className="eng-card-top">
          <span className="eng-tag">{GROUP_NAME[p.group] ?? p.group}</span>
          <span className="eng-tag">Seviye {p.level} · {level.title}</span>
        </p>
        <h1>{p.name}</h1>
        {(p.interface || p.voltage) && (
          <dl className="eng-meta">
            {p.interface && <div><dt>Arayüz</dt><dd>{p.interface}</dd></div>}
            {p.voltage && <div><dt>Gerilim</dt><dd>{p.voltage}</dd></div>}
          </dl>
        )}
      </header>
      <PartViewer slug={p.slug} group={p.group} name={p.name} />
      </div>

      <div className="part-layout">
        <div className="part-main">
          {kit && href ? (
            <section className="eng-labbox" aria-labelledby="p-lab">
              <h2 id="p-lab">Laboratuvarda: {kit.title}</h2>
              <p>{kit.watch}</p>
              <Link className="btn btn-primary" href={href} data-testid="eng-open-lab">Laboratuvarda aç <Icon name="arrowRight" size={16} /></Link>
            </section>
          ) : (
            <section className="eng-offbox" aria-labelledby="p-off">
              <h2 id="p-off">Laboratuvarda yok</h2>
              <p>{OFFLINE_TEXT[p.offline!]}</p>
            </section>
          )}
          {p.specs.length > 0 && (
            <section aria-labelledby="p-spec"><h2 id="p-spec">Özellikler</h2><ul className="eng-list eng-specs">{p.specs.map((s) => <li key={s}>{s}</li>)}</ul></section>
          )}
          {p.uses.length > 0 && (
            <section aria-labelledby="p-use"><h2 id="p-use">Nerede kullanılır</h2><ul className="eng-list">{p.uses.map((s) => <li key={s}>{s}</li>)}</ul></section>
          )}
          {p.warnings.length > 0 && (
            <section className="eng-warn" aria-labelledby="p-warn"><h2 id="p-warn">Dikkat</h2><ul className="eng-list">{p.warnings.map((s) => <li key={s}>{s}</li>)}</ul></section>
          )}
        </div>
        <aside className="part-side">
          {rows.length > 0 && (
            <section className="panel" aria-labelledby="p-wire">
              <h2 id="p-wire" className="panel-title">Kablolama</h2>
              <ol className="eng-wires">{rows.map((r, i) => <li key={i}><code>{r.from}</code><span aria-hidden="true">→</span><code>{r.to}</code></li>)}</ol>
            </section>
          )}
          {siblings.length > 0 && (
            <section className="panel" aria-labelledby="p-sib">
              <h2 id="p-sib" className="panel-title">Aynı ailede</h2>
              <ul className="eng-sib">{siblings.map((s) => <li key={s.slug}><Link href={`/muhendislik/parca/${s.slug}`}>{s.name}</Link>{s.lab && <small>laboratuvar</small>}</li>)}</ul>
            </section>
          )}
        </aside>
      </div>
      <p className="eng-source">Kaynak: Hyvex Academy elektronik serisi ({p.source.replace('.html', '')}).</p>
    </div>
  )
}
