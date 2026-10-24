// Okul teklif formu: alanlar, kademeler ve doğrulama. Kayıt lib/okul-teklif-server.ts, API app/api/okul-teklif.
import { z } from 'zod'

export const LEVELS = [
  { id: 'anaokulu', tr: 'Anaokulu', en: 'Kindergarten' },
  { id: 'ilkokul', tr: 'İlkokul (1-4)', en: 'Primary (1-4)' },
  { id: 'ortaokul', tr: 'Ortaokul (5-8)', en: 'Middle school (5-8)' },
  { id: 'lise', tr: 'Lise (9-12)', en: 'High school (9-12)' },
] as const
export type LevelId = (typeof LEVELS)[number]['id']
const LEVEL_IDS = LEVELS.map((l) => l.id) as [LevelId, ...LevelId[]]

const opt = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : null))

export const leadSchema = z.object({
  school: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(80),
  levels: z.array(z.enum(LEVEL_IDS)).min(1).max(4).transform((a) => LEVEL_IDS.filter((l) => a.includes(l))),
  students: z.coerce.number().int().min(1).max(20000).optional().nullable().catch(null),
  contactName: z.string().trim().min(2).max(80),
  contactRole: opt(80),
  // Türkiye ve uluslararası biçimler: rakam, boşluk, +, (), - ; en az 10 rakam
  phone: z.string().trim().max(32).regex(/^[+\d\s()-]+$/).refine((p) => p.replace(/\D/g, '').length >= 10, 'Telefon eksik'),
  email: z.string().trim().toLowerCase().email().max(254),
  note: opt(1000),
  consentKvkk: z.literal(true),
})
export type LeadInput = z.infer<typeof leadSchema>
