import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import AppointmentStatusBadge from '../components/common/AppointmentStatusBadge'
import {
  useCancelAppointmentMutation,
  useMyAppointmentsQuery,
  useRescheduleAppointmentMutation,
} from '../hooks/useAppointmentsQuery'

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

const formatSlots = (slots = []) =>
  slots.map((slot) => ({
    label: `${slot.startTime} - ${slot.endTime}`,
    value: `${slot.startTime} - ${slot.endTime}`,
  }))

function PatientAppointmentsPage() {
  const [page, setPage] = useState(1)
  const [editingAppointmentId, setEditingAppointmentId] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    notes: '',
  })
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const { data, isLoading, isError, error } = useMyAppointmentsQuery({ page, limit: 8 })
  const cancelMutation = useCancelAppointmentMutation()
  const rescheduleMutation = useRescheduleAppointmentMutation()

  const appointments = data?.items || []
  const pagination = data?.pagination

  const openReschedule = (appointment) => {
    setEditingAppointmentId(appointment._id)
    setFeedback({ type: '', message: '' })
    setRescheduleForm({
      appointmentDate: new Date(appointment.appointmentDate).toISOString().slice(0, 10),
      timeSlot: appointment.timeSlot,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
    })
  }

  const handleRescheduleChange = (event) => {
    const { name, value } = event.target
    setRescheduleForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRescheduleSubmit = async (event) => {
    event.preventDefault()
    setFeedback({ type: '', message: '' })

    try {
      await rescheduleMutation.mutateAsync({
        id: editingAppointmentId,
        appointmentDate: rescheduleForm.appointmentDate,
        timeSlot: rescheduleForm.timeSlot,
        reason: rescheduleForm.reason,
        notes: rescheduleForm.notes,
      })

      setFeedback({ type: 'success', message: 'Appointment rescheduled successfully.' })
      setEditingAppointmentId(null)
    } catch (submissionError) {
      setFeedback({ type: 'error', message: submissionError?.response?.data?.message || 'Could not reschedule appointment.' })
    }
  }

  const handleCancel = async (appointmentId) => {
    setFeedback({ type: '', message: '' })

    try {
      await cancelMutation.mutateAsync(appointmentId)
      setFeedback({ type: 'success', message: 'Appointment cancelled successfully.' })
    } catch (submissionError) {
      setFeedback({ type: 'error', message: submissionError?.response?.data?.message || 'Could not cancel appointment.' })
    }
  }

  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="My appointments"
          title="Your appointment requests and schedule"
          description="Track booking status, cancel upcoming visits, or reschedule as needed."
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-8 space-y-4"
        >
          {isLoading ? <p className="text-slate-600">Loading your appointments...</p> : null}
          {isError ? <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load appointments.'}</p> : null}
          {feedback.message ? (
            <p className={feedback.type === 'error' ? 'text-sm text-rose-600' : 'text-sm text-emerald-700'}>{feedback.message}</p>
          ) : null}

          {!isLoading && !appointments.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
              You do not have any appointments yet.
            </div>
          ) : null}

          <div className="space-y-4">
            {appointments.map((appointment) => {
              const isEditing = editingAppointmentId === appointment._id
              const slotOptions = formatSlots(appointment.doctor?.availableSlots || [])

              return (
                <article key={appointment._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-text">Dr. {appointment.doctor?.user?.name}</h3>
                        <p className="text-sm text-slate-600">{appointment.doctor?.specialization || 'Specialization unavailable'}</p>
                      </div>

                      <AppointmentStatusBadge status={appointment.status} paymentStatus={appointment.paymentStatus} />

                      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p><span className="font-semibold text-text">Date:</span> {formatDate(appointment.appointmentDate)}</p>
                        <p><span className="font-semibold text-text">Slot:</span> {appointment.timeSlot}</p>
                        <p><span className="font-semibold text-text">Queue:</span> #{appointment.queueNumber}</p>
                        <p><span className="font-semibold text-text">Fee:</span> BDT {appointment.doctor?.consultationFee}</p>
                      </div>

                      <p className="text-sm text-slate-600"><span className="font-semibold text-text">Reason:</span> {appointment.reason}</p>
                      {appointment.notes ? <p className="text-sm text-slate-600"><span className="font-semibold text-text">Notes:</span> {appointment.notes}</p> : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' ? (
                        <>
                          <Button variant="ghost" onClick={() => openReschedule(appointment)}>
                            Reschedule
                          </Button>
                          <Button variant="ghost" onClick={() => handleCancel(appointment._id)} disabled={cancelMutation.isPending}>
                            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleRescheduleSubmit} className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          name="appointmentDate"
                          label="New date"
                          type="date"
                          value={rescheduleForm.appointmentDate}
                          onChange={handleRescheduleChange}
                          required
                        />

                        {slotOptions.length ? (
                          <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700">New time slot</span>
                            <select
                              name="timeSlot"
                              value={rescheduleForm.timeSlot}
                              onChange={handleRescheduleChange}
                              required
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                            >
                              <option value="">Select a slot</option>
                              {slotOptions.map((slot) => (
                                <option key={slot.value} value={slot.value}>
                                  {slot.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <Input
                            name="timeSlot"
                            label="New time slot"
                            value={rescheduleForm.timeSlot}
                            onChange={handleRescheduleChange}
                            placeholder="09:00 - 11:00"
                            required
                          />
                        )}

                        <label className="block text-sm md:col-span-2">
                          <span className="mb-1.5 block font-medium text-slate-700">Reason</span>
                          <textarea
                            name="reason"
                            value={rescheduleForm.reason}
                            onChange={handleRescheduleChange}
                            rows={3}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                          />
                        </label>

                        <label className="block text-sm md:col-span-2">
                          <span className="mb-1.5 block font-medium text-slate-700">Notes</span>
                          <textarea
                            name="notes"
                            value={rescheduleForm.notes}
                            onChange={handleRescheduleChange}
                            rows={3}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="submit" disabled={rescheduleMutation.isPending}>
                          {rescheduleMutation.isPending ? 'Saving...' : 'Save reschedule'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setEditingAppointmentId(null)}>
                          Close
                        </Button>
                      </div>
                    </form>
                  ) : null}
                </article>
              )
            })}
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

export default PatientAppointmentsPage
