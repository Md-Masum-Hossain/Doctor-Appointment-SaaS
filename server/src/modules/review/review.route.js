import { Router } from 'express'
import { authorizeRoles, protect } from '../../middlewares/auth.middleware.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  createReview,
  deleteReview,
  getDoctorReviews,
  getMyReviews,
} from './review.controller.js'
import {
  createReviewSchema,
  doctorReviewsParamSchema,
  myReviewsQuerySchema,
  reviewIdParamSchema,
} from './review.validation.js'

const reviewRouter = Router()

reviewRouter.get('/doctor/:doctorId', validateRequest(doctorReviewsParamSchema), getDoctorReviews)
reviewRouter.get('/my', protect, authorizeRoles('patient'), validateRequest(myReviewsQuerySchema), getMyReviews)
reviewRouter.post('/', protect, authorizeRoles('patient'), validateRequest(createReviewSchema), createReview)
reviewRouter.delete('/:id', protect, authorizeRoles('admin'), validateRequest(reviewIdParamSchema), deleteReview)

export default reviewRouter
