'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setDark(root.classList.contains('dark'))
    const media = matchMedia('(prefers-color-scheme: dark)')
    const applyPreference = () => {
      let saved: string | null = null
      try { saved = localStorage.getItem('theme') } catch {}
      root.classList.toggle('dark', saved === 'dark' || (saved !== 'light' && media.matches))
      sync()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'theme' || event.key === null) applyPreference()
    }
    applyPreference()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    media.addEventListener('change', applyPreference)
    window.addEventListener('storage', onStorage)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', applyPreference)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      className="rounded p-1.5 transition-colors hover:bg-fg/10"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
