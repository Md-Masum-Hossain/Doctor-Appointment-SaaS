import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { getDashboardPathByRole } from '../utils/roleRedirect'

function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
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

    const registeredUser = await register(form)
    if (registeredUser) {
      navigate(getDashboardPathByRole(registeredUser.role), { replace: true })
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-2xl font-semibold text-text">Create account</h2>
      <p className="mb-6 text-sm text-slate-600">Start using your Doctor Appointment workspace.</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
          />
        </div>

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
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-primary"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </section>
  )
}

export default RegisterPage
