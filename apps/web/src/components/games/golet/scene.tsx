'use client'
// Gölet sahnesi: havuz + skor tablosu + (blok kipi: kareleri oynat) + (JavaScript kipi: kod düzenleyici, çalıştırma, hızlandırma, tekrar izleme).
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { markLevelDone } from '@/lib/games/progress'
import { outcomeMessage } from '@/lib/games/golet/engine'
import { getRecording } from '@/lib/games/golet/recording'
import { duckDisplayName, ranking, type PondData, type PondFrame } from '@/lib/games/golet/sim'
import { STARTER, TEMPLATES } from '@/lib/games/golet/templates'
import { goletErrorEn, runInWorker } from '@/lib/games/golet/text-client'
import { useLocale, useT } from '@/i18n/client'
import type { MessageKey } from '@/i18n'
import type { SceneProps } from '@/lib/games/types'
import { CodeEditor } from './code-editor'
import { PondSvg } from './pond-svg'
import './golet.css'

const CODE_KEY = 'ask:golet:code:v1'
const loadCode = (level: number): string => {
  try { const v = JSON.parse(localStorage.getItem(CODE_KEY) ?? '{}') as Record<string, unknown>; const c = v[String(level)]; return typeof c === 'string' ? c : STARTER } catch { return STARTER }
}
const saveCode = (level: number, code: string) => {
  try {
    const v = JSON.parse(localStorage.getItem(CODE_KEY) ?? '{}') as Record<string, unknown>
    localStorage.setItem(CODE_KEY, JSON.stringify({ ...(v && typeof v === 'object' ? v : {}), [String(level)]: code }))
  } catch { /* depolama yok: sorun değil */ }
}

interface Play { frames: PondFrame[]; i: number; kind: 'js' | 'replay' | 'settle' }
interface JsResult { won: boolean; message: string; frames: PondFrame[] }

/** Komut yardımı: imza ve açıklama metinleri studios.gamesB.golet.help.<ad> altında. */
const HELP = ['swim', 'cannon', 'scan', 'health', 'xy', 'speed', 'hafiza'] as const

