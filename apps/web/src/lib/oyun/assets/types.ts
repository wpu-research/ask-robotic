export type AssetCategory = 'oyuncu' | 'dusman' | 'yiyecek' | 'nesne' | 'karo'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  /** ASCII piksel: '0'-'9','a'-'f' palet rengi, '.' saydam. */
  rows: string[]
}

export const CATEGORY_LABEL: Record<AssetCategory, string> = {
  oyuncu: 'Oyuncular', dusman: 'Düşmanlar', yiyecek: 'Yiyecekler', nesne: 'Nesneler', karo: 'Karolar',
}
