// Ders yazarları için etkinlik önizlemesi (ders oynatıcıya bağlanana kadar): /oyun-atolyesi/etkinlik/<id>
import { notFound } from 'next/navigation'
import { ActivityPreview } from '@/components/oyun/activity-preview'
import { ACTIVITY_BY_ID } from '@/lib/oyun/activities'

export default async function EtkinlikOnizleme({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!ACTIVITY_BY_ID[id]) notFound()
  return (
    <div className="page page-tool oy-page">
      <div className="tool-body oy-tool-body">
        <ActivityPreview id={id} />
      </div>
    </div>
  )
}
