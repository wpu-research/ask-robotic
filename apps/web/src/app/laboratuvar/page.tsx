import type { Metadata } from 'next'
import Link from 'next/link'
import { LabEditor } from '@/components/lab/lab-editor'
import { Icon } from '@/components/shell/icons'
import type { Circuit } from '@/lib/lab/contract'
import { kitOf, partBySlug } from '@/lib/muhendislik/catalog'
import { SKETCHES } from '@/lib/muhendislik/sketches'
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

type Search = Promise<{ parca?: string | string[] }>
const engPart = async (sp: Search) => {
  const raw = (await sp).parca
  const p = typeof raw === 'string' ? partBySlug(raw) : undefined
  const kit = p ? kitOf(p) : undefined
  return p && kit ? { p, kit } : null
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const e = await engPart(searchParams)
  return { title: e ? `Laboratuvar: ${e.p.name}` : 'Laboratuvar' }
}

export default async function Laboratuvar({ searchParams }: { searchParams: Search }) {
  const e = await engPart(searchParams)
  if (e) {
    const { p, kit } = e
    return (
      <div className="page page-tool">
        <header className="page-title">
          <nav aria-label="Konum" className="crumbs">
            <Link href="/muhendislik">Mühendislik yolu</Link><Icon name="chevronRight" size={14} />
            <Link href={`/muhendislik/parca/${p.slug}`}>{p.name}</Link><Icon name="chevronRight" size={14} />
            <span aria-current="page">Laboratuvar</span>
          </nav>
          <h1>{p.name}: {kit.title}</h1>
          <p className="muted eng-lab-watch" data-testid="eng-lab-watch">{kit.watch} Devre ve kod hazır: <b>Derle ve çalıştır</b>.</p>
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
        <h1>Laboratuvar</h1>
        <p className="muted">
          Sanal Arduino Uno ile devre kur, kodu yaz, derle ve çalıştır. Parçaları paletten tuvale sürükle, pinlerden kablo çek. Çalışman bu tarayıcıda saklanır.
        </p>
      </header>
      <div className="tool-body">
        <LabEditor initial={START} initialCode={BLINK} storageKey="ask:lab:sandbox" />
      </div>
    </div>
  )
}
