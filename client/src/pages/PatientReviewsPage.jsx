import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Badge from '../components/ui/Badge'
import { useMyReviewsQuery } from '../hooks/useReviewsQuery'

const patientNavigation = [
  { to: '/patient/dashboard', label: 'Overview' },
  { to: '/patient/appointments', label: 'My appointments' },
  { to: '/patient/reviews', label: 'Review history' },
]

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function PatientReviewsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useMyReviewsQuery({ page, limit: 6, sortOrder: 'desc' })

  const reviews = data?.items || []
  const pagination = data?.pagination

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'text-amber-500' : 'text-slate-300'}>
        ★
      </span>
    ))

  return (
    <DashboardLayout
      title="Review History"
      subtitle="Revisit the feedback you shared after your completed appointments."
      navigation={patientNavigation}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {isError ? (
            <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load review history.'}</p>
          ) : null}

          {isLoading ? <LoadingSkeleton rows={3} className="mt-4" /> : null}

          {!isLoading && !reviews.length ? (
            <EmptyState
              title="No reviews yet"
              description="Complete an appointment and submit a rating to see it here."
              action={
                <Link to="/patient/appointments">
                  <Button>View appointments</Button>
                </Link>
              }
            />
          ) : null}

          {!isLoading && reviews.length ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-text">Dr. {review.doctor?.user?.name || 'Doctor'}</h3>
                        {review.doctor?.isVerified ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Verified</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-600">{review.doctor?.specialization || 'Specialization unavailable'}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(review.createdAt)} · {review.appointment?.timeSlot || 'Completed visit'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-700">{review.comment}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/doctors/${review.doctor?._id}`}>
                      <Button variant="ghost" size="sm">View doctor</Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {pagination ? (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
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
        </section>
      </div>
    </DashboardLayout>
  )
}

export default PatientReviewsPage
