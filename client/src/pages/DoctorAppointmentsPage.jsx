import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import AppointmentStatusBadge from '../components/common/AppointmentStatusBadge'
import { useDoctorAppointmentsQuery, useUpdateAppointmentStatusMutation } from '../hooks/useAppointmentsQuery'

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function DoctorAppointmentsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const { data, isLoading, isError, error } = useDoctorAppointmentsQuery({ page, limit: 10, status })
  const updateStatusMutation = useUpdateAppointmentStatusMutation()

  const appointments = data?.items || []
  const pagination = data?.pagination

  const handleStatusUpdate = async (appointmentId, nextStatus) => {
    setFeedback({ type: '', message: '' })

    try {
      await updateStatusMutation.mutateAsync({ id: appointmentId, status: nextStatus })
      setFeedback({ type: 'success', message: 'Appointment status updated.' })
    } catch (submissionError) {
      setFeedback({ type: 'error', message: submissionError?.response?.data?.message || 'Could not update status.' })
    }
  }

  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="Doctor queue"
          title="Appointment requests assigned to you"
          description="Review pending appointments and manage accepted visits from one place."
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-8 space-y-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">Filter by status</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary sm:w-64"
              >
                <option value="">All appointments</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>

          {isLoading ? <p className="text-slate-600">Loading assigned appointments...</p> : null}
          {isError ? <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load appointments.'}</p> : null}
          {feedback.message ? (
            <p className={feedback.type === 'error' ? 'text-sm text-rose-600' : 'text-sm text-emerald-700'}>{feedback.message}</p>
          ) : null}

          {!isLoading && !appointments.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
              No appointments match the current filter.
            </div>
          ) : null}

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <article key={appointment._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-text">{appointment.patient?.name}</h3>
                      <p className="text-sm text-slate-600">{appointment.patient?.phone || appointment.patient?.email}</p>
                    </div>

                    <AppointmentStatusBadge status={appointment.status} paymentStatus={appointment.paymentStatus} />

                    <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <p><span className="font-semibold text-text">Date:</span> {formatDate(appointment.appointmentDate)}</p>
                      <p><span className="font-semibold text-text">Slot:</span> {appointment.timeSlot}</p>
                      <p><span className="font-semibold text-text">Queue:</span> #{appointment.queueNumber}</p>
                      <p><span className="font-semibold text-text">Payment:</span> {appointment.paymentStatus}</p>
                    </div>

                    <p className="text-sm text-slate-600"><span className="font-semibold text-text">Reason:</span> {appointment.reason}</p>
                    {appointment.notes ? <p className="text-sm text-slate-600"><span className="font-semibold text-text">Notes:</span> {appointment.notes}</p> : null}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {(appointment.status === 'pending' || appointment.status === 'rescheduled') ? (
                      <Button
                        onClick={() => handleStatusUpdate(appointment._id, 'accepted')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Accept
                      </Button>
                    ) : null}

                    {appointment.status === 'accepted' ? (
                      <Button
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Complete
                      </Button>
                    ) : null}

                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel
                      </Button>
                    ) : null}
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

export default DoctorAppointmentsPage
