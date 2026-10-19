'use client'
// Öğretmen: sınıfı sezona takım olarak kaydet / adını güncelle / kaydı sil. Yetkiyi sunucu denetler (/api/ogretmen/sezon).
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n/client'
import { localizeError, sendJson } from './api'

export function SeasonTeamForm({ seasonId, classId, className, team, closed }: { seasonId: string; classId: string; className: string; team: string | null; closed: boolean }) {
  const t = useT()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = new FormData(e.currentTarget).get('team')
    setBusy(true); setMsg(null)
    const r = await sendJson('/api/ogretmen/sezon', { seasonId, classId, team: name })
    setBusy(false)
    if (!r.ok) { setMsg({ ok: false, text: localizeError(t, r.error) }); return }
    setMsg({ ok: true, text: t('season.teacher.saved') })
    router.refresh()
  }
  async function withdraw() {
    if (!window.confirm(t('season.teacher.withdrawConfirm'))) return
    setBusy(true); setMsg(null)
    const r = await sendJson('/api/ogretmen/sezon', { seasonId, classId }, 'DELETE')
    setBusy(false)
    if (!r.ok) { setMsg({ ok: false, text: localizeError(t, r.error) }); return }
    setMsg({ ok: true, text: t('season.teacher.removed') })
    router.refresh()
  }

  return (
    <form className="sz-reg" onSubmit={save} data-testid={`season-reg-${classId}`}>
      <label className="field">
        {t('season.teacher.teamName')} · <b>{className}</b>
        <input name="team" required minLength={2} maxLength={40} defaultValue={team ?? ''} placeholder={t('season.teacher.teamNamePh')} disabled={closed} />
      </label>
      {!closed && <button className="btn btn-primary" disabled={busy}>{team ? t('season.teacher.rename') : t('season.teacher.register')}</button>}
      {team && <button type="button" className="og-link-btn danger" onClick={withdraw} disabled={busy}>{t('season.teacher.withdraw')}</button>}
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'og-ok' : 'og-err'} style={{ flexBasis: '100%' }}>{msg.text}</p>}
    </form>
  )
}
