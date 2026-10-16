'use client'
// Oyun Atölyesi — bütünleşik editör: sahne + (bloklar | JavaScript | resimler | harita). Tam genişlik / tam yükseklik.
// Ders oynatıcıya bağlanacak bileşen budur: <OyunEditor activity={...} storageKey="..." onGoalsChange={...} />
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useT } from '@/i18n/client'
import { evaluateGoals, type GoalEvaluation, type GoalResult, type OyunActivity } from '@/lib/oyun/activity'
import { GALLERY_BY_ID } from '@/lib/oyun/assets'
import type { ImageRef } from '@/lib/oyun/blockly-defs'
import { toJavaScript } from '@/lib/oyun/codegen'
import { oyunErrorText } from '@/lib/oyun/i18n-en'
import { PROJECT_STORAGE_KEY, exportProject, gameSignature, imagesUsedByBlocks, loadProject, mapsUsedByBlocks, parseProject, saveProject, slugify, starterProject, withGalleryImages } from '@/lib/oyun/project'
import type { OyunSample } from '@/lib/oyun/samples'
import type { BlockState, OyunProject } from '@/lib/oyun/types'
import { BlocksWorkspace, type BlocksHandle } from './blocks-workspace'
import { GoalsPanel } from './goals-panel'
import { MapEditor } from './map-editor'
import { OyunStage } from './oyun-stage'
import { ImageManager } from './pixel-editor'
import { SamplesDialog } from './samples-dialog'
import { useOyunPlayer } from './use-player'
import './oyun.css'

export interface OyunEditorProps {
  /** Verilirse ders etkinliği kipi: başlangıç projesi, izinli bloklar, hedefler. */
  activity?: OyunActivity
  /** Projenin tarayıcıda saklanacağı anahtar (serbest atölye: 'ask:oyun:project:v1'). */
  storageKey: string
  /** Hedef durumu her değiştiğinde (ve ilk denetimde) çağrılır. */
  onGoalsChange?: (results: GoalResult[], allPassed: boolean) => void
}

type Tab = 'bloklar' | 'javascript' | 'resimler' | 'harita'
const TABS: { id: Tab; icon: string }[] = [
  { id: 'bloklar', icon: '🧩' },
  { id: 'javascript', icon: '📜' },
  { id: 'resimler', icon: '🎨' },
  { id: 'harita', icon: '🗺️' },
]

const PLACEHOLDER_ROWS = ['2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2']

