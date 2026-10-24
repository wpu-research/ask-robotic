import Link from 'next/link'
import { dictionaries, type Locale } from '@/i18n'
import { BRANDS } from '@/lib/brand'
import { PHOTO_CREDITS, STAGES } from '@/lib/dilkur-landing'
import { ENG_PARTS } from '@/lib/muhendislik/catalog'
import { LeadForm } from './lead-form'
import { WorkshopCards } from '@/components/kids/workshop-cards'
import { WORKSHOPS } from '@/components/kids/workshops'
import { CAREER_PHOTOS } from '@/lib/career-photos'
import '@/app/dilkur.css'

const TEACHER = ['classes', 'qr', 'assign', 'stuck', 'present', 'league'] as const
/** Çocuklar için Robotik: MacademiaX'in çizimli atölye kartları, en küçüklere uygun olan önce (Blok atölyesi başta). */
const KIDS_ORDER = ['/atolye', '/robot-atolyesi', '/oyunlar', '/mikro-kart', '/oyun-atolyesi', '/sahne-atolyesi', '/robotun-gozleri']
const KIDS = KIDS_ORDER.map((h) => WORKSHOPS.find((w) => w.href === h)!).filter(Boolean)
/** Mühendislik Yolu: büyükler için fotoğraflı kartlar (fotoğraflar kariyer kartlarıyla ortak, künyesi orada). */
const ENG: Array<{ href: string; photo: string; tr: [string, string, string]; en: [string, string, string] }> = [
  { href: '/laboratuvar', photo: 'gomulu-yazilim', tr: ['Sanal devre laboratuvarı', '72 parça · Arduino Uno', 'Devreyi kur, kodu yaz, çalıştır; kablolar ve ölçümler gerçek gibi.'], en: ['Virtual circuit lab', '72 parts · Arduino Uno', 'Build the circuit, write the code, run it; wires and measurements behave like the real thing.'] },
  { href: '/muhendislik#parcalar', photo: 'iot', tr: ['Mühendislik parçaları (3B)', `${ENG_PARTS.length} parça · 7 seviye`, 'Sensör, sürücü ve kartları döndürülebilir 3B modelle tanı, laboratuvarda takılı aç.'], en: ['Engineering parts (3D)', `${ENG_PARTS.length} parts · 7 levels`, 'Get to know sensors, drivers and boards as rotatable 3D models and open them wired up in the lab.'] },
  { href: '/muhendislik/robot-kolu', photo: 'endustriyel-robot', tr: ['Robot kolu mühendisliği', '6 eksen · 10 ünite', 'Kinematik, tutucu, çarpışmasız planlama ve hücre güvenliği; sanal kolla.'], en: ['Robot arm engineering', '6 axes · 10 units', 'Kinematics, grippers, collision-free planning and cell safety, with a virtual arm.'] },
  { href: '/muhendislik/drone', photo: 'drone-iha', tr: ['Drone mühendisliği', '10 ünite · 7 simülasyon', 'Motor, ESC, PID, PX4 ve hassas inişli otonom görev.'], en: ['Drone engineering', '10 units · 7 simulations', 'Motors, ESCs, PID, PX4 and an autonomous mission with precision landing.'] },
  { href: '/makine-ogrenmesi', photo: 'makine-ogrenmesi', tr: ['Yapay zekâ ve makine öğrenmesi', 'Kod tarayıcıda çalışır', 'Regresyondan sinir ağına; algoritmalar sıfırdan, adım adım.'], en: ['AI and machine learning', 'Code runs in the browser', 'From regression to neural networks; algorithms from scratch, step by step.'] },
  { href: '/yol-haritasi/anket', photo: 'yapay-zeka-uygulama', tr: ['Kariyer anketi ve yol haritası', '10 meslek · 9 soru', 'Öğrenci hangi mühendisliğe yatkın, hangi dersleri sırayla bitirmeli?'], en: ['Career survey and roadmap', '10 careers · 9 questions', 'Which engineering suits the student, and which courses to finish in order?'] },
]

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

      <section className="dk-cat-sec dk-soft-kids" aria-labelledby="dk-robotik" id="robotik">
        <div className="wrap dk-section">
          <div className="dk-cat-head">
            <p className="dk-tag">{en ? 'Kindergarten – middle school' : 'Anaokulu – ortaokul'}</p>
            <h2 id="dk-robotik" className="dk-h2">{BRANDS.dilkur[locale].kidsGroup}</h2>
            <p className="dk-sub">{en ? 'Workshops where children program robots and characters with blocks. Voice guidance for those who cannot read yet; no kit needed.' : 'Çocukların robotları ve karakterleri bloklarla programladığı atölyeler. Okuma bilmeyenler için sesli anlatım; kit gerekmez.'}</p>
          </div>
          <WorkshopCards items={KIDS} />
        </div>
      </section>

      <section className="dk-cat-sec" aria-labelledby="dk-muhendislik" id="muhendislik">
        <div className="wrap dk-section">
          <div className="dk-cat-head">
            <p className="dk-tag">{en ? 'Middle school – high school' : 'Ortaokul – lise'}</p>
            <h2 id="dk-muhendislik" className="dk-h2">{BRANDS.dilkur[locale].adultsGroup}</h2>
            <p className="dk-sub">{en ? 'Real circuits, real parts and real engineering problems, all in the browser.' : 'Gerçek devreler, gerçek parçalar ve gerçek mühendislik problemleri; hepsi tarayıcıda.'}</p>
          </div>
          <div className="mx-cards three mx-feature mx-adult" data-testid="dk-eng-cards">
            {ENG.map((c) => {
              const p = CAREER_PHOTOS[c.photo]
              const [title, meta, text] = c[locale]
              return (
                <Link key={c.href} href={c.href} className="mx-card">
                  <span className="mx-card-img"><img src={p.file} alt={p.alt[locale]} width={800} height={500} loading="lazy" /><span className="mx-adult-tag">{en ? 'Engineering' : 'Mühendislik'}</span></span>
                  <span className="mx-card-body"><h3>{title}</h3><span className="mx-card-meta">{meta}</span><p>{text}</p></span>
                </Link>
              )
            })}
          </div>
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
        <ul>{[...PHOTO_CREDITS, ...ENG.map((c) => CAREER_PHOTOS[c.photo])].map((p) => <li key={p.file}><a href={p.source} rel="noopener">{p.title}</a> · {p.creator} · <a href={p.licenseUrl} rel="license noopener">{p.license}</a></li>)}</ul>
        <p>{en ? 'Photos from Wikimedia Commons, cropped to fit.' : 'Fotoğraflar Wikimedia Commons\'tan; sayfaya sığması için kırpıldı.'}</p>
      </details>
    </div>
  )
}
