// Parça açıklamaları (TR/EN) ve doğrulanmış datasheet bağlantıları. docs.json: slug → PartDoc.
// Bağlantılar eklenirken HTTP 200 ile doğrulandı; üretici belgesi yoksa temsilî üretici belgesi ya da güvenilir başvuru sayfası.
import data from './docs.json'

export interface DocText { what: string; how: string; choose: string }
export interface DocLink { title: string; publisher: string; url: string; kind: 'datasheet' | 'reference' | 'product' }
export interface PartDoc { tr: DocText; en: DocText; datasheets: DocLink[] }

const DOCS = data as Record<string, PartDoc>
export const docOf = (slug: string): PartDoc | undefined => DOCS[slug]
export const DOC_SLUGS = Object.keys(DOCS)
