import type { Metadata } from 'next'
import { LabEditor } from '@/components/lab/lab-editor'
import type { Circuit } from '@/lib/lab/contract'

export const metadata: Metadata = { title: 'Laboratuvar' }

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

export default function Laboratuvar() {
  return (
    <div className="container" style={{ maxWidth: 1280 }}>
      <div className="page-head">
        <p className="eyebrow">Serbest çalışma</p>
        <h1>Laboratuvar</h1>
        <p className="muted" style={{ maxWidth: '64ch' }}>
          Sanal Arduino Uno ile devre kur, kodu yaz, derle ve çalıştır. Parçaları paletten tuvale sürükle, pinlerden kablo çek. Çalışman bu tarayıcıda saklanır.
        </p>
      </div>
      <div style={{ paddingBottom: 56 }}>
        <LabEditor initial={START} initialCode={BLINK} storageKey="ask:lab:sandbox" />
      </div>
    </div>
  )
}
