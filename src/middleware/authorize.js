const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');

// Map friendly names → internal ROLES constants
const ROLE_MAP = {
  'Super Admin': ROLES.SUPER_ADMIN,
  'Admin': ROLES.ADMIN,
  'Employee': ROLES.EMPLOYEE,
};

/**
 * Usage: authorize('Super Admin', 'Admin')
 * Also accepts raw role values like ROLES.SUPER_ADMIN
 */
const authorize = (...roles) => {
  const normalized = roles.map((r) => ROLE_MAP[r] || r);
  return (req, res, next) => {
    if (!normalized.includes(req.user?.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = authorize;
