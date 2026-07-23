import { useEffect, useState } from 'react'

const STORAGE_KEY = 'airport-dashboard:dark-mode'

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, String(isDarkMode))
  }, [isDarkMode])

  return { isDarkMode, toggleDarkMode: () => setIsDarkMode((prev) => !prev) }
}
