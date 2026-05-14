const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyJWT = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw ApiError.unauthorized('No token provided');

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated');

  req.user = user;
  next();
});

module.exports = verifyJWT;
