'use client'
// Sahne Atölyesi — bütünleşik editör: sahne + sprite listesi + (Kod | Kostümler | Sesler). Ders oynatıcıya bağlanacak bileşen budur:
//   <SahneEditor activity={...} storageKey="ask:sahne:ders:scratch:3:1" onGoalsChange={(results, all) => ...} />
// Serbest atölye: <SahneEditor storageKey="ask:sahne:project:v1" />
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { evaluateGoals, type GoalEvaluation, type GoalResult, type SahneActivity } from '@/lib/sahne/activity'
import { setOptionProviders } from '@/lib/sahne/blockly-defs'
import { CHARACTERS } from '@/lib/sahne/gallery/characters'
import { PROJECT_STORAGE_KEY, allMessages, backdropFromGallery, emptyCostume, exportProject, loadProject, makeList, makeVar, newId, parseProject, renameCostumeRefs, saveProject, slugify, spriteFromCostumes, spriteFromGallery, starterProject, stateWithVariables, walkBlocks, targetsOf } from '@/lib/sahne/project'
import type { SahneSample } from '@/lib/sahne/samples'
import { makeSound } from '@/lib/sahne/sounds'
import { MAX_SPRITES, type BlockState, type Costume, type ProcDef, type SahneProject, type SoundRef, type SpriteDef, type VarDef } from '@/lib/sahne/types'
import { BlocksWorkspace, type BlocksHandle } from './blocks-workspace'
import { NameDialog, ProcDialog, ProjectDialog } from './dialogs'
import { CostumeEditor } from './costume-editor'
import { BackdropGallery, CharacterGallery, SoundGallery } from './galleries'
import { GoalsCard } from './goals-card'
import { SamplesDialog } from './samples-dialog'
import { SoundPanel } from './sound-panel'
import { SpritePanel } from './sprite-panel'
import { Stage, type StageSize } from './stage'
import { useSahnePlayer } from './use-player'
import { VariablesDialog } from './variables-dialog'
import './sahne.css'

export interface SahneEditorProps {
  /** Verilirse ders etkinliği kipi: başlangıç projesi, izinli bloklar, hedefler. */
  activity?: SahneActivity
  /** Projenin tarayıcıda saklanacağı anahtar (serbest atölye: 'ask:sahne:project:v1'). */
  storageKey: string
  /** Hedef durumu her değiştiğinde (ve ilk denetimde) çağrılır. */
  onGoalsChange?: (results: GoalResult[], allPassed: boolean) => void
}

type Tab = 'kod' | 'kostum' | 'ses'
type Dialog =
  | null
  | { t: 'var'; list: boolean }
  | { t: 'proc' }
  | { t: 'project' }
  | { t: 'vars' }
  | { t: 'samples' }
  | { t: 'message'; done: (name: string) => void }
  | { t: 'chars'; mode: 'sprite' | 'costume' }
  | { t: 'backdrops' }
  | { t: 'sounds' }

const STAGE_SIZE_KEY = 'ask:sahne:stage-size'
const DEFAULT_SOUND: Record<string, string> = { kedi: 'miyav', kopek: 'hav', kus: 'cik', balik: 'pop', elma: 'puan', 'altin-elma': 'puan', yildiz: 'puan', davul: 'davul', robot: 'bip', gemi: 'lazer', hayalet: 'pop' }

const uniqueName = (list: { name: string }[], base: string): string => {
  if (!list.some((x) => x.name === base)) return base
  const stem = base.replace(/\d+$/, '')
  let n = 2
  while (list.some((x) => x.name === `${stem}${n}`)) n++
  return `${stem}${n}`
}

