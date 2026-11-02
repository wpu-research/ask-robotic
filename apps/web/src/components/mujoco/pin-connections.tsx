'use client'

import { useState } from 'react'
import { PINS, type Circuit, type PinRef } from '@/lib/lab/contract'
import { addWire } from '@/lib/lab/ops'

export function PinConnections({ circuit, onCircuit, disabled, en }: { circuit: Circuit; onCircuit: (circuit: Circuit) => void; disabled: boolean; en: boolean }) {
  const [from, setFrom] = useState<PinRef | null>(null)
  const [failed, setFailed] = useState(false)
  const pick = (pin: PinRef) => {
    if (!from) { setFrom(pin); setFailed(false); return }
    if (from.part === pin.part && from.pin === pin.pin) { setFrom(null); return }
    const added = addWire(circuit, from, pin)
    if (added) { onCircuit(added.circuit); setFrom(null); setFailed(false) } else { setFailed(true); setFrom(null) }
  }
  return <div className="mj-pinlist" data-testid="mujoco-pin-connections">
    <p className="muted" role="status">{from ? `${from.part}.${from.pin} → ${en ? 'pick the other pin' : 'diğer pini seç'}` : en ? 'Pick two pins to create a wire.' : 'Kablo oluşturmak için iki pin seç.'}</p>
    {failed && <p className="mj-warns" role="status">{en ? 'This wire already exists or its endpoints are invalid.' : 'Bu kablo zaten var veya uçları geçersiz.'}</p>}
    {circuit.parts.map((part) => <details key={part.id} open className="mj-pin-part">
      <summary>{part.id} <small>{part.type}</small></summary>
      <div className="mj-pin-grid">{PINS[part.type].map((pin) => {
        const active = from?.part === part.id && from.pin === pin
        const count = circuit.wires.filter((wire) => (wire.a.part === part.id && wire.a.pin === pin) || (wire.b.part === part.id && wire.b.pin === pin)).length
        return <button type="button" key={pin} disabled={disabled} aria-pressed={active} className={`mj-pin${active ? ' on' : ''}`} data-kind={pin.startsWith('GND') ? 'ground' : ['5V', '3V3', 'VIN', 'VCC'].includes(pin) ? 'power' : 'signal'} onClick={() => pick({ part: part.id, pin })} data-testid={`mujoco-pin-${part.id}-${pin}`}><i aria-hidden="true" />{pin}{count > 0 && <small>{count}</small>}</button>
      })}</div>
    </details>)}
  </div>
}
