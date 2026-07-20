// User Roles
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
};

// Attendance Statuses
const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  LATE: 'LATE',
};

// Approval Statuses
const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Leave Types
const LEAVE_TYPE = {
  EARNED: 'EARNED',
  CASUAL: 'CASUAL',
  SICK: 'SICK',
  COMP_OFF: 'COMP_OFF',
};

// Leave Session
const LEAVE_SESSION = {
  FULL_DAY: 'FULL_DAY',
  HALF_DAY: 'HALF_DAY',
};

// Leave Statuses
const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

// Shift duration in hours
const SHIFT_HOURS = 9;

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Role-specific login URLs sent in welcome/OTP emails.
// Hardcoded to the production domain so links are always correct even if
// CLIENT_URL is missing/stale on the host; override per-env via the *_LOGIN_URL vars.
const stripTrailingSlash = (url) => url.replace(/\/+$/, '');
const APP_URLS = {
  ADMIN_LOGIN: process.env.ADMIN_LOGIN_URL || 'https://attendance.oxysquad.com/admin/login',
  EMPLOYEE_LOGIN: process.env.EMPLOYEE_LOGIN_URL || 'https://attendance.oxysquad.com/employee/login',
  LOGIN: process.env.CLIENT_URL
    ? `${stripTrailingSlash(process.env.CLIENT_URL)}/login`
    : 'https://attendance.oxysquad.com/login',
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  APPROVAL_STATUS,
  LEAVE_TYPE,
  LEAVE_SESSION,
  LEAVE_STATUS,
  SHIFT_HOURS,
  PAGINATION,
  APP_URLS,
};
