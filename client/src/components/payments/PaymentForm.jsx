import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { paymentService } from '../../services/paymentService'
import { appointmentService } from '../../services/appointmentService'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export const PaymentForm = ({ appointmentId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    transactionId: '',
    paymentProof: '',
    description: '',
  })
  const [error, setError] = useState(null)

  // Fetch appointment details
  const { data: appointmentData, isLoading: appointmentLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentService.getAppointmentById(appointmentId),
  })

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (payload) => paymentService.createPayment(payload),
    onSuccess: (data) => {
      setFormData({ transactionId: '', paymentProof: '', description: '' })
      setError(null)
      onSuccess?.(data)
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create payment')
    },
  })

  const appointment = appointmentData?.data

  if (appointmentLoading) {
    return <div className="p-4 text-center text-gray-600">Loading appointment details...</div>
  }

  if (!appointment) {
    return <div className="p-4 text-center text-red-600">Appointment not found</div>
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.transactionId.trim()) {
      setError('Transaction ID is required')
      return
    }

    createPaymentMutation.mutate({
      appointment: appointmentId,
      amount: appointment.doctor.fee,
      method: 'manual',
      transactionId: formData.transactionId,
      paymentProof: formData.paymentProof,
      description: formData.description,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Amount Display */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Amount to Pay:</span>
          <span className="text-2xl font-bold text-blue-600">৳ {appointment.doctor.fee}</span>
        </div>
      </div>

      {/* Transaction ID */}
      <div>
        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
          Transaction ID *
        </label>
        <Input
          id="transactionId"
          name="transactionId"
          type="text"
          placeholder="e.g., TXN-20240101-001"
          value={formData.transactionId}
          onChange={handleChange}
          disabled={createPaymentMutation.isPending}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the transaction ID from your payment method (bank transfer, mobile banking, etc.)
        </p>
      </div>

      {/* Payment Proof */}
      <div>
        <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Proof (optional)
        </label>
        <Input
          id="paymentProof"
          name="paymentProof"
          type="text"
          placeholder="URL to payment screenshot or receipt"
          value={formData.paymentProof}
          onChange={handleChange}
          disabled={createPaymentMutation.isPending}
        />
        <p className="text-xs text-gray-500 mt-1">
          Provide a link to your payment proof (screenshot, receipt, etc.)
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (optional)
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Any additional information about this payment"
          value={formData.description}
          onChange={handleChange}
          disabled={createPaymentMutation.isPending}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          isLoading={createPaymentMutation.isPending}
          disabled={createPaymentMutation.isPending}
          variant="primary"
          className="flex-1"
        >
          Submit Payment
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={createPaymentMutation.isPending}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
