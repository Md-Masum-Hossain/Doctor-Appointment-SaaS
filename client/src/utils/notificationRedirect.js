const getResourceId = (notification) => {
  const rawResourceId = notification?.relatedResource?.resourceId

  if (!rawResourceId) {
    return ''
  }

  if (typeof rawResourceId === 'string') {
    return rawResourceId
  }

  return rawResourceId?._id || ''
}

const appendQuery = (path, params) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `${path}?${queryString}` : path
}

const getAppointmentsPathByRole = (role) => {
  if (role === 'doctor') {
    return '/doctor/appointments'
  }

  if (role === 'admin') {
    return '/admin/appointments'
  }

  return '/patient/appointments'
}

export const getNotificationTargetPath = (notification, role) => {
  const resourceType = notification?.relatedResource?.resourceType
  const resourceId = getResourceId(notification)
  const notificationId = notification?._id

  if (resourceType === 'appointment') {
    return appendQuery(getAppointmentsPathByRole(role), {
      notificationId,
      appointmentId: resourceId,
    })
  }

  if (resourceType === 'payment') {
    const paymentsPath = role === 'admin' ? '/admin/payments' : '/patient/payments'
    return appendQuery(paymentsPath, {
      notificationId,
      paymentId: resourceId,
    })
  }

  if (resourceType === 'doctor') {
    if (role === 'doctor') {
      return appendQuery('/doctor/profile', { notificationId, doctorId: resourceId })
    }

    return appendQuery('/doctors', { notificationId, doctorId: resourceId })
  }

  if (resourceType === 'review') {
    const reviewsPath = role === 'admin' ? '/admin/reviews' : '/patient/reviews'
    return appendQuery(reviewsPath, {
      notificationId,
      reviewId: resourceId,
    })
  }

  if (notification?.type === 'doctor-verified' && role === 'doctor') {
    return appendQuery('/doctor/profile', { notificationId })
  }

  return appendQuery('/notifications', { notificationId })
}
