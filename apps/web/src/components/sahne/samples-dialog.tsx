'use client'
import { SAMPLES, type SahneSample } from '@/lib/sahne/samples'
import { Modal } from './dialogs'

export function SamplesDialog({ onPick, onClose }: { onPick: (s: SahneSample) => void; onClose: () => void }) {
  return (
    <Modal title="Örnek projeler" onClose={onClose} wide testid="sahne-samples-dialog">
      <ul className="sh-ggrid sh-samples">
        {SAMPLES.map((s) => (
          <li key={s.id}>
            <button type="button" className="sh-gcard sh-sample" onClick={() => onPick(s)} data-testid={`sahne-sample-${s.id}`}>
              <span className="sh-gplus" aria-hidden="true">{s.icon}</span><b>{s.name}</b><small>{s.desc}</small>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
