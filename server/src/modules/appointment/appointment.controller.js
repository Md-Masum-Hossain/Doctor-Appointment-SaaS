import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { appointmentService } from './appointment.service.js'

export const createAppointment = asyncHandler(async (req, res) => {
  const payload = req.validated.body
  const appointment = await appointmentService.createAppointment(req.user._id, payload)

  res.status(201).json(new ApiResponse(201, 'Appointment created successfully', appointment))
})

export const getMyAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getMyAppointments(req.user._id, req.query)
  res.status(200).json(new ApiResponse(200, 'Appointments fetched successfully', result))
})

export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getDoctorAppointments(req.user._id, req.query)
  res.status(200).json(new ApiResponse(200, 'Doctor appointments fetched successfully', result))
})

export const getAdminAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAdminAppointments(req.query)
  res.status(200).json(new ApiResponse(200, 'All appointments fetched successfully', result))
})

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const appointment = await appointmentService.updateAppointmentStatus(id, req.user._id, req.user.role, req.validated.body)

  res.status(200).json(new ApiResponse(200, 'Appointment status updated successfully', appointment))
})

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const appointment = await appointmentService.rescheduleAppointment(id, req.user._id, req.validated.body)

  res.status(200).json(new ApiResponse(200, 'Appointment rescheduled successfully', appointment))
})

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const appointment = await appointmentService.cancelAppointment(id, req.user._id, req.user.role)

  res.status(200).json(new ApiResponse(200, 'Appointment cancelled successfully', appointment))
})
