'use client'
// Çizimlerdeki (SVG <text>) kısa yazılar için çeviri düğümü. Çizim işlevleri bazen doğrudan çağrıldığından (StageCArt(...))
// kanca onların içinde değil, bu ayrı bileşende çağrılır.
import type { MessageKey, Params } from '@/i18n'
import { useT } from '@/i18n/client'

export function Tx({ k, params }: { k: MessageKey; params?: Params }) {
  return <>{useT()(k, params)}</>
}
