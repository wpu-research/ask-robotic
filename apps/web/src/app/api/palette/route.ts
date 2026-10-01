import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCatalog } from '@/lib/catalog'
import { buildPaletteItems } from '@/lib/palette-index'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = buildPaletteItems(await getCatalog(getDb()))
    return NextResponse.json({ items }, { headers: { 'cache-control': 'private, max-age=60' } })
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
