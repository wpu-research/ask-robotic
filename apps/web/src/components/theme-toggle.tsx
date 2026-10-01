'use client'
import { useEffect, useState } from 'react'

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
    <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'} title="Tema">
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
