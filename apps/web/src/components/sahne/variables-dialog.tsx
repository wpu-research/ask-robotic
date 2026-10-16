'use client'
// Değişkenler ve listeler: başlangıç değeri / liste içeriği, sahnede göster, sil. (Scratch'teki sahne ekranları ve liste düzenleme yerine.)
import type { SahneProject, VarDef } from '@/lib/sahne/types'
import { Modal } from './dialogs'
import { useT } from '@/i18n/client'

export function VariablesDialog({ project, usedIds, onChange, onClose }: {
  project: SahneProject
  usedIds: Set<string>
  onChange: (vars: VarDef[]) => void
  onClose: () => void
}) {
  const t = useT()
  const vars = project.variables
  const close = () => { onChange(project.variables.map((v) => (v.type === 'List' ? { ...v, items: v.items.filter((x) => x.trim() !== '') } : v))); onClose() }
  const set = (id: string, patch: Partial<VarDef>) => onChange(vars.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  return (
    <Modal title={t('studios.sahne.vars.title')} onClose={close} wide testid="sahne-vars-dialog">
      {!vars.length && <p className="muted" style={{ padding: '4px 2px 12px' }}>{t('studios.sahne.vars.emptyA')}<b>{t('studios.sahne.vars.category')}</b>{t('studios.sahne.vars.emptyB')}</p>}
      <ul className="sh-vars">
        {vars.map((v) => (
          <li key={v.id} className="sh-var" data-testid={`sahne-var-${v.name}`}>
            <div className="sh-var-head">
              <b>{v.type === 'List' ? '☰' : '▤'} {v.name}</b>
              <label className="sh-check"><input type="checkbox" checked={v.visible} onChange={(e) => set(v.id, { visible: e.target.checked })} /> {t('studios.sahne.vars.showOnStage')}</label>
              <span className="sh-spacer" />
              <button type="button" className="btn btn-sm btn-ghost" disabled={usedIds.has(v.id)} title={usedIds.has(v.id) ? t('studios.sahne.vars.inUse') : t('studios.sahne.vars.delete')} onClick={() => onChange(vars.filter((x) => x.id !== v.id))}>{t('studios.sahne.vars.delete')}</button>
            </div>
            {v.type === 'List'
              ? <label className="sh-field"><span>{t('studios.sahne.vars.listItems')}</span><textarea rows={4} value={v.items.join('\n')} onChange={(e) => set(v.id, { items: e.target.value.split('\n').slice(0, 2000).map((x) => x.slice(0, 300)) })} data-testid={`sahne-list-items-${v.name}`} /></label>
              : <label className="sh-field"><span>{t('studios.sahne.vars.initial')}</span><input type="text" value={String(v.value)} onChange={(e) => { const t = e.target.value; set(v.id, { value: t.trim() !== '' && Number.isFinite(Number(t)) ? Number(t) : t }) }} /></label>}
          </li>
        ))}
      </ul>
      <div className="sh-modal-foot"><button type="button" className="btn btn-primary sh-modal-primary" onClick={close}>{t('studios.sahne.vars.ok')}</button></div>
    </Modal>
  )
}
