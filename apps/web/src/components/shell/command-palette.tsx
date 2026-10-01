'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { filterPalette, STATIC_ITEMS, type PaletteItem } from '@/lib/command-palette'
import { Icon, type IconName } from './icons'

const GROUP_ICON: Record<PaletteItem['group'], IconName> = { Sayfa: 'panel', Araç: 'atolye', Modül: 'moduller', Ders: 'book', Parça: 'parcalar' }

let cache: PaletteItem[] | null = null

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const ref = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [remote, setRemote] = useState<PaletteItem[]>(cache ?? [])
  const [loading, setLoading] = useState(false)

  // Dizin ilk açılışta bir kez çekilir.
  useEffect(() => {
    if (!open || cache) return
    let live = true
    setLoading(true)
    fetch('/api/palette').then((r) => r.json()).then((d: { items?: PaletteItem[] }) => {
      cache = d.items ?? []
      if (live) setRemote(cache)
    }).catch(() => { /* yalnız sabit öğeler gösterilir */ }).finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) { setQuery(''); setActive(0); d.showModal(); inputRef.current?.focus() }
    if (!open && d.open) d.close()
  }, [open])

  const items = useMemo(() => filterPalette([...STATIC_ITEMS, ...remote], query), [remote, query])
  useEffect(() => { setActive(0) }, [query])

  const go = (it: PaletteItem | undefined) => {
    if (!it) return
    onClose()
    router.push(it.href)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); setActive(0) }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]) }
  }

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  let lastGroup = ''
  return (
    <dialog ref={ref} className="palette" aria-label="Komut paleti" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose() }}>
      <div className="palette-box" onKeyDown={onKey}>
        <div className="palette-input">
          <Icon name="search" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Modül, ders veya parça ara…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items.length ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Ara"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Sonuçlar" className="palette-list">
          {items.map((it, i) => {
            const head = it.group !== lastGroup
            lastGroup = it.group
            return (
              <li key={it.id} role="presentation">
                {head && <div className="palette-group" aria-hidden="true">{it.group}</div>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className="palette-item"
                  data-active={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(it)}
                >
                  <Icon name={GROUP_ICON[it.group]} size={18} />
                  <span className="palette-text">
                    <span className="palette-title">{it.title}</span>
                    {it.subtitle && <span className="palette-sub">{it.subtitle}</span>}
                  </span>
                  <span className="palette-kind">{it.group}</span>
                </div>
              </li>
            )
          })}
          {!items.length && <li className="palette-empty" role="presentation">{loading ? 'Aranıyor…' : `“${query}” için sonuç yok. Başka bir sözcük dene.`}</li>}
        </ul>
        <div className="palette-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> gez</span><span><kbd>Enter</kbd> aç</span></div>
      </div>
    </dialog>
  )
}
