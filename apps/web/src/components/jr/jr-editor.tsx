'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { evaluateGoals, type Goal } from '@/lib/jr/analysis'
import { ALL_BLOCK_TYPES, BACKGROUNDS, CHARACTERS } from '@/lib/jr/blocks'
import { Engine } from '@/lib/jr/engine'
import { addPageTo, addSpriteTo, editScripts, removePageAt, removeSpriteFrom, setBackground } from '@/lib/jr/project-edit'
import { isMuted, playSound, setMuted } from '@/lib/jr/sound'
import type { Block, BlockType, EngineSnapshot, Project, Script } from '@/lib/jr/types'
import { BlockWorkspace } from './blockly-workspace'
import { GoalsPanel } from './goals-panel'
import { Stage } from './stage'
import './jr-blockly.css'

export interface JrEditorProps {
  initial: Project
  /** Verilirse proje tarayıcıda bu anahtarla saklanır. */
  storageKey?: string
  allowedBlocks?: BlockType[]
  goals?: Goal[]
  allowPages?: boolean
  allowSprites?: boolean
  onGoalsComplete?: () => void
}

const KNOWN = new Set<string>(ALL_BLOCK_TYPES)
const okBlock = (b: unknown): boolean => {
  const x = b as { id?: unknown; type?: unknown; children?: unknown }
  return !!x && typeof x.id === 'string' && typeof x.type === 'string' && KNOWN.has(x.type) && (x.children === undefined || (Array.isArray(x.children) && x.children.every(okBlock)))
}
/** Tarayıcıda saklanan projenin biçimini doğrular (bozuk/eski veri çökertmesin). */
export function isProject(p: unknown): p is Project {
  const x = p as Project
  return !!x && Array.isArray(x.pages) && x.pages.length > 0 && x.pages.every((pg) =>
    typeof pg?.id === 'string' && typeof pg.background === 'string' && Array.isArray(pg.sprites) &&
    pg.sprites.every((s) => typeof s?.id === 'string' && typeof s.character === 'string' && Number.isFinite(s.x) && Number.isFinite(s.y) &&
      Array.isArray(s.scripts) && s.scripts.every((sc) => typeof sc?.id === 'string' && Array.isArray(sc.blocks) && sc.blocks.every(okBlock))))
}

