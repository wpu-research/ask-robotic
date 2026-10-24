import Link from 'next/link'
import { dictionaries, type Locale } from '@/i18n'
import { BRANDS } from '@/lib/brand'
import { PHOTO_CREDITS, STAGES } from '@/lib/dilkur-landing'
import { ENG_PARTS } from '@/lib/muhendislik/catalog'
import { LeadForm } from './lead-form'
import '@/app/dilkur.css'

const TEACHER = ['classes', 'qr', 'assign', 'stuck', 'present', 'league'] as const

/**
 * Dilkur Akademi ana sayfası (dilkur.macademia.com.tr, giriş yapmamış ziyaretçi): dilkurakademi.com düzeninde — tam
 * genişlik fotoğraflı giriş, iki kategori kartı (Çocuklar için Robotik · Mühendislik Yolu), kademe kademe dersler,
 * lacivert öğretmen paneli bandı ve okul teklif formu. Ders sayısı katalogdan gelir.
 */
export function DilkurLanding({ lessons, locale }: { lessons: number; locale: Locale }) {
  const en = locale === 'en'
  const S = dictionaries[locale].schools
  const contact = BRANDS.dilkur.contact!
  return (
    <div className="dk-home">
      <section className="dk-hero">
        <img className="dk-hero-img" src="/brand/dilkur/hero.jpg" alt="" width={1600} height={700} fetchPriority="high" />
        <div className="wrap dk-hero-in">
          <p className="dk-kicker">{en ? 'Dilkur Akademi · for schools' : 'Dilkur Akademi · okullar için'}</p>
          <h1>{en ? 'Robotics and Engineering for your school' : 'Okulunuza Robotik ve Mühendislik'}</h1>
          <p className="dk-lead">{en ? 'From kindergarten to the final year of high school: from block coding to sensors, robot arms and drones. Everything runs in the browser, no kit or installation needed, with a ready-made teacher panel.' : 'Anaokulundan lise sona: bloklarla kodlamadan sensörlere, robot kollarına ve drone\'lara. Her şey tarayıcıda; kit ve kurulum gerekmez, öğretmen paneli hazır.'}</p>
          <div className="dk-cta">
            <a className="btn btn-primary" href="#teklif">{en ? 'Request a quote' : 'Teklif isteyin'}</a>
            <Link className="btn dk-btn-light" href="/basla">{en ? 'Try it free' : 'Ücretsiz deneyin'}</Link>
          </div>
        </div>
      </section>

      <section className="wrap dk-stats" aria-label={en ? 'At a glance' : 'Kısaca'}>
        <div><b>4</b><span>{en ? 'school levels' : 'kademe'}</span></div>
        <div><b>{lessons}</b><span>{en ? 'interactive lessons' : 'etkileşimli ders'}</span></div>
        <div><b>{ENG_PARTS.length}</b><span>{en ? 'real parts in 3D' : 'gerçek parça, 3B'}</span></div>
        <div><b>0</b><span>{en ? 'kits to buy' : 'kit masrafı'}</span></div>
      </section>

      <section className="wrap dk-section" aria-labelledby="dk-kat">
        <h2 id="dk-kat" className="dk-h2">{en ? 'Two paths' : 'İki yol'}</h2>
        <div className="dk-cats">
          <Link href="/robot-atolyesi" className="dk-cat" data-testid="dk-cat-robotik">
            <img src="/brand/dilkur/robotik.jpg" alt={en ? 'A small robot following a line drawn on paper' : 'Kâğıda çizilmiş çizgiyi izleyen küçük bir robot'} width={800} height={500} loading="lazy" />
            <span className="dk-cat-body">
              <small>{en ? 'Kindergarten – middle school' : 'Anaokulu – ortaokul'}</small>
              <b>{BRANDS.dilkur[locale].kidsGroup}</b>
              <span>{en ? 'Robots programmed with blocks, missions, competition seasons and the Micro Board. Voice guidance for children who cannot read yet.' : 'Bloklarla programlanan robotlar, görevler, yarışma sezonları ve Mikro Kart. Okuma bilmeyenler için sesli anlatım.'}</span>
            </span>
          </Link>
          <Link href="/muhendislik" className="dk-cat" data-testid="dk-cat-muhendislik">
            <img src="/img/kariyer/drone-iha.jpg" alt={en ? 'A camera quadcopter in flight' : 'Havada uçan kameralı bir quadcopter'} width={800} height={500} loading="lazy" />
            <span className="dk-cat-body">
              <small>{en ? 'Middle school – high school' : 'Ortaokul – lise'}</small>
              <b>{BRANDS.dilkur[locale].adultsGroup}</b>
              <span>{en ? `Arduino, sensors, ${ENG_PARTS.length} real parts in 3D, robot arm, drones and AI; a virtual circuit lab where every part opens wired up.` : `Arduino, sensörler, ${ENG_PARTS.length} gerçek parça (3B), robot kolu, drone ve yapay zekâ; her parçanın takılı açıldığı sanal devre laboratuvarı.`}</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="dk-soft" aria-labelledby="dk-kademe">
        <div className="wrap dk-section">
          <h2 id="dk-kademe" className="dk-h2">{en ? 'Level by level' : 'Kademe kademe'}</h2>
          <p className="dk-sub">{en ? 'What students do at each level, in Robotics and on the Engineering Path.' : 'Her kademede öğrencinin Robotik ve Mühendislik yolunda ne yaptığı.'}</p>
          <div className="dk-stages">
            {STAGES.map((s) => (
              <article key={s.id} className={`dk-stage s-${s.id}`} data-testid={`dk-stage-${s.id}`}>
                <header><span className="dk-stage-ic" aria-hidden="true">{s.icon}</span><span><b>{s[locale].title}</b><small>{s[locale].ages}</small></span></header>
                <p>{s[locale].text}</p>
                <div className="dk-cols">
                  <div><h3>{en ? 'Robotics' : 'Robotik'}</h3><ul>{s.robotik.map((l) => <li key={l.href}><Link href={l.href}>{l[locale]}</Link></li>)}</ul></div>
                  <div><h3>{en ? 'Engineering' : 'Mühendislik'}</h3><ul>{s.muhendislik.map((l) => <li key={l.href}><Link href={l.href}>{l[locale]}</Link></li>)}</ul></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dk-navy" aria-labelledby="dk-ogretmen">
        <div className="wrap dk-navy-in">
          <div>
            <h2 id="dk-ogretmen">{en ? 'Teacher panel, ready on day one' : 'Öğretmen paneli ilk günden hazır'}</h2>
            <p>{en ? 'Classes, QR-card logins, assignments and a live view of who is stuck. 40-minute lesson plans and curriculum mapping included.' : 'Sınıflar, QR kartla giriş, ödevler ve kimin takıldığını canlı görme. 40 dakikalık ders planları ve müfredat eşlemesi dahil.'}</p>
            <ul className="dk-checks">{TEACHER.map((k) => <li key={k}>{S.teacher[k]}</li>)}</ul>
            <Link className="btn btn-primary" href="/okullar">{en ? 'Details for schools' : 'Okullar için ayrıntılar'}</Link>
          </div>
          <ol className="dk-flow" aria-label={S.flowTitle}>
            <li><b>{S.flow.m5}</b><span>{S.flow.curious}</span></li>
            <li><b>{S.flow.m25}</b><span>{S.flow.lesson}</span></li>
            <li><b>{S.flow.m10}</b><span>{S.flow.discuss}</span></li>
          </ol>
        </div>
      </section>

      <section className="wrap dk-section dk-offer" id="teklif" aria-labelledby="dk-teklif">
        <div>
          <h2 id="dk-teklif" className="dk-h2">{en ? 'Request a quote for your school' : 'Okulunuz için teklif isteyin'}</h2>
          <p className="dk-sub">{en ? 'Tell us about your school; we will plan a free demo lesson and send a quote for your levels and student numbers.' : 'Okulunuzu kısaca anlatın; ücretsiz bir tanıtım dersi planlayalım, kademe ve öğrenci sayınıza göre teklif gönderelim.'}</p>
          <ul className="dk-reach">
            <li><a href={contact.phoneHref}>{contact.phone}</a></li>
            <li><a href={contact.whatsapp} rel="noopener">WhatsApp</a></li>
            <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
          </ul>
        </div>
        <LeadForm />
      </section>

      <details className="wrap mx-photo-credits dk-credits">
        <summary>{en ? 'Photo credits' : 'Fotoğraf kaynakları'}</summary>
        <ul>{PHOTO_CREDITS.map((p) => <li key={p.file}><a href={p.source} rel="noopener">{p.title}</a> · {p.creator} · <a href={p.licenseUrl} rel="license noopener">{p.license}</a></li>)}</ul>
        <p>{en ? 'Photos from Wikimedia Commons, cropped to fit.' : 'Fotoğraflar Wikimedia Commons\'tan; sayfaya sığması için kırpıldı.'}</p>
      </details>
    </div>
  )
}
