'use client'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useT } from '@/i18n/client'
import { localizeError, sendJson } from './api'

function GradeSelect({ name = 'gradeLevel' }: { name?: string }) {
  const t = useT()
  const grades = [{ v: '', l: t('teacher.forms.notSelected') }, { v: '0', l: t('teacher.kindergarten') }, ...Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1), l: t('teacher.grade', { n: i + 1 }) }))]
  return <select name={name} defaultValue="">{grades.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}</select>
}

/** /ogretmen/basla: okul + ilk sınıf. */
export function OnboardForm() {
  const t = useT()
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    const r = await sendJson<{ classId: string }>('/api/ogretmen/okul', { schoolName: f.get('schoolName'), className: f.get('className'), gradeLevel: f.get('gradeLevel') })
    if (!r.ok) { setError(localizeError(t, r.error)); setBusy(false); return }
    router.push(`/ogretmen/sinif/${r.data.classId}?sekme=ogrenciler`)
  }
  return (
    <form className="og-form" onSubmit={onSubmit}>
      <label className="field">{t('teacher.forms.schoolName')}<input name="schoolName" required minLength={2} maxLength={120} placeholder={t('teacher.forms.schoolNamePh')} /></label>
      <div className="row">
        <label className="field">{t('teacher.forms.firstClass')}<input name="className" required maxLength={40} placeholder={t('teacher.forms.firstClassPh')} /></label>
        <label className="field">{t('teacher.forms.level')}<GradeSelect /></label>
      </div>
      {error && <p role="alert" className="og-err">{error}</p>}
      <button className="v2-btn accent" disabled={busy}>{busy ? t('teacher.forms.creating') : t('teacher.forms.createSchoolAndClass')}</button>
    </form>
  )
}

/** Var olan okula yeni sınıf. */
export function NewClassForm({ orgId }: { orgId: string }) {
  const t = useT()
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    const r = await sendJson<{ classId: string }>(`/api/ogretmen/okul/${orgId}`, { name: f.get('name'), gradeLevel: f.get('gradeLevel') })
    if (!r.ok) { setError(localizeError(t, r.error)); setBusy(false); return }
    router.push(`/ogretmen/sinif/${r.data.classId}?sekme=ogrenciler`)
  }
  return (
    <form className="og-form" onSubmit={onSubmit}>
      <div className="row">
        <label className="field">{t('teacher.forms.className')}<input name="name" required maxLength={40} placeholder={t('teacher.forms.classNamePh')} /></label>
        <label className="field">{t('teacher.forms.level')}<GradeSelect /></label>
        <button className="btn btn-primary" disabled={busy}>{t('teacher.forms.addClass')}</button>
      </div>
      {error && <p role="alert" className="og-err">{error}</p>}
    </form>
  )
}

/** /sinif/katil: öğrenci sınıf koduyla katılır. */
export function JoinForm({ initial = '' }: { initial?: string }) {
  const t = useT()
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [busy, setBusy] = useState(false)
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = String(new FormData(e.currentTarget).get('code') ?? '')
    setBusy(true); setError('')
    const r = await sendJson<{ className: string; already: boolean }>('/api/sinif/katil', { code })
    setBusy(false)
    if (!r.ok) { setError(localizeError(t, r.error)); return }
    setDone(t(r.data.already ? 'teacher.join.already' : 'teacher.join.joined', { name: r.data.className }))
  }
  if (done) return (
    <div className="og-form">
      <p className="og-ok" role="status">{done}</p>
      <a className="v2-btn accent" href="/lig">{t('teacher.join.seeLeague')}</a>
    </div>
  )
  return (
    <form className="og-form" onSubmit={onSubmit}>
      <label className="field">{t('teacher.join.code')}
        <input name="code" required defaultValue={initial} autoComplete="off" autoCapitalize="characters" maxLength={12}
          className="og-code og-code-big" placeholder="ABC234" style={{ textTransform: 'uppercase' }} />
      </label>
      {error && <p role="alert" className="og-err">{error}</p>}
      <button className="v2-btn accent" disabled={busy}>{busy ? t('teacher.join.joining') : t('teacher.join.submit')}</button>
    </form>
  )
}

/** /ogretmen/okul: okul ayarları (yalnız sahip/yönetici değiştirebilir). */
export function SettingsToggles({ orgId, initial, canEdit }: { orgId: string; initial: { aiTutor: boolean; leagues: boolean }; canEdit: boolean }) {
  const t = useT()
  const [s, setS] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function toggle(k: 'aiTutor' | 'leagues', v: boolean) {
    setBusy(true); setError('')
    const r = await sendJson<{ settings: typeof initial }>(`/api/ogretmen/okul/${orgId}`, { [k]: v }, 'PATCH')
    setBusy(false)
    if (!r.ok) { setError(localizeError(t, r.error)); return }
    setS(r.data.settings)
  }
  const row = (k: 'aiTutor' | 'leagues', title: string, help: string) => (
    <label className="og-switch">
      <span><b>{title}</b><small>{help}</small></span>
      <input type="checkbox" role="switch" checked={s[k]} disabled={!canEdit || busy} onChange={(e) => toggle(k, e.target.checked)} />
    </label>
  )
  return (
    <div>
      {row('aiTutor', t('teacher.forms.aiTutor'), t('teacher.forms.aiTutorHelp'))}
      {row('leagues', t('teacher.forms.leagues'), t('teacher.forms.leaguesHelp'))}
      {!canEdit && <p className="muted">{t('teacher.forms.adminOnly')}</p>}
      {error && <p role="alert" className="og-err">{error}</p>}
    </div>
  )
}
