import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GameHost } from '@/components/gozler/game-host'
import { getLocale } from '@/i18n/server'
import { GAMES, gameOf } from '@/lib/robotun-gozleri'

export const dynamicParams = false
export const generateStaticParams = () => GAMES.map((g) => ({ slug: g.slug }))
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = gameOf((await params).slug); return { title: g ? `Robotun Gözleri · ${g.tr.title}` : 'Robotun Gözleri' }
}

export default async function Oyun({ params }: { params: Promise<{ slug: string }> }) {
  const g = gameOf((await params).slug)
  if (!g) notFound()
  const lang = await getLocale(), en = lang === 'en', t = g[lang]
  return (
    <div className="page gz">
      <nav className="gz-steps" aria-label={en ? 'Games' : 'Oyunlar'}>
        <Link href="/robotun-gozleri" className="gz-home">{en ? '← Robot Eyes' : '← Robotun Gözleri'}</Link>
        <ol>{GAMES.map((x) => <li key={x.slug}><Link href={`/robotun-gozleri/oyun/${x.slug}`} aria-current={x.slug === g.slug ? 'page' : undefined} style={{ background: x.slug === g.slug ? x.color : undefined }}>{x.emoji}</Link></li>)}</ol>
      </nav>
      <header className="gz-lesson-head" style={{ background: g.color }}>
        <span className="gz-big-emoji" aria-hidden="true">{g.emoji}</span>
        <div><h1>{t.title}</h1><p className="gz-story">{t.how}</p></div>
      </header>
      <GameHost slug={g.slug} lang={lang} />
      <p className="gz-privacy">🔒 {en ? 'The camera image is processed only on this device by a small AI model; it is not sent anywhere or recorded. Leaving the page turns the camera off.' : 'Kamera görüntüsü yalnız bu cihazda küçük bir yapay zekâ modeliyle işlenir; hiçbir yere gönderilmez ve kaydedilmez. Sayfadan çıkınca kamera kapanır.'}</p>
    </div>
  )
}
