'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

const TOOL_PATHS = {
  move: <><path d="M12 3v18M3 12h18m-12-6 3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3" /></>,
  rotate: <><path d="M20 9a8 8 0 1 0 .3 5M20 3v6h-6" /></>,
  scale: <><path d="m14 3 7 0 0 7M21 3l-7 7M3 14v7h7m-7 0 7-7" /></>,
  surface: <><path d="m3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 18l9 5 9-5" /></>,
  extrude: <><path d="M5 14v7h14v-7M9 14h6v7M12 3v11M8 7l4-4 4 4" /></>,
  slice: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="m8 8 13 13M8 16l13-13m-9 9 2 2" /></>,
  snap: <><path d="M5 5v10a7 7 0 0 0 14 0V5M5 9h4V5H5m10 4h4m-4-4v10a3 3 0 0 1-6 0V5" /></>,
  angle: <><path d="M5 4v15h15M5 12a7 7 0 0 1 7 7" /><path d="m15 4 4 4-4 4m4-4H9" /></>,
  guides: <><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="1" /></>,
  grid: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></>,
  axes: <><path d="M6 3v15h15M6 18l10-10M3 6l3-3 3 3m9 9 3 3-3 3m-2-10V8h-3" /></>,
} satisfies Record<string, ReactNode>

export type WorkbenchToolIcon = keyof typeof TOOL_PATHS
export type WorkbenchView = 'serbest' | 'ust' | 'on' | 'yan'

export function ToolButton({ icon, label, shortcut, active, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: WorkbenchToolIcon
  label: string
  shortcut?: string
  active?: boolean
}) {
  return (
    <button type="button" className={`mj-tool${active ? ' on' : ''}`} aria-pressed={active} {...props}>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TOOL_PATHS[icon]}</svg>
      <span>{label}</span>
      {shortcut && <kbd>{shortcut}</kbd>}
    </button>
  )
}

export function ViewCube({ view, onView, en }: { view: WorkbenchView; onView: (view: WorkbenchView) => void; en: boolean }) {
  const labels = { ust: en ? 'Top' : 'Üst', on: en ? 'Front' : 'Ön', yan: en ? 'Right' : 'Sağ' }
  return (
    <div className="mj-viewcube" role="group" aria-label={en ? 'Camera view' : 'Kamera görünümü'}>
      <div className="mj-cube-faces">
        {(['ust', 'on', 'yan'] as const).map((face) => (
          <button key={face} type="button" className={`mj-cube-face ${face}`} aria-label={labels[face]} aria-pressed={view === face}
            onClick={() => onView(face)} data-testid={`mujoco-view-${face}`}>{labels[face]}</button>
        ))}
      </div>
      <button type="button" className="mj-view-reset" aria-pressed={view === 'serbest'} onClick={() => onView('serbest')} data-testid="mujoco-view-serbest">
        {en ? 'Perspective' : 'Perspektif'} <span aria-hidden="true">⌄</span>
      </button>
    </div>
  )
}
