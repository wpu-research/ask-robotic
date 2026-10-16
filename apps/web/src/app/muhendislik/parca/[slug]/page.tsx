import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PartViewer } from '@/components/parts3d/part-viewer'
import { Icon } from '@/components/shell/icons'
import { ENG_PARTS, groupName, kitOf, labHref, levelOf, levelText, offlineText, partBySlug, partText, partsOfLevel } from '@/lib/muhendislik/catalog'
import { kitText } from '@/lib/muhendislik/kits'
import { docOf } from '@/lib/muhendislik/docs'
import { wiringRows } from '@/lib/muhendislik/wiring'
import { getLocale, getT } from '@/i18n/server'
import { partShortName } from '@/lib/lab/text'

export const dynamicParams = false
export const generateStaticParams = () => ENG_PARTS.map((p) => ({ slug: p.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = partBySlug((await params).slug)
  const en = (await getLocale()) === 'en'
  if (!p) return { title: en ? 'Part' : 'Parça' }
  return { title: `${partText(p, en ? 'en' : 'tr').name} · ${en ? 'Engineering path' : 'Mühendislik yolu'}` }
}

export default async function MuhendislikParca({ params }: { params: Promise<{ slug: string }> }) {
  const p = partBySlug((await params).slug)
  if (!p) notFound()
  const level = levelOf(p.level)!
  const lang = await getLocale()
  const en = lang === 'en'
  const doc = docOf(p.slug)
  const dt = doc?.[lang]
  const pt = partText(p, lang)
  const kit = kitOf(p)
  const kt = kit ? kitText(kit, lang) : null
  const href = labHref(p)
  const t = await getT()
  const rows = kit ? wiringRows(kit.circuit(p.lab!.model), (ty) => partShortName(t, ty)) : []
  const siblings = partsOfLevel(p.level).filter((x) => x.slug !== p.slug && x.group === p.group).slice(0, 8)
  return (
    <div className="page eng part-page">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href={`/muhendislik/seviye/${p.level}`}>{en ? 'Level' : 'Seviye'} {p.level}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{pt.name}</span>
      </nav>
      <div className="eng-part-top">
      <header className="page-title eng-part-head">
        <p className="eng-card-top">
          <span className="eng-tag">{groupName(p.group, lang)}</span>
          <span className="eng-tag">{en ? 'Level' : 'Seviye'} {p.level} · {levelText(level, lang).title}</span>
        </p>
        <h1>{pt.name}</h1>
        {(pt.interface || pt.voltage) && (
          <dl className="eng-meta">
            {pt.interface && <div><dt>{en ? 'Interface' : 'Arayüz'}</dt><dd>{pt.interface}</dd></div>}
            {pt.voltage && <div><dt>{en ? 'Voltage' : 'Gerilim'}</dt><dd>{pt.voltage}</dd></div>}
          </dl>
        )}
      </header>
      <PartViewer slug={p.slug} group={p.group} name={pt.name} lang={lang} />
      </div>

      <div className="part-layout">
        <div className="part-main">
          {dt && (
            <section className="eng-doc" aria-labelledby="p-what">
              <h2 id="p-what">{en ? 'What is it?' : 'Nedir?'}</h2>
              <p>{dt.what}</p>
              <h3>{en ? 'How does it work?' : 'Nasıl çalışır?'}</h3>
              <p>{dt.how}</p>
              <h3>{en ? 'When to choose it' : 'Ne zaman seçilir?'}</h3>
              <p>{dt.choose}</p>
            </section>
          )}
          {kt && href ? (
            <section className="eng-labbox" aria-labelledby="p-lab">
              <h2 id="p-lab">{en ? 'In the lab' : 'Laboratuvarda'}: {kt.title}</h2>
              <p>{kt.watch}</p>
              <Link className="btn btn-primary" href={href} data-testid="eng-open-lab">{en ? 'Open in the lab' : 'Laboratuvarda aç'} <Icon name="arrowRight" size={16} /></Link>
            </section>
          ) : (
            <section className="eng-offbox" aria-labelledby="p-off">
              <h2 id="p-off">{en ? 'Not in the lab yet' : 'Laboratuvarda yok'}</h2>
              <p>{offlineText(p.offline!, lang)}</p>
            </section>
          )}
          {pt.specs.length > 0 && (
            <section aria-labelledby="p-spec"><h2 id="p-spec">{en ? 'Specifications' : 'Özellikler'}</h2><ul className="eng-list eng-specs">{pt.specs.map((s) => <li key={s}>{s}</li>)}</ul></section>
          )}
          {pt.uses.length > 0 && (
            <section aria-labelledby="p-use"><h2 id="p-use">{en ? 'Where it is used' : 'Nerede kullanılır'}</h2><ul className="eng-list">{pt.uses.map((s) => <li key={s}>{s}</li>)}</ul></section>
          )}
          {pt.warnings.length > 0 && (
            <section className="eng-warn" aria-labelledby="p-warn"><h2 id="p-warn">{en ? 'Watch out' : 'Dikkat'}</h2><ul className="eng-list">{pt.warnings.map((s) => <li key={s}>{s}</li>)}</ul></section>
          )}
        </div>
        <aside className="part-side">
          {doc && doc.datasheets.length > 0 && (
            <section className="panel eng-ds" aria-labelledby="p-ds">
              <h2 id="p-ds" className="panel-title">{en ? 'Datasheets and documents' : 'Datasheet ve belgeler'}</h2>
              <ul>
                {doc.datasheets.map((d) => (
                  <li key={d.url}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" data-testid="eng-datasheet">
                      <span className={`eng-ds-kind k-${d.kind}`}>{d.kind === 'datasheet' ? 'PDF' : d.kind === 'product' ? (en ? 'Product' : 'Ürün') : (en ? 'Guide' : 'Rehber')}</span>
                      <span><b>{d.title}</b><small>{d.publisher} ↗</small></span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {rows.length > 0 && (
            <section className="panel" aria-labelledby="p-wire">
              <h2 id="p-wire" className="panel-title">{en ? 'Wiring' : 'Kablolama'}</h2>
              <ol className="eng-wires">{rows.map((r, i) => <li key={i}><code>{r.from}</code><span aria-hidden="true">→</span><code>{r.to}</code></li>)}</ol>
            </section>
          )}
          {siblings.length > 0 && (
            <section className="panel" aria-labelledby="p-sib">
              <h2 id="p-sib" className="panel-title">{en ? 'Same family' : 'Aynı ailede'}</h2>
              <ul className="eng-sib">{siblings.map((s) => <li key={s.slug}><Link href={`/muhendislik/parca/${s.slug}`}>{partText(s, lang).name}</Link>{s.lab && <small>{en ? 'lab' : 'laboratuvar'}</small>}</li>)}</ul>
            </section>
          )}
        </aside>
      </div>
      <p className="eng-source">{en ? 'Source' : 'Kaynak'}: {en ? 'Hyvex Academy electronics series' : 'Hyvex Academy elektronik serisi'} ({p.source.replace('.html', '')}).</p>
    </div>
  )
}
