import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const adminNavigation = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/doctors/verify', label: 'Doctor verification' },
  { to: '/admin/users', label: 'User management' },
  { to: '/admin/appointments', label: 'Appointments' },
  { to: '/admin/reviews', label: 'Reviews' },
]

function AdminReviewsPage() {
  return (
    <DashboardLayout
      title="Review Moderation"
      subtitle="Placeholder workspace for future review moderation controls."
      navigation={adminNavigation}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Phase 8</Badge>
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">Placeholder</Badge>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-text">Review moderation is ready for the next pass.</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            The delete endpoint is available for inappropriate reviews. This page is a lightweight placeholder so the admin
            workspace has a dedicated entry point for future filters, reports, and moderation queues.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/admin/dashboard">
              <Button>Back to dashboard</Button>
            </Link>
            <Link to="/doctors">
              <Button variant="ghost">Browse doctors</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-text">Moderation queue</h3>
            <p className="mt-2 text-sm text-slate-600">Coming next: flagged reviews and report handling.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-text">Deletion workflow</h3>
            <p className="mt-2 text-sm text-slate-600">Admin delete support is already exposed through the review API.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-text">Analytics</h3>
            <p className="mt-2 text-sm text-slate-600">Rating trends and moderation insights can be layered in later.</p>
          </article>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default AdminReviewsPage
