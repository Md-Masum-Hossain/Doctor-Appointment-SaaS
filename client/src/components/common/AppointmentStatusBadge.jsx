import Badge from '../ui/Badge'

const statusStyles = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  accepted: 'border-sky-200 bg-sky-50 text-sky-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rescheduled: 'border-violet-200 bg-violet-50 text-violet-700',
}

const paymentStyles = {
  unpaid: 'border-slate-200 bg-slate-50 text-slate-700',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  refunded: 'border-rose-200 bg-rose-50 text-rose-700',
}

function AppointmentStatusBadge({ status, paymentStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className={statusStyles[status] || statusStyles.pending}>{status}</Badge>
      <Badge className={paymentStyles[paymentStatus] || paymentStyles.unpaid}>{paymentStatus}</Badge>
    </div>
  )
}

export default AppointmentStatusBadge
