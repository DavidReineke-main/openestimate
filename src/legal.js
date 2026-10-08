import './style.css'

document.querySelector('.theme-btn')?.addEventListener('click', () => {
  const root = document.documentElement
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  root.dataset.theme = dark ? 'light' : 'dark'
  try {
    localStorage.setItem('opp:theme', JSON.stringify(root.dataset.theme))
  } catch {}
})
