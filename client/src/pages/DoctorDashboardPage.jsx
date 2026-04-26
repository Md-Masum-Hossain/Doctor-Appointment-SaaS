import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function DoctorDashboardPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-2xl font-semibold text-text">Doctor Dashboard</h2>
      <p className="text-slate-600">Welcome. Your doctor dashboard is secured and ready for upcoming features.</p>
      <Link to="/doctor/profile" className="mt-4 inline-block">
        <Button>Setup / Edit profile</Button>
      </Link>
      <Link to="/doctor/appointments" className="mt-4 inline-block ml-3">
        <Button variant="ghost">View appointments</Button>
      </Link>
    </section>
  )
}

export default DoctorDashboardPage
