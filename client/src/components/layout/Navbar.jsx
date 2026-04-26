import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import Container from '../ui/Container'
import useAuthStore from '../../store/authStore'
import { getDashboardPathByRole } from '../../utils/roleRedirect'

const links = [
  { to: '/', label: 'Home' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading, logout } = useAuthStore()

  const closeMenu = () => setIsOpen(false)

  const handleLogout = async () => {
    await logout()
    closeMenu()
    navigate('/login', { replace: true })
  }

  const navClassName = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-slate-600 hover:text-text'}`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <Container className="py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">
            Docvexa
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated && user ? (
              <>
                <NavLink to={getDashboardPathByRole(user.role)}>
                  <Button variant="ghost" className="px-3 py-2">
                    {user.role} panel
                  </Button>
                </NavLink>
                <Button variant="ghost" onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <Button variant="ghost" className="px-4">
                    Login
                  </Button>
                </NavLink>
                <NavLink to="/register">
                  <Button variant="primary" className="px-4">
                    Get Started
                  </Button>
                </NavLink>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
            aria-label="Toggle navigation"
          >
            Menu
          </button>
        </div>

        {isOpen ? (
          <div className="mt-3 space-y-3 border-t border-slate-200 pt-3 md:hidden">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block rounded-lg px-2 py-2 text-sm font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-700'}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              {isAuthenticated && user ? (
                <>
                  <NavLink to={getDashboardPathByRole(user.role)} onClick={closeMenu}>
                    <Button variant="ghost" className="px-4">
                      Dashboard
                    </Button>
                  </NavLink>
                  <Button variant="ghost" onClick={handleLogout} disabled={isLoading}>
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu}>
                    <Button variant="ghost" className="px-4">
                      Login
                    </Button>
                  </NavLink>
                  <NavLink to="/register" onClick={closeMenu}>
                    <Button variant="primary" className="px-4">
                      Get Started
                    </Button>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  )
}

export default Navbar
