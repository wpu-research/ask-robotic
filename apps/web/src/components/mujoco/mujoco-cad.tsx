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

interface Props {
  design: RobotDesign
  onDesign: (d: RobotDesign) => void
  en: boolean
}

export function MurokoCad({ design, onDesign, en }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const [tool, setTool] = useState<PartType | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
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

  return (
    <>
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
