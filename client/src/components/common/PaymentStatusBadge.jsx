const paymentStatusConfig = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-400',
  },
  verified: {
    label: 'Verified',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-400',
  },
  paid: {
    label: 'Paid',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-400',
  },
  failed: {
    label: 'Failed',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-400',
  },
  refunded: {
    label: 'Refunded',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-400',
  },
  unpaid: {
    label: 'Unpaid',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
  },
}

export const PaymentStatusBadge = ({ status, className = '' }) => {
  const config = paymentStatusConfig[status] || paymentStatusConfig.pending

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
        border ${config.borderColor} ${config.bgColor} ${config.textColor}
        text-sm font-medium ${className}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
      <span>{config.label}</span>
    </div>
  )
}
