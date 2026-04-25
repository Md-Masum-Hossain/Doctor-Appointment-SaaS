import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return <p className="text-sm text-slate-600">Checking session...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
