'use client'
// Öğrencinin devresinin SVG'si (sınav kâğıdı PDF'i için), öğretmenin tarayıcısında üretilir: laboratuvarla aynı parça
// çizimleri (PartArt istemci bileşeni olduğundan sunucuda çizilemez), kablo yolları ve renkler; bağlı pin adları yazılır.
import { renderToStaticMarkup } from 'react-dom/server'
import { PartArt } from '@/components/lab/part-art'
import { I18nProvider } from '@/i18n/client'
import type { Circuit, PinRef } from '@/lib/lab/contract'
import { PART_DEFS, partBounds, pinDir, pinWorld, wireTrace } from '@/lib/lab/geometry'
import { layoutCanvasLabels } from '@/lib/lab/label-layout'

const PAD = 46

export function circuitSvg(c: Circuit): string | null {
  const parts = c.parts.filter((p) => PART_DEFS[p.type])
  if (!parts.length) return null
  const byId = new Map(parts.map((p) => [p.id, p]))
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const p of parts) {
    const b = partBounds(p)
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h)
  }
  x0 -= PAD; y0 -= PAD; x1 += PAD; y1 += PAD + 14
  const w = Math.ceil(x1 - x0), h = Math.ceil(y1 - y0)
  const pos = (r: PinRef) => { const p = byId.get(r.part); return p ? pinWorld(p, r.pin) : null }
  const dir = (r: PinRef) => { const p = byId.get(r.part); return p ? pinDir(p, r.pin) : { x: 0, y: 1 } }
  const wired = new Map<string, PinRef>()
  for (const wi of c.wires) { wired.set(`${wi.a.part}:${wi.a.pin}`, wi.a); wired.set(`${wi.b.part}:${wi.b.pin}`, wi.b) }

  const LABEL_FS = 10
  const caps = new Map(parts.filter((p) => p.type !== 'uno').map((p) => [p.id, p.id]))
  const placed = layoutCanvasLabels(parts, caps, LABEL_FS)

  const el = (
    <I18nProvider locale="en">
    <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={`${x0} ${y0} ${w} ${h}`} fontFamily="DejaVu Sans">
      <defs>
        <filter id="lab-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="lab-glow-s" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.4" /></filter>
        <pattern id="lab-lcd-dots" width={2.7} height={3.1} patternUnits="userSpaceOnUse"><path d="M0 0 H2.7 M0 0 V3.1" stroke="#000" strokeOpacity={0.35} strokeWidth={0.55} fill="none" /></pattern>
      </defs>
      <rect x={x0} y={y0} width={w} height={h} fill="#ffffff" />
      {parts.map((p) => {
        const d = PART_DEFS[p.type]
        return <g key={p.id} transform={`translate(${p.x} ${p.y}) rotate(${p.rotation} ${d.w / 2} ${d.h / 2})`}><PartArt part={p} /></g>
      })}
      {c.wires.map((wi, i) => {
        const a = pos(wi.a), b = pos(wi.b)
        if (!a || !b) return null
        const d = wireTrace(a, dir(wi.a), b, dir(wi.b), ((i % 3) - 1) * 8)
        const col = wi.color ?? '#3b82f6'
        return (
          <g key={wi.id}>
            <path d={d} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={6.2} strokeLinecap="round" />
            <path d={d} fill="none" stroke={col} strokeWidth={3.6} strokeLinecap="round" />
            <circle cx={a.x} cy={a.y} r={4} fill={col} stroke="#fff" strokeWidth={1} />
            <circle cx={b.x} cy={b.y} r={4} fill={col} stroke="#fff" strokeWidth={1} />
          </g>
        )
      })}
      {[...wired.values()].map((r) => {
        const p = byId.get(r.part)
        if (!p || p.type === 'uno') return null // Uno pin adları kartın üstünde zaten yazılı
        const l = placed.get(`${r.part}:${r.pin}`)
        if (!l) return null
        return <text key={`${r.part}:${r.pin}`} x={l.x} y={l.y} fontSize={LABEL_FS} fontWeight={700} fill="#1f2937" stroke="#fff" strokeWidth={3} paintOrder="stroke" textAnchor={l.anchor}>{r.pin}</text>
      })}
      {parts.filter((p) => p.type !== 'uno').map((p) => {
        const b = partBounds(p)
        const l = placed.get(`cap:${p.id}`)
        return <text key={`cap-${p.id}`} x={l?.x ?? b.x + b.w / 2} y={l?.y ?? b.y + b.h + 26} fontSize={11} fontWeight={700} fill="#6b7280" textAnchor={l?.anchor ?? 'middle'}>{p.id}</text>
      })}
    </svg>
    </I18nProvider>
  )
  return renderToStaticMarkup(el)
}


/** PDF isteği: {svgs: {girişKimliği: svg}} gönderip dosyayı indirir. */
export async function downloadExamPdf(url: string, items: Array<{ id: string; circuit: unknown }>) {
  const svgs: Record<string, string> = {}
  for (const it of items) {
    try {
      const c = it.circuit as Circuit | null
      const svg = c?.parts ? circuitSvg(c) : null
      if (svg) svgs[it.id] = svg
    } catch { /* bu öğrencinin görüntüsü olmadan devam */ }
  }
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ svgs }) })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
  const name = /filename="([^"]+)"/.exec(r.headers.get('content-disposition') ?? '')?.[1] ?? 'exam.pdf'
  const href = URL.createObjectURL(await r.blob())
  const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 10_000)
}
