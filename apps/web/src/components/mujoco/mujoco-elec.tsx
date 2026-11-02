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
import { RobotPartsLibrary } from './robot-parts-library'
import { WorkbenchPortal, useSurfaceHeight } from './workbench-surface'
import { PinConnections } from './pin-connections'

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
  tab: 'parts' | 'circuit' | 'link'
  onTab: (tab: 'parts' | 'circuit' | 'link') => void
  workbenchHost: HTMLElement | null
  onMechanics: () => void
  onPress: (id: string, down: boolean) => void
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

export function MurokoElec({ circuit, onCircuit, plan, onPlan, ranges, channels, labState, editLocked, en, tab, onTab: setTab, workbenchHost, onMechanics, onPress }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const [selection, setSelection] = useState<Selection>(null)
  const [pinMode, setPinMode] = useState(false)
  const { host, height } = useSurfaceHeight()

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
        <button role="tab" aria-selected={tab === 'parts'} className={`mj-tab${tab === 'parts' ? ' on' : ''}`} onClick={() => setTab('parts')} data-testid="mujoco-elec-parts">{L('Elektronik', 'Electronics')}</button>
        <button type="button" className="mj-tab" onClick={onMechanics} data-testid="mujoco-elec-mechanics">{L('Mekanik', 'Mechanics')}</button>
        <button role="tab" aria-selected={tab === 'circuit'} className={`mj-tab${tab === 'circuit' ? ' on' : ''}`} onClick={() => setTab('circuit')} data-testid="mujoco-elec-circuit">{L('Devre', 'Circuit')}</button>
        <button role="tab" aria-selected={tab === 'link'} className={`mj-tab${tab === 'link' ? ' on' : ''}`} onClick={() => setTab('link')} data-testid="mujoco-elec-link">
          {L('Bağlantı', 'Link')}{linked > 0 && <span className="mj-badge">{linked}</span>}
        </button>
      </div>

      {tab === 'parts' && <RobotPartsLibrary types={ROBOT_PARTS} disabled={editLocked} onAdd={(type) => { add(type); setTab('circuit') }} en={en} />}

      {tab === 'circuit' && (
        <>
        <div className="mj-bar"><button className={`mj-qbtn${!pinMode ? ' on' : ''}`} onClick={() => setPinMode(false)}>{L('Çalışma alanı', 'Workbench')}</button><button className={`mj-qbtn${pinMode ? ' on' : ''}`} onClick={() => setPinMode(true)}>{L('Pin seç', 'Pick a pin')}</button></div>
        {pinMode ? <PinConnections circuit={circuit} onCircuit={onCircuit} disabled={editLocked} en={en} /> : <p className="muted">{L('Kartlar ve parçalar ana çalışma alanında gösterilir. Pinler arasında sürükleyerek kablo çek; parçaları sürükleyerek yerleştir.', 'Boards and parts appear in the main workspace. Drag between pins to wire them; drag parts to position them.')}</p>}
        <WorkbenchPortal target={workbenchHost}>
        <div className="mj-circuit-workspace">
          <PartPicker types={ROBOT_PARTS} disabled={editLocked} onAdd={add} onDrop={(type) => add(type)} />
          <div className="mj-elec-canvas" ref={host}>
            <LabCanvas
              circuit={circuit} onChange={onCircuit} lockedIds={locked} editLocked={editLocked}
              runtime={labState} selection={selection} onSelect={setSelection} warnParts={warnParts}
              onPress={onPress} height={height}
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
        </WorkbenchPortal>
        </>
      )}

      {tab === 'link' && (
        <WiringPanel circuit={circuit} plan={plan} onPlan={onPlan} ranges={ranges} channels={channels} en={en} />
      )}
    </>
  )
}
