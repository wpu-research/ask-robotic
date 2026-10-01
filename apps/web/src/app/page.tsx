import Link from 'next/link'
import { getDb } from '@/lib/db'
import { getModuleSummaries, hours } from '@/lib/summaries'
import { TRACKS, UPCOMING } from '@/lib/module-meta'
import { ModuleCard } from '@/components/module-card'
import { ContinueButton } from '@/components/progress'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const mods = await getModuleSummaries(getDb()).catch(() => [])
  const totalLessons = mods.reduce((n, m) => n + m.lessons, 0)
  const totalMin = mods.reduce((n, m) => n + m.minutes, 0)
  const allIds = mods.flatMap((m) => m.lessonIds)
  const soon = UPCOMING.filter((u) => !mods.some((m) => m.slug === u.slug))

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Sıfırdan robot mühendisliğine</p>
          <h1>Blokla başla, <span className="grad">robotunu</span> kendin yap.</h1>
          <p className="lead">
            Scratch&apos;ten Arduino&apos;ya, sensörlerden otonom robotlara kadar kısa, uygulamalı dersler.
            Her ders bir sorudan başlar, bir şey yaptırır ve bir soruyla biter.
          </p>
          <div className="hero-actions">
            <ContinueButton lessonIds={allIds} className="btn btn-primary btn-lg" />
            <Link href="/moduller" className="btn btn-ghost btn-lg">Modülleri gör</Link>
          </div>
          <div className="stats">
            <div className="stat"><b>{totalLessons}</b><span>ders</span></div>
            <div className="stat"><b>{mods.length}</b><span>hazır modül</span></div>
            <div className="stat"><b>~{hours(totalMin)}</b><span>içerik</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Öğrenme yolu</p>
          <h2>Üç hat, sırayla ya da doğrudan girilebilen modüller</h2>
          <p className="muted" style={{ maxWidth: '62ch', marginBottom: 28 }}>
            Her modül kendi başına anlamlıdır. Arduino biliyorsan Scratch&apos;i atlayıp doğrudan Arduino Temelleri&apos;ne geçebilirsin.
          </p>
          {mods.length === 0 ? (
            <div className="card"><p>Modüller yüklenemedi. Veritabanı bağlantısını kontrol et.</p></div>
          ) : (
            <div className="grid">
              {mods.map((m) => <ModuleCard key={m.id} m={m} />)}
              {soon.map((u) => (
                <div key={u.slug} className={`card card-soon track-${u.track}`}>
                  <div className="card-top">
                    <span className="step-no">YAKINDA</span>
                    <span className="chip">{u.status}</span>
                  </div>
                  <h3>{u.title}</h3>
                  <p>{TRACKS[u.track].hint}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            ['Önce soru, sonra bilgi', 'Her ders gerçek bir problemle açılır. Cevabı etkinlikte kendin bulursun.'],
            ['Çalışan kod', 'Arduino derslerindeki programlar bir Uno benzetiminde derlenip çalıştırılarak doğrulandı.'],
            ['Gerçek hatalar', 'Sık yapılan hatalar ve gerçek donanımla farklar derslerde açıkça yazılı.'],
          ].map(([t, d]) => (
            <div key={t} className="card"><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>
    </>
  )
}
