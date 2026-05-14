const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { ROLES } = require('../constants');

const getProfile = asyncHandler(async (req, res) => {
  const includePassword = req.user.role === ROLES.SUPER_ADMIN;

  const query = User.findById(req.user._id)
    .populate('reportingAdmin', 'name email')
    .populate('createdBy', 'name email');

  if (includePassword) query.select('+password');

  const user = query.lean();
  const result = await user;

  sendSuccess(res, 'Profile fetched', result);
});

module.exports = { getProfile };
