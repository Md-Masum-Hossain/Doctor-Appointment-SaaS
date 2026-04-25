import { Outlet } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { getDashboardPathByRole } from '../../utils/roleRedirect'

function MainLayout() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, isLoading } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold text-primary">
            Doctor Appointment SaaS
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  to={getDashboardPathByRole(user.role)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {user.name} ({user.role})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error transition hover:bg-error/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  Register
                </Link>
              </>
            )}
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Phase 2 Auth
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