export default function Scene({ level, frame, running, outcome }: SceneProps<PondFrame>) {
  const t = useT()
  const en = useLocale() === 'en'
  const data = level.data as PondData
  const [mode, setMode] = useState<'blocks' | 'js'>('blocks')
  const [editing, setEditing] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const [code, setCode] = useState(STARTER)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [js, setJs] = useState<JsResult | null>(null)
  const [play, setPlay] = useState<Play | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speedX, setSpeedX] = useState(2)
  const lastOutcome = useRef<unknown>(null)

  // Seviye değişince yerel durumu sıfırla; kayıtlı kodu yükle.
  useEffect(() => {
    setCode(loadCode(level.id)); setErr(null); setJs(null); setPlay(null); setPlaying(false); setEditing(true); setHelpOpen(false); lastOutcome.current = null
  }, [level.id])

  // Kabuğun "Çalıştır"ı: bloklara dön ve canlı kareleri göster.
  useEffect(() => {
    if (running) { setMode('blocks'); setPlay(null); setPlaying(false) }
  }, [running])
  // Kabuk sahneyi sıfırlarsa (yeni kayıt) eski oynatmayı bırak.
  useEffect(() => { setPlay((p) => (p && p.kind !== 'js' ? null : p)); lastOutcome.current = null }, [frame.recId])

  // Blok çalışması bitince: program bittikten sonraki (havadaki toplar) kareleri oynat.
  useEffect(() => {
    if (!outcome || running || lastOutcome.current === outcome) return
    lastOutcome.current = outcome
    const rec = getRecording(frame.recId)
    if (rec && rec.length - 1 > frame.tick) { setPlay({ frames: rec, i: frame.tick, kind: 'settle' }); setPlaying(true) }
  }, [outcome, running, frame.recId, frame.tick])

  // Oynatma döngüsü: ~30 fps, hız çarpanı kadar kare atlar.
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPlay((p) => {
        if (!p) return p
        const step = p.kind === 'settle' ? 2 : speedX
        const i = Math.min(p.frames.length - 1, p.i + step)
        return { ...p, i }
      })
    }, 33)
    return () => clearInterval(id)
  }, [playing, speedX])
  useEffect(() => { if (play && playing && play.i >= play.frames.length - 1) setPlaying(false) }, [play, playing])

  const shown: PondFrame = play ? play.frames[Math.min(play.i, play.frames.length - 1)] : frame
  const finished = !!play && !playing && play.i >= play.frames.length - 1
  const recFrames = js && mode === 'js' ? js.frames : outcome && !running ? getRecording(frame.recId) : undefined

  const run = useCallback(async () => {
    if (busy) return
    setBusy(true); setErr(null)
    saveCode(level.id, code)
    const r = await runInWorker(code, data, 1)
    setBusy(false)
    if (!r.ok) { setErr(en ? goletErrorEn(r.error) : r.error); return }
    const m = r.result
    if (m.error) { setErr(en ? goletErrorEn(m.error) : m.error); return }
    const last = m.frames[m.frames.length - 1]
    const message = outcomeMessage(last, m.won, en)
    setJs({ won: m.won, message, frames: m.frames })
    if (m.won) markLevelDone('golet', level.id)
    setEditing(false)
    setPlay({ frames: m.frames, i: 0, kind: 'js' })
    setPlaying(true)
  }, [busy, code, data, level.id, en])

  const replay = () => {
    const frames = recFrames
    if (!frames) return
    setPlay({ frames, i: 0, kind: 'replay' }); setPlaying(true); setEditing(false)
  }

  const board = shown.ducks
  const ranks = useMemo(() => (shown.over ? new Map(ranking(shown).map((d, i) => [d.id, i + 1])) : null), [shown])
  const showEditor = mode === 'js' && editing
  const nextHref = level.id < 10 ? `?seviye=${level.id + 1}` : '/oyunlar'

  return (
    <div className="gl">
      <PondSvg frame={shown} />

      <div className="gl-board" aria-hidden={showEditor}>
        {board.map((d) => (
          <div key={d.id} className="gl-chip" data-dead={!d.alive}>
            <span className="gl-chip-dot" style={{ background: d.color }} />
            {ranks && <span className="gl-chip-rank">{ranks.get(d.id)}.</span>}
            <span className="gl-chip-name">{duckDisplayName(d, en)}</span>
            <span className="gl-chip-bar"><span data-low={d.hp <= 25} style={{ width: `${d.hp}%` }} /></span>
            <span className="gl-chip-hp">{Math.round(d.hp)}</span>
          </div>
        ))}
      </div>

      {!showEditor && <div className="gl-tick" aria-hidden="true">{t('studios.gamesB.golet.tick', { n: shown.tick, max: shown.maxTicks })}</div>}

      {finished && mode === 'js' && js && (
        <div className="gl-result" data-ok={js.won} role="status">
          <h3>{js.won ? t('studios.gamesB.golet.won') : t('studios.gamesB.golet.lost')}</h3>
          <p>{js.message}</p>
          <div className="gl-result-actions">
            {js.won && <a className="gl-primary" href={nextHref}>{level.id < 10 ? t('studios.gamesB.golet.nextChallenge') : t('studios.gamesB.golet.backToGames')}</a>}
            <button type="button" onClick={replay}>{t('studios.gamesB.golet.replay')}</button>
            <button type="button" onClick={() => { setEditing(true); setPlay(null) }}>{t('studios.gamesB.golet.editCode')}</button>
          </div>
        </div>
      )}

      <div className="gl-bar" data-editor={showEditor}>
        <div className="gl-seg" role="group" aria-label={t('studios.gamesB.golet.modeLabel')}>
          <button type="button" aria-pressed={mode === 'blocks'} onClick={() => { setMode('blocks'); setEditing(true) }}>{t('studios.gamesB.golet.blocks')}</button>
          <button type="button" aria-pressed={mode === 'js'} onClick={() => { setMode('js'); setEditing(!js || !play) }} disabled={running}>JavaScript</button>
        </div>
        {!showEditor && (
          <div className="gl-right">
            {play && playing && (
              <button type="button" className="gl-pill" onClick={() => { setSpeedX((s) => (s >= 8 ? 1 : s * 2)) }} aria-label={t('studios.gamesB.golet.speedLabel', { n: speedX })}>×{speedX}</button>
            )}
            {play && playing && <button type="button" className="gl-pill" onClick={() => setPlay((p) => (p ? { ...p, i: p.frames.length - 1 } : p))}>{t('studios.gamesB.golet.skipToEnd')}</button>}
            {recFrames && !playing && !finished && <button type="button" className="gl-pill" onClick={replay}>{t('studios.gamesB.golet.replay')}</button>}
            {recFrames && !playing && finished && mode === 'blocks' && <button type="button" className="gl-pill" onClick={replay}>{t('studios.gamesB.golet.replay')}</button>}
            {mode === 'js' && !playing && !busy && <button type="button" className="gl-pill" onClick={() => { setEditing(true); setPlay(null) }}>{t('studios.gamesB.golet.editCode')}</button>}
          </div>
        )}
      </div>

      {showEditor && (
        <div className="gl-editor">
          <div className="gl-ed-head">
            <h2 className="gl-ed-title">{t('studios.gamesB.golet.jsTitle')}</h2>
            <select className="gl-select" aria-label={t('studios.gamesB.golet.pickSample')} value="" onChange={(e) => { const tp = TEMPLATES.find((x) => x.id === e.target.value); if (tp) { setCode(tp.code); setErr(null) } }}>
              <option value="">{t('studios.gamesB.golet.sampleCode')}</option>
              {TEMPLATES.map((tp) => <option key={tp.id} value={tp.id}>{en ? tp.nameEn : tp.name}</option>)}
            </select>
            <button type="button" className="gl-select" onClick={() => setHelpOpen((o) => !o)} aria-expanded={helpOpen}>{helpOpen ? t('studios.gamesB.golet.showCode') : t('studios.gamesB.golet.commands')}</button>
          </div>
          {helpOpen ? (
            <div className="gl-help">
              <h3>{t('studios.gamesB.golet.commands')}</h3>
              <dl>{HELP.map((k) => (<Fragment key={k}><dt>{t(`studios.gamesB.golet.help.${k}.sig` as MessageKey)}</dt><dd>{t(`studios.gamesB.golet.help.${k}.text` as MessageKey)}</dd></Fragment>))}</dl>
              <p>{t('studios.gamesB.golet.helpNoteBefore')}<code>while (true)</code>{t('studios.gamesB.golet.helpNoteAfter')}</p>
            </div>
          ) : (
            <CodeEditor value={code} onChange={(v) => { setCode(v); saveCode(level.id, v) }} onRun={run} disabled={busy} />
          )}
          <div className="gl-ed-foot">
            <button type="button" className="gl-run" onClick={run} disabled={busy}>{busy ? t('studios.gamesB.golet.running') : t('studios.gamesB.golet.startMatch')}</button>
            <p className="gl-msg" data-kind={err ? 'err' : undefined} role="status">{err ?? t('studios.gamesB.golet.ctrlEnter')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
