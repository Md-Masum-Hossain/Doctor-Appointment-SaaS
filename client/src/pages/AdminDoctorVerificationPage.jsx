import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { useDoctorsQuery, useVerifyDoctorMutation } from '../hooks/useDoctorsQuery'

function AdminDoctorVerificationPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useDoctorsQuery({ page, limit: 10, verified: 'false', sortBy: 'createdAt', sortOrder: 'desc' })
  const verifyMutation = useVerifyDoctorMutation()

  const items = data?.items || []
  const pagination = data?.pagination

  const handleVerify = async (id) => {
    await verifyMutation.mutateAsync({ id, isVerified: true })
  }

  return (
    <div className="py-10">
      <Container>
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-2xl font-bold text-text">Admin Doctor Verification</h1>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder review console for pending doctor profile verification.
          </p>

          {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading pending doctors...</p> : null}

          {!isLoading && !items.length ? (
            <p className="mt-4 text-sm text-slate-600">No pending doctor profiles found.</p>
          ) : null}

          <div className="mt-5 space-y-3">
            {items.map((doctor) => (
              <div key={doctor._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-text">Dr. {doctor.user?.name}</p>
                  <p className="text-sm text-slate-600">
                    {doctor.specialization} • {doctor.hospitalName || doctor.chamberAddress || 'No location'}
                  </p>
                </div>
                <Button
                  onClick={() => handleVerify(doctor._id)}
                  disabled={verifyMutation.isPending}
                  className="sm:w-auto"
                >
                  {verifyMutation.isPending ? 'Verifying...' : 'Mark verified'}
                </Button>
              </div>
            ))}
          </div>

          {pagination ? (
            <div className="mt-6 flex items-center gap-3 text-sm">
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

export default AdminDoctorVerificationPage