export function SahneEditor({ activity, storageKey, onGoalsChange }: SahneEditorProps) {
  const [project, setProject] = useState<SahneProject>(() => (activity ? activity.starter() : starterProject()))
  const [loaded, setLoaded] = useState(false)
  const [progVer, setProgVer] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [selected, setSelected] = useState<string>(() => project.sprites[0]?.id ?? 'stage')
  const [tab, setTab] = useState<Tab>('kod')
  const [stageSize, setStageSize] = useState<StageSize>('large')
  const [dlg, setDlg] = useState<Dialog>(null)
  const [note, setNote] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<GoalEvaluation | null>(null)
  const [goalsOpen, setGoalsOpen] = useState(true)
  const blocks = useRef<BlocksHandle>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const projectRef = useRef(project); projectRef.current = project
  const selectedRef = useRef(selected); selectedRef.current = selected
  const onGoalsRef = useRef(onGoalsChange); onGoalsRef.current = onGoalsChange

  // ───────── değiştirme yardımcıları ─────────
  const edit = useCallback((fn: (p: SahneProject) => SahneProject, program = true) => {
    setProject((p) => fn(p))
    if (program) setProgVer((v) => v + 1)
  }, [])
  const editSprite = useCallback((id: string, fn: (s: SpriteDef) => SpriteDef, program = true) => edit((p) => ({ ...p, sprites: p.sprites.map((s) => (s.id === id ? fn(s) : s)) }), program), [edit])
  const editTarget = useCallback((id: string, fn: (d: { costumes: Costume[]; sounds: SoundRef[]; procs: ProcDef[]; blocks: BlockState }) => Partial<{ costumes: Costume[]; sounds: SoundRef[]; procs: ProcDef[]; blocks: BlockState }>, program = true) => {
    edit((p) => {
      if (id === 'stage') { const r = fn({ costumes: p.stage.backdrops, sounds: p.stage.sounds, procs: p.stage.procs, blocks: p.stage.blocks }); return { ...p, stage: { ...p.stage, ...(r.costumes ? { backdrops: r.costumes } : {}), ...(r.sounds ? { sounds: r.sounds } : {}), ...(r.procs ? { procs: r.procs } : {}), ...(r.blocks ? { blocks: r.blocks } : {}) } } }
      return { ...p, sprites: p.sprites.map((s) => (s.id === id ? { ...s, ...fn({ costumes: s.costumes, sounds: s.sounds, procs: s.procs, blocks: s.blocks }) } : s)) }
    }, program)
  }, [edit])

  const sprite = selected === 'stage' ? null : project.sprites.find((s) => s.id === selected) ?? null
  const targetDef = sprite ?? project.stage
  const costumes = sprite ? sprite.costumes : project.stage.backdrops
  const costumeIdx = sprite ? sprite.costume : project.stage.backdrop

  // seçili sprite silinmişse sahneye/ilk sprite'a dön
  useEffect(() => { if (selected !== 'stage' && !project.sprites.some((s) => s.id === selected)) setSelected(project.sprites[0]?.id ?? 'stage') }, [project.sprites, selected])
  useEffect(() => { if (selected === 'stage' && tab === 'kod') return; if (selected === 'stage' && tab === 'ses') return }, [selected, tab])

  // ───────── Blockly seçenek sağlayıcıları (etkin hedefe göre) ─────────
  const msgCache = useRef<{ p: SahneProject; m: string[] } | null>(null)
  useEffect(() => {
    setOptionProviders({
      costumes: () => { const p = projectRef.current; const id = selectedRef.current; return (id === 'stage' ? [] : p.sprites.find((s) => s.id === id)?.costumes ?? []).map((c) => c.name) },
      backdrops: () => projectRef.current.stage.backdrops.map((c) => c.name),
      sounds: () => { const p = projectRef.current; const id = selectedRef.current; return (id === 'stage' ? p.stage.sounds : p.sprites.find((s) => s.id === id)?.sounds ?? []).map((s) => s.name) },
      sprites: () => projectRef.current.sprites.filter((s) => s.id !== selectedRef.current).map((s) => ({ id: s.id, name: s.name })),
      messages: () => { const p = projectRef.current; if (msgCache.current?.p !== p) msgCache.current = { p, m: allMessages(p) }; return msgCache.current.m },
      askMessage: (done) => setDlg({ t: 'message', done }),
    })
  }, [])

  // ───────── oyuncu ─────────
  const player = useSahnePlayer(project, {
    progVer,
    selectedId: selected,
    onSelectSprite: (id) => setSelected(id),
    onMoveSprite: (id, x, y) => editSprite(id, (s) => ({ ...s, x, y }), false),
  })
  const { patchSprite } = player

  // ───────── kalıcılık ─────────
  useEffect(() => {
    try {
      const sz = localStorage.getItem(STAGE_SIZE_KEY)
      if (sz === 'small' || sz === 'large') setStageSize(sz)
    } catch { /* depolama kapalı */ }
    const saved = loadProject(storageKey)
    if (saved) { setProject(saved); setSelected(saved.sprites[0]?.id ?? 'stage'); setProgVer((v) => v + 1); setResetKey((k) => k + 1) }
    setLoaded(true)
  }, [storageKey])
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => { saveProject(project, storageKey) }, 450)
    return () => clearTimeout(t)
  }, [project, storageKey, loaded])
  const setSize = (s: StageSize) => { setStageSize(s); try { localStorage.setItem(STAGE_SIZE_KEY, s) } catch { /* yok say */ } }

  // ───────── hedefler ─────────
  useEffect(() => {
    if (!activity || !loaded) return
    const t = setTimeout(() => {
      try {
        const ev = evaluateGoals(activity, projectRef.current)
        setEvaluation(ev)
        onGoalsRef.current?.(ev.results.map(({ id, label, ok, hint, detail, optional }) => ({ id, label, ok, hint, detail, optional })), ev.allPassed)
      } catch (err) { console.error('Hedefler denetlenemedi', err) }
    }, 700)
    return () => clearTimeout(t)
  }, [activity, project, loaded])

  // ───────── bloklar ─────────
  const onBlocks = useCallback((state: BlockState, key: string) => {
    const id = key.split(':')[0]
    if (!id) return
    setProject((p) => {
      const vars = p.variables.map((v) => { const s = state.variables?.find((x) => x.id === v.id); return s && s.name !== v.name ? { ...v, name: s.name } : v })
      const stored: BlockState = { blocks: state.blocks, variables: state.variables }
      if (id === 'stage') return { ...p, variables: vars, stage: { ...p.stage, blocks: stored } }
      return { ...p, variables: vars, sprites: p.sprites.map((s) => (s.id === id ? { ...s, blocks: stored } : s)) }
    })
    setProgVer((v) => v + 1)
  }, [])

  const showBlock = (id: string | null | undefined) => { setTab('kod'); setTimeout(() => blocks.current?.focusBlock(id), 80) }

  const loadKey = `${selected}:${resetKey}`
  const wsState = useMemo(() => stateWithVariables(targetDef.blocks, project.variables), [targetDef.blocks, project.variables])
  const usedVarIds = useMemo(() => {
    const out = new Set<string>()
    for (const t of targetsOf(project)) walkBlocks(t.def.blocks, (b) => { for (const f of Object.values(b.fields ?? {})) { const id = (f as { id?: string } | undefined)?.id; if (typeof f === 'object' && f && typeof id === 'string') out.add(id) } })
    return out
  }, [project])
  const allProcs = useMemo(() => [...project.sprites.flatMap((s) => s.procs), ...project.stage.procs], [project.sprites, project.stage.procs])

  // ───────── sprite işlemleri ─────────
  const canAdd = project.sprites.length < MAX_SPRITES
  const placeNew = (i: number) => ({ x: ((i * 97) % 300) - 150, y: ((i * 53) % 180) - 90 })
  const addCharacter = (charId: string) => {
    if (!canAdd) return
    setDlg(null)
    const ch = CHARACTERS.find((c) => c.id === charId)
    if (!ch) return
    const id = newId('s')
    const snd = DEFAULT_SOUND[charId]
    const sp = spriteFromGallery(charId, { id, name: uniqueName(projectRef.current.sprites, ch.name), sounds: snd ? [makeSound(snd)] : [], ...placeNew(projectRef.current.sprites.length) })
    edit((p) => ({ ...p, sprites: [...p.sprites, sp] }))
    setSelected(id)
    setTab('kod')
  }
  const addBlank = () => {
    if (!canAdd) return
    setDlg(null)
    const id = newId('s')
    const sp = spriteFromCostumes([emptyCostume('kostüm1')], { id, name: uniqueName(projectRef.current.sprites, 'Sprite1'), ...placeNew(projectRef.current.sprites.length) })
    edit((p) => ({ ...p, sprites: [...p.sprites, sp] }))
    setSelected(id)
    setTab('kostum')
  }
  const addRandom = () => addCharacter(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id)
  const deleteSprite = (id: string) => {
    const s = projectRef.current.sprites.find((x) => x.id === id)
    if (!s) return
    const hasCode = (s.blocks.blocks?.blocks ?? []).length > 0
    if (hasCode && !window.confirm(`"${s.name}" sprite'ı ve kodu silinsin mi?`)) return
    edit((p) => ({ ...p, sprites: p.sprites.filter((x) => x.id !== id) }))
  }
  const addBackdrop = (gid: string) => {
    setDlg(null)
    const c = backdropFromGallery(gid)
    edit((p) => {
      const taken = p.stage.backdrops
      const named = { ...c, id: newId('c'), name: uniqueName(taken, c.name) }
      return { ...p, stage: { ...p.stage, backdrops: [...taken, named], backdrop: taken.length } }
    })
    setSelected('stage')
    setTab('kostum')
  }
  const spritePatch = (id: string, patch: { x?: number; y?: number; dir?: number; size?: number; visible?: boolean; name?: string }) => {
    const { name, ...rest } = patch
    if (name !== undefined) editSprite(id, (s) => ({ ...s, name: name.slice(0, 30) }), false)
    if (Object.keys(rest).length) {
      editSprite(id, (s) => ({ ...s, ...rest, ...(rest.dir !== undefined ? { dir: Math.max(-180, Math.min(180, rest.dir)) } : {}), ...(rest.size !== undefined ? { size: Math.max(5, Math.min(800, rest.size)) } : {}) }), false)
      patchSprite(id, rest)
    }
  }

  // ───────── kostüm / ses ─────────
  const onCostumes = (list: Costume[], i: number) => {
    if (list === costumes) {
      if (sprite) { editSprite(sprite.id, (s) => ({ ...s, costume: i }), false); patchSprite(sprite.id, { costume: i }) }
      else edit((p) => ({ ...p, stage: { ...p.stage, backdrop: i } }), true)
      return
    }
    if (sprite) editSprite(sprite.id, (s) => ({ ...s, costumes: list, costume: i }))
    else edit((p) => ({ ...p, stage: { ...p.stage, backdrops: list, backdrop: i } }))
  }
  const renameRefs = (kind: 'costume' | 'backdrop' | 'sound', from: string, to: string) => {
    edit((p) => {
      const upd = (st: BlockState): BlockState => renameCostumeRefs(st, kind, from, to)
      if (kind === 'backdrop') return { ...p, stage: { ...p.stage, blocks: upd(p.stage.blocks) }, sprites: p.sprites.map((s) => ({ ...s, blocks: upd(s.blocks) })) }
      if (selectedRef.current === 'stage') return { ...p, stage: { ...p.stage, blocks: upd(p.stage.blocks) } }
      return { ...p, sprites: p.sprites.map((s) => (s.id === selectedRef.current ? { ...s, blocks: upd(s.blocks) } : s)) }
    })
    setResetKey((k) => k + 1)
  }
  const addSound = (gid: string) => {
    setDlg(null)
    editTarget(selected, (d) => ({ sounds: [...d.sounds, makeSound(gid, uniqueName(d.sounds, makeSound(gid).name))] }))
  }

  // ───────── değişken / blok yap ─────────
  const createVar = (name: string, list: boolean) => {
    setDlg(null)
    edit((p) => ({ ...p, variables: [...p.variables, list ? makeList(name) : makeVar(name)] }))
  }
  const createProc = (name: string, params: string[]) => {
    setDlg(null)
    const proc: ProcDef = { id: newId('p'), name, params }
    editTarget(selected, (d) => ({ procs: [...d.procs, proc] }))
    setTab('kod')
    setTimeout(() => blocks.current?.addProcDef(proc), 120)
  }

  // ───────── dosya / yeni ─────────
  const replaceProject = (p: SahneProject, message?: string) => {
    player.stop()
    setProject(p)
    setSelected(p.sprites[0]?.id ?? 'stage')
    setProgVer((v) => v + 1)
    setResetKey((k) => k + 1)
    setNote(message ?? null)
    setTab('kod')
    setTimeout(() => player.reset(), 0)
  }
  const exportJson = () => {
    const blob = new Blob([exportProject(project)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(project.name, 'projem')}.sahne.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNote('Projen bir dosya olarak indirildi.')
  }
  const importJson = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 3_000_000) { setNote('Dosya çok büyük (en çok 3 MB).'); return }
    const p = parseProject(await file.text())
    if (!p) { setNote('Bu dosya geçerli bir Sahne Atölyesi projesi değil.'); return }
    replaceProject(p, `"${p.name}" projesi açıldı.`)
  }
  const pickSample = (smp: SahneSample) => { setDlg(null); replaceProject(smp.project(), `"${smp.name}" örneği açıldı. Bloklarını değiştirip dene!`) }
  const newProject = () => { if (window.confirm('Yeni bir proje başlatılsın mı? Şu anki çalışmanın üzerine yazılır (önce Kaydet ile indirebilirsin).')) replaceProject(starterProject(), 'Yeni proje başlatıldı.') }
  const resetActivity = () => { if (activity && window.confirm('Etkinliğin başlangıç haline dönülsün mü? Yaptıkların silinir.')) replaceProject(activity.starter(), 'Etkinlik başa döndü.') }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'kod', label: 'Kod', icon: '🧩' },
    { id: 'kostum', label: sprite ? 'Kostümler' : 'Arka planlar', icon: '🎨' },
    { id: 'ses', label: 'Sesler', icon: '🔊' },
  ]

  return (
    <div className="sh-root" data-activity={!!activity} data-size={stageSize} data-testid="sahne-editor">
      <div className="sh-top">
        {activity ? <h2 className="sh-title">{activity.title}</h2> : (
          <label className="sh-name"><span className="sr-only">Proje adı</span>
            <input type="text" value={project.name} maxLength={60} onChange={(e) => edit((p) => ({ ...p, name: e.target.value }), false)} aria-label="Proje adı" data-testid="sahne-project-title" />
          </label>
        )}
        <span className="sh-spacer" />
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDlg({ t: 'project' })} data-testid="sahne-project-info">📝 Proje bilgisi</button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDlg({ t: 'vars' })} data-testid="sahne-vars-btn">▤ Değişkenler</button>
        {activity && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setGoalsOpen(true)} disabled={goalsOpen} data-testid="sahne-goals-open">◎ Hedefler{evaluation ? ` ${evaluation.results.filter((g) => !g.optional && g.ok).length}/${evaluation.results.filter((g) => !g.optional).length}` : ''}</button>}
        {!activity && (
          <>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDlg({ t: 'samples' })} data-testid="sahne-samples-btn">🎮 Örnekler</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={newProject} data-testid="sahne-new">＋ Yeni</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fileInput.current?.click()}>📂 Aç</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportJson} data-testid="sahne-export">💾 Kaydet</button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = '' }} data-testid="sahne-import" />
          </>
        )}
        {activity && <button type="button" className="btn btn-sm btn-ghost" onClick={resetActivity}>↺ Başa dön</button>}
      </div>
      {note && <p className="sh-toast" role="status" onClick={() => setNote(null)}>{note}</p>}

      <div className="sh-main">
        <aside className="sh-side">
          <Stage player={player} size={stageSize} onSize={setSize} project={project} sprite={sprite} lockNames={!!activity} onSpritePatch={spritePatch} onShowBlock={showBlock} />
          <SpritePanel project={project} selected={selected} onSelect={setSelected} onDelete={deleteSprite}
            onAddCharacter={() => setDlg({ t: 'chars', mode: 'sprite' })} onDraw={addBlank} onRandom={addRandom} onAddBackdrop={() => setDlg({ t: 'backdrops' })} canAdd={canAdd} />
        </aside>

        <section className="sh-work" aria-label="Düzenleme alanı">
          <div className="sh-tabs" role="tablist" aria-label="Düzenleme sekmeleri">
            {tabs.map((t) => (
              <button key={t.id} type="button" role="tab" id={`sh-tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`sh-panel-${t.id}`} className="sh-tab" onClick={() => setTab(t.id)} data-testid={`sahne-tab-${t.id}`}>
                <span aria-hidden="true">{t.icon}</span> {t.label}
              </button>
            ))}
            <span className="sh-spacer" />
            <span className="sh-target" title="Düzenlenen hedef">{sprite ? sprite.name : 'Sahne'}</span>
            {tab === 'kod' && (
              <>
                <button type="button" className="sh-tab-act" onClick={() => blocks.current?.undo()} title="Geri al" aria-label="Geri al">↶</button>
                <button type="button" className="sh-tab-act" onClick={() => blocks.current?.redo()} title="Yinele" aria-label="Yinele">↷</button>
                <button type="button" className="sh-tab-act" onClick={() => blocks.current?.arrange()} title="Blokları düzenle">⇅ Düzenle</button>
              </>
            )}
          </div>
          <div className="sh-panels">
            <div role="tabpanel" id="sh-panel-kod" aria-labelledby="sh-tab-kod" hidden={tab !== 'kod'} className="sh-panel">
              <BlocksWorkspace ref={blocks} state={wsState} loadKey={loadKey} onChange={onBlocks} allowedBlocks={activity?.allowedBlocks}
                procs={targetDef.procs} allProcs={allProcs} vars={project.variables} onNewVar={(k) => setDlg({ t: 'var', list: k === 'list' })} onNewProc={() => setDlg({ t: 'proc' })}
                glowIds={player.glow} onRunStack={(top) => player.runStack(selected, top)} />
            </div>
            <div role="tabpanel" id="sh-panel-kostum" aria-labelledby="sh-tab-kostum" hidden={tab !== 'kostum'} className="sh-panel sh-panel-scroll">
              {tab === 'kostum' && (
                <CostumeEditor costumes={costumes} index={costumeIdx} kind={sprite ? 'sprite' : 'backdrop'} onChange={onCostumes}
                  onRename={(from, to) => renameRefs(sprite ? 'costume' : 'backdrop', from, to)}
                  onOpenGallery={() => setDlg(sprite ? { t: 'chars', mode: 'costume' } : { t: 'backdrops' })} />
              )}
            </div>
            <div role="tabpanel" id="sh-panel-ses" aria-labelledby="sh-tab-ses" hidden={tab !== 'ses'} className="sh-panel sh-panel-scroll">
              {tab === 'ses' && <SoundPanel sounds={targetDef.sounds} onChange={(s) => editTarget(selected, () => ({ sounds: s }))} onRename={(from, to) => renameRefs('sound', from, to)} onAdd={() => setDlg({ t: 'sounds' })} />}
            </div>
            {activity && tab === 'kod' && (
              <GoalsCard intro={activity.intro} results={evaluation ? evaluation.results : null} error={evaluation?.error ?? null} open={goalsOpen} onOpenChange={setGoalsOpen} />
            )}
          </div>
        </section>
      </div>

      {dlg?.t === 'var' && (
        <NameDialog title={dlg.list ? 'Liste oluştur' : 'Değişken oluştur'} label={dlg.list ? 'Listenin adı' : 'Değişkenin adı'} placeholder={dlg.list ? 'sorular' : 'skor'} okText="Oluştur"
          help={dlg.list ? 'Liste, birçok değeri sırayla tutan bir kutudur.' : 'Değişken, üzerine isim yazılı bir kutudur: içine sayı ya da yazı koyabilirsin. Tüm sprite\'lar kullanabilir.'}
          validate={(n) => (project.variables.some((v) => v.name.toLocaleLowerCase('tr') === n.toLocaleLowerCase('tr')) ? 'Bu adda bir değişken ya da liste zaten var.' : null)}
          onOk={(n) => createVar(n, dlg.list)} onClose={() => setDlg(null)} testid="sahne-var-dialog" />
      )}
      {dlg?.t === 'proc' && <ProcDialog existing={targetDef.procs.map((p) => p.name)} onOk={createProc} onClose={() => setDlg(null)} />}
      {dlg?.t === 'project' && <ProjectDialog name={project.name} notes={project.notes} lockName={false} onOk={(n, t) => { setDlg(null); edit((p) => ({ ...p, name: n, notes: t }), false) }} onClose={() => setDlg(null)} />}
      {dlg?.t === 'vars' && <VariablesDialog project={project} usedIds={usedVarIds} onChange={(vars) => edit((p) => ({ ...p, variables: vars }))} onClose={() => setDlg(null)} />}
      {dlg?.t === 'message' && (
        <NameDialog title="Yeni mesaj" label="Mesajın adı" placeholder="sıra sende" okText="Oluştur" help={'Bir karakter bu mesajı yayınlayınca, onu "alınca" bloğuyla bekleyen karakterler çalışır.'}
          onOk={(n) => { const done = dlg.done; setDlg(null); edit((p) => ({ ...p, messages: p.messages.includes(n) ? p.messages : [...p.messages, n] }), false); setTimeout(() => done(n), 30) }} onClose={() => setDlg(null)} testid="sahne-message-dialog" />
      )}
      {dlg?.t === 'chars' && <CharacterGallery onPick={(id) => (dlg.mode === 'costume' ? addCostumesFromChar(id) : addCharacter(id))} onDraw={addBlank} onClose={() => setDlg(null)} />}
      {dlg?.t === 'backdrops' && <BackdropGallery onPick={addBackdrop} onClose={() => setDlg(null)} />}
      {dlg?.t === 'samples' && <SamplesDialog onPick={pickSample} onClose={() => setDlg(null)} />}
      {dlg?.t === 'sounds' && <SoundGallery onPick={addSound} onClose={() => setDlg(null)} />}
    </div>
  )

  // Kostüm sekmesindeyken galeriden seçilen karakterin kostümleri, seçili sprite'a eklenir.
  function addCostumesFromChar(charId: string) {
    setDlg(null)
    const ch = CHARACTERS.find((c) => c.id === charId)
    if (!ch || !sprite) return
    const fresh = ch.costumes.map((c) => ({ ...c, id: newId('c'), name: uniqueName(sprite.costumes, c.name), shapes: c.shapes.map((x) => ({ ...x })) }))
    const added: Costume[] = []
    for (const c of fresh) added.push({ ...c, name: uniqueName([...sprite.costumes, ...added], c.name) })
    editSprite(sprite.id, (s) => ({ ...s, costumes: [...s.costumes, ...added], costume: s.costumes.length }))
  }
}

export { PROJECT_STORAGE_KEY }
