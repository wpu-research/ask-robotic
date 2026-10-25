// Okul teklif talepleri: kayıt, admin listesi ve CSV.
import { schoolLeads, sql, type Db } from '@ask/db'
import { LEVELS, type LeadInput } from './okul-teklif'
import { escapeHtml, type MailContent } from './mail/templates'

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

/** Bildirim alıcıları: LEAD_NOTIFY_TO (virgülle ayrılmış). Boşsa ya da SMTP ayarlı değilse bildirim gönderilmez. */
export function leadNotifyTo(env: Record<string, string | undefined> = process.env): string[] {
  return (env.LEAD_NOTIFY_TO ?? '').split(',').map((s) => s.trim()).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
}

/** Yeni teklif talebi için iç bildirim e-postası (satış ekibine; okula gitmez). */
export function leadNotifyMail(lead: LeadInput, brandName: string, adminUrl: string): MailContent {
  const rows: [string, string][] = [
    ['Okul', lead.school], ['İl/İlçe', lead.city], ['Kademeler', levelNames(lead.levels)],
    ['Öğrenci', lead.students ? String(lead.students) : '—'], ['Yetkili', lead.contactName + (lead.contactRole ? ` (${lead.contactRole})` : '')],
    ['Telefon', lead.phone], ['E-posta', lead.email], ['Not', lead.note ?? '—'],
  ]
  const subject = `Yeni okul teklif talebi: ${lead.school} (${brandName})`
  const text = `${brandName} sitesinden yeni okul teklif talebi geldi.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nTüm talepler: ${adminUrl}`
  const html = `<!doctype html><html lang="tr"><body style="margin:0;padding:24px;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1c1c1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:28px">
<tr><td style="font-size:18px;font-weight:700;padding-bottom:14px">${escapeHtml(subject)}</td></tr>
${rows.map(([k, v]) => `<tr><td style="font-size:14px;line-height:1.5;padding:4px 0"><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</td></tr>`).join('\n')}
<tr><td style="padding-top:18px;font-size:14px"><a href="${escapeHtml(adminUrl)}" style="color:#2f6fed">Tüm talepler (yönetim paneli)</a></td></tr>
</table></td></tr></table></body></html>`
  return { subject, text, html }
}
