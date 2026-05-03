import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import useAuthStore from './store/authStore'
import logo from './assets/logo.png'

function App() {
  const { initializeAuth, isInitialized } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    document.title = 'Docvexa'

    const iconSelector = 'link[rel="icon"]'
    let iconLink = document.querySelector(iconSelector)

    if (!iconLink) {
      iconLink = document.createElement('link')
      iconLink.rel = 'icon'
      document.head.appendChild(iconLink)
    }

    iconLink.type = 'image/png'
    iconLink.href = logo
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-slate-600">
        Restoring session...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
