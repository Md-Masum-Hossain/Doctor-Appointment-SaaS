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
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

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

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorText('Please upload a JPEG, PNG, or WebP image')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorText('Image size must be less than 5MB')
      return
    }

    setPhotoFile(file)
    setErrorText('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result || '')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorText('')
    setFieldErrors({})

    try {
      let submitPayload = payload

      // If photo file is selected, create FormData
      if (photoFile) {
        const formData = new FormData()
        // Add all form fields to FormData
        Object.entries(payload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value)
          }
        })
        // Add photo file
        formData.append('photo', photoFile)
        submitPayload = formData
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(submitPayload)
        setMessage('Doctor profile created successfully.')
      } else {
        await updateMutation.mutateAsync(submitPayload)
        setMessage('Doctor profile updated successfully.')
      }

      // Clear photo after successful submission
      setPhotoFile(null)
      setPhotoPreview('')
      setFieldErrors({})
    } catch (error) {
      const errors = error?.response?.data?.errors
      if (Array.isArray(errors)) {
        const map = errors.reduce((acc, err) => {
          const field = String(err.path || '').split('.').pop()
          if (field) acc[field] = err.message
          return acc
        }, {})
        setFieldErrors(map)
        setErrorText(error?.response?.data?.message || '')
      } else {
        setErrorText(error?.response?.data?.message || 'Profile operation failed.')
      }
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
            {/* Photo Upload Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Doctor Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary"
                />
                <p className="mt-1 text-xs text-slate-500">Accepted formats: JPEG, PNG, WebP (max 5MB)</p>
              </label>

              {photoPreview && (
                <div className="mt-3 h-40 w-full overflow-hidden rounded-lg bg-slate-200">
                  <img src={photoPreview} alt="Photo preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <Input
              name="specialization"
              label="Specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              placeholder="Cardiology"
            />
            {fieldErrors.specialization && <p className="mt-1 text-xs text-rose-600">{fieldErrors.specialization}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="experienceYears"
                label="Experience years"
                type="number"
                value={form.experienceYears}
                onChange={handleChange}
              />
              {fieldErrors.experienceYears && <p className="mt-1 text-xs text-rose-600">{fieldErrors.experienceYears}</p>}
              <Input
                name="consultationFee"
                label="Consultation fee"
                type="number"
                value={form.consultationFee}
                onChange={handleChange}
              />
              {fieldErrors.consultationFee && <p className="mt-1 text-xs text-rose-600">{fieldErrors.consultationFee}</p>}
            </div>

            <Input
              name="hospitalName"
              label="Hospital name"
              value={form.hospitalName}
              onChange={handleChange}
              placeholder="Square Hospital"
            />
            {fieldErrors.hospitalName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.hospitalName}</p>}
            <Input
              name="chamberAddress"
              label="Chamber address"
              value={form.chamberAddress}
              onChange={handleChange}
              placeholder="House 10, Road 12, Dhanmondi"
            />
            {fieldErrors.chamberAddress && <p className="mt-1 text-xs text-rose-600">{fieldErrors.chamberAddress}</p>}
            <Input
              name="qualifications"
              label="Qualifications (comma separated)"
              value={form.qualifications}
              onChange={handleChange}
              placeholder="MBBS, FCPS"
            />
            {fieldErrors.qualifications && <p className="mt-1 text-xs text-rose-600">{fieldErrors.qualifications}</p>}
            <Input
              name="availableDays"
              label="Available days (comma separated full day names)"
              value={form.availableDays}
              onChange={handleChange}
              placeholder="Sunday, Tuesday, Thursday"
            />
            {fieldErrors.availableDays && <p className="mt-1 text-xs text-rose-600">{fieldErrors.availableDays}</p>}
            <Input
              name="availableSlots"
              label="Available slots (comma separated, e.g. 09:00-11:00, 18:00-20:00)"
              value={form.availableSlots}
              onChange={handleChange}
              placeholder="09:00-11:00, 18:00-20:00"
            />
            {fieldErrors.availableSlots && <p className="mt-1 text-xs text-rose-600">{fieldErrors.availableSlots}</p>}

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
            {fieldErrors.bio && <p className="mt-1 text-xs text-rose-600">{fieldErrors.bio}</p>}

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
