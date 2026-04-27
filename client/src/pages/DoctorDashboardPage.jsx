import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { useDoctorAppointmentsQuery } from '../hooks/useAppointmentsQuery'

const doctorNavigation = [
  { to: '/doctor/dashboard', label: 'Overview' },
  { to: '/doctor/appointments', label: 'Appointments' },
  { to: '/doctor/profile', label: 'Profile' },
]

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear()
  && dateA.getMonth() === dateB.getMonth()
  && dateA.getDate() === dateB.getDate()

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function DoctorDashboardPage() {
  const allAppointmentsQuery = useDoctorAppointmentsQuery({ page: 1, limit: 50, sortOrder: 'asc' })
  const pendingQuery = useDoctorAppointmentsQuery({ page: 1, limit: 1, status: 'pending' })
  const completedQuery = useDoctorAppointmentsQuery({ page: 1, limit: 1, status: 'completed' })

  const allAppointments = allAppointmentsQuery.data?.items ?? []
  const today = new Date()

  const todaysAppointments = allAppointments
    .filter((appointment) => isSameDay(new Date(appointment.appointmentDate), today))
    .slice(0, 8)

  const pendingRequests = allAppointments
    .filter((appointment) => appointment.status === 'pending')
    .slice(0, 6)

  const pendingCount = pendingQuery.data?.pagination?.total || 0
  const completedCount = completedQuery.data?.pagination?.total || 0

  const todaysColumns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => (
        <div>
          <p className="font-semibold text-text">{row.patient?.name || 'Unknown patient'}</p>
          <p className="text-xs text-slate-500">{row.patient?.phone || row.patient?.email || 'No contact'}</p>
        </div>
      ),
    },
    {
      key: 'timeSlot',
      header: 'Time slot',
    },
    {
      key: 'queueNumber',
      header: 'Queue',
      render: (row) => `#${row.queueNumber}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const pendingColumns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => row.patient?.name || 'Unknown patient',
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => formatDate(row.appointmentDate),
    },
    {
      key: 'timeSlot',
      header: 'Requested slot',
    },
  ]

  const isLoading = allAppointmentsQuery.isLoading || pendingQuery.isLoading || completedQuery.isLoading

  return (
    <DashboardLayout
      title="Doctor Dashboard"
      subtitle="Monitor today visits, incoming requests, and consultation progress."
      navigation={doctorNavigation}
    >
      <div className="space-y-6">
        {allAppointmentsQuery.isError || pendingQuery.isError || completedQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {allAppointmentsQuery.error?.response?.data?.message || 'Could not load dashboard details.'}
          </div>
        ) : null}

        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Today appointments" value={todaysAppointments.length} helper="Scheduled for today" icon="TD" index={0} />
            <StatCard label="Pending requests" value={pendingCount} helper="Awaiting your response" icon="PD" tone="warning" index={1} />
            <StatCard label="Completed appointments" value={completedCount} helper="Marked as completed" icon="CM" tone="success" index={2} />
            <StatCard label="Earnings" value="--" helper="Payment module coming soon" icon="BDT" tone="accent" index={3} />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">Today&apos;s appointments</h2>
                <p className="mt-1 text-sm text-slate-600">Your consultation queue for {formatDate(today)}.</p>
              </div>
              <Link to="/doctor/appointments">
                <Button variant="ghost">Open full queue</Button>
              </Link>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : (
                <DataTable
                  columns={todaysColumns}
                  rows={todaysAppointments}
                  emptyState={
                    <EmptyState
                      title="No appointments today"
                      description="You have a clear schedule for today. New requests will appear in your queue."
                    />
                  }
                />
              )}
            </div>
          </section>

          <section className="space-y-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Pending requests</h3>
              <p className="mt-1 text-sm text-slate-600">Most recent incoming appointment requests.</p>

              <div className="mt-4">
                {isLoading ? (
                  <LoadingSkeleton rows={2} />
                ) : (
                  <DataTable
                    columns={pendingColumns}
                    rows={pendingRequests}
                    emptyState={
                      <EmptyState
                        title="No pending requests"
                        description="All incoming requests are handled right now."
                      />
                    }
                  />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Quick actions</h3>
              <p className="mt-2 text-sm text-slate-600">Review your profile details or jump into appointment management.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/doctor/profile">
                  <Button>Update profile</Button>
                </Link>
                <Link to="/doctor/appointments">
                  <Button variant="ghost">Manage appointments</Button>
                </Link>
              </div>
            </article>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DoctorDashboardPage
