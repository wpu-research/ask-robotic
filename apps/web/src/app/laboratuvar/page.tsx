import type { Metadata } from 'next'
import Link from 'next/link'
import { LabEditor } from '@/components/lab/lab-editor'
import { Icon } from '@/components/shell/icons'
import type { Circuit } from '@/lib/lab/contract'
import { kitOf, partBySlug, partText } from '@/lib/muhendislik/catalog'
import { kitText } from '@/lib/muhendislik/kits'
import { SKETCHES } from '@/lib/muhendislik/sketches'
import { courseKitOf } from '@/lib/robotik/kits'
import { getLocale, getT } from '@/i18n/server'
import '../muhendislik/muhendislik.css'

const BLINK = `// LED'i saniyede bir yakıp söndür
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`

const START: Circuit = { parts: [{ id: 'uno', type: 'uno', x: 40, y: 40, rotation: 0, props: {} }], wires: [] }

type Search = Promise<{ parca?: string | string[]; kit?: string | string[] }>
const courseKit = async (sp: Search) => { const k = (await sp).kit; return typeof k === 'string' ? { name: k, kit: courseKitOf(k) } : null }
const engPart = async (sp: Search) => {
  const raw = (await sp).parca
  const p = typeof raw === 'string' ? partBySlug(raw) : undefined
  const kit = p ? kitOf(p) : undefined
  return p && kit ? { p, kit } : null
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const e = await engPart(searchParams)
  const ck = await courseKit(searchParams)
  const t = await getT()
  const lang = (await getLocale()) === 'en' ? 'en' : 'tr'
  return { title: e ? t('lab.page.titleWith', { name: partText(e.p, lang).name }) : ck?.kit ? t('lab.page.titleWith', { name: kitText(ck.kit, lang).title }) : t('lab.page.title') }
}

export default async function Laboratuvar({ searchParams }: { searchParams: Search }) {
  const t = await getT()
  const ck = await courseKit(searchParams)
  if (ck?.kit) {
    const { kit, name } = ck
    const en = (await getLocale()) === 'en'
    return (
      <div className="page page-tool">
        <header className="page-title">
          <nav aria-label={t('lab.page.crumbs')} className="crumbs">
            <Link href="/muhendislik/robotik">ESOF 323</Link><Icon name="chevronRight" size={14} />
            <Link href={`/muhendislik/robotik/hafta/${kit.week}`}>{t('lab.page.week', { n: kit.week })}</Link><Icon name="chevronRight" size={14} />
            <span aria-current="page">{t('lab.page.title')}</span>
          </nav>
          <h1>{en ? kit.en.title : kit.title}</h1>
          <p className="muted eng-lab-watch" data-testid="eng-lab-watch">{en ? kit.en.watch : kit.watch}</p>
        </header>
        <div className="tool-body">
          <LabEditor key={name} initial={kit.circuit()} initialCode={SKETCHES[kit.sketch]} storageKey={`ask:lab:esof:${name}`} />
        </div>
      </div>
    )
  }
  const e = await engPart(searchParams)
  if (e) {
    const { p, kit } = e
    const lang = (await getLocale()) === 'en' ? 'en' : 'tr'
    const pn = partText(p, lang).name, kt = kitText(kit, lang)
    return (
      <div className="page page-tool">
        <header className="page-title">
          <nav aria-label={t('lab.page.crumbs')} className="crumbs">
            <Link href="/muhendislik">{t('lab.page.engPath')}</Link><Icon name="chevronRight" size={14} />
            <Link href={`/muhendislik/parca/${p.slug}`}>{pn}</Link><Icon name="chevronRight" size={14} />
            <span aria-current="page">{t('lab.page.title')}</span>
          </nav>
          <h1>{pn}: {kt.title}</h1>
          <p className="muted eng-lab-watch" data-testid="eng-lab-watch">{kt.watch} {t('lab.page.ready')} <b>{t('lab.page.runHint')}</b>.</p>
        </header>
        <div className="tool-body">
          <LabEditor key={p.slug} initial={kit.circuit(p.lab!.model)} initialCode={SKETCHES[kit.sketch]} storageKey={`ask:lab:muh:${p.slug}`} />
        </div>
      </div>
    )
  }
  return (
    <div className="page page-tool">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.adults')}</p>
        <h1>{t('lab.page.title')}</h1>
        <p className="muted">{t('lab.page.intro')}</p>
      </header>
      <div className="tool-body">
        <LabEditor ai initial={START} initialCode={BLINK} storageKey="ask:lab:sandbox" />
      </div>
    </div>
  )
}
