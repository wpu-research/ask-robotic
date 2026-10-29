// ASK Jr betiklerinin Python karşılığı (yalnız gösterim; çalıştırılmaz). Blokların altında ne olduğunu görmek için:
// her blok bir fonksiyon çağrısı, "Tekrarla" for döngüsü, "Sonsuza kadar" while True olur.
import type { Block, BlockType, Script, Sprite } from './types'

type Lang = 'tr' | 'en'

/** Çağrı adları. Türkçede ASCII (ç, ğ, ı, ö, ş, ü yok) çünkü Python tanıtıcısı olarak da geçerli kalsın. */
const FN: Record<Lang, Partial<Record<BlockType, string>>> = {
  tr: { forward: 'ileri', back: 'geri', turnRight: 'saga_don', turnLeft: 'sola_don', hop: 'zipla', goHome: 'eve_don', say: 'soyle', grow: 'buyu', shrink: 'kucul', resetSize: 'boyutu_sifirla', hide: 'gizle', show: 'goster', pop: 'ses_cal', wait: 'bekle', goPage: 'sayfaya_git', stop: 'dur' },
  en: { forward: 'forward', back: 'back', turnRight: 'turn_right', turnLeft: 'turn_left', hop: 'hop', goHome: 'go_home', say: 'say', grow: 'grow', shrink: 'shrink', resetSize: 'reset_size', hide: 'hide', show: 'show', pop: 'play_sound', wait: 'wait', goPage: 'go_to_page', stop: 'stop' },
}
const EVENT: Record<Lang, Record<'flag' | 'tap', string>> = {
  tr: { flag: 'yesil_bayrak', tap: 'dokununca' },
  en: { flag: 'green_flag', tap: 'on_tap' },
}

const q = (s: string) => JSON.stringify(s)
const IND = '    '

function blockLines(b: Block, lang: Lang, depth: number): string[] {
  const pad = IND.repeat(depth)
  if (b.type === 'repeat' || b.type === 'forever') {
    const head = b.type === 'repeat' ? `for _ in range(${b.value ?? 1}):` : 'while True:'
    const inner = (b.children ?? []).flatMap((c) => blockLines(c, lang, depth + 1))
    return [pad + head, ...(inner.length ? inner : [`${pad}${IND}pass`])]
  }
  const fn = FN[lang][b.type]
  if (!fn) return []
  const arg = b.type === 'say' ? q(b.text ?? '') : b.value !== undefined ? String(b.value) : ''
  return [`${pad}${fn}(${arg})`]
}

/** Tek betik: ilk blok olay (bayrak/dokununca) ise dekoratörlü fonksiyon, değilse düz komutlar. */
export function scriptToPython(s: Script, lang: Lang = 'tr', index = 1): string {
  const first = s.blocks[0]
  const isEvent = first?.type === 'flag' || first?.type === 'tap'
  const body = (isEvent ? s.blocks.slice(1) : s.blocks).flatMap((b) => blockLines(b, lang, 1))
  if (!isEvent) return body.map((l) => l.slice(IND.length)).join('\n')
  const name = `${EVENT[lang][first.type as 'flag' | 'tap']}_${index}`
  return [`@${EVENT[lang][first.type as 'flag' | 'tap']}`, `def ${name}():`, ...(body.length ? body : [`${IND}pass`])].join('\n')
}

/** Bir karakterin tüm betikleri: karakteri tanıtan satır + her betik. */
export function spriteToPython(sp: Sprite, lang: Lang = 'tr'): string {
  const head = lang === 'tr'
    ? [`# Karakter: ${sp.character}`, 'from asklib import *', '']
    : [`# Sprite: ${sp.character}`, 'from asklib import *', '']
  if (!sp.scripts.length) return head.concat(lang === 'tr' ? '# Henüz blok yok: soldan blok sürükle.' : '# No blocks yet: drag a block from the left.').join('\n')
  const counts: Record<string, number> = {}
  const parts = sp.scripts.map((s) => {
    const k = s.blocks[0]?.type ?? 'x'
    counts[k] = (counts[k] ?? 0) + 1
    return scriptToPython(s, lang, counts[k])
  })
  return head.concat(parts.join('\n\n')).join('\n')
}

