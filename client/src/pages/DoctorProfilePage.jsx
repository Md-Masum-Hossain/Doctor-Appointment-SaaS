import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import useAuthStore from '../store/authStore'
import {
  useCreateDoctorProfileMutation,
  useUpdateDoctorProfileMutation,
} from '../hooks/useDoctorsQuery'

const initialForm = {
  specialization: '',
  qualifications: '',
  experienceYears: 0,
  consultationFee: 0,
  bio: '',
  hospitalName: '',
  chamberAddress: '',
  availableDays: '',
  availableSlots: '',
}

const parseCSV = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const parseSlots = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [startTime, endTime] = item.split('-').map((part) => part.trim())
      return { startTime, endTime }
    })
    .filter((slot) => slot.startTime && slot.endTime)

function DoctorProfilePage() {
  const [form, setForm] = useState(initialForm)
  const [mode, setMode] = useState('create')
  const [message, setMessage] = useState('')
  const [errorText, setErrorText] = useState('')

  const { user } = useAuthStore()
  const createMutation = useCreateDoctorProfileMutation()
  const updateMutation = useUpdateDoctorProfileMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const payload = useMemo(
    () => ({
      specialization: form.specialization,
      qualifications: parseCSV(form.qualifications),
      experienceYears: Number(form.experienceYears) || 0,
      consultationFee: Number(form.consultationFee) || 0,
      bio: form.bio,
      hospitalName: form.hospitalName,
      chamberAddress: form.chamberAddress,
      availableDays: parseCSV(form.availableDays),
      availableSlots: parseSlots(form.availableSlots),
    }),
    [form],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorText('')

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        setMessage('Doctor profile created successfully.')
      } else {
        await updateMutation.mutateAsync(payload)
        setMessage('Doctor profile updated successfully.')
      }
    } catch (error) {
      setErrorText(error?.response?.data?.message || 'Profile operation failed.')
    }
  }

  return (
    <div className="py-10">
      <Container>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-2xl font-bold text-text">Doctor Profile Setup / Edit</h1>
          <p className="mt-2 text-sm text-slate-600">
            Logged in as {user?.name}. Use create mode for first setup, then switch to update mode for edits.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant={mode === 'create' ? 'primary' : 'ghost'} onClick={() => setMode('create')}>
              Create profile
            </Button>
            <Button variant={mode === 'update' ? 'primary' : 'ghost'} onClick={() => setMode('update')}>
              Update profile
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              name="specialization"
              label="Specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              placeholder="Cardiology"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="experienceYears"
                label="Experience years"
                type="number"
                value={form.experienceYears}
                onChange={handleChange}
              />
              <Input
                name="consultationFee"
                label="Consultation fee"
                type="number"
                value={form.consultationFee}
                onChange={handleChange}
              />
            </div>

            <Input
              name="hospitalName"
              label="Hospital name"
              value={form.hospitalName}
              onChange={handleChange}
              placeholder="Square Hospital"
            />
            <Input
              name="chamberAddress"
              label="Chamber address"
              value={form.chamberAddress}
              onChange={handleChange}
              placeholder="House 10, Road 12, Dhanmondi"
            />
            <Input
              name="qualifications"
              label="Qualifications (comma separated)"
              value={form.qualifications}
              onChange={handleChange}
              placeholder="MBBS, FCPS"
            />
            <Input
              name="availableDays"
              label="Available days (comma separated full day names)"
              value={form.availableDays}
              onChange={handleChange}
              placeholder="Sunday, Tuesday, Thursday"
            />
            <Input
              name="availableSlots"
              label="Available slots (comma separated, e.g. 09:00-11:00, 18:00-20:00)"
              value={form.availableSlots}
              onChange={handleChange}
              placeholder="09:00-11:00, 18:00-20:00"
            />

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                placeholder="Introduce your background and consultation approach"
              />
            </label>

            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            {errorText ? <p className="text-sm text-rose-600">{errorText}</p> : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : mode === 'create' ? 'Create doctor profile' : 'Update doctor profile'}
            </Button>
          </form>
        </motion.section>
      </Container>
    </div>
  )
}

export default DoctorProfilePage
