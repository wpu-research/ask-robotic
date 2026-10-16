'use client'
// Sanal Beceri paneli: kurallar, resmi puan (tarayıcıda, sunucuyla aynı hesap), gönderim ve sınıf puan tabloları.
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { runSkill, type SkillChallenge, type SkillResult } from '@/lib/mikro/beceri'
import type { MikroProject } from '@/lib/mikro/types'
import { errorText } from '@/lib/mikro/en'
import { useI18n } from '@/i18n/client'

interface Row { name: string; score: number; finishMs: number | null; attempts: number; rank: number; me: boolean }
interface Board { classId: string; className: string; rows: Row[] }
interface Boards { signedIn: boolean; best: Record<string, number>; boards: Board[] }

export function SkillPanel({ challenge, project }: { challenge: SkillChallenge; project: MikroProject | null }) {
  const { locale, t } = useI18n()
  const en = locale === 'en'
  const sec = (ms: number | null) => {
    if (ms == null) return '—'
    const n = (ms / 1000).toFixed(1)
    return t('mikro.common.seconds', { n: en ? n : n.replace('.', ',') })
  }
  const [result, setResult] = useState<SkillResult | null>(null)
  const [busy, setBusy] = useState<'' | 'calc' | 'send'>('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [data, setData] = useState<Boards | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/beceri?challengeId=${challenge.id}`, { cache: 'no-store' })
      if (r.ok) setData(await r.json())
    } catch { /* çevrimdışı */ }
  }, [challenge.id])
  useEffect(() => { setResult(null); setMsg(''); setErr(''); void load() }, [load])

  const calc = () => {
    if (!project) return
    setBusy('calc'); setErr('')
    setTimeout(() => { setResult(runSkill(challenge, project)); setBusy('') }, 20)
  }
  const send = async () => {
    if (!project) return
    setBusy('send'); setErr(''); setMsg('')
    try {
      const r = await fetch('/api/beceri', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ challengeId: challenge.id, project }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(j.error ?? t('mikro.skill.sendFailed')); return }
      setMsg(t('mikro.skill.sent', { score: j.score, best: j.best }))
      setResult({ score: j.score, parts: j.parts, finishMs: j.finishMs, timeMs: 0, error: j.error })
      await load()
    } catch { setErr(t('mikro.skill.noConnection')) } finally { setBusy('') }
  }

  const best = data?.best?.[challenge.id]
  return (
    <section className="sk-panel" aria-label={t('mikro.skill.aria')} data-testid="skill-panel">
      <div className="sk-head">
        <div>
          <p className="sk-eyebrow">{t('mikro.skill.eyebrow', { s: challenge.timeLimitS })}</p>
          <h2>{en ? challenge.en.title : challenge.title}</h2>
          <p className="sk-sum">{en ? challenge.en.summary : challenge.summary}</p>
        </div>
        {best != null && <p className="sk-best">{t('mikro.skill.best')} <b data-testid="skill-best">{best}</b></p>}
      </div>
      <details className="sk-rules">
        <summary>{t('mikro.skill.rules')}</summary>
        <ul>{(en ? challenge.en.rules : challenge.rules).map((r) => <li key={r}>{r}</li>)}</ul>
        <p>{t('mikro.skill.rulesNote')}</p>
      </details>
      <div className="sk-actions">
        <button type="button" className="mk-btn" onClick={calc} disabled={!project || !!busy} data-testid="skill-calc">{busy === 'calc' ? t('mikro.skill.calcBusy') : t('mikro.skill.calc')}</button>
        <button type="button" className="mk-btn sk-send" onClick={send} disabled={!project || !!busy || data?.signedIn === false} data-testid="skill-send">{busy === 'send' ? t('mikro.skill.sendBusy') : t('mikro.skill.send')}</button>
        {data?.signedIn === false && <span className="sk-note"><Link href="/giris?next=/robot-atolyesi">{t('mikro.skill.signIn')}</Link>{t('mikro.skill.signInAfter')}</span>}
      </div>
      {err && <p role="alert" className="sk-err">{err}</p>}
      {msg && <p role="status" className="sk-ok">{msg}</p>}
      {result && (
        <table className="sk-score" data-testid="skill-result">
          <tbody>
            {result.parts.map((p) => <tr key={p.label}><td>{en && p.en ? p.en : p.label}</td><td>{p.points > 0 ? `+${p.points}` : p.points}</td></tr>)}
            <tr className="sk-total"><td>{t('mikro.skill.total')} {result.finishMs != null ? t('mikro.skill.finishAt', { t: sec(result.finishMs) }) : t('mikro.skill.notFinished')}</td><td data-testid="skill-total">{result.score}</td></tr>
          </tbody>
        </table>
      )}
      {result?.error && <p className="sk-err">{t('mikro.skill.stopped', { error: errorText(result.error, locale) })}</p>}
      {data?.signedIn && !data.boards.length && (
        <p className="sk-note">{t('mikro.skill.joinBefore')}<Link href="/sinif/katil">{t('mikro.skill.joinLink')}</Link>{t('mikro.skill.joinAfter')}</p>
      )}
      {data?.boards.map((bd) => (
        <div key={bd.classId} className="sk-board">
          <h3>{t('mikro.skill.board', { name: bd.className })}</h3>
          {bd.rows.length ? (
            <ol>
              {bd.rows.map((r) => (
                <li key={`${r.rank}-${r.name}`} className={r.me ? 'me' : undefined}>
                  <span className="sk-rank">{r.rank}</span><span>{r.name}</span><b>{r.score}</b><small>{sec(r.finishMs)} · {t('mikro.skill.attempts', { n: r.attempts })}</small>
                </li>
              ))}
            </ol>
          ) : <p className="sk-note">{t('mikro.skill.noEntries')}</p>}
        </div>
      ))}
    </section>
  )
}
