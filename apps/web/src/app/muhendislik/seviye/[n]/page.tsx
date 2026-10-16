import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PartThumb } from '@/components/parts3d/part-thumb'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { LEVELS, groupName, levelOf, levelText, partText, partsOfLevel } from '@/lib/muhendislik/catalog'

export const dynamicParams = false
export const generateStaticParams = () => LEVELS.map((l) => ({ n: String(l.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const l = levelOf(Number((await params).n))
  const en = (await getLocale()) === 'en'
  if (!l) return { title: en ? 'Level' : 'Seviye' }
  return { title: `${en ? 'Level' : 'Seviye'} ${l.n}: ${levelText(l, en ? 'en' : 'tr').title}` }
}

export default async function Seviye({ params }: { params: Promise<{ n: string }> }) {
  const l = levelOf(Number((await params).n))
  if (!l) notFound()
  const en = (await getLocale()) === 'en'
  const lang = en ? 'en' : 'tr'
  const lt = levelText(l, lang)
  const parts = partsOfLevel(l.n)
  const prev = levelOf(l.n - 1), next = levelOf(l.n + 1)
  const lvl = (n: number) => (en ? `Level ${n}` : `Seviye ${n}`)
  return (
    <div className="page eng">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{lvl(l.n)}</span>
      </nav>
      <header className="eng-lv-head">
        <span className="eng-level-n" aria-hidden="true">{String(l.n).padStart(2, '0')}</span>
        <div>
          <p className="eyebrow">{lvl(l.n)} / {LEVELS.length}</p>
          <h1>{lt.title}</h1>
          <p className="lead">{lt.summary}</p>
        </div>
      </header>

      <div className="eng-lv-grid">
        <section className="panel" aria-labelledby="lv-skills">
          <h2 id="lv-skills" className="panel-title">{en ? 'In this level' : 'Bu seviyede'}</h2>
          <ul className="eng-list">{lt.skills.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section className="panel eng-bridge" aria-labelledby="lv-bridge">
          <h2 id="lv-bridge" className="panel-title">{en ? 'The bridge to drones' : 'Drone\'a giden köprü'}</h2>
          <p>{lt.bridge}</p>
        </section>
      </div>

      <section aria-labelledby="lv-parts">
        <h2 id="lv-parts">{en ? 'Parts' : 'Parçalar'} <span className="muted eng-count">{parts.length}</span></h2>
        <ul className="eng-grid">
          {parts.map((p) => {
            const pt = partText(p, lang)
            return (
              <li key={p.slug}>
                <Link href={`/muhendislik/parca/${p.slug}`} className="eng-card" data-testid={`eng-part-${p.slug}`}>
                  <PartThumb slug={p.slug} group={p.group} />
                  <span className="eng-card-top">
                    <span className="eng-tag">{groupName(p.group, lang)}</span>
                    {p.lab ? <span className="eng-tag eng-tag-lab">{en ? 'Lab' : 'Laboratuvar'}</span> : <span className="eng-tag eng-tag-off">{en ? 'Overview' : 'Tanıtım'}</span>}
                  </span>
                  <b>{pt.name}</b>
                  {(pt.interface || pt.voltage) && (
                    <span className="eng-card-spec">{[pt.interface, pt.voltage].filter(Boolean).join(' · ')}</span>
                  )}
                  {pt.uses[0] && <span className="eng-card-use">{pt.uses[0]}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <nav className="eng-pager" aria-label={en ? 'Levels' : 'Seviyeler'}>
        {prev ? <Link href={`/muhendislik/seviye/${prev.n}`}><Icon name="chevronLeft" size={16} /> {lvl(prev.n)}: {levelText(prev, lang).title}</Link> : <span />}
        {next && <Link href={`/muhendislik/seviye/${next.n}`}>{lvl(next.n)}: {levelText(next, lang).title} <Icon name="chevronRight" size={16} /></Link>}
      </nav>
    </div>
  )
}
