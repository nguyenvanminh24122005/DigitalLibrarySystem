const THEME_KEY = 'digilib_theme'

export function getDigilibTheme() {
  const theme = localStorage.getItem(THEME_KEY)

  if (theme === 'dark' || theme === 'light') {
    return theme
  }

  return 'light'
}

export function applyDigilibTheme() {
  const theme = getDigilibTheme()
  const isDark = theme === 'dark'

  document.documentElement.classList.toggle('digilib-dark', isDark)
  document.body.classList.toggle('digilib-dark', isDark)

  return theme
}

export function setDigilibTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light'

  localStorage.setItem(THEME_KEY, value)

  document.documentElement.classList.toggle('digilib-dark', value === 'dark')
  document.body.classList.toggle('digilib-dark', value === 'dark')

  window.dispatchEvent(
    new CustomEvent('digilib-theme-change', {
      detail: value
    })
  )

  return value
}

export function toggleDigilibTheme() {
  const current = getDigilibTheme()
  const next = current === 'dark' ? 'light' : 'dark'

  return setDigilibTheme(next)
}