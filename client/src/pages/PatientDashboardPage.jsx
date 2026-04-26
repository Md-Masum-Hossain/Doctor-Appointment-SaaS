import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function PatientDashboardPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-2xl font-semibold text-text">Patient Dashboard</h2>
      <p className="text-slate-600">Welcome. Your patient dashboard is secured and ready for Phase 3 modules.</p>
      <Link to="/patient/appointments" className="mt-4 inline-block">
        <Button>View appointments</Button>
      </Link>
    </section>
  )
}

export default PatientDashboardPage
