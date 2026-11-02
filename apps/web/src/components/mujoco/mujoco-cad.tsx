'use client'
// MuRoKo'nun CAD rafı: robotu bu ekranda tasarlarsın ve çizdiğin an aynı ekranda
// simülasyona düşer. Ayrı bir tasarım sayfasına gidip gelmek gerekmez.
//
// Izgara görünümü ve yerleştirme kuralları var olan tasarım tezgâhından gelir
// (components/mikro/tasarim-3d.tsx, lib/mikro/tasarim.ts); burada yalnız tezgâha
// sığacak derli toplu bir arayüz kurulur.
import { useEffect, useMemo, useState } from 'react'
import { Tasarim3D } from '@/components/mikro/tasarim-3d'
import {
  CHASSIS, CHASSIS_IDS, PARTS, PART_GROUPS, canPlace, deriveDesign, placePart,
  removePart, rotatePart, setChassis, type ChassisId, type PartType, type RobotDesign,
} from '@/lib/mikro/tasarim'
import {
  addBlock, defaultGovde, duplicateBlock, govdeIssues, govdeMassG, normalizeGovde,
  removeBlock, updateBlock, type BlockShape, type Govde,
  mirrorBlock, patternBlock, snapToSurface, extrudeBlock, sliceBlock, uniqueBlockId, type BlockMaterial,
} from '@/lib/mikro/govde'
import { SABLONLAR } from '@/lib/mikro/sablonlar'
import type { GizmoMode } from './cad-gizmo'
import { importModel } from './cad-import'
import { deleteAsset, insertAsset, listAssets, saveAsset, type Varlik } from '@/lib/mikro/varliklar'
import { AssemblyPanel } from './assembly-panel'
import { CadLibrary } from './cad-library'
import { CadBoolean } from './cad-boolean'

interface Props {
  secondBlock: string | null
  onSecondBlock: (id: string | null) => void
  assemblyRequest: number
  assemblySelected: string | null
  onAssemblySelect: (id: string | null) => void
  onAssemblyExample: () => void
  onAssemblyPreview: (id: string, degrees: number) => void
  assemblyIssues: string[]
  assemblyAngle: number
  design: RobotDesign
  /** `coalesce`: sayı kutusunda her tuşa basış ayrı bir geri-al adımı açmaz. */
  onDesign: (d: RobotDesign, coalesce?: boolean) => void
  en: boolean
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  /** Seçili blok tezgâhla paylaşılır: tutamaçlar sahnede o bloğa takılır. */
  block: string | null
  onBlock: (id: string | null) => void
  gizmoMode: GizmoMode
  onGizmoMode: (m: GizmoMode) => void
  snap: boolean
  onSnap: (v: boolean) => void
  /** Tasarım değişince kısaca 'saving', sonra 'saved' (tarayıcıya zaten her değişiklikte yazılır; bu yalnız geri bildirimdir). */
  saveState: 'saving' | 'saved'
}

/** Gövdeye eklenebilen şekiller; MuJoCo'da yerleşik olanlar ve dışbükey çokyüzlüler. */
const SHAPES: { id: BlockShape; tr: string; en: string }[] = [
  { id: 'kutu', tr: 'Kutu', en: 'Box' },
  { id: 'silindir', tr: 'Silindir', en: 'Cylinder' },
  { id: 'kure', tr: 'Küre', en: 'Sphere' },
  { id: 'kapsul', tr: 'Kapsül', en: 'Capsule' },
  { id: 'elipsoid', tr: 'Elipsoid', en: 'Ellipsoid' },
  { id: 'koni', tr: 'Koni', en: 'Cone' },
  { id: 'ucgen-prizma', tr: 'Üçgen prizma', en: 'Tri prism' },
  { id: 'alti-prizma', tr: 'Altıgen prizma', en: 'Hex prism' },
  { id: 'kare-piramit', tr: 'Kare piramit', en: 'Sq pyramid' },
  { id: 'besgen-piramit', tr: 'Beşgen piramit', en: 'Pent pyramid' },
  { id: 'dortyuzlu', tr: 'Dörtyüzlü', en: 'Tetrahedron' },
  { id: 'sekizyuzlu', tr: 'Sekizyüzlü', en: 'Octahedron' },
  { id: 'onikiyuzlu', tr: 'Onikiyüzlü', en: 'Dodecahedron' },
]

