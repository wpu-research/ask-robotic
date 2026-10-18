import Link from 'next/link'
import { Icon } from '@/components/shell/icons'
import { getLocale, getT } from '@/i18n/server'
import type { MessageKey } from '@/i18n'
import { instructorBySlug, instructorHref, type Instructor } from '@/lib/egitmen/egitmenler'
import './egitmen.css'

/** Yuvarlak eğitmen fotoğrafı: WebP, desteklenmezse JPG. */
export function InstructorPhoto({ instructor, size, alt, className }: { instructor: Instructor; size: 160 | 480; alt: string; className?: string }) {
  const p = instructor.photo
  return (
    <picture className={`ins-photo${className ? ` ${className}` : ''}`}>
      <source srcSet={size === 480 ? p.webp480 : `${p.webp160} 1x, ${p.webp480} 2x`} type="image/webp" />
      <img src={size === 480 ? p.jpg480 : p.jpg160} alt={alt} width={size} height={size} loading={size === 480 ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  )
}

/** Ders sayfalarında küçük eğitmen kartı: fotoğraf, ad, görev, profil bağlantısı. */
export async function InstructorCard({ slug, labelKey = 'instructor.card.label' }: { slug: string; labelKey?: MessageKey }) {
  const ins = instructorBySlug(slug)
  if (!ins) return null
  const [lang, t] = [await getLocale(), await getT()]
  return (
    <Link href={instructorHref(ins)} className="ins-card" data-testid={`ins-card-${ins.slug}`}>
      <InstructorPhoto instructor={ins} size={160} alt="" />
      <span className="ins-card-body">
        <span className="ins-card-label">{t(labelKey)}</span>
        <b>{ins.name[lang]}</b>
        <span className="ins-card-role">{ins[lang].short}</span>
      </span>
      <span className="ins-card-go">{t('instructor.card.profile')}<Icon name="chevronRight" size={16} /></span>
    </Link>
  )
}
