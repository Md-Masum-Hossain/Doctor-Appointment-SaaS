import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import { useAdminAppointmentsQuery } from '../hooks/useAppointmentsQuery'
import { useDoctorsQuery } from '../hooks/useDoctorsQuery'

const adminNavigation = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/doctors/verify', label: 'Doctor verification' },
  { to: '/admin/appointments', label: 'Appointments' },
]

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function AdminDashboardPage() {
  const appointmentsTotalQuery = useAdminAppointmentsQuery({ page: 1, limit: 1 })
  const recentAppointmentsQuery = useAdminAppointmentsQuery({ page: 1, limit: 8, sortOrder: 'desc' })
  const pendingDoctorsQuery = useDoctorsQuery({ page: 1, limit: 1, verified: 'false' })
  const verifiedDoctorsQuery = useDoctorsQuery({ page: 1, limit: 1, verified: 'true' })

  const totalAppointments = appointmentsTotalQuery.data?.pagination?.total || 0
  const pendingVerifications = pendingDoctorsQuery.data?.pagination?.total || 0
  const totalDoctors = (pendingDoctorsQuery.data?.pagination?.total || 0) + (verifiedDoctorsQuery.data?.pagination?.total || 0)
  const recentAppointments = recentAppointmentsQuery.data?.items ?? []

  const inferredPatients = new Set(recentAppointments.map((item) => item.patient?._id).filter(Boolean)).size

  const recentColumns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (row) => row.patient?.name || 'Unknown patient',
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (row) => `Dr. ${row.doctor?.user?.name || 'Unknown'}`,
    },
    {
      key: 'appointmentDate',
      header: 'Date',
      render: (row) => formatDate(row.appointmentDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const isLoading = appointmentsTotalQuery.isLoading
    || recentAppointmentsQuery.isLoading
    || pendingDoctorsQuery.isLoading
    || verifiedDoctorsQuery.isLoading

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor platform activity, appointments, and doctor verification pipeline."
      navigation={adminNavigation}
    >
      <div className="space-y-6">
        {appointmentsTotalQuery.isError
          || recentAppointmentsQuery.isError
          || pendingDoctorsQuery.isError
          || verifiedDoctorsQuery.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {appointmentsTotalQuery.error?.response?.data?.message || 'Failed to load admin dashboard data.'}
            </div>
          ) : null}

        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total patients"
              value={inferredPatients || '--'}
              helper="Placeholder until patient admin API is available"
              icon="PT"
              index={0}
            />
            <StatCard label="Total doctors" value={totalDoctors} helper="Verified + pending" icon="DR" index={1} />
            <StatCard label="Total appointments" value={totalAppointments} helper="Across all statuses" icon="AP" tone="accent" index={2} />
            <StatCard
              label="Pending verifications"
              value={pendingVerifications}
              helper="Doctor approval queue"
              icon="PV"
              tone="warning"
              index={3}
            />
            <StatCard label="Recent activity" value={recentAppointments.length} helper="Latest appointment records" icon="RC" tone="success" index={4} />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">Recent appointments</h2>
                <p className="mt-1 text-sm text-slate-600">Latest booking activity from the entire platform.</p>
              </div>
              <Link to="/admin/appointments">
                <Button variant="ghost">View all</Button>
              </Link>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : (
                <DataTable
                  columns={recentColumns}
                  rows={recentAppointments}
                  emptyState={
                    <EmptyState
                      title="No recent appointments"
                      description="Appointments will appear here once users start booking."
                    />
                  }
                />
              )}
            </div>
          </section>

          <section className="space-y-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Verification queue</h3>
              <p className="mt-2 text-sm text-slate-600">
                {pendingVerifications
                  ? `${pendingVerifications} doctor profile(s) waiting for review.`
                  : 'No pending verification requests at the moment.'}
              </p>
              <Link to="/admin/doctors/verify" className="mt-4 inline-flex">
                <Button>Review doctors</Button>
              </Link>
            </article>

            <article className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 shadow-sm">
              <h3 className="text-lg font-bold text-text">Operations quick links</h3>
              <p className="mt-2 text-sm text-slate-600">Jump directly into the most-used admin workflows.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/admin/doctors/verify">
                  <Button>Verify profiles</Button>
                </Link>
                <Link to="/admin/appointments">
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

export default AdminDashboardPage
