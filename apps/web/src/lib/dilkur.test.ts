// Dilkur markası: alan adından marka seçimi, ana sayfa bağlantılarının gerçek rotalara gitmesi, görsellerin diskte olması,
// okul teklif formu doğrulaması ve CSV.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BRANDS, brandForHost } from './brand'
import { MODULES_EN } from './catalog-en'
import { PHOTO_CREDITS, STAGES } from './dilkur-landing'
import { LEGAL } from '@/app/yasal/metinler'
import { LEVELS, leadSchema } from './okul-teklif'
import { leadsCsv, levelNames, storeLead, type LeadRow } from './okul-teklif-server'

const APP = join(__dirname, '..', 'app')
const PUBLIC = join(__dirname, '..', '..', 'public')
function routeExists(href: string): boolean {
  const path = href.split('#')[0]
  const mod = /^\/moduller\/(.+)$/.exec(path)
  if (mod) return mod[1] in MODULES_EN
  const legal = /^\/yasal\/(.+)$/.exec(path)
  if (legal) return legal[1] in LEGAL && existsSync(join(APP, 'yasal', '[slug]', 'page.tsx'))
  return existsSync(join(APP, ...path.split('/').filter(Boolean), 'page.tsx'))
}

describe('marka seçimi', () => {
  it('dilkur alt alan adı Dilkur, diğerleri MacademiaX', () => {
    expect(brandForHost('dilkur.macademia.com.tr').id).toBe('dilkur')
    expect(brandForHost('DILKUR.macademia.com.tr:443').id).toBe('dilkur')
    expect(brandForHost('robotix.macademia.com.tr').id).toBe('macademiax')
    expect(brandForHost('web-production-06ee9.up.railway.app').id).toBe('macademiax')
    expect(brandForHost(null).id).toBe('macademiax')
    expect(brandForHost('localhost:3000', 'dilkur').id).toBe('dilkur')
    expect(brandForHost('dilkur.macademia.com.tr', 'yok').id).toBe('dilkur')
  })
  it('Dilkur: logo dosyaları var, Macademia programları ve kurucu kartı gizli, altyapı notu açık', () => {
    const d = BRANDS.dilkur
    for (const f of Object.values(d.logo!)) expect(existsSync(join(PUBLIC, f)), f).toBe(true)
    expect(d.macademiaPrograms).toBe(false)
    expect(d.founderCard).toBe(false)
    expect(d.poweredBy).toBe(true)
    expect(d.contact!.whatsapp).toBe('https://wa.me/905466898666')
    for (const l of ['tr', 'en'] as const) for (const v of Object.values(d[l])) expect(v, l).toBeTruthy()
  })
})

describe('Dilkur ana sayfası', () => {
  it('dört kademe, anaokulundan liseye; her kademede iki sütun dolu', () => {
    expect(STAGES.map((s) => s.id)).toEqual(['anaokulu', 'ilkokul', 'ortaokul', 'lise'])
    for (const s of STAGES) { expect(s.robotik.length, s.id).toBeGreaterThan(0); expect(s.muhendislik.length, s.id).toBeGreaterThan(0) }
  })
  it('her ders bağlantısı gerçek bir sayfaya gider; kategori ve form bağlantıları da', () => {
    for (const s of STAGES) for (const l of [...s.robotik, ...s.muhendislik]) expect(routeExists(l.href), `${s.id}: ${l.href}`).toBe(true)
    for (const h of ['/robot-atolyesi', '/muhendislik', '/okullar', '/basla', '/yasal/kvkk-aydinlatma']) expect(routeExists(h), h).toBe(true)
  })
  it('fotoğraflar diskte ve künyeli', () => {
    for (const p of PHOTO_CREDITS) {
      expect(existsSync(join(PUBLIC, p.file)), p.file).toBe(true)
      expect(p.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\//)
    }
  })
})

const lead = { school: 'Atatürk İlkokulu', city: 'Aksaray / Merkez', levels: ['lise', 'anaokulu'], contactName: 'Ayşe Kaya', phone: '0546 689 86 66', email: 'Ayse@Okul.k12.tr', consentKvkk: true }

describe('okul teklif formu', () => {
  it('geçerli talebi kabul eder; kademeleri sıraya koyar, boş isteğe bağlıları null yapar', () => {
    const r = leadSchema.parse({ ...lead, contactRole: '', students: '' })
    expect(r.levels).toEqual(['anaokulu', 'lise'])
    expect(r.email).toBe('ayse@okul.k12.tr')
    expect(r.contactRole).toBeNull()
    expect(r.students).toBeNull()
    expect(leadSchema.parse({ ...lead, students: '320' }).students).toBe(320)
  })
  it('zorunlu alanlar, geçerli telefon ve KVKK onayı', () => {
    expect(leadSchema.safeParse({ ...lead, consentKvkk: false }).success).toBe(false)
    expect(leadSchema.safeParse({ ...lead, levels: [] }).success).toBe(false)
    expect(leadSchema.safeParse({ ...lead, levels: ['universite'] }).success).toBe(false)
    expect(leadSchema.safeParse({ ...lead, phone: '123' }).success).toBe(false)
    expect(leadSchema.safeParse({ ...lead, phone: 'beni ara' }).success).toBe(false)
    expect(leadSchema.safeParse({ ...lead, school: '' }).success).toBe(false)
    expect(leadSchema.safeParse({ ...lead, email: 'okul' }).success).toBe(false)
  })
  it('kayıt markayı sunucudan alır', async () => {
    let saved: Record<string, unknown> | null = null
    const db = { insert: () => ({ values: async (v: Record<string, unknown>) => { saved = v } }) } as never
    await storeLead(db, leadSchema.parse(lead), 'dilkur')
    expect(saved).toMatchObject({ brand: 'dilkur', school: 'Atatürk İlkokulu', consentKvkk: true })
  })
  it('CSV ve kademe adları', () => {
    expect(levelNames(['anaokulu', 'lise'])).toBe('Anaokulu, Lise (9-12)')
    expect(LEVELS).toHaveLength(4)
    const row: LeadRow = { id: 'x', brand: 'dilkur', school: 'Okul; "A"', city: 'Aksaray', levels: ['ilkokul'], students: 120, contactName: 'Ali', contactRole: null, phone: '0546', email: 'a@b.co', note: null, consentKvkk: true, createdAt: new Date('2026-10-24T09:00:00Z') }
    const csv = leadsCsv([row])
    expect(csv.startsWith('﻿Tarih;Kaynak;Okul')).toBe(true)
    expect(csv).toContain('"Okul; ""A"""')
    expect(csv).toContain(';İlkokul (1-4);120;')
  })
})
