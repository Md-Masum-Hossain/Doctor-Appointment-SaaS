import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import AppointmentStatusBadge from '../components/common/AppointmentStatusBadge'
import Button from '../components/ui/Button'
import { useAdminAppointmentsQuery } from '../hooks/useAppointmentsQuery'

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function AdminAppointmentsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useAdminAppointmentsQuery({ page, limit: 10 })

  const appointments = data?.items || []
  const pagination = data?.pagination

  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="Admin view"
          title="All appointments in the system"
          description="Read-only overview for monitoring booking flow and queue status."
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-8 space-y-4"
        >
          {isLoading ? <p className="text-slate-600">Loading all appointments...</p> : null}
          {isError ? <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load appointments.'}</p> : null}

          {!isLoading && !appointments.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
              There are no appointments to display yet.
            </div>
          ) : null}

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <article key={appointment._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text">{appointment.patient?.name} → Dr. {appointment.doctor?.user?.name}</h3>
                      <p className="text-sm text-slate-600">{appointment.doctor?.specialization || 'Specialization unavailable'}</p>
                    </div>

                    <AppointmentStatusBadge status={appointment.status} paymentStatus={appointment.paymentStatus} />

                    <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <p><span className="font-semibold text-text">Date:</span> {formatDate(appointment.appointmentDate)}</p>
                      <p><span className="font-semibold text-text">Slot:</span> {appointment.timeSlot}</p>
                      <p><span className="font-semibold text-text">Queue:</span> #{appointment.queueNumber}</p>
                      <p><span className="font-semibold text-text">Payment:</span> {appointment.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {pagination ? (
            <div className="flex items-center justify-center gap-3 pt-2 text-sm">
              <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <span className="text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </motion.section>
      </Container>
    </div>
  )
}

export default AdminAppointmentsPage
