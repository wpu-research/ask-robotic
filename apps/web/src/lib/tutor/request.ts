// POST /api/tutor gövde doğrulaması (zod). Adım verisi istemciden ALINMAZ; yalnız kimlikler ve öğrencinin durumu.
import { z } from 'zod'
import { MAX_CHARS, MAX_MESSAGES } from './protocol'
import { PAGE_PATH_RE } from './page-context'

export { MAX_CHARS, MAX_MESSAGES }
export const MAX_BODY_BYTES = 16_000
export const DEVICE_RE = /^[0-9a-f-]{32,40}$/

const message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(MAX_CHARS),
})

export const tutorRequestSchema = z.object({
  lessonId: z.number().int().positive(),
  stepIndex: z.number().int().min(0).max(500),
  status: z.enum(['idle', 'wrong', 'correct', 'revealed']),
  attempts: z.number().int().min(0).max(100),
  answerSnapshot: z.string().max(MAX_CHARS).optional().default(''),
  messages: z.array(message).min(1).max(MAX_MESSAGES),
  /** Girişsiz kullanımda tarayıcının anonim cihaz kimliği (lib/events getDeviceId). */
  deviceId: z.string().regex(DEVICE_RE).optional(),
  /** Onboarding profilindeki yaş (yalnız dil seviyesi için; hesabın doğum yılı varsa o geçerli). */
  age: z.number().int().min(4).max(99).optional(),
  locale: z.enum(['tr', 'en']).optional(),
}).strict()

/** Her sayfadaki Mac (ders oynatıcısı dışı): yalnız sayfa yolu gelir, içerik sunucuda yüklenir (lib/tutor/page-context.ts). */
export const pageRequestSchema = z.object({
  page: z.string().regex(PAGE_PATH_RE),
  messages: z.array(message).min(1).max(MAX_MESSAGES),
  deviceId: z.string().regex(DEVICE_RE).optional(),
  age: z.number().int().min(4).max(99).optional(),
  locale: z.enum(['tr', 'en']).optional(),
}).strict()

export type TutorRequest = z.infer<typeof tutorRequestSchema>
export type PageRequest = z.infer<typeof pageRequestSchema>

export type ParsedTutorRequest =
  | { ok: true; mode: 'lesson'; data: TutorRequest }
  | { ok: true; mode: 'page'; data: PageRequest }
  | { ok: false; error: string }

/** Ek kurallar: konuşma öğrenciyle başlar ve öğrenciyle biter (asistan ön-doldurma yok). */
export function parseTutorRequest(body: unknown): ParsedTutorRequest {
  const page = !!body && typeof body === 'object' && 'page' in body
  const r = page ? pageRequestSchema.safeParse(body) : tutorRequestSchema.safeParse(body)
  if (!r.success) return { ok: false, error: 'Geçersiz istek' }
  const m = r.data.messages
  if (m[0].role !== 'user') return { ok: false, error: 'Konuşma öğrenci mesajıyla başlamalı' }
  if (m[m.length - 1].role !== 'user') return { ok: false, error: 'Son mesaj öğrenciden olmalı' }
  return page ? { ok: true, mode: 'page', data: r.data as PageRequest } : { ok: true, mode: 'lesson', data: r.data as TutorRequest }
}
