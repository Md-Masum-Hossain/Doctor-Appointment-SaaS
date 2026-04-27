import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { useMyAppointmentsQuery } from '../hooks/useAppointmentsQuery'

const patientNavigation = [
  { to: '/patient/dashboard', label: 'Overview' },
  { to: '/patient/appointments', label: 'My appointments' },
]

const isUpcoming = (appointmentDate, status) => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const visitDate = new Date(appointmentDate)

  return ['pending', 'accepted', 'rescheduled'].includes(status) && visitDate >= todayStart
}

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function PatientDashboardPage() {
  const { data, isLoading, isError, error } = useMyAppointmentsQuery({ page: 1, limit: 50, sortOrder: 'asc' })
  const appointments = data?.items ?? []

  const historySummary = appointments.reduce(
    (summary, appointment) => {
      summary.total += 1
      if (summary[appointment.status] !== undefined) {
        summary[appointment.status] += 1
      }
      return summary
    },
    {
      total: 0,
      pending: 0,
      accepted: 0,
      cancelled: 0,
      completed: 0,
      rescheduled: 0,
    },
  )

  const upcomingAppointments = appointments
    .filter((appointment) => isUpcoming(appointment.appointmentDate, appointment.status))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5)

  const upcomingColumns = [
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => (
        <div>
          <p className="font-semibold text-text">Dr. {row.doctor?.user?.name || 'Unknown doctor'}</p>
          <p className="text-xs text-slate-500">{row.doctor?.specialization || 'General practice'}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => formatDate(row.appointmentDate),
    },
    {
      key: 'timeSlot',
      header: 'Slot',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <DashboardLayout
      title="Patient Dashboard"
      subtitle="Track upcoming visits and booking activity from one workspace."
      navigation={patientNavigation}
    >
      <div className="space-y-6">
        {isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error?.response?.data?.message || 'Failed to load dashboard data.'}
          </div>
        ) : null}

        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Upcoming appointments" value={upcomingAppointments.length} helper="Next scheduled visits" icon="UP" index={0} />
            <StatCard label="Completed" value={historySummary.completed} helper="Finished consultations" icon="OK" tone="success" index={1} />
            <StatCard label="Rescheduled" value={historySummary.rescheduled} helper="Changed date or slot" icon="RS" tone="warning" index={2} />
            <StatCard label="Cancelled" value={historySummary.cancelled} helper="Dropped requests" icon="CN" tone="accent" index={3} />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="text-lg font-bold text-text">Upcoming appointments</h2>
            <p className="mt-1 text-sm text-slate-600">Your next consultations with live status updates.</p>

            <div className="mt-4">
              {isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : (
                <DataTable
                  columns={upcomingColumns}
                  rows={upcomingAppointments}
                  emptyState={
                    <EmptyState
                      title="No upcoming appointments"
                      description="Book your next consultation to keep your care plan on track."
                      action={
                        <Link to="/doctors">
                          <Button>Explore doctors</Button>
                        </Link>
                      }
                    />
                  }
                />
              )}
            </div>
          </section>

          <section className="space-y-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Appointment history summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Total bookings</span>
                  <span className="font-bold text-text">{historySummary.total}</span>
                </p>
                <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Accepted</span>
                  <span className="font-bold text-text">{historySummary.accepted}</span>
                </p>
                <p className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Completed</span>
                  <span className="font-bold text-text">{historySummary.completed}</span>
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Recommended doctors</h3>
              <p className="mt-2 text-sm text-slate-600">
                Personalized recommendations are coming soon. For now, browse all verified doctors.
              </p>
              <Link to="/doctors" className="mt-4 inline-flex">
                <Button variant="ghost">Browse directory</Button>
              </Link>
            </article>

            <article className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Quick book appointment</h3>
              <p className="mt-2 text-sm text-slate-600">Need care fast? Start a new booking in less than a minute.</p>
              <Link to="/doctors" className="mt-4 inline-flex">
                <Button>Book now</Button>
              </Link>
            </article>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PatientDashboardPage
