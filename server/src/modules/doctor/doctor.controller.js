import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { doctorService } from './doctor.service.js'

export const getDoctors = asyncHandler(async (req, res) => {
  const query = req.validated?.query || req.query
  const result = await doctorService.getDoctors(query)

  res.status(200).json(new ApiResponse(200, 'Doctors fetched successfully', result))
})

export const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.validated?.params || req.params
  const doctorProfile = await doctorService.getDoctorById(id)

  res.status(200).json(new ApiResponse(200, 'Doctor fetched successfully', doctorProfile))
})

export const createDoctorProfile = asyncHandler(async (req, res) => {
  const payload = req.validated?.body || req.body
  const doctorProfile = await doctorService.createDoctorProfile(req.user._id, payload)

  res.status(201).json(new ApiResponse(201, 'Doctor profile created successfully', doctorProfile))
})

export const updateDoctorProfile = asyncHandler(async (req, res) => {
  const payload = req.validated?.body || req.body
  const doctorProfile = await doctorService.updateDoctorProfile(req.user._id, payload)

  res.status(200).json(new ApiResponse(200, 'Doctor profile updated successfully', doctorProfile))
})

export const verifyDoctorProfile = asyncHandler(async (req, res) => {
  const { id } = req.validated?.params || req.params
  const isVerified = req.validated?.body?.isVerified ?? true

  const doctorProfile = await doctorService.verifyDoctorProfile(id, isVerified)

  res.status(200).json(new ApiResponse(200, 'Doctor verification updated successfully', doctorProfile))
})
