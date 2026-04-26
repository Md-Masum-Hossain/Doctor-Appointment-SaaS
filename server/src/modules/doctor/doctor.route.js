import { Router } from 'express'
import { protect, authorizeRoles } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  createDoctorProfile,
  getDoctorById,
  getDoctors,
  updateDoctorProfile,
  verifyDoctorProfile,
} from './doctor.controller.js'
import {
  createDoctorProfileSchema,
  doctorIdParamSchema,
  getDoctorsQuerySchema,
  updateDoctorProfileSchema,
  verifyDoctorSchema,
} from './doctor.validation.js'

const doctorRouter = Router()

doctorRouter.get('/', validateRequest(getDoctorsQuerySchema), getDoctors)
doctorRouter.get('/:id', validateRequest(doctorIdParamSchema), getDoctorById)

doctorRouter.post(
  '/profile',
  protect,
  authorizeRoles('doctor'),
  validateRequest(createDoctorProfileSchema),
  createDoctorProfile,
)

doctorRouter.patch(
  '/profile',
  protect,
  authorizeRoles('doctor'),
  validateRequest(updateDoctorProfileSchema),
  updateDoctorProfile,
)

doctorRouter.patch(
  '/:id/verify',
  protect,
  authorizeRoles('admin'),
  validateRequest(verifyDoctorSchema),
  verifyDoctorProfile,
)

export default doctorRouter
