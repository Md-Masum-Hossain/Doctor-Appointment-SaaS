import { ApiResponse } from '../../utils/ApiResponse.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { userService } from './user.service.js'

export const getAllUsers = asyncHandler(async (req, res) => {
  const query = req.validated?.query || req.query
  const result = await userService.getAllUsers(query)

  res.status(200).json(new ApiResponse(200, 'Users fetched successfully', result))
})

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.validated?.params || req.params
  const user = await userService.getUserById(id)

  res.status(200).json(new ApiResponse(200, 'User fetched successfully', user))
})

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.validated?.params || req.params
  
  await userService.deleteUser(id)

  res.status(200).json(new ApiResponse(200, 'User deleted successfully'))
})

export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.validated?.params || req.params
  const { isBlocked } = req.validated?.body || req.body

  const user = await userService.blockUser(id, isBlocked)

  res.status(200).json(new ApiResponse(200, 'User block status updated successfully', user))
})
