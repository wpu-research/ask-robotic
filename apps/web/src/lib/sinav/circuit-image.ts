// SVG → PNG (resvg, DejaVu fontlarıyla). SVG öğretmenin tarayıcısında üretilir (components/sinav/circuit-svg.tsx). Yalnız sunucu.
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

export const MAX_SVG = 1_500_000

/** PNG (genişlik en çok 1600 px). Hata olursa null: PDF görüntüsüz devam eder. */
export function svgToPng(svg: string): Uint8Array | null {
  try {
    if (!svg.startsWith('<svg') || svg.length > MAX_SVG) return null
    const w = Number(/width="(\d+)"/.exec(svg)?.[1] ?? 800)
    const dir = path.join(process.cwd(), 'public', 'sinav')
    const r = new Resvg(svg, {
      fitTo: { mode: 'width', value: Math.min(1600, Math.round(w * 2)) },
      font: { loadSystemFonts: false, fontFiles: [path.join(dir, 'DejaVuSans.ttf'), path.join(dir, 'DejaVuSans-Bold.ttf')], defaultFontFamily: 'DejaVu Sans' },
      background: '#ffffff',
    })
    return r.render().asPng()
  } catch (e) {
    console.error('[sinav] devre görüntüsü üretilemedi', e)
    return null
  }
}
