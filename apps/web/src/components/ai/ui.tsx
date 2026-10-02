'use client'
import type { ReactNode } from 'react'

export interface ToolProps<S> {
  state: S
  onChange: (s: S) => void
  /** Ders etkinliğinde görev bağlamı sabit kalır (dünya, hedef sistem, iddia seti). */
  locked?: boolean
}

export const pct = (p: number): string => `${(p * 100).toFixed(p >= 0.995 || p === 0 ? 0 : 1)}%`

export function Bar({ name, value, label, kind }: { name: string; value: number; label?: string; kind?: 'ok' | 'warn' }) {
  return (
    <li className="ai-bar">
      <span className="ai-bar-name" title={name}>{name}</span>
      <span className="ai-bar-track" aria-hidden="true"><span className="ai-bar-fill" data-kind={kind} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} /></span>
      <span className="ai-bar-num">{label ?? pct(value)}</span>
    </li>
  )
}

export function Simulation({ children }: { children: ReactNode }) {
  return <p className="ai-sim"><b>Simülasyon.</b> {children}</p>
}