export function OyunEditor({ activity, storageKey, onGoalsChange }: OyunEditorProps) {
  const t = useT()
  const locale = useLocale()
  /** Serbest atölyenin başlangıç projesi (adı dile göre; bloklar aynı). */
  const starter = () => ({ ...starterProject(), name: t('studios.oyun.editor.starterName') })
  const [project, setProject] = useState<OyunProject>(() => (activity ? activity.starter() : starter()))
  const [loaded, setLoaded] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [tab, setTab] = useState<Tab>('bloklar')
  const [samples, setSamples] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<GoalEvaluation | null>(null)
  const blocks = useRef<BlocksHandle>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const player = useOyunPlayer(project)
  const onGoalsRef = useRef(onGoalsChange); onGoalsRef.current = onGoalsChange

  // ---- kalıcılık ----
  useEffect(() => {
    const saved = loadProject(storageKey)
    if (saved) { setProject(withGalleryImages(saved)); setResetKey((k) => k + 1) }
    setLoaded(true)
  }, [storageKey])
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => { saveProject(project, storageKey) }, 400)
    return () => clearTimeout(t)
  }, [project, storageKey, loaded])

  // ---- önizleme (boştayken sahnenin ilk hali) ----
  const { refreshPreview, status } = player
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => refreshPreview(), 350)
    return () => clearTimeout(t)
  }, [project, loaded, refreshPreview])
  const sig = useMemo(() => gameSignature(project), [project])
  const runSig = useRef<string | null>(null)
  const sigRef = useRef(sig); sigRef.current = sig
  useEffect(() => { runSig.current = sigRef.current }, [player.runId])
  const changedWhileRunning = (status === 'running' || status === 'paused') && runSig.current !== null && runSig.current !== sig

  // ---- hedefler ----
  useEffect(() => {
    if (!activity || !loaded) return
    const t = setTimeout(() => {
      try {
        const ev = evaluateGoals(activity, project)
        setEvaluation(ev)
        onGoalsRef.current?.(ev.results.map(({ id, label, ok, hint, detail }) => ({ id, label, ok, hint, detail })), ev.allPassed)
      } catch (err) { console.error('Hedefler denetlenemedi', err) }
    }, 500)
    return () => clearTimeout(t)
  }, [activity, project, loaded])

  // ---- Blockly seçenekleri: projedeki + blokların andığı resimler/haritalar ----
  const imageRefs = useMemo<ImageRef[]>(() => {
    const list: ImageRef[] = Object.entries(project.images).map(([id, im]) => ({ id, name: im.name, rows: im.rows }))
    for (const id of imagesUsedByBlocks(project.blocks)) {
      if (project.images[id]) continue
      const g = GALLERY_BY_ID[id]
      list.push({ id, name: g?.name ?? id, rows: g?.rows ?? PLACEHOLDER_ROWS })
    }
    return list
  }, [project.images, project.blocks])
  const mapNames = useMemo(() => {
    const names = project.maps.map((m) => m.name)
    for (const n of mapsUsedByBlocks(project.blocks)) if (!names.includes(n)) names.push(n)
    return names
  }, [project.maps, project.blocks])

  const usedIds = useMemo(() => new Set(imagesUsedByBlocks(project.blocks)), [project.blocks])
  const tileIds = useMemo(() => new Set(project.tileset.map((t) => t.image)), [project.tileset])
  const code = useMemo(() => toJavaScript(project.blocks, locale), [project.blocks, locale])

  const onBlocks = useCallback((s: BlockState) => setProject((p) => ({ ...p, blocks: s })), [])

  const replaceProject = (p: OyunProject, message?: string) => {
    player.stop()
    setProject(withGalleryImages(p))
    setResetKey((k) => k + 1)
    setNote(message ?? null)
    setTab('bloklar')
  }

  // ---- dosya / örnek / yeni ----
  const exportJson = () => {
    const blob = new Blob([exportProject(project)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(project.name, 'oyunum')}.oyun.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNote(t('studios.oyun.editor.exported'))
  }
  const importJson = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 2_000_000) { setNote(t('studios.oyun.editor.fileTooBig')); return }
    const p = parseProject(await file.text())
    if (!p) { setNote(t('studios.oyun.editor.fileInvalid')); return }
    replaceProject(p, t('studios.oyun.editor.projectOpened', { name: p.name }))
  }
  const pickSample = (s: OyunSample) => {
    setSamples(false)
    const name = locale === 'en' && s.en ? s.en.name : s.name
    const p = s.project()
    replaceProject(locale === 'en' && s.en ? { ...p, name } : p, t('studios.oyun.editor.sampleOpened', { name }))
  }
  const newProject = () => { if (window.confirm(t('studios.oyun.editor.confirmNew'))) replaceProject(starter(), t('studios.oyun.editor.newStarted')) }
  const resetActivity = () => { if (activity && window.confirm(t('studios.oyun.editor.confirmReset'))) replaceProject(activity.starter(), t('studios.oyun.editor.activityReset')) }

  const showBlock = (id: string | null | undefined) => { setTab('bloklar'); setTimeout(() => blocks.current?.focusBlock(id), 80) }

  return (
    <div className="oy-root" data-activity={!!activity} data-testid="oyun-editor">
      <div className="oy-top">
        {activity ? (
          <h2 className="oy-title">{activity.title}</h2>
        ) : (
          <label className="oy-name">
            <span className="sr-only">{t('studios.oyun.editor.projectName')}</span>
            <input type="text" value={project.name} maxLength={60} onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))} aria-label={t('studios.oyun.editor.projectName')} data-testid="oyun-name" />
          </label>
        )}
        <span className="oy-spacer" />
        {!activity && (
          <>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSamples(true)} data-testid="oyun-samples-btn">{t('studios.oyun.editor.samples')}</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={newProject}>{t('studios.oyun.editor.new')}</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fileInput.current?.click()}>{t('studios.oyun.editor.open')}</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportJson} data-testid="oyun-export">{t('studios.oyun.editor.save')}</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = '' }} data-testid="oyun-import" />
          </>
        )}
        {activity && <button type="button" className="btn btn-sm btn-ghost" onClick={resetActivity}>{t('studios.oyun.editor.resetActivity')}</button>}
      </div>
      {note && <p className="oy-toast" role="status" onClick={() => setNote(null)}>{note}</p>}

      <div className="oy-main">
        <aside className="oy-stagecol">
          <OyunStage player={player} changed={changedWhileRunning} />
          {player.error && (
            <div className="oy-error" role="alert" data-testid="oyun-error">
              <b>{t('studios.oyun.editor.problem')}</b> {oyunErrorText(player.error.message, locale)}
              {player.error.blockId && <button type="button" className="oy-link" onClick={() => showBlock(player.error?.blockId)}>{t('studios.oyun.editor.showBlock')}</button>}
            </div>
          )}
          {activity && (
            <>
              <p className="oy-intro">{activity.intro}</p>
              <GoalsPanel evaluation={evaluation} onShowBlock={showBlock} />
            </>
          )}
        </aside>

        <section className="oy-work" aria-label={t('studios.oyun.editor.workArea')}>
          <div className="oy-tabs" role="tablist" aria-label={t('studios.oyun.editor.tabsLabel')}>
            {TABS.map((tb) => (
              <button key={tb.id} type="button" role="tab" id={`oy-tab-${tb.id}`} aria-selected={tab === tb.id} aria-controls={`oy-panel-${tb.id}`} className="oy-tab" onClick={() => setTab(tb.id)} data-testid={`oyun-tab-${tb.id}`}>
                <span aria-hidden="true">{tb.icon}</span> {t(`studios.oyun.editor.tabs.${tb.id}`)}
              </button>
            ))}
            <span className="oy-spacer" />
            {tab === 'bloklar' && (
              <span className="oy-tab-acts">
                <button type="button" className="oy-tab-act" onClick={() => blocks.current?.undo()} title={t('studios.oyun.editor.undo')}>↶</button>
                <button type="button" className="oy-tab-act" onClick={() => blocks.current?.redo()} title={t('studios.oyun.editor.redo')}>↷</button>
                <button type="button" className="oy-tab-act" onClick={() => blocks.current?.arrange()} title={t('studios.oyun.editor.arrangeTitle')}>{t('studios.oyun.editor.arrange')}</button>
              </span>
            )}
          </div>
          <div className="oy-panels">
            <div role="tabpanel" id="oy-panel-bloklar" aria-labelledby="oy-tab-bloklar" hidden={tab !== 'bloklar'} className="oy-panel">
              <BlocksWorkspace ref={blocks} state={project.blocks} onChange={onBlocks} allowedBlocks={activity?.allowedBlocks} images={imageRefs} maps={mapNames} resetKey={resetKey} />
            </div>
            <div role="tabpanel" id="oy-panel-javascript" aria-labelledby="oy-tab-javascript" hidden={tab !== 'javascript'} className="oy-panel">
              <div className="oy-js">
                <div className="oy-js-bar">
                  <span className="muted">{t('studios.oyun.editor.jsNote')}</span>
                  <span className="oy-spacer" />
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => { void navigator.clipboard?.writeText(code).then(() => setNote(t('studios.oyun.editor.copied'))).catch(() => setNote(t('studios.oyun.editor.copyFailed'))) }}>{t('studios.oyun.editor.copy')}</button>
                </div>
                <pre className="oy-code" tabIndex={0} aria-label={t('studios.oyun.editor.jsCode')} data-testid="oyun-js"><code>{code}</code></pre>
              </div>
            </div>
            <div role="tabpanel" id="oy-panel-resimler" aria-labelledby="oy-tab-resimler" hidden={tab !== 'resimler'} className="oy-panel">
              {tab === 'resimler' && <ImageManager images={project.images} onChange={(images) => setProject((p) => ({ ...p, images }))} usedIds={usedIds} tileIds={tileIds} />}
            </div>
            <div role="tabpanel" id="oy-panel-harita" aria-labelledby="oy-tab-harita" hidden={tab !== 'harita'} className="oy-panel">
              {tab === 'harita' && <MapEditor project={project} onChange={setProject} />}
            </div>
          </div>
        </section>
      </div>
      {samples && <SamplesDialog onPick={pickSample} onClose={() => setSamples(false)} />}
    </div>
  )
}

export { PROJECT_STORAGE_KEY }
