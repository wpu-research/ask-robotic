'use client'
// Sanal Beceri paneli: kurallar, resmi puan (tarayıcıda, sunucuyla aynı hesap), gönderim ve sınıf puan tabloları.
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { runSkill, type SkillChallenge, type SkillResult } from '@/lib/mikro/beceri'
import type { MikroProject } from '@/lib/mikro/types'

interface Row { name: string; score: number; finishMs: number | null; attempts: number; rank: number; me: boolean }
interface Board { classId: string; className: string; rows: Row[] }
interface Boards { signedIn: boolean; best: Record<string, number>; boards: Board[] }

const sec = (ms: number | null) => (ms == null ? '—' : `${(ms / 1000).toFixed(1).replace('.', ',')} sn`)

export function SkillPanel({ challenge, project }: { challenge: SkillChallenge; project: MikroProject | null }) {
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
      if (!r.ok) { setErr(j.error ?? 'Gönderilemedi'); return }
      setMsg(`Gönderildi: ${j.score} puan. En iyin: ${j.best}.`)
      setResult({ score: j.score, parts: j.parts, finishMs: j.finishMs, timeMs: 0, error: j.error })
      await load()
    } catch { setErr('Bağlantı kurulamadı') } finally { setBusy('') }
  }

  const best = data?.best?.[challenge.id]
  return (
    <section className="sk-panel" aria-label="Sanal beceri" data-testid="skill-panel">
      <div className="sk-head">
        <div>
          <p className="sk-eyebrow">Sanal beceri · {challenge.timeLimitS} sn</p>
          <h2>{challenge.title}</h2>
          <p className="sk-sum">{challenge.summary}</p>
        </div>
        {best != null && <p className="sk-best">En iyin <b data-testid="skill-best">{best}</b></p>}
      </div>
      <details className="sk-rules">
        <summary>Puanlama kuralları</summary>
        <ul>{challenge.rules.map((r) => <li key={r}>{r}</li>)}</ul>
        <p>Puan, programın sabit koşullarda baştan çalıştırılmasıyla hesaplanır; gönderdiğinde sunucu aynı hesabı yeniden yapar.</p>
      </details>
      <div className="sk-actions">
        <button type="button" className="mk-btn" onClick={calc} disabled={!project || !!busy} data-testid="skill-calc">{busy === 'calc' ? 'Hesaplanıyor…' : 'Puanımı hesapla'}</button>
        <button type="button" className="mk-btn sk-send" onClick={send} disabled={!project || !!busy || data?.signedIn === false} data-testid="skill-send">{busy === 'send' ? 'Gönderiliyor…' : 'Sınıf tablosuna gönder'}</button>
        {data?.signedIn === false && <span className="sk-note"><Link href="/giris?next=/robot-atolyesi">Giriş yap</Link>, sonra puanını gönderebilirsin.</span>}
      </div>
      {err && <p role="alert" className="sk-err">{err}</p>}
      {msg && <p role="status" className="sk-ok">{msg}</p>}
      {result && (
        <table className="sk-score" data-testid="skill-result">
          <tbody>
            {result.parts.map((p) => <tr key={p.label}><td>{p.label}</td><td>{p.points > 0 ? `+${p.points}` : p.points}</td></tr>)}
            <tr className="sk-total"><td>Toplam {result.finishMs != null ? `· bitiş ${sec(result.finishMs)}` : '· bitirilmedi'}</td><td data-testid="skill-total">{result.score}</td></tr>
          </tbody>
        </table>
      )}
      {result?.error && <p className="sk-err">Program durdu: {result.error}</p>}
      {data?.signedIn && !data.boards.length && (
        <p className="sk-note">Sınıf puan tablosu için öğretmeninin verdiği kodla <Link href="/sinif/katil">bir sınıfa katıl</Link>.</p>
      )}
      {data?.boards.map((bd) => (
        <div key={bd.classId} className="sk-board">
          <h3>{bd.className} · puan tablosu</h3>
          {bd.rows.length ? (
            <ol>
              {bd.rows.map((r) => (
                <li key={`${r.rank}-${r.name}`} className={r.me ? 'me' : undefined}>
                  <span className="sk-rank">{r.rank}</span><span>{r.name}</span><b>{r.score}</b><small>{sec(r.finishMs)} · {r.attempts} deneme</small>
                </li>
              ))}
            </ol>
          ) : <p className="sk-note">Henüz gönderen yok. İlk sen ol!</p>}
        </div>
      ))}
    </section>
  )
}
