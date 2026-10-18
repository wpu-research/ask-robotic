import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/site'
import { INSTRUCTORS, instructorBySlug, instructorHref, jsonLdString, personJsonLd } from './egitmenler'

const PUBLIC = fileURLToPath(new URL('../../../public', import.meta.url))
const APP = fileURLToPath(new URL('../../app', import.meta.url))

describe('eğitmen profilleri', () => {
  it('fotoğraf dosyaları public/ altında var', () => {
    for (const i of INSTRUCTORS) for (const p of Object.values(i.photo)) expect(existsSync(PUBLIC + p), p).toBe(true)
  })
  it('ders bağlantıları gerçek sayfalara gider', () => {
    for (const i of INSTRUCTORS) for (const c of i.courses) expect(existsSync(`${APP}${c.href}/page.tsx`), c.href).toBe(true)
  })
  it('TR ve EN metinler aynı yapıda', () => {
    for (const i of INSTRUCTORS) {
      expect(i.en.bio.length).toBe(i.tr.bio.length)
      expect(i.en.expertise.length).toBe(i.tr.expertise.length)
      expect(i.en.theses.map((t) => t.year)).toEqual(i.tr.theses.map((t) => t.year))
    }
  })
  it('yayınlar yeniden eskiye sıralı', () => {
    for (const i of INSTRUCTORS) {
      const years = i.publications.map((p) => p.year)
      expect(years).toEqual([...years].sort((a, b) => b - a))
    }
  })
  it('profil site haritasında', () => {
    const urls = sitemap().map((e) => e.url)
    for (const i of INSTRUCTORS) expect(urls).toContain(`${SITE_URL}${instructorHref(i)}`)
  })
  it('JSON-LD Person: mutlak adresler, gömülürken </script> kaçışı', () => {
    const m = instructorBySlug('murat-arslan')!
    const ld = personJsonLd(m, 'tr')
    expect(ld['@type']).toBe('Person')
    expect(ld.url).toBe(`${SITE_URL}/egitmen/murat-arslan`)
    expect(ld.image).toBe(`${SITE_URL}/img/egitmen/murat-arslan-480.jpg`)
    expect(personJsonLd(m, 'en').worksFor.name).toBe('Nişantaşı University')
    expect(jsonLdString({ x: '</script>' })).not.toContain('</script>')
  })
})
