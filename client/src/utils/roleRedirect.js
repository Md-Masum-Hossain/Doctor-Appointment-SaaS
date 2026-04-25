export const getDashboardPathByRole = (role) => {
  if (role === 'doctor') {
    return '/doctor/dashboard'
  }

  if (role === 'admin') {
    return '/admin/dashboard'
  }

  return '/patient/dashboard'
}
