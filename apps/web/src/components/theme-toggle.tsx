'use client'
import { useEffect, useState } from 'react'
import { Icon } from './shell/icons'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)
  useEffect(() => {
    const cur = document.documentElement.dataset.theme
    setTheme(cur === 'dark' || cur === 'light' ? cur : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }, [])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('ask:theme', next) } catch { /* yoksay */ }
  }
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'} title="Temayı değiştir">
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
