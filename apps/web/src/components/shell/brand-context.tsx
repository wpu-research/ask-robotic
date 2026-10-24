'use client'
// İstemci bileşenleri için marka: kök düzende sunucunun çözdüğü marka kimliği verilir.
import { createContext, useContext, type ReactNode } from 'react'
import { BRANDS, type Brand, type BrandId } from '@/lib/brand'

const Ctx = createContext<Brand>(BRANDS.macademiax)

export function BrandProvider({ id, children }: { id: BrandId; children: ReactNode }) {
  return <Ctx.Provider value={BRANDS[id]}>{children}</Ctx.Provider>
}

export const useBrand = (): Brand => useContext(Ctx)
