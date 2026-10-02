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

// Sahne Atölyesi (Modül 2) ve AI Mühendisliği (Modül 7) entegrasyonu
import { getSahneActivity } from './sahne/activities'
import { getAiActivity } from './ai/activities'
import { UPCOMING } from './module-meta'
import { STATIC_ITEMS } from './command-palette'
import { NAV } from '@/components/shell/nav-items'

const scratch = allModules.find((m) => m.slug === 'scratch')!
const ai = allModules.find((m) => m.slug === 'ai-muhendisligi')!

describe('Sahne Atölyesi ve AI Mühendisliği kaydı', () => {
  it('Modül 2: 16 dersin hepsinin Sahne etkinliği var, rozet Blok', () => {
    let n = 0
    scratch.weeks.forEach((w, wi) => w.lessons.forEach((l, li) => {
      n++
      expect(getSahneActivity(activityKey('scratch', wi + 1, li + 1)), `${w.title} / ${l.title}`).not.toBeNull()
      expect(lessonKind('scratch', wi + 1, li + 1)).toBe('blok')
    }))
    expect(n).toBe(16)
  })
  it('Modül 2 metinleri: dış hizmet yönlendirmesi ve ekransız ibaresi kalmadı', () => {
    const txt = JSON.stringify(scratch.weeks)
    expect(txt).not.toMatch(/remix|ekransız|topluluğuna|Hesap açmadan|Scratch'i aç/i)
  })
  it('Modül 7: etkinliği olan dersler AI, olmayanlar Metin rozeti alır; etkinlik sayısı 33', () => {
    let withAct = 0
    ai.weeks.forEach((w, wi) => w.lessons.forEach((l, li) => {
      const has = !!getAiActivity(activityKey('ai-muhendisligi', wi + 1, li + 1))
      if (has) withAct++
      expect(lessonKind('ai-muhendisligi', wi + 1, li + 1), `${w.title} / ${l.title}`).toBe(has ? 'ai' : 'metin')
    }))
    expect(withAct).toBe(33)
    expect(moduleKind('ai-muhendisligi')).toBe('ai')
    expect(KIND_LABEL.ai).toBe('AI')
    expect(LESSON_KIND_LABEL.ai).toBe('AI')
    expect(MODULE_META['ai-muhendisligi'].callout).toMatch(/simülasyon/)
  })
  it('Modül 7 artık "Yakında" değil', () => {
    expect(UPCOMING.some((u) => u.position === 7 || /ai-/.test(u.slug))).toBe(false)
  })
  it('kenar çubuğu ve komut paletinde Sahne ve AI atölyesi var', () => {
    const hrefs = NAV.flatMap((g) => g.items.map((i) => i.href))
    expect(hrefs).toEqual(expect.arrayContaining(['/sahne-atolyesi', '/ai-atolyesi']))
    const p = STATIC_ITEMS.map((i) => i.href)
    expect(p).toEqual(expect.arrayContaining(['/sahne-atolyesi', '/ai-atolyesi']))
  })
})
