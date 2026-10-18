// Akışlı cevap (saf mantık): sahte sunucu bir cevabı Messages API'nin akış olayları biçiminde (message_start,
// content_block_delta, message_stop) Server-Sent Events metnine çevirir; ağ bu metni rastgele BAYT sınırlarından
// keser (Türkçe karakterler iki bayttır, ortadan bölünebilir). İstemci ayrıştırıcısı akışlı TextDecoder ile çözer,
// boş satırla biten olayları tamponda birleştirir ve metni biriktirir. Ağ yoktur; her şey deterministiktir.
import { mulberry32 } from '@/lib/ai/text'

export interface SseEvent { event: string; data: Record<string, unknown> }

/** Metni kelime kelime (boşluk kelimeye bağlı) delta parçalarına böler; gerçek modeller token token yollar. */
export function deltasOf(text: string, wordsPerDelta = 1): string[] {
  const ws = text.match(/\S+\s*/g) ?? []
  const out: string[] = []
  for (let i = 0; i < ws.length; i += wordsPerDelta) out.push(ws.slice(i, i + wordsPerDelta).join(''))
  return out
}

export function eventsFor(text: string, id = 'msg_ogretim_01'): SseEvent[] {
  const deltas = deltasOf(text)
  return [
    { event: 'message_start', data: { type: 'message_start', message: { id, type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content: [], usage: { input_tokens: 812, output_tokens: 1 } } } },
    { event: 'content_block_start', data: { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } } },
    ...deltas.map((d) => ({ event: 'content_block_delta', data: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: d } } })),
    { event: 'content_block_stop', data: { type: 'content_block_stop', index: 0 } },
    { event: 'message_delta', data: { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: deltas.length } } },
    { event: 'message_stop', data: { type: 'message_stop' } },
  ]
}

export const serializeSse = (evs: readonly SseEvent[]): string => evs.map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`).join('')

/** SSE metnini UTF-8 baytlarına çevirip rastgele uzunlukta (1..maxLen) parçalara keser. */
export function chunkBytes(sse: string, seed = 7, maxLen = 48): Uint8Array[] {
  const bytes = new TextEncoder().encode(sse)
  const r = mulberry32(seed)
  const out: Uint8Array[] = []
  for (let i = 0; i < bytes.length;) {
    const n = 1 + Math.floor(r() * maxLen)
    out.push(bytes.slice(i, i + n))
    i += n
  }
  return out
}

/** Bir parçanın ortadan bölünmüş çok baytlı karakter içerip içermediği (gösterim için). */
export function splitsChar(chunk: Uint8Array): boolean {
  if (chunk.length === 0) return false
  const last = chunk[chunk.length - 1], first = chunk[0]
  return (last & 0xc0) === 0xc0 || (first & 0xc0) === 0x80
}

/** Akışlı SSE ayrıştırıcı: push() parçaları alır, tamamlanan olayları döndürür; text biriken cevaptır. */
export class SseParser {
  private decoder = new TextDecoder()
  private buffer = ''
  text = ''
  stopReason: string | null = null
  done = false
  events = 0

  push(chunk: Uint8Array): SseEvent[] {
    this.buffer += this.decoder.decode(chunk, { stream: true })
    const parts = this.buffer.split('\n\n')
    this.buffer = parts.pop() ?? '' // son parça yarım olabilir
    const out: SseEvent[] = []
    for (const raw of parts) {
      let event = 'message', data = ''
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data += line.slice(5).trim()
      }
      if (!data) continue
      const parsed = JSON.parse(data) as Record<string, unknown>
      const ev = { event, data: parsed }
      out.push(ev)
      this.events++
      this.apply(ev)
    }
    return out
  }

  private apply(ev: SseEvent) {
    if (ev.event === 'content_block_delta') {
      const d = ev.data.delta as { type: string; text?: string }
      if (d.type === 'text_delta' && d.text) this.text += d.text
    } else if (ev.event === 'message_delta') {
      this.stopReason = ((ev.data.delta as { stop_reason?: string }).stop_reason) ?? null
    } else if (ev.event === 'message_stop') {
      this.done = true
    }
  }
}

/** Tüm parçaları ayrıştırır (testler ve "hemen bitir" düğmesi için). */
export function parseAll(chunks: readonly Uint8Array[]): SseParser {
  const p = new SseParser()
  for (const c of chunks) p.push(c)
  return p
}
