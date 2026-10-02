// Mikro Kart (modül 10) ve Oyun Atölyesi (modül 11) entegrasyonu: içerik ↔ etkinlik kaydı ↔ meta tutarlılığı.
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { activityKey } from './jr/activity'
import { getMikroActivity } from './mikro/activities'
import { getOyunActivity, OYUN_ATOLYESI_ACTIVITIES } from './oyun/activities/ders-registry'
import { lessonKind } from './catalog'
import { KIND_LABEL, LESSON_KIND_LABEL, MODULE_META, moduleKind } from './module-meta'

const mikro = allModules.find((m) => m.slug === 'mikro-kart')!
const oyun = allModules.find((m) => m.slug === 'oyun-atolyesi')!

describe('Mikro Kart ve Oyun Atölyesi kaydı', () => {
  it('iki modül de içerik dizisinde', () => {
    expect(mikro?.position).toBe(10)
    expect(oyun?.position).toBe(11)
  })
  it('Mikro Kart: her dersin etkinliği var', () => {
    mikro.weeks.forEach((w, wi) => w.lessons.forEach((l, li) => {
      expect(getMikroActivity(activityKey('mikro-kart', wi + 1, li + 1)), `${w.title} / ${l.title}`).not.toBeNull()
    }))
  })
  it('Oyun Atölyesi: her dersin etkinliği var, anahtarlar benzersiz etkinlikler', () => {
    oyun.weeks.forEach((w, wi) => w.lessons.forEach((l, li) => {
      expect(getOyunActivity(activityKey('oyun-atolyesi', wi + 1, li + 1)), `${w.title} / ${l.title}`).not.toBeNull()
    }))
    expect(Object.keys(OYUN_ATOLYESI_ACTIVITIES)).toHaveLength(30)
    expect(new Set(Object.values(OYUN_ATOLYESI_ACTIVITIES).map((a) => a.id)).size).toBe(30)
  })
  it('ders türü rozetleri: Mikro Kart Blok, Oyun Atölyesi Oyun', () => {
    expect(lessonKind('mikro-kart', 1, 1)).toBe('blok')
    expect(lessonKind('oyun-atolyesi', 6, 5)).toBe('oyun')
    expect(LESSON_KIND_LABEL.oyun).toBe('Oyun')
    expect(moduleKind('mikro-kart')).toBe('blok')
    expect(moduleKind('oyun-atolyesi')).toBe('oyun')
    expect(KIND_LABEL.oyun).toBe('Oyun')
  })
  it('modül tanıtım metinleri var ve marka adı geçmez', () => {
    for (const s of ['mikro-kart', 'oyun-atolyesi']) {
      const m = MODULE_META[s]
      expect(m.tagline.length).toBeGreaterThan(20)
      expect(m.callout!.length).toBeGreaterThan(50)
      expect(JSON.stringify(m)).not.toMatch(/micro:?bit|makecode|arcade/i)
    }
  })
})
