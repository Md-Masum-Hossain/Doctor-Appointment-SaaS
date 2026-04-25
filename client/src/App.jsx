import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import useAuthStore from './store/authStore'

function App() {
  const { initializeAuth, isInitialized } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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
