import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/admin'
import { listUsers, welcomeRemaining, WELCOME_LIMIT, WELCOME_MONTHS, ADMIN_PROVIDER, WELCOME_PROVIDER } from '@/lib/membership'
import { CreateUserForm, EditUserForm, GrantForm } from '@/components/admin/admin-forms'
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
  const [rows, remaining] = await Promise.all([listUsers(db, q), welcomeRemaining(db)])
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
    </div>
  )
}
