'use client'
// MuRoKo'nun ELEK rafı: devre tuvali (laboratuvarla aynı bileşen) ve MuJoCo robotuna
// bağlantı eşlemesi. Devrenin kendisi `components/lab/*`'ten gelir; burada yalnız
// robot tarafına bakan kısım yazılır.
import { useMemo, useState } from 'react'
import { LabCanvas, type Selection } from '@/components/lab/canvas'
import { PartPicker } from '@/components/lab/part-picker'
import { type Circuit, type LabState, type PartType } from '@/lib/lab/contract'
import { addPart } from '@/lib/lab/ops'
import { type CtrlRange, type WiringPlan } from '@/lib/mujoco/wiring'
import { WiringPanel } from './wiring-panel'

/** Robot kurarken işe yarayan parçalar; tam katalog laboratuvarda. */
export const ROBOT_PARTS: PartType[] = [
  'uno', 'servo', 'dcmotor', 'l293d', 'l298n', 'drv8833', 'tb6612',
  'hcsr04', 'sharpir', 'irobstacle', 'mpu6050', 'encoder',
  'led', 'resistor', 'button', 'pot', 'buzzer', 'battery',
]

/** Boş başlangıç: yalnız kart. Öğrenci üstüne kurar. */
export function starterCircuit(): Circuit {
  return addPart({ parts: [], wires: [] }, 'uno', 180, 150).circuit
}

interface Props {
  circuit: Circuit
  onCircuit: (c: Circuit) => void
  plan: WiringPlan
  onPlan: (p: WiringPlan) => void
  /** MuJoCo motorlarının adları ve kontrol aralıkları. */
  ranges: CtrlRange[]
  /** MuJoCo sensör kanalı adları. */
  channels: string[]
  /** Devre çalışıyorsa canlı durum (tuval ışıkları, uyarılar). */
  labState: LabState | null
  /** Benzetim sürerken kablo düzenlemesi kilitlenir. */
  editLocked: boolean
  en: boolean
}

export function MurokoElec({ circuit, onCircuit, plan, onPlan, ranges, channels, labState, editLocked, en }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const [tab, setTab] = useState<'circuit' | 'link'>('circuit')
  const [selection, setSelection] = useState<Selection>(null)

  const locked = useMemo(() => new Set(circuit.parts.filter((p) => p.type === 'uno').map((p) => p.id)), [circuit])
  const warnParts = useMemo(
    () => new Set((labState?.warnings ?? []).map((w) => w.partId).filter((x): x is string => !!x)),
    [labState],
  )
  const add = (type: PartType) => onCircuit(addPart(circuit, type, 120 + Math.random() * 160, 110 + Math.random() * 140).circuit)

  const linked = plan.motors.length

  return (
    <>
      <div className="mj-tabs" role="tablist" aria-label={L('Elektronik', 'Electronics')}>
        <button role="tab" aria-selected={tab === 'circuit'} className={`mj-tab${tab === 'circuit' ? ' on' : ''}`} onClick={() => setTab('circuit')} data-testid="mujoco-elec-circuit">{L('Devre', 'Circuit')}</button>
        <button role="tab" aria-selected={tab === 'link'} className={`mj-tab${tab === 'link' ? ' on' : ''}`} onClick={() => setTab('link')} data-testid="mujoco-elec-link">
          {L('Bağlantı', 'Link')}{linked > 0 && <span className="mj-badge">{linked}</span>}
        </button>
      </div>

      {tab === 'circuit' && (
        <div className="mj-panel">
          <PartPicker types={ROBOT_PARTS} disabled={editLocked} onAdd={add} onDrop={(type) => add(type)} />
          <div className="mj-elec-canvas">
            <LabCanvas
              circuit={circuit} onChange={onCircuit} lockedIds={locked} editLocked={editLocked}
              runtime={labState} selection={selection} onSelect={setSelection} warnParts={warnParts}
              onPress={() => {}} height={300}
            />
          </div>
          <p className="muted">{L(
            'Parçayı tuvale bırak, sonra bir pinden diğerine sürükleyerek kabloyu çek. Kabloların doğruysa robot hareket eder.',
            'Drop a part on the canvas, then drag from one pin to another to run a wire. Get the wiring right and the robot moves.')}</p>
          {(labState?.warnings?.length ?? 0) > 0 && (
            <ul className="mj-warns" data-testid="mujoco-elec-warnings">
              {labState!.warnings.slice(0, 5).map((w, i) => <li key={i}>⚠ {w.message}</li>)}
            </ul>
          )}
        </div>
      )}

      {tab === 'link' && (
        <WiringPanel circuit={circuit} plan={plan} onPlan={onPlan} ranges={ranges} channels={channels} en={en} />
      )}
    </>
  )
}
