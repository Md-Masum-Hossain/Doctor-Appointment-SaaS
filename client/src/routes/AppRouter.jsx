import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import RoleBasedRoute from '../components/common/RoleBasedRoute'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import DoctorsPage from '../pages/DoctorsPage'
import DoctorDetailsPage from '../pages/DoctorDetailsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import PatientDashboardPage from '../pages/PatientDashboardPage'
import DoctorDashboardPage from '../pages/DoctorDashboardPage'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import DoctorProfilePage from '../pages/DoctorProfilePage'
import AdminDoctorVerificationPage from '../pages/AdminDoctorVerificationPage'
import PatientAppointmentsPage from '../pages/PatientAppointmentsPage'
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage'
import AdminAppointmentsPage from '../pages/AdminAppointmentsPage'
import useAuthStore from '../store/authStore'
import { getDashboardPathByRole } from '../utils/roleRedirect'

function DashboardEntryRedirect() {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDashboardPathByRole(user.role)} replace />
}

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardEntryRedirect />} />

          <Route element={<RoleBasedRoute allowedRoles={['patient']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/doctors/verify" element={<AdminDoctorVerificationPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
