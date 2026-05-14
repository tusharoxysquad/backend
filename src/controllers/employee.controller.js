const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  sendSuccess(res, 'Profile fetched', user);
});

const updateProfile = asyncHandler(async (req, res) => {
  // Employees can only update name, department, designation
  const allowed = ['name', 'department', 'designation'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await userService.updateUser(req.user._id, updates);
  sendSuccess(res, 'Profile updated successfully', user);
});

module.exports = { getProfile, updateProfile };
