import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import DoctorCard from '../components/common/DoctorCard'
import { useDoctorsQuery } from '../hooks/useDoctorsQuery'

function DoctorsPage() {
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    minFee: '',
    maxFee: '',
    rating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 9,
  })

  const queryFilters = useMemo(
    () => ({
      specialization: filters.specialization,
      location: filters.location,
      minFee: filters.minFee,
      maxFee: filters.maxFee,
      rating: filters.rating,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page,
      limit: filters.limit,
    }),
    [filters],
  )

  const { data, isLoading, isError, error } = useDoctorsQuery(queryFilters)

  const doctors = data?.items || []
  const pagination = data?.pagination

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }))
  }

  const handlePagination = (direction) => {
    if (!pagination) {
      return
    }

    if (direction === 'prev') {
      setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
      return
    }

    setFilters((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))
  }

  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="Doctors"
          title="Find verified doctors by specialty and location"
          description="Search, filter, and browse doctor profiles before appointment features are added."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mt-10 space-y-6"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                name="specialization"
                label="Specialization"
                value={filters.specialization}
                onChange={(event) => updateFilter('specialization', event.target.value)}
                placeholder="Cardiology"
              />
              <Input
                name="location"
                label="Location"
                value={filters.location}
                onChange={(event) => updateFilter('location', event.target.value)}
                placeholder="Dhanmondi"
              />
              <Input
                name="rating"
                label="Min rating"
                type="number"
                value={filters.rating}
                onChange={(event) => updateFilter('rating', event.target.value)}
                placeholder="4"
              />
              <Input
                name="minFee"
                label="Min fee"
                type="number"
                value={filters.minFee}
                onChange={(event) => updateFilter('minFee', event.target.value)}
                placeholder="500"
              />
              <Input
                name="maxFee"
                label="Max fee"
                type="number"
                value={filters.maxFee}
                onChange={(event) => updateFilter('maxFee', event.target.value)}
                placeholder="2000"
              />

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Sort</span>
                <select
                  value={`${filters.sortBy}:${filters.sortOrder}`}
                  onChange={(event) => {
                    const [sortBy, sortOrder] = event.target.value.split(':')
                    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }))
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                >
                  <option value="createdAt:desc">Newest profiles</option>
                  <option value="ratingAverage:desc">Highest rated</option>
                  <option value="consultationFee:asc">Fee low to high</option>
                  <option value="consultationFee:desc">Fee high to low</option>
                  <option value="experienceYears:desc">Most experienced</option>
                </select>
              </label>
            </div>
          </section>

          {isLoading ? <p className="text-slate-600">Loading doctors...</p> : null}
          {isError ? <p className="text-sm text-rose-600">{error?.response?.data?.message || 'Failed to load doctors.'}</p> : null}

          {!isLoading && !doctors.length ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              No doctors found with the current filters.
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.24 }}
              >
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </div>

          {pagination ? (
            <div className="flex items-center justify-center gap-3 pt-2 text-sm">
              <Button
                variant="ghost"
                disabled={pagination.page <= 1}
                onClick={() => handlePagination('prev')}
              >
                Previous
              </Button>
              <span className="text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          ) : null}
        </motion.div>
      </Container>
    </div>
  )
}

export default DoctorsPage
