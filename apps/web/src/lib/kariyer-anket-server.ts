// Kariyer anketi kaydı ve admin listesi. Sonuç istemciden alınmaz, burada cevaplardan yeniden hesaplanır.
import { careerSurveys, sql, type Db } from '@ask/db'
import { QUESTIONS, top3, type SurveyInput } from './kariyer-anket'

export async function storeSurvey(db: Db, input: SurveyInput, userId: string | null) {
  const result = top3(input.answers)
  await db.insert(careerSurveys).values({
    name: input.name, email: input.email, answers: input.answers, result, locale: input.locale,
    consentKvkk: input.consentKvkk, consentContact: input.consentContact, userId,
  })
  return result
}

export type SurveyRow = typeof careerSurveys.$inferSelect

export async function listSurveys(db: Db, limit = 500): Promise<SurveyRow[]> {
  return db.select().from(careerSurveys).orderBy(sql`${careerSurveys.createdAt} DESC`).limit(limit)
}

const cell = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

/** Excel'de açılan CSV (UTF-8 BOM, noktalı virgül). */
export function surveysCsv(rows: SurveyRow[], title: (slug: string) => string): string {
  const head = ['Tarih', 'Ad', 'E-posta', 'İletişim izni', '1. hedef', '2. hedef', '3. hedef', 'Cevaplar']
  const lines = rows.map((r) => [
    r.createdAt.toISOString(), r.name, r.email, r.consentContact ? 'evet' : 'hayır',
    ...[0, 1, 2].map((i) => (r.result[i] ? `${title(r.result[i].slug)} (%${r.result[i].pct})` : '')),
    QUESTIONS.filter((q) => r.answers[q.id]).map((q) => `${q.id}=${r.answers[q.id]}`).join(' '),
  ].map((v) => cell(String(v))).join(';'))
  return '﻿' + [head.join(';'), ...lines].join('\r\n') + '\r\n'
}
