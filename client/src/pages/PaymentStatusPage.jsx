import { Link, useSearchParams } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'

const statusConfig = {
  success: {
    eyebrow: 'Payment complete',
    title: 'Your appointment is confirmed',
    tone: 'emerald',
    buttonLabel: 'View appointments',
    buttonTo: '/patient/appointments',
  },
  failed: {
    eyebrow: 'Payment failed',
    title: 'We could not complete the payment',
    tone: 'rose',
    buttonLabel: 'Try again later',
    buttonTo: '/doctors',
  },
  cancelled: {
    eyebrow: 'Payment cancelled',
    title: 'The payment was cancelled safely',
    tone: 'amber',
    buttonLabel: 'Back to appointments',
    buttonTo: '/patient/appointments',
  },
}

function PaymentStatusPage({ status }) {
  const [searchParams] = useSearchParams()
  const config = statusConfig[status] || statusConfig.failed
  const message = searchParams.get('message') || 'Please review your appointment list for the latest payment status.'

  const toneClasses = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  return (
    <MainLayout>
      <div className="py-16">
        <Container>
          <div className={`mx-auto max-w-2xl rounded-3xl border px-6 py-10 text-center shadow-sm ${toneClasses[config.tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">{config.eyebrow}</p>
            <h1 className="mt-4 text-3xl font-bold text-text">{config.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">{message}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={config.buttonTo}>
                <Button>{config.buttonLabel}</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost">Go home</Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  )
}

export default PaymentStatusPage