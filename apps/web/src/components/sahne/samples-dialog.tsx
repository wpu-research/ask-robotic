'use client'
import { SAMPLES, type SahneSample } from '@/lib/sahne/samples'
import { Modal } from './dialogs'
import { useLocale, useT } from '@/i18n/client'

export function SamplesDialog({ onPick, onClose }: { onPick: (s: SahneSample) => void; onClose: () => void }) {
  const t = useT()
  const en = useLocale() === 'en'
  return (
    <Modal title={t('studios.sahne.gallery.samples')} onClose={onClose} wide testid="sahne-samples-dialog">
      <ul className="sh-ggrid sh-samples">
        {SAMPLES.map((s) => (
          <li key={s.id}>
            <button type="button" className="sh-gcard sh-sample" onClick={() => onPick(s)} data-testid={`sahne-sample-${s.id}`}>
              <span className="sh-gplus" aria-hidden="true">{s.icon}</span><b>{en ? s.nameEn : s.name}</b><small>{en ? s.descEn : s.desc}</small>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
