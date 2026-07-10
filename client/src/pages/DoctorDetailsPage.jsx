import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Input from '../components/ui/Input'
import useAuthStore from '../store/authStore'
import { useDoctorDetailsQuery } from '../hooks/useDoctorsQuery'
import { useCreateAppointmentMutation } from '../hooks/useAppointmentsQuery'
import { paymentService } from '../services/paymentService'
import { useDoctorReviewsQuery } from '../hooks/useReviewsQuery'

function DoctorDetailsPage() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useDoctorDetailsQuery(id)
  const reviewsQuery = useDoctorReviewsQuery(id, { page: 1, limit: 5, sortOrder: 'desc' })
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
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false)
  const reviews = reviewsQuery.data?.items || []

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-amber-500' : 'text-slate-300'}>
        ★
      </span>
    ))

  const slotSummary = useMemo(() => {
    if (!data?.availableSlots?.length) {
      return 'No slots added yet'
    }

    return data.availableSlots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join(', ')
  }, [data])

  const handleBookingChange = (event) => {
    const { name, value } = event.target
    setBookingForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookAppointment = async (event) => {
    event.preventDefault()
    setBookingMessage('')
    setBookingError('')
    setIsRedirectingToPayment(true)

    try {
      const createdAppointment = await createAppointmentMutation.mutateAsync({
        doctorId: data._id,
        appointmentDate: bookingForm.appointmentDate,
        timeSlot: bookingForm.timeSlot,
        reason: bookingForm.reason,
        notes: bookingForm.notes,
      })

      const paymentResponse = await paymentService.initializeSslCommerzPayment(createdAppointment._id)
      const paymentData = paymentResponse?.data?.data || paymentResponse?.data
      const gatewayUrl = paymentData?.gatewayPageURL || paymentData?.gatewayPageUrl || paymentData?.GatewayPageURL

      if (gatewayUrl) {
        window.location.assign(gatewayUrl)
        return
      }

      setIsRedirectingToPayment(false)
      setBookingForm({ appointmentDate: '', timeSlot: '', reason: '', notes: '' })
    } catch (submissionError) {
      setIsRedirectingToPayment(false)
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
      {isRedirectingToPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white px-6 py-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-text">Preparing secure payment...</h2>
            <p className="mt-2 text-sm text-slate-600">Please wait while we connect you to SSLCommerz.</p>
          </div>
        </div>
      ) : null}

      <Container>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Doctor Photo */}
          {data.photoUrl ? (
            <div className="mb-6 flex min-h-64 w-full items-center justify-center rounded-xl bg-slate-100 p-3">
              <img
                src={data.photoUrl}
                alt={data.user?.name || 'Doctor'}
                className="max-h-96 w-auto max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="mb-6 h-64 w-full rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <svg
                className="h-24 w-24 text-blue-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}

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
          </div>

          <div className="mt-8 space-y-4 rounded-xl bg-white p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text">Patient reviews</h2>
                <p className="mt-1 text-sm text-slate-600">Feedback from completed appointments.</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <p className="text-slate-500">Average rating</p>
                <p className="mt-1 font-semibold text-text">
                  {data.ratingAverage?.toFixed?.(1) || '0.0'} / 5 · {data.ratingCount || 0} review(s)
                </p>
              </div>
            </div>

            {reviewsQuery.isLoading ? <LoadingSkeleton rows={2} className="mt-4" /> : null}
            {reviewsQuery.isError ? (
              <p className="mt-4 text-sm text-rose-600">{reviewsQuery.error?.response?.data?.message || 'Could not load reviews.'}</p>
            ) : null}

            {!reviewsQuery.isLoading && !reviews.length ? (
              <div className="mt-4">
                <EmptyState
                  title="No reviews yet"
                  description="This doctor has not received any patient feedback yet."
                />
              </div>
            ) : null}

            {!reviewsQuery.isLoading && reviews.length ? (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <article key={review._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-text">{review.patient?.name || 'Patient'}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()} · {review.appointment?.timeSlot || 'Completed visit'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-700">
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
                  <Button type="submit" disabled={createAppointmentMutation.isPending || isRedirectingToPayment}>
                    {createAppointmentMutation.isPending || isRedirectingToPayment ? 'Processing...' : 'Pay Now'}
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
