import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import useAuthStore from './store/authStore'
import logo from './assets/logo.png'

function App() {
  const { initializeAuth } = useAuthStore()

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

  // Render immediately without blocking
  // Loading states are handled by ProtectedRoute and page components
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
