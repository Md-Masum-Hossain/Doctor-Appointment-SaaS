import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getDashboardPathByRole } from '../utils/roleRedirect'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, fieldErrors, isAuthenticated, user, clearError } = useAuthStore()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathByRole(user.role)} replace />
  }

  const onChange = (event) => {
    clearError()
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const loggedInUser = await login(form)

    if (loggedInUser) {
      const fallbackPath = getDashboardPathByRole(loggedInUser.role)
      const nextPath = location.state?.from?.pathname || fallbackPath
      navigate(nextPath, { replace: true })
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-2xl font-semibold text-text">Welcome back</h2>
      <p className="mb-6 text-sm text-slate-600">Log in to your account.</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-error">{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
          />
          {fieldErrors.password && <p className="mt-1 text-xs text-error">{fieldErrors.password}</p>}
        </div>

        {error && Object.keys(fieldErrors).length === 0 && (
          <p className="text-sm text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </section>
  )
}

export default LoginPage
