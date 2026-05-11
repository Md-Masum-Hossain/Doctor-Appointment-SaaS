import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { paymentService } from '../services/paymentService'
import { Container } from '../components/ui/Container'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import DashboardLayout from '../components/layout/DashboardLayout'

const PaymentVerificationModal = ({ payment, onClose, onSuccess }) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [action, setAction] = useState(null) // 'verify' or 'reject'

  const verifyMutation = useMutation({
    mutationFn: () => paymentService.verifyPayment(payment._id),
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => paymentService.rejectPayment(payment._id, rejectionReason),
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const handleVerify = () => {
    verifyMutation.mutate()
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    rejectMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h3 className="text-xl font-semibold mb-4">Payment Verification</h3>

        {/* Payment Details */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-lg font-semibold text-gray-900">৳ {payment.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <code className="bg-white px-2 py-1 rounded text-xs">{payment.transactionId}</code>
            </div>
            <div>
              <p className="text-sm text-gray-600">Method</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{payment.method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient</p>
              <p className="text-sm font-medium text-gray-900">
                {payment.patient?.firstName} {payment.patient?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient Email</p>
              <p className="text-sm text-gray-700">{payment.patient?.email}</p>
            </div>
          </div>

          {payment.description && (
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-sm text-gray-900">{payment.description}</p>
            </div>
          )}
        </div>

        {/* Action Section */}
        {action === null && (
          <div className="space-y-3">
            <p className="text-gray-700 mb-4">
              Please review this payment and take an action:
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setAction('verify')}
                variant="primary"
                className="flex-1"
              >
                Verify Payment
              </Button>
              <Button
                onClick={() => setAction('reject')}
                variant="danger"
                className="flex-1"
              >
                Reject Payment
              </Button>
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}

        {/* Verify Confirmation */}
        {action === 'verify' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Are you sure you want to verify this payment?
              </p>
              <p className="text-sm text-green-700 mt-1">
                This will update the appointment payment status to "Paid"
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleVerify}
                variant="primary"
                isLoading={verifyMutation.isPending}
                disabled={verifyMutation.isPending}
                className="flex-1"
              >
                Confirm Verification
              </Button>
              <Button
                onClick={() => setAction(null)}
                variant="secondary"
                disabled={verifyMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reject Confirmation */}
        {action === 'reject' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                Are you sure you want to reject this payment?
              </p>
              <p className="text-sm text-red-700 mt-1">
                The patient will be notified and can resubmit the payment
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this payment is being rejected..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                variant="danger"
                isLoading={rejectMutation.isPending}
                disabled={rejectMutation.isPending}
                className="flex-1"
              >
                Confirm Rejection
              </Button>
              <Button
                onClick={() => setAction(null)}
                variant="secondary"
                disabled={rejectMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('pending')

  // Fetch payments
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['payments', 'admin', page, statusFilter],
    queryFn: () =>
      paymentService.getAdminPayments({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
  })

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: () => paymentService.getPaymentStats(),
  })

  const payments = paymentsData?.data?.data || []
  const pagination = paymentsData?.data?.pagination
  const stats = statsData?.data || {}

  if (isLoading) {
    return (
      <DashboardLayout>
        <Container>
          <div className="space-y-4">
            <LoadingSkeleton count={5} />
          </div>
        </Container>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Container>
        <SectionHeader
          title="Payment Management"
          description="Review and verify patient payments for appointments"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending', value: stats.pending?.count || 0, color: 'yellow' },
            { label: 'Verified', value: stats.verified?.count || 0, color: 'green' },
            { label: 'Failed', value: stats.failed?.count || 0, color: 'red' },
            { label: 'Refunded', value: stats.refunded?.count || 0, color: 'blue' },
          ].map((stat) => {
            const colorClasses = {
              yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', num: 'text-yellow-900' },
              green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', num: 'text-green-900' },
              red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', num: 'text-red-900' },
              blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', num: 'text-blue-900' },
            }
            const colors = colorClasses[stat.color]

            return (
              <div
                key={stat.label}
                className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}
              >
                <p className={`text-sm ${colors.text}`}>{stat.label}</p>
                <p className={`text-2xl font-bold ${colors.num}`}>{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {['pending', 'verified', 'failed', 'refunded', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status)
                setPage(1)
              }}
              className={`px-4 py-2 font-medium transition capitalize ${
                statusFilter === status
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {payments.length === 0 && !isLoading && (
          <EmptyState
            title="No Payments"
            description={`No ${statusFilter === 'all' ? 'payments' : statusFilter + ' payments'} found`}
          />
        )}

        {/* Payments Table */}
        {payments.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.patient?.firstName} {payment.patient?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{payment.patient?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ৳ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {payment.transactionId}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.status === 'pending' && (
                          <Button
                            onClick={() => setSelectedPayment(payment)}
                            variant="primary"
                            size="sm"
                          >
                            Review
                          </Button>
                        )}
                        {payment.status === 'verified' && (
                          <span className="text-green-600 font-medium">Verified</span>
                        )}
                        {payment.status === 'failed' && (
                          <span className="text-red-600 font-medium">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Verification Modal */}
        {selectedPayment && (
          <PaymentVerificationModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
            onSuccess={() => refetch()}
          />
        )}
      </Container>
    </DashboardLayout>
  )
}
