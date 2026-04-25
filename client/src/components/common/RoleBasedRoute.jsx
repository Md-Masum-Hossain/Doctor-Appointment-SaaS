import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { getDashboardPathByRole } from '../../utils/roleRedirect'

function RoleBasedRoute({ allowedRoles }) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />
  }

  return <Outlet />
}

export default RoleBasedRoute
