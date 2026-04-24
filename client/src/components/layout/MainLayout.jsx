import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-primary">Doctor Appointment SaaS</h1>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Phase 1 Foundation
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
