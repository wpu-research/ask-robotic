'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CodePane } from '@/components/lab/code-pane'

export function WorkbenchPortal({ target, children }: { target: HTMLElement | null; children: ReactNode }) {
  return target ? createPortal(children, target) : <>{children}</>
}

export function useSurfaceHeight(minimum = 300) {
  const host = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(minimum)
  useEffect(() => {
    if (!host.current) return
    const observer = new ResizeObserver(([entry]) => setHeight(Math.max(minimum, Math.floor(entry.contentRect.height))))
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [minimum])
  return { host, height }
}

export function WorkbenchCodeEditor({ value, onChange, errorLines }: { value: string; onChange: (value: string) => void; errorLines: number[] }) {
  const { host, height } = useSurfaceHeight(260)
  return <div ref={host} className="mj-code-editor" data-testid="mujoco-arduino-code"><CodePane value={value} onChange={onChange} errorLines={errorLines} height={height} /></div>
}
