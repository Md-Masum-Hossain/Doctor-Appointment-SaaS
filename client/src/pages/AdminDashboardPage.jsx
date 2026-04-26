import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function AdminDashboardPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-2xl font-semibold text-text">Admin Dashboard</h2>
      <p className="text-slate-600">Welcome. Your admin dashboard is secured and ready for management features.</p>
      <Link to="/admin/doctors/verify" className="mt-4 inline-block">
        <Button>Review doctor verification</Button>
      </Link>
      <Link to="/admin/appointments" className="mt-4 inline-block ml-3">
        <Button variant="ghost">View appointments</Button>
      </Link>
    </section>
  )
}

export default AdminDashboardPage
