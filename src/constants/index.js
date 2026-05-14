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

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  APPROVAL_STATUS,
  LEAVE_TYPE,
  LEAVE_SESSION,
  LEAVE_STATUS,
  SHIFT_HOURS,
  PAGINATION,
};