export function MurokoCad({ design, onDesign, en, onUndo, onRedo, canUndo, canRedo, block, onBlock, gizmoMode, onGizmoMode, snap, onSnap, saveState, assemblySelected, onAssemblySelect, onAssemblyExample, onAssemblyPreview, assemblyIssues, assemblyAngle, assemblyRequest, secondBlock, onSecondBlock }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const [tab, setTab] = useState<'govde' | 'parca' | 'sablon' | 'assembly'>('govde')
  const [cadMode, setCadMode] = useState<'library' | 'design' | 'boolean' | 'overview'>('library')
  useEffect(() => { if (block) setCadMode((mode) => mode === 'boolean' ? mode : 'design') }, [block])
  useEffect(() => { if (assemblySelected) setTab('assembly') }, [assemblySelected])
  useEffect(() => { if (assemblyRequest) setTab('assembly') }, [assemblyRequest])
  const [tool, setTool] = useState<PartType | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [assetName, setAssetName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importNotes, setImportNotes] = useState<{ tr: string; en: string }[]>([])
  const [assets, setAssets] = useState<Varlik[]>([])
  useEffect(() => { setAssets(listAssets()) }, [])
  const der = useMemo(() => deriveDesign(design), [design])
  const govde = useMemo(() => normalizeGovde(design.govde) ?? defaultGovde(design.chassis), [design.govde, design.chassis])
  const gIssues = useMemo(() => govdeIssues(govde), [govde])

  const cadTabs = (
    <div className="mj-cad-head">
      <div className="mj-tabs mj-cad-main-tabs" role="tablist" aria-label={L('CAD araçları', 'CAD tools')}>
        {(['library', 'design', 'boolean', 'overview'] as const).map((mode, index) => <button type="button" role="tab" aria-selected={tab === 'govde' && cadMode === mode} className={`mj-tab${tab === 'govde' && cadMode === mode ? ' on' : ''}`} key={mode} onClick={() => { if (assemblySelected) onAssemblySelect(null); setTab('govde'); setCadMode(mode) }} data-testid={mode === 'design' ? 'mujoco-cad-tab-body' : `mujoco-cad-tab-${mode}`}>{(en ? ['Library', 'Design', 'Boolean', 'Overview'] : ['Kütüphane', 'Tasarım', 'Boolean', 'Genel bakış'])[index]}</button>)}
      </div>
      <div className="mj-tabs mj-cad-sub-tabs" role="tablist" aria-label={L('Robot parçaları', 'Robot parts')}>
        <button role="tab" aria-selected={tab === 'parca'} className={`mj-tab${tab === 'parca' ? ' on' : ''}`} onClick={() => setTab('parca')} data-testid="mujoco-cad-tab-parts">{L('Parçalar', 'Parts')}</button>
        <button role="tab" aria-selected={tab === 'assembly'} className={`mj-tab${tab === 'assembly' ? ' on' : ''}`} onClick={() => setTab('assembly')} data-testid="mujoco-cad-tab-assembly">{L('Montaj', 'Assembly')}</button>
        <button role="tab" aria-selected={tab === 'sablon'} className={`mj-tab${tab === 'sablon' ? ' on' : ''}`} onClick={() => setTab('sablon')} data-testid="mujoco-cad-tab-presets">{L('Şablonlar', 'Presets')}</button>
      </div>
      <div className="mj-cad-undo">
        <span className={`mj-save${saveState === 'saving' ? ' busy' : ''}`} role="status" aria-live="polite" data-testid="mujoco-cad-save">
          {saveState === 'saving' ? L('Kaydediliyor…', 'Saving…') : L('Kaydedildi', 'Saved')}
        </span>
        <button className="mj-inv" onClick={onUndo} disabled={!canUndo} title={L('Geri al', 'Undo')} aria-label={L('Geri al', 'Undo')} data-testid="mujoco-cad-undo">↶</button>
        <button className="mj-inv" onClick={onRedo} disabled={!canRedo} title={L('Yinele', 'Redo')} aria-label={L('Yinele', 'Redo')} data-testid="mujoco-cad-redo">↷</button>
      </div>
    </div>
  )

  if (tab === 'assembly') {
    return <>{cadTabs}<AssemblyPanel design={design} onDesign={onDesign} selected={assemblySelected} onSelect={onAssemblySelect} onExample={onAssemblyExample} onPreview={onAssemblyPreview} issues={assemblyIssues} angle={assemblyAngle} en={en} /></>
  }

  if (tab === 'sablon') {
    return (
      <>
        {cadTabs}
        <p className="muted">{L(
          'Boş ekrandan başlamak zorunda değilsin: çalışan bir robot seç, sonra üstünde oyna. Seçmek şu anki tasarımın yerine geçer.',
          'You do not have to start from an empty bench: pick a working robot and then change it. Picking one replaces your current design.')}</p>
        <div className="mj-cad-parts">
          {SABLONLAR.map((t) => (
            <button key={t.id} className="mj-cad-sablon" onClick={() => { onDesign(t.build()); setTab('govde'); setCadMode('design'); onAssemblySelect(null) }} data-testid={`mujoco-cad-preset-${t.id}`}>
              <b aria-hidden="true">{t.icon}</b>
              <span>{en ? t.en : t.tr}</span>
              <small>{en ? t.enDesc : t.trDesc}</small>
            </button>
          ))}
        </div>
      </>
    )
  }
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

  const setGovde = (g: Govde, coalesce = false) => onDesign({ ...design, govde: g }, coalesce)
  const bsel = govde.blocks.find((b) => b.id === block) ?? null

  /** Sayısal alan: milimetre girilir, metre saklanır — çocuk için mm daha okunur. */
  const mmField = (label: string, value: number, on: (m: number) => void, step = 1) => (
    <label className="mj-cad-num">{label}
      <input type="number" value={Math.round(value * 1000)} step={step}
        onChange={(e) => on(Number(e.target.value) / 1000)} />
    </label>
  )

  const importFile = async (file: File) => {
    setImporting(true); setImportNotes([])
    const out = await importModel(file)
    setImporting(false)
    if (!out.ok) { setImportNotes([{ tr: out.tr, en: out.en }]); return }
    const id = uniqueBlockId(govde.blocks.map((item) => item.id))
    const frontX = govde.blocks.reduce((maximum, item) => Math.max(maximum, item.pos[0] + item.size[0]), 0)
    setGovde({ ...govde, blocks: [...govde.blocks, { ...out.block, id, pos: [frontX + out.block.size[0] + 0.005, 0, 0] }] })
    onBlock(id); setCadMode('design'); setImportNotes(out.notes)
  }

  if (tab === 'govde' && cadMode === 'library') return <>{cadTabs}<CadLibrary shapes={SHAPES} en={en} importing={importing} onImport={importFile} onAdd={(shape) => { const next = addBlock(govde, shape); setGovde(next); onBlock(next.blocks.at(-1)!.id); setCadMode('design') }} />{importNotes.map((note, index) => <p className="mj-warns" role="status" key={index}>{en ? note.en : note.tr}</p>)}</>
  if (tab === 'govde' && cadMode === 'boolean') return <>{cadTabs}<CadBoolean body={govde} first={block} second={secondBlock} onFirst={onBlock} onSecond={onSecondBlock} onChange={setGovde} en={en} /></>
  if (tab === 'govde' && cadMode === 'overview') return <>{cadTabs}<p className="mj-cad-notice">{L('Sahnedeki nesneler. Seç, görünürlüğünü değiştir veya sil.', 'Scene objects. Select, change visibility or delete.')}</p><span className="mj-group-label">{L('NESNELER', 'OBJECTS')} · {govde.blocks.length + (design.assembly?.length ?? 0)}</span><div className="mj-object-list">
    {govde.blocks.map((item) => <div className="mj-object-row" key={item.id}>
      <i style={{ background: item.color }} aria-hidden="true" /><button type="button" onClick={() => { onBlock(item.id); setCadMode('design') }}>{item.name ?? item.meshName ?? item.id}{item.cut ? ` · ${L('kesici', 'cutter')}` : ''}</button>
      <button type="button" aria-pressed={!item.hidden} aria-label={`${item.id} ${L('göster/gizle', 'show/hide')}`} onClick={() => setGovde(updateBlock(govde, item.id, { hidden: !item.hidden }))}>{item.hidden ? '◌' : '◉'}</button>
      <button type="button" aria-label={`${item.id} ${L('sil', 'delete')}`} disabled={!item.cut && govde.blocks.filter((candidate) => !candidate.cut).length <= 1} onClick={() => { setGovde(removeBlock(govde, item.id)); if (block === item.id) onBlock(null) }}>×</button>
    </div>)}
    {design.assembly?.map((node) => <div className="mj-object-row" key={node.id}><i aria-hidden="true" /><button type="button" onClick={() => onAssemblySelect(node.id)}>{node.id} · {node.type}</button></div>)}
  </div></>

  if (tab === 'govde') {
    return (
      <>
        {cadTabs}
        <div className="mj-bar mj-cad-tools" role="group" aria-label={L('Tutamaç', 'Gizmo')}>
          {([['translate', '✥', L('Taşı', 'Move')], ['rotate', '⟳', L('Döndür', 'Rotate')], ['scale', '⤢', L('Boyutlandır', 'Scale')]] as const).map(([m, ico, lbl]) => (
            <button key={m} className={`mj-qbtn${gizmoMode === m ? ' on' : ''}`} aria-pressed={gizmoMode === m}
              onClick={() => onGizmoMode(m)} data-testid={`mujoco-cad-gizmo-${m}`}><b aria-hidden="true">{ico}</b>{lbl}</button>
          ))}
          <button className={`mj-qbtn${snap ? ' on' : ''}`} aria-pressed={snap} onClick={() => onSnap(!snap)} data-testid="mujoco-cad-snap">
            <b aria-hidden="true">⌗</b>{L('Kilit 5 mm / 15°', 'Snap 5 mm / 15°')}
          </button>
        </div>
        <p className="mj-note">{L(
          'Gövdeyi tezgâhın kendisinde görüyorsun: blok ekleyip ölçü değiştirdiğinde robot anında yeniden kurulur.',
          'You see the body on the bench itself: add a block or change a size and the robot is rebuilt at once.')}</p>
        <p className="muted">{L(
          'Gövde blokların birleşimidir. MuJoCo çarpışma geometrisi dışbükey olmak zorunda olduğundan, delikli ya da L biçimli bir gövde birden çok blokla kurulur — fizik de tam olarak çizdiğin şekle göre çalışır.',
          'The body is a union of blocks. MuJoCo collision geometry must be convex, so a hollow or L-shaped body is built from several blocks — and the physics matches exactly what you drew.')}</p>
        <p className="muted">{L(
          'Delik, katı kutudan çıkarılan bir kutudur. Kalan hacim tam olarak en çok 6 kutuya bölünür, yani delik fizikte de vardır: gövde hafifler ve delikten geçilir. Yalnız eksen hizalı kutular delik açabilir.',
          'A hole is a box subtracted from a solid box. The remainder splits into at most 6 boxes exactly, so the hole is real in physics too: the body gets lighter and things pass through it. Only axis-aligned boxes can cut.')}</p>

        <div className="mj-bar">
          <label className="mj-cad-chassis">{L('Şekil ekle', 'Add shape')}
            <select value="" data-testid="mujoco-cad-add-shape"
              onChange={(e) => { if (!e.target.value) return; const g = addBlock(govde, e.target.value as BlockShape); setGovde(g); onBlock(g.blocks[g.blocks.length - 1].id); e.target.value = '' }}>
              <option value="">— {L('seç', 'pick')} —</option>
              {SHAPES.map((s) => <option key={s.id} value={s.id}>{en ? s.en : s.tr}</option>)}
            </select>
          </label>
          <label className="sbtn ghost mj-cad-file" data-testid="mujoco-cad-import">
            📥 {L('Model yükle', 'Import model')}
            <input type="file" accept=".stl,.obj,.glb,.gltf" hidden onChange={(e) => {
              const file = e.target.files?.[0]; e.target.value = ''
              if (!file) return
              void importFile(file)
            }} />
          </label>
          <button className="sbtn ghost" data-testid="mujoco-cad-add-hole"
            onClick={() => {
              const g = addBlock(govde, 'kutu')
              const nid = g.blocks[g.blocks.length - 1].id
              setGovde(updateBlock(g, nid, { cut: true, color: '#111827', pos: [0, 0, 0] }))
              onBlock(nid)
            }}>✂ {L('Delik', 'Hole')}</button>
        </div>

        <ul className="mj-cad-blocks">
          {govde.blocks.map((b) => (
            <li key={b.id} className={b.id === block ? 'on' : ''}>
              <button className={`mj-cad-bsel${b.cut ? ' cut' : ''}`} onClick={() => onBlock(b.id === block ? null : b.id)} data-testid={`mujoco-cad-block-${b.id}`}>
                <i style={{ background: b.color }} aria-hidden="true" />
                {b.id} · {b.meshName ? b.meshName : b.cut ? L('delik', 'hole') : b.shape === 'kutu' ? L('kutu', 'box') : b.shape === 'silindir' ? L('silindir', 'cylinder') : L('küre', 'sphere')}
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
              <button className="sbtn ghost" onClick={() => setGovde(updateBlock(govde, bsel.id, { cut: !bsel.cut }))}
                data-testid="mujoco-cad-toggle-cut">{bsel.cut ? `⬛ ${L('Katı yap', 'Make solid')}` : `✂ ${L('Delik yap', 'Make hole')}`}</button>
              <input type="color" value={bsel.color} aria-label={L('Renk', 'Colour')} onChange={(e) => setGovde(updateBlock(govde, bsel.id, { color: e.target.value }))} />
              <label className="mj-cad-chassis">{L('Yüzey', 'Finish')}
                <select value={bsel.material ?? 'standart'} data-testid="mujoco-cad-material"
                  onChange={(e) => setGovde(updateBlock(govde, bsel.id, { material: e.target.value as BlockMaterial }))}>
                  <option value="standart">{L('Mat plastik', 'Matte plastic')}</option>
                  <option value="metalik">{L('Metalik', 'Metallic')}</option>
                  <option value="saydam">{L('Saydam', 'Transparent')}</option>
                </select>
              </label>
              <button className="sbtn ghost" onClick={() => setGovde(duplicateBlock(govde, bsel.id))}>⧉ {L('Kopyala', 'Duplicate')}</button>
              <button className="sbtn ghost" onClick={() => setGovde(mirrorBlock(govde, bsel.id, 'y'))} data-testid="mujoco-cad-mirror">
                ⇋ {L('Aynala', 'Mirror')}
              </button>
              <button className="sbtn ghost" data-testid="mujoco-cad-pattern"
                onClick={() => setGovde(patternBlock(govde, bsel.id, 'x', 3, 2 * bsel.size[0] + 0.006))}>
                ⋯ {L('Dizi (3)', 'Pattern (3)')}
              </button>
              <button className="sbtn ghost" disabled={govde.blocks.length <= 1}
                onClick={() => { setGovde(removeBlock(govde, bsel.id)); onBlock(null) }}>🗑 {L('Sil', 'Delete')}</button>
            </div>
            <span className="mj-group-label">{L('Yüzey işlemleri', 'Surface tools')}</span>
            <div className="mj-bar">
              <button className="sbtn ghost" onClick={() => setGovde(snapToSurface(govde, bsel.id, 'x'))} data-testid="mujoco-cad-snap-surface">
                🧲 {L('Yüzeye yapıştır', 'Snap to surface')}
              </button>
              <button className="sbtn ghost" onClick={() => setGovde(extrudeBlock(govde, bsel.id, 'x', 0.01))} data-testid="mujoco-cad-extrude">
                ⇥ {L('Uzat 10 mm', 'Extrude 10 mm')}
              </button>
              <button className="sbtn ghost" disabled={bsel.shape !== 'kutu'}
                onClick={() => setGovde(sliceBlock(govde, bsel.id, 'x', 0))} data-testid="mujoco-cad-slice">
                ✂ {L('Ortadan böl', 'Slice in half')}
              </button>
            </div>
          </div>
        )}

        {/* Kendi parça kütüphanen */}
        <h4 className="mj-link-h">{L('Parça kütüphanem', 'My parts')}</h4>
        <div className="mj-bar">
          <input className="mj-cad-name" value={assetName} maxLength={40} placeholder={L('Parçaya ad ver', 'Name this part')}
            aria-label={L('Parça adı', 'Part name')} onChange={(e) => setAssetName(e.target.value)} />
          <button className="sbtn ghost" disabled={!bsel} data-testid="mujoco-cad-save-asset"
            onClick={() => { if (!bsel) return; setAssets(saveAsset(assetName, [bsel])); setAssetName('') }}>
            💾 {L('Seçili bloğu kaydet', 'Save selected block')}
          </button>
        </div>
        {assets.length === 0
          ? <p className="muted">{L('Henüz kayıtlı parçan yok. Bir blok seçip kaydet, sonra başka tasarımlarda kullan.', 'No saved parts yet. Select a block and save it, then reuse it in other designs.')}</p>
          : <ul className="mj-cad-blocks">
            {assets.map((a) => (
              <li key={a.id}>
                <button className="mj-cad-bsel" onClick={() => setGovde(insertAsset(govde, a))} data-testid={`mujoco-cad-asset-${a.id}`}>
                  📦 {a.name}
                </button>
                <button className="mj-cad-x" aria-label={L('Sil', 'Delete')} onClick={() => setAssets(deleteAsset(a.id))}>✕</button>
              </li>
            ))}
          </ul>}

        <ul className="mj-cad-stats">
          <li><span>{L('Blok', 'Blocks')}</span><b>{govde.blocks.length}</b></li>
          <li><span>{L('Gövde kütlesi', 'Body mass')}</span><b>{govdeMassG(govde)} g</b></li>
        </ul>

        {importing && <p className="mj-note">{L('Model okunuyor…', 'Reading the model…')}</p>}
        {importNotes.length > 0 && (
          <ul className="mj-warns" data-testid="mujoco-cad-import-notes">
            {importNotes.map((n, k) => <li key={k}>ℹ {en ? n.en : n.tr}</li>)}
          </ul>
        )}

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

      {sel && PARTS[sel.type].wheel && (
        <div className="mj-cad-block-edit">
          <span className="mj-group-label">{L('Motor şaftına tuttur', 'Attach to motor shaft')}</span>
          <div className="mj-bar">
            <select value={sel.attach?.motorId ?? ''} data-testid="mujoco-cad-shaft-motor"
              onChange={(e) => onDesign({ ...design, parts: design.parts.map((p) => (p.id === sel.id
                ? { ...p, attach: e.target.value ? { motorId: e.target.value, snap: p.attach?.snap ?? 'orta' } : undefined }
                : p)) })}>
              <option value="">— {L('tutturulmamış', 'not attached')} —</option>
              {design.parts.filter((p) => PARTS[p.type].motor).map((m) => (
                <option key={m.id} value={m.id}>{en ? PARTS[m.type].en : PARTS[m.type].title} ({m.c},{m.r})</option>
              ))}
            </select>
            {sel.attach && ([['uc', L('Uç', 'Tip')], ['orta', L('Orta', 'Mid')], ['dip', L('Dip', 'Base')]] as const).map(([k, lbl]) => (
              <button key={k} className={`mj-qbtn${sel.attach?.snap === k ? ' on' : ''}`} aria-pressed={sel.attach?.snap === k}
                data-testid={`mujoco-cad-shaft-${k}`}
                onClick={() => onDesign({ ...design, parts: design.parts.map((p) => (p.id === sel.id && p.attach ? { ...p, attach: { ...p.attach, snap: k } } : p)) })}>
                {lbl}
              </button>
            ))}
          </div>
          <p className="muted">{L(
            'Tekerleği bir motorun miline geçirir: teker artık kendi hücresinde değil, o motorun yanında durur.',
            'Fits the wheel onto a motor shaft: the wheel now sits next to that motor instead of in its own cell.')}</p>
        </div>
      )}

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
