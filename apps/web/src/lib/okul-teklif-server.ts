// Okul teklif talepleri: kayıt, admin listesi ve CSV.
import { schoolLeads, sql, type Db } from '@ask/db'
import { LEVELS, type LeadInput } from './okul-teklif'

export async function storeLead(db: Db, input: LeadInput, brand: string) {
  await db.insert(schoolLeads).values({ ...input, brand })
}

export type LeadRow = typeof schoolLeads.$inferSelect

export async function listLeads(db: Db, limit = 500): Promise<LeadRow[]> {
  return db.select().from(schoolLeads).orderBy(sql`${schoolLeads.createdAt} DESC`).limit(limit)
}

export const levelNames = (ids: string[]) => ids.map((id) => LEVELS.find((l) => l.id === id)?.tr ?? id).join(', ')

const cell = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)

/** Excel'de açılan CSV (UTF-8 BOM, noktalı virgül). */
export function leadsCsv(rows: LeadRow[]): string {
  const head = ['Tarih', 'Kaynak', 'Okul', 'İl/İlçe', 'Kademeler', 'Öğrenci', 'Yetkili', 'Görevi', 'Telefon', 'E-posta', 'Not']
  const lines = rows.map((r) => [r.createdAt.toISOString(), r.brand, r.school, r.city, levelNames(r.levels), r.students ?? '', r.contactName, r.contactRole ?? '', r.phone, r.email, r.note ?? '']
    .map((v) => cell(String(v))).join(';'))
  return '﻿' + [head.join(';'), ...lines].join('\r\n') + '\r\n'
}
