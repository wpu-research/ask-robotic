'use client'

import { useState } from 'react'
import { booleanBlocks, canBoolean, type BooleanOperation } from '@/lib/mikro/boolean'
import type { Govde } from '@/lib/mikro/govde'

export function CadBoolean({ body, first, second, onFirst, onSecond, onChange, en }: { body: Govde; first: string | null; second: string | null; onFirst: (id: string | null) => void; onSecond: (id: string | null) => void; onChange: (body: Govde) => void; en: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const run = (operation: BooleanOperation) => {
    if (!first || !second) return
    const result = booleanBlocks(body, first, second, operation)
    setError(result.ok ? null : result.reason)
    if (result.ok) { onChange(result.body); onFirst(result.selected); onSecond(null) }
  }
  const enabled = canBoolean(body.blocks.find((block) => block.id === first), body.blocks.find((block) => block.id === second))
  return <div className="mj-cad-boolean" data-testid="mujoco-cad-boolean">
    <div className="mj-cad-empty"><span aria-hidden="true">◉◉</span><h4>{en ? 'Boolean operations' : 'Boolean işlemleri'}</h4><p>{en ? 'Pick a shape, then Shift-click a second shape in the scene, or select them below.' : 'Bir şekil seç, sonra sahnede Shift+tıklama ile ikinciyi seç. Aşağıdaki listeleri de kullanabilirsin.'}</p></div>
    {(['A', 'B'] as const).map((label) => <label className="mj-assembly-field" key={label}>{label}<select value={(label === 'A' ? first : second) ?? ''} data-testid={`mujoco-boolean-${label}`} onChange={(event) => { setError(null); (label === 'A' ? onFirst : onSecond)(event.target.value || null) }}><option value="">{en ? 'Select a shape' : 'Şekil seç'}</option>{body.blocks.filter((block) => !block.cut).map((block) => <option key={block.id} value={block.id}>{block.name ?? block.id}</option>)}</select></label>)}
    <div className="mj-bar">{(['union', 'subtract', 'intersect'] as const).map((operation, index) => <button type="button" className="mj-qbtn" key={operation} disabled={!enabled} data-testid={`mujoco-boolean-${operation}`} onClick={() => run(operation)}>{(en ? ['Union', 'Subtract A − B', 'Intersect'] : ['Birleştir', 'Çıkar A − B', 'Kesiştir'])[index]}</button>)}</div>
    <p className="muted">{en ? 'Exact collision geometry is currently supported for axis-aligned boxes (0°, 90°, 180°, 270°). Other shape combinations are disabled.' : 'Fizikle birebir eşleşen işlemler şu an eksen hizalı kutularda (0°, 90°, 180°, 270°) desteklenir. Diğer şekil birleşimleri devre dışıdır.'}</p>
    {error && <p className="mj-warns" role="status">{error === 'precision' ? (en ? 'The result exceeds the editor limits (10 mm minimum thickness, 500 mm maximum size).' : 'Sonuç düzenleyici sınırlarını aşıyor (en az 10 mm kalınlık, en çok 500 mm boyut).') : (en ? 'This operation would leave no solid body, or the shapes are unsupported.' : 'Bu işlem gövdede katı bırakmıyor veya seçilen şekiller desteklenmiyor.')}</p>}
  </div>
}
