import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import useAuthStore from '../store/authStore'
import { useDoctorDetailsQuery } from '../hooks/useDoctorsQuery'
import { useCreateAppointmentMutation } from '../hooks/useAppointmentsQuery'

function DoctorDetailsPage() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useDoctorDetailsQuery(id)
  const { isAuthenticated, user } = useAuthStore()
  const createAppointmentMutation = useCreateAppointmentMutation()
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    notes: '',
  })
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')

  const slotSummary = useMemo(() => {
    if (!data?.availableSlots?.length) {
      return 'No slots added yet'
    }

    return data.availableSlots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join(', ')
  }, [data?.availableSlots])

  const handleBookingChange = (event) => {
    const { name, value } = event.target
    setBookingForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookAppointment = async (event) => {
    event.preventDefault()
    setBookingMessage('')
    setBookingError('')

    try {
      await createAppointmentMutation.mutateAsync({
        doctorId: data._id,
        appointmentDate: bookingForm.appointmentDate,
        timeSlot: bookingForm.timeSlot,
        reason: bookingForm.reason,
        notes: bookingForm.notes,
      })

      setBookingMessage('Appointment request submitted successfully.')
      setBookingForm({ appointmentDate: '', timeSlot: '', reason: '', notes: '' })
    } catch (submissionError) {
      setBookingError(submissionError?.response?.data?.message || 'Could not book appointment.')
    }
  }

  if (isLoading) {
    return (
      <div className="py-10">
        <Container>
          <p className="text-slate-600">Loading doctor details...</p>
        </Container>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-10">
        <Container>
          <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Could not load doctor profile.'}</p>
          <Link to="/doctors" className="mt-4 inline-block text-primary hover:underline">
            Back to doctors
          </Link>
        </Container>
      </div>
    )
  }

  return (
    <div className="py-10">
      <Container>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{data.specialization}</Badge>
            {data.isVerified ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Verified doctor</Badge>
            ) : (
              <Badge className="border-amber-200 bg-amber-50 text-amber-700">Verification pending</Badge>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-text">Dr. {data.user?.name}</h1>
          <p className="mt-1 text-sm text-slate-600">{data.hospitalName || 'Hospital information not provided'}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">Consultation Fee</p>
              <p className="mt-1 font-semibold text-text">BDT {data.consultationFee}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">Experience</p>
              <p className="mt-1 font-semibold text-text">{data.experienceYears} years</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">Rating</p>
              <p className="mt-1 font-semibold text-text">{data.ratingAverage?.toFixed?.(1) || '0.0'} / 5</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">Reviews</p>
              <p className="mt-1 font-semibold text-text">{data.ratingCount || 0}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-text">Chamber:</span> {data.chamberAddress || 'Not updated yet'}
            </p>
            <p>
              <span className="font-semibold text-text">Available days:</span>{' '}
              {data.availableDays?.length ? data.availableDays.join(', ') : 'Not provided'}
            </p>
            <p>
              <span className="font-semibold text-text">Available slots:</span> {slotSummary}
            </p>
            <p>
              <span className="font-semibold text-text">Qualifications:</span>{' '}
              {data.qualifications?.length ? data.qualifications.join(', ') : 'Not listed'}
            </p>
          </div>

          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{data.bio || 'Doctor bio not available yet.'}</p>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-text">Book appointment</h2>
            {!isAuthenticated ? (
              <p className="mt-2 text-sm text-slate-600">
                Please <Link to="/login" className="text-primary hover:underline">log in</Link> to request an appointment.
              </p>
            ) : user?.role !== 'patient' ? (
              <p className="mt-2 text-sm text-slate-600">Appointment booking is available for patient accounts only.</p>
            ) : (
              <form onSubmit={handleBookAppointment} className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  name="appointmentDate"
                  label="Appointment date"
                  type="date"
                  value={bookingForm.appointmentDate}
                  onChange={handleBookingChange}
                  required
                />

                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">Time slot</span>
                  <select
                    name="timeSlot"
                    value={bookingForm.timeSlot}
                    onChange={handleBookingChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="">Select a slot</option>
                    {data.availableSlots?.map((slot) => {
                      const value = `${slot.startTime} - ${slot.endTime}`
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      )
                    })}
                  </select>
                </label>

                <label className="block text-sm md:col-span-2">
                  <span className="mb-1.5 block font-medium text-slate-700">Reason</span>
                  <textarea
                    name="reason"
                    value={bookingForm.reason}
                    onChange={handleBookingChange}
                    rows={3}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                    placeholder="Tell the doctor why you need this visit"
                  />
                </label>

                <label className="block text-sm md:col-span-2">
                  <span className="mb-1.5 block font-medium text-slate-700">Notes</span>
                  <textarea
                    name="notes"
                    value={bookingForm.notes}
                    onChange={handleBookingChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                    placeholder="Optional additional notes"
                  />
                </label>

                {bookingMessage ? <p className="text-sm text-emerald-700 md:col-span-2">{bookingMessage}</p> : null}
                {bookingError ? <p className="text-sm text-rose-600 md:col-span-2">{bookingError}</p> : null}

                <div className="md:col-span-2">
                  <Button type="submit" disabled={createAppointmentMutation.isPending}>
                    {createAppointmentMutation.isPending ? 'Submitting...' : 'Book appointment'}
                  </Button>
                </div>
              </form>
            )}
          </section>

          <div className="mt-6">
            <Link to="/doctors">
              <Button variant="ghost">Back to list</Button>
            </Link>
          </div>
        </motion.section>
      </Container>
    </div>
  )
}

export default DoctorDetailsPage
