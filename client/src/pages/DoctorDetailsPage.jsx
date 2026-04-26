import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useDoctorDetailsQuery } from '../hooks/useDoctorsQuery'

function DoctorDetailsPage() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useDoctorDetailsQuery(id)

  const slotSummary = useMemo(() => {
    if (!data?.availableSlots?.length) {
      return 'No slots added yet'
    }

    return data.availableSlots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join(', ')
  }, [data?.availableSlots])

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
