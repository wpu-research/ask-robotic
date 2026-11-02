'use client'

export function ProjectToolbar({ name, onName, onSave, onDownload, onImport, onUndo, onRedo, canUndo, canRedo, saveState, en }: { name: string; onName: (name: string) => void; onSave: () => void; onDownload: () => void; onImport: (file: File) => void; onUndo: () => void; onRedo: () => void; canUndo: boolean; canRedo: boolean; saveState: string; en: boolean }) {
  return <div className="mj-projectbar" data-testid="mujoco-projectbar">
    <b className="mj-project-brand">Macademia <span>· {en ? 'Workbench' : 'Atölye'}</span></b>
    <input key={name} type="text" defaultValue={name} maxLength={40} aria-label={en ? 'Project name' : 'Proje adı'} onBlur={(event) => { const next = event.target.value.trim(); if (next && next !== name) onName(next) }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} />
    <button type="button" className="mj-qbtn" disabled={!canUndo} onClick={onUndo} aria-label={en ? 'Undo' : 'Geri al'}>↶</button>
    <button type="button" className="mj-qbtn" disabled={!canRedo} onClick={onRedo} aria-label={en ? 'Redo' : 'Yinele'}>↷</button>
    <span className="mj-project-saved" role="status">{saveState}</span>
    <button type="button" className="sbtn" onClick={onSave} data-testid="mujoco-project-save">{en ? 'Save' : 'Kaydet'}</button>
    <details className="mj-project-files"><summary>{en ? 'File' : 'Dosya'}</summary><div>
      <button type="button" className="mj-qbtn" onClick={onDownload} data-testid="mujoco-project-export">{en ? 'Download project (.json)' : 'Projeyi indir (.json)'}</button>
      <label className="mj-qbtn">{en ? 'Open project' : 'Proje aç'}<input type="file" accept=".json" hidden data-testid="mujoco-project-import" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) onImport(file) }} /></label>
    </div></details>
  </div>
}
