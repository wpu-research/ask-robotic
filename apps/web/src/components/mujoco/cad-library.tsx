'use client'

import type { BlockShape } from '@/lib/mikro/govde'

function ShapeIcon({ shape }: { shape: BlockShape }) {
  return <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true">
    {shape === 'kure' || shape === 'elipsoid' ? <><circle cx="16" cy="16" r="11" /><ellipse cx="16" cy="16" rx="5" ry="11" /><path d="M5 16h22" /></> : shape === 'silindir' || shape === 'kapsul' ? <><ellipse cx="16" cy="7" rx="8" ry="3" /><path d="M8 7v18c0 4 16 4 16 0V7M8 25c0-4 16-4 16 0" /></> : ['koni', 'kare-piramit', 'besgen-piramit', 'dortyuzlu'].includes(shape) ? <><path d="m16 4-12 23h24L16 4Zm0 0v19L4 27m12-4 12 4" /></> : <><path d="m16 3 12 7v13l-12 7L4 23V10l12-7Zm0 14L4 10m12 7 12-7M16 17v13" />{shape !== 'kutu' && <path d="m16 3-6 20 18 0L16 3Z" />}</>}
  </svg>
}

export function CadLibrary({ shapes, onAdd, onImport, importing, en }: { shapes: { id: BlockShape; tr: string; en: string }[]; onAdd: (shape: BlockShape) => void; onImport: (file: File) => void; importing: boolean; en: boolean }) {
  const basic = new Set(['kutu', 'kure', 'silindir', 'koni', 'kapsul', 'elipsoid'])
  return <div className="mj-cad-library" data-testid="mujoco-cad-library">
    <p className="mj-cad-notice">{en ? 'Add shapes, import a 3D model, or reuse your saved parts.' : 'Şekil ekle, 3B model yükle veya kaydettiğin parçaları yeniden kullan.'}</p>
    <label className="mj-import-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) onImport(file) }}>
      <span aria-hidden="true">⇩</span><b>{importing ? en ? 'Importing…' : 'Yükleniyor…' : en ? 'Drop a file or click to import' : 'Dosya bırak veya yüklemek için tıkla'}</b><small>GLB · GLTF · STL · OBJ</small>
      <input type="file" disabled={importing} accept=".glb,.gltf,.stl,.obj" hidden onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) onImport(file) }} />
    </label>
    {[true, false].map((isBasic) => <section key={String(isBasic)}>
      <h4 className="mj-group-label">{isBasic ? en ? 'BASIC SHAPES' : 'TEMEL ŞEKİLLER' : en ? 'POLYHEDRA' : 'ÇOKYÜZLÜLER'}</h4>
      <div className="mj-shape-grid">{shapes.filter((shape) => basic.has(shape.id) === isBasic).map((shape) => <button type="button" key={shape.id} onClick={() => onAdd(shape.id)} data-testid={`mujoco-shape-${shape.id}`}><span><ShapeIcon shape={shape.id} /></span><b>{shape[en ? 'en' : 'tr']}</b></button>)}</div>
    </section>)}
  </div>
}
