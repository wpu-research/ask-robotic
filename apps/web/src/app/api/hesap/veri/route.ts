import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { exportUserData } from '@/lib/account-data'

export const dynamic = 'force-dynamic'

/** "Verilerimi indir" (KVKK md. 11): kişinin kendi verisi, JSON dosyası olarak. */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  const data = await exportUserData(getDb(), user.id)
  if (!data) return Response.json({ error: 'Hesap bulunamadı' }, { status: 404 })
  const day = new Date().toISOString().slice(0, 10)
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="macademiax-verilerim-${day}.json"`,
      'cache-control': 'no-store',
    },
  })
}
