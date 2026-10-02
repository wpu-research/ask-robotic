'use client'
// Gölet sahnesi: havuz + skor tablosu + (blok kipi: kareleri oynat) + (JavaScript kipi: kod düzenleyici, çalıştırma, hızlandırma, tekrar izleme).
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { markLevelDone } from '@/lib/games/progress'
import { outcomeMessage } from '@/lib/games/golet/engine'
import { getRecording } from '@/lib/games/golet/recording'
import { ranking, type PondData, type PondFrame } from '@/lib/games/golet/sim'
import { STARTER, TEMPLATES } from '@/lib/games/golet/templates'
import { runInWorker } from '@/lib/games/golet/text-client'
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

const HELP: [string, string][] = [
  ['swim(yön, hız)', 'Yönünü (0 sağ, 90 yukarı, 180 sol, 270 aşağı) ve hızını (0–100) ayarlar. Değiştirene kadar sürer.'],
  ['cannon(yön, menzil)', 'Top atar. Menzil en çok 70. Top 16 tikte bir hazır olur.'],
  ['scan(yön)', 'O yöne bakar (5° genişlik): en yakın rakibin uzaklığı, yoksa Infinity. scan(yön, genişlik) de olur.'],
  ['health()', 'Kalan canın (0–100).'],
  ['getX()  getY()', 'Konumun (0–100). Sol alt köşe 0,0.'],
  ['speed()', 'Şu anki hızın.'],
  ['hafiza', 'Tikler arasında bilgi taşıyan nesne: hafiza.sayac = 5.'],
]

export default function Scene({ level, frame, running, outcome }: SceneProps<PondFrame>) {
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
    if (!r.ok) { setErr(r.error); return }
    const m = r.result
    if (m.error) { setErr(m.error); return }
    const last = m.frames[m.frames.length - 1]
    const message = outcomeMessage(last, m.won)
    setJs({ won: m.won, message, frames: m.frames })
    if (m.won) markLevelDone('golet', level.id)
    setEditing(false)
    setPlay({ frames: m.frames, i: 0, kind: 'js' })
    setPlaying(true)
  }, [busy, code, data, level.id])

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
            <span className="gl-chip-name">{d.name}</span>
            <span className="gl-chip-bar"><span data-low={d.hp <= 25} style={{ width: `${d.hp}%` }} /></span>
            <span className="gl-chip-hp">{Math.round(d.hp)}</span>
          </div>
        ))}
      </div>

      {!showEditor && <div className="gl-tick" aria-hidden="true">Tik {shown.tick} / {shown.maxTicks}</div>}

      {finished && mode === 'js' && js && (
        <div className="gl-result" data-ok={js.won} role="status">
          <h3>{js.won ? 'Kazandın!' : 'Bu sefer olmadı'}</h3>
          <p>{js.message}</p>
          <div className="gl-result-actions">
            {js.won && <a className="gl-primary" href={nextHref}>{level.id < 10 ? 'Sonraki meydan okuma' : 'Oyunlara dön'}</a>}
            <button type="button" onClick={replay}>Tekrar izle</button>
            <button type="button" onClick={() => { setEditing(true); setPlay(null) }}>Kodu düzenle</button>
          </div>
        </div>
      )}

      <div className="gl-bar" data-editor={showEditor}>
        <div className="gl-seg" role="group" aria-label="Programlama kipi">
          <button type="button" aria-pressed={mode === 'blocks'} onClick={() => { setMode('blocks'); setEditing(true) }}>Bloklar</button>
          <button type="button" aria-pressed={mode === 'js'} onClick={() => { setMode('js'); setEditing(!js || !play) }} disabled={running}>JavaScript</button>
        </div>
        {!showEditor && (
          <div className="gl-right">
            {play && playing && (
              <button type="button" className="gl-pill" onClick={() => { setSpeedX((s) => (s >= 8 ? 1 : s * 2)) }} aria-label={`Oynatma hızı ${speedX} kat, değiştir`}>×{speedX}</button>
            )}
            {play && playing && <button type="button" className="gl-pill" onClick={() => setPlay((p) => (p ? { ...p, i: p.frames.length - 1 } : p))}>Sonuca atla</button>}
            {recFrames && !playing && !finished && <button type="button" className="gl-pill" onClick={replay}>Tekrar izle</button>}
            {recFrames && !playing && finished && mode === 'blocks' && <button type="button" className="gl-pill" onClick={replay}>Tekrar izle</button>}
            {mode === 'js' && !playing && !busy && <button type="button" className="gl-pill" onClick={() => { setEditing(true); setPlay(null) }}>Kodu düzenle</button>}
          </div>
        )}
      </div>

      {showEditor && (
        <div className="gl-editor">
          <div className="gl-ed-head">
            <h2 className="gl-ed-title">JavaScript ile programla</h2>
            <select className="gl-select" aria-label="Örnek kod seç" value="" onChange={(e) => { const t = TEMPLATES.find((x) => x.id === e.target.value); if (t) { setCode(t.code); setErr(null) } }}>
              <option value="">Örnek kod…</option>
              {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button type="button" className="gl-select" onClick={() => setHelpOpen((o) => !o)} aria-expanded={helpOpen}>{helpOpen ? 'Kodu göster' : 'Komutlar'}</button>
          </div>
          {helpOpen ? (
            <div className="gl-help">
              <h3>Komutlar</h3>
              <dl>{HELP.map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>))}</dl>
              <p>Kodun her tikte baştan çalışır, o yüzden <code>while (true)</code> yazma. Bir tik, havuzdaki her şeyin bir adım ilerlemesidir.</p>
            </div>
          ) : (
            <CodeEditor value={code} onChange={(v) => { setCode(v); saveCode(level.id, v) }} onRun={run} disabled={busy} />
          )}
          <div className="gl-ed-foot">
            <button type="button" className="gl-run" onClick={run} disabled={busy}>{busy ? 'Çalışıyor…' : 'Maçı başlat'}</button>
            <p className="gl-msg" data-kind={err ? 'err' : undefined} role="status">{err ?? 'Ctrl+Enter ile de başlatabilirsin.'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
