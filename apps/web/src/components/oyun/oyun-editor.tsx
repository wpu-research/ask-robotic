'use client'
// Oyun Atölyesi — bütünleşik editör: sahne + (bloklar | JavaScript | resimler | harita). Tam genişlik / tam yükseklik.
// Ders oynatıcıya bağlanacak bileşen budur: <OyunEditor activity={...} storageKey="..." onGoalsChange={...} />
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { evaluateGoals, type GoalEvaluation, type GoalResult, type OyunActivity } from '@/lib/oyun/activity'
import { GALLERY_BY_ID } from '@/lib/oyun/assets'
import type { ImageRef } from '@/lib/oyun/blockly-defs'
import { toJavaScript } from '@/lib/oyun/codegen'
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
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'bloklar', label: 'Bloklar', icon: '🧩' },
  { id: 'javascript', label: 'JavaScript', icon: '📜' },
  { id: 'resimler', label: 'Resimler', icon: '🎨' },
  { id: 'harita', label: 'Harita', icon: '🗺️' },
]

const PLACEHOLDER_ROWS = ['2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2']

export function OyunEditor({ activity, storageKey, onGoalsChange }: OyunEditorProps) {
  const [project, setProject] = useState<OyunProject>(() => (activity ? activity.starter() : starterProject()))
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
  const code = useMemo(() => toJavaScript(project.blocks), [project.blocks])

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
    setNote('Projen bir dosya olarak indirildi.')
  }
  const importJson = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 2_000_000) { setNote('Dosya çok büyük (en çok 2 MB).'); return }
    const p = parseProject(await file.text())
    if (!p) { setNote('Bu dosya geçerli bir Oyun Atölyesi projesi değil.'); return }
    replaceProject(p, `"${p.name}" projesi açıldı.`)
  }
  const pickSample = (s: OyunSample) => { setSamples(false); replaceProject(s.project(), `"${s.name}" örneği açıldı. Bloklarını değiştirip dene!`) }
  const newProject = () => { if (window.confirm('Yeni bir proje başlatılsın mı? Şu anki çalışmanın üzerine yazılır (önce Kaydet ile indirebilirsin).')) replaceProject(starterProject(), 'Yeni proje başlatıldı.') }
  const resetActivity = () => { if (activity && window.confirm('Etkinliğin başlangıç haline dönülsün mü? Yaptıkların silinir.')) replaceProject(activity.starter(), 'Etkinlik başa döndü.') }

  const showBlock = (id: string | null | undefined) => { setTab('bloklar'); setTimeout(() => blocks.current?.focusBlock(id), 80) }

  return (
    <div className="oy-root" data-activity={!!activity} data-testid="oyun-editor">
      <div className="oy-top">
        {activity ? (
          <h2 className="oy-title">{activity.title}</h2>
        ) : (
          <label className="oy-name">
            <span className="sr-only">Proje adı</span>
            <input type="text" value={project.name} maxLength={60} onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))} aria-label="Proje adı" data-testid="oyun-name" />
          </label>
        )}
        <span className="oy-spacer" />
        {!activity && (
          <>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSamples(true)} data-testid="oyun-samples-btn">🎮 Örnekler</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={newProject}>＋ Yeni</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fileInput.current?.click()}>📂 Aç</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportJson} data-testid="oyun-export">💾 Kaydet</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = '' }} data-testid="oyun-import" />
          </>
        )}
        {activity && <button type="button" className="btn btn-sm btn-ghost" onClick={resetActivity}>↺ Başa dön</button>}
      </div>
      {note && <p className="oy-toast" role="status" onClick={() => setNote(null)}>{note}</p>}

      <div className="oy-main">
        <aside className="oy-stagecol">
          <OyunStage player={player} changed={changedWhileRunning} />
          {player.error && (
            <div className="oy-error" role="alert" data-testid="oyun-error">
              <b>Bir sorun var:</b> {player.error.message}
              {player.error.blockId && <button type="button" className="oy-link" onClick={() => showBlock(player.error?.blockId)}>Bloğu göster</button>}
            </div>
          )}
          {activity && (
            <>
              <p className="oy-intro">{activity.intro}</p>
              <GoalsPanel evaluation={evaluation} onShowBlock={showBlock} />
            </>
          )}
        </aside>

        <section className="oy-work" aria-label="Düzenleme alanı">
          <div className="oy-tabs" role="tablist" aria-label="Düzenleme sekmeleri">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" id={`oy-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`oy-panel-${t.id}`} className="oy-tab" onClick={() => setTab(t.id)} data-testid={`oyun-tab-${t.id}`}>
                <span aria-hidden="true">{t.icon}</span> {t.label}
              </button>
            ))}
            <span className="oy-spacer" />
            {tab === 'bloklar' && (
              <span className="oy-tab-acts">
                <button type="button" className="oy-tab-act" onClick={() => blocks.current?.undo()} title="Geri al">↶</button>
                <button type="button" className="oy-tab-act" onClick={() => blocks.current?.redo()} title="Yinele">↷</button>
                <button type="button" className="oy-tab-act" onClick={() => blocks.current?.arrange()} title="Blokları düzenle">⇅ Düzenle</button>
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
                  <span className="muted">Bloklarının JavaScript karşılığı (salt okunur). Oyun doğrudan bloklardan çalışır.</span>
                  <span className="oy-spacer" />
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => { void navigator.clipboard?.writeText(code).then(() => setNote('Kod panoya kopyalandı.')).catch(() => setNote('Kopyalanamadı; kodu elle seçip kopyala.')) }}>Kopyala</button>
                </div>
                <pre className="oy-code" tabIndex={0} aria-label="JavaScript kodu" data-testid="oyun-js"><code>{code}</code></pre>
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
