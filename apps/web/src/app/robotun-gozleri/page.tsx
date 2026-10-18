import type { Metadata } from 'next'
import Link from 'next/link'
import { Art } from '@/components/kids/art'
import { getLocale } from '@/i18n/server'
import { GAME_KIND_LABEL, GAMES, LESSONS } from '@/lib/robotun-gozleri'

export const metadata: Metadata = { title: 'Robotun Gözleri', description: 'Çocuklar için görüntü işleme: pikseller, renkler, maske, nesne bulma ve kamera oyunları.' }

export default async function RobotunGozleri() {
  const lang = await getLocale()
  const en = lang === 'en'
  return (
    <div className="page gz">
      <header className="gz-hero">
        <Art kind="goz" className="gz-hero-art" />
        <div>
          <p className="eyebrow">{en ? 'Ages 8–12 · image processing' : '8–12 yaş · görüntü işleme'}</p>
          <h1>{en ? 'Robot Eyes' : 'Robotun Gözleri'}</h1>
          <p className="lead">{en ? 'How does a robot see the world? Step by step: pixels, colours, masks, finding objects and teaching the robot. Then play games with your face, hands and whole body!' : 'Bir robot dünyayı nasıl görür? Adım adım: pikseller, renkler, maskeler, nesne bulma ve robota öğretmek. Sonra yüzünle, ellerinle ve bütün vücudunla oyun oyna!'}</p>
          <Link className="gz-btn big" href="/robotun-gozleri/ders/1">{en ? 'Start lesson 1' : '1. derse başla'} →</Link>
        </div>
      </header>

      <section aria-labelledby="gz-l">
        <h2 id="gz-l">{en ? 'Lessons' : 'Dersler'}</h2>
        <ol className="gz-cards">
          {LESSONS.map((l) => (
            <li key={l.n}>
              <Link href={`/robotun-gozleri/ders/${l.n}`} className="gz-card" data-testid={`gz-lesson-${l.n}`}>
                <span className="gz-card-art" style={{ background: l.color }} aria-hidden="true"><span>{l.emoji}</span><b>{l.n}</b></span>
                <span className="gz-card-body"><b>{l[lang].title}</b><small>{l[lang].story.split('. ')[0]}.</small></span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="gz-g">
        <h2 id="gz-g">{en ? 'Camera games' : 'Kamera oyunları'}</h2>
        <p className="muted">{en ? 'These games use your camera. Everything runs inside this browser: your picture is never sent or saved.' : 'Bu oyunlar kamerayı kullanır. Her şey bu tarayıcının içinde çalışır: görüntün hiçbir yere gönderilmez ve kaydedilmez.'}</p>
        <ul className="gz-cards games">
          {GAMES.map((g) => (
            <li key={g.slug}>
              <Link href={`/robotun-gozleri/oyun/${g.slug}`} className="gz-card" data-testid={`gz-game-${g.slug}`}>
                <span className="gz-card-art" style={{ background: g.color }} aria-hidden="true"><span>{g.emoji}</span><i className={`gz-kind ${g.kind}`}>{GAME_KIND_LABEL[g.kind][lang]}</i></span>
                <span className="gz-card-body"><b>{g[lang].title}</b><small>{g[lang].text}</small></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/robotun-gozleri/demolar" className="gz-adult" data-testid="gz-demolar">
        <span aria-hidden="true">🏭</span>
        <span><b>{en ? 'For teens and adults: Real-World Demos' : 'Gençler ve büyükler için: Gerçek Hayat Demoları'}</b><br /><small>{en ? 'Fall detection, zone intrusion, pulse from the camera, traffic counting, fruit ripeness… with the pipeline and Python code.' : 'Düşme tespiti, bölge ihlali, kameradan nabız, trafik sayacı, meyve olgunluğu… boru hattı ve Python koduyla.'}</small></span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
