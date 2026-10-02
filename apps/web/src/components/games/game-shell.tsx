'use client'
// Ortak oyun çerçevesi: seviye çubuğu, hedef kutusu, sahne (oyuna özgü), Blockly çalışma alanı, çalıştır/sıfırla,
// blok sayacı, başarı penceresi ve "Kodu göster". Oyunlar yalnız GameDef verir (bkz. lib/games/README.md).
import Link from 'next/link'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/shell/icons'
import { toJavaScript } from '@/lib/games/codegen'
import { runProgram } from '@/lib/games/interpreter'
import { emptyProgram, parseProgram, type ProgramState } from '@/lib/games/program'
import { loadProgram, markLevelDone, saveProgram } from '@/lib/games/progress'
import type { GameDef, GameRun, RunOutcome } from '@/lib/games/types'
import { GameCredit } from './credit'
import { GameWorkspace } from './game-workspace'
import { Modal } from './modal'
import { useGameProgress } from './use-progress'
import './games.css'

const LEVELS = 10

export function GameShell({ game, initialLevel = 1 }: { game: GameDef; initialLevel?: number }) {
  const progress = useGameProgress()
  const done = progress[game.slug]?.done ?? []
  const total = Math.min(game.levels.length, LEVELS)

  const [levelNo, setLevelNo] = useState(() => Math.min(Math.max(1, initialLevel), total))
  const level = game.levels[levelNo - 1]

  const Scene = useMemo(() => lazy(game.scene), [game])
  const initialRun = useMemo(() => game.engine.createRun(level, { seed: 1 }), [game, level])
  const [frame, setFrame] = useState<unknown>(() => initialRun.snapshot())
  const [running, setRunning] = useState(false)
  const [outcome, setOutcome] = useState<RunOutcome | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [blocks, setBlocks] = useState(0)
  const [speed, setSpeed] = useState(game.speed?.default ?? 1)
  const [dialog, setDialog] = useState<'success' | 'code' | null>(null)
  const [hintOpen, setHintOpen] = useState(false)
  const [fails, setFails] = useState(0)
  const [usedBlocks, setUsedBlocks] = useState(0)
  const [wsKey, setWsKey] = useState(0)

  const programRef = useRef<ProgramState>(emptyProgram())
  const abortRef = useRef<AbortController | null>(null)
  const runRef = useRef<GameRun | null>(null)
  const speedRef = useRef(speed)
  speedRef.current = speed
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Açılış programı: kayıtlı (bozuk değilse) ya da seviyenin başlangıç blokları.
  const initialProgram = useMemo<ProgramState | null>(() => {
    if (typeof window === 'undefined') return null
    return parseProgram(loadProgram(game.slug, level.id)) ?? level.startBlocks ?? null
  }, [game.slug, level])

  const stop = useCallback(() => { abortRef.current?.abort(); abortRef.current = null }, [])

  const resetScene = useCallback(() => {
    stop()
    const r = game.engine.createRun(level, { seed: 1 })
    runRef.current = r
    setFrame(r.snapshot())
    setOutcome(null)
    setMessage(null)
    setHighlight(null)
    setRunning(false)
  }, [game, level, stop])

  useEffect(() => () => { stop(); if (saveTimer.current) clearTimeout(saveTimer.current) }, [stop])

  const goLevel = useCallback((n: number) => {
    if (n < 1 || n > total || n === levelNo) return
    stop()
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
    setLevelNo(n)
    setDialog(null); setHintOpen(false); setFails(0); setBlocks(0); setWsKey((k) => k + 1)
    programRef.current = emptyProgram()
    try { window.history.replaceState(null, '', `?seviye=${n}`) } catch { /* yoksay */ }
  }, [levelNo, stop, total])

  // Seviye değişince sahneyi başa al.
  useEffect(() => { resetScene() }, [resetScene])

  const onProgramChange = useCallback((p: ProgramState, count: number) => {
    programRef.current = p
    setBlocks(count)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveProgram(game.slug, level.id, count > 0 ? p : null), 400)
  }, [game.slug, level.id])

  const overLimit = level.maxBlocks !== undefined && blocks > level.maxBlocks

  const run = useCallback(async () => {
    if (running) return
    if (blocks === 0) { setMessage('Önce çalışma alanına blok ekle.'); return }
    if (overLimit) { setMessage(`En fazla ${level.maxBlocks} blok kullanabilirsin.`); return }
    const gr = game.engine.createRun(level, { seed: 1 })
    runRef.current = gr
    const prog = programRef.current
    const ac = new AbortController()
    abortRef.current = ac
    setFrame(gr.snapshot()); setOutcome(null); setMessage(null); setRunning(true)
    const base = game.stepDelay ?? 450
    const res = await runProgram(prog, gr.api, {
      signal: ac.signal,
      seed: 1,
      maxSteps: level.maxSteps ?? game.maxSteps,
      stepDelay: (info) => (gr.stepDelay?.(info) ?? base) / Math.max(0.1, speedRef.current),
      onHighlight: setHighlight,
      onStep: (info) => { if (info.wait) setFrame(gr.snapshot()) },
    })
    if (abortRef.current === ac) abortRef.current = null
    if (res.reason === 'stopped') return
    setRunning(false)
    setFrame(gr.snapshot())
    const out = gr.evaluate(res)
    setOutcome(out)
    if (out.ok) {
      setUsedBlocks(blocks)
      markLevelDone(game.slug, level.id, blocks)
      setDialog('success')
    } else {
      setFails((f) => f + 1)
      setMessage(
        res.reason === 'error' ? `Bir sorun oldu: ${res.message ?? 'program çalışamadı'}`
          : res.reason === 'limit' ? 'Program bitmedi. Sonsuz bir döngü olabilir mi?'
            : (out.message ?? 'Henüz hedefe ulaşamadın. Tekrar dene!'),
      )
    }
  }, [blocks, game, level, overLimit, running])

  const code = useMemo(() => (dialog === 'code' ? toJavaScript(programRef.current, game.blocks) : ''), [dialog, game.blocks])

  const hintShown = hintOpen || fails >= 3
  const next = levelNo < total ? levelNo + 1 : null

  return (
    <div className="gm" style={{ ['--gm-aspect' as string]: game.stageAspect ?? '1 / 1' }}>
      <header className="gm-head">
        <div className="gm-title-row">
          <Link href="/oyunlar" className="gm-back" aria-label="Oyunlar listesine dön" title="Tüm oyunlar"><Icon name="arrowLeft" size={20} /></Link>
          <h1 className="gm-title">{game.title}</h1>
        </div>
        <nav className="gm-levels" aria-label="Seviyeler">
          {game.levels.slice(0, total).map((l) => {
            const isDone = done.includes(l.id)
            return (
              <button key={l.id} type="button" className="gm-level" data-done={isDone} aria-current={l.id === levelNo ? 'step' : undefined}
                aria-label={`Seviye ${l.id}${isDone ? ', tamamlandı' : ''}`} onClick={() => goLevel(l.id)}>
                {isDone ? <Icon name="check" size={16} /> : l.id}
              </button>
            )
          })}
        </nav>
      </header>

      <section className="gm-goal" aria-label="Seviye hedefi">
        <div className="gm-goal-main">
          <span className="gm-goal-badge"><Icon name="target" size={16} /> Seviye {levelNo}</span>
          <p className="gm-goal-text">{level.intro}</p>
          {level.hint && (
            <button type="button" className="gm-hint-btn" aria-expanded={hintShown} onClick={() => setHintOpen((o) => !o)}>
              <Icon name="spark" size={16} /> {hintShown ? 'İpucunu gizle' : 'İpucu'}
            </button>
          )}
        </div>
        {level.hint && hintShown && <p className="gm-hint" role="note">{level.hint}</p>}
      </section>

      <div className="gm-main">
        <div className="gm-left">
          <div className="gm-stage" data-running={running}>
            <Suspense fallback={<div className="gm-stage-loading muted">Sahne yükleniyor…</div>}>
              <Scene level={level} frame={frame} running={running} speed={speed} outcome={outcome} />
            </Suspense>
          </div>
          <div className="gm-controls">
            <button type="button" className="gm-round gm-run" onClick={run} disabled={running} aria-label="Çalıştır" title="Çalıştır"><Icon name="play" size={26} /></button>
            <button type="button" className="gm-round gm-reset" onClick={resetScene} aria-label="Sıfırla" title="Sıfırla"><Icon name="reset" size={24} /></button>
            {game.speed && (
              <label className="gm-speed">
                <span>Hız</span>
                <input type="range" min={game.speed.min} max={game.speed.max} step={0.25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Hız" />
              </label>
            )}
            <button type="button" className="gm-code-btn" onClick={() => setDialog('code')}><Icon name="code" size={18} /> Kodu göster</button>
          </div>
          <p className="gm-status" role="status" aria-live="polite" data-kind={outcome?.ok ? 'ok' : message ? 'warn' : 'idle'}>
            {message ?? (outcome?.ok ? (outcome.message ?? 'Başardın!') : '')}
          </p>
        </div>

        <div className="gm-right">
          <div className="gm-ws-bar">
            <span className="gm-count" data-over={overLimit} aria-live="polite">
              Blok: <b>{blocks}</b>{level.maxBlocks !== undefined ? <> / {level.maxBlocks}</> : null}
            </span>
          </div>
          <GameWorkspace key={`${game.slug}-${wsKey}-${levelNo}`} game={game} level={level} initial={initialProgram} readOnly={running} highlightId={highlight} onChange={onProgramChange} />
        </div>
      </div>

      <GameCredit />

      <Modal open={dialog === 'success'} onClose={() => setDialog(null)} title={next ? 'Tebrikler!' : 'Oyunu bitirdin!'}>
        <p className="gm-modal-text">
          {next ? `Seviye ${levelNo} tamam.` : `${game.title} oyununun tüm seviyelerini geçtin. Harikasın!`}{' '}
          <b>{usedBlocks}</b> blok kullandın{level.maxBlocks !== undefined ? ` (sınır ${level.maxBlocks})` : ''}.
        </p>
        <div className="gm-modal-actions">
          {next ? (
            <button type="button" className="btn btn-primary" onClick={() => goLevel(next)}>Sonraki seviye <Icon name="arrowRight" size={18} /></button>
          ) : (
            <Link href="/oyunlar" className="btn btn-primary">Oyunlara dön</Link>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => { setDialog(null); resetScene() }}>Tekrar</button>
          <button type="button" className="btn btn-ghost" onClick={() => setDialog('code')}><Icon name="code" size={18} /> Kodu göster</button>
        </div>
      </Modal>

      <Modal open={dialog === 'code'} onClose={() => setDialog(null)} title="JavaScript karşılığı" wide>
        <p className="gm-modal-text muted">Bloklarının yazılı kod hali. Yalnızca okunabilir; düzenlemek için blokları kullan.</p>
        <pre className="gm-code" tabIndex={0} aria-label="Üretilen JavaScript kodu"><code>{code.trim() ? code : '// Henüz blok yok'}</code></pre>
        <div className="gm-modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>Kapat</button></div>
      </Modal>
    </div>
  )
}