export function JrEditor({ initial, storageKey, allowedBlocks = ALL_BLOCK_TYPES, goals, allowPages = true, allowSprites = true, onGoalsComplete }: JrEditorProps) {
  const [project, setProject] = useState<Project>(initial)
  const [pageIndex, setPageIndex] = useState(0)
  const [spriteId, setSpriteId] = useState<string | null>(initial.pages[0]?.sprites[0]?.id ?? null)
  const [snap, setSnap] = useState<EngineSnapshot | null>(null)
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [hops, setHops] = useState<Record<string, number>>({})
  const [glow, setGlow] = useState<string[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [muted, setMutedState] = useState(false)
  const [loaded, setLoaded] = useState(!storageKey)

  const engine = useRef<Engine | null>(null)
  if (!engine.current) engine.current = new Engine(initial, { onSound: playSound })
  const cursor = useRef(0)

  const page = project.pages[Math.min(pageIndex, project.pages.length - 1)]
  const sprite = page.sprites.find((s) => s.id === spriteId) ?? page.sprites[0] ?? null

  // ---- kalıcılık ----
  useEffect(() => {
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw)
        if (isProject(saved)) { setProject(saved); setSpriteId(saved.pages[0].sprites[0]?.id ?? null) }
      }
    } catch { /* bozuk kayıt: başlangıç projesiyle devam */ }
    setLoaded(true)
  }, [storageKey])
  useEffect(() => {
    if (!storageKey || !loaded) return
    const t = setTimeout(() => { try { localStorage.setItem(storageKey, JSON.stringify(project)) } catch { /* kota/gizli pencere */ } }, 300)
    return () => clearTimeout(t)
  }, [project, storageKey, loaded])

  // Proje ya da sayfa değişince motor sıfırlanır
  useEffect(() => {
    engine.current!.setProject(project)
    setRunning(false); setRan(false); setSnap(null); setHops({}); cursor.current = 0
  }, [project, pageIndex])

  // ---- motor döngüsü ----
  useEffect(() => {
    if (!running) return
    const eng = engine.current!
    let last = performance.now()
    let raf = 0
    const loop = (t: number) => {
      const dt = Math.min(50, t - last); last = t
      eng.tick(dt)
      const s = eng.snapshot
      const ev = eng.events
      if (ev.length < cursor.current) cursor.current = 0
      const fresh = ev.slice(cursor.current); cursor.current = ev.length
      const hopIds = fresh.filter((e) => e.kind === 'hop').map((e) => (e as { spriteId: string }).spriteId)
      if (hopIds.length) setHops((h) => { const n = { ...h }; hopIds.forEach((id) => { n[id] = (n[id] ?? 0) + 1 }); return n })
      setSnap(s)
      if (s.running) raf = requestAnimationFrame(loop); else setRunning(false)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running])

  const start = () => {
    const eng = engine.current!
    eng.reset(pageIndex); eng.pressFlag(); cursor.current = 0
    setGlow((sprite?.scripts ?? []).filter((sc) => sc.blocks[0]?.type === 'flag').map((sc) => sc.blocks[0].id))
    setHops({}); setSnap(eng.snapshot); setRan(true); setRunning(true)
  }
  const stop = () => { engine.current!.stop(); setSnap(engine.current!.snapshot); setRunning(false) }
  const resetRun = () => { engine.current!.setProject(project); setRunning(false); setRan(false); setSnap(null); setHops({}) }
  const tapSprite = (id: string) => {
    const eng = engine.current!
    if (!ran) { eng.reset(pageIndex); setRan(true); cursor.current = 0 }
    eng.tapSprite(id); setSnap(eng.snapshot); setRunning(true)
    if (id === sprite?.id) setGlow(scripts.filter((sc) => sc.blocks[0]?.type === 'tap').map((sc) => sc.blocks[0].id))
  }

  // ---- düzenleme (Blockly çalışma alanı betikleri bütün olarak verir) ----
  const scripts = sprite?.scripts ?? []
  const setScripts = (next: Script[]) => {
    if (!sprite) return
    setProject((p) => editScripts(p, pageIndex, sprite.id, () => next))
  }
  const runStack = (blocks: Block[]) => {
    if (!sprite) return
    const eng = engine.current!
    if (!ran) { eng.reset(pageIndex); setRan(true); cursor.current = 0 }
    eng.runStack(sprite.id, blocks)
    setGlow([blocks[0].id]); setSnap(eng.snapshot); setRunning(true)
  }
  // Çalışma bitince parıltı söner
  useEffect(() => { if (!running) setGlow([]) }, [running])

  // ---- hedefler ----
  const goalStatus = useMemo(() => (goals ? evaluateGoals(project, goals) : []), [project, goals])
  const allDone = goalStatus.length > 0 && goalStatus.every((g) => g.done)
  const wasDone = useRef(false)
  useEffect(() => {
    if (allDone && !wasDone.current) onGoalsComplete?.()
    wasDone.current = allDone
  }, [allDone, onGoalsComplete])

  const stagePage = ran && snap ? project.pages[snap.pageIndex] ?? page : page
  const resetProject = () => {
    if (!window.confirm('Projeyi başlangıç haline döndürmek istiyor musun? Yaptıkların silinir.')) return
    if (storageKey) { try { localStorage.removeItem(storageKey) } catch { /* yoksay */ } }
    setProject(initial); setPageIndex(0); setSpriteId(initial.pages[0]?.sprites[0]?.id ?? null)
  }

  const live = ran && snap ? snap.sprites.find((r) => r.id === sprite?.id) : undefined
  const info = sprite
    ? live ?? { x: sprite.x, y: sprite.y, heading: 0, scale: 1, visible: true }
    : null

  return (
    <div className="jr-host">
    <div className="jrb" data-jr data-running={running}>
      <div className="jrb-stagecol">
        <div className="jrb-bar">
          <button type="button" className="jrb-flag" onClick={start} aria-label="Başlat (yeşil bayrak)" data-action="start" title="Başlat"><span aria-hidden="true">🏁</span><b>Başlat</b></button>
          <button type="button" className="jrb-stop" onClick={stop} disabled={!running} aria-label="Dur" data-action="stop" title="Dur"><span aria-hidden="true">⏹</span><b>Dur</b></button>
          <span className="jrb-spacer" />
          <button type="button" className="jr-btn" onClick={resetRun} disabled={!ran} data-action="reset">↺ Başa al</button>
          <button type="button" className="jr-btn icon" aria-label={muted ? 'Sesi aç' : 'Sesi kapat'} onClick={() => { setMuted(!isMuted()); setMutedState(isMuted()) }}>{muted ? '🔇' : '🔊'}</button>
        </div>
        <Stage
          page={stagePage}
          runtime={ran && snap ? snap.sprites : null}
          hops={hops}
          selectedId={sprite?.id ?? null}
          onSelect={setSpriteId}
          onTap={tapSprite}
        />
        {sprite && info && (
          <div className="jrb-info" aria-label="Karakter bilgisi" data-testid="jr-info">
            <span className="jrb-info-name">{CHARACTERS[sprite.character]?.glyph} <b>{CHARACTERS[sprite.character]?.label}</b></span>
            <span>x <b>{Math.round(info.x)}</b></span>
            <span>y <b>{Math.round(info.y)}</b></span>
            <span>boyut <b>{Math.round(info.scale * 100)}%</b></span>
            <span>yön <b>{Math.round(info.heading)}°</b></span>
            <span className="jrb-info-vis" data-visible={info.visible}>{info.visible ? '👁 Görünür' : '🙈 Gizli'}</span>
          </div>
        )}
      </div>

      <div className="jrb-main">
        <BlockWorkspace
          scripts={scripts}
          onChange={setScripts}
          allowedBlocks={allowedBlocks}
          onRunStack={runStack}
          resetKey={`${page.id}:${sprite?.id ?? ''}`}
          glowIds={glow}
        />
      </div>

      <div className="jrb-extras">
        <div className="jr-sprites" aria-label="Karakterler">
          {page.sprites.map((s) => (
            <button key={s.id} type="button" className={`jr-spr${s.id === sprite?.id ? ' on' : ''}`} onClick={() => setSpriteId(s.id)} aria-label={CHARACTERS[s.character]?.label} aria-pressed={s.id === sprite?.id}>
              {CHARACTERS[s.character]?.glyph}
            </button>
          ))}
          {allowSprites && (
            <>
              <button type="button" className="jr-spr add" onClick={() => setAddOpen((v) => !v)} aria-expanded={addOpen} aria-label="Karakter ekle">+</button>
              {sprite && page.sprites.length > 0 && (
                <button type="button" className="jr-btn small" onClick={() => { const left = page.sprites.filter((s) => s.id !== sprite.id); setProject((p) => removeSpriteFrom(p, pageIndex, sprite.id)); setSpriteId(left[0]?.id ?? null) }}>Karakteri sil</button>
              )}
            </>
          )}
          {addOpen && (
            <div className="jr-addmenu">
              {Object.entries(CHARACTERS).map(([k, c]) => (
                <button key={k} type="button" onClick={() => { const r = addSpriteTo(project, pageIndex, k); setProject(r.project); setSpriteId(r.spriteId); setAddOpen(false) }} aria-label={`${c.label} ekle`}>{c.glyph}</button>
              ))}
            </div>
          )}
        </div>
        {allowPages && (
          <div className="jr-pages" aria-label="Sayfalar">
            {project.pages.map((p, i) => (
              <button key={p.id} type="button" className={`jr-page${i === pageIndex ? ' on' : ''}`} onClick={() => setPageIndex(i)} aria-label={`Sayfa ${i + 1}`} aria-current={i === pageIndex ? 'page' : undefined}
                style={{ background: BACKGROUNDS[p.background]?.css }}><span>{i + 1}</span></button>
            ))}
            {project.pages.length < 8 && (
              <button type="button" className="jr-page add" onClick={() => { setProject((p) => addPageTo(p)); setPageIndex(project.pages.length) }} aria-label="Sayfa ekle">+</button>
            )}
            <select className="jr-select" value={page.background} aria-label="Arka plan" onChange={(e) => setProject((p) => setBackground(p, pageIndex, e.target.value))}>
              {Object.entries(BACKGROUNDS).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}
            </select>
            {project.pages.length > 1 && (
              <button type="button" className="jr-btn small" onClick={() => { setProject((p) => removePageAt(p, pageIndex)); setPageIndex(Math.max(0, pageIndex - 1)) }}>Sayfayı sil</button>
            )}
          </div>
        )}
        <GoalsPanel status={goalStatus} />
        <div className="jrb-footer"><button type="button" className="jr-btn small" onClick={resetProject}>Projeyi başa döndür</button></div>
      </div>
    </div>
    </div>
  )
}
