import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

function DoctorCard({ doctor }) {
  const daysLabel = doctor.availableDays?.length
    ? doctor.availableDays.join(', ')
    : 'Schedule not updated yet'

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{doctor.specialization}</Badge>
        {doctor.isVerified ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Verified</Badge>
        ) : (
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-text">{doctor.user?.name || 'Doctor'}</h3>
      <p className="mt-1 text-sm text-slate-600">{doctor.hospitalName || doctor.chamberAddress || 'Hospital details coming soon'}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-slate-500">Fee</p>
          <p className="font-semibold text-text">BDT {doctor.consultationFee}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-slate-500">Experience</p>
          <p className="font-semibold text-text">{doctor.experienceYears} yrs</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-slate-600">{doctor.bio || 'Profile summary is being updated.'}</p>
      <p className="mt-2 text-xs text-slate-500">Available: {daysLabel}</p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-700">
          Rating {doctor.ratingAverage?.toFixed?.(1) || '0.0'} ({doctor.ratingCount || 0})
        </p>
        <Link to={`/doctors/${doctor._id}`}>
          <Button variant="ghost" className="px-4 py-2">
            View details
          </Button>
        </Link>
      </div>
    </motion.article>
  )
}

export default DoctorCard
