import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import useAuthStore from '../../store/authStore'

const roleLabelMap = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
}

function DashboardLayout({ title, subtitle, navigation, children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const roleLabel = roleLabelMap[user?.role] || 'User'
  const initials = user?.name
    ? user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || '')
      .join('')
    : 'U'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl gap-0 px-0 sm:px-4 lg:px-6">
        <aside className="sticky top-[69px] hidden h-[calc(100vh-70px)] w-72 shrink-0 flex-col border-r border-slate-200 bg-white/95 p-5 backdrop-blur lg:flex">
          <Link to="/" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-extrabold tracking-tight text-primary">
            Docvexa Console
          </Link>

          <nav className="mt-6 space-y-1.5">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsUserMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-text'
                  }`
                }
              >
                <span>{item.label}</span>
                {item.pill ? (
                  <span className="rounded-full border border-current/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                    {item.pill}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed in as</p>
            <p className="mt-1 text-sm font-bold text-text">{user?.name || 'Authenticated user'}</p>
            <p className="text-xs text-slate-600">{roleLabel} account</p>
            <Button className="mt-4 w-full" variant="ghost" onClick={handleLogout} disabled={isLoading}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-[69px] z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  aria-label="Open dashboard sidebar"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                  </svg>
                </button>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-text sm:text-xl">{title}</h1>
                  {subtitle ? <p className="truncate text-xs text-slate-600 sm:text-sm">{subtitle}</p> : null}
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initials}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{roleLabel}</span>
                    <span className="block text-sm font-semibold text-text">{user?.name || 'Account'}</span>
                  </span>
                </button>

                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="rounded-xl px-2.5 py-2">
                      <p className="truncate text-sm font-semibold text-text">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-xl px-2.5 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</section>
        </main>
      </div>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[88vw] border-r border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold tracking-tight text-primary">Docvexa Console</p>
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 text-slate-700"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close dashboard sidebar"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 space-y-1.5">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    setIsMobileSidebarOpen(false)
                    setIsUserMenuOpen(false)
                  }}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-text'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  {item.pill ? (
                    <span className="rounded-full border border-current/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                      {item.pill}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>

            <Button className="mt-8 w-full" variant="ghost" onClick={handleLogout} disabled={isLoading}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardLayout
