import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useDoctorsQuery, useVerifyDoctorMutation } from '../hooks/useDoctorsQuery'
import { useDeleteUserMutation } from '../hooks/useUsersQuery'

function AdminDoctorVerificationPage() {
  const [page, setPage] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const { data, isLoading } = useDoctorsQuery({ page, limit: 10, sortBy: 'createdAt', sortOrder: 'desc', verified: 'false' })
  const verifyMutation = useVerifyDoctorMutation()
  const deleteUserMutation = useDeleteUserMutation()

  const items = data?.items || []
  const pagination = data?.pagination

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor)
    setShowModal(true)
  }

  const handleVerify = async (id) => {
    await verifyMutation.mutateAsync({ id, isVerified: true })
  }

  const handleUnverify = async (id) => {
    await verifyMutation.mutateAsync({ id, isVerified: false })
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and their profile? This action cannot be undone.')) {
      return
    }
    try {
      await deleteUserMutation.mutateAsync(userId)
    } catch (error) {
      console.error('Delete failed:', error)
    }
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
          <h1 className="text-2xl font-bold text-text">Doctor Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Review, verify, unverify, and manage all doctor profiles and accounts.
          </p>

          {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading doctors...</p> : null}

          {!isLoading && !items.length ? (
            <p className="mt-4 text-sm text-slate-600">No doctor profiles found.</p>
          ) : null}

          <div className="mt-5 space-y-3">
            {items.map((doctor) => (
              <div key={doctor._id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-semibold text-text">Dr. {doctor.user?.name}</p>
                      {doctor.isVerified ? (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Verified</Badge>
                      ) : (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {doctor.specialization} • {doctor.hospitalName || doctor.chamberAddress || 'No location'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Email: {doctor.user?.email} • Phone: {doctor.user?.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <Button
                      variant="ghost"
                      onClick={() => handleViewProfile(doctor)}
                      className="text-sm"
                    >
                      View Profile
                    </Button>
                    {!doctor.isVerified && (
                      <Button
                        onClick={() => handleVerify(doctor._id)}
                        disabled={verifyMutation.isPending}
                        className="text-sm"
                      >
                        {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
                      </Button>
                    )}
                    {doctor.isVerified && (
                      <Button
                        variant="ghost"
                        onClick={() => handleUnverify(doctor._id)}
                        disabled={verifyMutation.isPending}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        {verifyMutation.isPending ? 'Updating...' : 'Unverify'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(doctor.user._id)}
                      disabled={deleteUserMutation.isPending}
                      className="text-sm text-rose-600 hover:text-rose-700"
                    >
                      {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
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

        {/* Profile Modal */}
        {showModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-text">Doctor Profile</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Doctor Photo */}
              {selectedDoctor.photoUrl && (
                <div className="mb-4 flex justify-center rounded-lg bg-slate-100 p-3">
                  <img
                    src={selectedDoctor.photoUrl}
                    alt={selectedDoctor.user?.name || 'Doctor'}
                    className="max-h-64 w-auto max-w-full object-contain"
                  />
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-700">Name</p>
                  <p className="text-text">Dr. {selectedDoctor.user?.name}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Email</p>
                  <p className="text-text">{selectedDoctor.user?.email}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Phone</p>
                  <p className="text-text">{selectedDoctor.user?.phone}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Specialization</p>
                  <p className="text-text">{selectedDoctor.specialization}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Qualifications</p>
                  <p className="text-text">{selectedDoctor.qualifications?.join(', ') || 'Not provided'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Experience</p>
                  <p className="text-text">{selectedDoctor.experienceYears} years</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Consultation Fee</p>
                  <p className="text-text">BDT {selectedDoctor.consultationFee}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Hospital / Chamber</p>
                  <p className="text-text">{selectedDoctor.hospitalName || selectedDoctor.chamberAddress || 'Not provided'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Chamber Address</p>
                  <p className="text-text">{selectedDoctor.chamberAddress || 'Not provided'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Available Days</p>
                  <p className="text-text">{selectedDoctor.availableDays?.join(', ') || 'Not provided'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Available Slots</p>
                  <p className="text-text">
                    {selectedDoctor.availableSlots?.length
                      ? selectedDoctor.availableSlots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join(', ')
                      : 'Not provided'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Bio</p>
                  <p className="text-text">{selectedDoctor.bio || 'Not provided'}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-700">Verification Status</p>
                  <p className="text-text">
                    {selectedDoctor.isVerified ? (
                      <span className="text-emerald-600">Verified</span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </Container>
    </div>
  )
}

export default AdminDoctorVerificationPage
