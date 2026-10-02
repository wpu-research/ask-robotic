'use client'
// Etkinlik nesnesi işlev içerdiğinden sunucu bileşeninden geçirilemez; kimlikten istemcide çözülür.
import { ACTIVITY_BY_ID } from '@/lib/oyun/activities'
import { OyunEditor } from './oyun-editor'

export function ActivityPreview({ id }: { id: string }) {
  const activity = ACTIVITY_BY_ID[id]
  if (!activity) return <p>Etkinlik bulunamadı.</p>
  return <OyunEditor activity={activity} storageKey={`ask:oyun:activity-preview:${id}`} />
}
