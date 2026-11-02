'use client'

import { ASSEMBLY_PARTS, addAssembly, canMount, removeAssembly, updateAssembly, type AssemblyNode, type AssemblyType } from '@/lib/mikro/assembly'
import { defaultGovde, normalizeGovde } from '@/lib/mikro/govde'
import type { RobotDesign } from '@/lib/mikro/tasarim'

interface Props {
  design: RobotDesign
  onDesign: (design: RobotDesign) => void
  selected: string | null
  onSelect: (id: string | null) => void
  onExample: () => void
  onPreview: (id: string, degrees: number) => void
  issues: string[]
  angle: number
  en: boolean
}

export function AssemblyPanel({ design, onDesign, selected, onSelect, onExample, onPreview, issues, angle, en }: Props) {
  const text = (tr: string, english: string) => en ? english : tr
  const nodes = design.assembly ?? []
  const current = nodes.find((node) => node.id === selected)
  const label = (node: AssemblyNode) => `${ASSEMBLY_PARTS[node.type][en ? 'en' : 'tr']} · ${node.id}`
  const change = (patch: Partial<Omit<AssemblyNode, 'id' | 'type'>>) => {
    if (current) onDesign({ ...design, assembly: updateAssembly(nodes, current.id, patch) })
  }
  const add = (type: AssemblyType) => {
    const needsBoard = (type === 'servo' || type === 'hcsr04') && !nodes.some((node) => node.type === 'uno')
    if (nodes.length + (needsBoard ? 2 : 1) > 24) return
    const body = normalizeGovde(design.govde) ?? defaultGovde(design.chassis)
    const baseZ = Math.max(0.003, ...body.blocks.filter((block) => !block.cut).map((block) => block.pos[2] + block.size[2])) + 0.002
    const base = needsBoard ? addAssembly(nodes, 'uno', null, baseZ) : nodes
    const next = addAssembly(base, type, type === 'uno' ? null : current?.id ?? null, baseZ)
    onDesign({ ...design, assembly: next })
    onSelect(next.at(-1)?.id ?? null)
  }
  const depth = (node: AssemblyNode) => {
    let level = 0
    let parent = node.parent
    while (parent) { level++; parent = nodes.find((candidate) => candidate.id === parent)?.parent ?? null }
    return level
  }
  return (
    <div className="mj-panel mj-assembly" data-testid="mujoco-assembly">
      <p className="muted">{text('Parçaları 3B robotuna tak. Servo üzerine bağladığın platform ve sensörler onunla birlikte döner. Devre karşılıkları ve pin bağlantıları otomatik kurulur.', 'Mount parts on your 3D robot. Platforms and sensors attached to a servo rotate with it. Circuit parts and pin connections are created automatically.')}</p>
      <div className="mj-assembly-catalog">
        {(Object.keys(ASSEMBLY_PARTS) as AssemblyType[]).map((type) => (
          <button type="button" className="mj-qbtn" key={type} data-testid={`mujoco-assembly-add-${type}`}
            disabled={nodes.length >= 24 || (type === 'uno' && nodes.some((node) => node.type === 'uno')) || ((type === 'servo' || type === 'hcsr04') && !nodes.some((node) => node.type === 'uno') && nodes.length >= 23)}
            onClick={() => add(type)}><span aria-hidden="true">＋</span>{ASSEMBLY_PARTS[type][en ? 'en' : 'tr']}</button>
        ))}
      </div>
      <span className="mj-group-label">{text('MONTAJ AĞACI', 'ASSEMBLY TREE')} · {nodes.length}/24</span>
      <div className="mj-assembly-tree" role="group" aria-label={text('Montaj parçaları', 'Assembly parts')}>
        <button type="button" className={`mj-qbtn${selected === null ? ' on' : ''}`} aria-pressed={selected === null} onClick={() => onSelect(null)}>{text('Gövde / yeni kök parça', 'Chassis / new root part')}</button>
        {nodes.map((node) => (
          <button type="button" key={node.id} className={`mj-qbtn${node.id === selected ? ' on' : ''}`} aria-pressed={node.id === selected}
            style={{ paddingInlineStart: `${12 + Math.min(depth(node), 5) * 12}px` }} onClick={() => onSelect(node.id)} data-testid={`mujoco-assembly-node-${node.id}`}>
            <span aria-hidden="true">{node.parent ? '↳' : '◇'}</span>{label(node)}
          </button>
        ))}
      </div>
      {current && <div className="mj-assembly-editor" data-testid="mujoco-assembly-editor">
        <h4>{label(current)}</h4>
        {current.type === 'esp32' && <p className="mj-warns" role="status">{text('ESP32 şu an yalnız 3B montaj modelidir. Kod çalıştırma ve devre emülasyonu Uno içindir.', 'ESP32 is currently a 3D assembly model only. Code execution and circuit emulation target Uno.')}</p>}
        <label className="mj-assembly-field">{text('Bağlandığı parça', 'Mount on')}
          <select value={current.parent ?? ''} data-testid="mujoco-assembly-parent" onChange={(event) => change({ parent: event.target.value || null, pos: [0, 0, 0] })}>
            <option value="">{text('Gövde', 'Chassis')}</option>
            {nodes.filter((node) => node.id !== current.id && canMount(nodes, current.id, node.id)).map((node) => <option value={node.id} key={node.id}>{label(node)}</option>)}
          </select>
        </label>
        <p className="muted">{text('Konum, bağlı parçanın montaj noktasına göredir. Birim: mm.', 'Position is relative to the parent mounting point. Unit: mm.')}</p>
        <div className="mj-cad-nums">
          {(['x', 'y', 'z'] as const).map((axis, index) => <label className="mj-cad-num" key={axis}>{axis.toUpperCase()}
            <input type="number" min={-1000} max={1000} step={1} value={Math.round(current.pos[index] * 1000)} data-testid={`mujoco-assembly-${axis}`}
              onChange={(event) => { const pos: AssemblyNode['pos'] = [...current.pos]; pos[index] = Number(event.target.value) / 1000; change({ pos }) }} />
          </label>)}
          <label className="mj-cad-num">{text('Dönüş °', 'Yaw °')}<input type="number" min={-360} max={360} value={current.yaw} data-testid="mujoco-assembly-yaw" onChange={(event) => change({ yaw: Number(event.target.value) })} /></label>
        </div>
        {current.type === 'servo' && <>
          <label className="mj-assembly-field">{text('Eklem ekseni', 'Joint axis')}
            <select value={current.axis} data-testid="mujoco-assembly-axis" onChange={(event) => change({ axis: event.target.value as AssemblyNode['axis'] })}>
              <option value="z">Z · {text('Döner platform', 'Turntable')}</option><option value="y">Y · {text('Eğim', 'Tilt')}</option><option value="x">X · {text('Yana eğim', 'Roll')}</option>
            </select>
          </label>
          <div className="mj-cad-nums">
            <label className="mj-cad-num">{text('Alt sınır °', 'Min °')}<input type="number" min={-180} max={0} value={current.limits[0]} onChange={(event) => change({ limits: [Number(event.target.value), current.limits[1]] })} /></label>
            <label className="mj-cad-num">{text('Üst sınır °', 'Max °')}<input type="number" min={0} max={180} value={current.limits[1]} onChange={(event) => change({ limits: [current.limits[0], Number(event.target.value)] })} /></label>
          </div>
          <label className="mj-assembly-field">{text('Eklemi dene', 'Preview joint')} · {Math.round(angle)}°
            <input type="range" min={current.limits[0]} max={current.limits[1]} defaultValue={0} key={`${current.id}:${current.limits.join(':')}`} step={1} data-testid="mujoco-assembly-preview" onChange={(event) => onPreview(current.id, Number(event.target.value))} />
          </label>
        </>}
        <button type="button" className="mj-qbtn" data-testid="mujoco-assembly-remove" onClick={() => { onDesign({ ...design, assembly: removeAssembly(nodes, current.id) }); onSelect(null) }}>{text('Parçayı ve alt montajları sil', 'Delete part and attached children')}</button>
      </div>}
      {issues.length > 0 && <p className="mj-warns" role="status">{text('Sinyal bağlantısı eksik veya boş dijital pin kalmadı:', 'Signal connection missing or no free digital pins:')} {issues.join(', ')}</p>}
      {nodes.some((node) => node.type === 'servo' || node.type === 'hcsr04') && <button type="button" className="sbtn" disabled={issues.length > 0} onClick={onExample} data-testid="mujoco-assembly-example">{text('Bağlantılarıma göre örnek kod aç', 'Open example code for my wiring')}</button>}
      <p className="muted">{text('Montaj bileşenleri basitleştirilmiş fizik modelleridir; ölçüler ve pin bağlantıları eğitim amaçlıdır.', 'Assembly components use simplified physics models; dimensions and pin connections are for learning.')}</p>
    </div>
  )
}
