import { Router } from 'express'
import { authorizeRoles, protect } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  cancelAppointment,
  createAppointment,
  getAdminAppointments,
  getDoctorAppointments,
  getMyAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
} from './appointment.controller.js'
import {
  appointmentIdParamSchema,
  appointmentListQuerySchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  updateStatusSchema,
} from './appointment.validation.js'

const appointmentRouter = Router()

appointmentRouter.post('/', protect, authorizeRoles('patient'), validateRequest(createAppointmentSchema), createAppointment)
appointmentRouter.get('/my', protect, authorizeRoles('patient'), validateRequest(appointmentListQuerySchema), getMyAppointments)
appointmentRouter.get('/doctor', protect, authorizeRoles('doctor'), validateRequest(appointmentListQuerySchema), getDoctorAppointments)
appointmentRouter.get('/admin', protect, authorizeRoles('admin'), validateRequest(appointmentListQuerySchema), getAdminAppointments)
appointmentRouter.patch('/:id/status', protect, authorizeRoles('doctor'), validateRequest(updateStatusSchema), updateAppointmentStatus)
appointmentRouter.patch('/:id/reschedule', protect, authorizeRoles('patient'), validateRequest(rescheduleAppointmentSchema), rescheduleAppointment)
appointmentRouter.delete('/:id/cancel', protect, authorizeRoles('patient', 'doctor'), validateRequest(cancelAppointmentSchema), cancelAppointment)

export default appointmentRouter
