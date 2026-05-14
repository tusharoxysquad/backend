const ApiError = require('../utils/apiError');

/**
 * Middleware factory — restricts access to specified roles
 * Usage: authorizeRoles('SUPER_ADMIN', 'ADMIN')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = authorizeRoles;
