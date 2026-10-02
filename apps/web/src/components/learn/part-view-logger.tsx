'use client'
import { useEffect } from 'react'
import { logEvent } from '@/lib/events'

/** Parça sayfası açıldığında `part_view` olayı yazar (yalnız onayla). */
export function PartViewLogger({ slug }: { slug: string }) {
  useEffect(() => { logEvent('part_view', { p: { slug } }) }, [slug])
  return null
}
