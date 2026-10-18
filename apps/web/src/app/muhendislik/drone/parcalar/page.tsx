import type { Metadata } from 'next'
import Link from 'next/link'
import { DRONE_SIM_META } from '@/components/drone/sim-meta'
import { PartThumb } from '@/components/parts3d/part-thumb'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { DRONE_COURSE, UNITS } from '@/lib/drone/course'
import { DRONE_GROUPS, DRONE_PARTS, type DroneGroup } from '@/lib/drone/parts'
import { labHref, partBySlug, partText, type EngPart } from '@/lib/muhendislik/catalog'

export const metadata: Metadata = { title: 'Drone parçaları', description: 'Bir multirotorun 15 bileşeni: gövde, fırçasız motor, ESC, pervane, LiPo, PDB/BEC, uçuş kontrolcüsü, IMU, barometre, pusula, GPS, alıcı, telemetri, kamera, mesafe sensörü.' }

export default async function DroneParcalar() {
  const lang = await getLocale()
  const en = lang === 'en'
  const groups = Object.keys(DRONE_GROUPS) as DroneGroup[]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/drone">{DRONE_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Parts' : 'Parçalar'}</span>
      </nav>
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'Pillar 1 · parts' : '1. ayak · parça'}</p>
        <h1>{en ? 'What a drone is made of' : 'Drone neyden yapılır'}</h1>
        <p className="lead">{en ? 'Fifteen components of a multirotor, with the numbers that matter when choosing them. Figures are typical ranges; the manufacturer\'s datasheet always comes first. Where a matching Hyvex part exists you can turn its 3D model and open it in the circuit lab.' : 'Bir multirotorun on beş bileşeni ve seçerken önemli olan sayılar. Değerler tipik aralıklardır; üreticinin veri sayfası her zaman önce gelir. Karşılığı olan Hyvex parçasının 3B modelini döndürebilir, devre laboratuvarında açabilirsin.'}</p>
        <nav aria-label={en ? 'Parts' : 'Parçalar'}>
          <ul className="eng-chips">{DRONE_PARTS.map((p) => <li key={p.key}><a className="eng-chip" href={`#${p.key}`}>{p[lang].name}</a></li>)}</ul>
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g} aria-labelledby={`dr-g-${g}`}>
          <h2 id={`dr-g-${g}`}>{DRONE_GROUPS[g][lang]}</h2>
          <div className="dr-parts">
            {DRONE_PARTS.filter((p) => p.group === g).map((p) => {
              const t = p[lang]
              const hy = p.hyvex.map(partBySlug).filter((x): x is EngPart => !!x)
              const units = UNITS.filter((u) => u.parts.includes(p.key))
              return (
                <article key={p.key} id={p.key} className="dr-part" data-testid={`drone-part-${p.key}`}>
                  <h3>{t.name}</h3>
                  <p className="dr-part-role">{t.role}</p>
                  <div className="dr-part-grid">
                    <div>
                      <p>{t.body}</p>
                      <p className="dr-choose"><b>{en ? 'How to choose: ' : 'Nasıl seçilir: '}</b>{t.choose}</p>
                    </div>
                    <ul className="dr-specs" aria-label={en ? 'Typical values' : 'Tipik değerler'}>{t.specs.map((s) => <li key={s}>{s}</li>)}</ul>
                  </div>
                  {hy.length > 0 && (
                    <div className="dr-thumbs">
                      {hy.map((h) => (
                        <Link key={h.slug} href={`/muhendislik/parca/${h.slug}`}><PartThumb slug={h.slug} group={h.group} />{partText(h, lang).name}</Link>
                      ))}
                    </div>
                  )}
                  <div className="dr-links">
                    {units.map((u) => <Link key={u.n} className="eng-chip" href={`/muhendislik/drone/unite/${u.n}`}>{en ? `Unit ${u.n}` : `${u.n}. ünite`}</Link>)}
                    {p.sim && <Link className="eng-chip" href={`/muhendislik/drone/simulasyon#sim-${p.sim}`}>{en ? 'Simulation' : 'Simülasyon'}: {DRONE_SIM_META[p.sim][lang].title}</Link>}
                    {hy.filter((h) => h.lab).map((h) => <Link key={h.slug} className="eng-chip" href={labHref(h)!}>{en ? 'Lab' : 'Laboratuvar'}: {partText(h, lang).name}</Link>)}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
