import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { paymentService } from '../services/paymentService'
import { Container } from '../components/ui/Container'
import { SectionHeader } from '../components/ui/SectionHeader'
import { DataTable } from '../components/ui/DataTable'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge'
import { PaymentForm } from '../components/payments/PaymentForm'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import MainLayout from '../components/layout/MainLayout'

export default function PatientPaymentsPage() {
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [page, setPage] = useState(1)

  // Fetch payments
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['payments', 'patient', page],
    queryFn: () => paymentService.getMyPayments({ page, limit: 10 }),
  })

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    refetch()
  }

  const payments = paymentsData?.data?.data || []
  const pagination = paymentsData?.data?.pagination

  if (isLoading) {
    return (
      <MainLayout>
        <Container>
          <div className="space-y-4">
            <LoadingSkeleton count={5} />
          </div>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container>
        <SectionHeader
          title="My Payments"
          description="View and manage your appointment payments"
        />

        {/* Empty State */}
        {payments.length === 0 && !isLoading && (
          <EmptyState
            title="No Payments Yet"
            description="You haven't made any payments for your appointments."
            action={
              <Button variant="primary" onClick={() => setShowPaymentForm(true)}>
                Create Payment
              </Button>
            }
          />
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Create Payment</h3>
              <PaymentForm
                appointmentId={selectedPaymentId}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowPaymentForm(false)
                  setSelectedPaymentId(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Payments Table */}
        {payments.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Method
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
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ৳ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
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
      </Container>
    </MainLayout>
  )
}
