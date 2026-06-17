import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useLoadingThreshold from '../../hooks/useLoadingThreshold'
import LoadingSkeleton from '../ui/LoadingSkeleton'

function ProtectedRoute({ skeletonRows = 4 }) {
  const location = useLocation()
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore()
  
  // Only show skeleton if loading persists beyond 300ms
  const shouldShowSkeleton = useLoadingThreshold(isLoading && !isInitialized, 300)

  // Initialization in progress - show skeleton only if it takes > 300ms
  if (!isInitialized) {
    if (shouldShowSkeleton) {
      return (
        <div className="space-y-4 p-4 md:p-6">
          <LoadingSkeleton rows={skeletonRows} />
        </div>
      )
    }
    // Still initializing but within threshold - show nothing (transparent loading)
    return null
  }

  // Initialization complete - check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated - render protected route
  return <Outlet />
}

export default ProtectedRoute

