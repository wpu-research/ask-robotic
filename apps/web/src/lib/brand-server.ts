// Sunucu tarafı marka çözümü: istek başına bir kez, x-forwarded-host (Railway vekili) ya da host başlığından.
import { cache } from 'react'
import { headers } from 'next/headers'
import { brandForHost, type Brand } from './brand'

export const getBrand = cache(async (): Promise<Brand> => {
  const h = await headers()
  return brandForHost(h.get('x-forwarded-host') ?? h.get('host'), process.env.BRAND)
})
