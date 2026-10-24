import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/admin'
import { listUsers, welcomeRemaining, WELCOME_LIMIT, WELCOME_MONTHS, ADMIN_PROVIDER, WELCOME_PROVIDER } from '@/lib/membership'
import { CreateUserForm, EditUserForm, GrantForm } from '@/components/admin/admin-forms'
import { careerOf } from '@/lib/kariyer'
import { QUESTIONS } from '@/lib/kariyer-anket'
import { listSurveys } from '@/lib/kariyer-anket-server'
import { levelNames, listLeads } from '@/lib/okul-teklif-server'
import '../odeme.css'
import './admin.css'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }
export const dynamic = 'force-dynamic'

const ROLE: Record<string, string> = { student: 'Öğrenci', parent: 'Veli', teacher: 'Öğretmen', admin: 'Admin' }
const SOURCE: Record<string, string> = { [ADMIN_PROVIDER]: 'admin', [WELCOME_PROVIDER]: 'hoş geldin', trial: 'deneme', prepaid: 'ödeme' }
const date = (d: Date) => d.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'short', year: 'numeric' })

export default async function Admin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // Admin olmayana sayfanın varlığını da gösterme
  const admin = await getAdminUser()
  if (!admin) notFound()
  const q = (await searchParams).q ?? ''
  const db = getDb()
  const [rows, remaining, surveys] = await Promise.all([listUsers(db, q), welcomeRemaining(db), listSurveys(db, 200).catch(() => [])])
  const leads = await listLeads(db, 200).catch(() => [])
  const members = rows.filter((r) => r.plan).length

  return (
    <div className="page ad">
      <header className="page-title">
        <p className="eyebrow">Yönetim</p>
        <h1>Üyeler</h1>
        <p className="muted">
          Hoş geldin kampanyası ({WELCOME_MONTHS} ay Premium): {WELCOME_LIMIT - remaining} / {WELCOME_LIMIT} kullanıldı, {remaining} kaldı.
        </p>
      </header>

      <section className="ac-card">
        <h2>Hesap aç</h2>
        <CreateUserForm />
      </section>

      <section className="ac-card">
        <div className="ad-head">
          <h2>Kullanıcılar <small className="muted">{rows.length} kişi · {members} üye</small></h2>
          <form className="ad-search" role="search">
            <input name="q" defaultValue={q} placeholder="Ad, e-posta, kullanıcı adı" aria-label="Ara" />
            <button className="v2-btn ghost">Ara</button>
          </form>
        </div>
        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead><tr><th>Kişi</th><th>Rol</th><th>Kayıt</th><th>Üyelik</th><th>Ver / değiştir</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.name}</b><br /><small className="muted">{r.email ?? r.username}</small>
                    <EditUserForm user={{ id: r.id, name: r.name, email: r.email, username: r.username, role: r.role, loginMode: r.loginMode }} self={r.id === admin.id} />
                  </td>
                  <td>{ROLE[r.role] ?? r.role}</td>
                  <td>{date(r.createdAt)}</td>
                  <td>
                    {r.plan
                      ? <><b>{r.plan === 'family' ? 'Aile' : 'Premium'}</b> · {r.until ? date(r.until) : 'süresiz'}<br /><small className="muted">{SOURCE[r.source ?? ''] ?? r.source}</small></>
                      : <span className="muted">Yok</span>}
                  </td>
                  <td><GrantForm userId={r.id} hasPlan={!!r.plan} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ac-card" id="okul-teklif">
        <div className="ad-head">
          <h2>Okul teklif talepleri <small className="muted">son {leads.length} talep</small></h2>
          <a className="v2-btn ghost" href="/api/admin/okul-teklif" download>CSV indir (tümü)</a>
        </div>
        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead><tr><th>Okul</th><th>Tarih</th><th>Kademe</th><th>Yetkili</th><th>İletişim</th><th>Not</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td><b>{l.school}</b><br /><small className="muted">{l.city} · {l.brand}</small></td>
                  <td>{date(l.createdAt)}</td>
                  <td>{levelNames(l.levels)}{l.students ? <><br /><small className="muted">{l.students} öğrenci</small></> : null}</td>
                  <td>{l.contactName}{l.contactRole ? <><br /><small className="muted">{l.contactRole}</small></> : null}</td>
                  <td><a href={`tel:${l.phone.replace(/[^+\d]/g, '')}`}>{l.phone}</a><br /><a href={`mailto:${l.email}`}>{l.email}</a></td>
                  <td><small className="muted">{l.note}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ac-card" id="kariyer-anketi">
        <div className="ad-head">
          <h2>Kariyer anketi <small className="muted">son {surveys.length} cevap · {surveys.filter((s) => s.consentContact).length} iletişim izni</small></h2>
          <a className="v2-btn ghost" href="/api/admin/kariyer-anketi" download>CSV indir (tümü)</a>
        </div>
        <div className="ac-table-wrap">
          <table className="ac-table">
            <thead><tr><th>Kişi</th><th>Tarih</th><th>Önerilen yollar</th><th>İletişim</th><th>Cevaplar</th></tr></thead>
            <tbody>
              {surveys.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.name}</b><br /><small className="muted">{s.email}</small></td>
                  <td>{date(s.createdAt)}</td>
                  <td>{s.result.map((m) => `${careerOf(m.slug)?.tr.title ?? m.slug} %${m.pct}`).join(' · ')}</td>
                  <td>{s.consentContact ? 'İzin var' : <span className="muted">Yok</span>}</td>
                  <td><small className="muted">{QUESTIONS.map((qq) => qq.opts.find((o) => o.id === s.answers[qq.id])?.tr).filter(Boolean).join(' · ')}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
