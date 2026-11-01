'use client'
// MuRoKo'nun CAD rafı: robotu bu ekranda tasarlarsın ve çizdiğin an aynı ekranda
// simülasyona düşer. Ayrı bir tasarım sayfasına gidip gelmek gerekmez.
//
// Izgara görünümü ve yerleştirme kuralları var olan tasarım tezgâhından gelir
// (components/mikro/tasarim-3d.tsx, lib/mikro/tasarim.ts); burada yalnız tezgâha
// sığacak derli toplu bir arayüz kurulur.
import { useMemo, useState } from 'react'
import { Tasarim3D } from '@/components/mikro/tasarim-3d'
import {
  CHASSIS, CHASSIS_IDS, PARTS, PART_GROUPS, canPlace, deriveDesign, placePart,
  removePart, rotatePart, setChassis, type ChassisId, type PartType, type RobotDesign,
} from '@/lib/mikro/tasarim'
import {
  addBlock, defaultGovde, duplicateBlock, govdeIssues, govdeMassG, normalizeGovde,
  removeBlock, updateBlock, type BlockShape, type Govde,
} from '@/lib/mikro/govde'

interface Props {
  design: RobotDesign
  onDesign: (d: RobotDesign) => void
  en: boolean
}

export function MurokoCad({ design, onDesign, en }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const [tab, setTab] = useState<'govde' | 'parca'>('govde')
  const [tool, setTool] = useState<PartType | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [block, setBlock] = useState<string | null>(null)

  const cadTabs = (
    <div className="mj-tabs" role="tablist" aria-label={L('Tasarım', 'Design')}>
      <button role="tab" aria-selected={tab === 'govde'} className={`mj-tab${tab === 'govde' ? ' on' : ''}`} onClick={() => setTab('govde')} data-testid="mujoco-cad-tab-body">{L('Gövde', 'Body')}</button>
      <button role="tab" aria-selected={tab === 'parca'} className={`mj-tab${tab === 'parca' ? ' on' : ''}`} onClick={() => setTab('parca')} data-testid="mujoco-cad-tab-parts">{L('Parçalar', 'Parts')}</button>
    </div>
  )
  const der = useMemo(() => deriveDesign(design), [design])
  const errors = der.issues.filter((i) => i.level === 'hata')
  const warns = der.issues.filter((i) => i.level === 'uyari')

  /** Hücreye tıklama: seçili araç varsa yerleştir, yoksa oradaki parçayı seç. */
  const onCell = (c: number, r: number) => {
    const hit = design.parts.find((p) => p.c === c && p.r === r)
    if (tool) {
      if (canPlace(design, tool, c, r).ok) onDesign(placePart(design, tool, c, r, { autoMotor: true }))
      return
    }
    setSelected(hit ? hit.id : null)
  }
  const canDrop = (c: number, r: number) => (tool ? canPlace(design, tool, c, r).ok : false)

  const sel = design.parts.find((p) => p.id === selected) ?? null

  const govde = useMemo(() => normalizeGovde(design.govde) ?? defaultGovde(design.chassis), [design.govde, design.chassis])
  const gIssues = useMemo(() => govdeIssues(govde), [govde])
  const setGovde = (g: Govde) => onDesign({ ...design, govde: g })
  const bsel = govde.blocks.find((b) => b.id === block) ?? null

  /** Sayısal alan: milimetre girilir, metre saklanır — çocuk için mm daha okunur. */
  const mmField = (label: string, value: number, on: (m: number) => void, step = 1) => (
    <label className="mj-cad-num">{label}
      <input type="number" value={Math.round(value * 1000)} step={step}
        onChange={(e) => on(Number(e.target.value) / 1000)} />
    </label>
  )

  if (tab === 'govde') {
    return (
      <>
        {cadTabs}
        <p className="mj-note">{L(
          'Gövdeyi tezgâhın kendisinde görüyorsun: blok ekleyip ölçü değiştirdiğinde robot anında yeniden kurulur.',
          'You see the body on the bench itself: add a block or change a size and the robot is rebuilt at once.')}</p>
        <p className="muted">{L(
          'Gövde blokların birleşimidir. MuJoCo çarpışma geometrisi dışbükey olmak zorunda olduğundan, delikli ya da L biçimli bir gövde birden çok blokla kurulur — fizik de tam olarak çizdiğin şekle göre çalışır.',
          'The body is a union of blocks. MuJoCo collision geometry must be convex, so a hollow or L-shaped body is built from several blocks — and the physics matches exactly what you drew.')}</p>

        <div className="mj-bar">
          {(['kutu', 'silindir', 'kure'] as BlockShape[]).map((s) => (
            <button key={s} className="sbtn ghost" onClick={() => setGovde(addBlock(govde, s))} data-testid={`mujoco-cad-add-${s}`}>
              + {s === 'kutu' ? L('Kutu', 'Box') : s === 'silindir' ? L('Silindir', 'Cylinder') : L('Küre', 'Sphere')}
            </button>
          ))}
        </div>

        <ul className="mj-cad-blocks">
          {govde.blocks.map((b) => (
            <li key={b.id} className={b.id === block ? 'on' : ''}>
              <button className="mj-cad-bsel" onClick={() => setBlock(b.id === block ? null : b.id)} data-testid={`mujoco-cad-block-${b.id}`}>
                <i style={{ background: b.color }} aria-hidden="true" />
                {b.id} · {b.shape === 'kutu' ? L('kutu', 'box') : b.shape === 'silindir' ? L('silindir', 'cylinder') : L('küre', 'sphere')}
              </button>
            </li>
          ))}
        </ul>

        {bsel && (
          <div className="mj-cad-block-edit" data-testid="mujoco-cad-block-edit">
            <span className="mj-group-label">{L('Konum (mm)', 'Position (mm)')}</span>
            <div className="mj-cad-nums">
              {mmField(L('ileri', 'fwd'), bsel.pos[0], (m) => setGovde(updateBlock(govde, bsel.id, { pos: [m, bsel.pos[1], bsel.pos[2]] })))}
              {mmField(L('yan', 'side'), bsel.pos[1], (m) => setGovde(updateBlock(govde, bsel.id, { pos: [bsel.pos[0], m, bsel.pos[2]] })))}
              {mmField(L('yük.', 'up'), bsel.pos[2], (m) => setGovde(updateBlock(govde, bsel.id, { pos: [bsel.pos[0], bsel.pos[1], m] })))}
            </div>
            <span className="mj-group-label">{bsel.shape === 'kure' ? L('Yarıçap (mm)', 'Radius (mm)') : L('Yarı boyut (mm)', 'Half size (mm)')}</span>
            <div className="mj-cad-nums">
              {mmField(bsel.shape === 'kutu' ? L('en', 'x') : L('yarıçap', 'radius'), bsel.size[0], (m) => setGovde(updateBlock(govde, bsel.id, { size: [m, bsel.shape === 'kutu' ? bsel.size[1] : m, bsel.size[2]] })))}
              {bsel.shape === 'kutu' && mmField(L('boy', 'y'), bsel.size[1], (m) => setGovde(updateBlock(govde, bsel.id, { size: [bsel.size[0], m, bsel.size[2]] })))}
              {bsel.shape !== 'kure' && mmField(L('kalınlık', 'thick'), bsel.size[2], (m) => setGovde(updateBlock(govde, bsel.id, { size: [bsel.size[0], bsel.size[1], m] })))}
            </div>
            <div className="mj-bar">
              {bsel.shape !== 'kure' && (
                <label className="mj-cad-num">{L('Açı', 'Yaw')}
                  <input type="number" value={Math.round(bsel.yaw)} step={15} onChange={(e) => setGovde(updateBlock(govde, bsel.id, { yaw: Number(e.target.value) }))} />
                </label>
              )}
              <input type="color" value={bsel.color} aria-label={L('Renk', 'Colour')} onChange={(e) => setGovde(updateBlock(govde, bsel.id, { color: e.target.value }))} />
              <button className="sbtn ghost" onClick={() => setGovde(duplicateBlock(govde, bsel.id))}>⧉ {L('Kopyala', 'Duplicate')}</button>
              <button className="sbtn ghost" disabled={govde.blocks.length <= 1}
                onClick={() => { setGovde(removeBlock(govde, bsel.id)); setBlock(null) }}>🗑 {L('Sil', 'Delete')}</button>
            </div>
          </div>
        )}

        <ul className="mj-cad-stats">
          <li><span>{L('Blok', 'Blocks')}</span><b>{govde.blocks.length}</b></li>
          <li><span>{L('Gövde kütlesi', 'Body mass')}</span><b>{govdeMassG(govde)} g</b></li>
        </ul>

        {gIssues.length > 0 && (
          <ul className="mj-warns" data-testid="mujoco-cad-body-issues">
            {gIssues.map((i, k) => <li key={k}>{i.level === 'hata' ? '⛔' : '⚠'} {en ? i.en : i.tr}</li>)}
          </ul>
        )}
      </>
    )
  }

  return (
    <>
      {cadTabs}
      <div className="mj-bar">
        <label className="mj-cad-chassis">{L('Şasi', 'Chassis')}
          <select value={design.chassis} onChange={(e) => onDesign(setChassis(design, e.target.value as ChassisId))} data-testid="mujoco-cad-chassis">
            {CHASSIS_IDS.map((id) => <option key={id} value={id}>{en ? CHASSIS[id].en : CHASSIS[id].title}</option>)}
          </select>
        </label>
        <input className="mj-cad-name" value={design.name} maxLength={40} aria-label={L('Robotun adı', 'Robot name')}
          placeholder={L('Robotun adı', 'Robot name')} onChange={(e) => onDesign({ ...design, name: e.target.value })} />
      </div>

      <div className="mj-cad-stage">
        <Tasarim3D design={design} selectedId={selected} showCones onCell={onCell} canDrop={canDrop}
          label={L('Robot tasarım ızgarası', 'Robot design grid')} />
      </div>

      <p className="muted">{tool
        ? L('Bir hücreye tıkla: parça oraya takılır. Bırakmak için aracı kapat.', 'Click a cell to fit the part. Close the tool to stop placing.')
        : L('Soldan bir parça seç, sonra ızgaraya tıkla. Takılı parçaya tıklayınca seçilir.', 'Pick a part below, then click the grid. Click a fitted part to select it.')}</p>

      {/* Parça paleti */}
      {PART_GROUPS.map((g) => (
        <div key={g.id} className="mj-group">
          <span className="mj-group-label">{en ? g.en : g.title}</span>
          <div className="mj-cad-parts">
            {(Object.keys(PARTS) as PartType[]).filter((t) => PARTS[t].group === g.id).map((t) => (
              <button key={t} className={`mj-cad-part${tool === t ? ' on' : ''}`} aria-pressed={tool === t}
                onClick={() => setTool((x) => (x === t ? null : t))} title={en ? PARTS[t].tipEn : PARTS[t].tip}
                data-testid={`mujoco-cad-part-${t}`}>
                <i style={{ background: PARTS[t].color }} aria-hidden="true" />
                {en ? PARTS[t].en : PARTS[t].title}
              </button>
            ))}
          </div>
        </div>
      ))}

      {sel && (
        <div className="mj-bar mj-cad-sel">
          <b>{en ? PARTS[sel.type].en : PARTS[sel.type].title}</b>
          <button className="sbtn ghost" onClick={() => onDesign(rotatePart(design, sel.id))}>⟳ {L('Çevir', 'Rotate')}</button>
          <button className="sbtn ghost" onClick={() => { onDesign(removePart(design, sel.id)); setSelected(null) }}>🗑 {L('Çıkar', 'Remove')}</button>
        </div>
      )}

      {/* Tasarımın gerçek sonuçları: bunlar simülasyona aynen gider */}
      <h4 className="mj-link-h">{L('Tasarımın sonuçları', 'What your design weighs')}</h4>
      <ul className="mj-cad-stats">
        <li><span>{L('Kütle', 'Mass')}</span><b>{der.massG} g</b></li>
        <li><span>{L('Sürüş motoru', 'Drive motors')}</span><b>{der.driveMotors}</b></li>
        <li><span>{L('Pil', 'Battery')}</span><b>{der.battery ? `${der.voltage} V` : '—'}</b></li>
        <li><span>{L('Çalışma süresi', 'Runtime')}</span><b>{der.battery ? `${Math.round(der.runtimeMin)} dk` : '—'}</b></li>
        <li><span>{L('Devrilme açısı', 'Tip angle')}</span><b>{Math.round(der.tipAngleDeg)}°</b></li>
      </ul>

      {errors.length > 0 && (
        <ul className="mj-warns" data-testid="mujoco-cad-errors">
          {errors.map((i, k) => <li key={k}>⛔ {en ? i.en : i.text}</li>)}
        </ul>
      )}
      {warns.length > 0 && (
        <ul className="mj-warns">
          {warns.map((i, k) => <li key={k}>⚠ {en ? i.en : i.text}</li>)}
        </ul>
      )}
    </>
  )
}
