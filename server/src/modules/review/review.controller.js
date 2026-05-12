import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { reviewService } from './review.service.js'

export const createReview = asyncHandler(async (req, res) => {
  const payload = req.validated.body
  const review = await reviewService.createReview(req.user._id, payload)

  res.status(201).json(new ApiResponse(201, 'Review submitted successfully', review))
})

export const getDoctorReviews = asyncHandler(async (req, res) => {
  const { doctorId } = req.validated.params
  const result = await reviewService.getDoctorReviews(doctorId, req.query)

  res.status(200).json(new ApiResponse(200, 'Doctor reviews fetched successfully', result))
})

export const getMyReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getMyReviews(req.user._id, req.query)

  res.status(200).json(new ApiResponse(200, 'Your reviews fetched successfully', result))
})

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.validated.params
  const review = await reviewService.deleteReview(id)

  res.status(200).json(new ApiResponse(200, 'Review deleted successfully', review))
})
